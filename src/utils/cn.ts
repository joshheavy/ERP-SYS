import { extendTailwindMerge } from 'tailwind-merge';

type ClassInput = string | number | bigint | null | false | undefined | ClassInput[];

function flatten(input: ClassInput): string[] {
  if (!input && input !== 0 && input !== 0n) return [];
  if (Array.isArray(input)) return input.flatMap(flatten);
  return [String(input)];
}

/**
 * tailwind-merge configured for our custom design tokens. Without this, merge
 * treats our custom font-size utilities (text-body, text-small, text-h1…) as
 * generic `text-*` classes and can wrongly strip a text COLOUR (e.g. text-white)
 * that appears before a font-size in the same class list. Registering them as
 * font-size classes keeps colour and size independent.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display', 'h1', 'h2', 'h3', 'h4', 'body', 'small', 'caption'] }
      ]
    }
  }
});

/** Conditional class composer with Tailwind conflict resolution. */
export function cn(...inputs: ClassInput[]): string {
  return twMerge(inputs.flatMap(flatten).join(' '));
}
