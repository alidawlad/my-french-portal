import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  // The model property is not needed here as it's specified in individual flows
  // or a default can be used. This also ensures the API key is used globally.
});
