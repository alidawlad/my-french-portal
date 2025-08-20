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
  // This function now orchestrates the two-step process:
  // 1. Get raw text from the AI.
  // 2. Parse the raw text into a structured format.
  const rawText = await dictionaryFlow(input);
  return await dictionaryParsingFlow(rawText);
}

// 1. A simple flow to get the raw definition text from the AI.
const dictionaryPrompt = ai.definePrompt({
  name: 'dictionaryPrompt',
  input: {schema: DictionaryInputSchema},
  prompt: `You are a helpful bilingual dictionary.
  
  For the given French word or phrase, provide a concise one-sentence definition in both French and English.
  
  Format your response clearly with labels, for example:
  FR: [French definition]
  EN: [English definition]

  Word: "{{word}}"
  `,
});

const dictionaryFlow = ai.defineFlow(
  {
    name: 'dictionaryFlow',
    inputSchema: DictionaryInputSchema,
    outputSchema: z.string(), // This flow now outputs raw string
  },
  async (input) => {
    const {text} = await ai.generate({
        prompt: await dictionaryPrompt.render({input}),
    });
    return text;
  }
);


// 2. A new, dedicated flow to parse the raw text.
// This isolates the parsing logic and makes it more robust.
const dictionaryParsingFlow = ai.defineFlow(
  {
    name: 'dictionaryParsingFlow',
    inputSchema: z.string(),
    outputSchema: DictionaryOutputSchema,
  },
  async (rawText: string): Promise<DictionaryOutput> => {
    const frenchMatch = rawText.match(/FR: (.*)/);
    const englishMatch = rawText.match(/EN: (.*)/);

    // Provide default values if parsing fails, preventing crashes.
    const frenchDefinition = frenchMatch ? frenchMatch[1].trim() : "No French definition found.";
    const englishDefinition = englishMatch ? englishMatch[1].trim() : "No English definition found.";

    return {
        frenchDefinition,
        englishDefinition,
    };
  }
);
