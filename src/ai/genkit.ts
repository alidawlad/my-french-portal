import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// By providing the API key directly to the googleAI() plugin constructor,
// we ensure that all defined flows and AI calls use it for authentication.
// This resolves the persistent errors where various AI features were failing.
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  // The model property is not needed here as it's specified in individual flows
  // or a default can be used. This also ensures the API key is used globally.
});
