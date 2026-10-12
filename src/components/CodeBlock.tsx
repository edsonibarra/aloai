const KEYWORDS = new Set(
  "def class return yield from import as if elif else for while in not and or is try except finally with lambda pass raise await async global nonlocal del break continue None True False".split(" "),
);
const BUILTINS = new Set(
  "print len range sum list dict set tuple super property bool round hash type isinstance object int str sorted map".split(" "),
);
const TOKEN = /(#.*$)|("""[\s\S]*?"""|'[^'\n]*'|"[^"\n]*")|(\b\d+(?:\.\d+)?\b)|(@\w+)|(\b[A-Za-z_]\w*\b)/gm;

function highlight(code: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of code.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(code.slice(last, idx));
    const [text, comment, str, num, deco, word] = m;
    let cls: string | null = null;
    if (comment) cls = "tok-com";
    else if (str) cls = "tok-str";
    else if (num) cls = "tok-num";
    else if (deco) cls = "tok-fn";
    else if (word && KEYWORDS.has(word)) cls = "tok-kw";
    else if (word && BUILTINS.has(word)) cls = "tok-builtin";
    else if (word && code[idx + word.length] === "(") cls = "tok-fn";
    out.push(cls ? <span key={key++} className={cls}>{text}</span> : text);
    last = idx + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#0d0820]">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green/80" />
        <span className="ml-2 font-mono text-xs text-muted">snippet.py</span>
      </div>
      <pre className="code-block overflow-x-auto px-4 py-3 text-ink">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
