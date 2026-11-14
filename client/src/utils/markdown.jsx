import React from 'react';

// Minimal, safe markdown for chat replies: **bold**, *italic*, `code`, ``` blocks, lists, headings.
// Builds React elements (never innerHTML), so model output can't inject markup.
const inline = (text, keyBase) => {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) parts.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) parts.push(<code key={key} className="px-1 py-0.5 rounded bg-gray-100 text-[0.85em] font-mono">{tok.slice(1, -1)}</code>);
    else parts.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
};

export const renderMarkdown = (src = '') => {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let list = null;
  let code = null;

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    out.push(
      <Tag key={`l${out.length}`} className={`${list.ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1 my-1`}>
        {list.items.map((it, i) => <li key={i}>{inline(it, `li${out.length}-${i}`)}</li>)}
      </Tag>
    );
    list = null;
  };

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (code) {
        out.push(<pre key={`c${idx}`} className="my-2 p-3 rounded-lg bg-navy-900 text-gray-100 text-xs overflow-x-auto"><code>{code.join('\n')}</code></pre>);
        code = null;
      } else {
        flushList();
        code = [];
      }
      return;
    }
    if (code) { code.push(line); return; }

    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (bullet || numbered) {
      const ordered = !!numbered;
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push((bullet || numbered)[1]);
      return;
    }
    flushList();

    const heading = line.match(/^#{1,6}\s+(.*)/);
    if (heading) {
      out.push(<p key={`h${idx}`} className="font-bold mt-2">{inline(heading[1], `h${idx}`)}</p>);
    } else if (line.trim()) {
      out.push(<p key={`p${idx}`} className="my-1">{inline(line, `p${idx}`)}</p>);
    }
  });
  if (code) out.push(<pre key="c-end" className="my-2 p-3 rounded-lg bg-navy-900 text-gray-100 text-xs overflow-x-auto"><code>{code.join('\n')}</code></pre>);
  flushList();
  return out;
};
