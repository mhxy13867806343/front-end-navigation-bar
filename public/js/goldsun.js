"use strict";
/* =========================================================================
   黄金太阳 · 封印篇 — 南晶科技 FC《黄金太阳》(GBA 黄金太阳 同人移植) 复刻纵切片
   ========================================================================= */
const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');
const W = 810, H = 450;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
cvs.width = W * DPR; cvs.height = H * DPR;
ctx.scale(DPR, DPR);

/* ----------------------------- 平衡配置 (CFG) ----------------------------- */
const CFG = {
  TILE: 30,
  MOVE_SPEED: 165,
  STEP_DISTANCE: 30,
  ENCOUNTER_RATE: 0.03,
  ENCOUNTER_STEP_MIN: 5,
  POST_BATTLE_GRACE: 10,
  FLEE_RATE: 0.6,
  EL_MULT_STRONG: 1.5,
  EL_MULT_WEAK: 0.75,
  EXP_BASE: 50,
  DJINNI_POWER: 52,
};
const BEATS = { '火':'风', '风':'土', '土':'水', '水':'火' };

/* ------------------------------- 键位 ------------------------------- */
const BINDS = {
  up:    ['ArrowUp', 'KeyW'],
  down:  ['ArrowDown', 'KeyS'],
  left:  ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  a:     ['KeyJ', 'KeyZ', 'Enter', 'Space'],
  back:  ['Escape', 'Backspace'],
  menu:  ['KeyC', 'KeyI', 'Tab'],
};
const down = new Set();
const touch = { up:false, down:false, left:false, right:false, a:false, menu:false };
function held(action) { return BINDS[action].some((c) => down.has(c)) || touch[action]; }

/* ------------------------------- 音效 ------------------------------- */
let muted = false;
const sMove  = () => RetroGameAudio.playTone(220, 'square', 0.04, 0.02);
const sCursor= () => RetroGameAudio.playTone(660, 'square', 0.05, 0.04);
const sSelect= () => RetroGameAudio.playTone(880, 'triangle', 0.07, 0.06);
const sHit   = () => { RetroGameAudio.playTone(140, 'sawtooth', 0.16, 0.1); };
const sHurt  = () => { RetroGameAudio.playTone(110, 'square', 0.2, 0.1); };
const sSpell = () => { RetroGameAudio.playTone(520, 'sine', 0.12, 0.08); RetroGameAudio.playTone(780, 'triangle', 0.14, 0.06); };
const sHeal  = () => { RetroGameAudio.playTone(523, 'sine', 0.1, 0.08); RetroGameAudio.playTone(784, 'sine', 0.14, 0.07); };
const sSummon= () => { [262,330,392,523,659].forEach((f,i)=>setTimeout(()=>RetroGameAudio.playTone(f,0.22,'sawtooth',0.1),i*60)); };
const sWin   = () => { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>RetroGameAudio.playTone(f,0.2,'triangle',0.12),i*120)); };
const sLose  = () => { [392,330,262,196].forEach((f,i)=>setTimeout(()=>RetroGameAudio.playTone(f,0.25,'sawtooth',0.1),i*150)); };
const sFlee  = () => RetroGameAudio.playTone(440, 'sine', 0.12, 0.06);

/* ------------------------------- 商店与装备 ------------------------------- */
const SHOP = [
  { id:'w1', name:'木剑', type:'weapon', atk:4, price:80,  desc:'罗宾/杰拉德 攻击+4', who:'all' },
  { id:'w2', name:'铁剑', type:'weapon', atk:8, price:180, desc:'罗宾/杰拉德 攻击+8', who:'all' },
  { id:'w3', name:'精灵短剑', type:'weapon', atk:14, price:380, desc:'罗宾/杰拉德 攻击+14', who:'all' },
  { id:'a1', name:'皮甲', type:'armor', def:3, price:70,  desc:'罗宾/杰拉德 防御+3', who:'all' },
  { id:'a2', name:'铁甲', type:'armor', def:7, price:170, desc:'罗宾/杰拉德 防御+7', who:'all' },
  { id:'a3', name:'精灵护铠', type:'armor', def:12, price:360, desc:'罗宾/杰拉德 防御+12', who:'all' },
  { id:'h1', name:'草药', type:'item', effect:'heal', value:45, price:20, desc:'回复一名队员 45 HP', who:'one' },
  { id:'m1', name:'精神药', type:'item', effect:'mp', value:25, price:25, desc:'回复一名队员 25 MP', who:'one' },
];
function getAtk(p)  { return p.atk + (p.bonusAtk || 0); }
function getDef(p)  { return p.def + (p.bonusDef || 0); }
function getMaxHp(p){ return p.maxhp + (p.bonusMaxHp || 0); }
function getMaxMp(p){ return p.maxmp + (p.bonusMaxMp || 0); }
function equipTo(who, item) {
  if (item.type === 'weapon') {
    who.bonusAtk = (item.atk || 0);
    who.equipment.weapon = item;
  } else if (item.type === 'armor') {
    who.bonusDef = (item.def || 0);
    who.equipment.armor = item;
  }
}
function useItemOn(who, item) {
  if (item.effect === 'heal') { who.hp = Math.min(getMaxHp(who), who.hp + item.value); return true; }
  if (item.effect === 'mp')   { who.mp = Math.min(getMaxMp(who), who.mp + item.value); return true; }
  return false;
}

/* ------------------------------- 全局状态 ------------------------------- */
let gameState = 'MENU';
let gold = 0, hiscore = 0, bossDefeated = false, djinniCollected = false;
let party = [], battle = null, dialog = null, shop = null, charMenu = null;
let hero = null, map = [], COLS = 27, ROWS = 15;
let stepCounter = 0, travelAccum = 0, battleGrace = 0;
const TILE = CFG.TILE;

try { hiscore = parseInt(localStorage.getItem('goldsun_hi') || '0', 10) || 0; } catch (e) {}

/* ------------------------------- 存档系统 ------------------------------- */
const SAVE_KEY = 'goldsun_save_v1';
let titleChoice = 0;
function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}
function serializeParty() {
  return party.map((p) => ({
    name: p.name, side: p.side, color: p.color, cape: p.cape, el: p.el,
    level: p.level, exp: p.exp, maxhp: p.maxhp, hp: p.hp, maxmp: p.maxmp, mp: p.mp,
    atk: p.atk, def: p.def, spd: p.spd,
    bonusAtk: p.bonusAtk || 0, bonusDef: p.bonusDef || 0, bonusMaxHp: p.bonusMaxHp || 0, bonusMaxMp: p.bonusMaxMp || 0,
    equipment: {
      weapon: p.equipment.weapon ? p.equipment.weapon.id : null,
      armor: p.equipment.armor ? p.equipment.armor.id : null,
    },
    spells: p.spells,
  }));
}
function saveGame() {
  const data = {
    party: serializeParty(),
    gold, hiscore, bossDefeated, djinniCollected,
    hero: { x: hero.x, y: hero.y, facing: hero.facing },
    stepCounter, travelAccum, battleGrace,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    localStorage.setItem('goldsun_hi', String(hiscore));
    return true;
  } catch (e) { return false; }
}
function loadGame() {
  let data;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return false; }
  if (!data || !Array.isArray(data.party) || !data.party.length) return false;
  party = data.party.map((p) => {
    const base = {
      name: p.name, side: p.side, color: p.color, cape: p.cape, el: p.el,
      level: p.level || 1, exp: p.exp || 0,
      maxhp: p.maxhp, hp: p.hp, maxmp: p.maxmp, mp: p.mp,
      atk: p.atk, def: p.def, spd: p.spd,
      bonusAtk: p.bonusAtk || 0, bonusDef: p.bonusDef || 0,
      bonusMaxHp: p.bonusMaxHp || 0, bonusMaxMp: p.bonusMaxMp || 0,
      equipment: { weapon: null, armor: null },
      spells: p.spells || [],
    };
    if (p.equipment && p.equipment.weapon) {
      const item = SHOP.find((s) => s.id === p.equipment.weapon);
      if (item) base.equipment.weapon = item;
    }
    if (p.equipment && p.equipment.armor) {
      const item = SHOP.find((s) => s.id === p.equipment.armor);
      if (item) base.equipment.armor = item;
    }
    return base;
  });
  gold = data.gold || 0; hiscore = data.hiscore || 0;
  bossDefeated = data.bossDefeated || false;
  djinniCollected = data.djinniCollected || false;
  hero = { x: data.hero.x, y: data.hero.y, facing: data.hero.facing || 1, w: 20, h: 24 };
  stepCounter = data.stepCounter || 0; travelAccum = data.travelAccum || 0; battleGrace = data.battleGrace || 0;
  buildMap();
  return true;
}
function eraseSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

/* ------------------------------- 角色模板 ------------------------------- */
function makeParty() {
  const robin = {
    name:'罗宾', side:'party', color:'#5ad1ff', cape:'#ef4444', el:'土',
    level:1, exp:0, maxhp:62, hp:62, maxmp:30, mp:30, atk:14, def:8, spd:11,
    bonusAtk:0, bonusDef:0, bonusMaxHp:0, bonusMaxMp:0,
    equipment:{ weapon:null, armor:null },
    spells:[
      { name:'盖亚之刃', el:'土', cost:4, power:24 },
      { name:'冰冻',     el:'水', cost:5, power:20 },
      { name:'治愈',     el:'水', cost:6, heal:30 },
    ],
  };
  const gerald = {
    name:'杰拉德', side:'party', color:'#ff8c42', cape:'#b91c1c', el:'火',
    level:1, exp:0, maxhp:74, hp:74, maxmp:22, mp:22, atk:17, def:10, spd:8,
    bonusAtk:0, bonusDef:0, bonusMaxHp:0, bonusMaxMp:0,
    equipment:{ weapon:null, armor:null },
    spells:[
      { name:'烈焰', el:'火', cost:4, power:26 },
      { name:'爆炎', el:'火', cost:8, power:44 },
    ],
  };
  return [robin, gerald];
}
function makeEnemyGroup() {
  const groups = [
    [mkEnemy('哥布林', '土', 32, 11, 5, 7, 14, 9, '#7bbf5a')],
    [mkEnemy('石像鬼', '风', 46, 14, 9, 5, 22, 15, '#b388ff')],
    [mkEnemy('哥布林', '土', 32, 11, 5, 7, 14, 9, '#7bbf5a'), mkEnemy('毒蝠', '水', 28, 9, 4, 9, 12, 7, '#5ad1ff')],
  ];
  return groups[Math.floor(Math.random() * groups.length)];
}
function mkEnemy(name, el, hp, atk, def, spd, exp, g, color) {
  return { name, side:'enemy', color, el, maxhp:hp, hp, atk, def, spd, exp, gold:g, bossTurn:0 };
}
function makeBoss() {
  const b = mkEnemy('萨丢罗斯', '火', 230, 21, 12, 9, 260, 320, '#ff5d5d');
  b.isBoss = true; return [b];
}

/* ------------------------------- 大地图 (轻量) ------------------------------- */
function buildMap() {
  COLS = 27; ROWS = 15;
  map = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push((r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1) ? '#' : '.');
    }
    map.push(row);
  }
  map[13][2] = 'S';
  map[11][8] = 'M';
  map[7][13] = 'N';
  map[7][20] = 'D';
  map[7][25] = 'B';
}
function tileAt(px, py) {
  const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return '#';
  return map[r][c];
}
function blocked(px, py) {
  const t = tileAt(px, py);
  return t === '#' || t === 'N' || t === 'B' || t === 'M';
}

/* ------------------------------- 启动 / 重置 ------------------------------- */
function startGame() {
  RetroGameAudio.getAudioContext();
  if (titleChoice === 0 && hasSave()) {
    if (loadGame()) { gameState = 'OVERWORLD'; syncChrome(); return; }
  }
  newGame();
}
function newGame() {
  party = makeParty();
  gold = 0; bossDefeated = false; djinniCollected = false; dialog = null; shop = null; charMenu = null;
  stepCounter = 0; travelAccum = 0; battleGrace = 0;
  buildMap();
  hero = { x: 2 * TILE + TILE / 2, y: 13 * TILE + TILE / 2, w: 20, h: 24, facing: 1 };
  gameState = 'OVERWORLD';
  syncChrome();
}
function syncChrome() {
  const playing = (gameState === 'OVERWORLD' || gameState === 'BATTLE');
  document.getElementById('touch').style.display = playing ? 'block' : 'none';
  const menuBtn = document.getElementById('tMenu');
  if (menuBtn) menuBtn.style.display = (gameState === 'OVERWORLD') ? 'block' : 'none';
}

/* ------------------------------- 大地图 更新 ------------------------------- */
function updateOverworld(dt) {
  if (gameState !== 'OVERWORLD') return;
  let dx = 0, dy = 0;
  if (held('left')) dx -= 1;
  if (held('right')) dx += 1;
  if (held('up')) dy -= 1;
  if (held('down')) dy += 1;
  if (dx !== 0) hero.facing = dx;
  const sp = CFG.MOVE_SPEED * dt;
  const nx = hero.x + dx * sp;
  if (!blocked(nx, hero.y - hero.h / 2) && !blocked(nx, hero.y + hero.h / 2)) hero.x = nx;
  const ny = hero.y + dy * sp;
  if (!blocked(hero.x - hero.w / 2, ny) && !blocked(hero.x + hero.w / 2, ny)) hero.y = ny;

  const tc = Math.floor(hero.x / TILE), tr = Math.floor(hero.y / TILE);

  if (held('a')) {
    const nearMerchant = (tr >= 10 && tr <= 12 && tc >= 7 && tc <= 9) ||
                         (Math.abs(tr - 11) <= 1 && Math.abs(tc - 8) <= 1);
    if (nearMerchant && !dialog && !shop) { openShop(); return; }
    const nearNPC = (tr === 7 && tc === 12) || (tr === 6 && tc === 13) || (tr === 8 && tc === 13);
    if (nearNPC && !dialog) {
      dialog = { lines:[
        '村民：「罗宾！西方山巅的封印石被敌人夺走了，',
        '世界的光正被吞噬……去夺回黄金太阳吧！」',
        '（商人就在南方营地，买齐装备再去挑战头目）',
        djinniCollected ? '（你已获得精灵·索尔，战斗中可按「精灵」召唤青龙）' : '（路上那颗发光的精灵·索尔，靠近它就能收服）',
      ], idx:0 };
      gameState = 'DIALOG'; sSelect();
    }
  }

  if (tileAt(hero.x, hero.y) === 'D' && !djinniCollected) {
    djinniCollected = true;
    saveGame();
    dialog = { lines:['精灵·索尔：「我愿助你一臂之力！」', '战斗中可选择「精灵」召唤青龙，重创全体敌人。'], idx:0 };
    gameState = 'DIALOG'; sSummon();
  }

  if (tc === 24 && Math.abs(tr - 7) <= 1 && !bossDefeated) {
    startBattle(makeBoss(), true);
    return;
  }

  if (dx !== 0 || dy !== 0) {
    const t = tileAt(hero.x, hero.y);
    if (t === '.') {
      travelAccum += Math.hypot(dx, dy) * CFG.MOVE_SPEED * dt;
      while (travelAccum >= CFG.STEP_DISTANCE) {
        travelAccum -= CFG.STEP_DISTANCE;
        stepCounter++;
        if (battleGrace > 0) { battleGrace--; continue; }
        if (stepCounter >= CFG.ENCOUNTER_STEP_MIN && Math.random() < CFG.ENCOUNTER_RATE) {
          stepCounter = 0; battleGrace = 0;
          startBattle(makeEnemyGroup(), false);
          return;
        }
      }
    } else {
      stepCounter = 0; travelAccum = 0;
    }
  }
}

/* ------------------------------- 战斗引擎 ------------------------------- */
function startBattle(enemies, isBoss) {
  battle = {
    party: party.map((p) => ({ ...p, spells: p.spells.map((s) => ({ ...s })) })),
    enemies,
    isBoss,
    log: isBoss ? '⚠ 头目战：萨丢罗斯！' : '遭遇敌人！',
    round: 0,
    queue: [],
    active: null,
    awaiting: false,
    menu: 'root',
    options: [],
    menuIndex: 0,
    djinniUsed: false,
    over: false,
    result: null,
    floaters: [],
    flash: 0,
  };
  gameState = 'BATTLE';
  syncChrome();
  setTimeout(beginRound, 700);
}
function beginRound() {
  if (!battle || battle.over) return;
  battle.round++;
  for (const c of battle.party) if (c.hp > 0) c.mp = Math.min(c.maxmp, c.mp + 3);
  battle.queue = [...battle.party.filter((c) => c.hp > 0), ...battle.enemies.filter((e) => e.hp > 0)]
    .sort((a, b) => b.spd - a.spd || Math.random() - 0.5);
  processQueue();
}
function processQueue() {
  if (!battle || battle.over) return;
  battle.queue = battle.queue.filter((c) => c.hp > 0);
  if (battle.queue.length === 0) { setTimeout(beginRound, 450); return; }
  const actor = battle.queue.shift();
  if (!actor || actor.hp <= 0) { processQueue(); return; }
  if (actor.side === 'enemy') {
    battle.active = actor; battle.awaiting = false;
    setTimeout(() => { enemyAct(actor); setTimeout(processQueue, 700); }, 450);
  } else {
    battle.active = actor; battle.awaiting = true;
    battle.menu = 'root'; battle.menuIndex = 0; battle.options = battleRootOptions();
  }
}
function aliveEnemies() { return battle.enemies.filter((e) => e.hp > 0); }
function aliveParty() { return battle.party.filter((p) => p.hp > 0); }
function elMult(atkEl, defEl) {
  if (BEATS[atkEl] === defEl) return CFG.EL_MULT_STRONG;
  if (BEATS[defEl] === atkEl) return CFG.EL_MULT_WEAK;
  return 1;
}
function pushFloater(x, y, text, color) { battle.floaters.push({ x, y, text, color, life: 1.0 }); }
function dealDamage(target, amount) {
  if (target.defending) amount = Math.floor(amount * 0.5);
  target.hp = Math.max(0, target.hp - amount);
  target.defending = false;
  const p = battleUnitPos(target);
  pushFloater(p.x, p.y - 20, '-' + amount, '#ff6b6b');
  battle.flash = 6; sHit();
  if (target.hp <= 0) pushFloater(p.x, p.y - 36, '倒下', '#999');
}
function healUnit(target, amount) {
  const before = target.hp;
  target.hp = Math.min(target.maxhp, target.hp + amount);
  const p = battleUnitPos(target);
  pushFloater(p.x, p.y - 20, '+' + (target.hp - before), '#7CFC9B');
  sHeal();
}
function battleUnitPos(u) {
  if (u.side === 'enemy') {
    const i = battle.enemies.indexOf(u);
    return { x: W - 200 + (i % 2) * 70, y: 180 + Math.floor(i / 2) * 70 };
  }
  const i = battle.party.indexOf(u);
  return { x: 180 + (i % 2) * 30, y: 270 + Math.floor(i / 2) * 60 };
}
function performAttack(actor) {
  const targets = aliveEnemies();
  if (targets.length === 0) return endPlayerTurn();
  const t = targets[0];
  const base = getAtk(actor) * 1.7;
  const dmg = Math.max(1, Math.round((base - t.def * 0.5) * elMult(actor.el, t.el) * rand(0.9, 1.1)));
  dealDamage(t, dmg);
  battle.log = actor.name + ' 攻击 ' + t.name + '！';
  setTimeout(() => { checkEnd(); if (!battle.over) endPlayerTurn(); }, 500);
}
function castSpell(actor, spell) {
  if (actor.mp < spell.cost) { battle.log = '精神力不足！'; return; }
  actor.mp -= spell.cost;
  if (spell.heal) {
    const t = aliveParty().sort((a, b) => a.hp / getMaxHp(a) - b.hp / getMaxHp(b))[0];
    battle.log = actor.name + ' 施展『' + spell.name + '』';
    healUnit(t, spell.heal);
  } else {
    const t = aliveEnemies()[0];
    if (!t) return endPlayerTurn();
    const dmg = Math.max(1, Math.round((spell.power - t.def * 0.4) * elMult(spell.el, t.el) * rand(0.9, 1.1)));
    battle.log = actor.name + ' 施展『' + spell.name + '』';
    sSpell();
    dealDamage(t, dmg);
  }
  setTimeout(() => { checkEnd(); if (!battle.over) endPlayerTurn(); }, 550);
}
function doSummon(actor) {
  if (!djinniCollected || battle.djinniUsed) { battle.log = '精灵不可用！'; return; }
  battle.djinniUsed = true;
  battle.log = '召唤·青龙！全体重创！';
  sSummon();
  for (const e of aliveEnemies()) {
    const dmg = Math.max(1, Math.round(CFG.DJINNI_POWER * elMult('土', e.el) * rand(0.9, 1.1)));
    dealDamage(e, dmg);
  }
  setTimeout(() => { checkEnd(); if (!battle.over) endPlayerTurn(); }, 700);
}
function enemyAct(actor) {
  const targets = aliveParty();
  if (targets.length === 0) return;
  const t = targets[Math.floor(Math.random() * targets.length)];
  if (actor.isBoss) {
    actor.bossTurn = (actor.bossTurn || 0) + 1;
    if (actor.bossTurn % 3 === 0) {
      const dmg = Math.max(1, Math.round((38 - getDef(t) * 0.4) * rand(0.9, 1.1)));
      battle.log = actor.name + ' 释放『红莲业火』！';
      sSpell(); dealDamage(t, dmg); pushFloater(W/2, 120, '红莲业火', '#ff5d5d');
      setTimeout(checkEnd, 200); return;
    }
  }
  const base = actor.atk * 1.6;
  const dmg = Math.max(1, Math.round((base - getDef(t) * 0.5) * rand(0.85, 1.15)));
  battle.log = actor.name + ' 攻击 ' + t.name + '！';
  sHurt(); dealDamage(t, dmg);
  setTimeout(checkEnd, 200);
}
function tryFlee(actor) {
  if (battle.isBoss) { battle.log = '头目战无法逃跑！'; return; }
  if (Math.random() < CFG.FLEE_RATE) {
    battle.log = '成功逃脱！'; sFlee();
    setTimeout(() => { battle.over = true; battle.result = 'flee'; stepCounter = 0; travelAccum = 0; battleGrace = CFG.POST_BATTLE_GRACE; gameState = 'OVERWORLD'; syncChrome(); }, 600);
  } else {
    battle.log = '逃跑失败！';
    endPlayerTurn();
  }
}
function endPlayerTurn() {
  if (!battle || battle.over) return;
  battle.active = null; battle.awaiting = false;
  setTimeout(processQueue, 500);
}
function checkEnd() {
  if (!battle || battle.over) return;
  if (aliveEnemies().length === 0) { winBattle(); return; }
  if (aliveParty().length === 0) { loseBattle(); return; }
}
function winBattle() {
  battle.over = true; battle.result = 'win';
  let exp = 0, g = 0;
  for (const e of battle.enemies) { exp += e.exp; g += e.gold; }
  gold += g;
  battle.log = '胜利！获得 ' + exp + ' EXP / ' + g + ' 金币';
  for (const p of battle.party) gainExp(p, exp);
  if (gold > hiscore) hiscore = gold;
  try { localStorage.setItem('goldsun_hi', String(hiscore)); } catch (e) {}
  saveGame();
  if (battle.isBoss) {
    setTimeout(() => { bossDefeated = true; saveGame(); gameState = 'WIN'; sWin(); syncChrome(); }, 1200);
  } else {
    setTimeout(() => { stepCounter = 0; travelAccum = 0; battleGrace = CFG.POST_BATTLE_GRACE; gameState = 'OVERWORLD'; syncChrome(); }, 1200);
  }
}
function loseBattle() {
  battle.over = true; battle.result = 'lose';
  battle.log = '全队倒下……';
  setTimeout(() => { gameState = 'GAMEOVER'; sLose(); syncChrome(); }, 1200);
}
function gainExp(p, amount) {
  p.exp += amount;
  let leveled = false;
  while (p.exp >= p.level * CFG.EXP_BASE) {
    p.exp -= p.level * CFG.EXP_BASE;
    p.level++;
    p.maxhp += 12; p.maxmp += 4; p.atk += 3; p.def += 2; p.spd += 1;
    p.hp = getMaxHp(p); p.mp = getMaxMp(p);
    pushFloater(battleUnitPos(p).x, battleUnitPos(p).y - 52, 'LEVEL UP!', '#ffd166');
    pushFloater(battleUnitPos(p).x, battleUnitPos(p).y - 34, 'HP/MP 全回满', '#7CFC9B');
    leveled = true;
  }
  if (leveled) saveGame();
}

/* ------------------------------- 角色菜单 & 商店 ------------------------------- */
function openCharMenu() { charMenu = { index: 0, mode: 'status' }; gameState = 'CHAR'; syncChrome(); }
function closeCharMenu() { charMenu = null; gameState = 'OVERWORLD'; syncChrome(); }
function openShop() { shop = { index: 0, mode: 'buy', message: '欢迎光临！要买点什么？' }; gameState = 'SHOP'; syncChrome(); }
function closeShop() { shop = null; gameState = 'OVERWORLD'; syncChrome(); }
function buyShopItem(idx) {
  const item = SHOP[idx];
  if (gold < item.price) { shop.message = '金币不足！还差 ' + (item.price - gold) + ' G'; sCursor(); return; }
  if (item.type === 'item') {
    let target = null;
    if (item.effect === 'heal') target = party.slice().sort((a, b) => a.hp / getMaxHp(a) - b.hp / getMaxHp(b))[0];
    else if (item.effect === 'mp') target = party.slice().sort((a, b) => a.mp / getMaxMp(a) - b.mp / getMaxMp(b))[0];
    if (!target || (item.effect === 'heal' && target.hp >= getMaxHp(target)) || (item.effect === 'mp' && target.mp >= getMaxMp(target))) {
      shop.message = '没有需要回复的队员！'; sCursor(); return;
    }
    gold -= item.price; useItemOn(target, item);
    saveGame();
    shop.message = target.name + ' 使用 ' + item.name + '！'; sSelect(); return;
  }
  const who = party[0];
  gold -= item.price; equipTo(who, item);
  saveGame();
  shop.message = who.name + ' 装备了 ' + item.name + '！'; sSelect();
}
function navShop(dir) {
  if (!shop) return;
  shop.index = (shop.index + dir + SHOP.length) % SHOP.length;
  shop.message = SHOP[shop.index].desc;
  sCursor();
}
function navChar(dir) {
  if (!charMenu) return;
  charMenu.index = (charMenu.index + dir + party.length) % party.length;
  sCursor();
}
function charMenuAction() { if (!charMenu) return; closeCharMenu(); }
let charToast = null;
function pushCharToast(msg) { charToast = { text: msg, life: 1.8 }; }

/* ------------------------------- 战斗 指令输入 ------------------------------- */
function battleRootOptions() { return ['攻击', '精神力', '精灵', '防御', '逃跑']; }
function openMenu(kind) {
  if (kind === 'root') { battle.menu = 'root'; battle.options = battleRootOptions(); }
  else if (kind === 'psy') { battle.menu = 'psy'; battle.options = battle.active.spells.map((s) => s.name + '(' + s.cost + 'MP)'); }
  battle.menuIndex = 0; sCursor();
}
function confirmMenu() {
  if (!battle || !battle.awaiting || battle.over) return;
  const actor = battle.active;
  const sel = battle.options[battle.menuIndex];
  if (battle.menu === 'root') {
    if (sel === '攻击') { sSelect(); performAttack(actor); }
    else if (sel === '精神力') { openMenu('psy'); }
    else if (sel === '精灵') {
      if (!djinniCollected) { battle.log = '尚未收服精灵！'; sCursor(); return; }
      if (battle.djinniUsed) { battle.log = '精灵已在本次战斗中使用！'; sCursor(); return; }
      sSelect(); doSummon(actor);
    }
    else if (sel === '防御') { actor.defending = true; battle.log = actor.name + ' 防御姿态'; sSelect(); endPlayerTurn(); }
    else if (sel === '逃跑') { sSelect(); tryFlee(actor); }
  } else if (battle.menu === 'psy') {
    if (sel === '返回') { openMenu('root'); return; }
    const spell = actor.spells[battle.menuIndex];
    if (spell && actor.mp >= spell.cost) { sSelect(); castSpell(actor, spell); }
    else { battle.log = '精神力不足！'; sCursor(); }
  }
}
function backMenu() { if (battle && battle.menu === 'psy') openMenu('root'); }
function navMenu(dir) {
  if (!battle || !battle.awaiting) return;
  battle.menuIndex = (battle.menuIndex + dir + battle.options.length) % battle.options.length;
  sCursor();
}

/* ------------------------------- 绘制：通用 ------------------------------- */
function drawHero(x, y, facing, color, cape) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = cape; ctx.beginPath(); ctx.moveTo(-facing * 4, -10); ctx.lineTo(-facing * 14, 14); ctx.lineTo(-facing * 2, 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-7, -6, 14, 18);
  ctx.fillStyle = '#ffe0bd'; ctx.beginPath(); ctx.arc(0, -14, 8, 0, 7); ctx.fill();
  ctx.fillStyle = '#caa472'; ctx.beginPath(); ctx.arc(0, -16, 8, Math.PI, 0); ctx.fill();
  ctx.fillStyle = cape; ctx.fillRect(-2, -19, 4, 3);
  ctx.restore();
}
function drawEnemySprite(u, x, y) {
  ctx.save(); ctx.translate(x, y);
  const s = u.isBoss ? 1.8 : 1;
  ctx.fillStyle = u.color;
  ctx.beginPath(); ctx.ellipse(0, 0, 16 * s, 18 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-6 * s, -4 * s, 4 * s, 0, 7); ctx.arc(6 * s, -4 * s, 4 * s, 0, 7); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-6 * s, -4 * s, 2 * s, 0, 7); ctx.arc(6 * s, -4 * s, 2 * s, 0, 7); ctx.fill();
  if (u.isBoss) { ctx.fillStyle = '#ffd166'; ctx.fillRect(-18, -30, 36, 5); }
  ctx.restore();
}
function bar(x, y, w, h, ratio, color) {
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, w * clamp(ratio, 0, 1), h);
  ctx.strokeStyle = '#fff3'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
}

/* ------------------------------- 绘制：大地图 ------------------------------- */
function renderOverworld() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#14321f'); g.addColorStop(1, '#0c1f14');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = map[r][c], x = c * TILE, y = r * TILE;
      if (t === '#') {
        ctx.fillStyle = '#1d2b1c'; ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#2f4a2c'; ctx.beginPath(); ctx.arc(x + TILE/2, y + TILE/2, 9, 0, 7); ctx.fill();
      } else if (t === '.') {
        ctx.fillStyle = ((r + c) % 2 === 0) ? '#16331f' : '#143019'; ctx.fillRect(x, y, TILE, TILE);
      } else if (t === ' ') {
        ctx.fillStyle = '#3a2e1a'; ctx.fillRect(x, y, TILE, TILE);
      } else if (t === 'N') {
        ctx.fillStyle = ((r + c) % 2 === 0) ? '#16331f' : '#143019'; ctx.fillRect(x, y, TILE, TILE);
        drawHero(x + TILE/2, y + TILE/2, 1, '#c084fc', '#7c3aed');
      } else if (t === 'M') {
        ctx.fillStyle = ((r + c) % 2 === 0) ? '#16331f' : '#143019'; ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#8b5cf6'; ctx.beginPath(); ctx.moveTo(x + TILE/2, y + 4); ctx.lineTo(x + 4, y + TILE - 4); ctx.lineTo(x + TILE - 4, y + TILE - 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffd166'; ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.fillText('商', x + TILE/2, y + TILE - 6);
      } else if (t === 'D') {
        ctx.fillStyle = ((r + c) % 2 === 0) ? '#16331f' : '#143019'; ctx.fillRect(x, y, TILE, TILE);
        if (!djinniCollected) {
          const yy = y + TILE/2 + Math.sin(performance.now()/300) * 3;
          ctx.save(); ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 16; ctx.fillStyle = '#ffd166';
          ctx.beginPath();
          for (let i = 0; i < 5; i++) { const a = -Math.PI/2 + i*(Math.PI*2/5), a2 = a + Math.PI/5; ctx.lineTo(x+TILE/2+Math.cos(a)*9, yy+Math.sin(a)*9); ctx.lineTo(x+TILE/2+Math.cos(a2)*4, yy+Math.sin(a2)*4); }
          ctx.closePath(); ctx.fill(); ctx.restore();
        }
      } else if (t === 'B') {
        ctx.fillStyle = '#2a0e0e'; ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#ff5d5d'; ctx.beginPath(); ctx.arc(x+TILE/2, y+TILE/2, 10, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffd166'; ctx.fillRect(x+TILE/2-8, y+TILE/2-2, 16, 4);
      }
    }
  }
  drawHero(hero.x, hero.y, hero.facing, '#5ad1ff', '#ef4444');
  ctx.textAlign = 'left'; ctx.font = '13px monospace'; ctx.fillStyle = '#ffd166';
  ctx.fillText('金币 ' + gold + '   最高 ' + hiscore, 10, 22);
  ctx.fillStyle = '#ece6ff';
  ctx.fillText('罗宾 Lv' + party[0].level + '  杰拉德 Lv' + party[1].level, 10, 40);
  const barW = 120, barH = 5;
  for (let i = 0; i < 2; i++) {
    const p = party[i], need = p.level * CFG.EXP_BASE, ratio = p.exp / need;
    const bx = 10 + i * 130, by = 48;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = '#c084fc'; ctx.fillRect(bx, by, barW * clamp(ratio, 0, 1), barH);
    ctx.strokeStyle = '#fff3'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, barW, barH);
  }
  ctx.fillStyle = '#9fb8ff'; ctx.font = '11px monospace';
  ctx.fillText('C 角色菜单 | 商人在南营地 | → 右行收精灵 / 挑战头目', 10, H - 14);

  drawDjinnIcon();
  drawMiniMap();
}

function drawDjinnIcon() {
  const cx = W - 26, cy = 22, x = W - 38, y = 10;
  ctx.save();
  ctx.translate(cx, cy);
  if (djinniCollected) {
    ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 12; ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI/2 + i*(Math.PI*2/5), a2 = a + Math.PI/5;
      ctx.lineTo(Math.cos(a)*9, Math.sin(a)*9);
      ctx.lineTo(Math.cos(a2)*4, Math.sin(a2)*4);
    }
    ctx.closePath(); ctx.fill();
  } else {
    ctx.strokeStyle = '#6b6390'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI/2 + i*(Math.PI*2/5), a2 = a + Math.PI/5;
      ctx.lineTo(Math.cos(a)*9, Math.sin(a)*9); ctx.lineTo(Math.cos(a2)*4, Math.sin(a2)*4);
    }
    ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
  ctx.textAlign = 'right'; ctx.fillStyle = djinniCollected ? '#ffd166' : '#6b6390'; ctx.font = '10px monospace';
  ctx.fillText(djinniCollected ? '索尔' : '未收服', x + 10, y + 38);
}

function drawMiniMap() {
  const scale = 0.18;
  const mw = COLS * TILE * scale, mh = ROWS * TILE * scale;
  const mx = W - mw - 8, my = 42;
  ctx.fillStyle = 'rgba(6,4,13,.75)'; ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 8);
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1; ctx.strokeRect(mx - 4, my - 4, mw + 8, mh + 8);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = map[r][c];
      const x = mx + c * TILE * scale, y = my + r * TILE * scale, s = TILE * scale;
      if (t === '#') { ctx.fillStyle = '#2f4a2c'; ctx.fillRect(x, y, s, s); }
      else if (t === 'M') { ctx.fillStyle = '#8b5cf6'; ctx.fillRect(x, y, s + 1, s + 1); }
      else if (t === 'N') { ctx.fillStyle = '#c084fc'; ctx.fillRect(x, y, s + 1, s + 1); }
      else if (t === 'D' && !djinniCollected) { ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(x + s/2, y + s/2, 3, 0, 7); ctx.fill(); }
      else if (t === 'B') { ctx.fillStyle = '#ff5d5d'; ctx.fillRect(x, y, s + 1, s + 1); }
    }
  }
  const px = mx + (hero.x / TILE) * TILE * scale;
  const py = my + (hero.y / TILE) * TILE * scale;
  ctx.fillStyle = '#5ad1ff'; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
}

/* ------------------------------- 绘制：战斗 ------------------------------- */
function renderBattle() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1a1336'); g.addColorStop(1, '#0a0712');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.arc(W/2, 90, 70, 0, 7); ctx.fill(); ctx.restore();

  for (const e of battle.enemies) {
    if (e.hp <= 0) continue;
    const p = battleUnitPos(e);
    drawEnemySprite(e, p.x, p.y);
    ctx.textAlign = 'center'; ctx.font = '12px monospace'; ctx.fillStyle = '#ece6ff';
    ctx.fillText(e.name, p.x, p.y + 30);
    bar(p.x - 28, p.y + 36, 56, 6, e.hp / e.maxhp, '#ff6b6b');
  }
  for (const m of battle.party) {
    if (m.hp <= 0) continue;
    const p = battleUnitPos(m);
    drawHero(p.x, p.y, 1, m.color, m.cape);
    ctx.textAlign = 'center'; ctx.font = '12px monospace'; ctx.fillStyle = '#ece6ff';
    ctx.fillText(m.name + ' Lv' + m.level, p.x, p.y + 26);
    bar(p.x - 30, p.y + 32, 60, 6, m.hp / getMaxHp(m), '#7CFC9B');
    ctx.fillStyle = '#5ad1ff'; ctx.fillRect(p.x - 30, p.y + 40, 60 * (m.mp / getMaxMp(m)), 4);
    if (m.defending) { ctx.fillStyle = '#ffd166'; ctx.fillText('🛡', p.x + 34, p.y); }
    if (battle.active === m && battle.awaiting) { ctx.fillStyle = '#ffd166'; ctx.font = '16px monospace'; ctx.fillText('▶', p.x - 44, p.y + 4); }
  }
  for (const f of battle.floaters) { ctx.globalAlpha = Math.max(0, f.life); ctx.fillStyle = f.color; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center'; ctx.fillText(f.text, f.x, f.y); }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.font = '14px monospace'; ctx.fillStyle = '#ffd166';
  ctx.fillText(battle.log, W/2, 40);
  if (battle.awaiting && battle.active) drawBattleMenu();
}
function drawBattleMenu() {
  const m = battle.menu;
  const opts = battle.options.length ? battle.options : battleRootOptions();
  const bx = 30, by = 380, bw = 200, bh = 30, gap = 4;
  ctx.fillStyle = 'rgba(10,7,18,.9)'; ctx.fillRect(bx - 8, by - 28, 250, opts.length * (bh + gap) + 36);
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left';
  ctx.fillText('指令 (' + battle.active.name + ')', bx, by - 12);
  opts.forEach((o, i) => {
    const y = by + i * (bh + gap);
    ctx.fillStyle = i === battle.menuIndex ? 'rgba(255,209,102,.25)' : 'transparent';
    ctx.fillRect(bx, y, bw, bh);
    ctx.fillStyle = i === battle.menuIndex ? '#ffd166' : '#cfc6ee';
    ctx.font = '14px monospace';
    ctx.fillText((i === battle.menuIndex ? '▶ ' : '  ') + o, bx + 6, y + 20);
  });
  if (m === 'psy') { ctx.fillStyle = '#9fb8ff'; ctx.font = '11px monospace'; ctx.fillText('Esc 返回', bx + bw + 16, by + 20); }
  else { ctx.fillStyle = '#9fb8ff'; ctx.font = '11px monospace'; ctx.fillText('精神力/精灵消耗MP·精灵', bx + bw + 16, by + 20); }
}
function battleMenuHit(px, py) {
  if (!battle || !battle.awaiting) return;
  const opts = battle.options.length ? battle.options : battleRootOptions();
  const bx = 30, by = 380, bw = 200, bh = 30, gap = 4;
  for (let i = 0; i < opts.length; i++) {
    const y = by + i * (bh + gap);
    if (px >= bx && px <= bx + bw && py >= y && py <= y + bh) { battle.menuIndex = i; confirmMenu(); return; }
  }
}

/* ------------------------------- 绘制：覆盖层 ------------------------------- */
function drawOverlay(title, lines, sub, color) {
  ctx.fillStyle = 'rgba(6,4,13,.85)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = color || '#ffd166'; ctx.font = 'bold 40px monospace';
  ctx.fillText(title, W/2, H/2 - 70);
  ctx.fillStyle = '#ece6ff'; ctx.font = '15px monospace';
  lines.forEach((l, i) => ctx.fillText(l, W/2, H/2 - 20 + i * 26));
  if (sub) { ctx.fillStyle = '#ffd166'; ctx.font = 'bold 18px monospace'; ctx.fillText(sub, W/2, H/2 + 110); }
}
function drawTitle() {
  ctx.fillStyle = 'rgba(6,4,13,.85)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 44px monospace';
  ctx.fillText('黄金太阳', W/2, H/2 - 90);
  ctx.fillStyle = '#ece6ff'; ctx.font = '16px monospace';
  ctx.fillText('封印篇 · 复刻纵切片', W/2, H/2 - 50);
  ctx.font = '14px monospace';
  ctx.fillText('回合制元素战斗 + 精神力 + 精灵召唤 + 装备商店', W/2, H/2 - 20);
  const canContinue = hasSave();
  const opts = canContinue ? ['▶ 继续冒险', '  重新开始'] : ['  开始冒险'];
  const startY = H/2 + 30;
  opts.forEach((o, i) => {
    const selected = (i === titleChoice);
    ctx.fillStyle = selected ? 'rgba(255,209,102,.2)' : 'transparent';
    ctx.fillRect(W/2 - 110, startY + i * 44 - 24, 220, 38);
    ctx.fillStyle = selected ? '#ffd166' : '#9fb8ff';
    ctx.font = selected ? 'bold 18px monospace' : '16px monospace';
    ctx.fillText(o, W/2, startY + i * 44 + 4);
  });
  ctx.fillStyle = '#6b6390'; ctx.font = '12px monospace';
  ctx.fillText('↑/↓ 选择  ·  A/回车 确认', W/2, H/2 + 160);
  if (canContinue) {
    ctx.fillStyle = '#7CFC9B'; ctx.font = '11px monospace';
    ctx.fillText('已有存档：关闭页面后回来可从这继续', W/2, H/2 + 180);
  }
}
function renderDialog() {
  renderOverworld();
  const d = dialog;
  const boxH = 110, by = H - boxH - 10;
  ctx.fillStyle = 'rgba(10,7,18,.92)'; ctx.fillRect(20, by, W - 40, boxH);
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.strokeRect(20, by, W - 40, boxH);
  ctx.textAlign = 'left'; ctx.fillStyle = '#ece6ff'; ctx.font = '15px monospace';
  const line = d.lines[d.idx];
  ctx.fillText(line, 40, by + 36);
  ctx.fillStyle = '#ffd166'; ctx.font = '12px monospace'; ctx.textAlign = 'right';
  ctx.fillText((d.idx < d.lines.length - 1 ? 'A/回车 继续 ▶' : 'A/回车 关闭'), W - 40, by + boxH - 14);
}

function drawCharMenu() {
  const p = party[charMenu.index];
  const boxW = 420, boxH = 280, bx = (W - boxW) / 2, by = (H - boxH) / 2;
  ctx.fillStyle = 'rgba(10,7,18,.94)'; ctx.fillRect(bx, by, boxW, boxH);
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, boxW, boxH);
  ctx.textAlign = 'left'; ctx.fillStyle = '#ffd166'; ctx.font = 'bold 18px monospace';
  ctx.fillText(p.name + '  Lv' + p.level + '  [' + p.el + ']', bx + 20, by + 32);
  const need = p.level * CFG.EXP_BASE;
  ctx.fillStyle = '#ece6ff'; ctx.font = '12px monospace';
  ctx.fillText('EXP ' + p.exp + ' / ' + need, bx + 20, by + 52);
  bar(bx + 20, by + 58, 200, 8, p.exp / need, '#c084fc');
  ctx.fillStyle = '#ece6ff'; ctx.font = '13px monospace';
  const rows = [
    'HP  ' + p.hp + '/' + getMaxHp(p),
    'MP  ' + p.mp + '/' + getMaxMp(p),
    '攻击  ' + p.atk + (p.bonusAtk ? ' + ' + p.bonusAtk : ''),
    '防御  ' + p.def + (p.bonusDef ? ' + ' + p.bonusDef : ''),
    '速度  ' + p.spd,
  ];
  rows.forEach((r, i) => { ctx.fillText(r, bx + 20, by + 96 + i * 22); });
  ctx.fillStyle = '#ffd166'; ctx.fillText('装备', bx + 220, by + 96);
  ctx.fillStyle = '#cfc6ee'; ctx.font = '12px monospace';
  ctx.fillText('武器: ' + (p.equipment.weapon ? p.equipment.weapon.name + ' 攻+' + p.equipment.weapon.atk : '无'), bx + 220, by + 118);
  ctx.fillText('防具: ' + (p.equipment.armor ? p.equipment.armor.name + ' 防+' + p.equipment.armor.def : '无'), bx + 220, by + 140);
  ctx.fillStyle = '#ffd166'; ctx.font = '13px monospace'; ctx.fillText('精神力', bx + 20, by + 210);
  ctx.fillStyle = '#9fb8ff'; ctx.font = '12px monospace';
  p.spells.forEach((s, i) => {
    ctx.fillText('• ' + s.name + ' (' + s.cost + 'MP) ' + (s.heal ? '回复' : s.el + '攻击'), bx + 20, by + 232 + i * 18);
  });
  ctx.fillStyle = '#ffd166'; ctx.font = '13px monospace'; ctx.textAlign = 'left';
  ctx.fillText('精灵·索尔', bx + 20, by + 248);
  ctx.fillStyle = djinniCollected ? '#7CFC9B' : '#6b6390'; ctx.font = '12px monospace';
  ctx.fillText(djinniCollected ? '状态：已收服（战斗中可召唤青龙）' : '状态：未收服（大地图东侧发光处）', bx + 20, by + 268);
  ctx.fillStyle = '#ffd166'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
  ctx.fillText('←/→ 切换队员  ·  S 保存  ·  L 读取  ·  A/回车/Esc 关闭', W/2, by + boxH - 16);
}

function drawShop() {
  const boxW = 520, boxH = 340, bx = (W - boxW) / 2, by = (H - boxH) / 2;
  ctx.fillStyle = 'rgba(10,7,18,.94)'; ctx.fillRect(bx, by, boxW, boxH);
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, boxW, boxH);
  ctx.textAlign = 'left'; ctx.fillStyle = '#ffd166'; ctx.font = 'bold 18px monospace';
  ctx.fillText('商人营地', bx + 16, by + 32);
  ctx.fillStyle = '#ece6ff'; ctx.font = '13px monospace';
  ctx.fillText('持有金币: ' + gold + ' G', bx + 16, by + 56);
  const rowH = 34, startY = by + 78;
  for (let i = 0; i < SHOP.length; i++) {
    const item = SHOP[i], y = startY + i * rowH;
    ctx.fillStyle = (i === shop.index) ? 'rgba(255,209,102,.2)' : 'transparent';
    ctx.fillRect(bx + 12, y, boxW - 24, rowH - 4);
    ctx.fillStyle = (i === shop.index) ? '#ffd166' : '#ece6ff';
    ctx.font = '14px monospace';
    ctx.fillText((i === shop.index ? '▶ ' : '  ') + item.name, bx + 20, y + 20);
    ctx.fillStyle = '#9fb8ff'; ctx.font = '12px monospace';
    ctx.fillText(item.price + ' G', bx + 220, y + 20);
    ctx.fillStyle = '#cfc6ee'; ctx.font = '11px monospace';
    ctx.fillText(item.desc, bx + 300, y + 20);
  }
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(bx + 12, by + boxH - 58, boxW - 24, 42);
  ctx.fillStyle = '#ffd166'; ctx.font = '13px monospace';
  ctx.fillText(shop.message, bx + 20, by + boxH - 34);
  ctx.fillStyle = '#9fb8ff'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('↑/↓ 选择  ·  A/回车 购买  ·  Esc 离开', W/2, by + boxH - 12);
}
function shopPointerHit(px, py) {
  if (!shop) return;
  const boxW = 520, boxH = 340, bx = (W - boxW) / 2, by = (H - boxH) / 2;
  const rowH = 34, startY = by + 78;
  for (let i = 0; i < SHOP.length; i++) {
    const y = startY + i * rowH;
    if (px >= bx + 12 && px <= bx + boxW - 12 && py >= y && py <= y + rowH - 4) { shop.index = i; buyShopItem(i); return; }
  }
  if (px < bx || px > bx + boxW || py < by || py > by + boxH) closeShop();
}

/* ------------------------------- 渲染分发 ------------------------------- */
function render() {
  ctx.clearRect(0, 0, W, H);
  if (gameState === 'MENU') drawTitle();
  else if (gameState === 'OVERWORLD') renderOverworld();
  else if (gameState === 'BATTLE') renderBattle();
  else if (gameState === 'DIALOG') renderDialog();
  else if (gameState === 'CHAR') { renderOverworld(); drawCharMenu(); }
  else if (gameState === 'SHOP') { renderOverworld(); drawShop(); }
  if (charToast) {
    ctx.fillStyle = 'rgba(10,7,18,.9)'; ctx.fillRect(W/2 - 80, H - 80, 160, 28);
    ctx.strokeStyle = '#7CFC9B'; ctx.strokeRect(W/2 - 80, H - 80, 160, 28);
    ctx.textAlign = 'center'; ctx.fillStyle = '#7CFC9B'; ctx.font = '13px monospace';
    ctx.fillText(charToast.text, W/2, H - 62);
  }
  else if (gameState === 'WIN') drawOverlay('封印重铸！', ['萨丢罗斯 败北，黄金太阳再现光芒。', '金币 ' + gold + ' · 最高 ' + hiscore], 'A / 回车 再启征程', '#ffd166');
  else if (gameState === 'GAMEOVER') drawOverlay('冒险终结', ['金币 ' + gold + ' · 最高 ' + hiscore], 'A / 回车 重新出发', '#ff5d5d');
}

/* ------------------------------- 主循环 ------------------------------- */
function update(dt) {
  if (battle && battle.flash > 0) battle.flash = Math.max(0, battle.flash - 40 * dt);
  if (battle) for (const f of battle.floaters) { f.y -= 24 * dt; f.life -= dt * 1.1; }
  if (battle) battle.floaters = battle.floaters.filter((f) => f.life > 0);
  if (charToast) { charToast.life -= dt; if (charToast.life <= 0) charToast = null; }
  if (gameState === 'OVERWORLD') updateOverworld(dt);
}
let last = performance.now();
function frame(now) {
  let dt = (now - last) / 1000; last = now;
  if (dt > 0.25) dt = 0.25;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

/* ------------------------------- 输入 ------------------------------- */
const PREVENT = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space']);
window.addEventListener('keydown', (e) => {
  if (PREVENT.has(e.code)) e.preventDefault();
  down.add(e.code);
  const a = BINDS.a.some((c) => e.code === c);
  const back = BINDS.back.some((c) => e.code === c);
  const menu = BINDS.menu.some((c) => e.code === c);
  if (gameState === 'MENU') {
    if (e.code === 'ArrowUp') { titleChoice = Math.max(0, titleChoice - 1); sCursor(); }
    else if (e.code === 'ArrowDown') { titleChoice = Math.min(hasSave() ? 1 : 0, titleChoice + 1); sCursor(); }
    else if (a) startGame();
    return;
  }
  if (gameState === 'WIN' || gameState === 'GAMEOVER') { if (a) { eraseSave(); newGame(); } return; }
  if (gameState === 'DIALOG') { if (a) { if (dialog.idx < dialog.lines.length - 1) dialog.idx++; else { dialog = null; gameState = 'OVERWORLD'; } } return; }
  if (gameState === 'OVERWORLD' && menu) { openCharMenu(); return; }
  if (gameState === 'CHAR') {
    if (e.code === 'ArrowLeft') navChar(-1);
    else if (e.code === 'ArrowRight') navChar(1);
    else if (e.code === 'KeyS') { if (saveGame()) { pushCharToast('进度已保存！'); sSelect(); } }
    else if (e.code === 'KeyL') { if (loadGame()) { closeCharMenu(); pushCharToast('进度已读取！'); sSelect(); } else pushCharToast('没有存档！'); }
    else if (a || back) closeCharMenu();
    return;
  }
  if (gameState === 'SHOP') {
    if (e.code === 'ArrowUp') navShop(-1);
    else if (e.code === 'ArrowDown') navShop(1);
    else if (a) buyShopItem(shop.index);
    else if (back) closeShop();
    return;
  }
  if (gameState === 'BATTLE' && battle && battle.awaiting) {
    if (e.code === 'ArrowUp') navMenu(-1);
    else if (e.code === 'ArrowDown') navMenu(1);
    else if (a) confirmMenu();
    else if (back) backMenu();
  }
});
window.addEventListener('keyup', (e) => down.delete(e.code));
window.addEventListener('blur', () => down.clear());

cvs.addEventListener('pointerdown', (e) => {
  RetroGameAudio.getAudioContext();
  const rect = cvs.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (W / rect.width);
  const py = (e.clientY - rect.top) * (H / rect.height);
  if (gameState === 'MENU') {
    const canContinue = hasSave();
    const startY = H/2 + 30;
    const idx = Math.floor((py - (startY - 24)) / 44);
    if (idx >= 0 && idx <= (canContinue ? 1 : 0)) { titleChoice = idx; startGame(); }
    return;
  }
  if (gameState === 'WIN' || gameState === 'GAMEOVER') { eraseSave(); newGame(); return; }
  if (gameState === 'DIALOG') { if (dialog.idx < dialog.lines.length - 1) dialog.idx++; else { dialog = null; gameState = 'OVERWORLD'; } return; }
  if (gameState === 'BATTLE' && battle && battle.awaiting) battleMenuHit(px, py);
  if (gameState === 'SHOP') shopPointerHit(px, py);
  if (gameState === 'CHAR') closeCharMenu();
});

function bindTouch(id, action) {
  const el = document.getElementById(id);
  const on = (e) => { e.preventDefault(); RetroGameAudio.getAudioContext();
    if (action === 'a') {
      if (gameState === 'MENU') startGame();
      else if (gameState === 'WIN' || gameState === 'GAMEOVER') { eraseSave(); newGame(); }
      else if (gameState === 'DIALOG') { if (dialog.idx < dialog.lines.length - 1) dialog.idx++; else { dialog = null; gameState = 'OVERWORLD'; } }
      else if (gameState === 'BATTLE' && battle && battle.awaiting) confirmMenu();
      else if (gameState === 'SHOP') buyShopItem(shop.index);
      else if (gameState === 'CHAR') closeCharMenu();
      touch.a = true; return;
    }
    if (action === 'menu') {
      if (gameState === 'OVERWORLD') openCharMenu();
      touch.menu = true; return;
    }
    touch[action] = true;
  };
  const off = (e) => { e.preventDefault(); touch[action] = false; };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointerleave', off);
  el.addEventListener('pointercancel', off);
}
bindTouch('tLeft', 'left'); bindTouch('tRight', 'right'); bindTouch('tUp', 'up'); bindTouch('tDown', 'down'); bindTouch('tA', 'a'); bindTouch('tMenu', 'menu');

syncChrome();
requestAnimationFrame(frame);
