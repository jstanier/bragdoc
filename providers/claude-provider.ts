import Anthropic from '@anthropic-ai/sdk';
import { AIProvider } from './ai-provider.interface.js';

/**
 * AI provider implementation using Anthropic's Claude API
 */
export class ClaudeProvider implements AIProvider {
  name = 'Claude';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey: apiKey
    });
  }

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

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text content from the response
    const textContent = message.content.find(block => block.type === 'text');
    if (textContent && textContent.type === 'text') {
      return textContent.text;
    }

    throw new Error('Failed to generate summary: No text content in response');
  }
}
