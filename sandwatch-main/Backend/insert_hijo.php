// Ejemplo de cómo recibir los datos en tu PHP
$nombre = $data['nombre'];
$edad = $data['edad'];
$colegio = $data['colegio'];
$grado = $data['grado'];
$avatar = $data['avatar'];
$padre_id = $data['padre_id']; // ID del padre logueado

$stmt = $conn->prepare("INSERT INTO hijos (nombre, edad, colegio, grado, avatar, padre_id) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sisssi", $nombre, $edad, $colegio, $grado, $avatar, $padre_id);
$stmt->execute();