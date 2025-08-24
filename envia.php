<?php
include("conexao.php");

// Pegando dados do formulário
$cpf   = $_POST['cpf']   ?? '';
$nome  = $_POST['nome']  ?? '';
$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';
$idade = $_POST['idade'] ?? '';

// Protege contra SQL Injection
$cpf   = mysqli_real_escape_string($conn, $cpf);
$nome  = mysqli_real_escape_string($conn, $nome);
$email = mysqli_real_escape_string($conn, $email);
$senha = mysqli_real_escape_string($conn, $senha);
$idade = mysqli_real_escape_string($conn, $idade);

// Verifica se CPF já existe
$sql = "SELECT cpf FROM cadastro WHERE cpf = '$cpf'";
$retorno = mysqli_query($conn, $sql);

if (mysqli_num_rows($retorno) > 0) {   
    echo "CPF JÁ CADASTRADO!! <br>";
} else {
    $sql = "INSERT INTO cadastro (nome,email,idade,cpf,senha) 
            VALUES ('$nome','$email','$idade','$cpf','$senha')";
    $resultado = mysqli_query($conn, $sql);

    if ($resultado) {
        echo ">> USUÁRIO CADASTRADO COM SUCESSO! <br>";
    } else {
        echo "Erro ao cadastrar: " . mysqli_error($conn);
    }
}
?>
