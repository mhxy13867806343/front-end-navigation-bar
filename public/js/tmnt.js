/* =====================================================================
   激龟快打 TMNT FTG — 单文件 Canvas 格斗 + oat UI
   依赖：jQuery, jQuery UI, oat.min.js, game-audio-helper.js（均在 public/）
   ===================================================================== */
(function () {
  'use strict';

  // ---------- 常量 ----------
  var W = 800, H = 450, GROUND_Y = 380;
  var GRAVITY = 0.5, COMBO_WINDOW = 45;       // 帧
  var ROUND_WIN = 2, ROUND_TIME = 99;         // 秒
  var STEP = 1 / 60;

  // 攻击定义（基础；角色用 pow/数值覆盖）
  var ATTACKS = {
    punch:  { startup: 4, active: 4, recovery: 9,  dmg: 8,  reach: 46, h: 36, oy: 44, kb: 3,  kind: 'melee' },
    kick:   { startup: 7, active: 5, recovery: 15, dmg: 12, reach: 58, h: 30, oy: 30, kb: 6,  kind: 'melee' },
    throw:  { startup: 5, active: 4, recovery: 20, dmg: 22, reach: 40, h: 64, oy: 30, kb: 11, kind: 'throw', ignoreBlock: true },
    special:{ startup: 9, active: 2, recovery: 18, dmg: 0,  reach: 0,  h: 0,  oy: 0,  kb: 0,  kind: 'special' }
  };

  // 四龟角色
  var CHARS = [
    { key: 'leo',  name: '李奥纳多', emoji: '🐢', color: '#3b82f6', tag: '均衡', maxHp: 100, walk: 2.4, jump: 9.5, pow: 1.00,
      punch: { dmg: 8,  reach: 46 }, kick: { dmg: 12, reach: 58 }, special: { dmg: 18, speed: 6.0, range: 520 } },
    { key: 'mike', name: '米开朗基罗', emoji: '🍕', color: '#22c55e', tag: '速攻', maxHp: 90,  walk: 2.9, jump: 10.0, pow: 0.90,
      punch: { dmg: 7,  reach: 42 }, kick: { dmg: 10, reach: 54 }, special: { dmg: 14, speed: 7.0, range: 320 } },
    { key: 'don',  name: '多纳泰罗', emoji: '🔬', color: '#a855f7', tag: '长手', maxHp: 105, walk: 2.1, jump: 9.0, pow: 1.05,
      punch: { dmg: 9,  reach: 52 }, kick: { dmg: 13, reach: 64 }, special: { dmg: 20, speed: 5.0, range: 640 } },
    { key: 'raph', name: '拉斐尔', emoji: '🔥', color: '#ef4444', tag: '重击', maxHp: 98,  walk: 2.3, jump: 9.2, pow: 1.15,
      punch: { dmg: 9,  reach: 46 }, kick: { dmg: 14, reach: 56 }, special: { dmg: 22, speed: 5.5, range: 560 } }
  ];

  // ---------- 全局状态 ----------
  var G = {
    mode: 'title',          // title | select | fighting | matchend | paused
    phase: 'intro',         // intro | fight | outro
    phaseTimer: 0,
    round: 1,
    timerFrames: ROUND_TIME * 60,
    lastWinner: null,
    hi: parseInt(localStorage.getItem('tmnt_hi') || '0', 10),
    muted: false
  };
  var p1, p2, projectiles = [];

  // 输入抽象：键盘 held + 触摸 held + 攻击脉冲
  var keys = { left: false, right: false, up: false, down: false };
  var touch = { left: false, right: false, up: false, down: false };
  var pending = { punch: false, kick: false, special: false, throw: false };
  var tap = { left: 0, right: 0 };     // 双击冲刺时间戳
  var prevTap = { left: 0, right: 0 };

  // ---------- DOM ----------
  function $(id) { return document.getElementById(id); }

  // ---------- 音频 ----------
  function beep(freq, type, dur, gain) {
    if (G.muted) return;
    try { if (window.RetroGameAudio) window.RetroGameAudio.playTone(freq, type, dur, gain); } catch (e) {}
  }
  function audioPunch() { beep(200, 'square', 0.07, 0.18); }
  function audioKick()  { beep(150, 'square', 0.09, 0.2); }
  function audioSpecial() { beep(660, 'sawtooth', 0.18, 0.18); beep(330, 'sawtooth', 0.18, 0.12); }
  function audioHit(blocked) { if (blocked) beep(120, 'triangle', 0.05, 0.1); else beep(90, 'sawtooth', 0.1, 0.22); }
  function audioKO() { beep(220, 'square', 0.5, 0.25); setTimeout(function () { beep(110, 'square', 0.6, 0.25); }, 120); }

  // ---------- 工具 ----------
  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // ---------- 角色工厂 ----------
  function createFighter(char, x, facing) {
    return {
      char: char, x: x, y: GROUND_Y, vx: 0, vy: 0, facing: facing,
      hp: char.maxHp, maxHp: char.maxHp, hpGhost: char.maxHp,
      onGround: true, action: null, at: 0, phase: '', hitDone: false, projSpawned: false,
      hitstun: 0, flash: 0, blocking: false, crouch: false,
      dashTimer: 0, dashDir: 0, jumpHeld: false,
      combo: 0, comboTimer: 0, score: 0, roundWins: 0,
      aiTimer: 0, coolSpecial: 0
    };
  }

  // ---------- 战斗核心 ----------
  function startAction(f, type) {
    var a = ATTACKS[type];
    f.action = type; f.at = 0; f.phase = 'startup'; f.hitDone = false; f.projSpawned = false;
    if (type === 'punch') audioPunch();
    else if (type === 'kick') audioKick();
    else if (type === 'throw') beep(300, 'square', 0.12, 0.2);
  }

  function spawnProjectile(f) {
    var c = f.char, sp = c.special;
    projectiles.push({
      x: f.x + f.facing * 28, y: f.y - 42, vx: f.facing * sp.speed, dir: f.facing,
      dmg: sp.dmg, range: sp.range, traveled: 0, owner: f, color: c.color, alive: true, r: 10
    });
  }

  function meleeHit(atk, opp, a) {
    var dmg = (atk.action === 'punch') ? atk.char.punch.dmg
            : (atk.action === 'kick') ? atk.char.kick.dmg
            : (atk.action === 'throw') ? ATTACKS.throw.dmg * atk.char.pow : 0;
    var reach = (atk.action === 'punch') ? atk.char.punch.reach
              : (atk.action === 'kick') ? atk.char.kick.reach
              : ATTACKS.throw.reach;
    var dir = atk.facing;
    var hx = dir > 0 ? atk.x + atk.w / 2 : atk.x - atk.w / 2 - reach;
    var hy = atk.y - a.oy - a.h;
    if (rectsOverlap(hx, hy, reach, a.h, opp.x - opp.w / 2, opp.y - opp.h, opp.w, opp.h)) {
      var blocked = opp.blocking && !a.ignoreBlock;
      applyDamage(atk, opp, blocked ? dmg * 0.25 : dmg, blocked ? a.kb * 0.4 : a.kb, dir, a.ignoreBlock, blocked);
      return true;
    }
    return false;
  }

  function applyDamage(atk, opp, dmg, kb, dir, ignoreBlock, blocked) {
    opp.hp = Math.max(0, opp.hp - dmg);
    opp.hitstun = blocked ? 6 : 14;
    opp.vx = dir * (blocked ? kb * 0.4 : kb);
    if (!blocked && dmg >= 18) opp.vy = -3;
    opp.flash = 6;
    // 连击（攻击方）
    atk.combo = (atk.comboTimer > 0) ? atk.combo + 1 : 1;
    atk.comboTimer = COMBO_WINDOW;
    var mult = Math.min(3, 1 + atk.combo * 0.1);
    atk.score += Math.round(dmg * mult);
    audioHit(blocked);
    if (opp.hp <= 0) triggerKO(opp);
  }

  function updateFighter(f, opp, inp, canAct) {
    if (f.hitstun > 0) f.hitstun--;
    if (f.flash > 0) f.flash--;
    if (f.comboTimer > 0) { f.comboTimer--; if (f.comboTimer === 0) f.combo = 0; }
    if (f.dashTimer > 0) f.dashTimer--;

    // 招式推进
    if (f.action) {
      f.at++;
      var a = ATTACKS[f.action], total = a.startup + a.active + a.recovery;
      if (f.at <= a.startup) f.phase = 'startup';
      else if (f.at <= a.startup + a.active) {
        f.phase = 'active';
        if (f.action === 'special' && !f.projSpawned) { spawnProjectile(f); f.projSpawned = true; }
        if (f.action !== 'special' && !f.hitDone) { if (meleeHit(f, opp, a)) f.hitDone = true; }
      } else f.phase = 'recovery';
      if (f.at >= total) { f.action = null; f.at = 0; f.phase = ''; f.hitDone = false; f.projSpawned = false; }
    }

    // 重力
    f.vy += GRAVITY; if (f.vy > 14) f.vy = 14;
    f.y += f.vy;
    if (f.y >= GROUND_Y) { f.y = GROUND_Y; f.vy = 0; f.onGround = true; } else f.onGround = false;

    // 水平
    if (canAct && f.hitstun === 0 && !f.action) {
      var backDir = (opp.x > f.x) ? 'left' : 'right';
      f.blocking = f.onGround && inp[backDir] && !inp.up && !f.crouch;
      if (inp.left && !inp.right) { f.vx = (f.blocking ? -f.char.walk * 0.5 : -f.char.walk); f.facing = -1; }
      else if (inp.right && !inp.left) { f.vx = (f.blocking ? f.char.walk * 0.5 : f.char.walk); f.facing = 1; }
      else f.vx = 0;
      if (f.dashTimer > 0) f.vx = f.dashDir * f.char.walk * 2.3;
      // 跳
      if (inp.up && f.onGround && !f.jumpHeld) { f.vy = -f.char.jump; f.onGround = false; f.jumpHeld = true; }
      if (!inp.up) f.jumpHeld = false;
      // 蹲
      f.crouch = f.onGround && inp.down && !inp.left && !inp.right && !inp.up;
      // 攻击脉冲
      if (inp.punch) startAction(f, 'punch');
      else if (inp.kick) startAction(f, 'kick');
      else if (inp.special) startAction(f, 'special');
      else if (inp.throw && Math.abs(opp.x - f.x) < 46) startAction(f, 'throw');
    } else if (f.hitstun > 0) {
      f.vx *= 0.9;
      f.blocking = false; f.crouch = false;
    } else {
      f.vx = 0; f.blocking = false; f.crouch = false;
    }

    f.x += f.vx;
    if (f.x < 30) f.x = 30;
    if (f.x > W - 30) f.x = W - 30;

    // 空闲自动面向对手
    if (canAct && f.onGround && !f.action && f.hitstun === 0 && Math.abs(f.vx) < 0.1) {
      f.facing = (opp.x > f.x) ? 1 : -1;
    }
  }

  // ---------- CPU AI ----------
  function cpuInput(c, p) {
    var inp = { left: false, right: false, up: false, down: false, punch: false, kick: false, special: false, throw: false, dash: 0 };
    if (c.hitstun > 0 || c.action) return inp;
    var dist = p.x - c.x, adist = Math.abs(dist), faceDir = dist > 0 ? 1 : -1;
    if (c.coolSpecial > 0) c.coolSpecial--;
    c.aiTimer--;
    if (adist > 230) {
      if (Math.random() < 0.025 && c.coolSpecial <= 0) { inp.special = true; c.coolSpecial = 80; }
      else { if (faceDir > 0) inp.right = true; else inp.left = true; }
      if (Math.random() < 0.01) inp.up = true;
    } else if (adist > 120) {
      if (Math.random() < 0.5) { if (faceDir > 0) inp.right = true; else inp.left = true; }
      else { if (faceDir > 0) inp.left = true; else inp.right = true; } // 拉开防御
    } else {
      var r = Math.random();
      if (r < 0.30) inp.punch = true;
      else if (r < 0.55) inp.kick = true;
      else if (r < 0.66 && c.coolSpecial <= 0) { inp.special = true; c.coolSpecial = 110; }
      else if (r < 0.76 && adist < 42) inp.throw = true;
      else if (r < 0.86) { if (faceDir > 0) inp.left = true; else inp.right = true; } // 防御
      else if (Math.random() < 0.3) inp.up = true;
    }
    if (Math.random() < 0.004) inp.up = true;
    return inp;
  }

  // ---------- 投射物 ----------
  function updateProjectiles() {
    for (var i = 0; i < projectiles.length; i++) {
      var pr = projectiles[i];
      if (!pr.alive) continue;
      pr.x += pr.vx; pr.traveled += Math.abs(pr.vx);
      if (pr.traveled > pr.range || pr.x < -20 || pr.x > W + 20) { pr.alive = false; continue; }
      var opp = (pr.owner === p1) ? p2 : p1;
      if (rectsOverlap(pr.x - pr.r, pr.y - pr.r, pr.r * 2, pr.r * 2, opp.x - opp.w / 2, opp.y - opp.h, opp.w, opp.h)) {
        applyDamage(pr.owner, opp, pr.dmg, 4, pr.dir, false, false);
        pr.alive = false;
      }
    }
    // 投射物对撞
    for (var a = 0; a < projectiles.length; a++) {
      for (var b = a + 1; b < projectiles.length; b++) {
        var pA = projectiles[a], pB = projectiles[b];
        if (!pA.alive || !pB.alive || pA.owner === pB.owner) continue;
        if (rectsOverlap(pA.x - pA.r, pA.y - pA.r, pA.r * 2, pA.r * 2, pB.x - pB.r, pB.y - pB.r, pB.r * 2, pB.r * 2)) {
          pA.alive = false; pB.alive = false; beep(440, 'square', 0.08, 0.15);
        }
      }
    }
    projectiles = projectiles.filter(function (x) { return x.alive; });
  }

  // ---------- 回合 / 比赛 ----------
  function buildInput(isP1) {
    var inp = { left: false, right: false, up: false, down: false, punch: false, kick: false, special: false, throw: false, dash: 0 };
    if (isP1) {
      inp.left = keys.left || touch.left;
      inp.right = keys.right || touch.right;
      inp.up = keys.up || touch.up;
      inp.down = keys.down || touch.down;
      for (var k in pending) { if (pending[k]) { inp[k] = true; pending[k] = false; } }
      // 双击冲刺检测
      var now = performance.now();
      if ((keys.left || touch.left) && !prevTap.left) { if (now - tap.left < 250) inp.dash = -1; tap.left = now; }
      if ((keys.right || touch.right) && !prevTap.right) { if (now - tap.right < 250) inp.dash = 1; tap.right = now; }
      prevTap.left = (keys.left || touch.left); prevTap.right = (keys.right || touch.right);
    }
    return inp;
  }

  function applyDash(f, inp) {
    if (inp.dash && f.onGround && !f.action && f.hitstun === 0) { f.dashTimer = 12; f.dashDir = inp.dash; f.facing = inp.dash; }
  }

  function startMatch(c1, c2) {
    p1 = createFighter(c1, 230, 1);
    p2 = createFighter(c2, W - 230, -1);
    p1.char.w = 44; p1.w = 44; p1.h = 72; p2.char.w = 44; p2.w = 44; p2.h = 72;
    G.round = 1; G.mode = 'fighting';
    startRound();
  }

  function startRound() {
    var c1 = p1.char, c2 = p2.char;
    p1 = createFighter(c1, 230, 1); p2 = createFighter(c2, W - 230, -1);
    p1.w = p2.w = 44; p1.h = p2.h = 72;
    p1.roundWins = G.p1Wins || 0; p2.roundWins = G.p2Wins || 0;
    projectiles = [];
    G.timerFrames = ROUND_TIME * 60;
    G.phase = 'intro'; G.phaseTimer = 90;
    banner('ROUND ' + G.round);
  }

  function triggerKO(opp) {
    if (G.phase === 'outro') return;
    G.phase = 'outro'; G.phaseTimer = 110;
    G.lastWinner = (opp === p2) ? true : false;
    banner('K.O.');
    audioKO();
  }

  function triggerTimeOut() {
    if (G.phase === 'outro') return;
    G.phase = 'outro'; G.phaseTimer = 110;
    if (p1.hp > p2.hp) G.lastWinner = true;
    else if (p2.hp > p1.hp) G.lastWinner = false;
    else G.lastWinner = null; // 平局判给玩家
    banner('TIME');
    audioKO();
  }

  function resolveRound() {
    if (G.lastWinner) p1.roundWins++; else if (G.lastWinner === false) p2.roundWins++;
    else p1.roundWins++; // 平局给玩家
    G.p1Wins = p1.roundWins; G.p2Wins = p2.roundWins;
    if (p1.roundWins >= ROUND_WIN || p2.roundWins >= ROUND_WIN) endMatch();
    else { G.round++; startRound(); }
  }

  function endMatch() {
    G.mode = 'matchend';
    var win = p1.roundWins > p2.roundWins;
    var total = p1.score;
    if (total > G.hi) { G.hi = total; localStorage.setItem('tmnt_hi', String(G.hi)); }
    var txt = win
      ? '🏆 <b>你赢了！</b><br>比分 ' + p1.roundWins + ' : ' + p2.roundWins + ' ｜ 得分 ' + total
      : '💀 <b>你输了…</b><br>比分 ' + p1.roundWins + ' : ' + p2.roundWins + ' ｜ 得分 ' + total;
    $('resultText').innerHTML = txt;
    $('hiScore').textContent = '最高分 ' + G.hi;
    if (window.ot && window.ot.toast) window.ot.toast(win ? '胜利！' : '败北…', win ? 'success' : 'error');
    openDialog('dlgResult');
  }

  // ---------- 主循环 ----------
  var acc = 0, last = performance.now();
  function loop(now) {
    var dt = (now - last) / 1000; last = now;
    if (dt > 0.25) dt = 0.25;
    acc += dt;
    while (acc >= STEP) { stepGame(); acc -= STEP; }
    render();
    requestAnimationFrame(loop);
  }

  function stepGame() {
    if (G.mode !== 'fighting') return;
    if (G.phase === 'intro') {
      G.phaseTimer--;
      if (G.phaseTimer === 45) banner('FIGHT!');
      if (G.phaseTimer <= 0) G.phase = 'fight';
      return;
    }
    if (G.phase === 'outro') {
      updateFighter(p1, p2, {}, false);
      updateFighter(p2, p1, {}, false);
      updateProjectiles();
      G.phaseTimer--;
      if (G.phaseTimer <= 0) resolveRound();
      return;
    }
    // fight
    G.timerFrames--;
    var i1 = buildInput(true), i2 = cpuInput(p2, p1);
    applyDash(p1, i1); applyDash(p2, i2);
    updateFighter(p1, p2, i1, true);
    updateFighter(p2, p1, i2, true);
    updateProjectiles();
    if (p1.hp <= 0 || p2.hp <= 0) { /* KO 已在 applyDamage 触发 */ }
    else if (G.timerFrames <= 0) triggerTimeOut();
  }

  // ---------- 渲染 ----------
  var canvas, ctx;
  function render() {
    if (!ctx) return;
    // 背景
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0c1430'); g.addColorStop(0.6, '#13203f'); g.addColorStop(1, '#0a1020');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 远景建筑
    ctx.fillStyle = '#1b2a4a';
    for (var i = 0; i < 8; i++) {
      var bw = 60 + (i % 3) * 20, bh = 80 + (i * 37) % 140;
      ctx.fillRect(i * 105 - 20, GROUND_Y - bh, bw, bh);
    }
    // 月亮
    ctx.fillStyle = '#cdd9f0'; ctx.beginPath(); ctx.arc(680, 80, 30, 0, Math.PI * 2); ctx.fill();
    // 地面
    ctx.fillStyle = '#243049'; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#2f3e63'; ctx.fillRect(0, GROUND_Y, W, 4);

    if (p1) drawFighter(p1);
    if (p2) drawFighter(p2);
    for (var k = 0; k < projectiles.length; k++) drawProjectile(projectiles[k]);

    updateHUD();
  }

  function drawFighter(f) {
    var w = f.w, h = f.h, x = f.x - w / 2, y = f.y - h;
    var col = f.char.color;
    ctx.save();
    if (f.flash > 0) { ctx.globalAlpha = 0.6; }
    if (f.hp <= 0) { // 倒地
      ctx.translate(f.x, f.y - 10); ctx.rotate(f.facing * Math.PI / 2 * 0.8);
      ctx.fillStyle = col; ctx.fillRect(-w / 2, -10, w, 20);
      ctx.restore(); return;
    }
    // 身体
    ctx.fillStyle = col;
    roundRect(x, y + 14, w, h - 14, 8); ctx.fill();
    // 头
    ctx.fillStyle = '#bfe9c8';
    ctx.beginPath(); ctx.arc(f.x, y + 14, 14, 0, Math.PI * 2); ctx.fill();
    // 眼罩
    ctx.fillStyle = col;
    ctx.fillRect(f.x - 14, y + 10, 28, 6);
    ctx.fillStyle = '#fff';
    var ex = f.facing > 0 ? 4 : -4;
    ctx.beginPath(); ctx.arc(f.x + ex - 4, y + 13, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(f.x + ex + 4, y + 13, 2.4, 0, Math.PI * 2); ctx.fill();
    // 攻击肢体
    ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round';
    if (f.action === 'punch' && f.phase !== 'recovery') {
      var reach = f.char.punch.reach, py = f.y - 44;
      ctx.beginPath(); ctx.moveTo(f.x + f.facing * 10, py); ctx.lineTo(f.x + f.facing * reach, py); ctx.stroke();
    } else if (f.action === 'kick' && f.phase !== 'recovery') {
      var kr = f.char.kick.reach, ky = f.y - 30;
      ctx.beginPath(); ctx.moveTo(f.x + f.facing * 10, ky); ctx.lineTo(f.x + f.facing * kr, ky + 6); ctx.stroke();
    } else if (f.action === 'throw' && f.phase !== 'recovery') {
      ctx.beginPath(); ctx.moveTo(f.x + f.facing * 10, f.y - 40); ctx.lineTo(f.x + f.facing * 36, f.y - 44); ctx.stroke();
    }
    // 防御盾
    if (f.blocking) {
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 3; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(f.x + f.facing * 22, f.y - 36, 20, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // 蹲
    if (f.crouch) { ctx.fillStyle = col; ctx.fillRect(x, y + 30, w, h - 30); }
    ctx.restore();
  }

  function drawProjectile(pr) {
    ctx.save();
    ctx.fillStyle = pr.color;
    ctx.shadowColor = pr.color; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---------- HUD ----------
  function updateHUD() {
    if (!p1 || !p2) return;
    setBar('p1Hp', 'p1HpGhost', p1);
    setBar('p2Hp', 'p2HpGhost', p2);
    $('timer').textContent = Math.max(0, Math.ceil(G.timerFrames / 60));
    var cb = p1.combo;
    $('combo').textContent = (cb >= 2 && p1.comboTimer > 0) ? (cb + ' COMBO!') : '';
    $('p1Name').textContent = p1.char.name + (cb >= 2 ? ' ×' + cb : '');
    $('p2Name').textContent = p2.char.name;
    renderPips('p1Pips', p1.roundWins);
    renderPips('p2Pips', p2.roundWins);
  }

  function setBar(fillId, ghostId, f) {
    var pct = Math.max(0, f.hp / f.maxHp) * 100;
    $(fillId).style.width = pct + '%';
    f.hpGhost = Math.max(pct, f.hpGhost - 0.6);
    $(ghostId).style.width = f.hpGhost + '%';
  }

  function renderPips(id, n) {
    var el = $(id), html = '';
    for (var i = 0; i < ROUND_WIN; i++) html += '<span class="pip' + (i < n ? ' on' : '') + '"></span>';
    el.innerHTML = html;
  }

  function banner(t) {
    var el = $('roundBanner'); if (!el) return;
    el.textContent = t; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }

  // ---------- 对话框 ----------
  function initDialog(id, width) {
    var $d = $('#' + id);
    $d.removeClass('hidden');
    $d.dialog({ autoOpen: false, modal: true, width: width,
      closeOnEscape: false,
      open: function () { $(this).parent().find('.ui-dialog-titlebar-close').hide(); } });
  }
  function openDialog(id) { $('#' + id).dialog('open'); }
  function closeDialog(id) { $('#' + id).dialog('close'); }

  // ---------- 选人卡片 ----------
  function buildCharGrid() {
    var grid = $('charGrid'), html = '';
    for (var i = 0; i < CHARS.length; i++) {
      var c = CHARS[i];
      var spd = Math.round(c.walk / 2.9 * 100), pwr = Math.round(c.pow / 1.15 * 100), hp = Math.round(c.maxHp / 105 * 100);
      html += '<div class="char-card" data-key="' + c.key + '">' +
        '<div class="c-emoji">' + c.emoji + '</div>' +
        '<div class="c-name">' + c.name + '</div>' +
        '<div class="c-tag">' + c.tag + '</div>' +
        '<div class="c-stat"><span>速度</span><span>' + spd + '</span></div><div class="c-bar"><i style="width:' + spd + '%"></i></div>' +
        '<div class="c-stat"><span>力量</span><span>' + pwr + '</span></div><div class="c-bar"><i style="width:' + pwr + '%"></i></div>' +
        '<div class="c-stat"><span>体力</span><span>' + hp + '</span></div><div class="c-bar"><i style="width:' + hp + '%"></i></div>' +
        '</div>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.char-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var key = card.getAttribute('data-key');
        var c1 = CHARS.filter(function (c) { return c.key === key; })[0];
        var c2 = CHARS[Math.floor(Math.random() * CHARS.length)];
        closeDialog('dlgSelect');
        G.p1Wins = 0; G.p2Wins = 0;
        startMatch(c1, c2);
      });
    });
  }

  // ---------- 输入绑定 ----------
  function bindInput() {
    var map = {
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
      ArrowUp: 'up', KeyW: 'up',
      ArrowDown: 'down', KeyS: 'down'
    };
    document.addEventListener('keydown', function (e) {
      if (map[e.code]) { keys[map[e.code]] = true; e.preventDefault(); }
      else if (e.code === 'KeyJ') { pending.punch = true; }
      else if (e.code === 'KeyK') { pending.kick = true; }
      else if (e.code === 'KeyL') { pending.special = true; }
      else if (e.code === 'KeyU') { pending.throw = true; }
      else if (e.code === 'Escape') { togglePause(); }
      else if (e.code === 'KeyM') { G.muted = !G.muted; if (window.ot && window.ot.toast) window.ot.toast(G.muted ? '已静音' : '已开声', 'info'); }
    });
    document.addEventListener('keyup', function (e) {
      if (map[e.code]) { keys[map[e.code]] = false; e.preventDefault(); }
    });
    // 触摸虚拟键
    document.querySelectorAll('.tbtn').forEach(function (btn) {
      var key = btn.getAttribute('data-key');
      var press = function (e) { e.preventDefault();
        if (key === 'left' || key === 'right' || key === 'up' || key === 'down') touch[key] = true;
        else pending[key] = true;
      };
      var release = function (e) { e.preventDefault();
        if (key === 'left' || key === 'right' || key === 'up' || key === 'down') touch[key] = false;
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointerleave', release);
      btn.addEventListener('pointercancel', release);
    });
  }

  function togglePause() {
    if (G.mode === 'fighting') { G.mode = 'paused'; openDialog('dlgPause'); }
    else if (G.mode === 'paused') { G.mode = 'fighting'; closeDialog('dlgPause'); }
  }

  // ---------- 启动 ----------
  $(function () {
    canvas = $('stage'); ctx = canvas.getContext('2d');
    // 触屏检测
    if (('ontouchstart' in window) || navigator.maxTouchPoints > 0 || (window.matchMedia && window.matchMedia('(pointer:coarse)').matches)) {
      document.body.classList.add('touch');
    }
    // 初始摆位（标题背景）
    p1 = createFighter(CHARS[0], 230, 1); p2 = createFighter(CHARS[1], W - 230, -1);
    p1.w = p2.w = 44; p1.h = p2.h = 72;

    $('hiScore').textContent = '最高分 ' + G.hi;
    buildCharGrid();
    bindInput();

    // 初始化所有 jQuery UI 对话框（一次即可，避免重复创建）
    initDialog('dlgTitle', 360);
    initDialog('dlgSelect', 420);
    initDialog('dlgPause', 360);
    initDialog('dlgResult', 360);

    // 标题对话框
    try { openDialog('dlgTitle'); console.log('[TMNT] dialogs init + title open'); }
    catch (e) { console.error('[TMNT] open title failed', e); }
    $('#btnStart').on('click', function () {
      console.log('[TMNT] btnStart clicked');
      try { closeDialog('dlgTitle'); openDialog('dlgSelect'); }
      catch (e) { console.error('[TMNT] open select failed', e); }
    });
    $('#btnHowto').on('click', function () { $('#howto').toggleClass('hidden'); });
    // 暂停
    $('#btnPause').on('click', togglePause);
    $('#btnResume').on('click', function () { closeDialog('dlgPause'); G.mode = 'fighting'; });
    $('#btnQuit').on('click', function () { closeDialog('dlgPause'); G.mode = 'title'; openDialog('dlgTitle'); });
    // 结算
    $('#btnAgain').on('click', function () { closeDialog('dlgResult'); openDialog('dlgSelect'); });
    $('#btnHome').on('click', function () { closeDialog('dlgResult'); G.mode = 'title'; openDialog('dlgTitle'); });

    requestAnimationFrame(loop);
  });
})();
