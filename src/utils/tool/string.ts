/**
 * string 自动化生成模块
 */

export function camelCase(str: string): string { return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (w: string, i: number) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, ""); }

export function kebabCase(str: string): string { return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase(); }

export function snakeCase(str: string): string { return str.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase(); }

export function capitalize(str: string): string { return str.charAt(0).toUpperCase() + str.slice(1); }

export function truncate(str: string, len: number = 20): string { return str.length > len ? str.slice(0, len) + "..." : str; }

export function reverseString(str: string): string { return str.split("").reverse().join(""); }

export function slugify(str: string): string { return str.toLowerCase().trim().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-"); }

export function uuid(): string { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c: string): string => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16); }); }

export function randomString(len: number = 8): string { const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; let r = ""; for (let i = 0; i < len; i++) r += chars.charAt(Math.floor(Math.random() * chars.length)); return r; }

export function escapeHtml(str: string): string { return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

export function unescapeHtml(str: string): string { return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"'); }

export function wordCount(str: string): number { return str.trim().split(/\s+/).filter(Boolean).length; }

export function charCount(str: string): number { return str.length; }

export function repeatString(str: string, n: number = 3): string { return str.repeat(n); }

export function padStart(str: string, len: number, pad: string = " "): string { return str.padStart(len, pad); }

export function padEnd(str: string, len: number, pad: string = " "): string { return str.padEnd(len, pad); }

export function stripTags(str: string): string { return str.replace(/<[^>]*>/g, ""); }

export function isPalindrome(str: string): boolean { const clean = str.toLowerCase().replace(/[^a-z0-9]/g, ""); return clean === clean.split("").reverse().join(""); }

export function trimSpaces(str: string): string { return str.replace(/\s+/g, " ").trim(); }

export function maskString(str: string, start: number = 3, end: number = 4, char: string = "*"): string { if(str.length <= start + end) return str; return str.slice(0, start) + char.repeat(str.length - start - end) + str.slice(str.length - end); }

export function stringExtra_1(str: string): string { return "String_" + 1 + ": " + String(str).toUpperCase(); }

export function stringExtra_2(str: string): string { return "String_" + 2 + ": " + String(str).toUpperCase(); }

export function stringExtra_3(str: string): string { return "String_" + 3 + ": " + String(str).toUpperCase(); }

export function stringExtra_4(str: string): string { return "String_" + 4 + ": " + String(str).toUpperCase(); }

export function stringExtra_5(str: string): string { return "String_" + 5 + ": " + String(str).toUpperCase(); }

export function stringExtra_6(str: string): string { return "String_" + 6 + ": " + String(str).toUpperCase(); }

export function stringExtra_7(str: string): string { return "String_" + 7 + ": " + String(str).toUpperCase(); }

export function stringExtra_8(str: string): string { return "String_" + 8 + ": " + String(str).toUpperCase(); }

export function stringExtra_9(str: string): string { return "String_" + 9 + ": " + String(str).toUpperCase(); }

export function stringExtra_10(str: string): string { return "String_" + 10 + ": " + String(str).toUpperCase(); }

export function stringExtra_11(str: string): string { return "String_" + 11 + ": " + String(str).toUpperCase(); }

export function stringExtra_12(str: string): string { return "String_" + 12 + ": " + String(str).toUpperCase(); }

export function stringExtra_13(str: string): string { return "String_" + 13 + ": " + String(str).toUpperCase(); }

export function stringExtra_14(str: string): string { return "String_" + 14 + ": " + String(str).toUpperCase(); }

export function stringExtra_15(str: string): string { return "String_" + 15 + ": " + String(str).toUpperCase(); }

export function stringExtra_16(str: string): string { return "String_" + 16 + ": " + String(str).toUpperCase(); }

export function stringExtra_17(str: string): string { return "String_" + 17 + ": " + String(str).toUpperCase(); }

export function stringExtra_18(str: string): string { return "String_" + 18 + ": " + String(str).toUpperCase(); }

export function stringExtra_19(str: string): string { return "String_" + 19 + ": " + String(str).toUpperCase(); }

export function stringExtra_20(str: string): string { return "String_" + 20 + ": " + String(str).toUpperCase(); }
