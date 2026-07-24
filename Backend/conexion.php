<?php
$conn = new mysqli("localhost", "root", "", "sandwatch_db");
if ($conn->connect_error) {
    die(json_encode(["error" => "Error de conexión"]));
}
?>