# GDD：激龟快打 (Teenage Mutant Ninja Turtles FTG 复刻)

> 版本 v1.0 · 2026-07-24 · 作者 GameDesigner
> 复刻对象：NES《激龟快打 / TMNT Tournament Fighters》（科乐美 1993）纵切片
> 技术栈：单页 HTML + Canvas 战斗 + oat UI 外壳 + jQuery UI 对话框 + jquery/jquery-ui.css（全部走 `public/` 资源）

## 1. 设计支柱 (Design Pillars)
1. **打击感优先 (Game Feel First)**：出招必有反馈（顿帧、击退、闪白、音效、连击数跳动）——这是 FTG 的灵魂。
2. **可读的 1v1 对局**：血量、回合、计时、连击一眼可见；招式判定宽松友好，新手也能打出连段。
3. **四龟差异化 (Archetypes)**：每个角色有清晰"手感标签"，玩家凭喜好选择而非数值碾压。
4. **双端同享 (PC + H5)**：键盘与触屏虚拟键同一套输入抽象；移动端自动出现方向图标。
5. **oat 统一视觉**：所有菜单/HUD/弹窗走 oat.ink 组件与暗色主题，不再手写风格。

## 2. 核心循环 (Core Loop)

### Moment-to-Moment (0–3 秒)
- **Action**：玩家 ←/→ 移动、J 拳、K 踢、L 必杀
- **Feedback**：命中 → 敌人顿帧+击退+闪红+「咚」音；连击数 HUD 跳动
- **Reward**：每次命中 +分数，连击越高单 hit 倍率越高

### Session Loop (1–3 分钟 / 一场对局)
- **Goal**：在 99 秒回合内击倒对手，先胜 2 回合赢下比赛
- **Tension**：血量下降 + 计时归零（血多者胜）→ 逼玩家进攻也逼防守
- **Resolution**：KO → 回合结算弹窗 → 重置或比赛胜利/失败弹窗

### Long-Term Loop (多场)
- **Progression**：胜利累计最高分（localStorage `tmnt_hi`）
- **Retention Hook**：换角色挑战、刷新最高分、移动端随手来一局

## 3. 机制规格 (Mechanic Specs)

### Mechanic: 移动 / 跳跃 / 冲刺
- **Purpose**：空间博弈基础
- **Player Fantasy**：灵活走位压制对手
- **Input**：←/→ 移动；↑/W 跳；→→ 双击前 = 冲刺（250ms 内）
- **Output**：x/vx 改变；落地重置
- **Edge**：冲刺中不可转向；空中不可冲刺
- **Tuning**：`WALK=2.4` `JUMP=-9.5` `GRAVITY=0.5` `DASH=5.5`(持续 12 帧) `[PLACEHOLDER]`

### Mechanic: 拳 (Punch) / 踢 (Kick)
- **Purpose**：基础进攻，构建连段
- **Input**：J 拳 / K 踢
- **拳**：快、短、低伤(8)；**踢**：中速、长、中伤(12)，可击退
- **Success**：active 帧命中对手判定框
- **Edge**：同一招 200ms 内连按 = 二段（连段感）
- **Tuning**：拳 startup4/active4/recovery8；踢 startup7/active5/recovery14 `[PLACEHOLDER]`

### Mechanic: 必杀 (Special / 投射)
- **Purpose**：远距离压制 + 收尾连段
- **Input**：L（朝面向发射投射物）
- **Output**：生成 projectile，命中造成 `specialDmg`(18) + 浮空
- **Edge**：双方同时放必杀 → 空中对撞抵消
- **Tuning**：速度/伤害按角色差异（见 §4）`[PLACEHOLDER]`

### Mechanic: 投技 (Throw)
- **Purpose**：破防御的硬解
- **Input**：贴身 + ↓→+B 简化为「贴身按 U(投)」
- **Output**：无视防御，造成 `throwDmg`(22) + 大击退
- **Failure**：不在贴身范围 → 落空硬直
- **Tuning**：投技范围 36px `[PLACEHOLDER]`

### Mechanic: 防御 (Block)
- **Purpose**：风险对冲
- **Input**：持续按住「背对对手方向」（或移动端 BLOCK 键）
- **Output**：受到的伤害 ×0.25，无硬直，但被推后退
- **Edge**：投技无视防御（设计意图）
- **Tuning**：减伤系数 0.25 `[PLACEHOLDER]`

### Mechanic: 回合 / 比赛
- **Purpose**：制造胜负节奏
- **Input**：无（系统）
- **Output**：KO → roundWins++ → 先到 2 胜结束比赛；计时归零血多者胜
- **Tuning**：`ROUND_WIN=2` `ROUND_TIME=99`(秒) `[PLACEHOLDER]`

### Mechanic: 连击 (Combo)
- **Purpose**：奖励连续命中、放大爽感
- **Input**：短时窗内连续命中
- **Output**：combo 计数 +；每 hit 分数 ×(1+combo×0.1) 上限 ×3
- **Tuning**：连击窗口 600ms `[PLACEHOLDER]`

## 4. 角色数值 (4 龟) `[PLACEHOLDER]`
| 角色 | 标签 | 速度 | HP | 拳/踢 | 必杀速度/伤 | 投射速度 |
|------|------|------|----|-------|------------|----------|
| 李奥纳多(剑) | 均衡 | 2.4 | 100 | 8/12 | 7/18 | 6 |
| 米开朗(双截) | 速攻 | 2.9 | 90 | 7/10 | 9/14(近身) | 7 |
| 多纳(长棍) | 长手 | 2.1 | 105 | 9/13 | 6/20 | 5 |
| 拉斐尔(钗) | 重击 | 2.3 | 98 | 9/14 | 6/22 | 5.5 |

> 数值为初始假设，playtest 后调。设计意图：无绝对最强，靠手感偏好选择。

## 5. 平衡表 (Economy / Feel) `[PLACEHOLDER]`
```
Variable        | Base | Min | Max | Notes
HP              | 100  | 90  | 105 | 角色差异
Punch Dmg       | 8    | 7   | 9   | 连段基底
Kick Dmg        | 12   | 10  | 14  | 中断/击退
Special Dmg     | 18   | 14  | 22  | 收尾
Throw Dmg       | 22   | -   | -   | 破防硬解
Block Reduce    | 0.25 | 0.1 | 0.4 | 越小越硬
Combo Window    | 600ms| 400 | 800 | 越长越易连
Round Time      | 99s  | 60  | 120 | 节奏
CPU Reaction    | 0.35s| 0.2 | 0.6 | AI 难度 [PLACEHOLDER]
```

## 6. 崩溃定义 (Definition of Broken)
- **太难**：玩家连续 3 场 0 回合胜 / 单场被连 15 以上无反手 → CPU 太凶
- **太易**：玩家闭眼连胜，CPU 从不防御/反击 → AI 太弱
- **不爽**：命中无顿帧/无音效/连击不跳 → 打击感缺失（最高优先级）
- **双端坏**：移动端方向图标缺失或按键无响应 → 阻断体验

## 7. 移动端适配
- 检测 `('ontouchstart' in window)` 或 `matchMedia('(pointer:coarse)')` → 显示虚拟键
- 布局：canvas 自适应宽度（max 800，等比缩放）；下方虚拟 dpad（▲▼◀▶）+ 4 动作键（拳/踢/必杀/投），全部 oat 风格
- 同一 `InputState` 抽象：键盘与触摸都写入同一组布尔/方向，战斗逻辑无感知差异
- 防误触：触摸键 `touch-action:none`，阻止页面滚动

## 8. 变更日志
- v1.0 (2026-07-24)：首版纵切片，4 角色 + CPU + 回合 + 双端虚拟键。
