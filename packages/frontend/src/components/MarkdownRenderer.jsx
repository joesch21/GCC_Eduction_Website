import { useEffect, useState } from 'react';
import { marked } from 'marked';

export default function MarkdownRenderer({ uri, hash, title }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!uri) return;
      const res = await fetch(uri);
      const text = await res.text();
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (!hash || hash === hex) {
        if (!cancelled) setHtml(marked(text));
      } else {
        if (!cancelled) setHtml('<em>hash mismatch</em>');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [uri, hash]);

  return (
    <div>
      {title ? <h2 style={{ marginTop: 0 }}>{title}</h2> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

