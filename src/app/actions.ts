'use server';

import { suggestPhoneticCorrections, type SuggestPhoneticCorrectionsOutput } from '@/ai/flows/suggest-phonetic-corrections';
import { ruleAssistant, type RuleAssistantInput, type RuleAssistantOutput } from '@/ai/flows/rule-assistant-flow';
import { textToSpeech, type TextToSpeechInput, type TextToSpeechOutput } from '@/ai/flows/text-to-speech-flow';

export async function getPhoneticSuggestions(text: string): Promise<SuggestPhoneticCorrectionsOutput> {
  if (!text.trim()) {
    return { corrections: [] };
  }
  try {
    const result = await suggestPhoneticCorrections({ text });
    return result;
  } catch (error) {
    console.error("Error fetching phonetic suggestions:", error);
    throw new Error("Failed to get phonetic suggestions from the AI model.");
  }
}

export async function getRuleAssistantResponse(input: RuleAssistantInput): Promise<RuleAssistantOutput> {
  if (!input.text.trim() || !input.query.trim()) {
    return { explanation: "Please provide text and a query." };
  }
  try {
    const result = await ruleAssistant(input);
    return result;
  } catch (error) {
    console.error("Error fetching rule assistant response:", error);
    throw new Error("Failed to get a response from the AI model.");
  }
}

export async function getAudioForText(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  if (!input.trim()) {
    return { audio: "" };
  }
  try {
    const result = await textToSpeech(input);
    return result;
  } catch (error) {
    console.error("Error fetching audio for text:", error);
    // Don't throw an error, just return empty audio and let the client handle it.
    return { audio: "" };
  }
}
