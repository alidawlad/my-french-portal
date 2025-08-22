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
  summary: z.string().optional().describe("A one-sentence summary of the rule or pattern."),
  details: z.string().optional().describe("A brief, one-paragraph explanation of the grammar or phonetic rule."),
  pattern: z.string().optional().describe("A one-sentence description of the shared pattern for similar words."),
  words: z.array(z.string()).optional().describe("An array of 3-5 similar French words."),
});
export type RuleAssistantOutput = z.infer<typeof RuleAssistantOutputSchema>;


export async function ruleAssistant(input: RuleAssistantInput): Promise<RuleAssistantOutput> {
  return ruleAssistantFlow(input);
}

const explainGrammarPrompt = ai.definePrompt({
    name: 'explainGrammarPrompt',
    input: {schema: RuleAssistantInputSchema},
    output: {schema: RuleAssistantOutputSchema},
    prompt: `You are a friendly and concise French grammar tutor. The user has a question about the grammar of a specific word or phrase.

    User's full text: "{{text}}"
    User's query: "{{query}}"

    Analyze the grammatical rule for "{{query}}" in context.
    
    Respond with a JSON object with two keys: "summary" and "details".
    
    - "summary": A one-sentence summary of the rule.
    - "details": A brief, one-paragraph explanation.
    
    Example: { "summary": "It's a plural adjective agreeing with the noun.", "details": "The word 'bleus' agrees in number (plural) and gender (masculine) with the noun 'yeux'." }
    `,
});

const explainPhoneticsPrompt = ai.definePrompt({
    name: 'explainPhoneticsPrompt',
    input: {schema: RuleAssistantInputSchema},
    output: {schema: RuleAssistantOutputSchema},
    prompt: `You are a friendly and concise French phonetics tutor. The user has a question about the pronunciation of a specific word or phrase.

    User's full text: "{{text}}"
    User's query: "{{query}}"

    Analyze the key phonetic rule for "{{query}}".
    
    Respond with a JSON object with two keys: "summary" and "details".

    - "summary": A one-sentence summary of the phonetic event.
    - "details": A brief explanation, using Ali Respell style for examples (e.g., 'oi' is 'wa').
    
    Example: { "summary": "The 's' is silent at the end of 'Thomas'.", "details": "In French, final consonants like 's' are often silent. So, 'Thomas' is pronounced 'to-ma'." }
    `,
});

const findSimilarPrompt = ai.definePrompt({
    name: 'findSimilarPrompt',
    input: {schema: RuleAssistantInputSchema},
    output: {schema: RuleAssistantOutputSchema},
    prompt: `You are a helpful French vocabulary assistant. The user wants to see words that are phonetically or grammatically similar to a specific word or phrase.

    User's query: "{{query}}"

    Find 3-5 other French words that follow the same key pattern as "{{query}}".
    
    Respond with a JSON object with two keys: "pattern" and "words".

    - "pattern": A one-sentence description of the shared pattern.
    - "words": An array of the similar words.
    
    Example: { "pattern": "Words with a silent final 's'.", "words": ["Paris", "français", "trois", "temps"] }
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
    if (!output) {
      throw new Error("Received no output from the AI model.");
    }
    return output;
  }
);
