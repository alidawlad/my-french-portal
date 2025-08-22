// src/ai/flows/dictionary-flow.ts
'use server';
/**
 * @fileOverview Provides definitions for a given French word.
 *
 * - getDictionaryEntry - A function that returns definitions for a word.
 * - DictionaryInput - The input type for the getDictionaryEntry function.
 * - DictionaryOutput - The return type for the getDictionaryEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DictionaryInputSchema = z.object({
  word: z.string().describe('The French word or short phrase to define.'),
});
export type DictionaryInput = z.infer<typeof DictionaryInputSchema>;

const DictionaryOutputSchema = z.object({
  frenchDefinition: z.string().describe("A concise definition of the word in French."),
  englishDefinition: z.string().describe("A concise definition of the word in English."),
});
export type DictionaryOutput = z.infer<typeof DictionaryOutputSchema>;

export async function getDictionaryEntry(input: DictionaryInput): Promise<DictionaryOutput> {
  return dictionaryFlow(input);
}

const dictionaryPrompt = ai.definePrompt({
  name: 'dictionaryPrompt',
  input: {schema: DictionaryInputSchema},
  output: {schema: DictionaryOutputSchema},
  prompt: `You are a helpful bilingual dictionary.
  
  For the given French word or phrase, provide a concise one-sentence definition in both French and English.
  
  Word: "{{word}}"
  `,
});

const dictionaryFlow = ai.defineFlow(
  {
    name: 'dictionaryFlow',
    inputSchema: DictionaryInputSchema,
    outputSchema: DictionaryOutputSchema,
  },
  async (input) => {
    const {output} = await dictionaryPrompt(input);
    if (!output) {
        throw new Error("No output from AI model for dictionary entry.");
    }
    return output;
  }
);
