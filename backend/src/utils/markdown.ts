import * as fs from 'fs';
import * as path from 'path';

export interface MarkdownFrontmatter {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  category?: string;
  published?: boolean;
  featured?: boolean;
  slug?: string;
  author?: string;
}

export interface ParsedMarkdownFile {
  filename: string;
  filepath: string;
  frontmatter: MarkdownFrontmatter;
  content: string;
  excerpt: string;
}

export function parseMarkdownFile(filepath: string): ParsedMarkdownFile | null {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const filename = path.basename(filepath);

    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    let markdownContent = content;
    let frontmatter: MarkdownFrontmatter = { title: filename.replace('.md', '') };

    if (frontmatterMatch) {
      const frontmatterStr = frontmatterMatch[1];
      frontmatter = parseFrontmatter(frontmatterStr);
      markdownContent = content.substring(frontmatterMatch[0].length);
    }

    const excerpt = extractExcerpt(markdownContent);

    return {
      filename,
      filepath,
      frontmatter,
      content: markdownContent.trim(),
      excerpt,
    };
  } catch (error) {
    console.error(`Error parsing ${filepath}:`, error);
    return null;
  }
}

export function parseFrontmatter(frontmatterStr: string): MarkdownFrontmatter {
  const frontmatter: MarkdownFrontmatter = { title: '' };

  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();

    if (!key.trim()) continue;

    const cleanKey = key.trim().toLowerCase();

    switch (cleanKey) {
      case 'title':
        frontmatter.title = removeQuotes(value);
        break;
      case 'description':
        frontmatter.description = removeQuotes(value);
        break;
      case 'date':
        frontmatter.date = removeQuotes(value);
        break;
      case 'tags':
        frontmatter.tags = parseYamlArray(value);
        break;
      case 'category':
        frontmatter.category = removeQuotes(value);
        break;
      case 'published':
        frontmatter.published = value.toLowerCase() === 'true';
        break;
      case 'featured':
        frontmatter.featured = value.toLowerCase() === 'true';
        break;
      case 'slug':
        frontmatter.slug = removeQuotes(value);
        break;
      case 'author':
        frontmatter.author = removeQuotes(value);
        break;
    }
  }

  return frontmatter;
}

export function extractExcerpt(content: string, length: number = 150): string {
  const text = content
    .replace(/^#+ .*/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\*\*([^\*]+)\*\*/g, '$1')
    .replace(/\*([^\*]+)\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  if (text.length <= length) {
    return text;
  }

  return text.substring(0, length).replace(/\s+\S*$/, '') + '...';
}

export function removeQuotes(str: string): string {
  return str.replace(/^["']|["']$/g, '');
}

export function parseYamlArray(str: string): string[] {
  const trimmed = str.trim();

  // Handle bracket notation: [item1, item2]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map(item => removeQuotes(item.trim()))
      .filter(item => item.length > 0);
  }

  // Handle comma-separated: item1, item2
  if (trimmed.includes(',')) {
    return trimmed
      .split(',')
      .map(item => removeQuotes(item.trim()))
      .filter(item => item.length > 0);
  }

  // Single item
  return [removeQuotes(trimmed)].filter(item => item.length > 0);
}

export function findMarkdownFiles(dirPath: string): string[] {
  const files: string[] = [];

  function traverse(dir: string): void {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!item.startsWith('.')) {
            traverse(fullPath);
          }
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }

  traverse(dirPath);
  return files;
}

export function validateMarkdownFile(parsed: ParsedMarkdownFile): string[] {
  const errors: string[] = [];

  if (!parsed.frontmatter.title) {
    errors.push('Missing required field: title');
  }

  if (!parsed.content || parsed.content.length === 0) {
    errors.push('Content is empty');
  }

  return errors;
}
