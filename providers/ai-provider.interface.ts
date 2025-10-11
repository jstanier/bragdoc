/**
 * Interface for AI providers that can summarize verbose brag doc content
 */
export interface AIProvider {
  /**
   * The name of the provider (e.g., "Ollama", "Claude")
   */
  name: string;

  /**
   * Summarizes verbose markdown content into a concise brag document
   * @param verboseMarkdown The detailed markdown content to summarize
   * @returns A promise that resolves to the summarized content
   */
  summarize(verboseMarkdown: string): Promise<string>;
}
