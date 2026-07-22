<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$accion = $data['accion'] ?? '';

if ($accion === 'registro') {
    $nombre = $data['nombre'];
    $correo = $data['correo'];
    $pass = password_hash($data['contrasena'], PASSWORD_BCRYPT);
    
    $stmt = $conn->prepare("INSERT INTO padres (nombre, correo, contrasena) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nombre, $correo, $pass);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["error" => "No se pudo registrar"]);
    }
}
?>