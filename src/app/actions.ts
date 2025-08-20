// src/app/actions.ts
'use server';

import { suggestPhoneticCorrections, type SuggestPhoneticCorrectionsOutput } from '@/ai/flows/suggest-phonetic-corrections';
import { ruleAssistant, type RuleAssistantInput, type RuleAssistantOutput } from '@/ai/flows/rule-assistant-flow';
import { textToSpeech, type TextToSpeechInput, type TextToSpeechOutput } from '@/ai/flows/text-to-speech-flow';
import { getDictionaryEntry, type DictionaryInput, type DictionaryOutput } from '@/ai/flows/dictionary-flow';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { SavedWord } from '@/components/workbench/rule-book';

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
    // Return empty audio object on failure to prevent app crash.
    // The client will handle showing a toast notification.
    return { audio: "" };
  }
}

export async function getEnglishMeaning(text: string): Promise<{meaning: string}> {
  if (!text.trim()) {
    return { meaning: "" };
  }
  try {
    const result = await getDictionaryEntry({ word: text });
    return { meaning: result.englishDefinition };
  } catch (error) {
    console.error("Error fetching English meaning:", error);
    throw new Error("Failed to get English meaning from the AI model.");
  }
}

export async function saveWordToRuleBook(wordData: Pick<SavedWord, 'fr_line' | 'en_line' | 'ali_respell'>): Promise<SavedWord> {
    if (!wordData.fr_line.trim()) {
        throw new Error("Cannot save an empty word.");
    }
    try {
        const newWord = {
            ...wordData,
            timestamp: serverTimestamp(), // Use Firestore server timestamp
        };

        const docRef = await addDoc(collection(db, "rulebook"), newWord);

        // For the immediate UI update, we return the data with a client-side timestamp.
        // The server timestamp will be correct on the next full fetch.
        return {
            id: docRef.id,
            fr_line: wordData.fr_line,
            en_line: wordData.en_line,
            ali_respell: wordData.ali_respell,
            timestamp: new Date(),
        };
    } catch (error) {
        console.error("Error saving word to Rule Book:", error);
        throw new Error("Failed to save word to the Rule Book.");
    }
}


export async function getRuleBookWords(): Promise<SavedWord[]> {
    try {
        const q = query(collection(db, "rulebook"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const words: SavedWord[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Firestore timestamps need to be converted to JS Date objects
            const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
            words.push({
                id: doc.id,
                fr_line: data.fr_line,
                en_line: data.en_line,
                ali_respell: data.ali_respell,
                frenchDefinition: data.frenchDefinition || "",
                englishDefinition: data.englishDefinition || "",
                timestamp: timestamp,
            });
        });
        return words;
    } catch (error) {
        console.error("Error fetching Rule Book words:", error);
        return [];
    }
}

export async function deleteWordFromRuleBook(wordId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "rulebook", wordId));
    } catch (error) {
        console.error("Error deleting word from Rule Book:", error);
        throw new Error("Failed to delete word from the Rule Book.");
    }
}

// New function to get definitions on demand
export async function getDefinitionsForWord(wordId: string, word: string): Promise<DictionaryOutput> {
    if (!word.trim()) {
        return { frenchDefinition: "", englishDefinition: "" };
    }
    try {
        const result = await getDictionaryEntry({ word });
        
        // Update the document in Firestore
        const wordRef = doc(db, "rulebook", wordId);
        await updateDoc(wordRef, {
            frenchDefinition: result.frenchDefinition,
            englishDefinition: result.englishDefinition,
        });

        return result;
    } catch (error) {
        console.error("Error fetching and updating definitions:", error);
        throw new Error("Failed to get definitions from the AI model.");
    }
}
