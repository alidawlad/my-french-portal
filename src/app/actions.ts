// src/app/actions.ts
'use server';

import { suggestPhoneticCorrections, type SuggestPhoneticCorrectionsOutput } from '@/ai/flows/suggest-phonetic-corrections';
import { ruleAssistant, type RuleAssistantInput, type RuleAssistantOutput } from '@/ai/flows/rule-assistant-flow';
import { textToSpeech, type TextToSpeechInput, type TextToSpeechOutput } from '@/ai/flows/text-to-speech-flow';
import { getDictionaryEntry, type DictionaryInput, type DictionaryOutput } from '@/ai/flows/dictionary-flow';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import type { SavedWord, AIAnalysis } from '@/components/workbench/rule-book';

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
    return { };
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
    // Return empty audio string on failure to prevent app crash on client.
    return { audio: "" };
  }
}

export async function getDictionaryDefinitions(text: string): Promise<DictionaryOutput> {
  if (!text.trim()) {
    return { frenchDefinition: "", englishDefinition: "" };
  }
  try {
    const result = await getDictionaryEntry({ word: text });
    return result;
  } catch (error) {
    console.error("Error fetching dictionary definitions:", error);
    throw new Error("Failed to get definitions from the AI model.");
  }
}


export async function saveWordToRuleBook(wordData: Omit<SavedWord, 'id' | 'timestamp'>): Promise<SavedWord> {
    if (!wordData.fr_line.trim()) {
        throw new Error("Cannot save an empty word.");
    }
    try {
        const newWord = {
            ...wordData,
            timestamp: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "rulebook"), newWord);
        
        // The timestamp from serverTimestamp is resolved on the server, 
        // so we return a client-side Date object for immediate UI updates.
        return {
            id: docRef.id,
            ...wordData,
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
            // Ensure timestamp is a Date object. Firestore timestamps need to be converted.
            const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
            words.push({
                id: doc.id,
                fr_line: data.fr_line,
                en_line: data.en_line,
                ali_respell: data.ali_respell,
                analysis: data.analysis || {}, // Ensure analysis object exists
                audio_data_uri: data.audio_data_uri || null, // Handle audio data
                timestamp: timestamp,
            });
        });
        return words;
    } catch (error) {
        console.error("Error fetching Rule Book words:", error);
        return []; // Return empty array on failure
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

export async function updateWordAnalysis(wordId: string, analysisUpdate: Partial<AIAnalysis & { audio_data_uri?: string }>): Promise<void> {
    if (!wordId) throw new Error("Word ID is required.");
    try {
        const wordRef = doc(db, "rulebook", wordId);
        
        const docSnap = await getDoc(wordRef);
        if (!docSnap.exists()) throw new Error("Word not found.");
        
        const existingData = docSnap.data();
        const existingAnalysis = existingData.analysis || {};

        const { audio_data_uri, ...otherUpdates } = analysisUpdate;

        const updatePayload: any = {};
        
        if(Object.keys(otherUpdates).length > 0) {
          const newAnalysisData = { ...existingAnalysis, ...otherUpdates };
          updatePayload.analysis = newAnalysisData;
        }

        if (audio_data_uri !== undefined) {
            updatePayload.audio_data_uri = audio_data_uri;
        }
        
        if (Object.keys(updatePayload).length > 0) {
            await updateDoc(wordRef, updatePayload);
        }

    } catch (error) {
        console.error("Error updating word analysis:", error);
        throw new Error("Failed to update word analysis in the database.");
    }
}
