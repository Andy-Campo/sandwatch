<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$data = json_decode(file_get_contents("php://input"), true);

// Recibimos los datos del formulario
$nombre = $data['nombre'] ?? '';
$padre_id = $data['padre_id'] ?? 0; // ID del padre logueado
$edad = $data['edad'] ?? 0;
$colegio = $data['colegio'] ?? '';
$grado = $data['grado'] ?? '';
$avatar = $data['avatar'] ?? '';

$conn = new mysqli("localhost", "root", "", "sandwatch_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error de conexión"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO hijos (nombre, padre_id, edad, colegio, grado, avatar) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("siisss", $nombre, $padre_id, $edad, $colegio, $grado, $avatar);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Hijo registrado exitosamente"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al guardar: " . $stmt->error]);
}
$conn->close();
?>