// Stub AI configuration for components that reference it
// This will be refactored or removed when we clean up demo functionality in Phase 2

export const AI_CONFIG = {
  openai: {
    apiKey: '',
    model: 'gpt-4',
    maxTokens: 2048,
  },
  anthropic: {
    apiKey: '',
    model: 'claude-3-sonnet',
    maxTokens: 2048,
  },
  perplexity: {
    apiKey: '',
    model: 'llama-3.1-sonar-small-128k-online',
    maxTokens: 2048,
  },
}; 