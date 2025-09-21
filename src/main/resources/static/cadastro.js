document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-cadastro");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Campos
        const nome = document.getElementById("nome");
        const email = document.getElementById("email");
        const senha = document.getElementById("senha");
        const confirmar = document.getElementById("confirmar");
        const termos = document.getElementById("termos");

        // Erros
        const erroNome = document.getElementById("erro-nome");
        const erroEmail = document.getElementById("erro-email");
        const erroSenha = document.getElementById("erro-senha");
        const erroConfirmar = document.getElementById("erro-confirmar");
        const erroTermos = document.getElementById("erro-termos");

        // Resetando erros
        erroNome.textContent = "";
        erroEmail.textContent = "";
        erroSenha.textContent = "";
        erroConfirmar.textContent = "";
        erroTermos.textContent = "";

        let temErro = false;

        // Validações
        if (!nome.value.trim()) {
            erroNome.textContent = "Digite seu nome.";
            temErro = true;
        }

        if (!email.value.trim() || !email.value.includes("@")) {
            erroEmail.textContent = "Digite um e-mail válido.";
            temErro = true;
        }

        if (!senha.value || senha.value.length < 8) {
            erroSenha.textContent = "A senha deve ter pelo menos 8 caracteres.";
            temErro = true;
        }

        if (confirmar.value !== senha.value) {
            erroConfirmar.textContent = "As senhas não coincidem.";
            temErro = true;
        }

        if (!termos.checked) {
            erroTermos.textContent = "Você deve aceitar os termos.";
            temErro = true;
        }

        if (temErro) return;

        // Preparar os dados
        const cadastroData = {
            username: nome.value.trim(),
            email: email.value.trim(),
            password: senha.value
        };

        try {
            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cadastroData)
            });

            if (response.ok) {
                const user = await response.json();
                alert("Cadastro realizado com sucesso para " + user.username + "!");
                window.location.href = "home.html"; // Redireciona para pagina home
            } else {
                const msg = await response.text();
                alert("Erro ao cadastrar: " + msg);
            }

        } catch (error) {
            console.error("Erro ao enviar cadastro:", error);
            alert("Erro ao conectar com o servidor.");
        }
    });

    // Atualiza o ano no rodapé
    document.getElementById("ano").textContent = new Date().getFullYear();
});