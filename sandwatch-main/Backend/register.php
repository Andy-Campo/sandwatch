<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$data = json_decode(file_get_contents("php://input"), true);
$nombre = $data['nombre'] ?? '';
$correo = $data['correo'] ?? '';
$pass = $data['contrasena'] ?? '';

$conn = new mysqli("localhost", "root", "", "sandwatch_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error de conexión"]);
    exit;
}

$hash = password_hash($pass, PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO padres (nombre, correo, contrasena) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $nombre, $correo, $hash);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Registro exitoso"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al guardar"]);
}
$conn->close();
?>