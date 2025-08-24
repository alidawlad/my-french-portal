
export type Token = string;
export type SepKind = 'hyphen' | 'middot' | 'space' | 'none';
export type RuleCategory = 'vowel' | 'nasal' | 'special' | 'liaison' | 'silent';

export type TokenTrace = {
  out: Token;
  src: string;
  ruleKey?: string;
  changed?: boolean;
  note?: string;
};


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

export const SEP_MAP: Record<SepKind, string> = { hyphen: "‑", middot: "·", space: " ", none: "" };

const PRONOUNCED_FINALS = ['c', 'r', 'f', 'l'];
const FINAL_CONSONANT_EXCEPTIONS = new Set(['bus', 'fils', 'ours', 'plus', 'tous', 'sens', 'anaïs', 'reims', 'six', 'dix', 'cinq']);
const NUMBER_EXCEPTIONS: Record<string, TokenTrace[]> = {
    'un':     [{ src: 'un', out: 'UH~', changed: true, ruleKey: 'nasUN', note: 'un → nasal /œ̃/'}],
    'deux':   [{ src: 'd', out: 'D'}, { src: 'eux', out: 'EU', changed: true, ruleKey: 'eu', note: 'eu → ö' }, {src: 'x', out: '(X)', changed: true, ruleKey: 'finalDrop', note: 'Silent final consonant'}],
    'trois':  [{ src: 't', out: 'T'}, { src: 'r', out: 'R'}, { src: 'oi', out: 'WA', changed: true, ruleKey: 'oi', note: 'oi → wa'}, {src: 's', out: '(S)', changed: true, ruleKey: 'finalDrop', note: 'Silent final consonant'}],
    'quatre': [{ src: 'qu', out: 'K', changed: true, ruleKey: 'quK', note: 'qu → k'}, { src: 'a', out: 'AH'}, { src: 't', out: 'T'}, { src: 'r', out: 'R'}, {src: 'e', out: '(E)', changed: true, ruleKey: 'finalDrop', note: 'Silent final e (schwa)'}],
    'cinq':   [{ src: 'c', out: 'S', changed: true, ruleKey: 'softC', note: 'c before i → s'}, { src: 'in', out: 'EH~', changed: true, ruleKey: 'nasIN', note: 'in → eh(n)'}, { src: 'q', out: 'K'}],
    'six':    [{ src: 's', out: 'S'}, { src: 'i', out: 'EE'}, { src: 'x', out: 'S', changed: true, ruleKey: 'finalX', note: 'final x → s'}],
    'sept':   [{ src: 's', out: 'S'}, { src: 'e', out: 'EH'}, { src: 'p', out: '(P)', changed: true, ruleKey: 'septPdrop', note: 'The \'p\' in "sept" is a historical spelling and is silent.'}, { src: 't', out: 'T'}],
    'huit':   [{ src: 'h', out: '(H)', changed: true, ruleKey: 'hSilent', note: 'H is always silent in French words, though it can block liaisons.'}, { src: 'ui', out: 'ÜEE', changed: true, ruleKey: 'uiGlide', note: 'ui → ü+ee'}, {src: 't', out: 'T'}],
    'neuf':   [{ src: 'n', out: 'N'}, { src: 'eu', out: 'EU', changed: true, ruleKey: 'eu', note: 'eu → ö'}, { src: 'f', out: 'F'}],
    'dix':    [{ src: 'd', out: 'D'}, { src: 'i', out: 'EE'}, { src: 'x', out: 'S', changed: true, ruleKey: 'finalX', note: 'final x → s'}],
};


export const toArabic = (t: Token): string => {
  const pureToken = t.replace('‿', '');
  switch (pureToken) {
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
    case "ÜEE": return "وي";
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
    case "AH~": return "ان";
    case "OH~": return "ون";
    case "EH~": return "ين";
    case "UH~": return "ون"; // No direct equivalent for /œ̃/
    default: return pureToken;
  }
};

export const toEN = (t: Token): string => {
  const pureToken = t.replace(/[()‿]/g, '');
  switch (pureToken) {
    case "AH": return "ah";
    case "AY": return "ay";
    case "EH": return "eh";
    case "EE": return "ee";
    case "OH": return "oh";
    case "OO": return "oo";
    case "Ü": return "ü";
    case "EU": return "ö";
    case "WA": return "wa";
    case "ÜEE": return "üee";
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
    default: return pureToken.toLowerCase();
  }
};

const isVowel = (c: string) => /[aeiouyàâäéèêëîïôöùûüœ]/i.test(c);

export const transformWordWithTrace = (wordRaw: string): TokenTrace[] => {
  let w = wordRaw.normalize("NFC").replace(/[\.,!\?]$/, '');
  let lw = w.toLowerCase();
  if (!/[\p{L}'’]/u.test(w)) return [{ src: w, out: w as Token, changed: false }];
  
  if (NUMBER_EXCEPTIONS[lw]) {
      return NUMBER_EXCEPTIONS[lw];
  }

  const traces: TokenTrace[] = [];
  let i = 0;

  // Pre-tokenization replacement pass
  lw = lw.replace(/qu/gi, "{K:qu}");
  lw = lw.replace(/œu/gi, "{EU:œu}");
  lw = lw.replace(/eu/gi, "{EU:eu}");
  lw = lw.replace(/ou(?=[iy])/gi, "{W:ou}");
  lw = lw.replace(/ui/gi, "{ÜEE:ui}");
  
  const nasalRegex = /(in|im|yn|ym|ain|ein|an|am|en|em|on|om|un|um)(?=$|[^a-zàâäéèêëîïôöùûüœ]|[bcdfghjklmnpqrstvwxz])/ig;
  lw = lw.replace(nasalRegex, (match, p1) => {
    const m = p1.toLowerCase();
    if (['on', 'om'].includes(m)) return `{OH~:${p1}}`;
    if (['un', 'um'].includes(m)) return `{UH~:${p1}}`;
    if (['an','am','en','em'].includes(m)) return `{AH~:${p1}}`;
    return `{EH~:${p1}}`; // 'in', 'im', etc.
  });
  lw = lw.replace(/ien(?=$|[^a-zàâäéèêëîïôöùûüœ])/gi, "{Y:i}{EH~:en}");
  lw = lw.replace(/ez$/, "{AY:ez}");


  while(i < lw.length) {
    const char = lw[i];
    
    if (char === '{') {
        const end = lw.indexOf("}", i);
        const content = lw.slice(i+1, end);
        const [token, src] = content.split(':');
        traces.push({
            src: src || token,
            out: token as Token,
            changed: true,
            ruleKey: `rule:${token}`,
            note: `${src || token} → ${toEN(token as Token)}`
        });
        i = end + 1;
        continue;
    }

    if (lw.substring(i).match(/^c['’]\s*est\b/i)) {
      const match = lw.substring(i).match(/^c['’]\s*est\b/i)!;
      traces.push({ src: "c'", out: 'S', ruleKey: 'cEst', changed: true, note: "c'est -> seh" });
      traces.push({ src: 'est', out: 'EH', ruleKey: 'cEst', changed: true, note: "c'est -> seh" });
      i += match[0].length; continue;
    }

    // Digraphs & Trigraphs
    const twoChars = lw.substring(i, i+2);
    const threeChars = lw.substring(i, i+3);
    if (threeChars === 'eau') {
        traces.push({src: 'eau', out: 'OH', ruleKey: 'eau', changed: true, note: 'eau → oh'});
        i+=3; continue;
    }
    if (twoChars === 'au') {
      traces.push({src: 'au', out: 'OH', ruleKey: 'auOH', changed: true, note: 'au → oh'});
      i+=2; continue;
    }
    if (twoChars === 'oi') {
      traces.push({src: 'oi', out: 'WA', ruleKey: 'oi', changed: true, note: 'oi → wa'});
      i+=2; continue;
    }
    if (twoChars === 'ou') {
      traces.push({src: 'ou', out: 'OO', ruleKey: 'ou', changed: true, note: 'ou → oo'});
      i+=2; continue;
    }
    if (twoChars === 'ch') {
      traces.push({src: 'ch', out: 'SH', ruleKey: 'ch', changed: true, note: 'ch → sh'});
      i+=2; continue;
    }
    if (twoChars === 'gn') {
      traces.push({src: 'gn', out: 'NY', ruleKey: 'gn', changed: true, note: 'gn → ny'});
      i+=2; continue;
    }


    // Default character mapping
    let outToken: Token;
    let changed = false;
    let ruleKey = 'charMap';
    let note = '';

    switch(char) {
        case 'a': case 'à': case 'â': outToken = 'AH'; break;
        case 'b': outToken = 'B'; break;
        case 'c': {
            const nextIsSoft = i + 1 < lw.length && ['e','é','è','ê','i','î','y'].includes(lw[i+1]);
            outToken = nextIsSoft ? 'S' : 'K';
            if (nextIsSoft) { changed=true; ruleKey='softC'; note='c before e/i/y → s'; }
            break;
        }
        case 'ç': outToken = 'S'; changed=true; ruleKey='cedilla'; note='ç → s'; break;
        case 'd': outToken = 'D'; break;
        case 'e': case 'ê': case 'ë': outToken = 'EH'; break;
        case 'é': outToken = 'AY'; break;
        case 'è': outToken = 'EH'; break;
        case 'f': outToken = 'F'; break;
        case 'g': {
            const nextIsSoft = i + 1 < lw.length && ['e','é','è','ê','i','î','y'].includes(lw[i+1]);
            outToken = nextIsSoft ? 'ZH' : 'G';
            if (nextIsSoft) { changed=true; ruleKey='softG'; note='g before e/i/y → zh'; }
            break;
        }
        case 'h': outToken = '(H)'; changed=true; ruleKey='hSilent'; note='The letter H is always silent in French.'; break;
        case 'i': case 'î': case 'ï': outToken = 'EE'; break;
        case 'j': outToken = 'ZH'; changed=true; ruleKey='jZH'; note='j → zh'; break;
        case 'k': outToken = 'K'; break;
        case 'l': outToken = 'L'; break;
        case 'm': outToken = 'M'; break;
        case 'n': outToken = 'N'; break;
        case 'o': case 'ô': outToken = 'OH'; break;
        case 'p': outToken = 'P'; break;
        case 'r': outToken = 'R'; break;
        case 's': {
            const betweenVowels = i > 0 && i + 1 < lw.length && isVowel(lw[i-1]) && isVowel(lw[i+1]);
            outToken = betweenVowels ? 'Z' : 'S';
            if(betweenVowels) { changed=true; ruleKey='sBetweenVowels'; note='s between vowels → z'; }
            break;
        }
        case 't': outToken = 'T'; break;
        case 'u': case 'û': case 'ù': outToken = 'Ü'; break;
        case 'v': outToken = 'V'; break;
        case 'w': outToken = 'W'; break;
        case 'x': outToken = 'X'; break;
        case 'y': outToken = isVowel(lw[i+1] || '') ? 'Y' : 'EE'; break;
        case 'z': outToken = 'Z'; break;
        case '’': case "'": case "-": case "–": case "—": i++; continue;
        default: outToken = char.toUpperCase();
    }
    
    traces.push({
        src: char,
        out: outToken,
        changed: toEN(outToken) !== char.toLowerCase() || changed,
        ruleKey: ruleKey,
        note: note
    });
    i++;
  }
  
  // Final consonant logic
  let lastAlphaIndex = -1;
  for (let j = traces.length - 1; j >= 0; j--) {
      // Find last trace that is not punctuation and not already marked as silent
      if (traces[j].out.match(/^[A-Z]$/i) && !traces[j].out.startsWith('(')) {
          lastAlphaIndex = j;
          break;
      }
  }

  if (lastAlphaIndex !== -1) {
    const lastTrace = traces[lastAlphaIndex];
    const lastSrcChar = lastTrace.src.toLowerCase();

    if (!FINAL_CONSONANT_EXCEPTIONS.has(w.toLowerCase()) &&
        !PRONOUNCED_FINALS.includes(lastSrcChar) &&
        /^[BDGPSTXZ]$/.test(lastTrace.out)) {
      lastTrace.out = `(${lastTrace.src.toUpperCase()})`;
      lastTrace.ruleKey = 'finalDrop';
      lastTrace.changed = true;
      lastTrace.note = `Rule: Final consonants are usually silent (except for C, R, F, L - think 'CaReFuL').`;
    }
  }
  
  // Final 'e' silent
  if (traces.length > 1 && traces[traces.length - 1].src === 'e') {
      const lastTrace = traces[traces.length - 1];
      if (lastTrace.ruleKey !== 'finalDrop') { // Avoid double marking
        lastTrace.out = '(E)';
        lastTrace.ruleKey = 'finalDrop';
        lastTrace.changed = true;
        lastTrace.note = 'Rule: A final \'e\' (schwa) is typically silent unless the word is only one syllable.';
      }
  }

  return traces;
};

export const joinTokens = (tokens: Token[], renderer: (t: Token) => string) =>
  tokens.map(renderer).join("").replace(/\s+/g, " ").trim();

    

