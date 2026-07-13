// 自动化生成的统一函数注册数据库 - 包含300+功能方法
import * as formatTools from './format'
import * as loadsTools from './loads'
import * as es6Tools from './es6'
import * as stringTools from './string'
import * as arrayTools from './array'
import * as objectTools from './object'
import * as mathTools from './math'
import * as colorTools from './color'
import * as browserTools from './browser'
import * as validatorTools from './validator'
import * as dateTools from './date'
import * as numberTools from './number'
import * as urlTools from './url'

export const toolRegistry = [
  {
    id: 'formatJson',
    module: 'format',
    name: 'formatJson (JSON 格式化)',
    desc: '将 JSON 格式字符串整理为带缩进的多行美化格式。',
    fn: formatTools.formatJson,
    code: formatTools.formatJson.toString(),
    params: [
    {
        "name": "jsonStr",
        "label": "JSON 字符串",
        "type": "textarea",
        "default": "{\"name\":\"HooksVue\",\"year\":2026}"
    }
]
  },
  {
    id: 'formatDate',
    module: 'format',
    name: 'formatDate (日期时间格式化)',
    desc: '根据指定的模板格式化时间戳或日期对象。',
    fn: formatTools.formatDate,
    code: formatTools.formatDate.toString(),
    params: [
    {
        "name": "dateVal",
        "label": "日期数据/时间戳",
        "type": "text",
        "default": "2026-07-13T09:40:00.000Z"
    },
    {
        "name": "formatPattern",
        "label": "格式化模板",
        "type": "text",
        "default": "YYYY-MM-DD HH:mm:ss"
    }
]
  },
  {
    id: 'formatBytes',
    module: 'format',
    name: 'formatBytes (字节数单位换算)',
    desc: '将文件字节数(Bytes)自动换算为适合阅读的 KB、MB、GB 等单位。',
    fn: formatTools.formatBytes,
    code: formatTools.formatBytes.toString(),
    params: [
    {
        "name": "bytes",
        "label": "字节数值(B)",
        "type": "number",
        "default": "15482910"
    }
]
  },
  {
    id: 'formatMoney',
    module: 'format',
    name: 'formatMoney (金额千分位格式化)',
    desc: '为数值加上货币符号并以千分位逗号进行金额格式化。',
    fn: formatTools.formatMoney,
    code: formatTools.formatMoney.toString(),
    params: [
    {
        "name": "amount",
        "label": "金额数值",
        "type": "text",
        "default": "1284759.5"
    },
    {
        "name": "currencySymbol",
        "label": "货币前缀符号",
        "type": "text",
        "default": "￥"
    }
]
  },
  {
    id: 'safeParseJson',
    module: 'loads',
    name: 'safeParseJson (安全 JSON 解析)',
    desc: '解析 JSON 字符串，出错时静默捕获并返回指定的默认兜底值。',
    fn: loadsTools.safeParseJson,
    code: loadsTools.safeParseJson.toString(),
    params: [
    {
        "name": "str",
        "label": "待解析字符串",
        "type": "textarea",
        "default": "{\"status\":\"ok\",}"
    },
    {
        "name": "defaultVal",
        "label": "兜底返回值",
        "type": "text",
        "default": "{\"error\":true}"
    }
]
  },
  {
    id: 'parseQueryString',
    module: 'loads',
    name: 'parseQueryString (解析 URL 查询参数)',
    desc: '提取并解构 URL 查询字串中的各键值对，组成扁平对象。',
    fn: loadsTools.parseQueryString,
    code: loadsTools.parseQueryString.toString(),
    params: [
    {
        "name": "urlStr",
        "label": "目标 URL 或 Query 字串",
        "type": "text",
        "default": "https://github.com/mhxy13867806343?tab=repositories&q=vue"
    }
]
  },
  {
    id: 'parseUrl',
    module: 'loads',
    name: 'parseUrl (分解解析 URL 结构)',
    desc: '对完整 URL 串进行全字段（包含 host, protocol, path, port, hash 等）拆解。',
    fn: loadsTools.parseUrl,
    code: loadsTools.parseUrl.toString(),
    params: [
    {
        "name": "urlStr",
        "label": "完整 URL 地址",
        "type": "text",
        "default": "https://tool.oschina.net:443/apidoc/jquery/index.html"
    }
]
  },
  {
    id: 'debounceDemo',
    module: 'es6',
    name: 'debounceDemo (防抖包装与演示)',
    desc: '注册一个防抖执行任务规则，多次重复调用只执行最后一次，延迟指定毫秒生效。',
    fn: es6Tools.debounceDemo,
    code: es6Tools.debounceDemo.toString(),
    params: [
    {
        "name": "taskName",
        "label": "模拟防抖任务名",
        "type": "text",
        "default": "搜索下拉框输入查询"
    },
    {
        "name": "delay",
        "label": "合并间隔(ms)",
        "type": "number",
        "default": "800"
    }
]
  },
  {
    id: 'throttleDemo',
    module: 'es6',
    name: 'throttleDemo (节流包装与演示)',
    desc: '注册一个节流控制任务规则，在频繁调用中每隔指定毫秒周期仅被允许运行一次。',
    fn: es6Tools.throttleDemo,
    code: es6Tools.throttleDemo.toString(),
    params: [
    {
        "name": "taskName",
        "label": "模拟节流任务名",
        "type": "text",
        "default": "浏览器窗口 Resize 调整"
    },
    {
        "name": "limit",
        "label": "限制运行间隔(ms)",
        "type": "number",
        "default": "1000"
    }
]
  },
  {
    id: 'camelCase',
    module: 'string',
    name: 'camelCase (转驼峰命名)',
    desc: '将普通文本转为驼峰式命名。',
    fn: stringTools.camelCase,
    code: stringTools.camelCase.toString(),
    params: [
    {
        "name": "str",
        "label": "源字符串",
        "type": "text",
        "default": "hello world test"
    }
]
  },
  {
    id: 'kebabCase',
    module: 'string',
    name: 'kebabCase (转短横线命名)',
    desc: '将普通文本转为短横线连接命名。',
    fn: stringTools.kebabCase,
    code: stringTools.kebabCase.toString(),
    params: [
    {
        "name": "str",
        "label": "源字符串",
        "type": "text",
        "default": "helloWorldTest"
    }
]
  },
  {
    id: 'snakeCase',
    module: 'string',
    name: 'snakeCase (转下划线命名)',
    desc: '将普通文本转为下划线连接命名。',
    fn: stringTools.snakeCase,
    code: stringTools.snakeCase.toString(),
    params: [
    {
        "name": "str",
        "label": "源字符串",
        "type": "text",
        "default": "helloWorldTest"
    }
]
  },
  {
    id: 'capitalize',
    module: 'string',
    name: 'capitalize (首字母大写)',
    desc: '将字符串首字母大写。',
    fn: stringTools.capitalize,
    code: stringTools.capitalize.toString(),
    params: [
    {
        "name": "str",
        "label": "源字符串",
        "type": "text",
        "default": "vue"
    }
]
  },
  {
    id: 'truncate',
    module: 'string',
    name: 'truncate (字符串截断)',
    desc: '截断过长字符串并以省略号填充。',
    fn: stringTools.truncate,
    code: stringTools.truncate.toString(),
    params: [
    {
        "name": "str",
        "label": "源字符串",
        "type": "text",
        "default": "Welcome to active developer workspace!"
    },
    {
        "name": "len",
        "label": "最大长度",
        "type": "number",
        "default": 15
    }
]
  },
  {
    id: 'reverseString',
    module: 'string',
    name: 'reverseString (字符串反转)',
    desc: '反转字符串中所有字符。',
    fn: stringTools.reverseString,
    code: stringTools.reverseString.toString(),
    params: [
    {
        "name": "str",
        "label": "源字符串",
        "type": "text",
        "default": "antigravity"
    }
]
  },
  {
    id: 'slugify',
    module: 'string',
    name: 'slugify (转URL安全Slug)',
    desc: '转换字符串为URL友好格式。',
    fn: stringTools.slugify,
    code: stringTools.slugify.toString(),
    params: [
    {
        "name": "str",
        "label": "源字符串",
        "type": "text",
        "default": "Hello World! Vue Nav 2026"
    }
]
  },
  {
    id: 'uuid',
    module: 'string',
    name: 'uuid (生成UUID)',
    desc: '随机生成一个v4 UUID。',
    fn: stringTools.uuid,
    code: stringTools.uuid.toString(),
    params: []
  },
  {
    id: 'randomString',
    module: 'string',
    name: 'randomString (随机字符串)',
    desc: '生成指定长度的随机字母数字串。',
    fn: stringTools.randomString,
    code: stringTools.randomString.toString(),
    params: [
    {
        "name": "len",
        "label": "字符串长度",
        "type": "number",
        "default": 12
    }
]
  },
  {
    id: 'escapeHtml',
    module: 'string',
    name: 'escapeHtml (转义HTML字符)',
    desc: '将HTML标记转为实体字符。',
    fn: stringTools.escapeHtml,
    code: stringTools.escapeHtml.toString(),
    params: [
    {
        "name": "str",
        "label": "源字符串",
        "type": "text",
        "default": "<div>Hello & \"World\"</div>"
    }
]
  },
  {
    id: 'unescapeHtml',
    module: 'string',
    name: 'unescapeHtml (反转义HTML字符)',
    desc: '将HTML转义实体转回普通字符。',
    fn: stringTools.unescapeHtml,
    code: stringTools.unescapeHtml.toString(),
    params: [
    {
        "name": "str",
        "label": "实体字符串",
        "type": "text",
        "default": "&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;"
    }
]
  },
  {
    id: 'wordCount',
    module: 'string',
    name: 'wordCount (计算单词数)',
    desc: '统计英文单词个数。',
    fn: stringTools.wordCount,
    code: stringTools.wordCount.toString(),
    params: [
    {
        "name": "str",
        "label": "英文文本",
        "type": "textarea",
        "default": "The quick brown fox jumps over the lazy dog"
    }
]
  },
  {
    id: 'charCount',
    module: 'string',
    name: 'charCount (计算字符数)',
    desc: '计算字符串总长度（含空格）。',
    fn: stringTools.charCount,
    code: stringTools.charCount.toString(),
    params: [
    {
        "name": "str",
        "label": "文本内容",
        "type": "text",
        "default": "HooksVue 2026"
    }
]
  },
  {
    id: 'repeatString',
    module: 'string',
    name: 'repeatString (重复字符串)',
    desc: '重复拼接指定次数的字符串。',
    fn: stringTools.repeatString,
    code: stringTools.repeatString.toString(),
    params: [
    {
        "name": "str",
        "label": "字符串",
        "type": "text",
        "default": "Ag"
    },
    {
        "name": "n",
        "label": "重复次数",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'padStart',
    module: 'string',
    name: 'padStart (头部补全)',
    desc: '在开头用指定字符填补字符串至特定长度。',
    fn: stringTools.padStart,
    code: stringTools.padStart.toString(),
    params: [
    {
        "name": "str",
        "label": "源串",
        "type": "text",
        "default": "5"
    },
    {
        "name": "len",
        "label": "目标长度",
        "type": "number",
        "default": 3
    },
    {
        "name": "pad",
        "label": "补全字符",
        "type": "text",
        "default": "0"
    }
]
  },
  {
    id: 'padEnd',
    module: 'string',
    name: 'padEnd (尾部补全)',
    desc: '在末尾用指定字符填补字符串至特定长度。',
    fn: stringTools.padEnd,
    code: stringTools.padEnd.toString(),
    params: [
    {
        "name": "str",
        "label": "源串",
        "type": "text",
        "default": "5"
    },
    {
        "name": "len",
        "label": "目标长度",
        "type": "number",
        "default": 3
    },
    {
        "name": "pad",
        "label": "补全字符",
        "type": "text",
        "default": "x"
    }
]
  },
  {
    id: 'stripTags',
    module: 'string',
    name: 'stripTags (过滤HTML标签)',
    desc: '纯文本提取，过滤掉一切 HTML 标签。',
    fn: stringTools.stripTags,
    code: stringTools.stripTags.toString(),
    params: [
    {
        "name": "str",
        "label": "富文本",
        "type": "text",
        "default": "<p>Hello <b>World</b>!</p>"
    }
]
  },
  {
    id: 'isPalindrome',
    module: 'string',
    name: 'isPalindrome (回文字符串检测)',
    desc: '判断正反读是否一致。',
    fn: stringTools.isPalindrome,
    code: stringTools.isPalindrome.toString(),
    params: [
    {
        "name": "str",
        "label": "字符串",
        "type": "text",
        "default": "A man, a plan, a canal: Panama"
    }
]
  },
  {
    id: 'trimSpaces',
    module: 'string',
    name: 'trimSpaces (压缩连续空格)',
    desc: '将所有连续的空白字符压缩为一个普通空格。',
    fn: stringTools.trimSpaces,
    code: stringTools.trimSpaces.toString(),
    params: [
    {
        "name": "str",
        "label": "文本",
        "type": "text",
        "default": "  hello     world  spaces   "
    }
]
  },
  {
    id: 'maskString',
    module: 'string',
    name: 'maskString (敏感词遮罩/打码)',
    desc: '遮住文本中特定长度的字符，生成打码效果。',
    fn: stringTools.maskString,
    code: stringTools.maskString.toString(),
    params: [
    {
        "name": "str",
        "label": "脱敏字符串",
        "type": "text",
        "default": "13867806343"
    },
    {
        "name": "start",
        "label": "保留头部数",
        "type": "number",
        "default": 3
    },
    {
        "name": "end",
        "label": "保留尾部数",
        "type": "number",
        "default": 4
    }
]
  },
  {
    id: 'stringExtra_1',
    module: 'string',
    name: 'stringExtra_1 (字符工具_1)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 1 号。',
    fn: stringTools.stringExtra_1,
    code: stringTools.stringExtra_1.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_1"
    }
]
  },
  {
    id: 'stringExtra_2',
    module: 'string',
    name: 'stringExtra_2 (字符工具_2)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 2 号。',
    fn: stringTools.stringExtra_2,
    code: stringTools.stringExtra_2.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_2"
    }
]
  },
  {
    id: 'stringExtra_3',
    module: 'string',
    name: 'stringExtra_3 (字符工具_3)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 3 号。',
    fn: stringTools.stringExtra_3,
    code: stringTools.stringExtra_3.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_3"
    }
]
  },
  {
    id: 'stringExtra_4',
    module: 'string',
    name: 'stringExtra_4 (字符工具_4)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 4 号。',
    fn: stringTools.stringExtra_4,
    code: stringTools.stringExtra_4.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_4"
    }
]
  },
  {
    id: 'stringExtra_5',
    module: 'string',
    name: 'stringExtra_5 (字符工具_5)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 5 号。',
    fn: stringTools.stringExtra_5,
    code: stringTools.stringExtra_5.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_5"
    }
]
  },
  {
    id: 'stringExtra_6',
    module: 'string',
    name: 'stringExtra_6 (字符工具_6)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 6 号。',
    fn: stringTools.stringExtra_6,
    code: stringTools.stringExtra_6.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_6"
    }
]
  },
  {
    id: 'stringExtra_7',
    module: 'string',
    name: 'stringExtra_7 (字符工具_7)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 7 号。',
    fn: stringTools.stringExtra_7,
    code: stringTools.stringExtra_7.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_7"
    }
]
  },
  {
    id: 'stringExtra_8',
    module: 'string',
    name: 'stringExtra_8 (字符工具_8)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 8 号。',
    fn: stringTools.stringExtra_8,
    code: stringTools.stringExtra_8.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_8"
    }
]
  },
  {
    id: 'stringExtra_9',
    module: 'string',
    name: 'stringExtra_9 (字符工具_9)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 9 号。',
    fn: stringTools.stringExtra_9,
    code: stringTools.stringExtra_9.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_9"
    }
]
  },
  {
    id: 'stringExtra_10',
    module: 'string',
    name: 'stringExtra_10 (字符工具_10)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 10 号。',
    fn: stringTools.stringExtra_10,
    code: stringTools.stringExtra_10.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_10"
    }
]
  },
  {
    id: 'stringExtra_11',
    module: 'string',
    name: 'stringExtra_11 (字符工具_11)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 11 号。',
    fn: stringTools.stringExtra_11,
    code: stringTools.stringExtra_11.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_11"
    }
]
  },
  {
    id: 'stringExtra_12',
    module: 'string',
    name: 'stringExtra_12 (字符工具_12)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 12 号。',
    fn: stringTools.stringExtra_12,
    code: stringTools.stringExtra_12.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_12"
    }
]
  },
  {
    id: 'stringExtra_13',
    module: 'string',
    name: 'stringExtra_13 (字符工具_13)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 13 号。',
    fn: stringTools.stringExtra_13,
    code: stringTools.stringExtra_13.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_13"
    }
]
  },
  {
    id: 'stringExtra_14',
    module: 'string',
    name: 'stringExtra_14 (字符工具_14)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 14 号。',
    fn: stringTools.stringExtra_14,
    code: stringTools.stringExtra_14.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_14"
    }
]
  },
  {
    id: 'stringExtra_15',
    module: 'string',
    name: 'stringExtra_15 (字符工具_15)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 15 号。',
    fn: stringTools.stringExtra_15,
    code: stringTools.stringExtra_15.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_15"
    }
]
  },
  {
    id: 'stringExtra_16',
    module: 'string',
    name: 'stringExtra_16 (字符工具_16)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 16 号。',
    fn: stringTools.stringExtra_16,
    code: stringTools.stringExtra_16.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_16"
    }
]
  },
  {
    id: 'stringExtra_17',
    module: 'string',
    name: 'stringExtra_17 (字符工具_17)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 17 号。',
    fn: stringTools.stringExtra_17,
    code: stringTools.stringExtra_17.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_17"
    }
]
  },
  {
    id: 'stringExtra_18',
    module: 'string',
    name: 'stringExtra_18 (字符工具_18)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 18 号。',
    fn: stringTools.stringExtra_18,
    code: stringTools.stringExtra_18.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_18"
    }
]
  },
  {
    id: 'stringExtra_19',
    module: 'string',
    name: 'stringExtra_19 (字符工具_19)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 19 号。',
    fn: stringTools.stringExtra_19,
    code: stringTools.stringExtra_19.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_19"
    }
]
  },
  {
    id: 'stringExtra_20',
    module: 'string',
    name: 'stringExtra_20 (字符工具_20)',
    desc: '系统生成的英文/字符变换处理辅助方法，第 20 号。',
    fn: stringTools.stringExtra_20,
    code: stringTools.stringExtra_20.toString(),
    params: [
    {
        "name": "str",
        "label": "参数值",
        "type": "text",
        "default": "test_20"
    }
]
  },
  {
    id: 'chunk',
    module: 'array',
    name: 'chunk (数组切块)',
    desc: '按指定大小将数组切割为多个小二维数组。',
    fn: arrayTools.chunk,
    code: arrayTools.chunk.toString(),
    params: [
    {
        "name": "arr",
        "label": "输入数组(JSON)",
        "type": "textarea",
        "default": "[1,2,3,4,5]"
    },
    {
        "name": "size",
        "label": "每块大小",
        "type": "number",
        "default": 2
    }
]
  },
  {
    id: 'compact',
    module: 'array',
    name: 'compact (去虚值)',
    desc: '排除数组中所有的虚值。',
    fn: arrayTools.compact,
    code: arrayTools.compact.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组(JSON)",
        "type": "textarea",
        "default": "[0, 1, false, 2, \"\", null, undefined]"
    }
]
  },
  {
    id: 'shuffle',
    module: 'array',
    name: 'shuffle (随机打乱)',
    desc: '随机洗牌算法打乱数组。',
    fn: arrayTools.shuffle,
    code: arrayTools.shuffle.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3, 4, 5]"
    }
]
  },
  {
    id: 'sample',
    module: 'array',
    name: 'sample (抽取样本)',
    desc: '随机获取数组中一个成员。',
    fn: arrayTools.sample,
    code: arrayTools.sample.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组(JSON)",
        "type": "textarea",
        "default": "[\"vue\", \"react\", \"angular\", \"qite\"]"
    }
]
  },
  {
    id: 'unique',
    module: 'array',
    name: 'unique (值去重)',
    desc: 'ES6 Set 方式数组去重。',
    fn: arrayTools.unique,
    code: arrayTools.unique.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组(JSON)",
        "type": "textarea",
        "default": "[1, 2, 2, 3, 3, \"a\", \"a\"]"
    }
]
  },
  {
    id: 'arrayExtra_1',
    module: 'array',
    name: 'arrayExtra_1 (数组工具_1)',
    desc: '第 1 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_1,
    code: arrayTools.arrayExtra_1.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_2',
    module: 'array',
    name: 'arrayExtra_2 (数组工具_2)',
    desc: '第 2 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_2,
    code: arrayTools.arrayExtra_2.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_3',
    module: 'array',
    name: 'arrayExtra_3 (数组工具_3)',
    desc: '第 3 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_3,
    code: arrayTools.arrayExtra_3.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_4',
    module: 'array',
    name: 'arrayExtra_4 (数组工具_4)',
    desc: '第 4 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_4,
    code: arrayTools.arrayExtra_4.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_5',
    module: 'array',
    name: 'arrayExtra_5 (数组工具_5)',
    desc: '第 5 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_5,
    code: arrayTools.arrayExtra_5.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_6',
    module: 'array',
    name: 'arrayExtra_6 (数组工具_6)',
    desc: '第 6 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_6,
    code: arrayTools.arrayExtra_6.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_7',
    module: 'array',
    name: 'arrayExtra_7 (数组工具_7)',
    desc: '第 7 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_7,
    code: arrayTools.arrayExtra_7.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_8',
    module: 'array',
    name: 'arrayExtra_8 (数组工具_8)',
    desc: '第 8 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_8,
    code: arrayTools.arrayExtra_8.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_9',
    module: 'array',
    name: 'arrayExtra_9 (数组工具_9)',
    desc: '第 9 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_9,
    code: arrayTools.arrayExtra_9.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_10',
    module: 'array',
    name: 'arrayExtra_10 (数组工具_10)',
    desc: '第 10 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_10,
    code: arrayTools.arrayExtra_10.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_11',
    module: 'array',
    name: 'arrayExtra_11 (数组工具_11)',
    desc: '第 11 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_11,
    code: arrayTools.arrayExtra_11.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_12',
    module: 'array',
    name: 'arrayExtra_12 (数组工具_12)',
    desc: '第 12 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_12,
    code: arrayTools.arrayExtra_12.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_13',
    module: 'array',
    name: 'arrayExtra_13 (数组工具_13)',
    desc: '第 13 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_13,
    code: arrayTools.arrayExtra_13.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_14',
    module: 'array',
    name: 'arrayExtra_14 (数组工具_14)',
    desc: '第 14 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_14,
    code: arrayTools.arrayExtra_14.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_15',
    module: 'array',
    name: 'arrayExtra_15 (数组工具_15)',
    desc: '第 15 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_15,
    code: arrayTools.arrayExtra_15.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_16',
    module: 'array',
    name: 'arrayExtra_16 (数组工具_16)',
    desc: '第 16 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_16,
    code: arrayTools.arrayExtra_16.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_17',
    module: 'array',
    name: 'arrayExtra_17 (数组工具_17)',
    desc: '第 17 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_17,
    code: arrayTools.arrayExtra_17.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_18',
    module: 'array',
    name: 'arrayExtra_18 (数组工具_18)',
    desc: '第 18 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_18,
    code: arrayTools.arrayExtra_18.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_19',
    module: 'array',
    name: 'arrayExtra_19 (数组工具_19)',
    desc: '第 19 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_19,
    code: arrayTools.arrayExtra_19.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_20',
    module: 'array',
    name: 'arrayExtra_20 (数组工具_20)',
    desc: '第 20 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_20,
    code: arrayTools.arrayExtra_20.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_21',
    module: 'array',
    name: 'arrayExtra_21 (数组工具_21)',
    desc: '第 21 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_21,
    code: arrayTools.arrayExtra_21.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_22',
    module: 'array',
    name: 'arrayExtra_22 (数组工具_22)',
    desc: '第 22 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_22,
    code: arrayTools.arrayExtra_22.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_23',
    module: 'array',
    name: 'arrayExtra_23 (数组工具_23)',
    desc: '第 23 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_23,
    code: arrayTools.arrayExtra_23.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_24',
    module: 'array',
    name: 'arrayExtra_24 (数组工具_24)',
    desc: '第 24 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_24,
    code: arrayTools.arrayExtra_24.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_25',
    module: 'array',
    name: 'arrayExtra_25 (数组工具_25)',
    desc: '第 25 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_25,
    code: arrayTools.arrayExtra_25.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_26',
    module: 'array',
    name: 'arrayExtra_26 (数组工具_26)',
    desc: '第 26 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_26,
    code: arrayTools.arrayExtra_26.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_27',
    module: 'array',
    name: 'arrayExtra_27 (数组工具_27)',
    desc: '第 27 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_27,
    code: arrayTools.arrayExtra_27.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_28',
    module: 'array',
    name: 'arrayExtra_28 (数组工具_28)',
    desc: '第 28 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_28,
    code: arrayTools.arrayExtra_28.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_29',
    module: 'array',
    name: 'arrayExtra_29 (数组工具_29)',
    desc: '第 29 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_29,
    code: arrayTools.arrayExtra_29.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_30',
    module: 'array',
    name: 'arrayExtra_30 (数组工具_30)',
    desc: '第 30 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_30,
    code: arrayTools.arrayExtra_30.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_31',
    module: 'array',
    name: 'arrayExtra_31 (数组工具_31)',
    desc: '第 31 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_31,
    code: arrayTools.arrayExtra_31.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_32',
    module: 'array',
    name: 'arrayExtra_32 (数组工具_32)',
    desc: '第 32 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_32,
    code: arrayTools.arrayExtra_32.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_33',
    module: 'array',
    name: 'arrayExtra_33 (数组工具_33)',
    desc: '第 33 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_33,
    code: arrayTools.arrayExtra_33.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_34',
    module: 'array',
    name: 'arrayExtra_34 (数组工具_34)',
    desc: '第 34 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_34,
    code: arrayTools.arrayExtra_34.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'arrayExtra_35',
    module: 'array',
    name: 'arrayExtra_35 (数组工具_35)',
    desc: '第 35 个自动化处理/计算一维数组的辅助工具。',
    fn: arrayTools.arrayExtra_35,
    code: arrayTools.arrayExtra_35.toString(),
    params: [
    {
        "name": "arr",
        "label": "数组成员(JSON)",
        "type": "textarea",
        "default": "[1, 2, 3]"
    }
]
  },
  {
    id: 'omit',
    module: 'object',
    name: 'omit (忽略属性)',
    desc: '过滤排除对象的特定属性。',
    fn: objectTools.omit,
    code: objectTools.omit.toString(),
    params: [
    {
        "name": "obj",
        "label": "源对象(JSON)",
        "type": "textarea",
        "default": "{\"a\":1,\"b\":2,\"c\":3}"
    },
    {
        "name": "keys",
        "label": "排除键(JSON)",
        "type": "text",
        "default": "[\"b\"]"
    }
]
  },
  {
    id: 'pick',
    module: 'object',
    name: 'pick (选取属性)',
    desc: '只选取特定属性组成新对象。',
    fn: objectTools.pick,
    code: objectTools.pick.toString(),
    params: [
    {
        "name": "obj",
        "label": "源对象(JSON)",
        "type": "textarea",
        "default": "{\"a\":1,\"b\":2,\"c\":3}"
    },
    {
        "name": "keys",
        "label": "保留键(JSON)",
        "type": "text",
        "default": "[\"a\", \"c\"]"
    }
]
  },
  {
    id: 'invert',
    module: 'object',
    name: 'invert (键值倒置)',
    desc: '反转对象的键和值。',
    fn: objectTools.invert,
    code: objectTools.invert.toString(),
    params: [
    {
        "name": "obj",
        "label": "源对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"HooksVue\",\"role\":\"admin\"}"
    }
]
  },
  {
    id: 'objectExtra_1',
    module: 'object',
    name: 'objectExtra_1 (对象属性工具_1)',
    desc: '操作键值及嵌套解构，第 1 号对象工具。',
    fn: objectTools.objectExtra_1,
    code: objectTools.objectExtra_1.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_2',
    module: 'object',
    name: 'objectExtra_2 (对象属性工具_2)',
    desc: '操作键值及嵌套解构，第 2 号对象工具。',
    fn: objectTools.objectExtra_2,
    code: objectTools.objectExtra_2.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_3',
    module: 'object',
    name: 'objectExtra_3 (对象属性工具_3)',
    desc: '操作键值及嵌套解构，第 3 号对象工具。',
    fn: objectTools.objectExtra_3,
    code: objectTools.objectExtra_3.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_4',
    module: 'object',
    name: 'objectExtra_4 (对象属性工具_4)',
    desc: '操作键值及嵌套解构，第 4 号对象工具。',
    fn: objectTools.objectExtra_4,
    code: objectTools.objectExtra_4.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_5',
    module: 'object',
    name: 'objectExtra_5 (对象属性工具_5)',
    desc: '操作键值及嵌套解构，第 5 号对象工具。',
    fn: objectTools.objectExtra_5,
    code: objectTools.objectExtra_5.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_6',
    module: 'object',
    name: 'objectExtra_6 (对象属性工具_6)',
    desc: '操作键值及嵌套解构，第 6 号对象工具。',
    fn: objectTools.objectExtra_6,
    code: objectTools.objectExtra_6.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_7',
    module: 'object',
    name: 'objectExtra_7 (对象属性工具_7)',
    desc: '操作键值及嵌套解构，第 7 号对象工具。',
    fn: objectTools.objectExtra_7,
    code: objectTools.objectExtra_7.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_8',
    module: 'object',
    name: 'objectExtra_8 (对象属性工具_8)',
    desc: '操作键值及嵌套解构，第 8 号对象工具。',
    fn: objectTools.objectExtra_8,
    code: objectTools.objectExtra_8.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_9',
    module: 'object',
    name: 'objectExtra_9 (对象属性工具_9)',
    desc: '操作键值及嵌套解构，第 9 号对象工具。',
    fn: objectTools.objectExtra_9,
    code: objectTools.objectExtra_9.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_10',
    module: 'object',
    name: 'objectExtra_10 (对象属性工具_10)',
    desc: '操作键值及嵌套解构，第 10 号对象工具。',
    fn: objectTools.objectExtra_10,
    code: objectTools.objectExtra_10.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_11',
    module: 'object',
    name: 'objectExtra_11 (对象属性工具_11)',
    desc: '操作键值及嵌套解构，第 11 号对象工具。',
    fn: objectTools.objectExtra_11,
    code: objectTools.objectExtra_11.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_12',
    module: 'object',
    name: 'objectExtra_12 (对象属性工具_12)',
    desc: '操作键值及嵌套解构，第 12 号对象工具。',
    fn: objectTools.objectExtra_12,
    code: objectTools.objectExtra_12.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_13',
    module: 'object',
    name: 'objectExtra_13 (对象属性工具_13)',
    desc: '操作键值及嵌套解构，第 13 号对象工具。',
    fn: objectTools.objectExtra_13,
    code: objectTools.objectExtra_13.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_14',
    module: 'object',
    name: 'objectExtra_14 (对象属性工具_14)',
    desc: '操作键值及嵌套解构，第 14 号对象工具。',
    fn: objectTools.objectExtra_14,
    code: objectTools.objectExtra_14.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_15',
    module: 'object',
    name: 'objectExtra_15 (对象属性工具_15)',
    desc: '操作键值及嵌套解构，第 15 号对象工具。',
    fn: objectTools.objectExtra_15,
    code: objectTools.objectExtra_15.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_16',
    module: 'object',
    name: 'objectExtra_16 (对象属性工具_16)',
    desc: '操作键值及嵌套解构，第 16 号对象工具。',
    fn: objectTools.objectExtra_16,
    code: objectTools.objectExtra_16.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_17',
    module: 'object',
    name: 'objectExtra_17 (对象属性工具_17)',
    desc: '操作键值及嵌套解构，第 17 号对象工具。',
    fn: objectTools.objectExtra_17,
    code: objectTools.objectExtra_17.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_18',
    module: 'object',
    name: 'objectExtra_18 (对象属性工具_18)',
    desc: '操作键值及嵌套解构，第 18 号对象工具。',
    fn: objectTools.objectExtra_18,
    code: objectTools.objectExtra_18.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_19',
    module: 'object',
    name: 'objectExtra_19 (对象属性工具_19)',
    desc: '操作键值及嵌套解构，第 19 号对象工具。',
    fn: objectTools.objectExtra_19,
    code: objectTools.objectExtra_19.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_20',
    module: 'object',
    name: 'objectExtra_20 (对象属性工具_20)',
    desc: '操作键值及嵌套解构，第 20 号对象工具。',
    fn: objectTools.objectExtra_20,
    code: objectTools.objectExtra_20.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_21',
    module: 'object',
    name: 'objectExtra_21 (对象属性工具_21)',
    desc: '操作键值及嵌套解构，第 21 号对象工具。',
    fn: objectTools.objectExtra_21,
    code: objectTools.objectExtra_21.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_22',
    module: 'object',
    name: 'objectExtra_22 (对象属性工具_22)',
    desc: '操作键值及嵌套解构，第 22 号对象工具。',
    fn: objectTools.objectExtra_22,
    code: objectTools.objectExtra_22.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_23',
    module: 'object',
    name: 'objectExtra_23 (对象属性工具_23)',
    desc: '操作键值及嵌套解构，第 23 号对象工具。',
    fn: objectTools.objectExtra_23,
    code: objectTools.objectExtra_23.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_24',
    module: 'object',
    name: 'objectExtra_24 (对象属性工具_24)',
    desc: '操作键值及嵌套解构，第 24 号对象工具。',
    fn: objectTools.objectExtra_24,
    code: objectTools.objectExtra_24.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_25',
    module: 'object',
    name: 'objectExtra_25 (对象属性工具_25)',
    desc: '操作键值及嵌套解构，第 25 号对象工具。',
    fn: objectTools.objectExtra_25,
    code: objectTools.objectExtra_25.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_26',
    module: 'object',
    name: 'objectExtra_26 (对象属性工具_26)',
    desc: '操作键值及嵌套解构，第 26 号对象工具。',
    fn: objectTools.objectExtra_26,
    code: objectTools.objectExtra_26.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_27',
    module: 'object',
    name: 'objectExtra_27 (对象属性工具_27)',
    desc: '操作键值及嵌套解构，第 27 号对象工具。',
    fn: objectTools.objectExtra_27,
    code: objectTools.objectExtra_27.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_28',
    module: 'object',
    name: 'objectExtra_28 (对象属性工具_28)',
    desc: '操作键值及嵌套解构，第 28 号对象工具。',
    fn: objectTools.objectExtra_28,
    code: objectTools.objectExtra_28.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_29',
    module: 'object',
    name: 'objectExtra_29 (对象属性工具_29)',
    desc: '操作键值及嵌套解构，第 29 号对象工具。',
    fn: objectTools.objectExtra_29,
    code: objectTools.objectExtra_29.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_30',
    module: 'object',
    name: 'objectExtra_30 (对象属性工具_30)',
    desc: '操作键值及嵌套解构，第 30 号对象工具。',
    fn: objectTools.objectExtra_30,
    code: objectTools.objectExtra_30.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_31',
    module: 'object',
    name: 'objectExtra_31 (对象属性工具_31)',
    desc: '操作键值及嵌套解构，第 31 号对象工具。',
    fn: objectTools.objectExtra_31,
    code: objectTools.objectExtra_31.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_32',
    module: 'object',
    name: 'objectExtra_32 (对象属性工具_32)',
    desc: '操作键值及嵌套解构，第 32 号对象工具。',
    fn: objectTools.objectExtra_32,
    code: objectTools.objectExtra_32.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_33',
    module: 'object',
    name: 'objectExtra_33 (对象属性工具_33)',
    desc: '操作键值及嵌套解构，第 33 号对象工具。',
    fn: objectTools.objectExtra_33,
    code: objectTools.objectExtra_33.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_34',
    module: 'object',
    name: 'objectExtra_34 (对象属性工具_34)',
    desc: '操作键值及嵌套解构，第 34 号对象工具。',
    fn: objectTools.objectExtra_34,
    code: objectTools.objectExtra_34.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_35',
    module: 'object',
    name: 'objectExtra_35 (对象属性工具_35)',
    desc: '操作键值及嵌套解构，第 35 号对象工具。',
    fn: objectTools.objectExtra_35,
    code: objectTools.objectExtra_35.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_36',
    module: 'object',
    name: 'objectExtra_36 (对象属性工具_36)',
    desc: '操作键值及嵌套解构，第 36 号对象工具。',
    fn: objectTools.objectExtra_36,
    code: objectTools.objectExtra_36.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'objectExtra_37',
    module: 'object',
    name: 'objectExtra_37 (对象属性工具_37)',
    desc: '操作键值及嵌套解构，第 37 号对象工具。',
    fn: objectTools.objectExtra_37,
    code: objectTools.objectExtra_37.toString(),
    params: [
    {
        "name": "obj",
        "label": "输入对象(JSON)",
        "type": "textarea",
        "default": "{\"name\":\"test\"}"
    }
]
  },
  {
    id: 'randomInt',
    module: 'math',
    name: 'randomInt (区间随机数)',
    desc: '生成闭区间随机整数。',
    fn: mathTools.randomInt,
    code: mathTools.randomInt.toString(),
    params: [
    {
        "name": "min",
        "label": "下限",
        "type": "number",
        "default": 1
    },
    {
        "name": "max",
        "label": "上限",
        "type": "number",
        "default": 100
    }
]
  },
  {
    id: 'clamp',
    module: 'math',
    name: 'clamp (数值区间夹紧)',
    desc: '限制数字不得越过给定的上下限边界。',
    fn: mathTools.clamp,
    code: mathTools.clamp.toString(),
    params: [
    {
        "name": "num",
        "label": "输入值",
        "type": "number",
        "default": 120
    },
    {
        "name": "min",
        "label": "下边界",
        "type": "number",
        "default": 0
    },
    {
        "name": "max",
        "label": "上边界",
        "type": "number",
        "default": 100
    }
]
  },
  {
    id: 'mathExtra_1',
    module: 'math',
    name: 'mathExtra_1 (数学运算_1)',
    desc: '快速数学计算处理辅助工具，第 1 号方法。',
    fn: mathTools.mathExtra_1,
    code: mathTools.mathExtra_1.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_2',
    module: 'math',
    name: 'mathExtra_2 (数学运算_2)',
    desc: '快速数学计算处理辅助工具，第 2 号方法。',
    fn: mathTools.mathExtra_2,
    code: mathTools.mathExtra_2.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_3',
    module: 'math',
    name: 'mathExtra_3 (数学运算_3)',
    desc: '快速数学计算处理辅助工具，第 3 号方法。',
    fn: mathTools.mathExtra_3,
    code: mathTools.mathExtra_3.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_4',
    module: 'math',
    name: 'mathExtra_4 (数学运算_4)',
    desc: '快速数学计算处理辅助工具，第 4 号方法。',
    fn: mathTools.mathExtra_4,
    code: mathTools.mathExtra_4.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_5',
    module: 'math',
    name: 'mathExtra_5 (数学运算_5)',
    desc: '快速数学计算处理辅助工具，第 5 号方法。',
    fn: mathTools.mathExtra_5,
    code: mathTools.mathExtra_5.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_6',
    module: 'math',
    name: 'mathExtra_6 (数学运算_6)',
    desc: '快速数学计算处理辅助工具，第 6 号方法。',
    fn: mathTools.mathExtra_6,
    code: mathTools.mathExtra_6.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_7',
    module: 'math',
    name: 'mathExtra_7 (数学运算_7)',
    desc: '快速数学计算处理辅助工具，第 7 号方法。',
    fn: mathTools.mathExtra_7,
    code: mathTools.mathExtra_7.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_8',
    module: 'math',
    name: 'mathExtra_8 (数学运算_8)',
    desc: '快速数学计算处理辅助工具，第 8 号方法。',
    fn: mathTools.mathExtra_8,
    code: mathTools.mathExtra_8.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_9',
    module: 'math',
    name: 'mathExtra_9 (数学运算_9)',
    desc: '快速数学计算处理辅助工具，第 9 号方法。',
    fn: mathTools.mathExtra_9,
    code: mathTools.mathExtra_9.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_10',
    module: 'math',
    name: 'mathExtra_10 (数学运算_10)',
    desc: '快速数学计算处理辅助工具，第 10 号方法。',
    fn: mathTools.mathExtra_10,
    code: mathTools.mathExtra_10.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_11',
    module: 'math',
    name: 'mathExtra_11 (数学运算_11)',
    desc: '快速数学计算处理辅助工具，第 11 号方法。',
    fn: mathTools.mathExtra_11,
    code: mathTools.mathExtra_11.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_12',
    module: 'math',
    name: 'mathExtra_12 (数学运算_12)',
    desc: '快速数学计算处理辅助工具，第 12 号方法。',
    fn: mathTools.mathExtra_12,
    code: mathTools.mathExtra_12.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_13',
    module: 'math',
    name: 'mathExtra_13 (数学运算_13)',
    desc: '快速数学计算处理辅助工具，第 13 号方法。',
    fn: mathTools.mathExtra_13,
    code: mathTools.mathExtra_13.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_14',
    module: 'math',
    name: 'mathExtra_14 (数学运算_14)',
    desc: '快速数学计算处理辅助工具，第 14 号方法。',
    fn: mathTools.mathExtra_14,
    code: mathTools.mathExtra_14.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_15',
    module: 'math',
    name: 'mathExtra_15 (数学运算_15)',
    desc: '快速数学计算处理辅助工具，第 15 号方法。',
    fn: mathTools.mathExtra_15,
    code: mathTools.mathExtra_15.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_16',
    module: 'math',
    name: 'mathExtra_16 (数学运算_16)',
    desc: '快速数学计算处理辅助工具，第 16 号方法。',
    fn: mathTools.mathExtra_16,
    code: mathTools.mathExtra_16.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_17',
    module: 'math',
    name: 'mathExtra_17 (数学运算_17)',
    desc: '快速数学计算处理辅助工具，第 17 号方法。',
    fn: mathTools.mathExtra_17,
    code: mathTools.mathExtra_17.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_18',
    module: 'math',
    name: 'mathExtra_18 (数学运算_18)',
    desc: '快速数学计算处理辅助工具，第 18 号方法。',
    fn: mathTools.mathExtra_18,
    code: mathTools.mathExtra_18.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_19',
    module: 'math',
    name: 'mathExtra_19 (数学运算_19)',
    desc: '快速数学计算处理辅助工具，第 19 号方法。',
    fn: mathTools.mathExtra_19,
    code: mathTools.mathExtra_19.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_20',
    module: 'math',
    name: 'mathExtra_20 (数学运算_20)',
    desc: '快速数学计算处理辅助工具，第 20 号方法。',
    fn: mathTools.mathExtra_20,
    code: mathTools.mathExtra_20.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_21',
    module: 'math',
    name: 'mathExtra_21 (数学运算_21)',
    desc: '快速数学计算处理辅助工具，第 21 号方法。',
    fn: mathTools.mathExtra_21,
    code: mathTools.mathExtra_21.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_22',
    module: 'math',
    name: 'mathExtra_22 (数学运算_22)',
    desc: '快速数学计算处理辅助工具，第 22 号方法。',
    fn: mathTools.mathExtra_22,
    code: mathTools.mathExtra_22.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_23',
    module: 'math',
    name: 'mathExtra_23 (数学运算_23)',
    desc: '快速数学计算处理辅助工具，第 23 号方法。',
    fn: mathTools.mathExtra_23,
    code: mathTools.mathExtra_23.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_24',
    module: 'math',
    name: 'mathExtra_24 (数学运算_24)',
    desc: '快速数学计算处理辅助工具，第 24 号方法。',
    fn: mathTools.mathExtra_24,
    code: mathTools.mathExtra_24.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_25',
    module: 'math',
    name: 'mathExtra_25 (数学运算_25)',
    desc: '快速数学计算处理辅助工具，第 25 号方法。',
    fn: mathTools.mathExtra_25,
    code: mathTools.mathExtra_25.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_26',
    module: 'math',
    name: 'mathExtra_26 (数学运算_26)',
    desc: '快速数学计算处理辅助工具，第 26 号方法。',
    fn: mathTools.mathExtra_26,
    code: mathTools.mathExtra_26.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_27',
    module: 'math',
    name: 'mathExtra_27 (数学运算_27)',
    desc: '快速数学计算处理辅助工具，第 27 号方法。',
    fn: mathTools.mathExtra_27,
    code: mathTools.mathExtra_27.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_28',
    module: 'math',
    name: 'mathExtra_28 (数学运算_28)',
    desc: '快速数学计算处理辅助工具，第 28 号方法。',
    fn: mathTools.mathExtra_28,
    code: mathTools.mathExtra_28.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_29',
    module: 'math',
    name: 'mathExtra_29 (数学运算_29)',
    desc: '快速数学计算处理辅助工具，第 29 号方法。',
    fn: mathTools.mathExtra_29,
    code: mathTools.mathExtra_29.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_30',
    module: 'math',
    name: 'mathExtra_30 (数学运算_30)',
    desc: '快速数学计算处理辅助工具，第 30 号方法。',
    fn: mathTools.mathExtra_30,
    code: mathTools.mathExtra_30.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_31',
    module: 'math',
    name: 'mathExtra_31 (数学运算_31)',
    desc: '快速数学计算处理辅助工具，第 31 号方法。',
    fn: mathTools.mathExtra_31,
    code: mathTools.mathExtra_31.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_32',
    module: 'math',
    name: 'mathExtra_32 (数学运算_32)',
    desc: '快速数学计算处理辅助工具，第 32 号方法。',
    fn: mathTools.mathExtra_32,
    code: mathTools.mathExtra_32.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_33',
    module: 'math',
    name: 'mathExtra_33 (数学运算_33)',
    desc: '快速数学计算处理辅助工具，第 33 号方法。',
    fn: mathTools.mathExtra_33,
    code: mathTools.mathExtra_33.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_34',
    module: 'math',
    name: 'mathExtra_34 (数学运算_34)',
    desc: '快速数学计算处理辅助工具，第 34 号方法。',
    fn: mathTools.mathExtra_34,
    code: mathTools.mathExtra_34.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_35',
    module: 'math',
    name: 'mathExtra_35 (数学运算_35)',
    desc: '快速数学计算处理辅助工具，第 35 号方法。',
    fn: mathTools.mathExtra_35,
    code: mathTools.mathExtra_35.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_36',
    module: 'math',
    name: 'mathExtra_36 (数学运算_36)',
    desc: '快速数学计算处理辅助工具，第 36 号方法。',
    fn: mathTools.mathExtra_36,
    code: mathTools.mathExtra_36.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_37',
    module: 'math',
    name: 'mathExtra_37 (数学运算_37)',
    desc: '快速数学计算处理辅助工具，第 37 号方法。',
    fn: mathTools.mathExtra_37,
    code: mathTools.mathExtra_37.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'mathExtra_38',
    module: 'math',
    name: 'mathExtra_38 (数学运算_38)',
    desc: '快速数学计算处理辅助工具，第 38 号方法。',
    fn: mathTools.mathExtra_38,
    code: mathTools.mathExtra_38.toString(),
    params: [
    {
        "name": "val",
        "label": "数值输入",
        "type": "number",
        "default": 5
    }
]
  },
  {
    id: 'rgbToHex',
    module: 'color',
    name: 'rgbToHex (RGB色值转十六进制)',
    desc: '转为十六进制编码。',
    fn: colorTools.rgbToHex,
    code: colorTools.rgbToHex.toString(),
    params: [
    {
        "name": "r",
        "label": "R",
        "type": "number",
        "default": 89
    },
    {
        "name": "g",
        "label": "G",
        "type": "number",
        "default": 97
    },
    {
        "name": "b",
        "label": "B",
        "type": "number",
        "default": 249
    }
]
  },
  {
    id: 'colorExtra_1',
    module: 'color',
    name: 'colorExtra_1 (色彩分析_1)',
    desc: '色彩换算或滤镜计算，第 1 号。',
    fn: colorTools.colorExtra_1,
    code: colorTools.colorExtra_1.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_2',
    module: 'color',
    name: 'colorExtra_2 (色彩分析_2)',
    desc: '色彩换算或滤镜计算，第 2 号。',
    fn: colorTools.colorExtra_2,
    code: colorTools.colorExtra_2.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_3',
    module: 'color',
    name: 'colorExtra_3 (色彩分析_3)',
    desc: '色彩换算或滤镜计算，第 3 号。',
    fn: colorTools.colorExtra_3,
    code: colorTools.colorExtra_3.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_4',
    module: 'color',
    name: 'colorExtra_4 (色彩分析_4)',
    desc: '色彩换算或滤镜计算，第 4 号。',
    fn: colorTools.colorExtra_4,
    code: colorTools.colorExtra_4.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_5',
    module: 'color',
    name: 'colorExtra_5 (色彩分析_5)',
    desc: '色彩换算或滤镜计算，第 5 号。',
    fn: colorTools.colorExtra_5,
    code: colorTools.colorExtra_5.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_6',
    module: 'color',
    name: 'colorExtra_6 (色彩分析_6)',
    desc: '色彩换算或滤镜计算，第 6 号。',
    fn: colorTools.colorExtra_6,
    code: colorTools.colorExtra_6.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_7',
    module: 'color',
    name: 'colorExtra_7 (色彩分析_7)',
    desc: '色彩换算或滤镜计算，第 7 号。',
    fn: colorTools.colorExtra_7,
    code: colorTools.colorExtra_7.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_8',
    module: 'color',
    name: 'colorExtra_8 (色彩分析_8)',
    desc: '色彩换算或滤镜计算，第 8 号。',
    fn: colorTools.colorExtra_8,
    code: colorTools.colorExtra_8.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_9',
    module: 'color',
    name: 'colorExtra_9 (色彩分析_9)',
    desc: '色彩换算或滤镜计算，第 9 号。',
    fn: colorTools.colorExtra_9,
    code: colorTools.colorExtra_9.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_10',
    module: 'color',
    name: 'colorExtra_10 (色彩分析_10)',
    desc: '色彩换算或滤镜计算，第 10 号。',
    fn: colorTools.colorExtra_10,
    code: colorTools.colorExtra_10.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_11',
    module: 'color',
    name: 'colorExtra_11 (色彩分析_11)',
    desc: '色彩换算或滤镜计算，第 11 号。',
    fn: colorTools.colorExtra_11,
    code: colorTools.colorExtra_11.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_12',
    module: 'color',
    name: 'colorExtra_12 (色彩分析_12)',
    desc: '色彩换算或滤镜计算，第 12 号。',
    fn: colorTools.colorExtra_12,
    code: colorTools.colorExtra_12.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_13',
    module: 'color',
    name: 'colorExtra_13 (色彩分析_13)',
    desc: '色彩换算或滤镜计算，第 13 号。',
    fn: colorTools.colorExtra_13,
    code: colorTools.colorExtra_13.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_14',
    module: 'color',
    name: 'colorExtra_14 (色彩分析_14)',
    desc: '色彩换算或滤镜计算，第 14 号。',
    fn: colorTools.colorExtra_14,
    code: colorTools.colorExtra_14.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_15',
    module: 'color',
    name: 'colorExtra_15 (色彩分析_15)',
    desc: '色彩换算或滤镜计算，第 15 号。',
    fn: colorTools.colorExtra_15,
    code: colorTools.colorExtra_15.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_16',
    module: 'color',
    name: 'colorExtra_16 (色彩分析_16)',
    desc: '色彩换算或滤镜计算，第 16 号。',
    fn: colorTools.colorExtra_16,
    code: colorTools.colorExtra_16.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_17',
    module: 'color',
    name: 'colorExtra_17 (色彩分析_17)',
    desc: '色彩换算或滤镜计算，第 17 号。',
    fn: colorTools.colorExtra_17,
    code: colorTools.colorExtra_17.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_18',
    module: 'color',
    name: 'colorExtra_18 (色彩分析_18)',
    desc: '色彩换算或滤镜计算，第 18 号。',
    fn: colorTools.colorExtra_18,
    code: colorTools.colorExtra_18.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_19',
    module: 'color',
    name: 'colorExtra_19 (色彩分析_19)',
    desc: '色彩换算或滤镜计算，第 19 号。',
    fn: colorTools.colorExtra_19,
    code: colorTools.colorExtra_19.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_20',
    module: 'color',
    name: 'colorExtra_20 (色彩分析_20)',
    desc: '色彩换算或滤镜计算，第 20 号。',
    fn: colorTools.colorExtra_20,
    code: colorTools.colorExtra_20.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_21',
    module: 'color',
    name: 'colorExtra_21 (色彩分析_21)',
    desc: '色彩换算或滤镜计算，第 21 号。',
    fn: colorTools.colorExtra_21,
    code: colorTools.colorExtra_21.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_22',
    module: 'color',
    name: 'colorExtra_22 (色彩分析_22)',
    desc: '色彩换算或滤镜计算，第 22 号。',
    fn: colorTools.colorExtra_22,
    code: colorTools.colorExtra_22.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_23',
    module: 'color',
    name: 'colorExtra_23 (色彩分析_23)',
    desc: '色彩换算或滤镜计算，第 23 号。',
    fn: colorTools.colorExtra_23,
    code: colorTools.colorExtra_23.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_24',
    module: 'color',
    name: 'colorExtra_24 (色彩分析_24)',
    desc: '色彩换算或滤镜计算，第 24 号。',
    fn: colorTools.colorExtra_24,
    code: colorTools.colorExtra_24.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_25',
    module: 'color',
    name: 'colorExtra_25 (色彩分析_25)',
    desc: '色彩换算或滤镜计算，第 25 号。',
    fn: colorTools.colorExtra_25,
    code: colorTools.colorExtra_25.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_26',
    module: 'color',
    name: 'colorExtra_26 (色彩分析_26)',
    desc: '色彩换算或滤镜计算，第 26 号。',
    fn: colorTools.colorExtra_26,
    code: colorTools.colorExtra_26.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_27',
    module: 'color',
    name: 'colorExtra_27 (色彩分析_27)',
    desc: '色彩换算或滤镜计算，第 27 号。',
    fn: colorTools.colorExtra_27,
    code: colorTools.colorExtra_27.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_28',
    module: 'color',
    name: 'colorExtra_28 (色彩分析_28)',
    desc: '色彩换算或滤镜计算，第 28 号。',
    fn: colorTools.colorExtra_28,
    code: colorTools.colorExtra_28.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'colorExtra_29',
    module: 'color',
    name: 'colorExtra_29 (色彩分析_29)',
    desc: '色彩换算或滤镜计算，第 29 号。',
    fn: colorTools.colorExtra_29,
    code: colorTools.colorExtra_29.toString(),
    params: [
    {
        "name": "hexStr",
        "label": "十六进制颜色码",
        "type": "text",
        "default": "#ff4757"
    }
]
  },
  {
    id: 'isMobileDevice',
    module: 'browser',
    name: 'isMobileDevice (手机移动端UA检测)',
    desc: '测试设备类型。',
    fn: browserTools.isMobileDevice,
    code: browserTools.isMobileDevice.toString(),
    params: []
  },
  {
    id: 'browserExtra_1',
    module: 'browser',
    name: 'browserExtra_1 (宿主环境_1)',
    desc: '浏览器视口或宿主测试辅助，第 1 号。',
    fn: browserTools.browserExtra_1,
    code: browserTools.browserExtra_1.toString(),
    params: []
  },
  {
    id: 'browserExtra_2',
    module: 'browser',
    name: 'browserExtra_2 (宿主环境_2)',
    desc: '浏览器视口或宿主测试辅助，第 2 号。',
    fn: browserTools.browserExtra_2,
    code: browserTools.browserExtra_2.toString(),
    params: []
  },
  {
    id: 'browserExtra_3',
    module: 'browser',
    name: 'browserExtra_3 (宿主环境_3)',
    desc: '浏览器视口或宿主测试辅助，第 3 号。',
    fn: browserTools.browserExtra_3,
    code: browserTools.browserExtra_3.toString(),
    params: []
  },
  {
    id: 'browserExtra_4',
    module: 'browser',
    name: 'browserExtra_4 (宿主环境_4)',
    desc: '浏览器视口或宿主测试辅助，第 4 号。',
    fn: browserTools.browserExtra_4,
    code: browserTools.browserExtra_4.toString(),
    params: []
  },
  {
    id: 'browserExtra_5',
    module: 'browser',
    name: 'browserExtra_5 (宿主环境_5)',
    desc: '浏览器视口或宿主测试辅助，第 5 号。',
    fn: browserTools.browserExtra_5,
    code: browserTools.browserExtra_5.toString(),
    params: []
  },
  {
    id: 'browserExtra_6',
    module: 'browser',
    name: 'browserExtra_6 (宿主环境_6)',
    desc: '浏览器视口或宿主测试辅助，第 6 号。',
    fn: browserTools.browserExtra_6,
    code: browserTools.browserExtra_6.toString(),
    params: []
  },
  {
    id: 'browserExtra_7',
    module: 'browser',
    name: 'browserExtra_7 (宿主环境_7)',
    desc: '浏览器视口或宿主测试辅助，第 7 号。',
    fn: browserTools.browserExtra_7,
    code: browserTools.browserExtra_7.toString(),
    params: []
  },
  {
    id: 'browserExtra_8',
    module: 'browser',
    name: 'browserExtra_8 (宿主环境_8)',
    desc: '浏览器视口或宿主测试辅助，第 8 号。',
    fn: browserTools.browserExtra_8,
    code: browserTools.browserExtra_8.toString(),
    params: []
  },
  {
    id: 'browserExtra_9',
    module: 'browser',
    name: 'browserExtra_9 (宿主环境_9)',
    desc: '浏览器视口或宿主测试辅助，第 9 号。',
    fn: browserTools.browserExtra_9,
    code: browserTools.browserExtra_9.toString(),
    params: []
  },
  {
    id: 'browserExtra_10',
    module: 'browser',
    name: 'browserExtra_10 (宿主环境_10)',
    desc: '浏览器视口或宿主测试辅助，第 10 号。',
    fn: browserTools.browserExtra_10,
    code: browserTools.browserExtra_10.toString(),
    params: []
  },
  {
    id: 'browserExtra_11',
    module: 'browser',
    name: 'browserExtra_11 (宿主环境_11)',
    desc: '浏览器视口或宿主测试辅助，第 11 号。',
    fn: browserTools.browserExtra_11,
    code: browserTools.browserExtra_11.toString(),
    params: []
  },
  {
    id: 'browserExtra_12',
    module: 'browser',
    name: 'browserExtra_12 (宿主环境_12)',
    desc: '浏览器视口或宿主测试辅助，第 12 号。',
    fn: browserTools.browserExtra_12,
    code: browserTools.browserExtra_12.toString(),
    params: []
  },
  {
    id: 'browserExtra_13',
    module: 'browser',
    name: 'browserExtra_13 (宿主环境_13)',
    desc: '浏览器视口或宿主测试辅助，第 13 号。',
    fn: browserTools.browserExtra_13,
    code: browserTools.browserExtra_13.toString(),
    params: []
  },
  {
    id: 'browserExtra_14',
    module: 'browser',
    name: 'browserExtra_14 (宿主环境_14)',
    desc: '浏览器视口或宿主测试辅助，第 14 号。',
    fn: browserTools.browserExtra_14,
    code: browserTools.browserExtra_14.toString(),
    params: []
  },
  {
    id: 'browserExtra_15',
    module: 'browser',
    name: 'browserExtra_15 (宿主环境_15)',
    desc: '浏览器视口或宿主测试辅助，第 15 号。',
    fn: browserTools.browserExtra_15,
    code: browserTools.browserExtra_15.toString(),
    params: []
  },
  {
    id: 'browserExtra_16',
    module: 'browser',
    name: 'browserExtra_16 (宿主环境_16)',
    desc: '浏览器视口或宿主测试辅助，第 16 号。',
    fn: browserTools.browserExtra_16,
    code: browserTools.browserExtra_16.toString(),
    params: []
  },
  {
    id: 'browserExtra_17',
    module: 'browser',
    name: 'browserExtra_17 (宿主环境_17)',
    desc: '浏览器视口或宿主测试辅助，第 17 号。',
    fn: browserTools.browserExtra_17,
    code: browserTools.browserExtra_17.toString(),
    params: []
  },
  {
    id: 'browserExtra_18',
    module: 'browser',
    name: 'browserExtra_18 (宿主环境_18)',
    desc: '浏览器视口或宿主测试辅助，第 18 号。',
    fn: browserTools.browserExtra_18,
    code: browserTools.browserExtra_18.toString(),
    params: []
  },
  {
    id: 'browserExtra_19',
    module: 'browser',
    name: 'browserExtra_19 (宿主环境_19)',
    desc: '浏览器视口或宿主测试辅助，第 19 号。',
    fn: browserTools.browserExtra_19,
    code: browserTools.browserExtra_19.toString(),
    params: []
  },
  {
    id: 'browserExtra_20',
    module: 'browser',
    name: 'browserExtra_20 (宿主环境_20)',
    desc: '浏览器视口或宿主测试辅助，第 20 号。',
    fn: browserTools.browserExtra_20,
    code: browserTools.browserExtra_20.toString(),
    params: []
  },
  {
    id: 'browserExtra_21',
    module: 'browser',
    name: 'browserExtra_21 (宿主环境_21)',
    desc: '浏览器视口或宿主测试辅助，第 21 号。',
    fn: browserTools.browserExtra_21,
    code: browserTools.browserExtra_21.toString(),
    params: []
  },
  {
    id: 'browserExtra_22',
    module: 'browser',
    name: 'browserExtra_22 (宿主环境_22)',
    desc: '浏览器视口或宿主测试辅助，第 22 号。',
    fn: browserTools.browserExtra_22,
    code: browserTools.browserExtra_22.toString(),
    params: []
  },
  {
    id: 'browserExtra_23',
    module: 'browser',
    name: 'browserExtra_23 (宿主环境_23)',
    desc: '浏览器视口或宿主测试辅助，第 23 号。',
    fn: browserTools.browserExtra_23,
    code: browserTools.browserExtra_23.toString(),
    params: []
  },
  {
    id: 'browserExtra_24',
    module: 'browser',
    name: 'browserExtra_24 (宿主环境_24)',
    desc: '浏览器视口或宿主测试辅助，第 24 号。',
    fn: browserTools.browserExtra_24,
    code: browserTools.browserExtra_24.toString(),
    params: []
  },
  {
    id: 'browserExtra_25',
    module: 'browser',
    name: 'browserExtra_25 (宿主环境_25)',
    desc: '浏览器视口或宿主测试辅助，第 25 号。',
    fn: browserTools.browserExtra_25,
    code: browserTools.browserExtra_25.toString(),
    params: []
  },
  {
    id: 'browserExtra_26',
    module: 'browser',
    name: 'browserExtra_26 (宿主环境_26)',
    desc: '浏览器视口或宿主测试辅助，第 26 号。',
    fn: browserTools.browserExtra_26,
    code: browserTools.browserExtra_26.toString(),
    params: []
  },
  {
    id: 'browserExtra_27',
    module: 'browser',
    name: 'browserExtra_27 (宿主环境_27)',
    desc: '浏览器视口或宿主测试辅助，第 27 号。',
    fn: browserTools.browserExtra_27,
    code: browserTools.browserExtra_27.toString(),
    params: []
  },
  {
    id: 'browserExtra_28',
    module: 'browser',
    name: 'browserExtra_28 (宿主环境_28)',
    desc: '浏览器视口或宿主测试辅助，第 28 号。',
    fn: browserTools.browserExtra_28,
    code: browserTools.browserExtra_28.toString(),
    params: []
  },
  {
    id: 'browserExtra_29',
    module: 'browser',
    name: 'browserExtra_29 (宿主环境_29)',
    desc: '浏览器视口或宿主测试辅助，第 29 号。',
    fn: browserTools.browserExtra_29,
    code: browserTools.browserExtra_29.toString(),
    params: []
  },
  {
    id: 'isEmail',
    module: 'validator',
    name: 'isEmail (电子邮箱校验)',
    desc: '检验电子邮箱正则合法性。',
    fn: validatorTools.isEmail,
    code: validatorTools.isEmail.toString(),
    params: [
    {
        "name": "e",
        "label": "电子邮箱",
        "type": "text",
        "default": "help@hooksvue.com"
    }
]
  },
  {
    id: 'isUrl',
    module: 'validator',
    name: 'isUrl (URL网址有效性校验)',
    desc: '检验URL正则合法性。',
    fn: validatorTools.isUrl,
    code: validatorTools.isUrl.toString(),
    params: [
    {
        "name": "u",
        "label": "网址",
        "type": "text",
        "default": "https://github.com"
    }
]
  },
  {
    id: 'validatorExtra_1',
    module: 'validator',
    name: 'validatorExtra_1 (类型校验_1)',
    desc: '数据格式及安全校验测试辅助，第 1 号。',
    fn: validatorTools.validatorExtra_1,
    code: validatorTools.validatorExtra_1.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_2',
    module: 'validator',
    name: 'validatorExtra_2 (类型校验_2)',
    desc: '数据格式及安全校验测试辅助，第 2 号。',
    fn: validatorTools.validatorExtra_2,
    code: validatorTools.validatorExtra_2.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_3',
    module: 'validator',
    name: 'validatorExtra_3 (类型校验_3)',
    desc: '数据格式及安全校验测试辅助，第 3 号。',
    fn: validatorTools.validatorExtra_3,
    code: validatorTools.validatorExtra_3.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_4',
    module: 'validator',
    name: 'validatorExtra_4 (类型校验_4)',
    desc: '数据格式及安全校验测试辅助，第 4 号。',
    fn: validatorTools.validatorExtra_4,
    code: validatorTools.validatorExtra_4.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_5',
    module: 'validator',
    name: 'validatorExtra_5 (类型校验_5)',
    desc: '数据格式及安全校验测试辅助，第 5 号。',
    fn: validatorTools.validatorExtra_5,
    code: validatorTools.validatorExtra_5.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_6',
    module: 'validator',
    name: 'validatorExtra_6 (类型校验_6)',
    desc: '数据格式及安全校验测试辅助，第 6 号。',
    fn: validatorTools.validatorExtra_6,
    code: validatorTools.validatorExtra_6.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_7',
    module: 'validator',
    name: 'validatorExtra_7 (类型校验_7)',
    desc: '数据格式及安全校验测试辅助，第 7 号。',
    fn: validatorTools.validatorExtra_7,
    code: validatorTools.validatorExtra_7.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_8',
    module: 'validator',
    name: 'validatorExtra_8 (类型校验_8)',
    desc: '数据格式及安全校验测试辅助，第 8 号。',
    fn: validatorTools.validatorExtra_8,
    code: validatorTools.validatorExtra_8.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_9',
    module: 'validator',
    name: 'validatorExtra_9 (类型校验_9)',
    desc: '数据格式及安全校验测试辅助，第 9 号。',
    fn: validatorTools.validatorExtra_9,
    code: validatorTools.validatorExtra_9.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_10',
    module: 'validator',
    name: 'validatorExtra_10 (类型校验_10)',
    desc: '数据格式及安全校验测试辅助，第 10 号。',
    fn: validatorTools.validatorExtra_10,
    code: validatorTools.validatorExtra_10.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_11',
    module: 'validator',
    name: 'validatorExtra_11 (类型校验_11)',
    desc: '数据格式及安全校验测试辅助，第 11 号。',
    fn: validatorTools.validatorExtra_11,
    code: validatorTools.validatorExtra_11.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_12',
    module: 'validator',
    name: 'validatorExtra_12 (类型校验_12)',
    desc: '数据格式及安全校验测试辅助，第 12 号。',
    fn: validatorTools.validatorExtra_12,
    code: validatorTools.validatorExtra_12.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_13',
    module: 'validator',
    name: 'validatorExtra_13 (类型校验_13)',
    desc: '数据格式及安全校验测试辅助，第 13 号。',
    fn: validatorTools.validatorExtra_13,
    code: validatorTools.validatorExtra_13.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_14',
    module: 'validator',
    name: 'validatorExtra_14 (类型校验_14)',
    desc: '数据格式及安全校验测试辅助，第 14 号。',
    fn: validatorTools.validatorExtra_14,
    code: validatorTools.validatorExtra_14.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_15',
    module: 'validator',
    name: 'validatorExtra_15 (类型校验_15)',
    desc: '数据格式及安全校验测试辅助，第 15 号。',
    fn: validatorTools.validatorExtra_15,
    code: validatorTools.validatorExtra_15.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_16',
    module: 'validator',
    name: 'validatorExtra_16 (类型校验_16)',
    desc: '数据格式及安全校验测试辅助，第 16 号。',
    fn: validatorTools.validatorExtra_16,
    code: validatorTools.validatorExtra_16.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_17',
    module: 'validator',
    name: 'validatorExtra_17 (类型校验_17)',
    desc: '数据格式及安全校验测试辅助，第 17 号。',
    fn: validatorTools.validatorExtra_17,
    code: validatorTools.validatorExtra_17.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_18',
    module: 'validator',
    name: 'validatorExtra_18 (类型校验_18)',
    desc: '数据格式及安全校验测试辅助，第 18 号。',
    fn: validatorTools.validatorExtra_18,
    code: validatorTools.validatorExtra_18.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_19',
    module: 'validator',
    name: 'validatorExtra_19 (类型校验_19)',
    desc: '数据格式及安全校验测试辅助，第 19 号。',
    fn: validatorTools.validatorExtra_19,
    code: validatorTools.validatorExtra_19.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_20',
    module: 'validator',
    name: 'validatorExtra_20 (类型校验_20)',
    desc: '数据格式及安全校验测试辅助，第 20 号。',
    fn: validatorTools.validatorExtra_20,
    code: validatorTools.validatorExtra_20.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_21',
    module: 'validator',
    name: 'validatorExtra_21 (类型校验_21)',
    desc: '数据格式及安全校验测试辅助，第 21 号。',
    fn: validatorTools.validatorExtra_21,
    code: validatorTools.validatorExtra_21.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_22',
    module: 'validator',
    name: 'validatorExtra_22 (类型校验_22)',
    desc: '数据格式及安全校验测试辅助，第 22 号。',
    fn: validatorTools.validatorExtra_22,
    code: validatorTools.validatorExtra_22.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_23',
    module: 'validator',
    name: 'validatorExtra_23 (类型校验_23)',
    desc: '数据格式及安全校验测试辅助，第 23 号。',
    fn: validatorTools.validatorExtra_23,
    code: validatorTools.validatorExtra_23.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_24',
    module: 'validator',
    name: 'validatorExtra_24 (类型校验_24)',
    desc: '数据格式及安全校验测试辅助，第 24 号。',
    fn: validatorTools.validatorExtra_24,
    code: validatorTools.validatorExtra_24.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_25',
    module: 'validator',
    name: 'validatorExtra_25 (类型校验_25)',
    desc: '数据格式及安全校验测试辅助，第 25 号。',
    fn: validatorTools.validatorExtra_25,
    code: validatorTools.validatorExtra_25.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_26',
    module: 'validator',
    name: 'validatorExtra_26 (类型校验_26)',
    desc: '数据格式及安全校验测试辅助，第 26 号。',
    fn: validatorTools.validatorExtra_26,
    code: validatorTools.validatorExtra_26.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_27',
    module: 'validator',
    name: 'validatorExtra_27 (类型校验_27)',
    desc: '数据格式及安全校验测试辅助，第 27 号。',
    fn: validatorTools.validatorExtra_27,
    code: validatorTools.validatorExtra_27.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_28',
    module: 'validator',
    name: 'validatorExtra_28 (类型校验_28)',
    desc: '数据格式及安全校验测试辅助，第 28 号。',
    fn: validatorTools.validatorExtra_28,
    code: validatorTools.validatorExtra_28.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_29',
    module: 'validator',
    name: 'validatorExtra_29 (类型校验_29)',
    desc: '数据格式及安全校验测试辅助，第 29 号。',
    fn: validatorTools.validatorExtra_29,
    code: validatorTools.validatorExtra_29.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_30',
    module: 'validator',
    name: 'validatorExtra_30 (类型校验_30)',
    desc: '数据格式及安全校验测试辅助，第 30 号。',
    fn: validatorTools.validatorExtra_30,
    code: validatorTools.validatorExtra_30.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_31',
    module: 'validator',
    name: 'validatorExtra_31 (类型校验_31)',
    desc: '数据格式及安全校验测试辅助，第 31 号。',
    fn: validatorTools.validatorExtra_31,
    code: validatorTools.validatorExtra_31.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_32',
    module: 'validator',
    name: 'validatorExtra_32 (类型校验_32)',
    desc: '数据格式及安全校验测试辅助，第 32 号。',
    fn: validatorTools.validatorExtra_32,
    code: validatorTools.validatorExtra_32.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_33',
    module: 'validator',
    name: 'validatorExtra_33 (类型校验_33)',
    desc: '数据格式及安全校验测试辅助，第 33 号。',
    fn: validatorTools.validatorExtra_33,
    code: validatorTools.validatorExtra_33.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_34',
    module: 'validator',
    name: 'validatorExtra_34 (类型校验_34)',
    desc: '数据格式及安全校验测试辅助，第 34 号。',
    fn: validatorTools.validatorExtra_34,
    code: validatorTools.validatorExtra_34.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_35',
    module: 'validator',
    name: 'validatorExtra_35 (类型校验_35)',
    desc: '数据格式及安全校验测试辅助，第 35 号。',
    fn: validatorTools.validatorExtra_35,
    code: validatorTools.validatorExtra_35.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_36',
    module: 'validator',
    name: 'validatorExtra_36 (类型校验_36)',
    desc: '数据格式及安全校验测试辅助，第 36 号。',
    fn: validatorTools.validatorExtra_36,
    code: validatorTools.validatorExtra_36.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_37',
    module: 'validator',
    name: 'validatorExtra_37 (类型校验_37)',
    desc: '数据格式及安全校验测试辅助，第 37 号。',
    fn: validatorTools.validatorExtra_37,
    code: validatorTools.validatorExtra_37.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'validatorExtra_38',
    module: 'validator',
    name: 'validatorExtra_38 (类型校验_38)',
    desc: '数据格式及安全校验测试辅助，第 38 号。',
    fn: validatorTools.validatorExtra_38,
    code: validatorTools.validatorExtra_38.toString(),
    params: [
    {
        "name": "val",
        "label": "待校验内容",
        "type": "text",
        "default": "hello"
    }
]
  },
  {
    id: 'dateExtra_1',
    module: 'date',
    name: 'dateExtra_1 (时间日期计算_1)',
    desc: '计算天数差异、周数或秒级戳计算，第 1 号时间工具。',
    fn: dateTools.dateExtra_1,
    code: dateTools.dateExtra_1.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_2',
    module: 'date',
    name: 'dateExtra_2 (时间日期计算_2)',
    desc: '计算天数差异、周数或秒级戳计算，第 2 号时间工具。',
    fn: dateTools.dateExtra_2,
    code: dateTools.dateExtra_2.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_3',
    module: 'date',
    name: 'dateExtra_3 (时间日期计算_3)',
    desc: '计算天数差异、周数或秒级戳计算，第 3 号时间工具。',
    fn: dateTools.dateExtra_3,
    code: dateTools.dateExtra_3.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_4',
    module: 'date',
    name: 'dateExtra_4 (时间日期计算_4)',
    desc: '计算天数差异、周数或秒级戳计算，第 4 号时间工具。',
    fn: dateTools.dateExtra_4,
    code: dateTools.dateExtra_4.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_5',
    module: 'date',
    name: 'dateExtra_5 (时间日期计算_5)',
    desc: '计算天数差异、周数或秒级戳计算，第 5 号时间工具。',
    fn: dateTools.dateExtra_5,
    code: dateTools.dateExtra_5.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_6',
    module: 'date',
    name: 'dateExtra_6 (时间日期计算_6)',
    desc: '计算天数差异、周数或秒级戳计算，第 6 号时间工具。',
    fn: dateTools.dateExtra_6,
    code: dateTools.dateExtra_6.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_7',
    module: 'date',
    name: 'dateExtra_7 (时间日期计算_7)',
    desc: '计算天数差异、周数或秒级戳计算，第 7 号时间工具。',
    fn: dateTools.dateExtra_7,
    code: dateTools.dateExtra_7.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_8',
    module: 'date',
    name: 'dateExtra_8 (时间日期计算_8)',
    desc: '计算天数差异、周数或秒级戳计算，第 8 号时间工具。',
    fn: dateTools.dateExtra_8,
    code: dateTools.dateExtra_8.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_9',
    module: 'date',
    name: 'dateExtra_9 (时间日期计算_9)',
    desc: '计算天数差异、周数或秒级戳计算，第 9 号时间工具。',
    fn: dateTools.dateExtra_9,
    code: dateTools.dateExtra_9.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_10',
    module: 'date',
    name: 'dateExtra_10 (时间日期计算_10)',
    desc: '计算天数差异、周数或秒级戳计算，第 10 号时间工具。',
    fn: dateTools.dateExtra_10,
    code: dateTools.dateExtra_10.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_11',
    module: 'date',
    name: 'dateExtra_11 (时间日期计算_11)',
    desc: '计算天数差异、周数或秒级戳计算，第 11 号时间工具。',
    fn: dateTools.dateExtra_11,
    code: dateTools.dateExtra_11.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_12',
    module: 'date',
    name: 'dateExtra_12 (时间日期计算_12)',
    desc: '计算天数差异、周数或秒级戳计算，第 12 号时间工具。',
    fn: dateTools.dateExtra_12,
    code: dateTools.dateExtra_12.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_13',
    module: 'date',
    name: 'dateExtra_13 (时间日期计算_13)',
    desc: '计算天数差异、周数或秒级戳计算，第 13 号时间工具。',
    fn: dateTools.dateExtra_13,
    code: dateTools.dateExtra_13.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_14',
    module: 'date',
    name: 'dateExtra_14 (时间日期计算_14)',
    desc: '计算天数差异、周数或秒级戳计算，第 14 号时间工具。',
    fn: dateTools.dateExtra_14,
    code: dateTools.dateExtra_14.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_15',
    module: 'date',
    name: 'dateExtra_15 (时间日期计算_15)',
    desc: '计算天数差异、周数或秒级戳计算，第 15 号时间工具。',
    fn: dateTools.dateExtra_15,
    code: dateTools.dateExtra_15.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_16',
    module: 'date',
    name: 'dateExtra_16 (时间日期计算_16)',
    desc: '计算天数差异、周数或秒级戳计算，第 16 号时间工具。',
    fn: dateTools.dateExtra_16,
    code: dateTools.dateExtra_16.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_17',
    module: 'date',
    name: 'dateExtra_17 (时间日期计算_17)',
    desc: '计算天数差异、周数或秒级戳计算，第 17 号时间工具。',
    fn: dateTools.dateExtra_17,
    code: dateTools.dateExtra_17.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_18',
    module: 'date',
    name: 'dateExtra_18 (时间日期计算_18)',
    desc: '计算天数差异、周数或秒级戳计算，第 18 号时间工具。',
    fn: dateTools.dateExtra_18,
    code: dateTools.dateExtra_18.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_19',
    module: 'date',
    name: 'dateExtra_19 (时间日期计算_19)',
    desc: '计算天数差异、周数或秒级戳计算，第 19 号时间工具。',
    fn: dateTools.dateExtra_19,
    code: dateTools.dateExtra_19.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_20',
    module: 'date',
    name: 'dateExtra_20 (时间日期计算_20)',
    desc: '计算天数差异、周数或秒级戳计算，第 20 号时间工具。',
    fn: dateTools.dateExtra_20,
    code: dateTools.dateExtra_20.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_21',
    module: 'date',
    name: 'dateExtra_21 (时间日期计算_21)',
    desc: '计算天数差异、周数或秒级戳计算，第 21 号时间工具。',
    fn: dateTools.dateExtra_21,
    code: dateTools.dateExtra_21.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_22',
    module: 'date',
    name: 'dateExtra_22 (时间日期计算_22)',
    desc: '计算天数差异、周数或秒级戳计算，第 22 号时间工具。',
    fn: dateTools.dateExtra_22,
    code: dateTools.dateExtra_22.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_23',
    module: 'date',
    name: 'dateExtra_23 (时间日期计算_23)',
    desc: '计算天数差异、周数或秒级戳计算，第 23 号时间工具。',
    fn: dateTools.dateExtra_23,
    code: dateTools.dateExtra_23.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_24',
    module: 'date',
    name: 'dateExtra_24 (时间日期计算_24)',
    desc: '计算天数差异、周数或秒级戳计算，第 24 号时间工具。',
    fn: dateTools.dateExtra_24,
    code: dateTools.dateExtra_24.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_25',
    module: 'date',
    name: 'dateExtra_25 (时间日期计算_25)',
    desc: '计算天数差异、周数或秒级戳计算，第 25 号时间工具。',
    fn: dateTools.dateExtra_25,
    code: dateTools.dateExtra_25.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_26',
    module: 'date',
    name: 'dateExtra_26 (时间日期计算_26)',
    desc: '计算天数差异、周数或秒级戳计算，第 26 号时间工具。',
    fn: dateTools.dateExtra_26,
    code: dateTools.dateExtra_26.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_27',
    module: 'date',
    name: 'dateExtra_27 (时间日期计算_27)',
    desc: '计算天数差异、周数或秒级戳计算，第 27 号时间工具。',
    fn: dateTools.dateExtra_27,
    code: dateTools.dateExtra_27.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_28',
    module: 'date',
    name: 'dateExtra_28 (时间日期计算_28)',
    desc: '计算天数差异、周数或秒级戳计算，第 28 号时间工具。',
    fn: dateTools.dateExtra_28,
    code: dateTools.dateExtra_28.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_29',
    module: 'date',
    name: 'dateExtra_29 (时间日期计算_29)',
    desc: '计算天数差异、周数或秒级戳计算，第 29 号时间工具。',
    fn: dateTools.dateExtra_29,
    code: dateTools.dateExtra_29.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'dateExtra_30',
    module: 'date',
    name: 'dateExtra_30 (时间日期计算_30)',
    desc: '计算天数差异、周数或秒级戳计算，第 30 号时间工具。',
    fn: dateTools.dateExtra_30,
    code: dateTools.dateExtra_30.toString(),
    params: [
    {
        "name": "dateStr",
        "label": "日期时间字符串",
        "type": "text",
        "default": "2026-07-13"
    }
]
  },
  {
    id: 'numberExtra_1',
    module: 'number',
    name: 'numberExtra_1 (数字格式化_1)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 1 号数学工具。',
    fn: numberTools.numberExtra_1,
    code: numberTools.numberExtra_1.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_2',
    module: 'number',
    name: 'numberExtra_2 (数字格式化_2)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 2 号数学工具。',
    fn: numberTools.numberExtra_2,
    code: numberTools.numberExtra_2.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_3',
    module: 'number',
    name: 'numberExtra_3 (数字格式化_3)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 3 号数学工具。',
    fn: numberTools.numberExtra_3,
    code: numberTools.numberExtra_3.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_4',
    module: 'number',
    name: 'numberExtra_4 (数字格式化_4)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 4 号数学工具。',
    fn: numberTools.numberExtra_4,
    code: numberTools.numberExtra_4.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_5',
    module: 'number',
    name: 'numberExtra_5 (数字格式化_5)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 5 号数学工具。',
    fn: numberTools.numberExtra_5,
    code: numberTools.numberExtra_5.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_6',
    module: 'number',
    name: 'numberExtra_6 (数字格式化_6)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 6 号数学工具。',
    fn: numberTools.numberExtra_6,
    code: numberTools.numberExtra_6.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_7',
    module: 'number',
    name: 'numberExtra_7 (数字格式化_7)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 7 号数学工具。',
    fn: numberTools.numberExtra_7,
    code: numberTools.numberExtra_7.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_8',
    module: 'number',
    name: 'numberExtra_8 (数字格式化_8)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 8 号数学工具。',
    fn: numberTools.numberExtra_8,
    code: numberTools.numberExtra_8.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_9',
    module: 'number',
    name: 'numberExtra_9 (数字格式化_9)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 9 号数学工具。',
    fn: numberTools.numberExtra_9,
    code: numberTools.numberExtra_9.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_10',
    module: 'number',
    name: 'numberExtra_10 (数字格式化_10)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 10 号数学工具。',
    fn: numberTools.numberExtra_10,
    code: numberTools.numberExtra_10.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_11',
    module: 'number',
    name: 'numberExtra_11 (数字格式化_11)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 11 号数学工具。',
    fn: numberTools.numberExtra_11,
    code: numberTools.numberExtra_11.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_12',
    module: 'number',
    name: 'numberExtra_12 (数字格式化_12)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 12 号数学工具。',
    fn: numberTools.numberExtra_12,
    code: numberTools.numberExtra_12.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_13',
    module: 'number',
    name: 'numberExtra_13 (数字格式化_13)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 13 号数学工具。',
    fn: numberTools.numberExtra_13,
    code: numberTools.numberExtra_13.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_14',
    module: 'number',
    name: 'numberExtra_14 (数字格式化_14)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 14 号数学工具。',
    fn: numberTools.numberExtra_14,
    code: numberTools.numberExtra_14.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_15',
    module: 'number',
    name: 'numberExtra_15 (数字格式化_15)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 15 号数学工具。',
    fn: numberTools.numberExtra_15,
    code: numberTools.numberExtra_15.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_16',
    module: 'number',
    name: 'numberExtra_16 (数字格式化_16)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 16 号数学工具。',
    fn: numberTools.numberExtra_16,
    code: numberTools.numberExtra_16.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_17',
    module: 'number',
    name: 'numberExtra_17 (数字格式化_17)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 17 号数学工具。',
    fn: numberTools.numberExtra_17,
    code: numberTools.numberExtra_17.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_18',
    module: 'number',
    name: 'numberExtra_18 (数字格式化_18)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 18 号数学工具。',
    fn: numberTools.numberExtra_18,
    code: numberTools.numberExtra_18.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_19',
    module: 'number',
    name: 'numberExtra_19 (数字格式化_19)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 19 号数学工具。',
    fn: numberTools.numberExtra_19,
    code: numberTools.numberExtra_19.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_20',
    module: 'number',
    name: 'numberExtra_20 (数字格式化_20)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 20 号数学工具。',
    fn: numberTools.numberExtra_20,
    code: numberTools.numberExtra_20.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_21',
    module: 'number',
    name: 'numberExtra_21 (数字格式化_21)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 21 号数学工具。',
    fn: numberTools.numberExtra_21,
    code: numberTools.numberExtra_21.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_22',
    module: 'number',
    name: 'numberExtra_22 (数字格式化_22)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 22 号数学工具。',
    fn: numberTools.numberExtra_22,
    code: numberTools.numberExtra_22.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_23',
    module: 'number',
    name: 'numberExtra_23 (数字格式化_23)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 23 号数学工具。',
    fn: numberTools.numberExtra_23,
    code: numberTools.numberExtra_23.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_24',
    module: 'number',
    name: 'numberExtra_24 (数字格式化_24)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 24 号数学工具。',
    fn: numberTools.numberExtra_24,
    code: numberTools.numberExtra_24.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_25',
    module: 'number',
    name: 'numberExtra_25 (数字格式化_25)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 25 号数学工具。',
    fn: numberTools.numberExtra_25,
    code: numberTools.numberExtra_25.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_26',
    module: 'number',
    name: 'numberExtra_26 (数字格式化_26)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 26 号数学工具。',
    fn: numberTools.numberExtra_26,
    code: numberTools.numberExtra_26.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_27',
    module: 'number',
    name: 'numberExtra_27 (数字格式化_27)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 27 号数学工具。',
    fn: numberTools.numberExtra_27,
    code: numberTools.numberExtra_27.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_28',
    module: 'number',
    name: 'numberExtra_28 (数字格式化_28)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 28 号数学工具。',
    fn: numberTools.numberExtra_28,
    code: numberTools.numberExtra_28.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_29',
    module: 'number',
    name: 'numberExtra_29 (数字格式化_29)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 29 号数学工具。',
    fn: numberTools.numberExtra_29,
    code: numberTools.numberExtra_29.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'numberExtra_30',
    module: 'number',
    name: 'numberExtra_30 (数字格式化_30)',
    desc: '处理浮点数精度、位运算、指数等辅助，第 30 号数学工具。',
    fn: numberTools.numberExtra_30,
    code: numberTools.numberExtra_30.toString(),
    params: [
    {
        "name": "n",
        "label": "数字",
        "type": "number",
        "default": 3.1415926
    }
]
  },
  {
    id: 'urlExtra_1',
    module: 'url',
    name: 'urlExtra_1 (链接参数解构_1)',
    desc: '解构URL路径、提取子域名或Hash段，第 1 号。',
    fn: urlTools.urlExtra_1,
    code: urlTools.urlExtra_1.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_2',
    module: 'url',
    name: 'urlExtra_2 (链接参数解构_2)',
    desc: '解构URL路径、提取子域名或Hash段，第 2 号。',
    fn: urlTools.urlExtra_2,
    code: urlTools.urlExtra_2.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_3',
    module: 'url',
    name: 'urlExtra_3 (链接参数解构_3)',
    desc: '解构URL路径、提取子域名或Hash段，第 3 号。',
    fn: urlTools.urlExtra_3,
    code: urlTools.urlExtra_3.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_4',
    module: 'url',
    name: 'urlExtra_4 (链接参数解构_4)',
    desc: '解构URL路径、提取子域名或Hash段，第 4 号。',
    fn: urlTools.urlExtra_4,
    code: urlTools.urlExtra_4.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_5',
    module: 'url',
    name: 'urlExtra_5 (链接参数解构_5)',
    desc: '解构URL路径、提取子域名或Hash段，第 5 号。',
    fn: urlTools.urlExtra_5,
    code: urlTools.urlExtra_5.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_6',
    module: 'url',
    name: 'urlExtra_6 (链接参数解构_6)',
    desc: '解构URL路径、提取子域名或Hash段，第 6 号。',
    fn: urlTools.urlExtra_6,
    code: urlTools.urlExtra_6.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_7',
    module: 'url',
    name: 'urlExtra_7 (链接参数解构_7)',
    desc: '解构URL路径、提取子域名或Hash段，第 7 号。',
    fn: urlTools.urlExtra_7,
    code: urlTools.urlExtra_7.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_8',
    module: 'url',
    name: 'urlExtra_8 (链接参数解构_8)',
    desc: '解构URL路径、提取子域名或Hash段，第 8 号。',
    fn: urlTools.urlExtra_8,
    code: urlTools.urlExtra_8.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_9',
    module: 'url',
    name: 'urlExtra_9 (链接参数解构_9)',
    desc: '解构URL路径、提取子域名或Hash段，第 9 号。',
    fn: urlTools.urlExtra_9,
    code: urlTools.urlExtra_9.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_10',
    module: 'url',
    name: 'urlExtra_10 (链接参数解构_10)',
    desc: '解构URL路径、提取子域名或Hash段，第 10 号。',
    fn: urlTools.urlExtra_10,
    code: urlTools.urlExtra_10.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_11',
    module: 'url',
    name: 'urlExtra_11 (链接参数解构_11)',
    desc: '解构URL路径、提取子域名或Hash段，第 11 号。',
    fn: urlTools.urlExtra_11,
    code: urlTools.urlExtra_11.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_12',
    module: 'url',
    name: 'urlExtra_12 (链接参数解构_12)',
    desc: '解构URL路径、提取子域名或Hash段，第 12 号。',
    fn: urlTools.urlExtra_12,
    code: urlTools.urlExtra_12.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_13',
    module: 'url',
    name: 'urlExtra_13 (链接参数解构_13)',
    desc: '解构URL路径、提取子域名或Hash段，第 13 号。',
    fn: urlTools.urlExtra_13,
    code: urlTools.urlExtra_13.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_14',
    module: 'url',
    name: 'urlExtra_14 (链接参数解构_14)',
    desc: '解构URL路径、提取子域名或Hash段，第 14 号。',
    fn: urlTools.urlExtra_14,
    code: urlTools.urlExtra_14.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_15',
    module: 'url',
    name: 'urlExtra_15 (链接参数解构_15)',
    desc: '解构URL路径、提取子域名或Hash段，第 15 号。',
    fn: urlTools.urlExtra_15,
    code: urlTools.urlExtra_15.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_16',
    module: 'url',
    name: 'urlExtra_16 (链接参数解构_16)',
    desc: '解构URL路径、提取子域名或Hash段，第 16 号。',
    fn: urlTools.urlExtra_16,
    code: urlTools.urlExtra_16.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_17',
    module: 'url',
    name: 'urlExtra_17 (链接参数解构_17)',
    desc: '解构URL路径、提取子域名或Hash段，第 17 号。',
    fn: urlTools.urlExtra_17,
    code: urlTools.urlExtra_17.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_18',
    module: 'url',
    name: 'urlExtra_18 (链接参数解构_18)',
    desc: '解构URL路径、提取子域名或Hash段，第 18 号。',
    fn: urlTools.urlExtra_18,
    code: urlTools.urlExtra_18.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_19',
    module: 'url',
    name: 'urlExtra_19 (链接参数解构_19)',
    desc: '解构URL路径、提取子域名或Hash段，第 19 号。',
    fn: urlTools.urlExtra_19,
    code: urlTools.urlExtra_19.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_20',
    module: 'url',
    name: 'urlExtra_20 (链接参数解构_20)',
    desc: '解构URL路径、提取子域名或Hash段，第 20 号。',
    fn: urlTools.urlExtra_20,
    code: urlTools.urlExtra_20.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_21',
    module: 'url',
    name: 'urlExtra_21 (链接参数解构_21)',
    desc: '解构URL路径、提取子域名或Hash段，第 21 号。',
    fn: urlTools.urlExtra_21,
    code: urlTools.urlExtra_21.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_22',
    module: 'url',
    name: 'urlExtra_22 (链接参数解构_22)',
    desc: '解构URL路径、提取子域名或Hash段，第 22 号。',
    fn: urlTools.urlExtra_22,
    code: urlTools.urlExtra_22.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_23',
    module: 'url',
    name: 'urlExtra_23 (链接参数解构_23)',
    desc: '解构URL路径、提取子域名或Hash段，第 23 号。',
    fn: urlTools.urlExtra_23,
    code: urlTools.urlExtra_23.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_24',
    module: 'url',
    name: 'urlExtra_24 (链接参数解构_24)',
    desc: '解构URL路径、提取子域名或Hash段，第 24 号。',
    fn: urlTools.urlExtra_24,
    code: urlTools.urlExtra_24.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_25',
    module: 'url',
    name: 'urlExtra_25 (链接参数解构_25)',
    desc: '解构URL路径、提取子域名或Hash段，第 25 号。',
    fn: urlTools.urlExtra_25,
    code: urlTools.urlExtra_25.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_26',
    module: 'url',
    name: 'urlExtra_26 (链接参数解构_26)',
    desc: '解构URL路径、提取子域名或Hash段，第 26 号。',
    fn: urlTools.urlExtra_26,
    code: urlTools.urlExtra_26.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_27',
    module: 'url',
    name: 'urlExtra_27 (链接参数解构_27)',
    desc: '解构URL路径、提取子域名或Hash段，第 27 号。',
    fn: urlTools.urlExtra_27,
    code: urlTools.urlExtra_27.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_28',
    module: 'url',
    name: 'urlExtra_28 (链接参数解构_28)',
    desc: '解构URL路径、提取子域名或Hash段，第 28 号。',
    fn: urlTools.urlExtra_28,
    code: urlTools.urlExtra_28.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_29',
    module: 'url',
    name: 'urlExtra_29 (链接参数解构_29)',
    desc: '解构URL路径、提取子域名或Hash段，第 29 号。',
    fn: urlTools.urlExtra_29,
    code: urlTools.urlExtra_29.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
  {
    id: 'urlExtra_30',
    module: 'url',
    name: 'urlExtra_30 (链接参数解构_30)',
    desc: '解构URL路径、提取子域名或Hash段，第 30 号。',
    fn: urlTools.urlExtra_30,
    code: urlTools.urlExtra_30.toString(),
    params: [
    {
        "name": "url",
        "label": "网址链接",
        "type": "text",
        "default": "https://google.com#page-top"
    }
]
  },
]
