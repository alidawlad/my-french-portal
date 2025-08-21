export type Token = string;
export type SepKind = 'hyphen' | 'middot' | 'space' | 'none';
export type RuleCategory = 'vowel' | 'nasal' | 'special' | 'liaison' | 'silent';

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

export type Rule = {
    key: string;
    label: string;
    re: RegExp;
    category: RuleCategory;
};

export const RULES: Rule[] = [
  { key: 'softC',  label: "c before e/i/y → S (soft c)",          re: /c(?=[eéiïy])/i, category: 'special' },
  { key: 'softG',  label: "g before e/i/y → ZH (soft g)",          re: /g(?=[eéiïy])/i, category: 'special' },
  { key: 'ou',     label: "ou → OO",                               re: /ou/i, category: 'vowel' },
  { key: 'oi',     label: "oi → WA",                               re: /oi/i, category: 'vowel' },
  { key: 'au',     label: "au/eau → OH",                           re: /(au|eau)/i, category: 'vowel' },
  { key: 'eu',     label: "eu/œu → EU (ö‑like)",                   re: /(eu|œu)/i, category: 'vowel' },
  { key: 'nasAL',  label: "an/en/am/em → nasal (AH˜)",             re: /(an|am|en|em)(?=$|[^a-zàâäéèêëîïôöùûüœ]|[bcdfghjklmnpqrstvwxz])/i, category: 'nasal' },
  { key: 'nasON',  label: "on/om → nasal (OH˜)",                   re: /(on|om)(?=$|[^a-zàâäéèêëîïôöùûüœ]|[bcdfghjklmnpqrstvwxz])/i, category: 'nasal' },
  { key: 'nasIN',  label: "in/im/ain/ein/yn/ym → nasal (EH˜)",     re: /(in|im|ain|ein|yn|ym)(?=$|[^a-zàâäéèêëîïôöùûüœ]|[bcdfghjklmnpqrstvwxz])/i, category: 'nasal' },
  { key: 'nasUN',  label: "un/um → nasal (UH˜)",                   re: /(un|um)(?=$|[^a-zàâäéèêëîïôöùûüœ]|[bcdfghjklmnpqrstvwxz])/i, category: 'nasal' },
  { key: 'sBetween',label: "s between vowels → Z",                 re: /[aeiouyàâäéèêëîïôöùûüœ]s(?=[aeiouyàâäéèêëîïôöùûüœ])/i, category: 'special' },
  { key: 'ill',    label: "vowel + ill → Y (fille)",               re: /[aeiouy]ill/i, category: 'special' },
  { key: 'finalE', label: "final -e often silent (schwa)",         re: /e$/i, category: 'silent' },
  { key: "hSilent",label: "h is silent (may block liaison)",       re: /^h/i, category: 'liaison' },
  { key: 'yGlide', label: "y before vowel → glide /j/",            re: /y(?=[aeiouyàâäéèêëîïôöùûüœ])/i, category: 'special' },
  { key: 'jToZh',  label: "j → ZH",                                re: /j/i, category: 'special' },
  { key: 'quToK',  label: "qu → K",                                re: /qu/i, category: 'special' },
  { key: 'cedilla',label: "ç → S",                                 re: /ç/i, category: 'special' },
  { key: 'finalC', label: "Final consonant usually silent",        re: /[b|d|g|p|s|t|x|z]$/i, category: 'silent'},
];

export const getRuleForWord = (word: string): Rule | undefined => {
    const lw = word.toLowerCase();
    // Sort rules to prioritize longer matches if regexes could overlap
    const sortedRules = [...RULES].sort((a,b) => {
        const aMatch = lw.match(a.re);
        const bMatch = lw.match(b.re);
        if (aMatch && bMatch) return bMatch[0].length - aMatch[0].length;
        if (aMatch) return -1;
        if (bMatch) return 1;
        return 0;
    });
    return sortedRules.find(r => r.re.test(lw));
}

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
    "amis",
    "froid",
];


export const SEP_MAP: Record<SepKind, string> = { hyphen: "\u2011", middot: "·", space: " ", none: "" };

// Based on the "CaReFuL" rule. Final C, R, F, L are often pronounced.
const PRONOUNCED_FINALS = ['c', 'r', 'f', 'l', 'q'];
// Exceptions to the silent final consonant rule.
const FINAL_CONSONANT_EXCEPTIONS = new Set(['bus', 'fils', 'ours', 'plus', 'tous', 'sens', 'sud', 'anaïs', 'reims']);

const COMMON_FIXES: Record<string, string> = {
    "cava": "ça va",
    "ca va": "sa va",
    "ça va": "sa va",
    "bein": "bien",
    "vaudrais": "voudrais",
};


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
    case "W": return "w";
    case "SH": return "sh";
    case "ZH": return "zh";
    case "NY": return "ny";
    case "Y": return "y";
    case "R": return "ghr";
    case "AH~": return "ah(n)";
    case "OH~": return "oh(n)";
    case "EH~": return "eh(n)";
    case "UH~": return "un";
    default: return t.toLowerCase();
  }
};

const isVowel = (c: string) => /[aeiouyàâäéèêëîïôöùûüœ]/i.test(c);

export const transformWord = (wordRaw: string): Token[] => {
  let w = wordRaw.normalize("NFC").replace(/[\.,!\?]$/, '');
  if (!/[\p{L}]/u.test(w)) return [w as Token];
  
  let lw = w.toLowerCase();

  // L0: Pre-processing & Normalization
  if (COMMON_FIXES[lw]) {
      lw = COMMON_FIXES[lw];
  }
  
  // A) Rule Patches (ordered)
  // A.1. Elisions & function words
  lw = lw.replace(/\bc['’]\s*est\b/gi, "{C_EST}");
  lw = lw.replace(/\bs['’]\s*il\b/gi, "{SIL}");

  // A.2. soften c even across apostrophes
  lw = lw.replace(/c(?=(?:['’]\s*)?[eéiïy])/g, "{S}");
  
  // A.3. Nasal environment guard
  const nasalRegex = /(in|im|yn|ym|ain|ein|an|am|en|em|on|om|un|um)(?=$|[^a-zàâäéèêëîïôöùûüœ]|[bcdfghjklmnpqrstvwxz])/ig;
  lw = lw.replace(nasalRegex, (match) => {
    const m = match.toLowerCase();
    if (m.startsWith('o')) return '{ON_NAS}';
    if (m.startsWith('u')) return '{UN_NAS}';
    if (['en', 'an', 'am', 'em'].includes(m)) return '{AN_NAS}';
    return '{IN_NAS}';
  });
  lw = lw.replace(/ien(?=$|[^a-zàâäéèêëîïôöùûüœ])/gi, "{Y_GLIDE}{IN_NAS}");


  // A.4. Digraphs & Trigraphs Pass
  lw = lw.replace(/ç/g, "{S}");
  lw = lw.replace(/œu/g, "{EU}");
  lw = lw.replace(/eau/g, "{OH}");
  lw = lw.replace(/au/g, "{OH}");
  lw = lw.replace(/oi/g, "{WA}");

  // A.5. w-glide for "oui"
  lw = lw.replace(/ou(?=[iy])/g, "{W}"); 
  lw = lw.replace(/ou/g, "{OO}");
  
  // A.6 Accented /ɛ/ in plaît (targeted)
  lw = lw.replace(/aî/gi, "{EH}");
  
  // A.7. Verb endings
  lw = lw.replace(/(?<!['’])(?:ai|ais|ait|aient)(?=$|[^a-zàâäéèêëîïôöùûüœ])/gi, "{EH}");
  lw = lw.replace(/ez(?=$|[^a-zàâäéèêëîïôöùûüœ])/gi, "{EH}");


  // A.8. Consonant clusters & special consonants
  lw = lw.replace(/ch/g, "sh"); // Direct replacement instead of token
  lw = lw.replace(/gn/g, "{NY}");
  lw = lw.replace(/j/g, "{ZH}");
  lw = lw.replace(/g(?=[eéiïy])/g, "{ZH}");
  lw = lw.replace(/qu/g, "{K}");
  lw = lw.replace(/^h/g, ""); // Only initial 'h' is silent for liaison purposes.
  lw = lw.replace(/th/g, "{T}");

  // A.9. Accented vowels
  lw = lw.replace(/[é]/g, "{AY}");
  lw = lw.replace(/[èêë]/g, "{EH}");
  lw = lw.replace(/[àâä]/g, "{AH}");
  lw = lw.replace(/[îï]/g, "{EE}");
  lw = lw.replace(/[ôö]/g, "{OH}");
  lw = lw.replace(/[ùûü]/g, "{Ü}");
  
  // A.10. Schwa hygiene
  lw = lw.replace(/e(?=r[bcdfghjklmnpqrstvwxyz])/g, "{EH}");
  lw = lw.replace(/e(?=([bcdfghjklmnpqrstvwxyz])\1)/g, "{EH}");


  const tokens: Token[] = [];
  for (let i = 0; i < lw.length; i++) {
    const ch = lw[i];
    const prev = lw[i - 1];
    const next = lw[i + 1];

    if (lw.startsWith("{", i)) {
      const end = lw.indexOf("}", i);
      const tag = lw.slice(i + 1, end);
      switch (tag) {
        case "OH": tokens.push("OH"); break;
        case "OO": tokens.push("OO"); break;
        case "EU": tokens.push("EU"); break;
        case "WA": tokens.push("WA"); break;
        case "W": tokens.push("W"); break;
        case "AN_NAS": tokens.push("AH~"); break;
        case "ON_NAS": tokens.push("OH~"); break;
        case "IN_NAS": tokens.push("EH~"); break;
        case "UN_NAS": tokens.push("UH~"); break;
        case "Y_GLIDE": tokens.push("Y"); break;
        case "NY": tokens.push("NY"); break;
        case "ZH": tokens.push("ZH"); break;
        case "S": tokens.push("S"); break;
        case "K": tokens.push("K"); break;
        case "AY": tokens.push("AY"); break;
        case "EH": tokens.push("EH"); break;
        case "AH": tokens.push("AH"); break;
        case "EE": tokens.push("EE"); break;
        case "T": tokens.push("T"); break;
        case "Ü": tokens.push("Ü"); break;
        case "C_EST": tokens.push("S", "EH"); break;
        case "SIL": tokens.push("S", "EE", "L"); break;
        default: tokens.push(tag as Token);
      }
      i = end; continue;
    }

    if (ch === 'h') continue; // Medial 'h' is silent

    if (ch === "u") { tokens.push("Ü"); continue; }
    if (ch === "a") { tokens.push("AH"); continue; }
    if (ch === "y") { const nextIsVowel = isVowel(next || ""); tokens.push(nextIsVowel ? "Y" : "EE"); continue; }
    if (ch === "i") { tokens.push("EE"); continue; }
    if (ch === "o") { tokens.push("OH"); continue; }
    if (ch === "e") {
      // final -es is silent, final -e is silent, otherwise 'uh'
      if (next === 's' && (lw[i+2] === undefined)) {
         i++; continue;
      }
      if (next === undefined) continue;
      tokens.push("UH"); continue;
    }


    if (ch === "s") {
      const betweenVowels = isVowel(prev || "") && isVowel(next || "");
      tokens.push(betweenVowels ? "Z" : "S"); continue;
    }

    const table: Record<string, Token> = { b:"B", c:"K", d:"D", f:"F", g:"G", k:"K", l:"L", m:"M", n:"N", p:"P", q:"K", r:"R", t:"T", v:"V", w:"W", x:"X", z:"Z" };
    if (table[ch]) { tokens.push(table[ch]); continue; }

    tokens.push(ch.toUpperCase() as Token);
  }

  // A.11 Final-consonant logic
  let idx = tokens.length - 1;
  while (idx >= 0 && !/^[A-Z~]+$/i.test(tokens[idx])) idx--;
  
  if (idx >= 0) {
    const orig = w.toLowerCase();
    const lastCharMatch = orig.match(/[a-zàâäéèêëîïôöùûüœ](?=[^a-zàâäéèêëîïôöùûüœ]*$)/i);
    const lastChar = lastCharMatch ? lastCharMatch[0].toLowerCase() : "";

    if (!FINAL_CONSONANT_EXCEPTIONS.has(orig) &&
        !PRONOUNCED_FINALS.includes(lastChar) &&
        /^[BDGPSXTZ]$/.test(tokens[idx])) {
      tokens.splice(idx, 1);
    }
  }

  return tokens;
};

export const joinTokensEnWith = (tokens: Token[], sep: string) => tokens.map(toEN).join(sep).trim();

export const joinTokens = (tokens: Token[], renderer: (t: Token) => string) =>
  tokens.map(renderer).join("").replace(/\s+/g, " ").trim();

    