import { generateText } from 'ai';

// Generate 3 AI suggestions for feedback using Vercel AI SDK
// Model: nvidia/nemotron-3.5-lightning-free (via Together AI)
// API key configured via Vite import.meta.env - set in .env
const apiKey = import.meta.env.AI_GATEWAY_API_KEY || import.meta.env.TOGETHER_API_KEY || import.meta.env.OPENAI_API_KEY;

export async function getAISuggestions(feedback: string) {
  // Return static suggestions if no API key is configured
  if (!apiKey) {
    return [
      'Consider adding a rating scale to your feedback',
      'Suggest specific features that could be improved',
      'Recommend sharing the link with relevant team members'
    ];
  }

  try {
    const result = await generateText({
      model: 'together/nvidia/nemotron-3.5-lightning-free',
      system: `
        You are a professional customer feedback assistant.

        Analyze the user's feedback and provide exactly
        3 short, practical improvement suggestions.

        Return only 3 numbered suggestions.
        Keep each suggestion under 25 words.
        Be friendly and professional.
      `,
      prompt: `Customer feedback: ${feedback}`,
      temperature: 0.7,
    });

    // Use GenerateTextResult (response text)
    const text = result.text?.trim() || '';
    const suggestions: string[] = [];

    // Extract up to 3 numbered suggestions (1., 2., 3.)
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (suggestions.length < 3 && /^\d+\.\s/.test(trimmed)) {
        const suggestion = trimmed.replace(/^\d+\.\s*/, '').trim();
        if (suggestion.length > 0) {
          suggestions.push(suggestion);
        }
      }
    }

    // Fill remaining with defaults if needed
    while (suggestions.length < 3) {
      const defaultIdx = suggestions.length;
      suggestions.push([
        'Consider adding a rating scale to your feedback',
        'Suggest specific features that could be improved',
        'Recommend sharing the link with relevant team members'
      ][defaultIdx]);
    }

    return suggestions.slice(0, 3);
  } catch (error) {
    console.error('AI suggestions error:', error);
    return [
      'Consider adding a rating scale to your feedback',
      'Suggest specific features that could be improved',
      'Recommend sharing the link with relevant team members'
    ];
  }
}
