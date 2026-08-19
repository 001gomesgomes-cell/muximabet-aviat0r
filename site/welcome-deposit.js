/* Muxima Bet — intro para visitantes novos.
   Ao abrir o site pela primeira vez, centra o Sistema de Análise no ecrã com
   fundo semi-escuro e a pre-sell. Ao clicar "ENTENDI" o painel desaparece e
   o site fica normal. Só aparece uma vez (flag em localStorage). */
(function () {
  var INTRO_SEEN = "mx_intro_seen";

  function findPanel() {
    var els = document.querySelectorAll('span,div,button');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '').trim();
      if (t.length < 40 && /sistema de an[aá]lise|an[aá]lise on/i.test(t)) {
        var n = els[i];
        while (n && n !== document.body) {
          if (getComputedStyle(n).position === 'fixed') return n;
          n = n.parentElement;
        }
        return els[i];
      }
    }
    return null;
  }

  /* ---------- estilos ---------- */
  var css = [
    '#mx-intro-ov{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.65);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:16px;opacity:0;transition:opacity .4s;font-family:Montserrat,Inter,system-ui,sans-serif}',
    '#mx-intro-ov.on{opacity:1}',
    '#mx-intro-panel{z-index:100001;display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:14px}',
    '#mx-intro-panel .ip-btn{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:1px solid rgba(16,185,129,.6);background:linear-gradient(90deg,rgba(16,185,129,.3),rgba(20,78,68,.4));backdrop-filter:blur(16px);box-shadow:0 4px 12px rgba(16,185,129,.2);cursor:default}',
    '#mx-intro-panel .ip-btn span{font-size:10px;font-weight:700;color:#34d399}',
    '#mx-intro-panel .ip-body{width:176px;backdrop-filter:blur(16px);border-radius:8px;border:1px solid rgba(16,185,129,.5);box-shadow:0 10px 25px rgba(0,0,0,.5);overflow:hidden;background:linear-gradient(90deg,rgba(16,185,129,.2),rgba(20,78,68,.3))}',
    '#mx-intro-panel .ip-header{display:flex;align-items:center;gap:6px;padding:4px 10px;border-bottom:1px solid rgba(16,185,129,.3);background:rgba(16,185,129,.1)}',
    '#mx-intro-panel .ip-header span{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#34d399}',
    '#mx-intro-panel .ip-header .ip-dot{margin-left:auto;width:6px;height:6px;border-radius:50%;background:#34d399;animation:mxIpPulse 1.5s infinite}',
    '@keyframes mxIpPulse{0%,100%{opacity:1}50%{opacity:.4}}',
    '#mx-intro-panel .ip-content{padding:8px 10px;display:flex;align-items:center;gap:8px}',
    '#mx-intro-panel .ip-info{flex:1}',
    '#mx-intro-panel .ip-status{font-size:9px;font-weight:600;color:#34d399}',
    '#mx-intro-panel .ip-multi{font-size:18px;font-weight:900;color:#f97316;line-height:1.1}',
    '#mx-intro-panel .ip-safe{font-size:8px;color:rgba(52,211,153,.7);margin-top:2px}',
    '#mx-intro-card{z-index:100001;width:90%;max-width:300px;background:linear-gradient(180deg,#171717,#0D0D0D);border:1px solid rgba(245,192,0,.5);border-radius:14px;box-shadow:0 14px 44px rgba(0,0,0,.7),0 0 30px rgba(245,192,0,.12);padding:14px 16px 16px;text-align:left;opacity:0;transition:opacity .35s .15s}',
    '#mx-intro-ov.on #mx-intro-card{opacity:1}',
    '#mx-intro-card .mx-intro-tag{font-size:9px;font-weight:800;letter-spacing:.14em;color:#F5C000;margin-bottom:5px}',
    '#mx-intro-card b{display:block;font-size:13px;font-weight:900;color:#fff;margin-bottom:4px}',
    '#mx-intro-card b span{color:#F5C000}',
    '#mx-intro-card p{margin:0 0 12px;font-size:11.5px;line-height:1.55;color:rgba(255,255,255,.68)}',
    '#mx-intro-card .mx-intro-ok{width:100%;border:0;cursor:pointer;border-radius:10px;padding:11px 14px;font-family:inherit;font-size:12px;font-weight:900;letter-spacing:.05em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);box-shadow:0 6px 20px rgba(245,192,0,.35);transition:transform .15s}',
    '#mx-intro-card .mx-intro-ok:active{transform:scale(.97)}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function showIntro() {
    var panel = findPanel();
    if (!panel || document.getElementById('mx-intro-ov')) return;

    window.mx_intro_active = true;

    var ov = document.createElement('div');
    ov.id = 'mx-intro-ov';

    var SVG_POWER = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#34d399"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg>';
    var SVG_SHIELD = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#34d399"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>';
    var SVG_WARN = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#34d399"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

    var fakePanel = document.createElement('div');
    fakePanel.id = 'mx-intro-panel';
    fakePanel.innerHTML =
      '<div class="ip-btn">' + SVG_POWER + '<span>ANÁLISE ON</span>' + SVG_SHIELD + '</div>' +
      '<div class="ip-body">' +
        '<div class="ip-header">' + SVG_SHIELD + '<span>Sistema de Análise</span><div class="ip-dot"></div></div>' +
        '<div class="ip-content">' + SVG_WARN +
          '<div class="ip-info">' +
            '<div class="ip-status">✓ Padrão encontrado!</div>' +
            '<div class="ip-multi">123.12x</div>' +
            '<div class="ip-safe">Aposta segura!</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    ov.appendChild(fakePanel);

    var card = document.createElement('div');
    card.id = 'mx-intro-card';
    card.innerHTML =
      '<div class="mx-intro-tag">👆 AQUI</div>' +
      '<b>Sistema de <span>Análise</span> ativo</b>' +
      '<p>Este painel lê as rodadas e mostra o sinal antes de cada jogada. Fica de olho nele.</p>' +
      '<button class="mx-intro-ok" type="button">ENTENDI</button>';
    ov.appendChild(card);
    document.body.appendChild(ov);

    panel.style.opacity = '0';

    requestAnimationFrame(function () { ov.classList.add('on'); });

    function dismiss() {
      panel.style.opacity = '';
      ov.classList.remove('on');
      window.mx_intro_active = false;
      try { localStorage.setItem(INTRO_SEEN, '1'); } catch (e) {}
      setTimeout(function () { ov.remove(); }, 450);
    }

    card.querySelector('.mx-intro-ok').addEventListener('click', dismiss);
  }

  /* ---------- deteção (primeira visita ao site) ---------- */
  function alreadySeen() {
    try { return !!localStorage.getItem(INTRO_SEEN); } catch (e) { return true; }
  }

  if (!alreadySeen()) {
    var tries = 0;
    var wait = setInterval(function () {
      tries++;
      if (document.getElementById('mx-intro-ov')) { clearInterval(wait); return; }
      if (findPanel()) { clearInterval(wait); showIntro(); }
      else if (tries > 30) { clearInterval(wait); }
    }, 500);
  }
})();
