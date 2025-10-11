import { LinearClient } from '@linear/sdk';
import { writeFileSync } from 'fs';
import { loadConfig, displayConfig } from './config.js';
import { AIProvider } from './providers/ai-provider.interface.js';
import { OllamaProvider } from './providers/ollama-provider.js';
import { ClaudeProvider } from './providers/claude-provider.js';

interface IssueData {
  identifier: string;
  title: string;
  description: string | null;
  url: string;
  state: string;
  priority: number;
  estimate: number | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  team: string;
  assignee: string | null;
  labels: string[];
  comments: Array<{
    author: string;
    body: string;
    createdAt: Date;
  }>;
}

async function fetchIssuesWithDetails(linearClient: LinearClient): Promise<{ completed: IssueData[], inProgress: IssueData[] }> {
  // Get date from 7 days ago
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const me = await linearClient.viewer;

  const issues = await linearClient.issues({
    filter: {
      assignee: { id: { eq: me.id } },
      updatedAt: { gte: oneWeekAgo },
      or: [
        { state: { name: { in: ['In Progress', 'In Review'] } } },
        { completedAt: { gte: oneWeekAgo } }
      ]
    },
    orderBy: 'updatedAt'
  });

  const completed: IssueData[] = [];
  const inProgress: IssueData[] = [];

  for (const issue of issues.nodes) {
    const state = await issue.state;
    const team = await issue.team;
    const assignee = await issue.assignee;
    const labels = await issue.labels();
    const comments = await issue.comments();

    const issueData: IssueData = {
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || null,
      url: issue.url,
      state: state?.name || 'Unknown',
      priority: issue.priority,
      estimate: issue.estimate || null,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      completedAt: issue.completedAt || null,
      team: team?.name || 'Unknown',
      assignee: assignee?.name || null,
      labels: labels.nodes.map(l => l.name),
      comments: comments.nodes.map(c => ({
        author: c.user?.name || 'Unknown',
        body: c.body,
        createdAt: c.createdAt
      }))
    };

    if (state && (state.name === 'Done' || state.name === 'Completed')) {
      completed.push(issueData);
    } else if (state && (state.name === 'In Progress' || state.name === 'In Review')) {
      inProgress.push(issueData);
    }
  }

  return { completed, inProgress };
}

function generateVerboseMarkdown(completed: IssueData[], inProgress: IssueData[]): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let markdown = `# Verbose Weekly Brag Doc - ${today}\n\n`;
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `---\n\n`;

  if (completed.length > 0) {
    markdown += `## ✅ COMPLETED ISSUES (${completed.length})\n\n`;
    for (const issue of completed) {
      markdown += `### [${issue.identifier}](${issue.url}) - ${issue.title}\n\n`;
      markdown += `**Metadata:**\n`;
      markdown += `- State: ${issue.state}\n`;
      markdown += `- Team: ${issue.team}\n`;
      markdown += `- Priority: ${issue.priority}\n`;
      markdown += `- Estimate: ${issue.estimate || 'Not set'}\n`;
      markdown += `- Created: ${new Date(issue.createdAt).toLocaleString()}\n`;
      markdown += `- Updated: ${new Date(issue.updatedAt).toLocaleString()}\n`;
      if (issue.completedAt) {
        markdown += `- Completed: ${new Date(issue.completedAt).toLocaleString()}\n`;
      }
      if (issue.assignee) {
        markdown += `- Assignee: ${issue.assignee}\n`;
      }
      if (issue.labels.length > 0) {
        markdown += `- Labels: ${issue.labels.join(', ')}\n`;
      }
      markdown += `\n`;

      if (issue.description) {
        markdown += `**Description:**\n\n${issue.description}\n\n`;
      }

      if (issue.comments.length > 0) {
        markdown += `**Comments (${issue.comments.length}):**\n\n`;
        for (const comment of issue.comments) {
          markdown += `- **${comment.author}** (${new Date(comment.createdAt).toLocaleString()}):\n`;
          markdown += `  ${comment.body.split('\n').join('\n  ')}\n\n`;
        }
      }

      markdown += `---\n\n`;
    }
  }

  if (inProgress.length > 0) {
    markdown += `## 🚧 IN PROGRESS ISSUES (${inProgress.length})\n\n`;
    for (const issue of inProgress) {
      markdown += `### [${issue.identifier}](${issue.url}) - ${issue.title}\n\n`;
      markdown += `**Metadata:**\n`;
      markdown += `- State: ${issue.state}\n`;
      markdown += `- Team: ${issue.team}\n`;
      markdown += `- Priority: ${issue.priority}\n`;
      markdown += `- Estimate: ${issue.estimate || 'Not set'}\n`;
      markdown += `- Created: ${new Date(issue.createdAt).toLocaleString()}\n`;
      markdown += `- Updated: ${new Date(issue.updatedAt).toLocaleString()}\n`;
      if (issue.assignee) {
        markdown += `- Assignee: ${issue.assignee}\n`;
      }
      if (issue.labels.length > 0) {
        markdown += `- Labels: ${issue.labels.join(', ')}\n`;
      }
      markdown += `\n`;

      if (issue.description) {
        markdown += `**Description:**\n\n${issue.description}\n\n`;
      }

      if (issue.comments.length > 0) {
        markdown += `**Comments (${issue.comments.length}):**\n\n`;
        for (const comment of issue.comments) {
          markdown += `- **${comment.author}** (${new Date(comment.createdAt).toLocaleString()}):\n`;
          markdown += `  ${comment.body.split('\n').join('\n  ')}\n\n`;
        }
      }

      markdown += `---\n\n`;
    }
  }

  if (completed.length === 0 && inProgress.length === 0) {
    markdown += '_No issues found for the past week._\n';
  }

  return markdown;
}

async function generateBragDoc() {
  try {
    console.log('🎯 Linear Brag Doc Generator\n');

    // Load configuration
    const config = loadConfig();
    displayConfig(config);

    // Initialize Linear client
    const linearClient = new LinearClient({ apiKey: config.linearApiKey });

    // Initialize AI provider based on configuration
    let aiProvider: AIProvider;
    if (config.aiProvider === 'claude') {
      aiProvider = new ClaudeProvider(config.claudeApiKey!);
    } else {
      aiProvider = new OllamaProvider(config.ollamaUrl, config.ollamaModel);
    }

    console.log('📥 Fetching issues from Linear...');
    const { completed, inProgress } = await fetchIssuesWithDetails(linearClient);

    console.log(`✅ Found ${completed.length} completed and ${inProgress.length} in progress issues`);

    console.log('📝 Generating verbose markdown...');
    const verboseMarkdown = generateVerboseMarkdown(completed, inProgress);

    // Save verbose version
    writeFileSync(config.verboseOutputFile, verboseMarkdown);
    console.log(`💾 Saved verbose brag doc to ${config.verboseOutputFile}`);

    console.log(`🤖 Summarizing with ${aiProvider.name}...`);
    const summary = await aiProvider.summarize(verboseMarkdown);

    // Save summary
    writeFileSync(config.outputFile, summary);
    console.log(`💾 Saved brag doc to ${config.outputFile}`);

    console.log('\n' + '='.repeat(80));
    console.log('📊 WEEKLY BRAG DOC');
    console.log('='.repeat(80) + '\n');
    console.log(summary);
    console.log('\n' + '='.repeat(80));
    console.log('✨ Done! Your brag doc is ready to share.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateBragDoc();
