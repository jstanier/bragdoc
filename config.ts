import { readFileSync, existsSync } from 'fs';
import { program } from 'commander';
import 'dotenv/config';

export interface BragDocConfig {
  linearApiKey: string;
  claudeApiKey?: string;
  aiProvider: 'ollama' | 'claude';
  ollamaUrl: string;
  ollamaModel: string;
  outputFile: string;
  verboseOutputFile: string;
}

interface ConfigFile {
  linearApiKey?: string;
  claudeApiKey?: string;
  aiProvider?: 'ollama' | 'claude';
  ollamaUrl?: string;
  ollamaModel?: string;
  outputFile?: string;
}

/**
 * Loads configuration from multiple sources with cascading priority:
 * 1. Command-line arguments (highest priority)
 * 2. .bragdoc.config.json file
 * 3. Environment variables
 * 4. Defaults (lowest priority)
 */
export function loadConfig(): BragDocConfig {
  // Parse command-line arguments
  program
    .option('--linear-key <key>', 'Linear API key')
    .option('--claude-key <key>', 'Claude API key (optional)')
    .option('--ai-provider <provider>', 'AI provider to use: ollama or claude')
    .option('--ollama-url <url>', 'Ollama API URL')
    .option('--ollama-model <model>', 'Ollama model name')
    .option('--output <file>', 'Output file path')
    .parse(process.argv);

  const options = program.opts();

  // Load config file if it exists
  let fileConfig: ConfigFile = {};
  const configPath = '.bragdoc.config.json';
  if (existsSync(configPath)) {
    try {
      const configContent = readFileSync(configPath, 'utf-8');
      fileConfig = JSON.parse(configContent);
      console.log('📄 Loaded configuration from .bragdoc.config.json');
    } catch (error) {
      console.warn('⚠️  Warning: Failed to parse .bragdoc.config.json, ignoring file');
    }
  }

  // Cascade configuration with priority: CLI > File > Env > Defaults
  const linearApiKey =
    options.linearKey ||
    fileConfig.linearApiKey ||
    process.env.LINEAR_API_KEY;

  const claudeApiKey =
    options.claudeKey ||
    fileConfig.claudeApiKey ||
    process.env.CLAUDE_API_KEY;

  const ollamaUrl =
    options.ollamaUrl ||
    fileConfig.ollamaUrl ||
    process.env.OLLAMA_URL ||
    'http://localhost:11434';

  const ollamaModel =
    options.ollamaModel ||
    fileConfig.ollamaModel ||
    process.env.OLLAMA_MODEL ||
    'gpt-oss:20b';

  const outputFile =
    options.output ||
    fileConfig.outputFile ||
    'bragdoc.md';

  const verboseOutputFile = outputFile.replace('.md', '-verbose.md');

  // Determine AI provider
  let aiProvider: 'ollama' | 'claude';
  if (options.aiProvider) {
    aiProvider = options.aiProvider;
  } else if (fileConfig.aiProvider) {
    aiProvider = fileConfig.aiProvider;
  } else if (claudeApiKey) {
    // If Claude key is provided but no explicit provider, default to Claude
    aiProvider = 'claude';
  } else {
    // Default to Ollama
    aiProvider = 'ollama';
  }

  // Validate configuration
  if (!linearApiKey) {
    console.error('❌ Error: Linear API key is required');
    console.error('\nYou can provide it in one of three ways:');
    console.error('  1. Command line: --linear-key YOUR_KEY');
    console.error('  2. Config file: .bragdoc.config.json');
    console.error('  3. Environment variable: LINEAR_API_KEY');
    process.exit(1);
  }

  if (aiProvider === 'claude' && !claudeApiKey) {
    console.error('❌ Error: Claude API key is required when using Claude provider');
    console.error('\nYou can provide it in one of three ways:');
    console.error('  1. Command line: --claude-key YOUR_KEY');
    console.error('  2. Config file: .bragdoc.config.json');
    console.error('  3. Environment variable: CLAUDE_API_KEY');
    console.error('\nOr switch to Ollama: --ai-provider ollama');
    process.exit(1);
  }

  return {
    linearApiKey,
    claudeApiKey,
    aiProvider,
    ollamaUrl,
    ollamaModel,
    outputFile,
    verboseOutputFile
  };
}

/**
 * Displays the current configuration to the console
 */
export function displayConfig(config: BragDocConfig): void {
  console.log('\n🔧 Configuration:');
  console.log(`   AI Provider: ${config.aiProvider === 'claude' ? '🤖 Claude' : '🦙 Ollama'}`);
  if (config.aiProvider === 'ollama') {
    console.log(`   Ollama URL: ${config.ollamaUrl}`);
    console.log(`   Ollama Model: ${config.ollamaModel}`);
  }
  console.log(`   Output: ${config.outputFile}`);
  console.log(`   Verbose Output: ${config.verboseOutputFile}\n`);
}
