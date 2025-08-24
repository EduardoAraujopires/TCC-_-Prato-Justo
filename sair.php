<?php
session_start();
session_destroy();
header("Location: pagina de login.html");
?>