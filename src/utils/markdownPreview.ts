/**
 * Strips markdown symbols and emoji from text to generate a clean preview snippet.
 */
export function cleanMarkdownPreview(content: string): string {
  if (!content) return '';

  return (
    content
      // Remove codeblocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown images and links: ![alt](url) or [text](url) -> text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // Remove headers #, ##, ###
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold and italics ***text***, **text**, *text*, ___text___, etc.
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      // Remove blockquotes >
      .replace(/^>\s+/gm, '')
      // Remove bullet list indicators
      .replace(/^[-*+]\s+/gm, '')
      // Remove ordered list numbers 1. 2.
      .replace(/^\d+\.\s+/gm, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove emojis
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        ''
      )
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}
