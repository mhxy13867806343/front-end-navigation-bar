# 项目故障排查与踩坑记录文档 (Troubleshooting & Issues Log)

本文档记录了 `front-end-navigation-bar` 项目在开发、升级 SCSS、封装组件及线上部署 GitHub Pages 过程中遇到的常见问题、排查步骤及解决方案。

---

## 1. 线上部署 Token 为空报错 (`token秘钥不能为空` / code: 10001)

### 📌 问题现象
线上 GitHub Pages 打包部署后，访问天气预报、黄金实时行情等 API 接口时出现请求失败，ALAPI 返回：
```json
{
  "code": 10001,
  "message": "token秘钥不能为空",
  "data": null,
  "success": false
}
```

### 🔍 原因分析
1. 项目的 `.env` 配置文件包含敏感 Token (`VITE_ALAPI_TOKEN`)，已被列入 `.gitignore`，因此未提交至 GitHub 远程仓库。
2. 线上 GitHub Actions / Pages 在执行生产构建 `npm run build` 时，环境中没有 `.env` 文件，导致 `import.meta.env.VITE_ALAPI_TOKEN` 解析为 `undefined` 或空字符串 `""`。
3. `api_list.json` 中的模板占位符 `{{VITE_ALAPI_TOKEN}}` 在替换时由于环境变量为空，直接被替换为空字符串，导致发出的 HTTP 请求带上了 `token=`。

### 🛠️ 解决方案
在所有读取 `VITE_ALAPI_TOKEN` 的地方及 `resolveTemplateValue` 替换工具中，加入默认兜底值 (Fallback Token)：
```ts
const DEFAULT_ALAPI_TOKEN = 'qgqofofvmxtoskffd37omkscobipmn'
const ALAPI_TOKEN: string = import.meta.env.VITE_ALAPI_TOKEN || DEFAULT_ALAPI_TOKEN
```
确保无论在本地开发环境还是在 GitHub Pages 线上构建环境，均能保证 Token 永远有效可用。

---

## 2. Vue SFC 双闭合标签语法错误 (`SyntaxError: Invalid end tag`)

### 📌 问题现象
将全局 CSS 文件重命名为 SCSS 并批量更新 Vue 组件的 `<style scoped lang="scss" src="...">` 后，打包或构建时抛出 Vue Template SFC 编译异常：
```text
SyntaxError: Invalid end tag
at <style scoped lang="scss" src="./App.scss"></style></style>
```

### 🔍 原因分析
自动批量处理脚本在正则匹配替换 `<style>` 标签时，由于原有代码末尾存在多余标签，导致写出了重复的闭合标签 `</style></style>`。在 `@vue/compiler-sfc` 解析器中，外链 `src="..."` 的 style 元素在解析时产生语法错误。

### 🛠️ 解决方案
编写 Node 校验与修复脚本 `scripts/fix-duplicate-style-tags.js`，遍历全站所有 `.vue` 文件，使用正则：
```js
content = content.replace(/<\/style>\s*<\/style>/g, '</style>')
```
清理重复闭合标签，并通过 `@vue/compiler-sfc` 的 `parse` API 逐一校验确保 0 错误。

---

## 3. JS/TS 暂存死区 (TDZ) 导致 `ReferenceError` 崩溃

### 📌 问题现象
控制台抛出运行时异常：
- `Uncaught ReferenceError: Cannot access 'buildPreviewUrl' before initialization`
- `Uncaught ReferenceError: Cannot access 'sendRequest' before initialization`

### 🔍 原因分析
在 Vue 3 `<script setup>` 中，`watch(currentEndpoint, initializeEndpointState, { immediate: true })` 带有 `immediate: true` 配置，会在 Setup 阶段**立即同步执行**回调函数。若回调函数内部调用的 `sendRequest` 或 `buildPreviewUrl` 使用 `const` 声明在 `watch` 语句**下方**，因为 `const` 声明的函数不会产生函数提升 (Hoisting)，导致触发暂存死区 (Temporal Dead Zone, TDZ)。

### 🛠️ 解决方案
调整 `<script setup>` 中的函数声明顺序，将所有内部调用的工具函数 (`sendRequest`, `buildPreviewUrl`, `openEndpoint`, `goBack` 等) 明确提升并声明在 `initializeEndpointState` 和 `watch` 语句的**上方**。

---

## 4. ECharts 图表在 Vue Tab 标签页切换时尺寸为 0 不渲染

### 📌 问题现象
天气预报页面切换到 “7天预报” (柱状图) 或 “40天预报” (折线图) Tab 时，图表区域一片空白，刷新窗口后才显示。

### 🔍 原因分析
Element Plus `<el-tabs>` 的非激活 Tab Pane 在 DOM 中使用了 `display: none`。当接口数据请求完成并触发 `initChart()` 时，包含 ECharts Canvas 的容器 DOM 的 `clientWidth` 和 `clientHeight` 均为 0，导致 ECharts 无法计算 canvas 视口尺寸。

### 🛠️ 解决方案
1. 在 SCSS 中显式为 `.chart-container` 与 `.echarts-box` 设定 `height: 360px !important; width: 100%` 物理高度。
2. 在切换 Tab 时通过 `nextTick` 与 `setTimeout(..., 100)` 延时触发 `chart.resize()` 重新计算绘图区尺寸。

---

## 5. 万级级联选择器 (`ChinaRegionCascader`) 阻塞卡死

### 📌 问题现象
点击“📍 选择全国省 / 市 / 区县...”选择器时，页面出现短暂冻结/卡顿，下拉框没有即刻响应展开。

### 🔍 原因分析
全国省市区 JSON 数据源 (`china-cascader-options.json`) 包含约 15,000 个节点。若直接赋值给 Vue 3 组件响应式变量，Vue 会对 1.5 万个节点逐一递归包装为 `Proxy` 深度响应式对象，消耗大量的 CPU 和内存资源。

### 🛠️ 解决方案
使用 Vue 3 提供的 `markRaw` 标记静态数据，阻止 Vue 将深层 JSON 包装为响应式对象：
```ts
import { markRaw } from 'vue'
import rawCascaderOptions from '../ajson/china-cascader-options.json'

const chinaCascaderOptions = markRaw(rawCascaderOptions as CascaderNode[])
```
优化后点击级联选择器瞬间即刻展开，CPU 占用降为 0。

---

## 6. 接口中心 (`apiCenter`) 中文 URL 参数匹配失败白屏

### 📌 问题现象
直接访问 `/api-center/ALAPI黄金价格/黄金实时价格` 时，页面展示白色空背景。

### 🔍 原因分析
路由中的中文分类与接口名称在浏览器 URL 中可能经历 URL 编码 (`%E7%AE%97...`)。`findApiEndpoint` 原先直接使用严格全等匹配 `===`，无法匹配编码后的字符串，导致 `currentEndpoint` 返回 `null`。

### 🛠️ 解决方案
1. 增加 `decodeURIComponent` 安全解码处理。
2. 在 `findApiEndpoint` 中引入多级降级匹配机制（先分类全等匹配，若失败则按接口名全量降级检索），确保 100% 精准命中有问题的路由。
