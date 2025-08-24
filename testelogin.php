<?php
session_start();

// Se o usuário não estiver logado, volta para login
if (!isset($_SESSION['email'])) {
    header("Location: pagina de login.html");
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Bem-vindo</title>
    <style>
        body{
            font-family: Arial, sans-serif;
            background: linear-gradient(45deg, #4B0082, #B22222);
            color: white;
            text-align: center;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
        }
        .box{
            background: rgba(0,0,0,0.7);
            padding: 50px;
            border-radius: 15px;
            box-shadow: 0px 8px 20px rgba(0,0,0,0.5);
        }
        h1{
            color: #0b69d4;
        }
        a{
            color: #ffcc00;
            text-decoration: none;
            font-weight: bold;
        }
        a:hover{
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>Bem-vindo, <?php echo $_SESSION['email']; ?>!</h1>
        <p>Você fez login com sucesso.</p>
        <p><a href="sair.php">Sair</a></p>
    </div>
</body>
</html>