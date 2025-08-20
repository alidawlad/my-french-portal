// src/ai/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

// Execute dotenv to load environment variables from .env file.
config({path: '.env'});

// By providing the API key directly to the googleAI() plugin constructor,
// we ensure that all defined flows and AI calls use it for authentication.
// This resolves the persistent errors where various AI features were failing.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
