

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
  { ch: "R", nameIPA: "[ɛʁ]", ali: "kh(r)", note: "Uvular; like a throaty 'kh' sound." },
  { ch: "S", nameIPA: "[ɛs]", ali: "ehs", alt: "ès" },
  { ch_of_these: "T", nameIPA: "[te]", ali: "teh", alt: "té", note: "Avoid 'tee'." },
  { ch: "U", nameIPA: "[y]", ali: "ü", alt: "uu", note: "Front-rounded vowel. To make it, say 'ee' but with your lips rounded as if for 'oo'." },
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
    replacement: string;
    category: RuleCategory;
    explanation: string;
};

// This list is now the single source of truth for transformations.
// The order is important: longer, more specific matches should come first.
export const RULES: Rule[] = [
  { key: 'cEst', label: "c'est → S-EH", re: /c['’]\s*est\b/i, replacement: "S EH", category: 'special', explanation: "The common phrase 'c\'est' is pronounced as one unit: /sɛ/." },
  { key: 'qu', label: 'qu → K', re: /qu/gi, replacement: 'K', category: 'special', explanation: "The 'qu' digraph is almost always pronounced as /k/." },
  { key: 'eau', label: 'eau → OH', re: /eau/gi, replacement: 'OH', category: 'vowel', explanation: "The trigraph 'eau' is a 'vowel team' that produces the /o/ sound, as in 'boat'." },
  { key: 'au', label: 'au → OH', re: /au/gi, replacement: 'OH', category: 'vowel', explanation: "Like 'eau', the 'au' digraph is pronounced /o/." },
  { key: 'oi', label: 'oi → WA', re: /oi/gi, replacement: 'WA', category: 'vowel', explanation: "The 'oi' digraph is consistently pronounced 'wa' in French." },
  { key: 'ou', label: 'ou → OO', re: /ou/gi, replacement: 'OO', category: 'vowel', explanation: "The 'ou' vowel team makes the /u/ sound, as in 'soup'." },
  { key: 'ch', label: 'ch → SH', re: /ch/gi, replacement: 'SH', category: 'special', explanation: "The 'ch' digraph in French is usually soft, pronounced /ʃ/ like 'sh' in 'shoe'." },
  { key: 'ph', label: 'ph → F', re: /ph/gi, replacement: 'F', category: 'special', explanation: "Like in English, 'ph' is pronounced as /f/." },
  { key: 'ill', label: '-ill → Y', re: /(?<!\b[vVmM])i(ll\b)/gi, replacement: 'EE Y', category: 'special', explanation: "After a vowel, '-ill' often creates a 'y' sound (/j/), as in 'fille'. Exceptions exist (e.g., 'ville', 'mille')." },
  { key: 'nasON', label: "on/om → OH(n)", re: /(on|om)(?![\wàâäéèêëîïôöùûüœ])/gi, replacement: 'OH~', category: 'nasal', explanation: "Nasal vowel. The sound is made in the back of the mouth with air passing through the nose. Think of the 'on' in 'bon'." },
  { key: 'nasAN', label: "an/am/en/em → AH(n)", re: /(an|am|en|em)(?![\wàâäéèêëîïôöùûüœ])/gi, replacement: 'AH~', category: 'nasal', explanation: "A common nasal vowel, like in 'vent' or 'temps'. The 'en' in 'examen' is an exception." },
  { key: 'nasIN', label: "in/im/ain/ein/yn/ym → EH(n)", re: /(in|im|ain|ein|yn|ym)(?![\wàâäéèêëîïôöùûüœ])/gi, replacement: 'EH~', category: 'nasal', explanation: "A bright nasal sound, as in 'vin' or 'pain'." },
  { key: 'nasUN', label: "un/um → UH(n)", re: /(un|um)(?![\wàâäéèêëîïôöùûüœ])/gi, replacement: 'UH~', category: 'nasal', explanation: "The nasal sound in 'un' or 'parfum'. Made by saying 'uh' with air passing through the nose." },
  { key: 'sBetweenVowels', label: 's between vowels → Z', re: /([aeiouyàâäéèêëîïôöùûüœ])s(?=[aeiouyàâäéèêëîïôöùûüœ])/gi, replacement: '$1Z', category: 'special', explanation: "A single 's' between two vowel sounds is typically voiced, like /z/." },
  { key: 'cSoft', label: 'c → S', re: /c(?=[eéiïy])/gi, replacement: 'S', category: 'special', explanation: "Soft C rule: When 'c' comes before an E, I, or Y, it is pronounced /s/." },
  { key: 'gSoft', label: 'g → ZH', re: /g(?=[eéiïy])/gi, replacement: 'ZH', category: 'special', explanation: "Soft G rule: When 'g' comes before an E, I, or Y, it is pronounced /ʒ/ (as in 'vision')." },
  { key: 'j', label: 'j → ZH', re: /j/gi, replacement: 'ZH', category: 'special', explanation: "The letter 'j' in French is consistently pronounced /ʒ/." },
  { key: 'hSilent', label: 'h → (H)', re: /h/gi, replacement: '(H)', category: 'silent', explanation: "Rule: The letter H is always silent in French, though it can sometimes block liaisons (h aspiré)." },
  { key: 'cedilla', label: 'ç → S', re: /ç/gi, replacement: 'S', category: 'special', explanation: "The cedilla (¸) guarantees a soft 'c' sound (/s/) before A, O, or U." },
  { key: 'finalC', label: 'Final C', re: /c$/i, replacement: 'K', category: 'special', explanation: "Final 'c' is usually pronounced, unlike many other final consonants." },
  { key: 'accentA', label: 'à/â → AH', re: /[àâ]/gi, replacement: 'AH', category: 'vowel', explanation: "Accents on 'a' don't change the sound but can change the meaning of the word." },
  { key: 'accentE', label: 'é → AY', re: /é/gi, replacement: 'AY', category: 'vowel', explanation: "The 'é' (accent aigu) produces an /e/ sound, similar to 'ay' in 'hay'." },
  { key: 'accentE2', label: 'è/ê/ë → EH', re: /[èêë]/gi, replacement: 'EH', category: 'vowel', explanation: "These accents on 'e' typically produce an /ɛ/ sound, like 'eh' in 'bet'." },
  { key: 'accentI', label: 'î/ï → EE', re: /[îï]/gi, replacement: 'EE', category: 'vowel', explanation: "Accents on 'i' don't usually change the sound but can indicate a historical spelling or separate vowel sounds." },
  { key: 'accentO', label: 'ô → OH', re: /[ô]/gi, replacement: 'OH', category: 'vowel', explanation: "The circumflex on 'o' often indicates a long /o/ sound and a historical, dropped 's'." },
  { key: 'accentU', label: 'û/ù → Ü', re: /[ûù]/gi, replacement: 'Ü', category: 'vowel', explanation: "Accents on 'u' don't change the sound (/y/) but distinguish words (e.g., 'ou' vs 'où')." },
  { key: 'xToS', label: 'final x → S', re: /x$/i, replacement: 'S', category: 'special', explanation: "In numbers like 'six' and 'dix', the final 'x' is pronounced as /s/ when at the end of a phrase." },
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

const PRONOUNCED_FINALS = ['c', 'r', 'f', 'l']; // "CaReFuL" mnemonic
const FINAL_CONSONANT_EXCEPTIONS = new Set(['bus', 'fils', 'ours', 'plus', 'tous', 'sens', 'anaïs', 'reims', 'six', 'dix', 'cinq', 'sept', 'huit']);
const NUMBER_EXCEPTIONS: Record<string, TokenTrace[]> = {
    'un':     [{ src: 'un', out: 'UH~', changed: true, ruleKey: 'nasUN', note: 'un → nasal /œ̃/'}],
    'deux':   [{ src: 'd', out: 'D'}, { src: 'eux', out: 'EU', changed: true, ruleKey: 'eu', note: 'eu → ö' }, {src: 'x', out: '(X)', changed: true, ruleKey: 'finalDrop', note: 'Rule: Final consonants are usually silent. Mnemoic: CaReFuL (C,R,F,L are often pronounced).'}],
    'trois':  [{ src: 't', out: 'T'}, { src: 'r', out: 'R'}, { src: 'oi', out: 'WA', changed: true, ruleKey: 'oi', note: 'oi → wa'}, {src: 's', out: '(S)', changed: true, ruleKey: 'finalDrop', note: 'Rule: Final consonants are usually silent.'}],
    'quatre': [{ src: 'qu', out: 'K', changed: true, ruleKey: 'quK', note: 'qu → k'}, { src: 'a', out: 'AH'}, { src: 't', out: 'T'}, { src: 'r', out: 'R'}, {src: 'e', out: '(E)', changed: true, ruleKey: 'finalDrop', note: 'Rule: A final \'e\' (schwa) is typically silent.'}],
    'cinq':   [{ src: 'c', out: 'S', changed: true, ruleKey: 'softC', note: 'c before i → s'}, { src: 'in', out: 'EH~', changed: true, ruleKey: 'nasIN', note: 'in → eh(n)'}, { src: 'q', out: 'K'}],
    'six':    [{ src: 's', out: 'S'}, { src: 'i', out: 'EE'}, { src: 'x', out: 'S', changed: true, ruleKey: 'finalX', note: 'final x → s'}],
    'sept':   [{ src: 's', out: 'S'}, { src: 'e', out: 'EH'}, { src: 'p', out: '(P)', changed: true, ruleKey: 'septPdrop', note: 'Historical spelling: The \'p\' in "sept" is silent.'}, { src: 't', out: 'T'}],
    'huit':   [{ src: 'h', out: '(H)', changed: true, ruleKey: 'hSilent', note: 'Rule: The letter H is always silent in French.'}, { src: 'ui', out: 'ÜEE', changed: true, ruleKey: 'uiGlide', note: 'ui → ü+ee'}, {src: 't', out: 'T'}],
    'neuf':   [{ src: 'n', out: 'N'}, { src: 'eu', out: 'EU', changed: true, ruleKey: 'eu', note: 'eu → ö'}, { src: 'f', out: 'F'}],
    'dix':    [{ src: 'd', out: 'D'}, { src: 'i', out: 'EE'}, { src: 'x', out: 'S', changed: true, ruleKey: 'finalX', note: 'final x → s'}],
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
    case "R": return "kh(r)";
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
  let segments: { src: string, transformed: boolean }[] = [{ src: lw, transformed: false }];

  // 1. Systematically apply all defined rules
  RULES.forEach(rule => {
    let newSegments: { src: string, transformed: boolean }[] = [];
    segments.forEach(segment => {
      if (segment.transformed) {
        newSegments.push(segment);
        return;
      }
      
      const parts = segment.src.split(rule.re);
      if (parts.length > 1) {
          segment.src.match(new RegExp(rule.re.source, rule.re.flags))?.forEach((match, i) => {
              const [firstPart, ...rest] = parts[i].split(match);
              if (firstPart) newSegments.push({ src: firstPart, transformed: false });

              const replacement = rule.replacement;
              traces.push({
                  src: match,
                  out: replacement as Token,
                  changed: true,
                  ruleKey: rule.key,
                  note: rule.explanation,
              });
              newSegments.push({ src: replacement, transformed: true });
              if (rest.join(match)) newSegments.push({ src: rest.join(match), transformed: false });
          });
           if (parts[parts.length-1]) newSegments.push({ src: parts[parts.length-1], transformed: false});
      } else {
        newSegments.push(segment);
      }
    });

    segments = newSegments.filter(s => s.src);
  });
  
  // 2. Process remaining untransformed parts character-by-character
  let finalTraces: TokenTrace[] = [];
  segments.forEach(segment => {
      if (segment.transformed) {
          const trace = traces.find(t => t.out === segment.src);
          if (trace) finalTraces.push(trace);
      } else {
          // Fallback for characters not covered by rules
          for(const char of segment.src) {
              let outToken: Token = char.toUpperCase();
              if (char === "'") continue; // Skip apostrophes
              switch(char) {
                  case 'a': outToken = 'AH'; break;
                  case 'b': outToken = 'B'; break;
                  case 'c': outToken = 'K'; break; // Default hard C
                  case 'd': outToken = 'D'; break;
                  case 'e': outToken = 'EH'; break;
                  case 'f': outToken = 'F'; break;
                  case 'g': outToken = 'G'; break; // Default hard G
                  case 'i': outToken = 'EE'; break;
                  case 'k': outToken = 'K'; break;
                  case 'l': outToken = 'L'; break;
                  case 'm': outToken = 'M'; break;
                  case 'n': outToken = 'N'; break;
                  case 'o': outToken = 'OH'; break;
                  case 'p': outToken = 'P'; break;
                  case 'r': outToken = 'R'; break;
                  case 's': outToken = 'S'; break;
                  case 't': outToken = 'T'; break;
                  case 'u': outToken = 'Ü'; break;
                  case 'v': outToken = 'V'; break;
                  case 'w': outToken = 'W'; break;
                  case 'x': outToken = 'X'; break;
                  case 'y': outToken = 'EE'; break; // Default 'y' as vowel
                  case 'z': outToken = 'Z'; break;
              }
               finalTraces.push({
                  src: char,
                  out: outToken,
                  changed: toEN(outToken) !== char.toLowerCase(),
                  ruleKey: 'charMap'
              });
          }
      }
  });


  // 3. Post-processing for context-sensitive rules (e.g., final consonants)
  let lastAlphaIndex = -1;
  for (let j = finalTraces.length - 1; j >= 0; j--) {
      if (finalTraces[j].out.match(/^[A-Z]$/i) && !finalTraces[j].out.startsWith('(')) {
          lastAlphaIndex = j;
          break;
      }
  }

  if (lastAlphaIndex !== -1) {
    const lastTrace = finalTraces[lastAlphaIndex];
    const lastSrcChar = lastTrace.src.toLowerCase();

    if (!FINAL_CONSONANT_EXCEPTIONS.has(w.toLowerCase()) &&
        !PRONOUNCED_FINALS.includes(lastSrcChar) &&
        /^[BDGPSTXZ]$/.test(lastTrace.out)) {
      lastTrace.out = `(${lastTrace.out.toUpperCase()})`;
      lastTrace.ruleKey = 'finalDrop';
      lastTrace.changed = true;
      lastTrace.note = `Rule: Final consonants are usually silent. Mnemonic: Only 'CaReFuL' consonants are typically pronounced.`;
    }
  }
  
  if (finalTraces.length > 1 && finalTraces[finalTraces.length - 1].src === 'e' && !finalTraces[finalTraces.length-1].changed) {
      const lastTrace = finalTraces[finalTraces.length - 1];
      lastTrace.out = '(E)';
      lastTrace.ruleKey = 'finalSchwaDrop';
      lastTrace.changed = true;
      lastTrace.note = 'Rule: A final \'e\' (schwa) is typically silent unless the word is only one syllable.';
  }

  return finalTraces;
};

export const joinTokens = (tokens: Token[], renderer: (t: Token) => string) =>
  tokens.map(renderer).join("").replace(/\s+/g, " ").trim();
