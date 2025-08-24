<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>recebe dados</title>
</head>
<body>
    <?php
    $conexao = mysqli_connect("localhost","root","Neu.1970","teste");
    //checar conexao
    
    if(!$conexao){
        echo "Não conectado";
    }
    echo "Conectado ao banco>>>>>>>>>>>>>>>";
    
    //recuperar e verificar já existe
    
    $cpf = $_POST['cpf'];
    $cpf = mysqli_real_escape_string($conexao, $cpf);
    $sql = "SELECT cpf FROM teste.cadastro WHERE cpf = '$cpf'";
    
    $retorno = mysqli_query($conexao,$sql);
    
    if(mysqli_num_rows($retorno) > 0){   
    
        echo "CPF JÁ CADASTRADO!! <br>";
    
    }else{
        $cpf   = $_POST['cpf'];   
        $nome  = $_POST['nome'];  
        $email = $_POST['email'];
        $senha = $_POST['senha']; 
        $idade = $_POST['idade']; 
        $sql = "INSERT INTO teste.cadastro(nome,email,idade,cpf,senha) values ('$nome','$email','$idade','$cpf','$senha')";
    
        $resultado = mysqli_query($conexao, $sql);
        echo ">>USUARIO CADASTRADO COM SUCESSO! <BR>";
    }
    ?>
</body>
</html>
