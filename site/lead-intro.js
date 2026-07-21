/* Muxima Bet — apresentação do Sistema de Análise + pré-venda guiada para novos visitantes */
(function () {
  var KEY = 'muxima_analise_intro_v1';

  var css = [
    '#mx-intro-overlay,#mx-tour-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .35s ease;font-family:Montserrat,Inter,system-ui,sans-serif}',
    '#mx-intro-overlay.mx-show,#mx-tour-overlay.mx-show{opacity:1}',
    '#mx-tour-overlay{background:rgba(0,0,0,.55);align-items:flex-end;pointer-events:none}',
    '#mx-intro-card{width:100%;max-width:420px;background:linear-gradient(180deg,#151515,#0D0D0D);border:1px solid rgba(245,192,0,.45);border-radius:18px;box-shadow:0 0 60px rgba(245,192,0,.15),0 20px 60px rgba(0,0,0,.7);overflow:hidden;transform:translateY(14px) scale(.97);transition:transform .35s ease}',
    '#mx-intro-overlay.mx-show #mx-intro-card{transform:translateY(0) scale(1)}',
    '#mx-intro-card .mx-head{padding:20px 22px 14px;text-align:center;border-bottom:1px solid rgba(245,192,0,.15);background:radial-gradient(120% 100% at 50% 0%,rgba(245,192,0,.10),transparent 70%)}',
    '#mx-intro-card .mx-head img{height:52px;margin:0 auto 10px;display:block}',
    '.mx-badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.14em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);border-radius:999px;padding:4px 12px;margin-bottom:8px}',
    '#mx-intro-card h2{font-size:20px;font-weight:900;color:#fff;letter-spacing:.02em;margin:0}',
    '#mx-intro-card h2 span{color:#F5C000}',
    '#mx-intro-card .mx-sub{font-size:12px;color:rgba(255,255,255,.65);margin-top:6px;line-height:1.5}',
    '#mx-intro-card .mx-steps{padding:16px 22px 6px}',
    '#mx-intro-card .mx-step{display:flex;gap:12px;align-items:flex-start;padding:10px 0}',
    '#mx-intro-card .mx-step+.mx-step{border-top:1px dashed rgba(255,255,255,.08)}',
    '.mx-num{flex:none;width:28px;height:28px;border-radius:50%;background:rgba(245,192,0,.12);border:1px solid rgba(245,192,0,.5);color:#F5C000;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center}',
    '#mx-intro-card .mx-step b{display:block;font-size:13px;color:#fff;font-weight:800}',
    '#mx-intro-card .mx-step p{margin:3px 0 0;font-size:11.5px;line-height:1.55;color:rgba(255,255,255,.6)}',
    '.mx-x{color:#F5C000;font-weight:800}',
    '#mx-intro-card .mx-foot{padding:14px 22px 20px}',
    '.mx-cta{width:100%;border:0;cursor:pointer;border-radius:12px;padding:13px 16px;font-family:inherit;font-size:13px;font-weight:900;letter-spacing:.06em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);box-shadow:0 6px 24px rgba(245,192,0,.35);transition:transform .15s ease,box-shadow .15s ease}',
    '.mx-cta:hover{transform:translateY(-1px);box-shadow:0 10px 30px rgba(245,192,0,.45)}',
    '.mx-note{margin:10px 0 0;text-align:center;font-size:10px;color:rgba(255,255,255,.4)}',
    '.mx-spotlight{animation:mxPulse 1.1s ease-in-out infinite;border-radius:14px}',
    '@keyframes mxPulse{0%,100%{box-shadow:0 0 0 0 rgba(245,192,0,0)}50%{box-shadow:0 0 0 6px rgba(245,192,0,.55),0 0 34px rgba(245,192,0,.45)}}',
    '#mx-tour-ring{position:fixed;z-index:10000;pointer-events:none;border:2px solid #F5C000;border-radius:14px;animation:mxRingPulse 1.1s ease-in-out infinite;transition:top .3s ease,left .3s ease,width .3s ease,height .3s ease}',
    '@keyframes mxRingPulse{0%,100%{box-shadow:0 0 0 3px rgba(245,192,0,.18),0 0 22px rgba(245,192,0,.3),inset 0 0 18px rgba(245,192,0,.12)}50%{box-shadow:0 0 0 7px rgba(245,192,0,.45),0 0 42px rgba(245,192,0,.5),inset 0 0 26px rgba(245,192,0,.2)}}',
    '#mx-tour-card{pointer-events:auto;position:fixed;z-index:10001;width:calc(100% - 24px);max-width:360px;background:linear-gradient(180deg,#171717,#0D0D0D);border:1px solid rgba(245,192,0,.5);border-radius:16px;box-shadow:0 14px 50px rgba(0,0,0,.75),0 0 40px rgba(245,192,0,.12);padding:16px 18px;transition:top .3s ease,left .3s ease,bottom .3s ease}',
    '#mx-tour-card .mx-tour-tag{font-size:9px;font-weight:800;letter-spacing:.16em;color:#F5C000;margin-bottom:6px}',
    '#mx-tour-card b.mx-tour-title{display:block;font-size:14px;font-weight:900;color:#fff;margin-bottom:5px}',
    '#mx-tour-card p{margin:0;font-size:11.5px;line-height:1.6;color:rgba(255,255,255,.65)}',
    '#mx-tour-card .mx-tour-foot{display:flex;align-items:center;gap:10px;margin-top:13px}',
    '#mx-tour-card .mx-dots{display:flex;gap:5px;flex:1}',
    '#mx-tour-card .mx-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18)}',
    '#mx-tour-card .mx-dots i.on{background:#F5C000}',
    '#mx-tour-next{border:0;cursor:pointer;border-radius:10px;padding:9px 16px;font-family:inherit;font-size:11px;font-weight:900;letter-spacing:.05em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d)}',
    '#mx-tour-skip{border:0;cursor:pointer;background:none;font-family:inherit;font-size:10px;color:rgba(255,255,255,.4);text-decoration:underline}',
    '#mx-tour-skip:hover{color:rgba(255,255,255,.7)}',
    '#mx-tour-final{pointer-events:auto;position:fixed;z-index:10001;left:50%;top:50%;transform:translate(-50%,-50%);width:calc(100% - 32px);max-width:400px;text-align:center;background:linear-gradient(180deg,#171717,#0D0D0D);border:1px solid rgba(245,192,0,.55);border-radius:18px;box-shadow:0 0 70px rgba(245,192,0,.2),0 24px 70px rgba(0,0,0,.8);padding:26px 24px 22px}',
    '#mx-tour-final img{height:46px;margin:0 auto 12px;display:block}',
    '#mx-tour-final h3{font-size:18px;font-weight:900;color:#fff;margin:0 0 8px}',
    '#mx-tour-final h3 span{color:#F5C000}',
    '#mx-tour-final p{font-size:12px;line-height:1.6;color:rgba(255,255,255,.65);margin:0 0 16px}',
    '#mx-intro-help{position:fixed;right:12px;bottom:12px;z-index:60;width:26px;height:26px;border-radius:50%;border:1px solid rgba(245,192,0,.6);background:rgba(13,13,13,.9);color:#F5C000;font-size:13px;font-weight:900;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.5)}',
    '#mx-intro-help:hover{background:#F5C000;color:#0D0D0D}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- localizar elementos reais da página ---------- */

  function findWidget() {
    var els = document.querySelectorAll('span,p,h1,h2,h3,div');
    for (var i = 0; i < els.length; i++) {
      var t = (els[i].textContent || '').trim();
      if (t.length < 60 && /sistema de an[aá]lise/i.test(t)) {
        var node = els[i];
        while (node && node !== document.body) {
          if (window.getComputedStyle(node).position === 'fixed') return node;
          node = node.parentElement;
        }
      }
    }
    return null;
  }

  function findBetButton() {
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || '').trim().toUpperCase();
      if (t === 'APOSTA' || t === 'AGUARDE' || t.indexOf('CASHOUT') !== -1) return btns[i];
    }
    return null;
  }

  function findCanvas() { return document.querySelector('canvas'); }

  function findRegisterButton() {
    var btns = document.querySelectorAll('button,a');
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || '').trim().toUpperCase();
      if (t.indexOf('INSCREVER') !== -1 || t.indexOf('REGISTRAR') !== -1 || t.indexOf('REGISTAR') !== -1) return btns[i];
    }
    return null;
  }

  /* ---------- pré-venda guiada ---------- */

  var TOUR = [
    {
      target: findWidget,
      tag: 'PASSO 1 DE 3 — O TEU RADAR',
      title: 'Recebe o sinal aqui',
      html: 'Este é o painel do <span class="mx-x">Sistema de Análise</span>. Antes de cada rodada ele lê os padrões e, quando encontra um, mostra <span class="mx-x">"Padrão encontrado!"</span> com o multiplicador previsto — por exemplo <span class="mx-x">2.40x</span>. Sem sinal, ele avisa para aguardares.'
    },
    {
      target: findBetButton,
      tag: 'PASSO 2 DE 3 — A TUA APOSTA',
      title: 'Com sinal verde, entra na rodada',
      html: 'Escolhe o valor (podes começar com <span class="mx-x">100 Kz</span>) e clica <span class="mx-x">APOSTA</span> antes de a rodada arrancar. Tens dois painéis para fazer duas apostas ao mesmo tempo.'
    },
    {
      target: findCanvas,
      tag: 'PASSO 3 DE 3 — O TEU LUCRO',
      title: 'Sai antes do valor previsto',
      html: 'O avião sobe e o multiplicador cresce no centro do ecrã. O segredo: faz <span class="mx-x">CASHOUT antes do multiplicador que o sistema previu</span>. Se o sinal disse 2.40x, sai a 2.00x e garante o lucro.'
    }
  ];

  function positionCard(card, target) {
    var pad = 12;
    var r = target.getBoundingClientRect();
    var ch = card.offsetHeight, cw = card.offsetWidth;
    var top = r.top - ch - pad;
    if (top < pad) top = Math.min(r.bottom + pad, window.innerHeight - ch - pad);
    var left = r.left + r.width / 2 - cw / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - cw - pad));
    card.style.top = Math.max(pad, top) + 'px';
    card.style.left = left + 'px';
  }

  function clearSpot() {
    var s = document.querySelectorAll('.mx-spotlight');
    for (var i = 0; i < s.length; i++) s[i].classList.remove('mx-spotlight');
  }

  function startTour() {
    var ov = document.createElement('div');
    ov.id = 'mx-tour-overlay';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('mx-show'); });

    var card = document.createElement('div');
    card.id = 'mx-tour-card';
    ov.appendChild(card);

    var ring = document.createElement('div');
    ring.id = 'mx-tour-ring';
    ov.appendChild(ring);

    function placeRing(target) {
      var pad = 6;
      var r = target.getBoundingClientRect();
      ring.style.top = (r.top - pad) + 'px';
      ring.style.left = (r.left - pad) + 'px';
      ring.style.width = (r.width + pad * 2) + 'px';
      ring.style.height = (r.height + pad * 2) + 'px';
    }

    var idx = 0;

    function endTour(showFinal) {
      clearSpot();
      card.remove();
      if (!showFinal) {
        ov.classList.remove('mx-show');
        setTimeout(function () { ov.remove(); }, 350);
        return;
      }
      var fin = document.createElement('div');
      fin.id = 'mx-tour-final';
      fin.innerHTML =
        '<img src="/img/muxima-bet-logo.png" alt="Muxima Bet">' +
        '<span class="mx-badge">AGORA É CONTIGO</span>' +
        '<h3>Vê o sistema <span>a acertar ao vivo</span></h3>' +
        '<p>Sinal → Aposta → Cashout antes do valor previsto. É só isso.<br>Fica a observar as próximas rodadas e compara o sinal do painel com o valor onde o avião rebenta. Vais ver a precisão com os teus próprios olhos.</p>' +
        '<button class="mx-cta" id="mx-final-cta">VER O SISTEMA AO VIVO</button>' +
        '<p class="mx-note">Quando quiseres jogar com o sistema, é só criar conta.</p>';
      ov.appendChild(fin);
      document.getElementById('mx-final-cta').addEventListener('click', function () {
        ov.classList.remove('mx-show');
        setTimeout(function () { ov.remove(); }, 350);
        var w = findWidget();
        if (w) {
          w.classList.add('mx-spotlight');
          setTimeout(function () { w.classList.remove('mx-spotlight'); }, 6000);
        }
      });
    }

    function show(i) {
      clearSpot();
      var step = TOUR[i];
      var target = step.target();
      if (!target) { // elemento ainda não montado — tenta o próximo passo
        if (i + 1 < TOUR.length) return show(i + 1);
        return endTour(true);
      }
      if (window.getComputedStyle(target).position !== 'fixed') {
        try { target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
      }
      var dots = '';
      for (var d = 0; d < TOUR.length; d++) dots += '<i class="' + (d <= i ? 'on' : '') + '"></i>';
      card.innerHTML =
        '<div class="mx-tour-tag">' + step.tag + '</div>' +
        '<b class="mx-tour-title">' + step.title + '</b>' +
        '<p>' + step.html + '</p>' +
        '<div class="mx-tour-foot">' +
          '<div class="mx-dots">' + dots + '</div>' +
          '<button id="mx-tour-skip">Saltar</button>' +
          '<button id="mx-tour-next">' + (i === TOUR.length - 1 ? 'CONCLUIR' : 'SEGUINTE') + '</button>' +
        '</div>';
      placeRing(target);
      positionCard(card, target);
      setTimeout(function () { placeRing(target); positionCard(card, target); }, 400);
      setTimeout(function () { placeRing(target); positionCard(card, target); }, 800);
      document.getElementById('mx-tour-next').addEventListener('click', function () {
        if (i + 1 < TOUR.length) show(i + 1); else endTour(true);
      });
      document.getElementById('mx-tour-skip').addEventListener('click', function () { endTour(true); });
    }

    show(idx);
  }

  /* ---------- apresentação inicial ---------- */

  function showIntro() {
    if (document.getElementById('mx-intro-overlay')) return;
    var ov = document.createElement('div');
    ov.id = 'mx-intro-overlay';
    ov.innerHTML =
      '<div id="mx-intro-card" role="dialog" aria-modal="true">' +
        '<div class="mx-head">' +
          '<img src="/img/muxima-bet-logo.png" alt="Muxima Bet">' +
          '<span class="mx-badge">EXCLUSIVO MUXIMA BET</span>' +
          '<h2>SISTEMA DE <span>ANÁLISE</span></h2>' +
          '<p class="mx-sub">No Aviator tradicional ninguém sabe onde a rodada vai parar.<br>Aqui, o nosso sistema analisa e mostra-te <b>até onde ela deve ir</b>.</p>' +
        '</div>' +
        '<div class="mx-steps">' +
          '<div class="mx-step"><span class="mx-num">1</span><div><b>O sistema lê as rodadas em tempo real</b><p>O painel no canto do ecrã analisa o histórico e procura padrões antes de cada rodada.</p></div></div>' +
          '<div class="mx-step"><span class="mx-num">2</span><div><b>Quando encontra um padrão, dá-te o sinal</b><p>Aparece <span class="mx-x">"Padrão encontrado!"</span> com o multiplicador previsto — por exemplo <span class="mx-x">2.40x</span> — e a indicação de aposta segura.</p></div></div>' +
          '<div class="mx-step"><span class="mx-num">3</span><div><b>Tu apostas e sais antes do valor indicado</b><p>Faz o cashout antes do multiplicador previsto. Sem sinal? O sistema avisa: aguarda a próxima rodada.</p></div></div>' +
        '</div>' +
        '<div class="mx-foot">' +
          '<button class="mx-cta" id="mx-intro-cta">ENTENDI — MOSTRAR O SISTEMA</button>' +
          '<p class="mx-note">Podes rever esta explicação no botão ? no canto do ecrã.</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('mx-show'); });
    document.getElementById('mx-intro-cta').addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      ov.classList.remove('mx-show');
      setTimeout(function () {
        ov.remove();
        startTour();
      }, 350);
    });
  }

  function addHelpButton() {
    if (document.getElementById('mx-intro-help')) return;
    var b = document.createElement('button');
    b.id = 'mx-intro-help';
    b.type = 'button';
    b.title = 'Como funciona o Sistema de Análise?';
    b.textContent = '?';
    b.addEventListener('click', showIntro);
    document.body.appendChild(b);
  }

  function init() {
    addHelpButton();
    try {
      if (sessionStorage.getItem("mx_skip_intro")) { sessionStorage.removeItem("mx_skip_intro"); return; }
    } catch (e) {}
    showIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
