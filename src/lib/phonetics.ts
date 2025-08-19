export type Token = string;
export type SepKind = 'hyphen' | 'middot' | 'space' | 'none';

export const LETTERS: Array<{ ch: string; nameIPA: string; ali: string; alt?: string; note?: string }> = [
  { ch: "A", nameIPA: "[a]", ali: "aah" },
  { ch: "B", nameIPA: "[be]", ali: "beh", alt: "bé", note: "Aim for /e/ (not English 'bee')." },
  { ch: "C", nameIPA: "[se]", ali: "say", alt: "cé", note: "Use single 'ay' quality; don't write 'cee'." },
  { ch: "D", nameIPA: "[de]", ali: "deh", alt: "dé", note: "Avoid 'the' (no /θ/ in French)." },
  { ch: "E", nameIPA: "[ə]", ali: "uh", note: "This is the famous 'euh' → just 'uh'." },
  { ch: "F", nameIPA: "[ɛf]", ali: "ehf", alt: "èf" },
  { ch: "G", nameIPA: "[ʒe]", ali: "zhay", alt: "jé", note: "It's /ʒ/ as in 'vision' → 'zh', not 'jsh'." },
  { ch: "H", nameIPA: "[aʃ]", ali: "ash", note: "Letter name; sound is silent in words." },
  { ch: "I", nameIPA: "[i]", ali: "ee" },
  { ch: "J", nameIPA: "[ʒi]", ali: "zhee", alt: "ji", note: "'zh' + 'ee'." },
  { ch: "K", nameIPA: "[ka]", ali: "kaah", alt: "ka", note: "Open /a/; length not phonemic, but this cue is fine." },
  { ch: "L", nameIPA: "[ɛl]", ali: "ehl" },
  { ch: "M", nameIPA: "[ɛm]", ali: "ehm" },
  { ch: "N", nameIPA: "[ɛn]", ali: "ehn" },
  { ch: "O", nameIPA: "[o]", ali: "oh" },
  { ch: "P", nameIPA: "[pe]", ali: "peh", alt: "pé", note: "Avoid 'pee' (that's /piː/)." },
  { ch: "Q", nameIPA: "[ky]", ali: "kü", alt: "kyü", note: "k + front-rounded /y/ (round lips)." },
  { ch: "R", nameIPA: "[ɛʁ]", ali: "ghr", note: "Uvular; think Arabic غ (ghayn)." },
  { ch: "S", nameIPA: "[ɛs]", ali: "ehs", alt: "ès" },
  { ch: "T", nameIPA: "[te]", ali: "teh", alt: "té", note: "Avoid 'tee'." },
  { ch: "U", nameIPA: "[y]", ali: "ü", alt: "uu", note: "Front-rounded vowel (not 'oo')." },
  { ch: "V", nameIPA: "[ve]", ali: "veh", alt: "vé" },
  { ch: "W", nameIPA: "[dublə ve]", ali: "double vé" },
  { ch: "X", nameIPA: "[iks]", ali: "iks" },
  { ch: "Y", nameIPA: "[i ɡʁɛk]", ali: "i grec" },
  { ch: "Z", nameIPA: "[zɛd]", ali: "zèd" },
];

export const RULES = [
  { key: 'softC',  label: "c before e/i/y → S (soft c)",          re: /c(?=[eéiïy])/ },
  { key: 'softG',  label: "g before e/i/y → ZH (soft g)",          re: /g(?=[eéiïy])/ },
  { key: 'ou',     label: "ou → OO",                               re: /ou/ },
  { key: 'oi',     label: "oi → WA",                               re: /oi/ },
  { key: 'au',     label: "au/eau → OH",                           re: /(au|eau)/ },
  { key: 'eu',     label: "eu/œu → EU (ö‑like)",                   re: /(eu|œu)/ },
  { key: 'nasAL',  label: "an/en/am/em → nasal (AH˜)",             re: /(an|am|en|em)/ },
  { key: 'nasON',  label: "on/om → nasal (OH˜)",                   re: /(on|om)/ },
  { key: 'nasIN',  label: "in/im/ain/ein/yn/ym → nasal (EH˜)",     re: /(in|im|ain|ein|yn|ym)/ },
  { key: 'nasUN',  label: "un/um → nasal (UH˜)",                   re: /(un|um)/ },
  { key: 'sBetween',label: "s between vowels → Z",                 re: /[aeiouyàâäéèêëîïôöùûüœ]s(?=[aeiouyàâäéèêëîïôöùûüœ])/ },
  { key: 'ill',    label: "vowel + ill → Y (fille)",               re: /[aeiouy]ill/ },
  { key: 'finalE', label: "final -e often silent (schwa)",         re: /e$/ },
  { key: 'hSilent',label: "h is silent (may block liaison)",       re: /h/ },
  { key: 'yGlide', label: "y before vowel → glide /j/",            re: /y(?=[aeiouyàâäéèêëîïôöùûüœ])/ },
  { key: 'jToZh',  label: "j → ZH",                                re: /j/ },
  { key: 'quToK',  label: "qu → K",                                re: /qu/ },
  { key: 'cedilla',label: "ç → S",                                 re: /ç/ },
];

export const Examples: Array<{ label: string; text: string }> = [
  { label: "Thomas", text: "Thomas" },
  { label: "William", text: "William" },
  { label: "Yasmine", text: "Yasmine" },
  { label: "Zohra", text: "Zohra" },
  { label: "Les amis arrivent", text: "Les amis arrivent" },
];

export const smokeTests = [
    "Yasmine",
    "Thomas",
    "Zohra",
    "fille",
    "garçon",
    "eau",
    "un",
    "in",
    "eu",
    "façade",
    "ancien",
    "chien",
    "queue",
    "poisson",
];


export const SEP_MAP: Record<SepKind, string> = { hyphen: "\u2011", middot: "·", space: " ", none: "" };

export const toArabic = (t: Token): string => {
  switch (t) {
    case "AH": return "ا";
    case "AY": return "ي";
    case "EH": return "إِ";
    case "UH": return "ٱ";
    case "EE": return "ي";
    case "OH": return "و";
    case "OO": return "و";
    case "Ü": return "يُ";
    case "EU": return "وِ";
    case "WA": return "وا";
    case "SH": return "ش";
    case "ZH": return "ج";
    case "NY": return "نْي";
    case "Y": return "ي";
    case "R": return "غ";
    case "K": return "ك";
    case "G": return "ج";
    case "S": return "س";
    case "Z": return "ز";
    case "T": return "ت";
    case "D": return "د";
    case "F": return "ف";
    case "V": return "ڤ";
    case "B": return "ب";
    case "P": return "ب";
    case "L": return "ل";
    case "M": return "م";
    case "N": return "ن";
    case "H": return "ه";
    case "W": return "و";
    case "X": return "كس";
    default:
      if (t.endsWith("~")) {
        const base = toArabic(t.replace("~", ""));
        return base + "ن"; // Using ن for nasalization
      }
      return t;
  }
};

export const toEN = (t: Token): string => {
  switch (t) {
    case "AH": return "ah";
    case "AY": return "ay";
    case "EH": return "eh";
    case "UH": return "uh";
    case "EE": return "ee";
    case "OH": return "oh";
    case "OO": return "oo";
    case "Ü": return "ü";
    case "EU": return "ö";
    case "WA": return "wa";
    case "SH": return "sh";
    case "ZH": return "zh";
    case "NY": return "ny";
    case "Y": return "y";
    case "R": return "ghr";
    case "AH~": return "ah(n)";
    case "OH~": return "on";
    case "EH~": return "in";
    case "UH~": return "un";
    default: return t.toLowerCase();
  }
};

const isVowel = (c: string) => /[aeiouyàâäéèêëîïôöùûüœ]/i.test(c);

export const transformWord = (wordRaw: string): Token[] => {
  let w = wordRaw.normalize("NFC");
  if (!/[\p{L}]/u.test(w)) return [w as Token];
  w = w.toLowerCase();

  w = w.replace(/ç/g, "{S}");
  w = w.replace(/œu/g, "{EU}");
  w = w.replace(/eau/g, "{OH}");
  w = w.replace(/au/g, "{OH}");
  w = w.replace(/oi/g, "{WA}");
  w = w.replace(/ou/g, "{OO}");

  w = w.replace(/(ain|ein|ien)(?=\b|[^a-z])/g, "{IN_NAS}");
  w = w.replace(/([aeiouy])ill/g, "$1{Y_GLIDE}");
  w = w.replace(/(an|am|en|em)(?=\b|[^a-z])/g, "{AN_NAS}");
  w = w.replace(/(on|om)(?=\b|[^a-z])/g, "{ON_NAS}");
  w = w.replace(/(in|im|yn|ym|ain|ein)(?=\b|[^a-z])/g, "{IN_NAS}");
  w = w.replace(/(un|um)(?=\b|[^a-z])/g, "{UN_NAS}");

  w = w.replace(/ch/g, "{SH}");
  w = w.replace(/gn/g, "{NY}");
  w = w.replace(/j/g, "{ZH}");
  w = w.replace(/g(?=[eéiïy])/g, "{ZH}");
  w = w.replace(/c(?=[eéiïy])/g, "{S}");
  w = w.replace(/qu/g, "{K}");
  w = w.replace(/h/g, "");

  w = w.replace(/[é]/g, "{AY}");
  w = w.replace(/[èê]/g, "{EH}");
  w = w.replace(/[àâ]/g, "{AH}");
  w = w.replace(/[îï]/g, "{EE}");
  w = w.replace(/[ô]/g, "{OH}");

  const tokens: Token[] = [];
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const prev = w[i - 1];
    const next = w[i + 1];

    if (w.startsWith("{", i)) {
      const end = w.indexOf("}", i);
      const tag = w.slice(i + 1, end);
      switch (tag) {
        case "OH": tokens.push("OH"); break;
        case "OO": tokens.push("OO"); break;
        case "EU": tokens.push("EU"); break;
        case "WA": tokens.push("WA"); break;
        case "AN_NAS": tokens.push("AH~"); break;
        case "ON_NAS": tokens.push("OH~"); break;
        case "IN_NAS": tokens.push("EH~"); break;
        case "UN_NAS": tokens.push("UH~"); break;
        case "Y_GLIDE": tokens.push("Y"); break;
        case "SH": tokens.push("SH"); break;
        case "NY": tokens.push("NY"); break;
        case "ZH": tokens.push("ZH"); break;
        case "S": tokens.push("S"); break;
        case "K": tokens.push("K"); break;
        case "AY": tokens.push("AY"); break;
        case "EH": tokens.push("EH"); break;
        case "AH": tokens.push("AH"); break;
        case "EE": tokens.push("EE"); break;
        default: tokens.push(tag as Token);
      }
      i = end; continue;
    }

    if (ch === "u") { tokens.push("Ü"); continue; }
    if (ch === "a") { tokens.push("AH"); continue; }
    if (ch === "y") { const nextIsVowel = isVowel(next || ""); tokens.push(nextIsVowel ? "Y" : "EE"); continue; }
    if (ch === "i") { tokens.push("EE"); continue; }
    if (ch === "o") { tokens.push("OH"); continue; }
    if (ch === "e") { tokens.push("UH"); continue; }

    if (ch === "s") {
      const betweenVowels = isVowel(prev || "") && isVowel(next || "");
      tokens.push(betweenVowels ? "Z" : "S"); continue;
    }

    const table: Record<string, Token> = { b:"B", c:"K", d:"D", f:"F", g:"G", k:"K", l:"L", m:"M", n:"N", p:"P", q:"K", r:"R", t:"T", v:"V", w:"W", x:"X", z:"Z" };
    if (table[ch]) { tokens.push(table[ch]); continue; }

    tokens.push(ch.toUpperCase() as Token);
  }

  if (tokens.length > 1 && tokens[tokens.length - 1] === "UH" && wordRaw.endsWith('e')) {
      tokens.pop();
  }
  return tokens;
};

export const joinTokensEnWith = (tokens: Token[], sep: string) => tokens.map(toEN).join(sep).trim();

export const joinTokens = (tokens: Token[], renderer: (t: Token) => string) =>
  tokens.map(renderer).join("").replace(/\s+/g, " ").trim();
