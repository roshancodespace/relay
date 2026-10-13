"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";

interface TabSnippet {
  label: string;
  language: string;
  code: string;
}

interface CodeTabsProps {
  snippets: TabSnippet[];
  title?: string;
  defaultIndex?: number;
}

export function CodeTabs({ snippets, title, defaultIndex = 0 }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultIndex);
  const [copied, setCopied] = useState(false);

  if (!snippets || snippets.length === 0) return null;

  const current = snippets[activeTab] || snippets[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  return (
    <div className="my-6 font-sans">
      <div className="flex items-center justify-between border-b border-[#e7e7e5] dark:border-white/[0.08] text-xs">
        <div className="flex items-center gap-4">
          {snippets.map((snip, idx) => (
            <button
              key={snip.label}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`pb-2 text-xs font-mono font-medium transition-colors border-b-2 -mb-px cursor-pointer ${activeTab === idx
                ? "border-[#111111] dark:border-white text-[#111111] dark:text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
            >
              {snip.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pb-2">
          {title && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline">
              {title}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div>
        <CodeBlock
          code={current.code}
          language={current.language}
          showLineNumbers={false}
          hideHeader={true}
          borderless={true}
        />
      </div>
    </div>
  );
}
