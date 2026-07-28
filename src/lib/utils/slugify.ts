/**
 * Deterministic transliteration maps for Armenian and Russian characters to Latin.
 */
const ARMENIAN_MAP: Record<string, string> = {
  ա: "a", Ա: "a",
  բ: "b", Բ: "b",
  գ: "g", Գ: "g",
  դ: "d", Դ: "d",
  ե: "e", Ե: "e",
  զ: "z", Զ: "z",
  է: "e", Է: "e",
  ը: "e", Ը: "e",
  թ: "t", Թ: "t",
  ժ: "zh", Ժ: "zh",
  ի: "i", Ի: "i",
  լ: "l", Լ: "l",
  խ: "kh", Խ: "kh",
  ծ: "ts", Ծ: "ts",
  կ: "k", Կ: "k",
  հ: "h", Հ: "h",
  ձ: "dz", Ձ: "dz",
  ղ: "gh", Ղ: "gh",
  ճ: "ch", Ճ: "ch",
  մ: "m", Մ: "m",
  յ: "y", Յ: "y",
  ն: "n", Ն: "n",
  շ: "sh", Շ: "sh",
  ո: "o", Ո: "o",
  չ: "ch", Չ: "ch",
  պ: "p", Պ: "p",
  ջ: "j", Ջ: "j",
  ռ: "r", Ռ: "r",
  ս: "s", Ս: "s",
  վ: "v", Վ: "v",
  տ: "t", Տ: "t",
  ր: "r", Ր: "r",
  ց: "ts", Ց: "ts",
  ու: "u", Ու: "u",
  փ: "p", Փ: "p",
  ք: "q", Ք: "q",
  և: "ev",
  օ: "o", Օ: "o",
  ֆ: "f", Ֆ: "f",
};

const RUSSIAN_MAP: Record<string, string> = {
  а: "a", А: "a",
  б: "b", Б: "b",
  в: "v", В: "v",
  г: "g", Г: "g",
  д: "d", Д: "d",
  е: "e", Е: "e",
  ё: "yo", Ё: "yo",
  ж: "zh", Ж: "zh",
  з: "z", З: "z",
  и: "i", И: "i",
  й: "y", Й: "y",
  к: "k", К: "k",
  л: "l", Л: "l",
  м: "m", М: "m",
  н: "n", Н: "n",
  о: "o", О: "o",
  п: "p", П: "p",
  р: "r", Р: "r",
  с: "s", С: "s",
  т: "t", Т: "t",
  у: "u", У: "u",
  ф: "f", Ф: "f",
  х: "kh", Х: "kh",
  ц: "ts", Ц: "ts",
  ч: "ch", Ч: "ch",
  ш: "sh", Ш: "sh",
  щ: "shch", Щ: "shch",
  ъ: "", Ъ: "",
  ы: "y", Ы: "y",
  ь: "", Ь: "",
  э: "e", Э: "e",
  ю: "yu", Ю: "yu",
  я: "ya", Я: "ya",
};

/**
 * Transliterates text from Armenian/Russian to Latin, converts to lowercase,
 * strips invalid characters, replaces spaces/symbols with hyphens, and formats to max 120 chars.
 */
export function slugifyText(text: string): string {
  if (!text) return "";

  let result = "";

  for (const char of text) {
    if (ARMENIAN_MAP[char] !== undefined) {
      result += ARMENIAN_MAP[char];
    } else if (RUSSIAN_MAP[char] !== undefined) {
      result += RUSSIAN_MAP[char];
    } else {
      result += char;
    }
  }

  return result
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Strip diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Latin letters & numbers only
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces & underscores with hyphens
    .replace(/-+/g, "-") // Remove duplicate hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .slice(0, 120);
}

/**
 * Generates slug from title according to priority:
 * 1. English title (if available)
 * 2. Russian title (if available)
 * 3. Armenian title (with transliteration)
 * 4. Fallback timestamp `news-YYYYMMDD-HHmm`
 */
export function generateAutoSlug(
  titleEn: string,
  titleRu: string,
  titleHy: string
): string {
  let slug = "";

  if (titleEn && titleEn.trim()) {
    slug = slugifyText(titleEn);
  }

  if (!slug && titleRu && titleRu.trim()) {
    slug = slugifyText(titleRu);
  }

  if (!slug && titleHy && titleHy.trim()) {
    slug = slugifyText(titleHy);
  }

  if (!slug) {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const DD = String(now.getDate()).padStart(2, "0");
    const HH = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    slug = `news-${YYYY}${MM}${DD}-${HH}${mm}`;
  }

  return slug;
}
