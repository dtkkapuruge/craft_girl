// scripts/typography-refactor.ts
// Node.js script to refactor Tailwind typography classes across the codebase.
// It replaces hard‑coded pixel utilities (e.g., text-[8px]) with the mapped Shopify Polaris classes.
// It also enforces a minimum readable font size (no text below 12px, except allowed 11px badges).
// Usage: `ts-node scripts/typography-refactor.ts` (or compile with tsc).

import * as fs from 'fs';
import * as path from 'path';

// Define the workspace root (adjust if different).
const workspaceRoot = path.resolve(__dirname, '..'); // assumes script is in <root>/scripts
const srcDir = path.join(workspaceRoot, 'src');

// Mapping from pixel size to Tailwind class.
const pixelToClass: { [size: string]: string } = {
  '8': 'text-xs', // minimum 12px, map to xs (12px)
  '9': 'text-xs',
  '10': 'text-xs',
  '11': 'text-[11px]', // badge/eyebrow
  '12': 'text-xs',
  '13': 'text-[13px]', // dropdown menu items
  '14': 'text-sm', // generic body & navigation size
  '15': 'text-sm',
  // add more if needed
};

// Recursively walk through directory and collect relevant files.
function* walk(dir: string): IterableIterator<string> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      // Process common frontend file extensions.
      if (/\.(tsx|ts|jsx|js|html)$/.test(entry.name)) {
        yield fullPath;
      }
    }
  }
}

// Replace pixel utilities in a given string of class names.
function replacePixelClasses(classStr: string): string {
  // Find occurrences like text-[12px]
  return classStr.replace(/text-\[(\d+)px\]/g, (match, p1) => {
    const replacement = pixelToClass[p1];
    if (replacement) {
      return replacement;
    }
    // If no explicit mapping, fall back to a safe default (text-sm)
    return 'text-sm';
  });
}

// Simple title‑case conversion (for strings that are all caps).
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Simple sentence‑case conversion.
function toSentenceCase(str: string): string {
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Process a single file.
function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace className strings (both JSX and plain HTML attributes).
  const classRegex = /(className|class)=\"([^\"]*)\"/g;
  content = content.replace(classRegex, (full, attr, classVal) => {
    const newClass = replacePixelClasses(classVal);
    return `${attr}="${newClass}"`;
  });

  // Basic textual case handling: look for literal JSX text nodes that are all caps.
  const capsRegex = />([A-Z\s]{3,})</g;
  content = content.replace(capsRegex, (full, caps) => {
    const title = toTitleCase(caps.trim());
    return `>${title}<`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${filePath}`);
  }
}

function main() {
  console.log('Starting typography refactor...');
  for (const filePath of walk(srcDir)) {
    processFile(filePath);
  }
  console.log('Typography refactor completed.');
}

main();
