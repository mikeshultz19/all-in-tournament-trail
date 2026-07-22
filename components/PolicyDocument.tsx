import type { ReactNode } from "react";
import Link from "next/link";

interface PolicyDocumentProps {
  source: string;
  version: string;
  status: string;
  effectiveDate: string;
  returnHref?: string;
  returnLabel?: string;
}

type Block =
  | { type: "heading"; level: number; text: string; id?: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "table"; rows: string[][] };

const inlinePattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(inlinePattern).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="break-words bg-white/10 px-1.5 py-0.5 text-[0.9em] text-neutral-200">{part.slice(1, -1)}</code>;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return <Link key={index} href={link[2]} className="font-semibold text-yellow-400 underline decoration-yellow-400/50 underline-offset-4 transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400">{link[1]}</Link>;
    }

    return part;
  });
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  let pendingAnchor: string | undefined;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("<!--")) {
      while (index < lines.length) {
        const commentLine = lines[index].trim();
        index += 1;
        if (commentLine.endsWith("-->") || commentLine.includes("-->")) break;
      }
      continue;
    }

    if (/^\*\*(?:Version|Status|Effective Date|Last Updated):\*\*/.test(line)) {
      index += 1;
      continue;
    }

    const anchor = line.match(/^<a id="([^"]+)"><\/a>$/);
    if (anchor) {
      pendingAnchor = anchor[1];
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2], id: pendingAnchor });
      pendingAnchor = undefined;
      index += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      const rows = tableLines
        .map((row) => row.slice(1, -1).split("|").map((cell) => cell.trim()))
        .filter((_, rowIndex) => rowIndex !== 1);
      blocks.push({ type: "table", rows });
      continue;
    }

    const unorderedItem = line.match(/^-\s+(.+)$/);
    if (unorderedItem) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(/^-\s+(.+)$/);
        if (!item) break;
        let text = item[1];
        index += 1;
        while (index < lines.length && lines[index].trim() && !/^(?:-|\d+\.|#|>|\| |<a )/.test(lines[index].trim())) {
          text += ` ${lines[index].trim()}`;
          index += 1;
        }
        items.push(text);
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    const orderedItem = line.match(/^\d+\.\s+(.+)$/);
    if (orderedItem) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(/^\d+\.\s+(.+)$/);
        if (!item) break;
        let text = item[1];
        index += 1;
        while (index < lines.length && lines[index].trim() && !/^(?:-|\d+\.|#|>|\| |<a )/.test(lines[index].trim())) {
          text += ` ${lines[index].trim()}`;
          index += 1;
        }
        items.push(text);
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(?:#{1,6}\s|<a id=|>\s?|\| |-|\d+\.)/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PolicyDocument({ source, version, status, effectiveDate, returnHref = "/register", returnLabel = "Return to Registration" }: PolicyDocumentProps) {
  const blocks = parseBlocks(source);

  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <Link href={returnHref} className="inline-flex min-h-11 items-center text-sm font-black uppercase tracking-[0.12em] text-yellow-400 transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400">
        ← {returnLabel}
      </Link>

      <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-y border-white/10 py-4 text-sm">
        <div><dt className="font-black uppercase tracking-wide text-neutral-500">Version</dt><dd className="mt-1 font-semibold text-white">{version}</dd></div>
        <div><dt className="font-black uppercase tracking-wide text-neutral-500">Status</dt><dd className="mt-1 font-semibold text-[#D4A017]">{status}</dd></div>
        <div><dt className="font-black uppercase tracking-wide text-neutral-500">Effective Date</dt><dd className="mt-1 font-semibold text-white">{effectiveDate}</dd></div>
      </dl>

      <div className="mt-7 min-w-0">
        {blocks.map((block, index) => {
          if (block.type === "heading") {
            const id = block.id ?? slugify(block.text.replace(/^\d+\.\s*/, ""));
            if (block.level === 1) return <h1 key={index} id={id} className="scroll-mt-28 text-3xl font-black uppercase leading-tight tracking-tight text-red-500 sm:text-5xl">{renderInline(block.text)}</h1>;
            if (block.level === 2) return <h2 key={index} id={id} className="mt-10 scroll-mt-28 border-t border-white/10 pt-9 text-2xl font-black uppercase leading-tight tracking-tight text-white first:mt-0 first:border-t-0 first:pt-0 sm:text-3xl">{renderInline(block.text)}</h2>;
            return <h3 key={index} id={id} className="scroll-mt-28 pt-3 text-lg font-black uppercase tracking-wide text-[#D4A017] sm:text-xl">{renderInline(block.text)}</h3>;
          }

          if (block.type === "paragraph") return <p key={index} className="mt-4 max-w-[75ch] text-base leading-7 text-neutral-300">{renderInline(block.text)}</p>;
          if (block.type === "quote") return <blockquote key={index} className="mt-5 border-l-4 border-red-600 bg-[#151515] px-5 py-4 text-base leading-7 text-neutral-200">{renderInline(block.text)}</blockquote>;
          if (block.type === "unordered-list") return <ul key={index} className="mt-4 max-w-[75ch] list-disc space-y-2 pl-6 text-base leading-7 text-neutral-300 marker:text-red-500">{block.items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ul>;
          if (block.type === "ordered-list") return <ol key={index} className="mt-4 max-w-[75ch] list-decimal space-y-2 pl-6 text-base leading-7 text-neutral-300 marker:font-bold marker:text-red-500">{block.items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ol>;

          return (
            <div key={index} className="mt-5 max-w-full overflow-x-auto border border-white/10">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm text-neutral-300">
                <thead className="bg-[#171717] text-xs uppercase tracking-wide text-[#D4A017]"><tr>{block.rows[0]?.map((cell) => <th key={cell} scope="col" className="border-b border-white/10 px-4 py-3">{renderInline(cell)}</th>)}</tr></thead>
                <tbody>{block.rows.slice(1).map((row, rowIndex) => <tr key={rowIndex} className="border-t border-white/10">{row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`} className="px-4 py-3 align-top">{renderInline(cell)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="mt-12 border-t border-white/10 pt-7">
        <Link href={returnHref} className="inline-flex min-h-11 items-center text-sm font-black uppercase tracking-[0.12em] text-yellow-400 transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400">
          ← {returnLabel}
        </Link>
      </div>
    </article>
  );
}
