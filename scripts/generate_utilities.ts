const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/utils/tool');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Strings
const stringsCode = `/**
 * 字符串常用工具函数
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

// 2. Arrays
const arraysCode = `/**
 * 数组常用工具函数
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

// 3. Objects
const objectsCode = `/**
 * 对象常用工具函数
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

// 4. Math
const mathCode = `/**
 * 数学常用工具函数
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

// 5. Color
const colorCode = `/**
 * 颜色值转换工具函数
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

// 6. Browser / DOM mocks (since they run in sandbox, we describe them as functions returning info strings)
const browserCode = `/**
 * 浏览器与环境描述工具函数
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

// 7. Validators
const validatorCode = `/**
 * 数据有效性校验工具函数
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

fs.writeFileSync(path.join(targetDir, 'string.ts'), stringsCode);
fs.writeFileSync(path.join(targetDir, 'array.ts'), arraysCode);
fs.writeFileSync(path.join(targetDir, 'object.ts'), objectsCode);
fs.writeFileSync(path.join(targetDir, 'math.ts'), mathCode);
fs.writeFileSync(path.join(targetDir, 'color.ts'), colorCode);
fs.writeFileSync(path.join(targetDir, 'browser.ts'), browserCode);
fs.writeFileSync(path.join(targetDir, 'validator.ts'), validatorCode);

console.log('Utility source files generated successfully!');
