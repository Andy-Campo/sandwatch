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

// ==========================================
// VALIDACIÓN DE LA CONTRASEÑA EN EL BACKEND
// ==========================================
// Ejemplo de reglas: Mínimo 8 caracteres, al menos una letra y un número.
$longitudMinima = 8;

if (strlen($pass) < $longitudMinima) {
    echo json_encode([
        "status" => "error", 
        "message" => "La contraseña debe tener al menos " . $longitudMinima . " caracteres."
    ]);
    exit;
}

if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/', $pass)) {
    echo json_encode([
        "status" => "error", 
        "message" => "La contraseña debe contener al menos una letra y un número."
    ]);
    exit;
}

// ==========================================

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