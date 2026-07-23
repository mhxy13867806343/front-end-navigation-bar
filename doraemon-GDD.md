# 哆啦A梦 · 大雄救援大作战 — Game Design Document

> 复刻对象：1986 年 Hudson Soft / FC《哆啦A梦》（横版动作冒险，3 章：宇宙 / 西部 / 海底）
> 实现形态：纯 HTML5 Canvas 单文件游戏 `doraemon.html`（零依赖、WebAudio 合成音效）
> 文档版本：v0.1（纵切片）｜设计者：GameDesigner

---

## 1. 设计支柱 (Design Pillars)

本项目只交付**一章纵切片**（宇宙篇），但所有决策都按完整游戏的三个支柱衡量：

1. **道具即玩法 (Gadget-as-Verb)**：哆啦A梦的核心幻想是"用神奇道具破局"。竹蜻蜓=移动维度扩展，空气炮=攻击，任意门=空间跳跃。每个道具必须带来**新的决策**，而非装饰。
2. **低门槛、高上限 (Accessible but Deep)**：30 秒内上手"跑跳打"，但飞行能量管理、跳跃落点、Boss 弹幕走位构成技巧天花板。
3. **童年冒险感 (Adventure Tone)**：救援大雄的目标驱动，关底 Boss 提供高潮，铜锣烧提供正反馈。音乐活泼、画面童趣。

---

## 2. 核心循环 (Core Loop)

### Moment-to-Moment (0–30 秒)
- **Action**：← → 跑动，遇敌按 J 发射空气炮，遇坑按住 K 展开竹蜻蜓飞越。
- **Feedback**：炮弹出膛音效 + 敌人爆裂粒子；飞行时头顶竹蜻蜓旋转；受击屏震 + 红闪。
- **Reward**：击杀 +120 分，拾铜锣烧回血/加分，进度条推进。

### Session Loop (2–6 分钟 / 单章)
- **Goal**：穿越 5 段深坑地形，清掉巡逻敌人 + 射手，抵达 Boss 竞技场击败"伽玛机器人"，救出大雄。
- **Tension**：飞行能量有限（38/s 消耗，16/s 回充）→ 不能无脑飞；深坑掉落扣血并回到最近安全点。
- **Resolution**：Boss 倒下 → 大雄现身 → "大雄救出！" → WIN（结算 +2000 奖励）。生命归零 → GAME OVER。

### Long-Term Loop（未实现，见 §6）
三章轮换（宇宙/西部/海底）+ 道具组合解谜 + 隐藏任意门 + 关卡选择。

---

## 3. 机制规格 (Mechanic Specs)

### 机制：竹蜻蜓飞行 (Bamboo Copter)
- **Purpose**：突破横版"地面+跳跃"的二维限制，让深坑与高空平台可达，提供爽快机动。
- **Player Fantasy**：像哆啦A梦一样悬停、升空的自由感。
- **Input**：按住 K / Shift（或触屏「翼」）。
- **Output**：飞行中重力被抵消并施加上升加速度；消耗 `flyEnergy`。
- **Success Condition**：能量 > 0 时可自由升降；松开或耗尽则恢复重力下落。
- **Failure State**：能量耗尽时无法起飞，只能靠跳跃（可能过不了宽坑）。
- **Edge Cases**：飞行中仍可左右移动与射击；落地瞬间若仍按飞行键则立即重新起飞（能量足够时）。
- **Tuning Levers**：`FLY_ACCEL`、`FLY_DRAIN`、`FLY_REGEN`、`ENERGY_MAX`、`FLY_MAX_UP`。
- **Dependencies**：碰撞系统、能量 HUD。

### 机制：空气炮 (Air Cannon)
- **Purpose**：唯一攻击手段，对应原作道具"空气炮"。
- **Input**：按 J / Z（或触屏「炮」），有冷却。
- **Output**：朝面向发射子弹，命中敌人/Boss 扣血。
- **Success Condition**：子弹命中目标扣 `BULLET_DMG`，击杀触发粒子+计分。
- **Failure State**：冷却中无法连发；子弹打空无效果。
- **Tuning Levers**：`SHOOT_CD`、`BULLET_SPEED`、`BULLET_DMG`。
- **Dependencies**：敌人/Boss 血量系统。

### 机制：深坑坠落 (Pit Fall)
- **Purpose**：制造地形风险，强制使用竹蜻蜓或精准跳跃。
- **Output**：掉出世界底部 → 扣 1 HP + 无敌帧，回到 `lastSafe` 安全点。
- **Edge Cases**：`lastSafe` 仅在 `onGround` 时刷新，避免记录坑内坐标；HP≤0 直接 GAME OVER。

### 机制：铜锣烧拾取 (Dorayaki)
- **Purpose**：正反馈 + 续航（对应原作"收集铜锣烧回复生命"）。
- **Output**：HP<上限时回 1 心；满血时转 +60 分。

### 机制：Boss 战 (Gamma Robot)
- **Purpose**：章节高潮，检验飞行走位 + 持续输出。
- **Input**：同移动/射击/飞行。
- **Output**：Boss 三向扇形弹幕 + 横向巡逻；血量清零 → 大雄救援 → WIN。
- **Tuning Levers**：`BOSS_HP`、`BOSS_SPEED`、`BOSS_FIRE_CD`、`ENEMY_BULLET_SPEED`。

---

## 4. 平衡数值表 (Economy / Balance)

> 所有数值为初始假设 `[PLACEHOLDER]`，需实机试玩调参。

| 变量 | 基值 | 最小 | 最大 | 调参理由 |
|------|------|------|------|----------|
| MAX_HP | 5 | 3 | 8 | 5 心容错适中；新手 3、硬核 8 |
| GRAVITY | 1500 | 1200 | 1800 | 影响跳跃手感 |
| MOVE_SPEED | 230 | 180 | 280 | 横向机动 |
| JUMP_V | -600 | -520 | -680 | 跳跃高度（配合重力定落点） |
| FLY_ACCEL | 2700 | 2400 | 3200 | 须 > GRAVITY 才能上升 [PLACEHOLDER] |
| FLY_DRAIN | 38 | 25 | 55 | 飞行续航（约 2.6s 满能量） |
| FLY_REGEN | 16 | 10 | 25 | 落地回充速度 |
| ENERGY_MAX | 100 | — | — | 固定上限 |
| SHOOT_CD | 0.22 | 0.12 | 0.3 | 射速手感 |
| BULLET_SPEED | 540 | 420 | 700 | 弹道爽快度 |
| BULLET_DMG | 1 | — | — | 配合敌人/Boss 血量 |
| ENEMY_HP | 2 | 1 | 3 | 杂兵 1–2 发解决 |
| ENEMY_SPEED | 70 | 50 | 100 | 巡逻压迫感 |
| BOSS_HP | 36 | 20 | 60 | 试玩定：约 6–10s 集火 [PLACEHOLDER] |
| BOSS_FIRE_CD | 1.3 | 0.8 | 2.0 | 弹幕密度 |
| ENEMY_BULLET_SPEED | 200 | 150 | 280 | Boss/射手弹速 |
| SCORE_ENEMY | 120 | — | — | — |
| SCORE_DORAYAKI | 60 | — | — | 满血转分 |
| SCORE_BOSS | 3000 | — | — | — |
| WORLD_W | 3600 | — | — | 关卡长度 |

**崩溃定义 (Broken)**：① 某段深坑在满能量也飞不过（不可通关）；② Boss 战无敌帧/卡墙导致无法命中；③ 坠落回安全点陷入死循环。上述任一出现即判该版本 Broken。

---

## 5. 新手引导 (Onboarding Checklist)
- [x] 核心动词（移动/跳/飞/射）在菜单与控制提示中 30 秒内可见
- [x] 第一段无敌人，保证首次成功落地
- [x] 首个深坑前放置踏脚平台 + 铜锣烧引导使用飞行
- [ ] 增加"飞行教学"文字气泡（下一版）
- [x] 关底 Boss 触发横幅提示

---

## 6. 范围与扩展 (Scope & Expansion)
**本版 = 宇宙篇纵切片**，可独立游玩通关。完整复刻路线图：
1. 三章地形包（西部旋转门陷阱 / 海底游泳+潜水服）。
2. 道具扩展：任意门（关卡内瞬移）、缩小灯（进隐藏通道）、透明斗篷（免伤）、时光布（开关卡）。
3. 多章节 Boss + 章节选择菜单。
4. 隐藏铜锣烧点与"续关"机制（原作死亡后可继续但重打部分）。
5. 可选：本地 2 人（一人操控大雄辅助？）—— 原作单人，优先级低。

---

## 7. Changelog
- **v0.1** (2026-07-23)：首版纵切片。单文件 Canvas 实现：横版移动/跳/竹蜻蜓飞行/空气炮、巡逻+射手敌人、铜锣烧回血、Boss 战、救援通关、触屏按钮、HUD（生命/能量/进度）、菜单/暂停/胜负态。接入功能页游戏列表。
