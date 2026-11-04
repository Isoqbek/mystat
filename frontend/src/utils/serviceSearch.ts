import type { ServiceCatalogItem } from "../config/serviceCatalog";
import { translate, type Lang } from "../i18n/LangContext";

/** Apostrof, tutuq belgisi va diakritiklarsiz kichik harf: "O'zbekiston", "Oʻzbekiston", "ўзбекистон" bir xil qidiriladi. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ʻʼ’‘`'´]/g, "")
    .replace(/ё/g, "е")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}#\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ikki so'z orasidagi tahrir masofasi 1 dan oshmasa true (bitta harf xatosi, tushib qolgan yoki ortiqcha harf). */
function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : b.slice(i + 1) === a.slice(i);
}

/** Bitta so'zni matnning so'zlariga solishtiradi: so'z boshi 3, ichida 2, bitta harf xatosi bilan 1, topilmasa 0. */
function tokenScore(token: string, words: string[], text: string): number {
  if (words.some((w) => w.startsWith(token))) return 3;
  if (token.length >= 3 && text.includes(token)) return 2;
  if (token.length >= 4 && words.some((w) => withinOneEdit(token, w.slice(0, token.length)) || withinOneEdit(token, w))) return 1;
  return 0;
}

interface Field { text: string; words: string[]; weight: number }

function fields(s: ServiceCatalogItem, lang: Lang): Field[] {
  const make = (raw: string, weight: number): Field => {
    const text = normalize(raw);
    return { text, words: text.split(" "), weight };
  };
  return [
    make(translate(s.title, lang), 6),
    make((s.keywords ?? []).join(" "), 4),
    make(translate(s.description, lang), 1),
  ];
}

/**
 * Katalogdan xizmat qidirish: har so'z (hammasi) topilishi shart; sarlavha va kalit so'zlar tavsifdan ustun.
 * Raqam bilan ham topiladi ("302", "#302"). Natija ball bo'yicha, teng bo'lsa katalog tartibida.
 */
export function searchServices(list: ServiceCatalogItem[], query: string, lang: Lang, limit = 8): ServiceCatalogItem[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.replace(/#/g, "").split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const scored: { s: ServiceCatalogItem; score: number; idx: number }[] = [];
  list.forEach((s, idx) => {
    const num = String(s.number);
    if (tokens.length === 1 && /^\d+$/.test(tokens[0]) && num.startsWith(tokens[0])) {
      scored.push({ s, score: num === tokens[0] ? 1000 : 500, idx });
      return;
    }
    const fs = fields(s, lang);
    let total = 0;
    for (const t of tokens) {
      let best = 0;
      for (const f of fs) best = Math.max(best, tokenScore(t, f.words, f.text) * f.weight);
      if (!best) return;
      total += best;
    }
    if (fs[0].text.startsWith(q)) total += 20;
    scored.push({ s, score: total, idx });
  });
  return scored.sort((a, b) => b.score - a.score || a.idx - b.idx).slice(0, limit).map((x) => x.s);
}
