/* Muxima Bet — Chat ao vivo simulado na página de depósito.
   Injeta um chat de comunidade (prova social) dentro do modal "Depositar".
   Mensagens automáticas de apostadores + duas figuras verificadas (Pai Diesel,
   Jéssica Pitbull) que incentivam o lead a comentar e mostram que quem depositou
   já está a lucrar com o Aviator + Sistema de Análise. O lead também comenta.
   Estilo de script injetado, igual a lead-intro.js / deposit-watch.js. */
(function () {
  var MARK = "mx-deposit-chat";

  // avatares das figuras verificadas (coloca as fotos em site/img/ com estes nomes)
  var AV_DIESEL = "/img/pai-diesel.jpg";
  var AV_JESSICA = "/img/jessica-pitbull.jpg";

  /* ---------- estilos ---------- */
  var css = [
    '#mx-chat{margin:14px 12px 18px;border:1px solid rgba(245,192,0,.28);border-radius:16px;background:linear-gradient(180deg,#141414,#0D0D0D);overflow:hidden;font-family:Montserrat,Inter,system-ui,sans-serif}',
    '#mx-chat .mx-chat-head{display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.07);background:radial-gradient(120% 140% at 0% 0%,rgba(245,192,0,.10),transparent 60%)}',
    '#mx-chat .mx-live-dot{width:8px;height:8px;border-radius:50%;background:#E60303;box-shadow:0 0 0 0 rgba(230,3,3,.6);animation:mxLive 1.3s infinite}',
    '@keyframes mxLive{0%{box-shadow:0 0 0 0 rgba(230,3,3,.55)}70%{box-shadow:0 0 0 7px rgba(230,3,3,0)}100%{box-shadow:0 0 0 0 rgba(230,3,3,0)}}',
    '#mx-chat .mx-chat-title{font-size:12px;font-weight:900;letter-spacing:.08em;color:#fff}',
    '#mx-chat .mx-chat-title span{color:#F5C000}',
    '#mx-chat .mx-online{margin-left:auto;font-size:10px;font-weight:700;color:rgba(255,255,255,.55);display:flex;align-items:center;gap:5px}',
    '#mx-chat .mx-online i{width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;box-shadow:0 0 6px #22c55e}',
    '#mx-chat-list{max-height:250px;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:9px;scrollbar-width:thin}',
    '#mx-chat-list::-webkit-scrollbar{width:5px}#mx-chat-list::-webkit-scrollbar-thumb{background:rgba(245,192,0,.3);border-radius:9px}',
    '.mx-msg{display:flex;gap:8px;align-items:flex-start;opacity:0;transform:translateY(6px);animation:mxMsgIn .35s forwards}',
    '@keyframes mxMsgIn{to{opacity:1;transform:none}}',
    '.mx-av{flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#0D0D0D;overflow:hidden}',
    '.mx-av img{width:100%;height:100%;object-fit:cover;display:block}',
    '.mx-av.vip{box-shadow:0 0 0 2px #1d9bf0}',
    '.mx-bubble{background:#1c1c1c;border:1px solid rgba(255,255,255,.06);border-radius:4px 12px 12px 12px;padding:7px 11px;max-width:78%}',
    '.mx-bubble.vip{background:#20200f;border:1px solid rgba(245,192,0,.22)}',
    '.mx-bubble .mx-name{font-size:11px;font-weight:800;margin-bottom:2px;display:flex;align-items:center;gap:5px}',
    '.mx-vb{flex:none;display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;border-radius:50%;background:#1d9bf0;color:#fff;font-size:8px;font-weight:900}',
    '.mx-bubble .mx-tag{font-size:8px;font-weight:800;letter-spacing:.06em;padding:1px 6px;border-radius:999px;background:rgba(34,197,94,.16);color:#22c55e}',
    '.mx-bubble .mx-txt{font-size:12px;line-height:1.5;color:rgba(255,255,255,.88)}',
    '.mx-bubble .mx-txt b{color:#F5C000;font-weight:800}',
    '.mx-mention{color:#F5C000;font-weight:800}',
    '.mx-msg.me{flex-direction:row-reverse}',
    '.mx-msg.me .mx-bubble{background:linear-gradient(90deg,#F5C000,#ffd84d);border:0;border-radius:12px 4px 12px 12px}',
    '.mx-msg.me .mx-bubble .mx-txt{color:#0D0D0D;font-weight:600}',
    '.mx-msg.me .mx-av{background:#F5C000}',
    '.mx-typing .mx-dots3{display:flex;gap:3px;background:#1c1c1c;border-radius:12px;padding:9px 12px}',
    '.mx-typing .mx-dots3 i{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.5);animation:mxBlink 1s infinite}',
    '.mx-typing .mx-dots3 i:nth-child(2){animation-delay:.2s}.mx-typing .mx-dots3 i:nth-child(3){animation-delay:.4s}',
    '@keyframes mxBlink{0%,60%,100%{opacity:.25}30%{opacity:1}}',
    '#mx-chat-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.07);background:#0D0D0D}',
    '#mx-chat-input{flex:1;min-width:0;background:#1a1a1a;border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:10px 14px;color:#fff;font-family:inherit;font-size:12.5px;outline:none}',
    '#mx-chat-input:focus{border-color:rgba(245,192,0,.6)}',
    '#mx-chat-input::placeholder{color:rgba(255,255,255,.35)}',
    '#mx-chat-send{flex:none;border:0;cursor:pointer;width:40px;height:40px;border-radius:50%;background:linear-gradient(90deg,#F5C000,#ffd84d);color:#0D0D0D;font-size:16px;font-weight:900;display:flex;align-items:center;justify-content:center}',
    '#mx-chat-send:active{transform:scale(.94)}',
    // Movimentos ao vivo (versão própria, por baixo do chat, texto mais visível)
    '#mx-mov{margin:16px 12px 20px}',
    '#mx-mov .mx-mov-h{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#fff;margin-bottom:10px}',
    '#mx-mov .mx-mov-h i{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:mxMovDot 1.3s infinite}',
    '@keyframes mxMovDot{0%,100%{opacity:1}50%{opacity:.35}}',
    '#mx-mov-list{display:flex;flex-direction:column;gap:8px}',
    '.mx-mov-row{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#0D0D0D;border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:11px 13px;opacity:0;transform:translateY(-8px);animation:mxMsgIn .4s forwards}',
    '.mx-mov-row .l{display:flex;align-items:center;gap:8px;font-size:13px;min-width:0}',
    '.mx-mov-row .mx-arrow{font-weight:900;font-size:15px;line-height:1}',
    '.mx-mov-row .nm{font-weight:800;color:#fff}',
    '.mx-mov-row .ac{color:rgba(255,255,255,.72);font-weight:500}',
    '.mx-mov-row .amt{font-weight:900;font-size:14px;white-space:nowrap}',
    '.mx-mov-row .amt.up{color:#22c55e}',
    '.mx-mov-row .amt.down{color:#F5C000}'
  ].join('\n');

  var style = document.createElement('style');
  style.setAttribute('data-mx', MARK);
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- figuras verificadas ---------- */
  var DIESEL = { n: 'Pai Diesel', av: AV_DIESEL, vip: true };
  var JESSICA = { n: 'Jéssica Pitbull', av: AV_JESSICA, vip: true };

  function d(t) { return { n: DIESEL.n, av: DIESEL.av, vip: true, t: t }; }
  function j(t) { return { n: JESSICA.n, av: JESSICA.av, vip: true, t: t }; }

  /* ---------- mensagens automáticas (sem repetições por ciclo) ---------- */
  var FEED = [
    d('Malta, quem já depositou hoje comenta aqui quanto já lucrou 👇 não tenham vergonha 🔥'),
    { n: 'Edna V.', t: 'esse aviator paga muito, já ganhei <b>124 mil Kz</b> essa semana 😱' },
    j('Gente, o Aviator + Sistema de Análise mudou a minha vida, já saquei pro <b>Range</b> 🚗💛'),
    { n: 'Carlos M.', t: 'o sinal deu 2.40x, saí a 2.10x e ganhei limpo 🔥' },
    { n: 'Sofia R.', t: 'comecei hoje, fiz o depósito, vou testar agora 🙏' },
    d('Eu com o Sistema de Análise não perco uma. Quem ainda tá na dúvida, deposita e testa, depois volta aqui pra contar 💰'),
    { n: 'Nelson B.', t: 'aviator + sistema de análise numa casa de apostas é um <b>milagre</b>, tô lucrando muito' },
    { n: 'Joana P.', t: 'fiz meu primeiro depósito de 5 000 e já tô com <b>18 300</b> 😮' },
    j('Quem entrou hoje comenta aqui 👇 eu respondo. Depositar é seguro, o bónus entra na hora e o sistema faz o resto 💛'),
    { n: 'Bruno A.', t: 'levantei <b>75 000</b> ontem, caiu no multicaixa rapidinho 💸' },
    { n: 'Domingos K.', t: 'o segredo é sair ANTES do valor que o sistema mostra, funciona mesmo' },
    d('Ó pessoal, deixem de assistir e comecem a lucrar. Faz o depósito, segue o sinal e comenta aqui o teu primeiro ganho 🚀'),
    { n: 'Luísa T.', t: 'estou lucrando muito, já paguei as contas do mês só com o aviator 🙌' },
    { n: 'Paulo N.', t: 'aviator com sinal é outro nível, nunca mais joguei no escuro' },
    j('Acabei de sacar mais <b>90 mil</b> 😍 quem depositou hoje já deve estar a ver o saldo subir. Comentem aí!'),
    { n: 'Cátia S.', t: 'depositei agora mesmo, o bónus caiu na hora 🔥 bora testar' },
    { n: 'Hélder M.', t: 'já ganhei <b>210 mil</b> no total, esse sistema é sério demais' },
    { n: 'Teresa G.', t: 'melhor decisão foi confiar no sistema de análise, obrigada Muxima' },
    d('Quem depositou e ainda não comentou, aparece! Mostra a esse pessoal novo que dá lucro de verdade 💪🔥'),
    { n: 'Ivo L.', t: 'primeira vez que jogo aviator e já tô no lucro, isso é surreal' },
    { n: 'Márcia F.', t: 'saquei <b>50 mil</b> e reinvesti, o sistema tá acertando quase tudo hoje' },
    j('Novatos, não fiquem só a olhar 😄 deposita o valor com bónus e vem comentar. Eu comecei igual a vocês e hoje tô lucrada 💛'),
    { n: 'André C.', t: 'aproveitem o bónus de hoje, com o de 10 000 recebe 17 500 na hora' },
    { n: 'Osvaldo R.', t: 'fiz depósito de manhã, já dobrei o valor com o sinal 📈' },
    d('Aviator paga MUITO quando segues o Sistema de Análise. Sem sinal não apostes, com sinal verde é lucro 💰'),
    { n: 'Nádia V.', t: 'ganhei <b>124 mil</b> também! esse chat não me deixa mentir 😅🔥' },
    { n: 'Kial J.', t: 'comecei hoje com 3 000 só pra testar, já tô com 11 700 😮' }
  ];

  /* ---------- respostas quando o LEAD escreve ---------- */
  var REPLIES = [
    d('Boa que comentaste! 🔥 Agora faz o teu depósito e volta aqui pra dizer quanto lucraste. O sistema não falha 💪'),
    j('Isso! 💛 Deposita e testa agora, depois vem contar. Comigo começou igualzinho e hoje tô lucrada 😍'),
    d('Quem comenta é quem ganha 😎 escolhe um valor com bónus e segue o sinal verde. Tô de olho no teu primeiro saque 💰'),
    j('Bem-vindo(a) ao lucro 🚀 faz o depósito, o bónus entra na hora e o Sistema de Análise faz o resto. Volta aqui depois!'),
    { n: 'Carlos M.', t: 'entra sim, o sistema tá acertando muito hoje 🔥' },
    { n: 'Sofia R.', t: 'foi assim que comecei também, depois não vais querer parar 😄' },
    { n: 'Nelson B.', t: 'bora! quanto mais cedo entrares, mais rodadas aproveitas 🚀' },
    { n: 'Joana P.', t: 'confia, comigo funcionou logo no primeiro dia 💰' }
  ];

  /* ---------- utilidades ---------- */
  var AV_COLORS = ['#F5C000', '#22c55e', '#38bdf8', '#f97316', '#e879f9', '#f43f5e', '#facc15', '#4ade80'];

  function colorFor(name) {
    var idx = 0; for (var i = 0; i < name.length; i++) idx += name.charCodeAt(i);
    return AV_COLORS[idx % AV_COLORS.length];
  }
  function initials(name) {
    return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // nome do lead, lido do perfil autenticado (Supabase) — só o primeiro nome
  function leadName() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('auth-token') !== -1) {
          var o = JSON.parse(localStorage.getItem(k));
          var m = o && o.user && o.user.user_metadata;
          var nm = m && (m.username || m.full_name || m.name || m.display_name);
          if (nm) {
            var first = String(nm).trim().split(/\s+/)[0];
            if (first) return first.charAt(0).toUpperCase() + first.slice(1);
          }
        }
      }
    } catch (e) {}
    return null;
  }

  function avatar(msg, isMe) {
    var wrap = document.createElement('div');
    wrap.className = 'mx-av' + (msg && msg.vip ? ' vip' : '');
    if (msg && msg.av) {
      var img = document.createElement('img');
      img.src = msg.av; img.alt = msg.n;
      img.onerror = function () {
        wrap.removeChild(img);
        wrap.textContent = initials(msg.n);
        wrap.style.background = colorFor(msg.n);
      };
      wrap.appendChild(img);
    } else {
      var name = isMe ? 'Tu' : msg.n;
      wrap.textContent = initials(name);
      wrap.style.background = colorFor(name);
    }
    return wrap;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var jx = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[jx]; a[jx] = tmp;
    }
    return a;
  }

  // baralho que nunca repete dentro do mesmo ciclo (e evita repetir na virada)
  function makeDeck(items) {
    return {
      items: items, bag: [], last: null,
      next: function () {
        if (this.bag.length === 0) {
          this.bag = shuffle(this.items.slice());
          if (this.bag.length > 1 && this.bag[this.bag.length - 1] === this.last) {
            var t = this.bag[0]; this.bag[0] = this.bag[this.bag.length - 1]; this.bag[this.bag.length - 1] = t;
          }
        }
        var it = this.bag.pop(); this.last = it; return it;
      }
    };
  }

  /* ---------- Movimentos ao vivo (versão própria) ---------- */
  var PEOPLE = [
    'Edna V.', 'Rui F.', 'Carlos M.', 'Sofia R.', 'Maria D.', 'Domingos K.', 'Nelson B.',
    'Joana P.', 'Bruno A.', 'Luísa T.', 'Paulo N.', 'Cátia S.', 'Hélder M.', 'Ivo L.',
    'Teresa G.', 'André C.', 'Márcia F.', 'Kial J.', 'Osvaldo R.', 'Nádia V.', 'Ana C.',
    'Miguel A.', 'Beatriz T.', 'João S.', 'Kiala J.'
  ];
  var DEP_VALUES = [3000, 5000, 10000, 15000];
  var WIT_VALUES = [32000, 45000, 58000, 75000, 92000, 120000, 150000, 210000];

  function genMov(avoidName) {
    var name, g = 0;
    do { name = PEOPLE[Math.floor(Math.random() * PEOPLE.length)]; g++; } while (name === avoidName && g < 8);
    var up = Math.random() < 0.45;
    var amount = up ? DEP_VALUES[Math.floor(Math.random() * DEP_VALUES.length)]
                    : WIT_VALUES[Math.floor(Math.random() * WIT_VALUES.length)];
    return { name: name, type: up ? 'up' : 'down', amount: amount };
  }

  function movRow(item) {
    var row = document.createElement('div');
    row.className = 'mx-mov-row';
    var up = item.type === 'up';
    row.innerHTML =
      '<div class="l">' +
        '<span class="mx-arrow" style="color:' + (up ? '#22c55e' : '#F5C000') + '">' + (up ? '↗' : '↘') + '</span>' +
        '<span class="nm">' + item.name + '</span>' +
        '<span class="ac">' + (up ? 'depositou' : 'levantou') + '</span>' +
      '</div>' +
      '<span class="amt ' + (up ? 'up' : 'down') + '">' + item.amount.toLocaleString('pt-AO') + ' Kz</span>';
    return row;
  }

  function buildMov() {
    var wrap = document.createElement('div');
    wrap.id = 'mx-mov';
    wrap.innerHTML = '<div class="mx-mov-h"><i></i>Movimentos ao vivo</div><div id="mx-mov-list"></div>';
    return wrap;
  }

  function seedMov() {
    for (var i = 0; i < 4; i++) {
      var it = genMov(state.movLast);
      state.movLast = it.name;
      state.movEl.appendChild(movRow(it));
    }
  }

  function movTick() {
    if (!state.movEl) return;
    var it = genMov(state.movLast);
    state.movLast = it.name;
    state.movEl.insertBefore(movRow(it), state.movEl.firstChild);
    while (state.movEl.children.length > 5) state.movEl.removeChild(state.movEl.lastChild);
    state.movTimer = setTimeout(movTick, 3500 + Math.random() * 3000);
  }

  /* ---------- ajustes ao modal React (renomear + esconder original) ---------- */
  function topSectionOf(el, scroll) {
    var n = el;
    while (n && n.parentElement && n.parentElement !== scroll) n = n.parentElement;
    return (n && n.parentElement === scroll) ? n : null;
  }

  function renameTexts(root) {
    var map = [['escolha o valor', 'Escolha o valor do Depósito'], ['compra 100% segura', 'DEPÓSITO 100% SEGURO']];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], tn;
    while ((tn = walker.nextNode())) nodes.push(tn);
    nodes.forEach(function (node) {
      var p = node.parentElement; if (!p) return;
      if (p.closest('#mx-chat') || p.closest('#mx-mov')) return;
      var v = node.nodeValue; if (!v) return;
      var tr = v.trim().toLowerCase();
      for (var i = 0; i < map.length; i++) {
        if (tr === map[i][0]) { node.nodeValue = v.replace(v.trim(), map[i][1]); return; }
      }
    });
  }

  function applyTweaks(dialog) {
    var scroll = dialog.querySelector('.overflow-y-auto') || dialog;
    // esconde a secção "Movimentos ao vivo" original do React (mantém a nossa #mx-mov)
    var ps = scroll.querySelectorAll('p');
    for (var i = 0; i < ps.length; i++) {
      if (/movimentos ao vivo/i.test(ps[i].textContent || '')) {
        if (ps[i].closest('#mx-mov')) continue;
        var sec = topSectionOf(ps[i], scroll);
        if (sec && sec.style.display !== 'none') sec.style.display = 'none';
      }
    }
    renameTexts(scroll);
  }

  /* ---------- construção do chat ---------- */
  function buildChat() {
    var wrap = document.createElement('div');
    wrap.id = 'mx-chat';
    wrap.innerHTML =
      '<div class="mx-chat-head">' +
        '<span class="mx-live-dot"></span>' +
        '<span class="mx-chat-title">CHAT <span>AO VIVO</span></span>' +
        '<span class="mx-online"><i></i><b id="mx-online-n">247</b> online</span>' +
      '</div>' +
      '<div id="mx-chat-list"></div>' +
      '<form id="mx-chat-form" autocomplete="off">' +
        '<input id="mx-chat-input" type="text" maxlength="140" placeholder="Escreve a tua mensagem...">' +
        '<button id="mx-chat-send" type="submit" aria-label="Enviar">➤</button>' +
      '</form>';
    return wrap;
  }

  var state = { list: null, timer: null, onlineTimer: null, feedDeck: null, replyDeck: null, movEl: null, movTimer: null, movLast: null };

  function appendMessage(msg, isMe) {
    var list = state.list; if (!list) return;
    var row = document.createElement('div');
    row.className = 'mx-msg' + (isMe ? ' me' : '');
    row.appendChild(avatar(msg, isMe));
    var b = document.createElement('div');
    b.className = 'mx-bubble' + (msg && msg.vip ? ' vip' : '');
    if (!isMe) {
      var badge = msg.vip ? '<span class="mx-vb" title="Verificado">✓</span>' : '';
      var nameColor = msg.vip ? '#F5C000' : colorFor(msg.n);
      b.innerHTML = '<div class="mx-name" style="color:' + nameColor + '">' + msg.n + badge + '</div>' +
        '<div class="mx-txt">' + msg.t + '</div>';
    } else {
      b.innerHTML = '<div class="mx-txt"></div>';
      b.querySelector('.mx-txt').textContent = msg.t;
    }
    row.appendChild(b);
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
  }

  function showTyping(msg) {
    var list = state.list; if (!list) return null;
    var row = document.createElement('div');
    row.className = 'mx-msg mx-typing';
    row.appendChild(avatar(msg, false));
    var t = document.createElement('div');
    t.className = 'mx-typing';
    t.innerHTML = '<div class="mx-dots3"><i></i><i></i><i></i></div>';
    row.appendChild(t);
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
    return row;
  }

  function dripNext() {
    var msg = state.feedDeck.next();
    var typing = showTyping(msg);
    setTimeout(function () {
      if (typing) typing.remove();
      appendMessage(msg, false);
    }, 900 + Math.random() * 900);
    state.timer = setTimeout(dripNext, 5000 + Math.random() * 5000);
  }

  function fluctuateOnline() {
    var el = document.getElementById('mx-online-n');
    if (el) {
      var n = parseInt(el.textContent, 10) || 247;
      n += Math.floor(Math.random() * 9) - 3;
      n = Math.max(180, Math.min(410, n));
      el.textContent = n;
    }
    state.onlineTimer = setTimeout(fluctuateOnline, 3000 + Math.random() * 2000);
  }

  function pickReply(avoidName) {
    var r = state.replyDeck.next(), guard = 0;
    while (avoidName && r.n === avoidName && guard < 4) { r = state.replyDeck.next(); guard++; }
    return r;
  }

  function renderReply(base, delay, after) {
    var nm = leadName();
    var mention = '<span class="mx-mention">@' + escapeHtml(nm || 'você') + '</span> ';
    var reply = { n: base.n, av: base.av, vip: base.vip, sup: base.sup, t: mention + base.t };
    var typing = showTyping(reply);
    setTimeout(function () {
      if (typing) typing.remove();
      appendMessage(reply, false);
      if (after) after();
    }, delay);
  }

  function onLeadSend(text) {
    appendMessage({ t: text }, true);
    // pausa as mensagens automáticas para a resposta ao lead vir já a seguir
    clearTimeout(state.timer);
    var first = pickReply(null);
    var second = Math.random() < 0.6; // por vezes duas pessoas (diferentes) respondem
    renderReply(first, 1200 + Math.random() * 1100, function () {
      if (second) {
        renderReply(pickReply(first.n), 1400 + Math.random() * 1300, resumeDrip);
      } else {
        resumeDrip();
      }
    });
  }

  function resumeDrip() {
    clearTimeout(state.timer);
    state.timer = setTimeout(dripNext, 4500 + Math.random() * 4000);
  }

  function seed() {
    // arranca com as figuras verificadas + prova social forte, sem repetir
    var start = [FEED[0], FEED[1], FEED[2], FEED[6], FEED[4]];
    start.forEach(function (m) { appendMessage(m, false); });
    // remove as já mostradas do baralho inicial para não repetir logo a seguir
    var shown = start;
    var rest = FEED.filter(function (m) { return shown.indexOf(m) === -1; });
    state.feedDeck = makeDeck(rest.length ? rest : FEED);
    state.feedDeck.last = start[start.length - 1];
  }

  function mount(dialog) {
    var scroll = dialog.querySelector('.overflow-y-auto') || dialog;
    if (scroll.querySelector('#mx-chat')) return;
    var chat = buildChat();
    scroll.appendChild(chat);
    state.list = chat.querySelector('#mx-chat-list');
    state.replyDeck = makeDeck(REPLIES);
    seed();
    // "Movimentos ao vivo" por baixo do chat
    var mov = buildMov();
    scroll.appendChild(mov);
    state.movEl = mov.querySelector('#mx-mov-list');
    state.movLast = null;
    seedMov();
    clearTimeout(state.timer); clearTimeout(state.onlineTimer); clearTimeout(state.movTimer);
    state.timer = setTimeout(dripNext, 3500);
    state.movTimer = setTimeout(movTick, 4000 + Math.random() * 2500);
    fluctuateOnline();

    var form = chat.querySelector('#mx-chat-form');
    var input = chat.querySelector('#mx-chat-input');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      if (!v) return;
      input.value = '';
      onLeadSend(v);
    });
  }

  function teardown() {
    clearTimeout(state.timer); clearTimeout(state.onlineTimer); clearTimeout(state.movTimer);
    state.list = null; state.feedDeck = null; state.replyDeck = null; state.movEl = null; state.movLast = null;
  }

  /* ---------- deteção do modal de depósito ---------- */
  function isDepositDialog(dlg) {
    if (!dlg) return false;
    if (dlg.querySelector('iframe')) return false; // checkout externo, não o modal de valores
    if (dlg.querySelector('#mx-chat')) return true;
    var txt = (dlg.textContent || '');
    return /escolha o valor/i.test(txt) && /movimentos ao vivo/i.test(txt);
  }

  var mounted = false;
  setInterval(function () {
    var dlgs = document.querySelectorAll('[role="dialog"]');
    var target = null;
    for (var i = 0; i < dlgs.length; i++) { if (isDepositDialog(dlgs[i])) { target = dlgs[i]; break; } }
    if (target) {
      if (!target.querySelector('#mx-chat')) { mount(target); mounted = true; }
      applyTweaks(target); // reforça o esconder da original + renomear (React pode re-renderizar)
    } else if (mounted) { teardown(); mounted = false; }
  }, 800);
})();
