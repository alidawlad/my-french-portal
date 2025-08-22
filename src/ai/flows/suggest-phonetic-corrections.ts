// src/ai/flows/suggest-phonetic-corrections.ts
'use server';
/**
 * @fileOverview Suggests phonetic corrections for unusual words in a given text.
 *
 * - suggestPhoneticCorrections - A function that accepts text and returns suggested corrections for phonetic exceptions.
 * - SuggestPhoneticCorrectionsInput - The input type for the suggestPhoneticCorrections function.
 * - SuggestPhoneticCorrectionsOutput - The return type for the suggestPhoneticCorrections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPhoneticCorrectionsInputSchema = z.object({
  text: z.string().describe('The input text in French to check for phonetic exceptions.'),
});
export type SuggestPhoneticCorrectionsInput = z.infer<typeof SuggestPhoneticCorrectionsInputSchema>;

const SuggestPhoneticCorrectionsOutputSchema = z.object({
  corrections: z.array(
    z.object({
      word: z.string().describe('The word identified as a phonetic exception.'),
      suggestions: z.array(z.string()).describe('Suggested alternative words.'),
      reason: z.string().describe('Why this word was flagged as a phonetic exception.')
    })
  ).describe('A list of suggested corrections for phonetic exceptions.'),
});
export type SuggestPhoneticCorrectionsOutput = z.infer<typeof SuggestPhoneticCorrectionsOutputSchema>;

export async function suggestPhoneticCorrections(input: SuggestPhoneticCorrectionsInput): Promise<SuggestPhoneticCorrectionsOutput> {
  return suggestPhoneticCorrectionsFlow(input);
}

const suggestPhoneticCorrectionsPrompt = ai.definePrompt({
  name: 'suggestPhoneticCorrectionsPrompt',
  input: {schema: SuggestPhoneticCorrectionsInputSchema},
  output: {schema: SuggestPhoneticCorrectionsOutputSchema},
  prompt: `You are a phonetic expert specializing in French pronunciation.

  Given the following French text, identify any words that are phonetic exceptions (words whose pronunciation does not follow standard French phonetic rules).
  For each phonetic exception found, provide a list of up to three alternative words that are phonetically more regular or common.
  Explain why the original word is considered a phonetic exception.

  Text: {{{text}}}
  `,
});

const suggestPhoneticCorrectionsFlow = ai.defineFlow(
  {
    name: 'suggestPhoneticCorrectionsFlow',
    inputSchema: SuggestPhoneticCorrectionsInputSchema,
    outputSchema: SuggestPhoneticCorrectionsOutputSchema,
  },
  async input => {
    const {output} = await suggestPhoneticCorrectionsPrompt(input);
    if (!output) {
      throw new Error("Received no output from the AI model for phonetic corrections.");
    }
    return output;
  }
);
