document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Aqui você pode validar email e senha contra o backend ou localStorage
    // Para teste, vamos aceitar qualquer login
    if(email && password){
        // Redirecionar para a página Home
        window.location.href = "home.html";
    } else {
        alert("Por favor, preencha todos os campos corretamente.");
    }
});
