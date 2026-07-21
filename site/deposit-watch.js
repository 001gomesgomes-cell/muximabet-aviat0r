/* Muxima Bet — fecha o popup de depósito automaticamente quando o saldo é creditado
   e devolve o lead ao jogo. Funciona vigiando o saldo (o checkout da Kintu é
   cross-origin e não pode ser lido diretamente). */
(function () {
  var SUPA_URL = "https://kypohaagiozofdoadvgu.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cG9oYWFnaW96b2Zkb2Fkdmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzgxMDYsImV4cCI6MjEwMDE1NDEwNn0.OZbRfkN880v02YocGfIicc99PTlfe1x6wOAqdswLpTU";

  function accessToken() {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("kypohaagiozofdoadvgu") !== -1 && k.indexOf("auth-token") !== -1) {
        try { return JSON.parse(localStorage.getItem(k)).access_token; } catch (e) {}
      }
    }
    return null;
  }

  function getBalance() {
    var t = accessToken();
    if (!t) return Promise.resolve(null);
    return fetch(SUPA_URL + "/rest/v1/profiles?select=balance", {
      headers: { apikey: ANON, Authorization: "Bearer " + t },
    }).then(function (r) { return r.json(); })
      .then(function (j) { return Array.isArray(j) && j[0] ? Number(j[0].balance) : null; })
      .catch(function () { return null; });
  }

  function checkoutOpen() {
    return !!document.querySelector('iframe[src*="kintu.org"], iframe[src*="clickpayon"]');
  }

  function closeCheckout() {
    // Radix Dialog fecha com Escape
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true }));
    // reforço: clicar num botão de fechar do modal, se existir
    setTimeout(function () {
      var btns = document.querySelectorAll('[role="dialog"] button');
      for (var i = 0; i < btns.length; i++) {
        var lbl = (btns[i].getAttribute("aria-label") || "").toLowerCase();
        if (lbl.indexOf("close") !== -1 || lbl.indexOf("fechar") !== -1) { btns[i].click(); return; }
      }
    }, 120);
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:100000;background:linear-gradient(90deg,#1a7a3c,#22c55e);color:#fff;font-family:Montserrat,system-ui,sans-serif;font-weight:800;font-size:13px;padding:12px 20px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.5);opacity:0;transition:opacity .3s,top .3s";
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = "1"; t.style.top = "26px"; });
    setTimeout(function () { t.style.opacity = "0"; setTimeout(function () { t.remove(); }, 400); }, 4200);
  }

  // mostra o aviso de sucesso depois do recarregamento
  try {
    var pend = sessionStorage.getItem("mx_deposit_toast");
    if (pend) { sessionStorage.removeItem("mx_deposit_toast"); setTimeout(function () { toast(pend); }, 800); }
  } catch (e) {}

  var watching = false, baseBal = null, ticks = 0;

  setInterval(function () {
    var open = checkoutOpen();
    if (open && !watching) {
      watching = true; ticks = 0;
      getBalance().then(function (b) { baseBal = b; });
      return;
    }
    if (!open && watching) { watching = false; baseBal = null; return; }
    if (!watching) return;
    ticks++;
    getBalance().then(function (b) {
      if (b != null && baseBal != null && b > baseBal) {
        closeCheckout();
        watching = false; baseBal = null;
        // sincroniza o saldo no cabeçalho e volta ao jogo (sem reabrir a apresentação)
        try {
          sessionStorage.setItem("mx_skip_intro", "1");
          sessionStorage.setItem("mx_deposit_toast", "✓ Depósito recebido! Saldo: " + b.toLocaleString("pt-AO") + " Kz");
        } catch (e) {}
        setTimeout(function () { location.reload(); }, 900);
      } else if (b != null && baseBal == null) {
        baseBal = b; // caso a base ainda não estivesse pronta
      }
    });
  }, 2500);
})();
