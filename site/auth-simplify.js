/* Muxima Bet — simplifica registo/login: o lead não digita password.
   O app autentica no Supabase com um email sintético derivado do telefone
   (Ev(phone)) + password. Aqui escondemos os campos de password e preenchemo-los
   automaticamente com uma password fixa, para que registo e login funcionem sempre
   (o identificador vem do telefone; a password é a mesma para todos).
   - Registo: o lead digita Nome, Telefone, Email. (sem password)
   - Login: o lead digita apenas o Telefone. (sem password)

   Usa-se uma password FIXA (não derivada do telefone) de propósito: assim é
   definida uma única vez e o guard impede novas escritas — não interfere com o
   estado controlado do campo de telefone durante a digitação. */
(function () {
  var FIXED_PW = 'MuximaBet@2024';

  // define o valor de um input controlado por React de forma que o React "veja"
  function setReactValue(input, value) {
    try {
      var desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      desc.set.call(input, value);
    } catch (e) { input.value = value; }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function process(dlg) {
    var pws = dlg.querySelectorAll('input[type="password"]');
    if (!pws.length) return;
    for (var i = 0; i < pws.length; i++) {
      var pw = pws[i];
      // esconde o campo de password
      if (pw.style.display !== 'none') {
        pw.style.display = 'none';
        pw.setAttribute('aria-hidden', 'true');
        pw.tabIndex = -1;
      }
      // preenche uma única vez (o guard evita reescritas que interfeririam na digitação)
      if (pw.value !== FIXED_PW) setReactValue(pw, FIXED_PW);
    }
  }

  setInterval(function () {
    var dlgs = document.querySelectorAll('[role="dialog"]');
    for (var i = 0; i < dlgs.length; i++) {
      if (dlgs[i].querySelector('input[type="password"]')) process(dlgs[i]);
    }
  }, 350);
})();
