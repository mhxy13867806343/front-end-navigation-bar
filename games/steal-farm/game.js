/* =======================================================================
 * 偷菜农场 (Steal Farm) — 纯 HTML5 + 原生 JS 单机 H5 原型
 * 实现严格遵循主理人锁定的设计规格（数值、邻居名、概率、防盗花费等）。
 * 作物/经济/邻居/偷菜/防盗/存档 全部按锁定规格，未改任何数值。
 * ======================================================================= */
(function () {
  'use strict';

  /* ---------- 锁定规格常量 ---------- */
  var SAVE_KEY        = 'stealfarm_save_v1';
  var START_GOLD      = 100;
  var BASE_STEAL_PROB = 0.25;   // 邻居偷玩家的每次判定基础概率
  var EVENT_CHANCE    = 0.01;   // 每块地每 tick 触发杂草/虫害的小概率
  var GROW_TICK_MS    = 1000;   // 成长推进
  var SIM_TICK_MS     = 4000;   // 邻居 AI 种植节奏
  var STEAL_TICK_MS   = 5000;   // 邻居来偷玩家的判定
  var DOG_COST        = 150;    // 买狗（永久，被盗概率 ×0.2）
  var FENCE_COST      = 200;    // 升级篱笆（永久，被盗概率再 ×0.5）
  var MAX_STEAL_CROP  = 2;      // 每块成熟作物最多被玩家偷 2 次
  var NEIGHBORS       = ['小明', '小红', '阿强'];

  var CROPS = {
    radish:     { name: '白萝卜', emoji: '🥕', seed: 10, grow: 30,  sell: 18,  yield: 3 },
    tomato:     { name: '番茄',   emoji: '🍅', seed: 25, grow: 120, sell: 45,  yield: 3 },
    strawberry: { name: '草莓',   emoji: '🍓', seed: 40, grow: 180, sell: 75,  yield: 3 },
    pumpkin:    { name: '南瓜',   emoji: '🎃', seed: 80, grow: 300, sell: 160, yield: 3 }
  };
  var CROP_KEYS = Object.keys(CROPS);

  /* ---------- 运行时状态 ---------- */
  var state = null;            // 完整存档对象
  var currentView = 'player';  // 'player' 或邻居下标 0..2
  var sheetContext = null;     // 当前弹层操作的 {view, index}

  /* ---------- 工具 ---------- */
  function now() { return Date.now(); }

  function emptyPlot() {
    return { state: 'EMPTY', crop: null, plantedAt: 0, event: null, stealable: 0, remaining: 0 };
  }

  function defaultSave() {
    return {
      version: 1,
      player: {
        plots: Array.from({ length: 9 }, emptyPlot),
        gold: START_GOLD,
        hasDog: false,
        hasFence: false
      },
      neighbors: NEIGHBORS.map(function (name) {
        return { name: name, plots: makeNeighborPlots() };
      }),
      savedAt: now()
    };
  }

  // 为某个邻居生成初始 9 格（部分已成熟，便于开局即可偷）
  function makeNeighborPlots() {
    var plots = [];
    for (var i = 0; i < 9; i++) plots.push(emptyPlot());
    var order = [0, 1, 2, 3, 4];
    order.forEach(function (idx, k) {
      var p = plots[idx];
      var key = CROP_KEYS[k % CROP_KEYS.length];
      var c = CROPS[key];
      p.crop = key;
      p.state = 'PLANTED';
      // 前 3 块直接设为已成熟；后 2 块处于生长中不同阶段
      p.plantedAt = now() - (k < 3 ? (c.grow + 5) : Math.random() * c.grow * 0.4) * 1000;
    });
    return plots;
  }

  // 归一化单块地，保证字段完整、合法
  function normalizePlot(p) {
    p = p || {};
    return {
      state: (p.state === 'PLANTED' || p.state === 'MATURE') ? p.state : 'EMPTY',
      crop: CROPS[p.crop] ? p.crop : null,
      plantedAt: Number(p.plantedAt) || 0,
      event: (p.event === 'WEED' || p.event === 'PEST') ? p.event : null,
      stealable: Number(p.stealable) || 0,
      remaining: Number(p.remaining) || 0
    };
  }

  // 兼容/修复存档结构，损坏则回退默认
  function normalize(s) {
    var out = defaultSave();
    if (s && s.player && Array.isArray(s.player.plots) && s.player.plots.length === 9 &&
        Array.isArray(s.neighbors) && s.neighbors.length === 3) {
      out.player.gold = Number(s.player.gold);
      if (!isFinite(out.player.gold)) out.player.gold = START_GOLD;
      out.player.hasDog = !!s.player.hasDog;
      out.player.hasFence = !!s.player.hasFence;
      out.player.plots = s.player.plots.map(normalizePlot);
      out.neighbors = s.neighbors.map(function (nb, i) {
        return {
          name: (nb && nb.name) ? nb.name : NEIGHBORS[i],
          plots: (nb && Array.isArray(nb.plots) && nb.plots.length === 9)
            ? nb.plots.map(normalizePlot)
            : makeNeighborPlots()
        };
      });
      out.savedAt = Number(s.savedAt) || now();
    }
    return out;
  }

  function save() {
    if (!state) return;
    state.savedAt = now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* 隐私模式忽略 */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  // 离线结算：PLANTED 且 elapsed>=grow 直接置 MATURE；事件离线不补算（简化）
  function applyOffline() {
    var t = now();
    state.player.plots.forEach(function (p) {
      if (p.state === 'PLANTED' && p.crop) {
        var c = CROPS[p.crop];
        if ((t - p.plantedAt) / 1000 >= c.grow) {
          p.state = 'MATURE';
          p.remaining = c.yield;
        }
      }
    });
    state.neighbors.forEach(function (nb) {
      nb.plots.forEach(function (p) {
        if (p.state === 'PLANTED' && p.crop) {
          var c = CROPS[p.crop];
          if ((t - p.plantedAt) / 1000 >= c.grow) {
            p.state = 'MATURE';
            p.stealable = MAX_STEAL_CROP;
          }
        }
      });
    });
  }

  /* ---------- 核心玩法逻辑 ---------- */
  function plant(index, key) {
    var p = state.player.plots[index];
    var c = CROPS[key];
    if (!p || p.state !== 'EMPTY' || !c) return;
    if (state.player.gold < c.seed) { showToast('金币不足'); return; }
    state.player.gold -= c.seed;
    p.crop = key;
    p.state = 'PLANTED';
    p.plantedAt = now();
    p.event = null;
    p.remaining = 0;
    p.stealable = 0;
    save();
    render();
  }

  function harvest(index) {
    var p = state.player.plots[index];
    if (!p || p.state !== 'MATURE' || !p.crop) return;
    var c = CROPS[p.crop];
    var gained = 0;
    if (p.remaining > 0) {
      var y = p.remaining - (p.event ? 1 : 0); // 未除害则 -1
      if (y < 1) y = 1;                        // 事件减产最低 1
      gained = y * c.sell;
    }
    state.player.gold += gained;
    var lostAll = (gained === 0);
    Object.assign(p, emptyPlot());
    save();
    render();
    if (gained > 0) { showToast('收获 ' + c.name + ' +' + gained + '💰'); vibrate(30); }
    else { showToast(lostAll ? '作物被偷光了，无收获' : '收获 ' + c.name + ' +' + gained + '💰'); }
  }

  function clearEvent(index) {
    var p = state.player.plots[index];
    if (p && p.event) {
      var en = p.event === 'WEED' ? '杂草' : '虫害';
      p.event = null;
      save();
      render();
      showToast('已清除' + en);
    }
  }

  // 玩家偷邻居：每次偷 1 份，得该作物 sell 金币，邻居该地块剩余可偷 -1
  function stealFromNeighbor(view, index) {
    var nb = state.neighbors[view];
    if (!nb) return;
    var p = nb.plots[index];
    if (!p || p.state !== 'MATURE' || !p.crop || p.stealable <= 0) return;
    var c = CROPS[p.crop];
    state.player.gold += c.sell;
    p.stealable -= 1;
    save();
    render();
    showToast('偷了 ' + nb.name + ' 的' + c.name + ' +' + c.sell + '💰');
    vibrate(30);
  }

  function buyDog() {
    if (state.player.hasDog) return;
    if (state.player.gold < DOG_COST) { showToast('金币不足'); return; }
    state.player.gold -= DOG_COST;
    state.player.hasDog = true;
    save();
    render();
    showToast('已养狗 🐶 被盗概率 ×0.2');
  }

  function buyFence() {
    if (state.player.hasFence) return;
    if (state.player.gold < FENCE_COST) { showToast('金币不足'); return; }
    state.player.gold -= FENCE_COST;
    state.player.hasFence = true;
    save();
    render();
    showToast('已升级篱笆 🚧 被盗概率再 ×0.5');
  }

  function resetGame() {
    if (typeof confirm === 'function' && !confirm('确定重置游戏？所有进度将清空。')) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    state = defaultSave();
    currentView = 'player';
    save();
    render();
    closeOverlay();
    showToast('游戏已重置');
  }

  /* ---------- 定时器（tick） ---------- */
  function growthTick() {
    var t = now();
    var changed = false;
    state.player.plots.forEach(function (p) {
      if (p.state === 'PLANTED' && p.crop) {
        var c = CROPS[p.crop];
        var elapsed = (t - p.plantedAt) / 1000;
        if (elapsed >= c.grow) {
          p.state = 'MATURE';
          p.remaining = c.yield;
          changed = true;
        } else if (!p.event && Math.random() < EVENT_CHANCE) {
          p.event = Math.random() < 0.5 ? 'WEED' : 'PEST';
          changed = true;
        }
      }
    });
    state.neighbors.forEach(function (nb) {
      nb.plots.forEach(function (p) {
        if (p.state === 'PLANTED' && p.crop) {
          var c = CROPS[p.crop];
          if ((t - p.plantedAt) / 1000 >= c.grow) {
            p.state = 'MATURE';
            p.stealable = MAX_STEAL_CROP;
            changed = true;
          }
        }
      });
    });
    render();
    if (changed) save();
  }

  // 邻居 AI：空地按概率播种；被偷光（stealable<=0）的成熟地按概率清空以补种
  function neighborSimTick() {
    state.neighbors.forEach(function (nb) {
      nb.plots.forEach(function (p) {
        if (p.state === 'EMPTY') {
          if (Math.random() < 0.3) {
            var key = CROP_KEYS[Math.floor(Math.random() * CROP_KEYS.length)];
            p.crop = key;
            p.state = 'PLANTED';
            p.plantedAt = now();
            p.event = null;
            p.stealable = 0;
            p.remaining = 0;
          }
        } else if (p.state === 'MATURE' && p.stealable <= 0) {
          if (Math.random() < 0.2) Object.assign(p, emptyPlot());
        }
      });
    });
    render();
    save();
  }

  // 邻居来偷玩家：每 5 秒对每个邻居按有效概率偷 1 份（玩家损失，不提示来源）
  function neighborStealTick() {
    var prob = BASE_STEAL_PROB;
    if (state.player.hasDog) prob *= 0.2;
    if (state.player.hasFence) prob *= 0.5;
    var changed = false;
    state.neighbors.forEach(function () {
      if (Math.random() < prob) {
        var cands = state.player.plots.filter(function (p) {
          return p.state === 'MATURE' && p.remaining > 0;
        });
        if (cands.length) {
          var p = cands[Math.floor(Math.random() * cands.length)];
          if (p.remaining > 0) { p.remaining -= 1; changed = true; }
        }
      }
    });
    if (changed) { render(); save(); }
  }

  /* ---------- UI 渲染 ---------- */
  function $(id) { return document.getElementById(id); }

  function progressLeft(p) {
    var c = CROPS[p.crop];
    return Math.max(0, Math.ceil(c.grow - (now() - p.plantedAt) / 1000));
  }

  function estimateHarvest(p) {
    if (p.remaining <= 0) return 0;
    var y = p.remaining - (p.event ? 1 : 0);
    if (y < 1) y = 1;
    return y * CROPS[p.crop].sell;
  }

  function render() {
    if (!state) return;
    var pl = state.player;
    var viewName = currentView === 'player' ? '我的农场' : ('邻居：' + state.neighbors[currentView].name);

    var top = '';
    top += '<div class="stat">💰 ' + pl.gold + '</div>';
    top += '<div class="view">' + viewName + '</div>';
    top += '<div class="actions">';
    if (currentView === 'player') {
      top += '<button data-action="goNeighbor">🚶去邻居</button>';
      top += '<button data-action="shop">🛒商店</button>';
    } else {
      top += '<button data-action="backHome">🏠回自家</button>';
    }
    top += '<button data-action="reset">♻️重置</button>';
    top += '</div>';
    $('topbar').innerHTML = top;

    var plots = currentView === 'player' ? pl.plots : state.neighbors[currentView].plots;
    var isPlayer = currentView === 'player';
    var grid = '';
    plots.forEach(function (p, i) { grid += plotCell(p, isPlayer, i); });
    $('grid').innerHTML = grid;
  }

  function plotCell(p, isPlayer, i) {
    var cls = 'plot';
    var inner = '';
    if (!p.crop || p.state === 'EMPTY') {
      cls += ' empty';
      inner = '<div class="cell-emoji">⬜</div><div class="cell-label">空地</div>';
    } else if (p.state === 'PLANTED') {
      cls += ' planted';
      inner = '<div class="cell-emoji">' + CROPS[p.crop].emoji + '</div>' +
              '<div class="cell-label">' + progressLeft(p) + 's</div>';
      if (p.event) inner += '<div class="cell-event">⚠</div>';
    } else if (p.state === 'MATURE') {
      cls += ' mature';
      var badge = isPlayer ? ('剩' + p.remaining) : ('偷' + p.stealable);
      inner = '<div class="cell-emoji">' + CROPS[p.crop].emoji + '</div>' +
              '<div class="cell-check">✓</div>' +
              '<div class="cell-badge">' + badge + '</div>';
      if (p.event) inner += '<div class="cell-event">⚠</div>';
    }
    return '<div class="' + cls + '" data-index="' + i + '">' + inner + '</div>';
  }

  /* ---------- 弹层（操作菜单 / 邻居选择 / 商店） ---------- */
  function showOverlay(html) {
    $('sheet').innerHTML = html;
    $('overlay').classList.remove('hidden');
  }
  function closeOverlay() {
    $('overlay').classList.add('hidden');
    sheetContext = null;
  }

  function openSheet(index) {
    var view = currentView;
    var isPlayer = view === 'player';
    var plots = isPlayer ? state.player.plots : state.neighbors[view].plots;
    var p = plots[index];
    sheetContext = { view: view, index: index };
    var html = '';

    if (isPlayer) {
      if (p.state === 'EMPTY') {
        html += '<div class="sheet-title">选择种子播种</div><div class="sheet-list">';
        CROP_KEYS.forEach(function (k) {
          var c = CROPS[k];
          var dis = state.player.gold < c.seed ? 'disabled' : '';
          html += '<button class="crop-btn" data-action="plant" data-crop="' + k + '" ' + dis + '>' +
                    '<span>' + c.emoji + ' ' + c.name + '</span>' +
                    '<span>🌱' + c.seed + '💰 · ' + c.grow + 's · 售' + c.sell + '</span></button>';
        });
        html += '</div>';
      } else if (p.state === 'PLANTED') {
        var c = CROPS[p.crop];
        html += '<div class="sheet-title">' + c.emoji + ' ' + c.name + '</div>';
        html += '<div class="sheet-info">生长中，约 ' + progressLeft(p) + 's 后成熟</div>';
        if (p.event) {
          var en = p.event === 'WEED' ? '杂草' : '虫害';
          html += '<div class="sheet-warn">⚠ 有' + en + '，将减产！</div>';
          html += '<button class="act-btn warn" data-action="clear">清除⚠（免费）</button>';
        }
      } else if (p.state === 'MATURE') {
        var cm = CROPS[p.crop];
        var en2 = p.event ? ('（有' + (p.event === 'WEED' ? '杂草' : '虫害') + '，-1）') : '';
        html += '<div class="sheet-title">' + cm.emoji + ' ' + cm.name + ' 已成熟</div>';
        html += '<div class="sheet-info">可收获 ' + p.remaining + ' 份' + en2 + '</div>';
        html += '<button class="act-btn ok" data-action="harvest">收获 ✓（+' + estimateHarvest(p) + '💰）</button>';
      }
    } else {
      var nb = state.neighbors[view];
      if (p.state === 'EMPTY') {
        html += '<div class="sheet-title">' + nb.name + ' 的农场</div><div class="sheet-info">空地，无法操作</div>';
      } else if (p.state === 'PLANTED') {
        var cn = CROPS[p.crop];
        html += '<div class="sheet-title">' + nb.name + '：' + cn.emoji + cn.name + '</div>';
        html += '<div class="sheet-info">生长中，约 ' + progressLeft(p) + 's</div>';
      } else if (p.state === 'MATURE') {
        var cm2 = CROPS[p.crop];
        if (p.stealable > 0) {
          html += '<div class="sheet-title">' + nb.name + '：' + cm2.emoji + cm2.name + '</div>';
          html += '<div class="sheet-info">可偷 ' + p.stealable + ' 次</div>';
          html += '<button class="act-btn steal" data-action="steal">偷走 🥷（+' + cm2.sell + '💰）</button>';
        } else {
          html += '<div class="sheet-title">' + nb.name + '：' + cm2.emoji + cm2.name + '</div>';
          html += '<div class="sheet-info">已被偷光</div>';
        }
      }
    }
    html += '<button class="act-btn close" data-action="close">取消</button>';
    showOverlay(html);
  }

  function openChooser() {
    var html = '<div class="sheet-title">去哪个邻居？</div><div class="sheet-list">';
    state.neighbors.forEach(function (nb, i) {
      var m = nb.plots.filter(function (p) { return p.state === 'MATURE' && p.stealable > 0; }).length;
      html += '<button class="crop-btn" data-action="choose" data-i="' + i + '">' +
                '<span>🏡 ' + nb.name + '</span>' +
                '<span>可偷成熟地 ' + m + '</span></button>';
    });
    html += '</div><button class="act-btn close" data-action="close">取消</button>';
    showOverlay(html);
  }

  function openShop() {
    var pl = state.player;
    var dogDis = (pl.hasDog || pl.gold < DOG_COST) ? 'disabled' : '';
    var fenceDis = (pl.hasFence || pl.gold < FENCE_COST) ? 'disabled' : '';
    var html = '<div class="sheet-title">🛒 防盗商店</div><div class="sheet-list">';
    html += '<button class="crop-btn" data-action="buyDog" ' + dogDis + '>' +
              '<span>🐶 买狗' + (pl.hasDog ? '（已拥有）' : '') + '</span>' +
              '<span>' + (pl.hasDog ? '✔' : '150💰 · 被盗×0.2') + '</span></button>';
    html += '<button class="crop-btn" data-action="buyFence" ' + fenceDis + '>' +
              '<span>🚧 升级篱笆' + (pl.hasFence ? '（已拥有）' : '') + '</span>' +
              '<span>' + (pl.hasFence ? '✔' : '200💰 · 再×0.5') + '</span></button>';
    html += '</div><button class="act-btn close" data-action="close">关闭</button>';
    showOverlay(html);
  }

  function showToast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 1600);
  }

  function vibrate(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
  }

  /* ---------- 事件绑定（委托，避免每次渲染重绑） ---------- */
  function bind() {
    $('topbar').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var a = btn.getAttribute('data-action');
      if (a === 'goNeighbor') openChooser();
      else if (a === 'backHome') { currentView = 'player'; closeOverlay(); render(); }
      else if (a === 'shop') openShop();
      else if (a === 'reset') resetGame();
    });

    $('grid').addEventListener('click', function (e) {
      var cell = e.target.closest('.plot');
      if (!cell) return;
      openSheet(parseInt(cell.getAttribute('data-index'), 10));
    });

    $('overlay').addEventListener('click', function (e) {
      if (e.target.id === 'overlay') { closeOverlay(); return; }
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var a = btn.getAttribute('data-action');
      if (a === 'close') { closeOverlay(); return; }
      if (a === 'plant')  { plant(sheetContext.index, btn.getAttribute('data-crop')); closeOverlay(); return; }
      if (a === 'harvest'){ harvest(sheetContext.index); closeOverlay(); return; }
      if (a === 'clear')  { clearEvent(sheetContext.index); openSheet(sheetContext.index); return; }
      if (a === 'steal')  { stealFromNeighbor(sheetContext.view, sheetContext.index); closeOverlay(); return; }
      if (a === 'choose') { currentView = parseInt(btn.getAttribute('data-i'), 10); closeOverlay(); render(); return; }
      if (a === 'buyDog') { buyDog(); openShop(); return; }
      if (a === 'buyFence') { buyFence(); openShop(); return; }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && state) save();
    });
    window.addEventListener('beforeunload', function () { if (state) save(); });
  }

  /* ---------- 启动 ---------- */
  function init() {
    var loaded = load();
    state = loaded ? normalize(loaded) : defaultSave();
    applyOffline();
    save();
    bind();
    render();
    setInterval(growthTick, GROW_TICK_MS);
    setInterval(neighborSimTick, SIM_TICK_MS);
    setInterval(neighborStealTick, STEAL_TICK_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
