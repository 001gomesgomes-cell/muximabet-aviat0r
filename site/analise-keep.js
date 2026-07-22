/* Muxima Bet — mantém o painel "Sistema de Análise" sempre aberto.
   Se o app não tiver sinal para apresentar (cartão vazio / "não encontrado" /
   desaparece), mostramos sempre o estado "Analisando servidor..." (loading),
   com o mesmo visual do app. Só cede o lugar quando há "Padrão encontrado". */
(function () {
  var SEL = '.fixed.bottom-2.left-2';

  // markup do cartão de carregamento (igual ao do próprio app)
  var LOADING_HTML =
    '<div class="backdrop-blur-xl rounded-lg border shadow-xl overflow-hidden relative bg-gradient-to-r from-amber-900/20 to-orange-900/30 border-amber-500/50">' +
      '<div class="px-2.5 py-1 flex items-center gap-1.5 border-b pr-8 border-amber-500/30 bg-amber-500/10">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-3 h-3 text-amber-500"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>' +
        '<span class="text-[9px] font-bold uppercase tracking-wide text-amber-500">Sistema de Análise</span>' +
        '<div class="ml-auto w-1.5 h-1.5 rounded-full animate-pulse bg-amber-500"></div>' +
      '</div>' +
      '<div class="p-2">' +
        '<div class="flex items-center gap-2">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap w-4 h-4 text-amber-500 animate-pulse"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>' +
          '<div class="flex-1">' +
            '<p class="text-[10px] font-medium text-amber-200">Analisando servidor...</p>' +
            '<div class="flex gap-0.5 mt-0.5">' +
              '<div class="w-5 h-0.5 bg-amber-500/40 rounded animate-pulse" style="animation-delay: 0s;"></div>' +
              '<div class="w-5 h-0.5 bg-amber-500/40 rounded animate-pulse" style="animation-delay: 0.1s;"></div>' +
              '<div class="w-5 h-0.5 bg-amber-500/40 rounded animate-pulse" style="animation-delay: 0.2s;"></div>' +
              '<div class="w-5 h-0.5 bg-amber-500/40 rounded animate-pulse" style="animation-delay: 0.3s;"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  function panelEl() { return document.querySelector(SEL); }

  // cartão de conteúdo do app (não o botão, não o nosso)
  function appCard(p) {
    var kids = p.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el.tagName === 'BUTTON') continue;
      if (el.getAttribute && el.getAttribute('data-mx-load')) continue;
      return el;
    }
    return null;
  }

  function myCard(p) { return p.querySelector('[data-mx-load]'); }

  function makeLoading() {
    var w = document.createElement('div');
    w.setAttribute('data-mx-load', '1');
    w.className = 'animate-fade-in w-44 md:w-52';
    w.innerHTML = LOADING_HTML;
    return w;
  }

  function keepOn(p) {
    var btn = p.querySelector('button');
    if (btn && /an[aá]lise\s*off/i.test((btn.textContent || ''))) {
      btn.click(); // nunca desligar
    }
  }

  function tick() {
    var p = panelEl();
    if (!p) return;
    keepOn(p);

    var card = appCard(p);
    var txt = card ? (card.textContent || '') : '';
    var hasSignal = /Padr[aã]o encontrado/i.test(txt);

    if (hasSignal) {
      // há sinal para mostrar — deixa o cartão do app e remove o nosso
      if (card) card.style.display = '';
      var mineA = myCard(p);
      if (mineA) mineA.remove();
    } else {
      // nada para apresentar — esconde o do app (vazio/não encontrado) e mostra loading
      if (card) card.style.display = 'none';
      var mineB = myCard(p);
      if (!mineB) { mineB = makeLoading(); p.appendChild(mineB); }
      else { mineB.style.display = ''; }
    }
  }

  function start() {
    tick();
    setInterval(tick, 400);
    // reage depressa às mudanças de estado do painel (com throttle p/ não pesar)
    try {
      var pending = false;
      var obs = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; tick(); });
      });
      obs.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
