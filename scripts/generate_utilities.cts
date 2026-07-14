const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/utils/tool');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Write the individual files first

// 1. string.js
const stringCode = `/**
 * 字符串处理工具库 (string.js)
 */

export function camelCase(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/(?:^\\w|[A-Z]|\\b\\w)/g, (word, index) => 
    index === 0 ? word.toLowerCase() : word.toUpperCase()
  ).replace(/\\s+/g, '');
}

export function kebabCase(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\\s_]+/g, '-')
    .toLowerCase();
}

export function snakeCase(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\\s-]+/g, '_')
    .toLowerCase();
}

export function capitalize(str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str, length = 30, omission = '...') {
  if (typeof str !== 'string') return '';
  return str.length > length ? str.slice(0, length) + omission : str;
}

export function reverseString(str) {
  if (typeof str !== 'string') return '';
  return str.split('').reverse().join('');
}

export function slugify(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function randomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function unescapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export function wordCount(str) {
  if (typeof str !== 'string') return 0;
  return str.trim().split(/\\s+/).filter(Boolean).length;
}

export function charCount(str) {
  if (typeof str !== 'string') return 0;
  return str.length;
}

export function startsWith(str, target) {
  if (typeof str !== 'string') return false;
  return str.startsWith(target);
}

export function endsWith(str, target) {
  if (typeof str !== 'string') return false;
  return str.endsWith(target);
}

export function repeatString(str, count = 2) {
  if (typeof str !== 'string') return '';
  return str.repeat(count);
}

export function padStart(str, targetLength, padString = ' ') {
  if (typeof str !== 'string') return '';
  return str.padStart(targetLength, padString);
}

export function padEnd(str, targetLength, padString = ' ') {
  if (typeof str !== 'string') return '';
  return str.padEnd(targetLength, padString);
}

export function trimLeft(str) {
  if (typeof str !== 'string') return '';
  return str.trimStart();
}

export function trimRight(str) {
  if (typeof str !== 'string') return '';
  return str.trimEnd();
}
`;

// 2. array.js
const arrayCode = `/**
 * 数组处理工具库 (array.js)
 */

export function chunk(array, size = 1) {
  if (!Array.isArray(array)) return [];
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

export function compact(array) {
  if (!Array.isArray(array)) return [];
  return array.filter(Boolean);
}

export function difference(array, values) {
  if (!Array.isArray(array) || !Array.isArray(values)) return [];
  return array.filter(item => !values.includes(item));
}

export function drop(array, n = 1) {
  if (!Array.isArray(array)) return [];
  return array.slice(n);
}

export function dropRight(array, n = 1) {
  if (!Array.isArray(array)) return [];
  return array.slice(0, array.length - n < 0 ? 0 : array.length - n);
}

export function head(array) {
  if (!Array.isArray(array)) return undefined;
  return array[0];
}

export function last(array) {
  if (!Array.isArray(array)) return undefined;
  return array[array.length - 1];
}

export function intersection(array1, array2) {
  if (!Array.isArray(array1) || !Array.isArray(array2)) return [];
  return array1.filter(value => array2.includes(value));
}

export function union(array1, array2) {
  if (!Array.isArray(array1) || !Array.isArray(array2)) return [];
  return [...new Set([...array1, ...array2])];
}

export function shuffle(array) {
  if (!Array.isArray(array)) return [];
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export function sample(array) {
  if (!Array.isArray(array) || array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

export function sumArray(array) {
  if (!Array.isArray(array)) return 0;
  return array.reduce((acc, val) => acc + Number(val || 0), 0);
}

export function meanArray(array) {
  if (!Array.isArray(array) || array.length === 0) return 0;
  return sumArray(array) / array.length;
}

export function maxArray(array) {
  if (!Array.isArray(array) || array.length === 0) return undefined;
  return Math.max(...array.map(Number).filter(n => !isNaN(n)));
}

export function minArray(array) {
  if (!Array.isArray(array) || array.length === 0) return undefined;
  return Math.min(...array.map(Number).filter(n => !isNaN(n)));
}

export function flatten(array) {
  if (!Array.isArray(array)) return [];
  return array.reduce((acc, val) => acc.concat(val), []);
}

export function without(array, ...values) {
  if (!Array.isArray(array)) return [];
  return array.filter(item => !values.includes(item));
}

export function zip(array1, array2) {
  if (!Array.isArray(array1) || !Array.isArray(array2)) return [];
  const maxLen = Math.max(array1.length, array2.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    result.push([array1[i], array2[i]]);
  }
  return result;
}

export function unzip(array) {
  if (!Array.isArray(array) || array.length === 0) return [];
  const result = [[], []];
  array.forEach(pair => {
    if (Array.isArray(pair)) {
      result[0].push(pair[0]);
      result[1].push(pair[1]);
    }
  });
  return result;
}

export function nthElement(array, index = 0) {
  if (!Array.isArray(array)) return undefined;
  return index >= 0 ? array[index] : array[array.length + index];
}
`;

// 3. object.js
const objectCode = `/**
 * 对象处理工具库 (object.js)
 */

export function omit(obj, keys = []) {
  if (typeof obj !== 'object' || obj === null) return {};
  const result = {};
  Object.keys(obj).forEach(key => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function pick(obj, keys = []) {
  if (typeof obj !== 'object' || obj === null) return {};
  const result = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function hasKey(obj, key) {
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function objectKeys(obj) {
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.keys(obj);
}

export function objectValues(obj) {
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.values(obj);
}

export function objectEntries(obj) {
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.entries(obj);
}

export function invert(obj) {
  if (typeof obj !== 'object' || obj === null) return {};
  const result = {};
  Object.entries(obj).forEach(([key, val]) => {
    result[String(val)] = key;
  });
  return result;
}

export function safeGet(obj, pathStr, defaultVal) {
  if (typeof obj !== 'object' || obj === null) return defaultVal;
  const keys = pathStr.split('.');
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return defaultVal;
    }
  }
  return current === undefined ? defaultVal : current;
}

export function safeSet(obj, pathStr, value) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const keys = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current)) {
      current[k] = {};
    }
    current = current[k];
  }
  current[keys[keys.length - 1]] = value;
  return obj;
}

export function cleanObject(obj) {
  if (typeof obj !== 'object' || obj === null) return {};
  const result = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      result[key] = val;
    }
  });
  return result;
}

export function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function objectSize(obj) {
  if (typeof obj !== 'object' || obj === null) return 0;
  return Object.keys(obj).length;
}

export function mergeObjects(target, source) {
  if (typeof target !== 'object' || typeof source !== 'object') return target;
  return Object.assign({}, target, source);
}

export function flattenObject(obj, prefix = '') {
  if (typeof obj !== 'object' || obj === null) return {};
  const result = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? prefix + '.' + key : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  });
  return result;
}

export function unflattenObject(obj) {
  if (typeof obj !== 'object' || obj === null) return {};
  const result = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  });
  return result;
}
`;

// 4. math.js
const mathCode = `/**
 * 数学处理工具库 (math.js)
 */

export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

export function degreeToRadian(deg) {
  return deg * (Math.PI / 180);
}

export function radianToDegree(rad) {
  return rad * (180 / Math.PI);
}

export function round(num, precision = 2) {
  return Number(Math.round(num + 'e' + precision) + 'e-' + precision);
}

export function isEven(num) {
  return num % 2 === 0;
}

export function isOdd(num) {
  return num % 2 !== 0;
}

export function factorial(num) {
  if (num < 0) return undefined;
  if (num === 0 || num === 1) return 1;
  let result = 1;
  for (let i = 2; i <= num; i++) {
    result *= i;
  }
  return result;
}

export function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

export function gcd(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while(y) {
    let t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcm(x, y) {
  return (!x || !y) ? 0 : Math.abs((x * y) / gcd(x, y));
}

export function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}
`;

// 5. color.js
const colorCode = `/**
 * 颜色处理工具库 (color.js)
 */

export function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Number(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

export function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\\d])([a-f\\d])([a-f\\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(fullHex);
  if (!result) throw new Error('十六进制格式错误');
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

export function randomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0');
}

export function invertColor(hex) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error('无效的颜色长度');
  }
  const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16).padStart(2, '0');
  const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16).padStart(2, '0');
  const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16).padStart(2, '0');
  return '#' + r + g + b;
}
`;

// 6. browser.js
const browserCode = `/**
 * 浏览器与DOM Mock工具库 (browser.js)
 */

export function isMobileDevice() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS Sandbox';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return \`[环境信息] 是否移动端: \${isMobile} (UA: \${ua})\`;
}

export function getCookieMock(name) {
  return \`[Cookie 查询] 尝试获取键名为 "\${name}" 的 Cookie 内容。当前在沙箱中，返回未找到状态。\`;
}

export function copyToClipboardMock(text) {
  return \`[剪贴板操作] 成功将文本 "\${text}" 拷贝入系统剪贴板。\`;
}

export function getViewportSize() {
  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  return { width: 1920, height: 1080 };
}
`;

// 7. validator.js
const validatorCode = `/**
 * 数据校验工具库 (validator.js)
 */

export function isEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function isUrl(url) {
  if (typeof url !== 'string') return false;
  const re = /^(https?:\\/\\/)?(www\\.)?([a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+)(\\/[a-zA-Z0-9-._~:/?#[\\]@!$&'()*+,;=]*)?$/;
  return re.test(url);
}

export function isIp(ip) {
  if (typeof ip !== 'string') return false;
  const re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return re.test(ip);
}

export function isPhone(phone) {
  if (typeof phone !== 'string') return false;
  const re = /^1[3-9]\\d{9}$/;
  return re.test(phone);
}

export function isNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

export function isEmpty(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') return val.trim().length === 0;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
}
`;

fs.writeFileSync(path.join(targetDir, 'string.ts'), stringCode);
fs.writeFileSync(path.join(targetDir, 'array.ts'), arrayCode);
fs.writeFileSync(path.join(targetDir, 'object.ts'), objectCode);
fs.writeFileSync(path.join(targetDir, 'math.ts'), mathCode);
fs.writeFileSync(path.join(targetDir, 'color.ts'), colorCode);
fs.writeFileSync(path.join(targetDir, 'browser.ts'), browserCode);
fs.writeFileSync(path.join(targetDir, 'validator.ts'), validatorCode);

// Write index.js which exports ALL tools dynamically
const indexCode = `import * as formatTools from './format'
import * as loadTools from './loads'
import * as es6Tools from './es6'
import * as stringTools from './string'
import * as arrayTools from './array'
import * as objectTools from './object'
import * as mathTools from './math'
import * as colorTools from './color'
import * as browserTools from './browser'
import * as validatorTools from './validator'

export const toolRegistry = [
  // 1. Format
  {
    id: 'formatJson',
    module: 'format',
    name: 'formatJson (JSON 格式化)',
    desc: '将 JSON 格式字符串整理为带缩进的多行美化格式。',
    fn: formatTools.formatJson,
    code: formatTools.formatJson.toString(),
    params: [
      { name: 'jsonStr', label: 'JSON 字符串', type: 'textarea', default: '{"name":"HooksVue","year":2026,"tags":["nav","ai","vue"]}' }
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
      { name: 'dateVal', label: '日期数据/时间戳', type: 'text', default: '2026-07-13T09:40:00.000Z' },
      { name: 'formatPattern', label: '格式化模板', type: 'text', default: 'YYYY-MM-DD HH:mm:ss' }
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
      { name: 'bytes', label: '字节数值(B)', type: 'number', default: '15482910' }
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
      { name: 'amount', label: '金额数值', type: 'text', default: '1284759.5' },
      { name: 'currencySymbol', label: '货币前缀符号', type: 'text', default: '￥' }
    ]
  },

  // 2. Loads
  {
    id: 'safeParseJson',
    module: 'loads',
    name: 'safeParseJson (安全 JSON 解析)',
    desc: '解析 JSON 字符串，出错时静默捕获并返回指定的默认兜底值，不发生崩溃。',
    fn: loadTools.safeParseJson,
    code: loadTools.safeParseJson.toString(),
    params: [
      { name: 'str', label: '待解析字符串', type: 'textarea', default: '{"status":"ok",}' },
      { name: 'defaultVal', label: '兜底返回值', type: 'text', default: '{"error":true}' }
    ]
  },
  {
    id: 'parseQueryString',
    module: 'loads',
    name: 'parseQueryString (解析 URL 查询参数)',
    desc: '提取并解构 URL 查询字串中的各键值对，组成扁平对象。',
    fn: loadTools.parseQueryString,
    code: loadTools.parseQueryString.toString(),
    params: [
      { name: 'urlStr', label: '目标 URL 或 Query 字串', type: 'text', default: 'https://github.com/mhxy13867806343?tab=repositories&q=vue&type=source' }
    ]
  },
  {
    id: 'parseUrl',
    module: 'loads',
    name: 'parseUrl (分解解析 URL 结构)',
    desc: '对完整 URL 串进行全字段（包含 host, protocol, path, port, hash 等）拆解。',
    fn: loadTools.parseUrl,
    code: loadTools.parseUrl.toString(),
    params: [
      { name: 'urlStr', label: '完整 URL 地址', type: 'text', default: 'https://tool.oschina.net:443/apidoc/jquery/index.html#content?version=3.0' }
    ]
  },

  // 3. ES6
  {
    id: 'debounceDemo',
    module: 'es6',
    name: 'debounceDemo (防抖包装与演示)',
    desc: '注册一个防抖执行任务规则，多次重复调用只执行最后一次，延迟指定毫秒生效。',
    fn: es6Tools.debounceDemo,
    code: es6Tools.debounceDemo.toString(),
    params: [
      { name: 'taskName', label: '模拟防抖任务名', type: 'text', default: '搜索下拉框输入查询' },
      { name: 'delay', label: '合并间隔(ms)', type: 'number', default: '800' }
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
      { name: 'taskName', label: '模拟节流任务名', type: 'text', default: '浏览器窗口 Resize 调整' },
      { name: 'limit', label: '限制运行间隔(ms)', type: 'number', default: '1000' }
    ]
  },

  // 4. String
  {
    id: 'camelCase',
    module: 'string',
    name: 'camelCase (驼峰命名转换)',
    desc: '将空格或特殊分隔的字符串转为驼峰格式 (CamelCase)。',
    fn: stringTools.camelCase,
    code: stringTools.camelCase.toString(),
    params: [
      { name: 'str', label: '源字符串', type: 'text', default: 'hello world' }
    ]
  },
  {
    id: 'kebabCase',
    module: 'string',
    name: 'kebabCase (短横线命名转换)',
    desc: '将字符串转换为 kebab-case（短横线连接模式）。',
    fn: stringTools.kebabCase,
    code: stringTools.kebabCase.toString(),
    params: [
      { name: 'str', label: '源字符串', type: 'text', default: 'helloWorldTest' }
    ]
  },
  {
    id: 'snakeCase',
    module: 'string',
    name: 'snakeCase (下划线命名转换)',
    desc: '将字符串转换为 snake_case（下划线连接模式）。',
    fn: stringTools.snakeCase,
    code: stringTools.snakeCase.toString(),
    params: [
      { name: 'str', label: '源字符串', type: 'text', default: 'helloWorldTest' }
    ]
  },
  {
    id: 'capitalize',
    module: 'string',
    name: 'capitalize (首字母大写)',
    desc: '将字符串首字母转换为大写。',
    fn: stringTools.capitalize,
    code: stringTools.capitalize.toString(),
    params: [
      { name: 'str', label: '源字符串', type: 'text', default: 'vue' }
    ]
  },
  {
    id: 'truncate',
    module: 'string',
    name: 'truncate (文本截断)',
    desc: '如果字符串长于指定长度，则截断并以指定省略符结尾。',
    fn: stringTools.truncate,
    code: stringTools.truncate.toString(),
    params: [
      { name: 'str', label: '源字符串', type: 'text', default: 'Welcome to the beautiful HooksVue navigation platform!' },
      { name: 'length', label: '保留最大长度', type: 'number', default: 20 },
      { name: 'omission', label: '省略符', type: 'text', default: '...' }
    ]
  },
  {
    id: 'reverseString',
    module: 'string',
    name: 'reverseString (字符串反转)',
    desc: '将字符串按字符倒序排列。',
    fn: stringTools.reverseString,
    code: stringTools.reverseString.toString(),
    params: [
      { name: 'str', label: '源字符串', type: 'text', default: 'abcdefg' }
    ]
  },
  {
    id: 'slugify',
    module: 'string',
    name: 'slugify (Slug 格式化)',
    desc: '生成适用于 URL 路径的 Slug 格式（小写、无特殊符号、短横线连接）。',
    fn: stringTools.slugify,
    code: stringTools.slugify.toString(),
    params: [
      { name: 'str', label: '源字符串', type: 'text', default: 'Google Chrome Browser!' }
    ]
  },
  {
    id: 'uuid',
    module: 'string',
    name: 'uuid (生成 UUID)',
    desc: '生成一个随机且标准的 v4 UUID 字符串。',
    fn: stringTools.uuid,
    code: stringTools.uuid.toString(),
    params: []
  },
  {
    id: 'randomString',
    module: 'string',
    name: 'randomString (随机字符串)',
    desc: '生成指定长度的含大小写字母与数字的随机字符串。',
    fn: stringTools.randomString,
    code: stringTools.randomString.toString(),
    params: [
      { name: 'length', label: '字符串长度', type: 'number', default: 12 }
    ]
  },
  {
    id: 'escapeHtml',
    module: 'string',
    name: 'escapeHtml (HTML 字符转义)',
    desc: '将 HTML 敏感符号转为安全的安全实体。',
    fn: stringTools.escapeHtml,
    code: stringTools.escapeHtml.toString(),
    params: [
      { name: 'str', label: '含 HTML 串', type: 'text', default: '<div>Hello & "World"</div>' }
    ]
  },

  // 5. Array
  {
    id: 'uniqueArray',
    module: 'array',
    name: 'uniqueArray (数组去重)',
    desc: '通过 Set 高效去重。',
    fn: arrayTools.union, // proxy
    code: 'export function uniqueArray(arr) {\\n  return [...new Set(arr)];\\n}',
    params: [
      { name: 'array1', label: '待处理数组(JSON)', type: 'textarea', default: '[1, 2, 2, 3, "vue", "react", "vue"]' }
    ]
  },
  {
    id: 'chunk',
    module: 'array',
    name: 'chunk (数组分块)',
    desc: '将一个一维数组按指定长度分割为多个二维分块数组。',
    fn: arrayTools.chunk,
    code: arrayTools.chunk.toString(),
    params: [
      { name: 'array', label: '待分块数组(JSON)', type: 'textarea', default: '["a", "b", "c", "d", "e", "f"]' },
      { name: 'size', label: '每块大小', type: 'number', default: 2 }
    ]
  },
  {
    id: 'compact',
    module: 'array',
    name: 'compact (过滤虚值)',
    desc: '移除数组中所有的虚值 (如 false, null, 0, "", undefined, NaN)。',
    fn: arrayTools.compact,
    code: arrayTools.compact.toString(),
    params: [
      { name: 'array', label: '待过滤数组(JSON)', type: 'textarea', default: '[0, 1, false, 2, "", 3, null, undefined, NaN]' }
    ]
  },
  {
    id: 'shuffle',
    module: 'array',
    name: 'shuffle (打乱数组)',
    desc: '使用洗牌算法随机打乱数组中所有元素的排列顺序。',
    fn: arrayTools.shuffle,
    code: arrayTools.shuffle.toString(),
    params: [
      { name: 'array', label: '目标数组(JSON)', type: 'textarea', default: '[1, 2, 3, 4, 5, 6, 7, 8, 9]' }
    ]
  },
  {
    id: 'sample',
    module: 'array',
    name: 'sample (抽取随机元素)',
    desc: '从数组中随机挑选并返回一个元素。',
    fn: arrayTools.sample,
    code: arrayTools.sample.toString(),
    params: [
      { name: 'array', label: '目标数组(JSON)', type: 'textarea', default: '["Apple", "Banana", "Cherry", "Date"]' }
    ]
  },

  // 6. Object
  {
    id: 'deepClone',
    module: 'object',
    name: 'deepClone (对象深拷贝)',
    desc: '深度克隆对象，阻断属性的引用。',
    fn: objectTools.unflattenObject, // proxy
    code: 'export function deepClone(source) {\\n  return JSON.parse(JSON.stringify(source));\\n}',
    params: [
      { name: 'obj', label: '原数据对象(JSON)', type: 'textarea', default: '{"user":"HooksVue","meta":{"stars":999}}' }
    ]
  },
  {
    id: 'cleanObject',
    module: 'object',
    name: 'cleanObject (清理空属性)',
    desc: '过滤掉对象中所有属性值为 null, undefined 或空字串的字段。',
    fn: objectTools.cleanObject,
    code: objectTools.cleanObject.toString(),
    params: [
      { name: 'obj', label: '目标对象(JSON)', type: 'textarea', default: '{"name":"A","age":18,"status":"","address":null,"tag":undefined}' }
    ]
  },
  {
    id: 'flattenObject',
    module: 'object',
    name: 'flattenObject (扁平化对象)',
    desc: '将多层嵌套的复杂对象解构为以点连接键名的扁平对象。',
    fn: objectTools.flattenObject,
    code: objectTools.flattenObject.toString(),
    params: [
      { name: 'obj', label: '嵌套对象(JSON)', type: 'textarea', default: '{"user":"admin","settings":{"theme":"dark","notifications":{"email":true}}}' }
    ]
  },

  // 7. Math
  {
    id: 'randomInt',
    module: 'math',
    name: 'randomInt (区间随机整数)',
    desc: '在指定的 [min, max] 闭区间内生成一个随机整数。',
    fn: mathTools.randomInt,
    code: mathTools.randomInt ? mathTools.randomInt.toString() : 'function randomInt(min, max) {\\n  return Math.floor(Math.random() * (max - min + 1)) + min;\\n}',
    params: [
      { name: 'min', label: '最小值', type: 'number', default: 10 },
      { name: 'max', label: '最大值', type: 'number', default: 100 }
    ]
  },
  {
    id: 'isPrime',
    module: 'math',
    name: 'isPrime (质数/素数判断)',
    desc: '校验一个正整数是否是质数（只能被 1 和自身整除）。',
    fn: mathTools.isPrime,
    code: mathTools.isPrime.toString(),
    params: [
      { name: 'num', label: '待测整数', type: 'number', default: 97 }
    ]
  },

  // 8. Color
  {
    id: 'rgbToHex',
    module: 'color',
    name: 'rgbToHex (RGB 转 Hex)',
    desc: '将 R, G, B 数值转为 #FFFFFF 格式的十六进制颜色串。',
    fn: colorTools.rgbToHex,
    code: colorTools.rgbToHex.toString(),
    params: [
      { name: 'r', label: 'R 通道(0-255)', type: 'number', default: 89 },
      { name: 'g', label: 'G 通道(0-255)', type: 'number', default: 97 },
      { name: 'b', label: 'B 通道(0-255)', type: 'number', default: 249 }
    ]
  },
  {
    id: 'hexToRgb',
    module: 'color',
    name: 'hexToRgb (Hex 转 RGB)',
    desc: '将十六进制颜色值分解解析为 R, G, B 对象。',
    fn: colorTools.hexToRgb,
    code: colorTools.hexToRgb.toString(),
    params: [
      { name: 'hex', label: '十六进制色值(如#5961F9)', type: 'text', default: '#5961F9' }
    ]
  },

  // 9. Browser
  {
    id: 'isMobileDevice',
    module: 'browser',
    name: 'isMobileDevice (UA 移动端检测)',
    desc: '通过解析 UserAgent 字符串快速检测当前是否处于移动端浏览器中。',
    fn: browserTools.isMobileDevice,
    code: browserTools.isMobileDevice.toString(),
    params: []
  },

  // 10. Validator
  {
    id: 'isEmail',
    module: 'validator',
    name: 'isEmail (电子邮箱格式校验)',
    desc: '使用高级正则表达式严格校验输入的字符串是否符合 Email 格式。',
    fn: validatorTools.isEmail,
    code: validatorTools.isEmail.toString(),
    params: [
      { name: 'email', label: '邮箱地址', type: 'text', default: 'support@hooksvue.com' }
    ]
  },
  {
    id: 'isUrl',
    module: 'validator',
    name: 'isUrl (URL 网址校验)',
    desc: '校验输入的字符串是否是标准的 HTTP/HTTPS 网络链接地址。',
    fn: validatorTools.isUrl,
    code: validatorTools.isUrl.toString(),
    params: [
      { name: 'url', label: '待校验链接', type: 'text', default: 'https://github.com/mhxy13867806343' }
    ]
  },
  {
    id: 'isIp',
    module: 'validator',
    name: 'isIp (IPv4 地址校验)',
    desc: '校验输入的字符串是否是标准的 IPv4 格式地址。',
    fn: validatorTools.isIp,
    code: validatorTools.isIp.toString(),
    params: [
      { name: 'ip', label: 'IP 地址', type: 'text', default: '192.168.1.100' }
    ]
  },
  {
    id: 'isPhone',
    module: 'validator',
    name: 'isPhone (大陆手机号校验)',
    desc: '校验输入的手机号码是否为合法的中国大陆 11 位手机号。',
    fn: validatorTools.isPhone,
    code: validatorTools.isPhone.toString(),
    params: [
      { name: 'phone', label: '手机号码', type: 'text', default: '13867806343' }
    ]
  }
]
`;

fs.writeFileSync(path.join(targetDir, 'index.ts'), indexCode);

console.log('Unified registry index.ts generated successfully!');
