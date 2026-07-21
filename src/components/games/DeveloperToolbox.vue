<template>
  <div class="devtools-container">
    <!-- Left Navigation Menu -->
    <div class="devtools-sidebar">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="devtools-tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.name }}</span>
      </div>
    </div>

    <!-- Right Workspace Area -->
    <div class="devtools-content">
      <!-- 1. JSON/XML/SQL Formatting -->
      <div v-if="activeTab === 'format'" class="tab-pane">
        <h3 class="pane-title">📝 文本格式化 & 压缩</h3>
        <div class="control-row">
          <button class="tool-btn" @click="formatText('json')">Format JSON</button>
          <button class="tool-btn" @click="minifyText('json')">Minify JSON</button>
          <button class="tool-btn" @click="formatText('xml')">Format XML</button>
          <button class="tool-btn" @click="minifyText('xml')">Minify XML</button>
          <button class="tool-btn" @click="formatText('sql')">Format SQL</button>
          <button class="tool-btn @secondary" @click="clearText">清空</button>
          <button class="tool-btn @primary" @click="copyOutput">复制结果</button>
        </div>
        <div class="editor-grid">
          <div class="editor-box">
            <div class="editor-label">原始数据输入：</div>
            <textarea 
              v-model="formatInput" 
              class="editor-textarea" 
              placeholder="请在这里粘贴待处理的内容..."
            ></textarea>
          </div>
          <div class="editor-box">
            <div class="editor-label">处理结果输出：</div>
            <textarea 
              v-model="formatOutput" 
              class="editor-textarea readonly" 
              readonly
              placeholder="处理后的内容将显示在这里..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 2. Encoding / Decoding / Hash -->
      <div v-if="activeTab === 'crypto'" class="tab-pane">
        <h3 class="pane-title">🔒 编解码 & 哈希计算</h3>
        <div class="control-row">
          <button class="tool-btn" @click="runCrypto('md5')">MD5</button>
          <button class="tool-btn" @click="runCrypto('sha256')">SHA-256</button>
          <button class="tool-btn" @click="runCrypto('b64encode')">Base64 编码</button>
          <button class="tool-btn" @click="runCrypto('b64decode')">Base64 解码</button>
          <button class="tool-btn" @click="runCrypto('urlencode')">URL 编码</button>
          <button class="tool-btn" @click="runCrypto('urldecode')">URL 解码</button>
          <button class="tool-btn @secondary" @click="clearCrypto">清空</button>
          <button class="tool-btn @primary" @click="copyCrypto">复制结果</button>
        </div>
        <div class="editor-grid">
          <div class="editor-box">
            <div class="editor-label">输入内容：</div>
            <textarea 
              v-model="cryptoInput" 
              class="editor-textarea" 
              placeholder="请输入字符串（Base64解码需要输入标准的Base64格式字符串）"
            ></textarea>
          </div>
          <div class="editor-box">
            <div class="editor-label">计算结果：</div>
            <textarea 
              v-model="cryptoOutput" 
              class="editor-textarea readonly" 
              readonly
              placeholder="计算后的内容将显示在这里..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 3. Unix Timestamp -->
      <div v-if="activeTab === 'timestamp'" class="tab-pane">
        <h3 class="pane-title">⏰ Unix 时间戳转换</h3>
        <div class="timestamp-live-card">
          <div class="live-ts-title">当前时间戳：</div>
          <div class="live-ts-value">{{ currentTimestamp }} 秒</div>
          <div class="live-ts-ms">{{ currentTimestampMs }} 毫秒</div>
        </div>

        <div class="timestamp-form">
          <div class="form-group">
            <label class="form-label">时间戳 ➡️ 本地时间：</label>
            <div class="input-action-row">
              <input v-model="tsToConvert" type="text" class="form-input" placeholder="输入10位或13位时间戳">
              <button class="tool-btn" @click="convertTimestampToDate">转换</button>
            </div>
            <div class="conversion-result" v-if="tsToDateResult">结果: {{ tsToDateResult }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">本地时间 ➡️ 时间戳：</label>
            <div class="input-action-row">
              <input v-model="dateToConvert" type="text" class="form-input" placeholder="格式: YYYY-MM-DD HH:mm:ss">
              <button class="tool-btn" @click="convertDateToTimestamp">转换</button>
            </div>
            <div class="conversion-result" v-if="dateToTsResult">结果: {{ dateToTsResult }}</div>
          </div>
        </div>
      </div>

      <!-- 4. Base Radix Conversion -->
      <div v-if="activeTab === 'radix'" class="tab-pane">
        <h3 class="pane-title">🔢 进制数转换</h3>
        <div class="radix-form">
          <div class="radix-item">
            <label class="radix-label">二进制 (2进制)：</label>
            <input 
              v-model="radixVal2" 
              type="text" 
              class="form-input" 
              @input="onRadixInput(2, radixVal2)"
              placeholder="请输入二进制..."
            >
          </div>
          <div class="radix-item">
            <label class="radix-label">八进制 (8进制)：</label>
            <input 
              v-model="radixVal8" 
              type="text" 
              class="form-input" 
              @input="onRadixInput(8, radixVal8)"
              placeholder="请输入八进制..."
            >
          </div>
          <div class="radix-item">
            <label class="radix-label">十进制 (10进制)：</label>
            <input 
              v-model="radixVal10" 
              type="text" 
              class="form-input" 
              @input="onRadixInput(10, radixVal10)"
              placeholder="请输入十进制..."
            >
          </div>
          <div class="radix-item">
            <label class="radix-label">十六进制 (16进制)：</label>
            <input 
              v-model="radixVal16" 
              type="text" 
              class="form-input" 
              @input="onRadixInput(16, radixVal16)"
              placeholder="请输入十六进制..."
            >
          </div>
        </div>
        <button class="tool-btn @secondary" style="margin-top: 15px;" @click="clearRadix">全部清空</button>
      </div>

      <!-- 5. Regex Tester -->
      <div v-if="activeTab === 'regex'" class="tab-pane">
        <h3 class="pane-title">🔍 正则表达式测试</h3>
        <div class="regex-setup-row">
          <div class="regex-input-box">
            <div class="editor-label">正则表达式：</div>
            <input v-model="regexPattern" type="text" class="form-input" placeholder="如: \d+">
          </div>
          <div class="regex-flag-box">
            <div class="editor-label">修饰符 (Flags)：</div>
            <div class="checkbox-row">
              <label><input type="checkbox" v-model="regexGlobal"> g (全局)</label>
              <label><input type="checkbox" v-model="regexIgnore"> i (忽略大小写)</label>
              <label><input type="checkbox" v-model="regexMulti"> m (多行)</label>
            </div>
          </div>
        </div>

        <div class="editor-grid">
          <div class="editor-box">
            <div class="editor-label">待匹配的源文本：</div>
            <textarea 
              v-model="regexText" 
              class="editor-textarea" 
              placeholder="请粘贴要进行正则表达式检索的文本..."
              @input="runRegexTest"
            ></textarea>
          </div>
          <div class="editor-box">
            <div class="editor-label">匹配结果结果展示：</div>
            <div class="regex-result-display" v-html="regexResultHtml"></div>
          </div>
        </div>
      </div>

      <!-- 6. Local JavaScript Helper Libraries -->
      <div v-if="activeTab === 'js_libs'" class="tab-pane js-libs-pane">
        <h3 class="pane-title">📦 常用 JS 函数库预览与沙箱运行</h3>
        
        <!-- Module Selectors -->
        <div class="sub-tabs-row">
          <div 
            v-for="sub in subModules" 
            :key="sub.id"
            class="sub-tab-item"
            :class="{ active: activeSubModule === sub.id }"
            @click="selectSubModule(sub.id)"
          >
            {{ sub.name }}
          </div>
        </div>

        <div class="libs-grid">
          <!-- Function list & params inputs -->
          <div class="libs-control-box">
            <div class="form-group">
              <label class="form-label">选择要调用的函数：</label>
              <select v-model="selectedFuncId" class="form-select" @change="onFuncSelect">
                <option v-for="f in filteredFuncs" :key="f.id" :value="f.id">{{ f.name }}</option>
              </select>
            </div>

            <div v-if="currentFunc" class="func-desc-card">
              <div class="desc-title">功能说明：</div>
              <div class="desc-text">{{ currentFunc.desc }}</div>
            </div>

            <!-- Dynamic arguments inputs -->
            <div v-if="currentFunc" class="dynamic-params-list">
              <div class="desc-title" style="margin-bottom: 8px;">参数输入设置：</div>
              <div 
                v-for="param in currentFunc.params" 
                :key="param.name"
                class="param-input-group"
              >
                <label class="param-label">{{ param.label }} (<code>{{ param.name }}</code>):</label>
                <textarea 
                  v-if="param.type === 'textarea'"
                  v-model="paramInputs[param.name]"
                  class="form-input textarea"
                ></textarea>
                <input 
                  v-else
                  v-model="paramInputs[param.name]"
                  :type="param.type"
                  class="form-input"
                >
              </div>
            </div>

            <button class="tool-btn @primary run-btn" @click="runRegistryFunc">⚡ 运行函数</button>
          </div>

          <!-- Code preview & output logs -->
          <div class="libs-preview-box">
            <!-- Source Code block -->
            <div class="editor-box">
              <div class="editor-toolbar">
                <div class="editor-label">函数实现源码 (ES6)：</div>
                <button 
                  class="tool-btn @primary code-copy-btn" 
                  @click="copyCurrentFuncCode"
                  :disabled="!currentFunc?.code"
                >
                  复制源码
                </button>
              </div>
              <pre class="code-block"><code>{{ currentFunc?.code || '暂无函数源码' }}</code></pre>
            </div>

            <!-- Output Block -->
            <div class="editor-box" style="margin-top: 15px; height: 160px;">
              <div class="editor-label">沙箱运行输出日志：</div>
              <textarea 
                v-model="jsLibsOutput" 
                class="editor-textarea readonly logs-textarea" 
                readonly
                placeholder="等待运行结果..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ElMessage } from 'element-plus'
import CryptoJS from 'crypto-js'
import copy from 'clipboard-copy'
import { toolRegistry } from '@/utils/tool'

type TabId = 'format' | 'crypto' | 'timestamp' | 'radix' | 'regex' | 'js_libs'
type SubModuleId = string
type FormatType = 'json' | 'xml' | 'sql'
type MinifyType = 'json' | 'xml'
type CryptoAlgo = 'md5' | 'sha256' | 'b64encode' | 'b64decode' | 'urlencode' | 'urldecode'
type ToolRegistryItem = (typeof toolRegistry)[number]
type ParamInputs = Record<string, string>
type RegistryRunner = (...args: unknown[]) => unknown

interface ToolboxTab {
  id: TabId
  name: string
  icon: string
}

interface SubModule {
  id: SubModuleId
  name: string
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || '未知错误')
}

const tabs: ToolboxTab[] = [
  { id: 'format', name: '格式化校验', icon: '📝' },
  { id: 'crypto', name: '编解码 & 哈希', icon: '🔒' },
  { id: 'timestamp', name: '时间戳转换', icon: '⏰' },
  { id: 'radix', name: '进制转换', icon: '🔢' },
  { id: 'regex', name: '正则匹配', icon: '🔍' },
  { id: 'js_libs', name: '自定义 JS 工具库', icon: '📦' }
]

const activeTab = ref<TabId>('format')

// 6. JS helper libraries logic
const subModules: SubModule[] = [
  { id: 'format', name: '格式化 (format.js)' },
  { id: 'loads', name: '解析 (loads.js)' },
  { id: 'es6', name: 'ES6 常用 (es6.js)' },
  { id: 'string', name: '字符串 (string.js)' },
  { id: 'array', name: '数组 (array.js)' },
  { id: 'object', name: '对象 (object.js)' },
  { id: 'math', name: '数学 (math.js)' },
  { id: 'color', name: '颜色 (color.js)' },
  { id: 'browser', name: '浏览器 (browser.js)' },
  { id: 'validator', name: '校验器 (validator.js)' },
  { id: 'date', name: '时间日期 (date.js)' },
  { id: 'number', name: '数值格式 (number.js)' },
  { id: 'url', name: '链接解析 (url.js)' }
]

const activeSubModule = ref<SubModuleId>('format')
const selectedFuncId = ref<string>('')
const paramInputs = ref<ParamInputs>({})
const jsLibsOutput = ref<string>('')

const filteredFuncs = computed<ToolRegistryItem[]>(() => {
  return toolRegistry.filter((t: ToolRegistryItem): boolean => t.module === activeSubModule.value)
})

const currentFunc = computed<ToolRegistryItem | undefined>(() => {
  return toolRegistry.find((t: ToolRegistryItem): boolean => t.id === selectedFuncId.value)
})

const selectSubModule = (subId: SubModuleId): void => {
  activeSubModule.value = subId
  const firstFunc: ToolRegistryItem | undefined = toolRegistry.find((t: ToolRegistryItem): boolean => t.module === subId)
  if (firstFunc) {
    selectedFuncId.value = firstFunc.id
    onFuncSelect()
  }
}

const onFuncSelect = (): void => {
  const f: ToolRegistryItem | undefined = currentFunc.value
  if (!f) return
  const inputs: ParamInputs = {}
  f.params.forEach((p: ToolRegistryItem['params'][number]): void => {
    inputs[p.name] = String(p.default)
  })
  paramInputs.value = inputs
  jsLibsOutput.value = ''
}

const copyPlainText = async (text: string | undefined, successMessage: string = '结果已复制到剪贴板！'): Promise<void> => {
  if (!text) {
    ElMessage.warning('暂无可复制内容')
    return
  }

  try {
    await copy(text)
    ElMessage.success(successMessage)
  } catch (e: unknown) {
    ElMessage.error(`复制失败: ${getErrorMessage(e) || '浏览器拒绝访问剪贴板'}`)
  }
}

const copyCurrentFuncCode = async (): Promise<void> => {
  await copyPlainText(currentFunc.value?.code, '源码已复制到剪贴板！')
}

const runRegistryFunc = (): void => {
  const f: ToolRegistryItem | undefined = currentFunc.value
  if (!f) return
  
  try {
    const args: unknown[] = f.params.map((p: ToolRegistryItem['params'][number]): unknown => {
      let rawVal = paramInputs.value[p.name]
      
      // Auto-parse JSON arrays/objects if input looks like JSON
      if (typeof rawVal === 'string' && (rawVal.trim().startsWith('[') || rawVal.trim().startsWith('{'))) {
        try {
          return JSON.parse(rawVal)
        } catch {
          return rawVal
        }
      }
      return rawVal
    })

    const result: unknown = (f.fn as RegistryRunner)(...args)
    
    if (typeof result === 'object' && result !== null) {
      jsLibsOutput.value = `[执行成功] 返回值 (Object):\n${JSON.stringify(result, null, 2)}`
    } else {
      jsLibsOutput.value = `[执行成功] 返回值 (String/Number):\n${result}`
    }
  } catch (e: unknown) {
    jsLibsOutput.value = `[执行失败] 运行时抛出异常:\n${getErrorMessage(e)}`
  }
}

// 1. Format
const formatInput = ref<string>('')
const formatOutput = ref<string>('')

const clearText = (): void => {
  formatInput.value = ''
  formatOutput.value = ''
}

const copyOutput = async (): Promise<void> => {
  await copyPlainText(formatOutput.value)
}

const formatText = (type: FormatType): void => {
  if (!formatInput.value) {
    ElMessage.warning('请输入待格式化内容')
    return
  }
  
  if (type === 'json') {
    try {
      const parsed: unknown = JSON.parse(formatInput.value)
      formatOutput.value = JSON.stringify(parsed, null, 2)
      ElMessage.success('JSON 格式化成功')
    } catch (e: unknown) {
      ElMessage.error(`JSON 格式校验失败: ${getErrorMessage(e)}`)
    }
  } else if (type === 'xml') {
    try {
      let formatted: string = ''
      const reg: RegExp = /(>)(<)(\/*)/g
      const xml: string = formatInput.value.replace(reg, '$1\r\n$2$3')
      let pad: number = 0
      xml.split('\r\n').forEach((node: string): void => {
        let indent: number = 0
        if (node.match(/.+<\/\w[^>]*>$/)) {
          indent = 0
        } else if (node.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1
        } else {
          indent = 0
        }
        let padding: string = ''
        for (let i: number = 0; i < pad; i++) {
          padding += '  '
        }
        formatted += padding + node + '\r\n'
        pad += indent
      })
      formatOutput.value = formatted.trim()
      ElMessage.success('XML 格式化成功')
    } catch (e) {
      ElMessage.error('XML 格式化失败')
    }
  } else if (type === 'sql') {
    const sql: string = formatInput.value
      .replace(/\s+/g, ' ')
      .replace(/\s*,/g, ',\r\n ')
      .replace(/\b(SELECT|FROM|WHERE|LEFT JOIN|RIGHT JOIN|INNER JOIN|GROUP BY|ORDER BY|HAVING|LIMIT|AND|OR|ON)\b/ig, '\r\n$1')
      .replace(/\r\n\r\n/g, '\r\n')
    formatOutput.value = sql.trim()
    ElMessage.success('SQL 格式化成功')
  }
}

const minifyText = (type: MinifyType): void => {
  if (!formatInput.value) return
  if (type === 'json') {
    try {
      const parsed: unknown = JSON.parse(formatInput.value)
      formatOutput.value = JSON.stringify(parsed)
      ElMessage.success('JSON 压缩成功')
    } catch (e: unknown) {
      ElMessage.error(`JSON 校验失败: ${getErrorMessage(e)}`)
    }
  } else if (type === 'xml') {
    formatOutput.value = formatInput.value.replace(/>\s*</g, '><').trim()
    ElMessage.success('XML 压缩成功')
  }
}

// 2. Crypto & Encoding
const cryptoInput = ref<string>('')
const cryptoOutput = ref<string>('')

const clearCrypto = (): void => {
  cryptoInput.value = ''
  cryptoOutput.value = ''
}

const copyCrypto = async (): Promise<void> => {
  await copyPlainText(cryptoOutput.value)
}

const runCrypto = (algo: CryptoAlgo): void => {
  if (!cryptoInput.value) {
    ElMessage.warning('请输入要计算的文本')
    return
  }
  
  try {
    if (algo === 'md5') {
      cryptoOutput.value = CryptoJS.MD5(cryptoInput.value).toString()
    } else if (algo === 'sha256') {
      cryptoOutput.value = CryptoJS.SHA256(cryptoInput.value).toString()
    } else if (algo === 'b64encode') {
      const strWord: CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse(cryptoInput.value)
      cryptoOutput.value = CryptoJS.enc.Base64.stringify(strWord)
    } else if (algo === 'b64decode') {
      const parsedWord: CryptoJS.lib.WordArray = CryptoJS.enc.Base64.parse(cryptoInput.value)
      cryptoOutput.value = parsedWord.toString(CryptoJS.enc.Utf8)
    } else if (algo === 'urlencode') {
      cryptoOutput.value = encodeURIComponent(cryptoInput.value)
    } else if (algo === 'urldecode') {
      cryptoOutput.value = decodeURIComponent(cryptoInput.value)
    }
    ElMessage.success('计算成功')
  } catch (e: unknown) {
    ElMessage.error(`计算出错: ${getErrorMessage(e)}`)
  }
}

// 3. Unix Timestamp
const currentTimestamp = ref<number>(Math.floor(Date.now() / 1000))
const currentTimestampMs = ref<number>(Date.now())
const tsToConvert = ref<string>(Math.floor(Date.now() / 1000).toString())
const tsToDateResult = ref<string>('')
const dateToConvert = ref<string>(new Date().toISOString().replace('T', ' ').substring(0, 19))
const dateToTsResult = ref<string>('')
let tsTimer: ReturnType<typeof setInterval> | null = null

const convertTimestampToDate = (): void => {
  if (!tsToConvert.value) return
  const tsStr: string = tsToConvert.value.trim()
  const tsInt: number = parseInt(tsStr, 10)
  if (isNaN(tsInt)) {
    ElMessage.error('输入的时间戳非法')
    return
  }
  const date: Date = tsStr.length === 13 ? new Date(tsInt) : new Date(tsInt * 1000)
  tsToDateResult.value = date.toLocaleString('zh-CN', { hour12: false })
}

const convertDateToTimestamp = (): void => {
  if (!dateToConvert.value) return
  const val: string = dateToConvert.value.trim()
  const d: Date = new Date(val)
  if (isNaN(d.getTime())) {
    ElMessage.error('输入的日期格式非法，请使用: YYYY-MM-DD HH:mm:ss')
    return
  }
  dateToTsResult.value = `${Math.floor(d.getTime() / 1000)} 秒 / ${d.getTime()} 毫秒`
}

// 4. Radix/Base converter
const radixVal2 = ref<string>('')
const radixVal8 = ref<string>('')
const radixVal10 = ref<string>('')
const radixVal16 = ref<string>('')

const clearRadix = (): void => {
  radixVal2.value = ''
  radixVal8.value = ''
  radixVal10.value = ''
  radixVal16.value = ''
}

const onRadixInput = (base: number, val: string): void => {
  if (!val) {
    clearRadix()
    return
  }
  
  try {
    const decimal: number = parseInt(val, base)
    if (isNaN(decimal)) {
      throw new Error('数值非法')
    }
    
    if (base !== 2) radixVal2.value = decimal.toString(2)
    if (base !== 8) radixVal8.value = decimal.toString(8)
    if (base !== 10) radixVal10.value = decimal.toString(10)
    if (base !== 16) radixVal16.value = decimal.toString(16).toUpperCase()
  } catch (e) {
    ElMessage.error(`当前输入在其指定的${base}进制中不合法`)
  }
}

// 5. Regex Tester
const regexPattern = ref<string>('\\d+')
const regexText = ref<string>('Welcome to HooksVue 2026 navigation!')
const regexGlobal = ref<boolean>(true)
const regexIgnore = ref<boolean>(false)
const regexMulti = ref<boolean>(true)
const regexResultHtml = ref<string>('')

const runRegexTest = (): void => {
  if (!regexPattern.value) {
    regexResultHtml.value = regexText.value
    return
  }
  
  try {
    let flags: string = ''
    if (regexGlobal.value) flags += 'g'
    if (regexIgnore.value) flags += 'i'
    if (regexMulti.value) flags += 'm'
    
    const re: RegExp = new RegExp(regexPattern.value, flags)
    const escapedText: string = regexText.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    if (!regexGlobal.value) {
      const match: RegExpMatchArray | null = escapedText.match(re)
      if (match) {
        regexResultHtml.value = escapedText.replace(re, '<span class="regex-highlight">$&</span>')
      } else {
        regexResultHtml.value = escapedText
      }
    } else {
      regexResultHtml.value = escapedText.replace(re, '<span class="regex-highlight">$&</span>')
    }
  } catch (e: unknown) {
    regexResultHtml.value = `<span style="color: #ff4757;">正则表达式错误: ${getErrorMessage(e)}</span>`
  }
}

watch([regexPattern, regexText, regexGlobal, regexIgnore, regexMulti], runRegexTest)

onMounted(() => {
  tsTimer = setInterval(() => {
    currentTimestamp.value = Math.floor(Date.now() / 1000)
    currentTimestampMs.value = Date.now()
  }, 1000)
  runRegexTest()
  selectSubModule('format')
})

onUnmounted(() => {
  if (tsTimer !== null) clearInterval(tsTimer)
})
</script>

<style scoped lang="scss" src="./css/DeveloperToolbox.scss"></style>
