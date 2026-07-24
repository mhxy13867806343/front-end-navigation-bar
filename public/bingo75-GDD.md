# 75 宾果 (75 Bingo) · 复刻版 GDD

> 复刻对象：`https://zaixianwan.app/games/814` — Sachen《75宾果》(NES)
> 技术栈：单页 DOM 游戏，复用 `public/` 现有资源——
> `jquery.min.js` + `jquery-ui.min.js`(驱动 `jquery-ui.css` 对话框控件) + `oat.min.css`/`oat.min.js`(shadcn 风组件/Toast) + `game-audio-helper.js`(Web Audio 音效)
> 文档版本：v1.0 ｜ 2026-07-24 ｜ 作者：GameDesigner

---

## 1. 设计支柱 (Design Pillars)

1. **低风险快节奏的连线快感**：每次取号都可能在某张牌上点亮一格，"差一格就 BINGO" 的张力是核心爽点。
2. **可被理解的赌注决策**：玩家唯一真正的决策是"押几张牌"。更多牌 = 更多连线机会，但每轮下注更高——风险/收益必须一眼可读。
3. **清清爽爽的宾果界面**：用 oat 的卡片/徽章/按钮 + jquery-ui 对话框，信息密度高但不乱；闪光板(flashboard)让玩家知道"还差哪些号"。
4. **随时收手的人性设计**：允许在任意时刻"结算"锁定当前本金，把赌博的"见好就收"做成显式动作。

---

## 2. 核心循环 (Core Loop)

### Moment-to-Moment (0–30 秒)
- **Action**：点 `DRAW`(或开自动取号) → 摇出 1–75 中的一个球
- **Feedback**：球号在大显示屏弹出 + 闪光板对应格点亮 + 所有牌上相同数字格高亮；出连线时 `BINGO` 闪动 + 音效
- **Reward**：每完成一条线立即派彩 + 连击计数上涨

### Session Loop (一轮 = 最多 75 球)
- **Goal**：在 1–4 张牌上凑出横/竖/斜/四角/满卡连线，派彩 > 本轮下注
- **Tension**：本金有限；每张牌都要先扣下注；取号越多越可能凑出线，但也可能"白抽"
- **Resolution**：75 球抽完 或 玩家主动"结算" → 弹出结算对话框(下注/派彩/净收/本金) → 继续下一轮

### Long-Term Loop (整局)
- **Progression**：本金累积；目标 `GOAL`(默认 400) 达成 = 胜利
- **Retention Hook**：连击倍率、每轮"差一点"的钩子、结算对话框的"再来一轮"按钮

---

## 3. 机制规格 (Mechanic Specifications)

### M1. 卡片生成 (Card Generation)
- **Purpose**：产生标准 75-ball 宾果卡，保证可玩且每列范围正确
- **Player Fantasy**：拿到一张"我的"专属宾果卡
- **Input**：开局时选择的牌数 N(1–4)
- **Output**：N 张 5×5 卡；列范围 B[1–15] I[16–30] N[31–45] G[46–60] O[61–75]；中心为 FREE(预标记)
- **Success**：每张卡每列 5 个不重复数字；中心 FREE
- **Failure**：数字越界/重复 → 重生成(代码约束，不应发生)
- **Edge Cases**：多张牌之间可重复数字(真实宾果允许)；FREE 格始终计入连线
- **Tuning Levers**：列范围(固定)、牌数上限(4)
- **Dependencies**：取号器、连线判定

### M2. 取号器 (Number Caller)
- **Purpose**：公平、不重复的 1–75 出球
- **Input**：`DRAW` 点击 / 自动取号计时器
- **Output**：从洗牌后的袋子弹出下一个球，加入"已叫"集合
- **Success**：75 球各出现一次；抽完即本轮结束
- **Failure**：重复出球 → 用 bags/Set 去重保证不发生
- **Edge Cases**：袋子空时禁用 DRAW 并触发结算
- **Tuning Levers**：`AUTO_SPEED`(自动取号间隔 ms) [PLACEHOLDER]
- **Dependencies**：自动标记、闪光板

### M3. 自动标记 (Auto-Mark)
- **Purpose**：出球后所有牌上对应数字格自动标记，玩家只看结果
- **Input**：新球号
- **Output**：所有牌 `val===num` 的格 `marked=true`；FREE 始终 true
- **Success**：标记与连线判定同步
- **Failure**：漏标 → 影响派彩；靠统一标记函数保证
- **Dependencies**：连线判定

### M4. 连线判定 (Line Detection)
- **Purpose**：检测每张牌新完成的图案并派彩
- **Patterns**：5 横行 / 5 竖列 / 2 斜线 / 四角 / 满卡(24 非 FREE 全中)
- **Input**：一次出球后的标记状态
- **Output**：对每个"新完成且未派过"的图案结算派彩
- **Success**：用 `achieved:Set` 记录已派图案 key，避免重复派彩
- **Failure**：重复派同一线 → 靠 achieved 去重
- **Edge Cases**：一次出球同时完成多线(如某格同时是行+列+斜交点) → 全部结算并叠加连击
- **Tuning Levers**：各图案派彩值(见平衡表)
- **Dependencies**：经济

### M5. 连击倍率 (Combo Multiplier)
- **Purpose**：奖励连续出球都出线的"手感热区"
- **Input**：本次出球是否产生 ≥1 条新线
- **Output**：是 → `combo++`；否 → `combo=0`；倍率 `mult=min(1+0.2*combo, 5)`
- **Success**：倍率只作用于当次派彩
- **Failure**：倍率叠加到历史已派彩 → 仅作用于新增
- **Dependencies**：经济、Toast 反馈

### M6. 经济与下注 (Economy)
- **Purpose**：把"押几张牌"变成唯一风险决策
- **Input**：选牌数 N；开局扣 `bet*N`
- **Output**：本金增减；达 `GOAL` 胜利；低于 `MIN_BET` 失败
- **Success**：本金始终 ≥0；结算清晰
- **Failure**：本金可负 → 结算时 clamp 并判定失败
- **Edge Cases**：本金恰等于 bet 但 < GOAL → 仍可开一轮；开不了 → 失败
- **Tuning Levers**：`START_BANKROLL` / `BET_PER_CARD` / `GOAL`(见平衡表)
- **Dependencies**：所有派彩

---

## 4. 平衡表 (Economy Balance) — [PLACEHOLDER] 待试玩

| 变量 | 基础值 | 最小 | 最大 | 备注 |
|---|---|---|---|---|
| START_BANKROLL | 100 | 50 | 200 | 初始本金 |
| BET_PER_CARD | 10 | 5 | 20 | 每牌每轮下注 |
| GOAL | 400 | 200 | 800 | 胜利本金阈值 |
| PAY_LINE(行/列/斜) | 8 | 4 | 16 | 单条线派彩 |
| PAY_CORNERS(四角) | 15 | 8 | 30 | 四角派彩 |
| PAY_FULL(满卡) | 50 | 25 | 100 | 满卡 jackpot |
| COMBO_STEP | 0.2 | 0.1 | 0.5 | 每连击 +倍率 |
| COMBO_CAP | 5 | 3 | 10 | 倍率上限 |
| AUTO_SPEED(ms) | 900 | 400 | 2000 | 自动取号间隔 |
| MAX_CARDS | 4 | 2 | 6 | 牌数上限 |

**崩溃定义 (Definition of Broken)**
- 本金可变为负；或某轮派彩 > 合理上限(单轮净收 > START_BANKROLL*2)
- 连击倍率失控(>10)导致数值溢出式膨胀
- 抽完 75 球仍无法结束一轮(状态机卡死)
- 任意牌出现重复数字 / 数字越界
- 已派过的线被重复派彩

---

## 5. 关卡 / 模式
- 单局无尽模式：目标本金 400 即胜；本金不足即败。
- 每轮 = 一次 75 球抽取；轮间结算并决策是否继续。
- (可扩展：后续加"限时模式""最高连击榜")

---

## 6. Onboarding Checklist
- [x] 核心动词 `DRAW` 在标题对话框结束后立即可见(大按钮)
- [x] 首轮至少 FREE 格已标记，前几次出球必有点亮反馈(保证正反馈)
- [x] 每个机制用 oat tooltip(`title`)低干扰说明
- [x] 闪光板让玩家理解"还差哪些号"
- [x] 首轮结束的结算对话框是钩子("再来一轮")

---

## 7. 变更日志 (Changelog)
- **v1.0 (2026-07-24)** 初版：卡片生成/取号器/自动标记/连线判定/连击/经济 + jquery-ui 对话框 + oat 组件 + RetroGameAudio 音效。
