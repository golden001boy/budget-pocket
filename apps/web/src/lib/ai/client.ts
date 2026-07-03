// AI provider — Groq (gratuit, 14 400 req/jour)
// Alternative payante : définir ANTHROPIC_API_KEY et changer PROVIDER → 'anthropic'
// Clé Groq gratuite : https://console.groq.com

export const AI_PROVIDER = (process.env.AI_PROVIDER ?? 'groq') as 'groq' | 'anthropic';

// Groq — gratuit, rapide, excellent en français
export const GROQ_MODEL   = 'llama-3.3-70b-versatile';
export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Anthropic — si ANTHROPIC_API_KEY est défini
// Haiku 4.5 : ~$0.25/1M tokens (10× moins cher que Sonnet)
export const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
