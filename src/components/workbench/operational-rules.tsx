import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function OperationalRules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Operational Rules</CardTitle>
        <CardDescription>Minimal, high-yield heuristics</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc ml-5 space-y-2 text-sm text-foreground/90">
            <li><b>C</b> before <i>e/i/y</i> → S; otherwise K. <b>G</b> before <i>e/i/y</i> → ZH; otherwise G.</li>
            <li><b>OU</b>→OO, <b>OI</b>→WA, <b>AU/EAU</b>→OH, <b>EU/ŒU</b>→ EU (ö-like).</li>
            <li>Nasals: <b>AN/EN</b>→AH˜, <b>ON</b>→OH˜, <b>IN/AIN/EIN</b>→EH˜, <b>UN</b>→UH˜.</li>
            <li><b>H</b> is silent; some words block liaison (h aspiré) but the letter itself never sounds.</li>
            <li><b>S</b> between vowels → Z. <b>ILL</b> after a vowel → Y (e.g., <i>fille</i> → fiy).</li>
            <li>Drop a final silent <b>-e</b> (schwa). Other finals vary; treat them case-by-case as you learn items.</li>
            <li><b>R</b> is uvular. Keep it as <b>ghr</b> to avoid English /ɹ/ drift.</li>
            <li>Length marks (double letters) are cues only; French contrasts quality, not length.</li>
          </ul>
      </CardContent>
    </Card>
  );
}
