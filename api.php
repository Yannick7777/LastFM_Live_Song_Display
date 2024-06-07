<?php
require 'vendor/autoload.php';
$query = $_GET["query"];
$type = $_GET["type"];
$user = $_GET["user"];
$env = parse_ini_file('.env', false, INI_SCANNER_TYPED);

$webRequestContext = stream_context_create(array('http' => array('ignore_errors' => true)));

header('Expires: Sun, 01 Jan 2014 00:00:00 GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', FALSE);
header('Pragma: no-cache');
header('Content-type: application/json');
switch ($type) {
    case "spotify":
        $api = new SpotifyWebAPI\SpotifyWebAPI();
        $session = new SpotifyWebAPI\Session(
            $env["SPOTIFY_CLIENT_ID"],
            $env["SPOTIFY_CLIENT_SECRET"]
        );
        $session->requestCredentialsToken();
        $token = $session->getAccessToken();
        $api->setAccessToken($token);
        echo(json_encode($api->search($query, "track", array("limit" => 1))));
        break;
    case "lastfm":
        if ($env["LAST_FM_USER_API_RESTRICTION"]) {
            $hideUser = true;
            $user = $env["LAST_FM_USER"];
        }
        if (!is_null($user)){
            $LAST_FM_API_KEY = $env["LAST_FM_KEY"];
            $lastFMContent = file_get_contents("https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=$user&api_key=$LAST_FM_API_KEY&limit=1&format=json", false, $webRequestContext);
            preg_match("/HTTP\\/\\d+\\.\\d+\\s+(\\d+)/", $http_response_header[0], $statusCodeArray);
            $statusCode = end($statusCodeArray);
            if ($hideUser && $statusCode == 200) {
                $lastFMContentJSON = json_decode($lastFMContent, true);
                $lastFMContentJSON["recenttracks"]["@attr"]["user"] = "hidden";
                $lastFMContent = json_encode($lastFMContentJSON);
            }
            http_response_code($statusCode);
            echo($lastFMContent);
        } else {
            http_response_code(422);
            echo(json_encode(array("error" => "no lastfm user defined")));
        }
        exit;
    case "getUser":
        if ($env["LAST_FM_USER_API_RESTRICTION"]) {
            $user = "hidden";
        } else {
            $user =  $env['LAST_FM_USER'];
        }
        echo(json_encode(array("user" => $user, "restrictedAPI" => $env['LAST_FM_USER_API_RESTRICTION'])));
        exit;
    default:
        http_response_code(423);
        echo(json_encode(array("error" => "not a valid type")));
        exit;
}