
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
  englishDefinition: z.string().describe("A concise definition of the word in English, without quotes."),
});
export type DictionaryOutput = z.infer<typeof DictionaryOutputSchema>;

export async function getDictionaryEntry(input: DictionaryInput): Promise<DictionaryOutput> {
  return dictionaryFlow(input);
}

const dictionaryPrompt = ai.definePrompt({
  name: 'dictionaryPrompt',
  input: {schema: DictionaryInputSchema},
  prompt: `You are a helpful bilingual dictionary.
  
  For the given French word or phrase, provide a concise one-sentence definition in both French and English.
  
  For the English definition, provide only the direct translation or meaning. Do not wrap it in quotation marks.
  For example, if the word is "bonjour", the English definition should be "Hello", not ""Hello"".

  Format your response as:
  FR: [French definition]
  EN: [English definition]

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
    const {text} = await ai.generate({
        prompt: await dictionaryPrompt.render({input}),
    });
    
    const frenchMatch = text.match(/FR: (.*)/);
    const englishMatch = text.match(/EN: (.*)/);

    const frenchDefinition = frenchMatch ? frenchMatch[1].trim() : "Could not determine French definition.";
    const englishDefinition = englishMatch ? englishMatch[1].trim() : "Could not determine English definition.";

    return {
        frenchDefinition,
        englishDefinition,
    };
  }
);
