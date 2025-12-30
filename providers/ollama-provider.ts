import { AIProvider } from './ai-provider.interface.js';
import { withRetry } from '../utils.js';

/**
 * AI provider implementation using local Ollama instance
 */
export class OllamaProvider implements AIProvider {
  name = 'Ollama';

  constructor(
    private url: string,
    private model: string
  ) {}

  async summarize(verboseMarkdown: string): Promise<string> {
    const prompt = `You are helping create a concise weekly brag document from verbose Linear issue data.

Below is detailed information about all issues completed or in progress in the last week. Your task is to:
1. Summarize the key accomplishments and work in a concise, impactful way
2. Focus on what was achieved and the value delivered
3. Keep the structure with "Completed" and "In Progress" sections
4. Remove unnecessary metadata but keep issue identifiers and links
5. Highlight important context from descriptions and comments
6. Make it suitable for sharing with managers or in team updates

Here is the verbose data:

${verboseMarkdown}

Please generate a concise, professional weekly brag document in markdown format.`;

    return withRetry(async () => {
      const response = await fetch(`${this.url}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'Failed to generate summary';
    });
  }
}
