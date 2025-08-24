<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>pagina login</title>
</head>
<body>
    <?php

// Conexão com o banco
$conn = new mysqli("localhost", "root","Neu.1970","teste");

// Verifica conexão
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

// Pega dados do formulário
$email = $_POST['email'];
$senha = $_POST['senha'];

// Consulta usuário
$sql = "SELECT * FROM  teste.cadastro WHERE email = ? AND senha = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $senha);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Usuário existe → login OK
    session_start();
    $_SESSION['email'] = $email;
    header("Location: testelogin.php"); // página protegida
    exit();
} else {
    // Usuário não encontrado → manda para cadastro
    header("Location: index.html");
    exit();
}

$stmt->close();
$conn->close();

?>

</body>
</html>