import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";

// 支持的界面语言（供将来的语言选单使用）
export const SUPPORTED_LOCALES = [
	{ code: "zh-CN", name: "简体中文" },
	{ code: "en", name: "English" },
] as const;

export type UILocale = (typeof SUPPORTED_LOCALES)[number]["code"];

const STORAGE_KEY = "ui-locale";
const DEFAULT_LOCALE: UILocale = "zh-CN";

function loadLocale(): UILocale {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) return saved as UILocale;
	} catch (e) {
		/* localStorage 不可用时忽略 */
	}
	return DEFAULT_LOCALE;
}

const i18n = createI18n({
	legacy: false,
	locale: loadLocale(), // 读取用户保存的语言，默认简体中文
	fallbackLocale: "en", // 缺失的词条回退到英文原文
	messages: {
		en,
		"zh-CN": zhCN,
	},
});

// 切换界面语言并持久化。之后的语言选单直接调用即可。
export function setLocale(locale: UILocale) {
	i18n.global.locale.value = locale;
	try {
		localStorage.setItem(STORAGE_KEY, locale);
	} catch (e) {
		/* 忽略 */
	}
	document.documentElement.setAttribute("lang", locale);
}

// 便于在浏览器控制台手动切换：window.setUILocale('en') / ('zh-CN')
try {
	(window as any).setUILocale = setLocale;
} catch (e) {
	/* 忽略 */
}

document.documentElement.setAttribute("lang", i18n.global.locale.value);

export default i18n;
