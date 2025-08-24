<?php
$servername = "localhost";   
$username   = "root";        
$password   = "Neu.1970";           
$dbname     = "teste";      

// Criar conexão
$conn = new mysqli("localhost","root","Neu.1970","teste");

// Checar conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}
?>