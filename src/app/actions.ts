// src/app/actions.ts
'use server';

import { suggestPhoneticCorrections, type SuggestPhoneticCorrectionsOutput } from '@/ai/flows/suggest-phonetic-corrections';
import { ruleAssistant, type RuleAssistantInput, type RuleAssistantOutput } from '@/ai/flows/rule-assistant-flow';
import { textToSpeech, type TextToSpeechInput, type TextToSpeechOutput } from '@/ai/flows/text-to-speech-flow';
import { getDictionaryEntry, type DictionaryInput, type DictionaryOutput } from '@/ai/flows/dictionary-flow';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import type { SavedWord, AIAnalysis } from '@/components/workbench/rule-book';
import { transformWordWithTrace, toEN, type TokenTrace } from '@/lib/phonetics';

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


export async function saveWordToRuleBook(wordData: Omit<SavedWord, 'id' | 'timestamp' | 'audio_data_uri'>): Promise<SavedWord> {
    if (!wordData.fr_line.trim()) {
        throw new Error("Cannot save an empty word.");
    }
    try {
        const newWordForDb = {
            ...wordData,
            timestamp: serverTimestamp(), // Use server timestamp for DB
        };

        const docRef = await addDoc(collection(db, "rulebook"), newWordForDb);
        
        // Return a fully serializable object to the client for optimistic UI updates.
        // Use a client-side Date object, as the server one is not available yet.
        return {
            id: docRef.id,
            ...wordData,
            timestamp: new Date().toISOString(), 
            audio_data_uri: null, // Audio is no longer pre-saved.
        };
    } catch (error) {
        console.error("Error saving word to Rule Book:", error);
        throw new Error("Failed to save word to the Rule Book.");
    }
}


// Helper function to convert any timestamp format to ISO string
function convertTimestampToISOString(timestamp: any): string {
    try {
        // Check for Firebase Timestamp with seconds property
        if (timestamp && typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
            const nanoseconds = timestamp.nanoseconds || 0;
            return new Date(timestamp.seconds * 1000 + Math.floor(nanoseconds / 1000000)).toISOString();
        }
        
        // Check for Firebase Timestamp with toDate method
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toISOString();
        }
        
        // Check for regular Date object
        if (timestamp instanceof Date) {
            return timestamp.toISOString();
        }
        
        // Check for ISO string
        if (typeof timestamp === 'string') {
            return new Date(timestamp).toISOString();
        }
        
        // Fallback to current date
        return new Date().toISOString();
    } catch (error) {
        console.error("Error converting timestamp:", timestamp, error);
        return new Date().toISOString();
    }
}

export async function getRuleBookWords(): Promise<SavedWord[]> {
    try {
        const q = query(collection(db, "rulebook"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const words: SavedWord[] = [];
        querySnapshot.forEach((doc) => {
            // Force serialize Firebase document data to convert all special objects to plain objects
            const data = JSON.parse(JSON.stringify(doc.data()));
            
            // Convert timestamp to ISO string using helper function
            const timestampISO = convertTimestampToISOString(data.timestamp);
            
            words.push({
                id: doc.id,
                fr_line: data.fr_line || '',
                en_line: data.en_line || '',
                ali_respell: data.ali_respell || '',
                ali_respell_trace: data.ali_respell_trace || [],
                analysis: data.analysis || {},
                audio_data_uri: data.audio_data_uri || null, // Keep this for potential old data, but new data will be null
                tags: data.tags || [],
                timestamp: timestampISO, // Always a serializable ISO string
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

export async function updateWordAnalysis(wordId: string, updates: Partial<AIAnalysis & { audio_data_uri?: string; tags?: string[]; }>): Promise<void> {
    if (!wordId) throw new Error("Word ID is required.");
    try {
        const wordRef = doc(db, "rulebook", wordId);
        
        const docSnap = await getDoc(wordRef);
        if (!docSnap.exists()) throw new Error("Word not found.");
        
        const existingData = docSnap.data();
        const existingAnalysis = existingData.analysis || {};

        const { audio_data_uri, tags, ...analysisUpdates } = updates;

        const updatePayload: any = {};
        
        // This logic ensures we're properly nesting the analysis data under the 'analysis' key.
        const newAnalysisData = { ...existingAnalysis, ...analysisUpdates };
        if(Object.keys(newAnalysisData).length > 0) {
          updatePayload.analysis = newAnalysisData;
        }
        
        if (audio_data_uri !== undefined) {
            updatePayload.audio_data_uri = audio_data_uri;
        }

        if (tags !== undefined) {
            updatePayload.tags = tags;
        }
        
        if (Object.keys(updatePayload).length > 0) {
            await updateDoc(wordRef, updatePayload);
        }

    } catch (error) {
        console.error("Error updating word analysis:", error);
        throw new Error("Failed to update word analysis in the database.");
    }
}


export async function refreshWordPhonetics(wordId: string, fr_line: string): Promise<{ ali_respell: string; ali_respell_trace: TokenTrace[] }> {
    if (!wordId || !fr_line) {
        throw new Error("Word ID and French text are required for refreshing phonetics.");
    }

    try {
        const newTrace = transformWordWithTrace(fr_line);
        const newRespell = newTrace.map(t => typeof t === 'string' ? t : toEN(t.out)).join('');

        const updatePayload = {
            ali_respell: newRespell,
            ali_respell_trace: newTrace,
        };

        const wordRef = doc(db, "rulebook", wordId);
        await updateDoc(wordRef, updatePayload);
        
        return updatePayload;

    } catch (error) {
        console.error("Error refreshing word phonetics:", error);
        throw new Error("Failed to refresh word phonetics in the database.");
    }
}
