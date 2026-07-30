/* Muxima Bet — bónus de boas-vindas (1000 Kz).
   Quando um lead com conta ainda não resgatou o bónus, mostra um popup a dizer
   que ganhou 1000 Kz, com um botão "RESGATAR BÓNUS". Ao clicar, credita o bónus
   no servidor (RPC claim_welcome_bonus, idempotente) e atualiza o saldo. */
(function () {
  var SUPA_URL = "https://kypohaagiozofdoadvgu.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cG9oYWFnaW96b2Zkb2Fkdmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzgxMDYsImV4cCI6MjEwMDE1NDEwNn0.OZbRfkN880v02YocGfIicc99PTlfe1x6wOAqdswLpTU";
  var JUST_REGISTERED = "mx_just_registered";

  // arma o popup apenas quando o lead SUBMETE o registo (INSCREVER-SE no modal);
  // um login (ENTRAR) limpa a flag, para o popup não aparecer em logins seguintes.
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('button[type="submit"]') : null;
    if (!btn || !btn.closest('[role="dialog"]')) return;
    var t = (btn.textContent || '').trim().toUpperCase();
    try {
      if (t === 'INSCREVER-SE') sessionStorage.setItem(JUST_REGISTERED, '1');
      else if (t === 'ENTRAR') sessionStorage.removeItem(JUST_REGISTERED);
    } catch (err) {}
  }, true);

  function accessToken() {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("kypohaagiozofdoadvgu") !== -1 && k.indexOf("auth-token") !== -1) {
        try { return JSON.parse(localStorage.getItem(k)).access_token; } catch (e) {}
      }
    }
    return null;
  }

  function fetchProfile(token) {
    return fetch(SUPA_URL + "/rest/v1/profiles?select=welcome_bonus_claimed,balance", {
      headers: { apikey: ANON, Authorization: "Bearer " + token },
    }).then(function (r) { return r.json(); })
      .then(function (j) { return Array.isArray(j) && j[0] ? j[0] : null; })
      .catch(function () { return null; });
  }

  function claim(token) {
    return fetch(SUPA_URL + "/rest/v1/rpc/claim_welcome_bonus", {
      method: "POST",
      headers: { apikey: ANON, Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: "{}",
    }).then(function (r) { return r.json(); }).catch(function () { return null; });
  }

  function refreshBalance() {
    try { window.dispatchEvent(new Event("mx-refresh-balance")); } catch (e) {}
    setTimeout(function () { try { window.dispatchEvent(new Event("mx-refresh-balance")); } catch (e) {} }, 1500);
  }

  /* ---------- estilos ---------- */
  var css = [
    '#mx-wb-ov{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .35s;font-family:Montserrat,Inter,system-ui,sans-serif}',
    '#mx-wb-ov.on{opacity:1}',
    '#mx-wb{position:relative;width:100%;max-width:380px;text-align:center;background:linear-gradient(180deg,#1a1a1a,#0D0D0D);border:1px solid rgba(245,192,0,.55);border-radius:20px;box-shadow:0 0 70px rgba(245,192,0,.22),0 24px 70px rgba(0,0,0,.8);padding:26px 24px 24px;transform:translateY(14px) scale(.96);transition:transform .35s}',
    '#mx-wb-ov.on #mx-wb{transform:none}',
    '#mx-wb .mx-wb-x{position:absolute;top:12px;right:14px;cursor:pointer;color:rgba(255,255,255,.4);font-size:18px;font-weight:900;line-height:1;background:none;border:0}',
    '#mx-wb .mx-wb-x:hover{color:#fff}',
    '#mx-wb .mx-wb-emoji{font-size:52px;line-height:1;margin-bottom:6px;filter:drop-shadow(0 6px 18px rgba(245,192,0,.5))}',
    '#mx-wb .mx-wb-badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.16em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);border-radius:999px;padding:4px 14px;margin-bottom:12px}',
    '#mx-wb h2{font-size:20px;font-weight:900;color:#fff;margin:0 0 4px;letter-spacing:.02em}',
    '#mx-wb .mx-wb-amt{font-size:40px;font-weight:900;color:#F5C000;margin:6px 0 2px;text-shadow:0 0 26px rgba(245,192,0,.5)}',
    '#mx-wb .mx-wb-sub{font-size:12.5px;color:rgba(255,255,255,.65);line-height:1.5;margin:0 0 18px}',
    '#mx-wb .mx-wb-cta{width:100%;border:0;cursor:pointer;border-radius:13px;padding:15px 16px;font-family:inherit;font-size:14px;font-weight:900;letter-spacing:.05em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);box-shadow:0 8px 28px rgba(245,192,0,.4);transition:transform .15s,box-shadow .15s}',
    '#mx-wb .mx-wb-cta:hover{transform:translateY(-1px);box-shadow:0 12px 34px rgba(245,192,0,.5)}',
    '#mx-wb .mx-wb-cta:disabled{opacity:.7;cursor:default;transform:none}',
    '#mx-wb .mx-wb-note{margin:11px 0 0;font-size:10.5px;color:rgba(255,255,255,.4)}',
    '#mx-wb .mx-wb-ok{color:#22c55e;font-weight:800}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function showPopup(token) {
    if (document.getElementById('mx-wb-ov')) return;
    var ov = document.createElement('div');
    ov.id = 'mx-wb-ov';
    ov.innerHTML =
      '<div id="mx-wb" role="dialog" aria-modal="true">' +
        '<button class="mx-wb-x" aria-label="Fechar">&times;</button>' +
        '<div class="mx-wb-emoji">🎁</div>' +
        '<span class="mx-wb-badge">PARABÉNS!</span>' +
        '<h2>Ganhaste um bónus</h2>' +
        '<div class="mx-wb-amt">1 000 Kz</div>' +
        '<p class="mx-wb-sub">Bónus de boas-vindas por criares a tua conta.<br>Resgata agora e começa já a jogar!</p>' +
        '<button class="mx-wb-cta" id="mx-wb-claim">RESGATAR BÓNUS</button>' +
        '<p class="mx-wb-note">O bónus é creditado no teu saldo na hora.</p>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('on'); });

    function close() {
      ov.classList.remove('on');
      setTimeout(function () { ov.remove(); }, 350);
    }
    ov.querySelector('.mx-wb-x').addEventListener('click', close);

    var btn = ov.querySelector('#mx-wb-claim');
    btn.addEventListener('click', function () {
      btn.disabled = true;
      btn.textContent = 'A resgatar...';
      claim(token).then(function (res) {
        if (res && (res.status === 'credited' || res.status === 'already_claimed')) {
          refreshBalance();
          var card = ov.querySelector('#mx-wb');
          card.innerHTML =
            '<div class="mx-wb-emoji">✅</div>' +
            '<span class="mx-wb-badge">BÓNUS RESGATADO</span>' +
            '<h2><span class="mx-wb-ok">+1 000 Kz</span> no teu saldo</h2>' +
            '<p class="mx-wb-sub">Já podes usar o teu bónus para jogar. Boa sorte! 🚀</p>' +
            '<button class="mx-wb-cta" id="mx-wb-done">COMEÇAR A JOGAR</button>';
          card.querySelector('#mx-wb-done').addEventListener('click', close);
          setTimeout(function () { refreshBalance(); }, 800);
        } else {
          btn.disabled = false;
          btn.textContent = 'RESGATAR BÓNUS';
          var note = ov.querySelector('.mx-wb-note');
          if (note) { note.textContent = 'Ocorreu um erro. Tenta novamente.'; note.style.color = '#f87171'; }
        }
      });
    });
  }

  /* ---------- deteção (só imediatamente após o registo) ---------- */
  setInterval(function () {
    if (document.getElementById('mx-wb-ov')) return;
    var justReg;
    try { justReg = sessionStorage.getItem(JUST_REGISTERED); } catch (e) {}
    if (!justReg) return;               // só aparece se o lead acabou de se registar
    var token = accessToken();
    if (!token) return;                 // ainda a concluir o registo/login
    fetchProfile(token).then(function (p) {
      if (p && p.welcome_bonus_claimed === false) {
        try { sessionStorage.removeItem(JUST_REGISTERED); } catch (e) {}
        showPopup(token);
      }
    });
  }, 1200);
})();
