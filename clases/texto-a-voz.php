<?php
// header('Content-type: audio/mpeg');
// header('Content-length: ' . filesize($respuesta->audioContent));
// header('Content-Disposition: filename="hablando'.date('ymdhis').'.mp3"');
// header('X-Pad: avoid browser bug');
// header('Cache-Control: no-cache');
// header('Content-Type: application/json; charset=utf-8');
//$data_string = '{ "input": { "text": "'.$_GET['texto'].'" }, "voice": { "languageCode": "es-419", "name": "es-ES-Standard-A", "ssmlGender": "FEMALE" }, "audioConfig": { "audioEncoding": "MP3" } }';
$voces = [
    "es-ES-Standard-A", "es-ES-Standard-B", "es-ES-Standard-C", "es-ES-Standard-D",
    "es-ES-Neural2-A", "es-ES-Neural2-B", "es-ES-Neural2-C", "es-ES-Neural2-D", "es-ES-Neural2-E", "es-ES-Neural2-F",
    "es-ES-Polyglot-1", "es-ES-Wavenet-B", "es-ES-Wavenet-C", "es-ES-Wavenet-D"
];
$idVoz = (random_int(0, count($voces)));
if (isset($_POST['texto'])) {
    $textoHablar = $_POST['texto'];
} elseif (isset($_GET['texto'])) {
    $textoHablar = $_GET['texto']; 
} else {
    $textoHablar = "No hay texto";
}
$data_string = '{ "audioConfig": { "audioEncoding": "LINEAR16", "effectsProfileId": [ "wearable-class-device" ], "pitch": "-0.40", "speakingRate": "1.08" }, "input": { "text": "' . $textoHablar . '" }, "voice": { "languageCode": "es-ES", "name": "' . $voces[$idVoz] . '" } }';
$ch = curl_init();
//curl_setopt($ch, CURLOPT_URL,"https://texttospeech.googleapis.com/v1beta1/text:synthesize?fields=audioContent&key=AIzaSyCRwQEhgwaUw7fSancdh0FShk4RyYbCZcc&alt=json");
curl_setopt($ch, CURLOPT_URL, "https://texttospeech.googleapis.com/v1beta1/text:synthesize?fields=audioContent&key=AIzaSyCRwQEhgwaUw7fSancdh0FShk4RyYbCZcc&alt=json");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data_string))
);
$server_output = curl_exec($ch);
//print_r($server_output);
curl_close($ch);
$respuesta = json_decode($server_output);
//file_put_contents('audio.mp3', base64_decode($respuesta->audioContent));
echo json_encode(
  array(
      //'id' => $_POST['persona'],
      'audio' => ('data:audio/mpeg;base64,' . ($respuesta->audioContent) . ''
      )
  )
);
// echo '<audio id="sonidoEspanola" type="audio/mpeg" src="data:audio/mpeg;base64,'.($respuesta->audioContent).'"  autoplay controls ></audio>';
// echo '<script type="text/javascript" >';
// echo 'sonidoEspanola.load();';
// echo 'setTimeout( function(){ sonidoEspanola.play(); }, 5000 );';
// echo '</script>';
// echo '<script type="text/javascript" >';
// echo 'document.getElementById("sonidoEspanola").play(); ';
// echo '</script>';
?>