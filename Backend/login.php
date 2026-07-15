<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json"); // Agregado para consistencia

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$data = json_decode(file_get_contents("php://input"), true);
$correo = $data['correo'] ?? '';
$contrasena = $data['contrasena'] ?? '';

$conn = new mysqli("localhost", "root", "", "sandwatch_db");

$stmt = $conn->prepare("SELECT contrasena FROM padres WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($contrasena, $row['contrasena'])) {
        echo json_encode(["status" => "success", "mensaje" => "Login exitoso"]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "mensaje" => "Contraseña incorrecta"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["status" => "error", "mensaje" => "Usuario no encontrado"]);
}
?>