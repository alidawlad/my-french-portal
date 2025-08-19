// src/ai/flows/rule-assistant-flow.ts
'use server';
/**
 * @fileOverview Provides contextual explanations or examples for French text.
 *
 * - ruleAssistant - A function that takes a user's query about a text and a query type.
 * - RuleAssistantInput - The input type for the ruleAssistant function.
 * - RuleAssistantOutput - The return type for the ruleAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RuleAssistantInputSchema = z.object({
  text: z.string().describe('The full French text the user is working with.'),
  query: z.string().describe('The specific word or phrase the user is asking about.'),
  type: z.enum(['explain_grammar', 'explain_phonetics', 'find_similar']).describe('The type of assistance requested.'),
});
export type RuleAssistantInput = z.infer<typeof RuleAssistantInputSchema>;

const RuleAssistantOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated explanation or list of similar words.'),
});
export type RuleAssistantOutput = z.infer<typeof RuleAssistantOutputSchema>;

export async function ruleAssistant(input: RuleAssistantInput): Promise<RuleAssistantOutput> {
  return ruleAssistantFlow(input);
}

const explainGrammarPrompt = ai.definePrompt({
    name: 'explainGrammarPrompt',
    input: {schema: RuleAssistantInputSchema},
    output: {schema: RuleAssistantOutputSchema},
    prompt: `You are a friendly and concise French grammar tutor. The user has a question about the grammar of a specific word or phrase within a larger text.

    User's full text: "{{text}}"
    User's query: "{{query}}"

    Explain the grammatical rule or concept related to "{{query}}" in the context of the full text. Be clear, simple, and encouraging. If the query is a single word, explain its role (e.g., verb, noun, adjective, its agreement). If it's a phrase, explain the structure.

    Your response should be formatted as a short paragraph.
    `,
});

const explainPhoneticsPrompt = ai.definePrompt({
    name: 'explainPhoneticsPrompt',
    input: {schema: RuleAssistantInputSchema},
    output: {schema: RuleAssistantOutputSchema},
    prompt: `You are a friendly and concise French phonetics tutor. The user has a question about the pronunciation of a specific word or phrase.

    User's full text: "{{text}}"
    User's query: "{{query}}"

    Explain the phonetic rule related to "{{query}}". For example, why a letter is silent, how a vowel combination is pronounced, or if liaison occurs. Be clear, simple, and use the "Ali Respell" style for examples where helpful (e.g., 'oi' is 'wa').

    Your response should be a short, helpful paragraph.
    `,
});

const findSimilarPrompt = ai.definePrompt({
    name: 'findSimilarPrompt',
    input: {schema: RuleAssistantInputSchema},
    output: {schema: RuleAssistantOutputSchema},
    prompt: `You are a helpful French vocabulary assistant. The user wants to see words that are similar to a specific word or phrase.

    User's query: "{{query}}"

    Find 3-5 other French words that follow the same grammatical or phonetic pattern as "{{query}}". For example, if the word is "maison" (ending in -aison), you could suggest "raison, saison". If the word is "mange" (a verb), you could suggest other -er verbs.

    Present the list of words clearly. You can add a one-sentence explanation of the pattern they share.
    `,
});


const ruleAssistantFlow = ai.defineFlow(
  {
    name: 'ruleAssistantFlow',
    inputSchema: RuleAssistantInputSchema,
    outputSchema: RuleAssistantOutputSchema,
  },
  async (input) => {
    let prompt;
    switch (input.type) {
        case 'explain_grammar':
            prompt = explainGrammarPrompt;
            break;
        case 'explain_phonetics':
            prompt = explainPhoneticsPrompt;
            break;
        case 'find_similar':
            prompt = findSimilarPrompt;
            break;
    }
    const {output} = await prompt(input);
    return output!;
  }
);
