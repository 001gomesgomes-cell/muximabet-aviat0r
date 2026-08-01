/* Muxima Bet — aviso pós-registo.
   Assim que o lead cria a conta, mostra um popup a dar as boas-vindas e a
   convidá-lo a fazer o primeiro depósito para começar a jogar com o Sistema
   de Análise. Botão "FAZER DEPÓSITO" abre o modal de depósito. Sem bónus. */
(function () {
  var JUST_REGISTERED = "mx_just_registered";

  function loggedIn() {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("kypohaagiozofdoadvgu") !== -1 && k.indexOf("auth-token") !== -1) {
        try { return !!JSON.parse(localStorage.getItem(k)).access_token; } catch (e) {}
      }
    }
    return false;
  }

  // arma o popup apenas quando o lead SUBMETE o registo (INSCREVER-SE no modal);
  // um login (ENTRAR) limpa a flag, para o aviso não aparecer em logins seguintes.
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('button[type="submit"]') : null;
    if (!btn || !btn.closest('[role="dialog"]')) return;
    var t = (btn.textContent || '').trim().toUpperCase();
    try {
      if (t === 'INSCREVER-SE') sessionStorage.setItem(JUST_REGISTERED, '1');
      else if (t === 'ENTRAR') sessionStorage.removeItem(JUST_REGISTERED);
    } catch (err) {}
  }, true);

  function openDeposit() {
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].textContent || '').trim().toUpperCase() === 'DEPOSITAR') { btns[i].click(); return true; }
    }
    return false;
  }

  /* ---------- estilos ---------- */
  var css = [
    '#mx-wd-ov{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .35s;font-family:Montserrat,Inter,system-ui,sans-serif}',
    '#mx-wd-ov.on{opacity:1}',
    '#mx-wd{position:relative;width:100%;max-width:390px;text-align:center;background:linear-gradient(180deg,#1a1a1a,#0D0D0D);border:1px solid rgba(245,192,0,.55);border-radius:20px;box-shadow:0 0 70px rgba(245,192,0,.2),0 24px 70px rgba(0,0,0,.8);padding:26px 24px 24px;transform:translateY(14px) scale(.96);transition:transform .35s}',
    '#mx-wd-ov.on #mx-wd{transform:none}',
    '#mx-wd .mx-wd-x{position:absolute;top:12px;right:14px;cursor:pointer;color:rgba(255,255,255,.4);font-size:18px;font-weight:900;line-height:1;background:none;border:0}',
    '#mx-wd .mx-wd-x:hover{color:#fff}',
    '#mx-wd .mx-wd-emoji{font-size:50px;line-height:1;margin-bottom:8px;filter:drop-shadow(0 6px 18px rgba(245,192,0,.45))}',
    '#mx-wd .mx-wd-badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.14em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);border-radius:999px;padding:4px 14px;margin-bottom:12px}',
    '#mx-wd h2{font-size:20px;font-weight:900;color:#fff;margin:0 0 8px;letter-spacing:.02em}',
    '#mx-wd h2 span{color:#F5C000}',
    '#mx-wd .mx-wd-sub{font-size:13px;color:rgba(255,255,255,.7);line-height:1.6;margin:0 0 18px}',
    '#mx-wd .mx-wd-sub b{color:#F5C000;font-weight:800}',
    '#mx-wd .mx-wd-cta{width:100%;border:0;cursor:pointer;border-radius:13px;padding:15px 16px;font-family:inherit;font-size:14px;font-weight:900;letter-spacing:.05em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);box-shadow:0 8px 28px rgba(245,192,0,.4);transition:transform .15s,box-shadow .15s}',
    '#mx-wd .mx-wd-cta:hover{transform:translateY(-1px);box-shadow:0 12px 34px rgba(245,192,0,.5)}',
    '#mx-wd .mx-wd-note{margin:11px 0 0;font-size:10.5px;color:rgba(255,255,255,.4)}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function showPopup() {
    if (document.getElementById('mx-wd-ov')) return;
    var ov = document.createElement('div');
    ov.id = 'mx-wd-ov';
    ov.innerHTML =
      '<div id="mx-wd" role="dialog" aria-modal="true">' +
        '<button class="mx-wd-x" aria-label="Fechar">&times;</button>' +
        '<div class="mx-wd-emoji">🚀</div>' +
        '<span class="mx-wd-badge">CONTA CRIADA</span>' +
        '<h2>Bem-vindo à <span>Muxima Bet</span>!</h2>' +
        '<p class="mx-wd-sub">Para começares a jogar com o <b>Sistema de Análise</b>, faz o teu primeiro <b>depósito</b>. Depois é só seguir os sinais e fazer cashout antes do valor previsto.</p>' +
        '<button class="mx-wd-cta" id="mx-wd-dep">FAZER DEPÓSITO</button>' +
        '<p class="mx-wd-note">Depósito 100% seguro · o bónus entra na hora.</p>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('on'); });

    function close() {
      ov.classList.remove('on');
      setTimeout(function () { ov.remove(); }, 350);
    }
    ov.querySelector('.mx-wd-x').addEventListener('click', close);
    ov.querySelector('#mx-wd-dep').addEventListener('click', function () {
      close();
      setTimeout(openDeposit, 380);
    });
  }

  /* ---------- deteção (só imediatamente após o registo) ---------- */
  setInterval(function () {
    if (document.getElementById('mx-wd-ov')) return;
    var justReg;
    try { justReg = sessionStorage.getItem(JUST_REGISTERED); } catch (e) {}
    if (!justReg) return;
    if (!loggedIn()) return; // ainda a concluir o registo
    try { sessionStorage.removeItem(JUST_REGISTERED); } catch (e) {}
    showPopup();
  }, 1200);
})();
