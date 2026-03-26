export function formatMarkdownString(content: string): string {
  if (!content) return '';

  let currentHeading = '';
  // Normalize line endings and split by double newlines to get distinct blocks
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\n+/);

  const formattedBlocks = blocks.map(block => {
    let trimmed = block.trim();
    if (!trimmed) return '';

    // Track the heading context to apply specific rules to certain sections
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^#+\s+(.*)/);
      if (match) currentHeading = match[1].toLowerCase();
      return trimmed;
    }

    // Skip already formatted blocks (bullet lists, numbered lists, blockquotes, code blocks)
    if (trimmed.match(/^[-*]\s/) || trimmed.match(/^\d+\.\s/) || trimmed.startsWith('>') || trimmed.startsWith('```')) {
      // If a list section has no space between items, we can ensure they are properly spaced,
      // but standard markdown renders them fine.
      return trimmed;
    }

    const isListSection =
      currentHeading.includes('metric') ||
      currentHeading.includes('feature') ||
      currentHeading.includes('target user') ||
      currentHeading.includes('user group') ||
      currentHeading.includes('requirement');

    // Check if it's a newline-separated list without bullets
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (isListSection && lines.length > 1) {
       return lines.map(line => line.startsWith('-') || line.startsWith('*') ? line : `- ${line}`).join('\n');
    }

    // Parse sentences for paragraph and bullet logic
    const sentences = trimmed.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) || [trimmed];
    const periodCount = (trimmed.match(/\./g) || []).length;
    const commaCount = (trimmed.match(/,/g) || []).length;

    // Enforce bullet points for metrics, features, and target users
    if (isListSection) {
      // Handle comma-separated list
      if (periodCount <= 1 && commaCount >= 1) {
        return trimmed.split(/,\s*/).filter(Boolean).map(item => {
            const cleanItem = item.trim().replace(/\.$/, '');
            return `- ${cleanItem}`;
        }).join('\n');
      }
      // Handle sentence-separated items
      return sentences.map(s => {
        if (s.startsWith('- ') || s.startsWith('* ')) return s;
        return `- ${s}`;
      }).join('\n');
    }

    // General comma-separated list heuristic for normal text
    // Convert inline lists into bullet points to improve readability
    if (periodCount <= 1 && commaCount >= 2 && lines.length === 1) {
      return trimmed.split(/,\s*/).filter(Boolean).map(item => `- ${item.trim().replace(/\.$/, '')}`).join('\n');
    }

    // Paragraph formatting: break into max 2-3 sentences per paragraph
    if (sentences.length > 3) {
      const chunks = [];
      for (let i = 0; i < sentences.length; i += 2) {
        chunks.push(sentences.slice(i, i + 2).join(' '));
      }
      return chunks.join('\n\n');
    }

    return trimmed;
  });

  // Ensure consistent spacing between sections and paragraphs
  return formattedBlocks.filter(Boolean).join('\n\n');
}
