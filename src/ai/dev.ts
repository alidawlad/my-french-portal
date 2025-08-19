import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-phonetic-corrections.ts';
import '@/ai/flows/rule-assistant-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
