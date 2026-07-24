/* =========================================================================
   75 宾果 (75 Bingo) · 复刻版 — 游戏逻辑
   依赖：jQuery + jQuery UI(对话框) + oat(oat.toast) + RetroGameAudio(音效)
   所有数值见 CFG，标注 [PLACEHOLDER] 的需在试玩后调（详见 bingo75-GDD.md）
   ========================================================================= */
$(function () {
  "use strict";

  /* ---------- 配置（平衡假设，待 playtest 调） ---------- */
  const CFG = {
    START_BANKROLL: 100,   // 初始本金
    BET_PER_CARD: 10,      // 每张牌每轮下注
    GOAL: 400,             // 胜利本金阈值
    PAY_LINE: 8,           // 单条线(行/列/斜)派彩
    PAY_CORNERS: 15,       // 四角派彩
    PAY_FULL: 50,          // 满卡 jackpot
    COMBO_STEP: 0.2,       // 每连击 +倍率
    COMBO_CAP: 5,          // 倍率上限
    AUTO_SPEED: 900,       // [PLACEHOLDER] 自动取号间隔 ms
    MAX_CARDS: 4
  };

  const COLS = [
    { key: "B", lo: 1, hi: 15 },
    { key: "I", lo: 16, hi: 30 },
    { key: "N", lo: 31, hi: 45 },
    { key: "G", lo: 46, hi: 60 },
    { key: "O", lo: 61, hi: 75 }
  ];

  /* 连线图案 */
  const LINES = [];
  for (let r = 0; r < 5; r++) LINES.push({ key: "r" + r, cells: [[r, 0], [r, 1], [r, 2], [r, 3], [r, 4]] });
  for (let c = 0; c < 5; c++) LINES.push({ key: "c" + c, cells: [[0, c], [1, c], [2, c], [3, c], [4, c]] });
  LINES.push({ key: "d1", cells: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]] });
  LINES.push({ key: "d2", cells: [[0, 4], [1, 3], [2, 2], [3, 1], [4, 0]] });
  LINES.push({ key: "corners", cells: [[0, 0], [0, 4], [4, 0], [4, 4]] });
  const FULL = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) FULL.push([r, c]);
  LINES.push({ key: "full", cells: FULL });

  /* ---------- 状态 ---------- */
  let S = null;
  function freshState() {
    return {
      phase: "menu", bankroll: CFG.START_BANKROLL, best: CFG.START_BANKROLL,
      round: 1, numCards: 3, cards: [], cardEls: [], fbEls: {},
      bag: [], drawn: new Set(), lastNum: null,
      combo: 0, autoOn: false, autoTimer: null,
      roundBet: 0, roundPay: 0
    };
  }

  /* ---------- 工具 ---------- */
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pickDistinct(lo, hi, n) { const pool = []; for (let v = lo; v <= hi; v++) pool.push(v); shuffle(pool); return pool.slice(0, n); }
  function colOf(num) { return COLS.find(c => num >= c.lo && num <= c.hi); }

  /* ---------- 卡片生成 ---------- */
  function makeCard() {
    const grid = [];
    for (let r = 0; r < 5; r++) grid.push(new Array(5).fill(null));
    for (let c = 0; c < 5; c++) {
      const { lo, hi } = COLS[c];
      const vals = pickDistinct(lo, hi, 5);
      for (let r = 0; r < 5; r++) {
        if (c === 2 && r === 2) grid[r][c] = { val: 0, marked: true, free: true };
        else grid[r][c] = { val: vals[r], marked: false, free: false };
      }
    }
    return { grid, achieved: new Set(), lines: 0, payout: 0 };
  }

  /* ---------- 取号器 ---------- */
  function newBag() { const a = []; for (let i = 1; i <= 75; i++) a.push(i); return shuffle(a); }

  /* ---------- 连线判定 ---------- */
  function checkCard(card) {
    let gained = 0; const wonNow = [];
    for (const L of LINES) {
      if (card.achieved.has(L.key)) continue;
      const ok = L.cells.every(([r, c]) => card.grid[r][c].marked);
      if (ok) {
        card.achieved.add(L.key); card.lines++;
        const pay = L.key === "corners" ? CFG.PAY_CORNERS : L.key === "full" ? CFG.PAY_FULL : CFG.PAY_LINE;
        gained += pay; wonNow.push(L);
      }
    }
    return { gained, wonNow };
  }

  /* ---------- 抽号 ---------- */
  function draw() {
    if (S.phase !== "playing") return;
    if (S.bag.length === 0) { settle(); return; }
    const num = S.bag.pop();
    S.drawn.add(num); S.lastNum = num;

    for (const card of S.cards)
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        const cell = card.grid[r][c];
        if (cell.val === num && !cell.marked) cell.marked = true;
      }

    let roundGain = 0; const newlyWon = [];
    for (const card of S.cards) {
      const res = checkCard(card);
      if (res.gained > 0) { roundGain += res.gained; res.wonNow.forEach(L => newlyWon.push({ card, L })); }
    }

    if (roundGain > 0) {
      S.combo++;
      const mult = Math.min(1 + CFG.COMBO_STEP * S.combo, CFG.COMBO_CAP);
      roundGain = Math.round(roundGain * mult);
      S.roundPay += roundGain;
      S.bankroll += roundGain;
      showCombo(mult); sfxBingo();
      if (window.ot) ot.toast("连线达成！+" + roundGain + " 币" + (S.combo > 1 ? "（连击 ×" + mult.toFixed(1) + "）" : ""), "BINGO", { variant: "success" });
    } else {
      S.combo = 0; hideCombo(); sfxMark();
    }
    if (S.bankroll > S.best) S.best = S.bankroll;

    updateMarks(newlyWon);
    updateFlashboard();
    renderLastNum(num);
    renderHUD();
    sfxDraw();

    if (S.bankroll >= CFG.GOAL) { win(); return; }
    if (S.bag.length === 0) settle();
  }

  /* ---------- 回合 ---------- */
  function startRound() {
    S.roundBet = S.numCards * CFG.BET_PER_CARD;
    S.bankroll -= S.roundBet;
    S.roundPay = 0; S.combo = 0; hideCombo();
    S.cards = []; for (let i = 0; i < S.numCards; i++) S.cards.push(makeCard());
    S.bag = newBag(); S.drawn = new Set(); S.lastNum = null;
    S.phase = "playing";
    buildCardsDOM(); updateFlashboard(); renderLastNum(null); renderHUD();
    setMsg("抽号开始！凑成 横/竖/斜/四角/满卡 即派彩。", "info");
    updateDrawBtn();
  }

  function nextRound() {
    if (S.bankroll < CFG.BET_PER_CARD) { over(); return; }
    while (S.numCards * CFG.BET_PER_CARD > S.bankroll && S.numCards > 1) S.numCards--;
    S.round++;
    startRound();
  }

  function settle() {
    stopAuto();
    S.phase = "settle";
    updateDrawBtn();
    const net = S.roundPay - S.roundBet;
    $("#sCards").text(S.numCards);
    $("#sBet").text(S.roundBet);
    $("#sPay").text(S.roundPay);
    $("#sNet").text((net >= 0 ? "+" : "") + net).toggleClass("success", net >= 0);
    $("#sBank").text(S.bankroll);
    let note = "继续攒本金，目标 " + CFG.GOAL + "。";
    if (S.bankroll >= CFG.GOAL) note = "已达成目标，点击即可获胜！";
    else if (S.bankroll < CFG.BET_PER_CARD) note = "本金不足，无法再开一轮。";
    $("#settleNote").text(note);
    openDialog("#settleDialog");
  }

  function win() { stopAuto(); S.phase = "win"; $("#winBank").text(S.bankroll); $("#winRounds").text(S.round); openDialog("#winDialog"); }
  function over() { stopAuto(); S.phase = "over"; $("#overBest").text(S.best); $("#overRounds").text(S.round); openDialog("#overDialog"); }

  /* ---------- 自动取号 ---------- */
  function toggleAuto() {
    if (S.phase !== "playing") return;
    S.autoOn = !S.autoOn;
    $("#autoSwitch").prop("checked", S.autoOn);
    $("#btnAuto").text(S.autoOn ? "⏸ 暂停" : "▶ 自动");
    if (S.autoOn) S.autoTimer = setInterval(draw, CFG.AUTO_SPEED);
    else stopAuto();
  }
  function stopAuto() {
    S.autoOn = false;
    if (S.autoTimer) { clearInterval(S.autoTimer); S.autoTimer = null; }
    $("#autoSwitch").prop("checked", false);
    $("#btnAuto").text("▶ 自动");
  }

  /* ---------- 渲染 ---------- */
  function buildCardsDOM() {
    const $c = $("#cards").empty(); S.cardEls = [];
    S.cards.forEach((card, ci) => {
      const $card = $('<div class="card bcard"></div>');
      $card.append('<h4>第 ' + (ci + 1) + ' 张 <span class="lines">0 线</span></h4>');
      const $t = $('<table class="btable"></table>');
      const $head = $("<tr></tr>");
      COLS.forEach(col => $head.append('<td class="colhead c-' + col.key + '">' + col.key + "</td>"));
      $t.append($head);
      const tds = [];
      for (let r = 0; r < 5; r++) {
        const $tr = $("<tr></tr>"); const rowtds = [];
        for (let c = 0; c < 5; c++) {
          const cell = card.grid[r][c];
          const cls = "c-" + COLS[c].key + (cell.free ? " free" : "");
          const $td = $('<td class="' + cls + '">' + (cell.free ? "★" : cell.val) + "</td>");
          if (cell.marked) $td.addClass("marked");
          $tr.append($td); rowtds.push($td);
        }
        $t.append($tr); tds.push(rowtds);
      }
      $card.append($t); $c.append($card);
      S.cardEls.push({ tds, lineCountEl: $card.find(".lines") });
    });
  }

  function updateMarks(newlyWon) {
    S.cards.forEach((card, ci) => {
      const tds = S.cardEls[ci].tds;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++)
        if (card.grid[r][c].marked) tds[r][c].addClass("marked");
      S.cardEls[ci].lineCountEl.text(card.lines + " 线");
    });
    if (newlyWon) newlyWon.forEach(({ card, L }) => {
      const ci = S.cards.indexOf(card);
      L.cells.forEach(([r, c]) => {
        const td = S.cardEls[ci].tds[r][c];
        td.addClass("just-won");
        setTimeout(() => td.removeClass("just-won"), 600);
      });
    });
  }

  function buildFlashboard() {
    const $f = $("#flashboard").empty(); S.fbEls = {};
    COLS.forEach(col => {
      const $col = $('<div class="fb-col"></div>');
      $col.append('<div class="fb-head c-' + col.key + '">' + col.key + "</div>");
      for (let v = col.lo; v <= col.hi; v++) {
        const $cell = $('<div class="fb-cell c-' + col.key + '">' + v + "</div>");
        $col.append($cell); S.fbEls[v] = $cell;
      }
      $f.append($col);
    });
  }

  function updateFlashboard() {
    S.drawn.forEach(v => { if (S.fbEls[v]) S.fbEls[v].addClass("called"); });
    $("#calledPct").text(Math.round(S.drawn.size / 75 * 100) + "%");
  }

  function renderLastNum(num) {
    const $l = $("#lastNum");
    if (num == null) { $l.text("--"); $("#lastCol").text("-").attr("class", "badge"); $("#drawnCount").text("0 / 75"); return; }
    $l.text(num).removeClass("pop").addClass("pop");
    const col = colOf(num);
    $("#lastCol").text(col ? col.key : "").attr("class", "badge c-" + (col ? col.key : ""));
    $("#drawnCount").text(S.drawn.size + " / 75");
    setTimeout(() => $l.removeClass("pop"), 350);
  }

  function renderHUD() {
    $("#hudRound").text(S.round);
    $("#hudBank").text(S.bankroll);
    $("#hudGoal").text(CFG.GOAL);
    $("#goalBar").attr("max", CFG.GOAL).attr("value", Math.min(S.bankroll, CFG.GOAL));
    $("#goalLeft").text(Math.max(0, CFG.GOAL - S.bankroll));
    updateDrawBtn();
  }

  function showCombo(mult) { $("#hudCombo").show(); $("#hudComboN").text(mult.toFixed(1)); }
  function hideCombo() { $("#hudCombo").hide(); }

  function setMsg(text, variant) { $("#msg").text(text).attr("data-variant", variant || "info").show(); }
  function updateDrawBtn() { $("#btnDraw").prop("disabled", S.phase !== "playing"); }

  /* ---------- 对话框 ---------- */
  function initDialog(sel, width) {
    $(sel).dialog({
      autoOpen: false, modal: true, width: width || 440, closeOnEscape: false,
      open: function () { $(this).parent().find(".ui-dialog-titlebar-close").hide(); }
    });
  }
  function openDialog(sel) { $(sel).dialog("open"); }
  function closeDialog(sel) { $(sel).dialog("close"); }

  /* ---------- 音效 ---------- */
  function sfxMark() { if (window.RetroGameAudio) RetroGameAudio.playTone(520, "sine", 0.07, 0.05); }
  function sfxDraw() { if (window.RetroGameAudio) RetroGameAudio.playTone(440, "square", 0.04, 0.03); }
  function sfxBingo() {
    if (!window.RetroGameAudio) return;
    RetroGameAudio.playTone(660, "triangle", 0.12, 0.08);
    setTimeout(() => RetroGameAudio.playTone(880, "triangle", 0.16, 0.08), 90);
    setTimeout(() => RetroGameAudio.playTone(1046, "triangle", 0.18, 0.07), 190);
  }

  /* ---------- 初始化 ---------- */
  function initGame() {
    S = freshState();
    $("#betLabel").text(CFG.BET_PER_CARD);
    $("#startBank").text(CFG.START_BANKROLL);
    $("#goalLabel").text(CFG.GOAL);
    $("#cardPick .pick").removeClass("selected");
    $('#cardPick .pick[data-n="3"]').addClass("selected");
    buildFlashboard();
    $("#cards").empty();
    renderHUD(); renderLastNum(null); hideCombo();
    setMsg("选择扑克牌数，开始你的宾果挑战。", "info");
    openDialog("#titleDialog");
  }

  /* ---------- 事件绑定 ---------- */
  $("#cardPick .pick").on("click", function () {
    $("#cardPick .pick").removeClass("selected");
    $(this).addClass("selected");
    S.numCards = parseInt($(this).data("n"), 10);
  });

  $("#btnStart").on("click", function () {
    closeDialog("#titleDialog");
    if (S.phase === "playing") return; // 菜单里“继续游戏”
    startRound();
  });

  $("#btnDraw").on("click", draw);
  $("#autoSwitch").on("change", function () { if (S.autoOn !== $(this).prop("checked")) toggleAuto(); });
  $("#btnAuto").on("click", toggleAuto);
  $("#btnSettle").on("click", function () { if (S.phase === "playing") settle(); });

  $("#btnNext").on("click", function () {
    closeDialog("#settleDialog");
    if (S.bankroll >= CFG.GOAL) { win(); return; }
    if (S.bankroll < CFG.BET_PER_CARD) { over(); return; }
    nextRound();
  });

  $("#btnWinAgain, #btnOverAgain").on("click", function () {
    closeDialog("#winDialog"); closeDialog("#overDialog");
    initGame();
  });

  $("#btnMute").on("click", function () {
    if (window.RetroGameAudio) { const m = RetroGameAudio.toggleMute(); $(this).text(m ? "🔇" : "🔊"); }
  });

  $("#btnMenu").on("click", function () {
    stopAuto();
    $("#btnStart").text(S.phase === "playing" ? "继续游戏" : "开始游戏");
    openDialog("#titleDialog");
  });

  $(document).on("keydown", function (e) {
    if (e.code === "Space" && S.phase === "playing") { e.preventDefault(); draw(); }
    else if (e.key === "m" || e.key === "M") { $("#btnMute").click(); }
  });

  /* 初始化对话框并开局 */
  initDialog("#titleDialog", 470);
  initDialog("#settleDialog", 420);
  initDialog("#winDialog", 420);
  initDialog("#overDialog", 420);
  initGame();
});
