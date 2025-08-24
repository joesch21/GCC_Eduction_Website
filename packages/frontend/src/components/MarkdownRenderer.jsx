import { useEffect, useState } from 'react';
import { marked } from 'marked';

export default function MarkdownRenderer({ uri, hash }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    async function load() {
      if (!uri) return;
      const res = await fetch(uri);
      const text = await res.text();
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (!hash || hash === hex) {
        setHtml(marked(text));
      } else {
        setHtml('hash mismatch');
      }
    }
    load();
  }, [uri, hash]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}