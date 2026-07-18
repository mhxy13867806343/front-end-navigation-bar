<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

interface RunLanguage {
  id: string
  label: string
  filename: string
  template: string
  runner: 'javascript' | 'html' | 'css' | 'text' | 'unsupported'
}

const languages: RunLanguage[] = [
  {
    id: 'javascript',
    label: 'JavaScript (Node.js 12.14.0)',
    filename: 'script.js',
    runner: 'javascript',
    template: 'const name = input.trim() || "Qzxdp";\nconsole.log("hello " + name);\nconsole.log("2 + 3 =", 2 + 3);'
  },
  {
    id: 'html',
    label: 'HTML (Browser)',
    filename: 'index.html',
    runner: 'html',
    template: '<h1>Hello RunCode</h1>\n<p>这段 HTML 会在右侧输出中预览。</p>\n<button onclick="alert(\'Hi\')">Click</button>'
  },
  {
    id: 'css',
    label: 'CSS (Browser)',
    filename: 'style.css',
    runner: 'css',
    template: 'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  background: #111827;\n  color: #93c5fd;\n  font: 18px ui-monospace, monospace;\n}\nbody::before {\n  content: "CSS preview";\n}'
  },
  {
    id: 'python',
    label: 'Python (3.8.1)',
    filename: 'main.py',
    runner: 'unsupported',
    template: 'name = input() or "Qzxdp"\nprint("hello " + name)'
  },
  {
    id: 'java',
    label: 'Java (OpenJDK 14.0.1)',
    filename: 'Main.java',
    runner: 'unsupported',
    template: 'class Main {\n  public static void main(String[] args) {\n    System.out.println("hello Qzxdp");\n  }\n}'
  },
  {
    id: 'go',
    label: 'Go (1.13.5)',
    filename: 'main.go',
    runner: 'unsupported',
    template: 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("hello Qzxdp")\n}'
  },
  {
    id: 'rust',
    label: 'Rust (1.40.0)',
    filename: 'main.rs',
    runner: 'unsupported',
    template: 'fn main() {\n    println!("hello Qzxdp");\n}'
  },
  {
    id: 'typescript',
    label: 'TypeScript (3.7.4)',
    filename: 'main.ts',
    runner: 'unsupported',
    template: 'const message: string = "hello Qzxdp";\nconsole.log(message);'
  },
  {
    id: 'plain',
    label: 'Plain Text',
    filename: 'input.txt',
    runner: 'text',
    template: 'hello Qzxdp'
  }
]

const selectedLanguageId = ref<string>('javascript')
const sourceCode = ref<string>(languages[0].template)
const stdinText = ref<string>('world')
const outputText = ref<string>('点击运行或按 F9 查看输出。')
const compileOptions = ref<string>('')
const commandArgs = ref<string>('')
const activeSideTab = ref<'input' | 'output'>('output')
const isRunning = ref<boolean>(false)
const previewHtml = ref<string>('')
const selectedLanguage = computed<RunLanguage>(() => languages.find((language: RunLanguage): boolean => language.id === selectedLanguageId.value) || languages[0])
const lineNumbers = computed<string>(() => sourceCode.value.split('\n').map((_, index: number): number => index + 1).join('\n'))

const insertTemplate = (): void => {
  sourceCode.value = selectedLanguage.value.template
  outputText.value = `已插入 ${selectedLanguage.value.label} 模板。`
}

const newFile = (): void => {
  sourceCode.value = ''
  outputText.value = '已新建空文件。'
  previewHtml.value = ''
}

const downloadCode = (): void => {
  const blob = new Blob([sourceCode.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = selectedLanguage.value.filename
  link.click()
  URL.revokeObjectURL(url)
}

const runJavaScript = (): string => {
  const logs: string[] = []
  const consoleProxy = {
    log: (...args: unknown[]): void => {
      logs.push(args.map((arg: unknown): string => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' '))
    },
    error: (...args: unknown[]): void => {
      logs.push(args.join(' '))
    }
  }
  const input = stdinText.value
  const args = commandArgs.value.split(/\s+/).filter(Boolean)
  const fn = new Function('console', 'input', 'args', sourceCode.value)
  fn(consoleProxy, input, args)
  return logs.length > 0 ? logs.join('\n') : '程序执行完成，没有输出。'
}

const runHtmlPreview = (): string => {
  previewHtml.value = sourceCode.value
  return 'HTML 已在预览窗口渲染。'
}

const runCssPreview = (): string => {
  previewHtml.value = `<!doctype html><html><head><style>${sourceCode.value}</style></head><body></body></html>`
  return 'CSS 已在预览窗口渲染。'
}

const runCode = async (): Promise<void> => {
  isRunning.value = true
  activeSideTab.value = 'output'
  outputText.value = 'Running...'
  await nextTick()

  try {
    if (selectedLanguage.value.runner === 'javascript') {
      outputText.value = runJavaScript()
      previewHtml.value = ''
    } else if (selectedLanguage.value.runner === 'html') {
      outputText.value = runHtmlPreview()
    } else if (selectedLanguage.value.runner === 'css') {
      outputText.value = runCssPreview()
    } else if (selectedLanguage.value.runner === 'text') {
      outputText.value = sourceCode.value
      previewHtml.value = ''
    } else {
      outputText.value = `${selectedLanguage.value.label} 需要后端编译服务。当前前端版本已保留模板、输入和输出布局，可接 Judge0 或自建编译 API。`
      previewHtml.value = ''
    }
  } catch (error) {
    outputText.value = error instanceof Error ? error.message : String(error)
    previewHtml.value = ''
  } finally {
    isRunning.value = false
  }
}

const handleLanguageChange = (): void => {
  insertTemplate()
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'F9') {
    event.preventDefault()
    void runCode()
  }
}
</script>

<template>
  <section class="runcode-workbench" tabindex="0" @keydown="handleKeydown">
    <header class="runcode-topbar">
      <div class="runcode-brand">Qzxdp</div>
      <div class="runcode-file-menu">
        <button type="button">文件</button>
        <button type="button" @click="newFile">新建</button>
        <button type="button" @click="downloadCode">下载</button>
        <button type="button" @click="insertTemplate">模板</button>
      </div>
      <select v-model="selectedLanguageId" class="runcode-select" @change="handleLanguageChange">
        <option v-for="language in languages" :key="language.id" :value="language.id">
          {{ language.label }}
        </option>
      </select>
      <input v-model="compileOptions" class="runcode-input" placeholder="编译选项">
      <input v-model="commandArgs" class="runcode-input" placeholder="命令行参数">
      <button class="runcode-run-btn" type="button" :disabled="isRunning" @click="runCode">
        <span>▶</span>
        {{ isRunning ? '运行中' : '运行 (F9)' }}
      </button>
    </header>

    <div class="runcode-main">
      <section class="runcode-editor-panel">
        <div class="runcode-tabbar">
          <span>{{ selectedLanguage.filename }}</span>
        </div>
        <div class="runcode-editor-shell">
          <pre class="runcode-line-numbers">{{ lineNumbers }}</pre>
          <textarea
            v-model="sourceCode"
            class="runcode-editor"
            spellcheck="false"
            aria-label="代码编辑器"
          />
        </div>
      </section>

      <aside class="runcode-side-panel">
        <div class="runcode-side-tabs">
          <button type="button" :class="{ active: activeSideTab === 'input' }" @click="activeSideTab = 'input'">输入</button>
          <button type="button" :class="{ active: activeSideTab === 'output' }" @click="activeSideTab = 'output'">输出</button>
        </div>
        <textarea
          v-if="activeSideTab === 'input'"
          v-model="stdinText"
          class="runcode-side-textarea"
          placeholder="标准输入 stdin"
          aria-label="输入"
        />
        <div v-else class="runcode-output">
          <pre>{{ outputText }}</pre>
          <iframe
            v-if="previewHtml"
            class="runcode-preview"
            :srcdoc="previewHtml"
            title="运行预览"
          />
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.runcode-workbench {
  min-height: calc(100dvh - 45px);
  display: flex;
  flex-direction: column;
  background: #151515;
  color: #f2f2f2;
  outline: none;
}

.runcode-topbar {
  min-height: 58px;
  display: grid;
  grid-template-columns: 142px auto minmax(260px, 360px) minmax(160px, 1fr) minmax(160px, 1fr) 180px;
  gap: 14px;
  align-items: center;
  padding: 10px 16px;
  background: #1e1e1e;
  border-bottom: 1px solid #050505;
}

.runcode-brand {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0;
}

.runcode-file-menu {
  display: flex;
  gap: 6px;
}

.runcode-file-menu button,
.runcode-run-btn {
  height: 38px;
  border: 0;
  border-radius: 5px;
  color: #f5f5f5;
  cursor: pointer;
  font-weight: 800;
}

.runcode-file-menu button {
  padding: 0 12px;
  background: #2b2b2b;
}

.runcode-select,
.runcode-input {
  width: 100%;
  height: 38px;
  border-radius: 5px;
  border: 1px solid #bfbfbf;
  background: #ffffff;
  color: #222222;
  padding: 0 14px;
  font-size: 14px;
  letter-spacing: 0;
}

.runcode-run-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #6f86f8;
  font-size: 16px;
}

.runcode-run-btn:disabled {
  opacity: 0.68;
  cursor: wait;
}

.runcode-main {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  background: #111111;
}

.runcode-editor-panel,
.runcode-side-panel {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.runcode-tabbar {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  background: #070707;
  border-bottom: 1px solid #2e2e2e;
  color: #d9d9d9;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.runcode-editor-shell {
  flex: 1;
  min-height: 560px;
  display: grid;
  grid-template-columns: 54px 1fr;
  background: #1f1f1f;
}

.runcode-line-numbers {
  margin: 0;
  padding: 16px 10px;
  background: #181818;
  color: #8d8d8d;
  text-align: right;
  user-select: none;
  font: 16px/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  overflow: hidden;
}

.runcode-editor {
  width: 100%;
  min-height: 100%;
  padding: 16px 18px;
  border: 0;
  outline: 0;
  resize: none;
  background: #202020;
  color: #f6f6f6;
  caret-color: #8eb8ff;
  font: 16px/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0;
}

.runcode-side-panel {
  border-left: 4px solid #000000;
  background: #171717;
}

.runcode-side-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 40px;
  background: #090909;
  border-bottom: 1px solid #2b2b2b;
}

.runcode-side-tabs button {
  border: 0;
  background: #151515;
  color: #adadad;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.runcode-side-tabs button.active {
  background: #242424;
  color: #f2f2f2;
}

.runcode-side-textarea,
.runcode-output {
  flex: 1;
  min-height: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: #1f1f1f;
  color: #f4f4f4;
  padding: 16px;
  font: 15px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0;
  resize: none;
}

.runcode-output {
  overflow: auto;
}

.runcode-output pre {
  margin: 0;
  white-space: pre-wrap;
}

.runcode-preview {
  width: 100%;
  height: 280px;
  margin-top: 16px;
  border: 1px solid #3b3b3b;
  border-radius: 5px;
  background: #ffffff;
}

@media (max-width: 1100px) {
  .runcode-topbar {
    grid-template-columns: 1fr;
  }

  .runcode-main {
    grid-template-columns: 1fr;
  }

  .runcode-side-panel {
    min-height: 360px;
    border-left: 0;
    border-top: 4px solid #000000;
  }
}
</style>
