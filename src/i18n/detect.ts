import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./locales";

/**
 * BCP 47 マッチング：
 *   1) 完全一致（"pt-BR" == "pt-BR"）
 *   2) 言語サブタグ一致（"pt-PT" → "pt-BR" を同族として拾う）
 *   3) ヒットなしなら null（呼び出し側で fallback 判断）
 *
 * 備考：スクリプト付き（"zh-Hant-HK" 等）は最初の "-" で切って拾うので
 * "zh-HK" や "zh-Hant-HK" でも "zh-TW" に落ちる。十分な精度とは言えないが
 * CLDR の Likely Subtags まで含めるのは過剰なのでここまでで止める。
 */
export function matchLocale(requested: string): string | null {
  if (!requested) return null;
  const req = requested.replace(/_/g, "-");

  const exact = SUPPORTED_LOCALES.find(
    (l) => l.code.toLowerCase() === req.toLowerCase(),
  );
  if (exact) return exact.code;

  const lang = req.split("-")[0]?.toLowerCase();
  if (!lang) return null;

  const sameCode = SUPPORTED_LOCALES.find(
    (l) => l.code.toLowerCase() === lang,
  );
  if (sameCode) return sameCode.code;

  const sameFamily = SUPPORTED_LOCALES.find((l) =>
    l.code.toLowerCase().startsWith(lang + "-"),
  );
  if (sameFamily) return sameFamily.code;

  return null;
}

/** localStorage に明示選択を覚えるためのキー。LP 側と同じ名前を共有しても、
 *  futatoki.app と play.futatoki.app は別オリジン扱いなので
 *  localStorage は分かれる。命名だけ揃えてある。 */
const STORAGE_KEY = "futatoki:locale";

/**
 * 優先順位：
 *   1) URL ?lang=xx（明示指定。マッチしたら localStorage にも保存して将来も尊重）
 *   2) localStorage の保存値（前回 ?lang で来た or アプリ内で選んだ言語）
 *   3) navigator.languages（Accept-Language 相当）の先頭から順にマッチを探す
 *   4) どれも当たらなければ DEFAULT_LOCALE
 */
export function detectLocale(): string {
  if (typeof window !== "undefined") {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (urlLang) {
      const matched = matchLocale(urlLang);
      if (matched) {
        try {
          localStorage.setItem(STORAGE_KEY, matched);
        } catch (e) {
          console.warn("[futatoki-app] localStorage.setItem(locale) failed:", e);
        }
        return matched;
      }
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const matched = matchLocale(saved);
        if (matched) return matched;
      }
    } catch (e) {
      console.warn("[futatoki-app] localStorage.getItem(locale) failed:", e);
    }
  }

  if (typeof navigator !== "undefined") {
    const candidates = navigator.languages?.length
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];
    for (const cand of candidates) {
      const matched = matchLocale(cand);
      if (matched) return matched;
    }
  }

  return DEFAULT_LOCALE;
}
