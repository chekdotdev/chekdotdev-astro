import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import { decodeHtmlEntities } from './html';

const supportedLanguages = ['javascript', 'typescript', 'python', 'bash', 'markdown', 'json'] as const;

function addClass(attributes: string, className: string) {
  if (attributes.includes(className)) {
    return attributes;
  }

  if (attributes.includes('class="')) {
    return attributes.replace(/class="([^"]*)"/, `class="$1 ${className}"`);
  }

  return `${attributes} class="${className}"`;
}

export function highlightCodeBlocks(html: string) {
  return html.replace(/<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/g, (match, preAttributes, codeAttributes, code) => {
    const language = supportedLanguages.find((name) => preAttributes.includes(`pre-${name}`));

    if (!language) {
      return match;
    }

    const grammar = Prism.languages[language];

    if (!grammar) {
      return match;
    }

    const normalizedPreAttributes = addClass(preAttributes, `language-${language}`);
    const normalizedCodeAttributes = addClass(codeAttributes, `language-${language}`);
    const highlighted = Prism.highlight(decodeHtmlEntities(code), grammar, language);

    return `<pre${normalizedPreAttributes}><code${normalizedCodeAttributes}>${highlighted}</code></pre>`;
  });
}
