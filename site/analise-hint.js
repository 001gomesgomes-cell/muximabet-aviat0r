/* Muxima Bet — deixa o Sistema de Análise sempre evidente.
   Brilho permanente e suave à volta do painel (reposicionado enquanto ele muda)
   + um balão a apontar para ele em cada carregamento da página. Não bloqueia o ecrã. */
(function () {
  var css = [
    '#mx-ah-ring{position:fixed;z-index:9998;pointer-events:none;border:2px solid #F5C000;border-radius:14px;box-shadow:0 0 0 4px rgba(245,192,0,.16),0 0 26px rgba(245,192,0,.35);animation:mxAhPulse 1.6s ease-in-out infinite;transition:top .35s,left .35s,width .35s,height .35s;opacity:0}',
    '@keyframes mxAhPulse{0%,100%{box-shadow:0 0 0 3px rgba(245,192,0,.14),0 0 20px rgba(245,192,0,.28)}50%{box-shadow:0 0 0 7px rgba(245,192,0,.4),0 0 38px rgba(245,192,0,.5)}}',
    '#mx-ah-tip{position:fixed;z-index:9999;max-width:230px;background:linear-gradient(180deg,#171717,#0D0D0D);border:1px solid rgba(245,192,0,.5);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.7),0 0 30px rgba(245,192,0,.12);padding:11px 13px 12px;font-family:Montserrat,Inter,system-ui,sans-serif;opacity:0;transform:translateY(6px);transition:opacity .35s,transform .35s}',
    '#mx-ah-tip.mx-show{opacity:1;transform:none}',
    '#mx-ah-tip .mx-ah-tag{font-size:9px;font-weight:800;letter-spacing:.14em;color:#F5C000;margin-bottom:4px}',
    '#mx-ah-tip b{display:block;font-size:12.5px;font-weight:900;color:#fff;margin-bottom:3px}',
    '#mx-ah-tip b span{color:#F5C000}',
    '#mx-ah-tip p{margin:0;font-size:11px;line-height:1.5;color:rgba(255,255,255,.68)}',
    '#mx-ah-tip .mx-ah-x{position:absolute;top:6px;right:8px;cursor:pointer;color:rgba(255,255,255,.4);font-size:14px;font-weight:900;line-height:1}',
    '#mx-ah-tip .mx-ah-x:hover{color:#fff}',
    '#mx-ah-tip .mx-ah-ok{margin-top:10px;width:100%;border:0;cursor:pointer;border-radius:9px;padding:8px 10px;font-family:inherit;font-size:11px;font-weight:900;letter-spacing:.04em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);box-shadow:0 4px 16px rgba(245,192,0,.3)}',
    '#mx-ah-tip .mx-ah-ok:active{transform:scale(.97)}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

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

  var ring = null, tip = null, tipVisible = false;

  function ensureRing() {
    if (ring && document.body.contains(ring)) return;
    ring = document.createElement('div');
    ring.id = 'mx-ah-ring';
    document.body.appendChild(ring);
  }

  function positionRing(panel) {
    var r = panel.getBoundingClientRect();
    var pad = 6;
    ring.style.top = (r.top - pad) + 'px';
    ring.style.left = (r.left - pad) + 'px';
    ring.style.width = (r.width + pad * 2) + 'px';
    ring.style.height = (r.height + pad * 2) + 'px';
    ring.style.opacity = '1';
  }

  function positionTip(panel) {
    if (!tip) return;
    var r = panel.getBoundingClientRect();
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var tTop = r.top - th - 12;
    if (tTop < 10) tTop = Math.min(r.bottom + 12, window.innerHeight - th - 10);
    var tLeft = Math.max(10, Math.min(r.left, window.innerWidth - tw - 10));
    tip.style.top = Math.max(10, tTop) + 'px';
    tip.style.left = tLeft + 'px';
  }

  function showBalloon(panel) {
    if (tip) return;
    tip = document.createElement('div');
    tip.id = 'mx-ah-tip';
    tip.innerHTML =
      '<span class="mx-ah-x" role="button" aria-label="Fechar">&times;</span>' +
      '<div class="mx-ah-tag">👆 AQUI</div>' +
      '<b>Sistema de <span>Análise</span> ativo</b>' +
      '<p>Este painel lê as rodadas e mostra o sinal antes de cada jogada. Fica de olho nele.</p>' +
      '<button class="mx-ah-ok" type="button">ENTENDI</button>';
    document.body.appendChild(tip);
    tipVisible = true;
    positionTip(panel);
    requestAnimationFrame(function () { tip.classList.add('mx-show'); });
    setTimeout(function () { positionTip(panel); }, 350);

    function dismiss() {
      if (!tip) return;
      tip.classList.remove('mx-show');
      var t = tip; tip = null; tipVisible = false;
      setTimeout(function () { if (t) t.remove(); }, 400);
    }
    tip.querySelector('.mx-ah-x').addEventListener('click', dismiss);
    tip.querySelector('.mx-ah-ok').addEventListener('click', dismiss);
    // fica visível até o lead clicar em ENTENDI (ou ×) — não desaparece sozinho
  }

  var balloonShown = false;

  function loop() {
    var panel = findPanel();
    if (!panel) return;
    ensureRing();
    positionRing(panel);
    if (tipVisible) positionTip(panel);
    if (!balloonShown) { balloonShown = true; showBalloon(panel); }
  }

  function init() {
    // espera o painel montar, depois mantém o brilho sempre e mostra o balão uma vez por carregamento
    var tries = 0;
    var wait = setInterval(function () {
      tries++;
      if (findPanel()) { clearInterval(wait); loop(); }
      else if (tries > 60) { clearInterval(wait); }
    }, 400);
    // brilho sempre reposicionado enquanto o painel muda de tamanho/estado
    setInterval(loop, 600);
    window.addEventListener('scroll', loop, true);
    window.addEventListener('resize', loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
