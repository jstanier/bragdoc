# Linear Brag Doc Generator 🎯

Automatically generate professional weekly brag documents from your Linear issues using AI.

## What is a Brag Doc?

A brag document (or brag doc) is a living record of your accomplishments at work. It helps you:
- Track your achievements for performance reviews
- Remember what you've worked on when updating your resume
- Share progress with your manager and team
- Build confidence by seeing what you've accomplished

This tool makes creating brag docs effortless by automatically pulling your work from Linear and summarizing it with AI.

## How It Works

```
┌─────────────┐
│   Linear    │  Fetches issues (configurable lookback)
│     API     │  (completed + in progress)
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Generate Verbose MD    │  Creates detailed markdown
│  (all issue details)    │  with metadata, comments, etc.
└──────────┬──────────────┘
           │
           ▼
    ┌──────────────┐
    │  AI Provider │  Choose your AI:
    │              │  • Ollama (local, free)
    │              │  • Claude (cloud, powerful)
    └──────┬───────┘
           │
           ▼
    ┌─────────────────┐
    │  Summarization  │  AI condenses verbose details
    │                 │  into polished brag doc
    └─────────┬───────┘
              │
              ▼
       ┌──────────────┐
       │  bragdoc.md  │  Ready to share!
       └──────────────┘
```

## Requirements

- Node.js 18.0.0 or higher

## Installation

```bash
# Clone the repository
git clone git@github.com:jstanier/bragdoc.git
cd bragdoc

# Install dependencies
npm install
```

## Configuration

This tool supports three configuration methods with the following priority:

1. Command-line arguments (highest priority)
2. Config file (`.bragdoc.config.json`)
3. Environment variables (`.env` file)

### Option 1: Command-Line Arguments

```bash
npm start -- --linear-key lin_api_xxx --claude-key sk-ant-xxx
```

Available flags:
- `--version` - Show version number
- `--linear-key <key>` - Your Linear API key (required)
- `--claude-key <key>` - Your Claude API key (optional)
- `--ai-provider <provider>` - AI provider: `ollama` or `claude`
- `--ollama-url <url>` - Ollama API URL (default: `http://localhost:11434`)
- `--ollama-model <model>` - Ollama model name (default: `llama2`)
- `--output <file>` - Output file path (default: `bragdoc.md`)
- `--days <number>` - Number of days to look back (default: `7`)
- `--dry-run` - Fetch and display issues without calling AI (useful for testing)

### Option 2: Config File (Recommended for local use)

1. Copy the example config:
   ```bash
   cp .bragdoc.config.example.json .bragdoc.config.json
   ```

2. Edit `.bragdoc.config.json` with your settings:
   ```json
   {
     "linearApiKey": "lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     "claudeApiKey": "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     "aiProvider": "ollama",
     "ollamaUrl": "http://localhost:11434",
     "ollamaModel": "llama2",
     "outputFile": "bragdoc.md",
     "days": 7
   }
   ```

3. Run the tool:
   ```bash
   npm start
   ```

**Note:** `.bragdoc.config.json` is git-ignored by default to protect your API keys.

### Option 3: Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your settings:
   ```bash
   LINEAR_API_KEY=your_linear_api_key_here
   CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   ```

3. Run the tool:
   ```bash
   npm start
   ```

## Getting API Keys

### Linear API Key (Required)

1. Go to [Linear Settings → API](https://linear.app/settings/api)
2. Click "Create new key"
3. Give it a name (e.g., "Brag Doc Generator")
4. Copy the key (starts with `lin_api_`)

### Claude API Key (Optional)

1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Go to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)

**Note:** Claude is more powerful but costs money. Ollama is free and runs locally but requires setup.

## Using Ollama (Local AI)

If you want to use Ollama instead of Claude:

1. [Install Ollama](https://ollama.ai/)
2. Pull a model:
   ```bash
   ollama pull llama2
   # or try other models like mistral, codellama, etc.
   ```
3. Make sure Ollama is running:
   ```bash
   ollama serve
   ```
4. Configure the tool to use Ollama (it's the default if no Claude key is provided)

## Usage Examples

### Basic usage with config file
```bash
npm start
```

### Use Claude instead of Ollama
```bash
npm start -- --ai-provider claude
```

### Override config with command-line args
```bash
npm start -- --linear-key lin_api_xxx --output ./reports/weekly.md
```

### Use a different Ollama model
```bash
npm start -- --ollama-model mistral
```

### Look back 14 days instead of 7
```bash
npm start -- --days 14
```

### Dry run (fetch issues without AI summarization)
```bash
npm start -- --dry-run
```

### Check version
```bash
npm start -- --version
```

## Output Files

The tool generates two files:

1. **`bragdoc.md`** - Concise, polished brag document ready to share
2. **`bragdoc-verbose.md`** - Detailed version with all issue metadata (for reference)

Both files are git-ignored by default.

## What Gets Included?

The tool fetches Linear issues that:
- Are assigned to you
- Were updated in the configured time period (default: last 7 days)
- Are either:
  - Completed (Done/Completed status)
  - In Progress (In Progress/In Review status)

For each issue, it includes:
- Title and identifier
- Description
- State and metadata (priority, estimate, team, labels)
- Comments and discussion

The AI then summarizes this into a professional brag doc format.

## Troubleshooting

### "Linear API key is required"
Make sure you've provided your Linear API key via one of the three configuration methods.

### "Claude API key is required when using Claude provider"
Either:
- Provide a Claude API key, or
- Switch to Ollama: `--ai-provider ollama`

### "Ollama API error"
Make sure Ollama is running:
```bash
ollama serve
```

### "No issues found for the past week"
This is normal if you haven't updated any Linear issues recently. Try increasing the lookback period:
```bash
npm start -- --days 14
```

### API call failures
The tool automatically retries failed API calls up to 3 times with exponential backoff. If you're still experiencing issues, check your network connection and API key validity.

## Project Structure

```
bragdoc/
├── index.ts                          # Main entry point
├── config.ts                         # Configuration management
├── utils.ts                          # Utility functions (retry logic, etc.)
├── providers/
│   ├── ai-provider.interface.ts     # AI provider interface
│   ├── ollama-provider.ts           # Ollama implementation
│   └── claude-provider.ts           # Claude implementation
├── .bragdoc.config.example.json     # Example config file
├── .env.example                      # Example environment variables
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT

---

**Pro tip:** Run this tool every week and keep a running collection of brag docs. When performance review time comes around, you'll thank yourself! 🎉
