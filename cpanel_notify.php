<?php
// cpanel_notify.php
// Server-side example for cPanel: POST to your Node `/notify` endpoint using a shared secret.

$apiUrl = 'https://coastcapitalsecurity.up.railway.app/notify';

// Store your secret in cPanel environment or a config file outside webroot and fetch it here
$sharedSecret = getenv('API_SHARED_SECRET') ?: 'REPLACE_WITH_YOUR_SECRET';

$payload = [
    'type' => 'admin_panel_alive',
    'message' => "Admin panel reported alive from {$_SERVER['SERVER_NAME']}",
    'data' => [
        'server' => $_SERVER['SERVER_NAME'],
        'time' => date('c')
    ]
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $sharedSecret // or use 'x-api-key: ' . $sharedSecret
]);

$response = curl_exec($ch);
$err = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($err) {
    error_log('Notify request error: ' . $err);
    http_response_code(500);
    echo 'Request failed';
    exit;
}

if ($httpCode >= 400) {
    error_log('Upstream returned HTTP ' . $httpCode . ': ' . $response);
    http_response_code($httpCode);
    echo 'Upstream error';
    exit;
}

header('Content-Type: application/json');
echo $response;

// Usage: call this script from your admin login flow (server-side) or trigger via cron to validate connectivity.
?>
