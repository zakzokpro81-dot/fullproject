/**
 * Normalize Arabic text for search comparisons.
 * Strips diacritics and normalises common letterform variants
 * (e.g. أ إ آ → ا, ة → ه, ى → ي).
 */
export function normalizeText(str = "") {
  return str
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, "") // strip diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}
