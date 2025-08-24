(function () {
  const form = document.getElementById('form-cadastro');
  const ano = document.getElementById('ano');
  if (ano) {
    ano.textContent = String(new Date().getFullYear());
  }

  if (!form) return;

  const inputNome = document.getElementById('nome');
  const inputEmail = document.getElementById('email');
  const inputSenha = document.getElementById('senha');
  const inputConfirmar = document.getElementById('confirmar');
  const inputTermos = document.getElementById('termos');

  const erroNome = document.getElementById('erro-nome');
  const erroEmail = document.getElementById('erro-email');
  const erroSenha = document.getElementById('erro-senha');
  const erroConfirmar = document.getElementById('erro-confirmar');
  const erroTermos = document.getElementById('erro-termos');

  function setError(element, errorContainer, message) {
    if (!errorContainer) return;
    errorContainer.textContent = message || '';
    if (message) {
      element?.setAttribute('aria-invalid', 'true');
    } else {
      element?.removeAttribute('aria-invalid');
    }
  }

  function validarNome(valor) {
    if (!valor || valor.trim().length < 3) return 'Informe seu nome (mínimo 3 caracteres).';
    return '';
  }

  function validarEmail(valor) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!valor || !regex.test(valor)) return 'Informe um e-mail válido.';
    return '';
  }

  function validarSenha(valor) {
    if (!valor || valor.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
    if (!/[0-9]/.test(valor)) return 'A senha deve conter ao menos 1 número.';
    return '';
  }

  function validarConfirmacao(senha, confirmacao) {
    if (!confirmacao) return 'Confirme sua senha.';
    if (senha !== confirmacao) return 'As senhas não coincidem.';
    return '';
  }

  function validarTermos(marcado) {
    if (!marcado) return 'Você precisa aceitar os termos de uso.';
    return '';
  }

  function validarCampoNome() {
    const mensagem = validarNome(inputNome?.value || '');
    setError(inputNome, erroNome, mensagem);
    return !mensagem;
  }

  function validarCampoEmail() {
    const mensagem = validarEmail(inputEmail?.value || '');
    setError(inputEmail, erroEmail, mensagem);
    return !mensagem;
  }

  function validarCampoSenha() {
    const mensagem = validarSenha(inputSenha?.value || '');
    setError(inputSenha, erroSenha, mensagem);
    return !mensagem;
  }

  function validarCampoConfirmar() {
    const mensagem = validarConfirmacao(inputSenha?.value || '', inputConfirmar?.value || '');
    setError(inputConfirmar, erroConfirmar, mensagem);
    return !mensagem;
  }

  function validarCampoTermos() {
    const mensagem = validarTermos(!!(inputTermos && inputTermos.checked));
    setError(inputTermos, erroTermos, mensagem);
    return !mensagem;
  }

  inputNome?.addEventListener('blur', validarCampoNome);
  inputEmail?.addEventListener('blur', validarCampoEmail);
  inputSenha?.addEventListener('blur', validarCampoSenha);
  inputConfirmar?.addEventListener('blur', validarCampoConfirmar);
  inputTermos?.addEventListener('change', validarCampoTermos);

  form.addEventListener('submit', function (evt) {
    evt.preventDefault();
    const ok = [
      validarCampoNome(),
      validarCampoEmail(),
      validarCampoSenha(),
      validarCampoConfirmar(),
      validarCampoTermos(),
    ].every(Boolean);

    if (!ok) {
      const primeiroErro = document.querySelector('[aria-invalid="true"], #erro-termos:not(:empty)');
      if (primeiroErro && 'focus' in primeiroErro) {
        primeiroErro.focus?.();
      }
      return;
    }

    const dados = {
      nome: inputNome?.value.trim(),
      email: inputEmail?.value.trim(),
    };

    alert('Cadastro realizado com sucesso!');
    console.log('Dados do cadastro', dados);
    form.reset();
  });
})(); 