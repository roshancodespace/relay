"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  maxHeight?: string;
  showLineNumbers?: boolean;
  hideHeader?: boolean;
  borderless?: boolean;
}

type TokenType =
  | "keyword"
  | "builtin"
  | "string"
  | "number"
  | "boolean"
  | "property"
  | "function"
  | "operator"
  | "punctuation"
  | "comment"
  | "flag"
  | "url"
  | "text";

interface Token {
  type: TokenType;
  content: string;
}

function getTokenClass(type: TokenType): string {
  switch (type) {
    case "keyword":
      return "font-semibold text-[#111111] dark:text-white";
    case "builtin":
      return "font-medium text-[#111111] dark:text-white";
    case "string":
      return "text-zinc-600 dark:text-zinc-400";
    case "number":
      return "text-[#ff6600] dark:text-[#ff771a]";
    case "boolean":
      return "text-[#ff6600] dark:text-[#ff771a] font-medium";
    case "property":
      return "font-medium text-[#111111] dark:text-white";
    case "function":
      return "text-[#111111] dark:text-white";
    case "flag":
      return "font-medium text-[#111111] dark:text-white";
    case "url":
      return "text-zinc-600 dark:text-zinc-300 underline underline-offset-2";
    case "comment":
      return "text-zinc-400 dark:text-zinc-500 italic";
    case "operator":
      return "text-zinc-400 dark:text-zinc-600";
    case "punctuation":
      return "text-zinc-400 dark:text-zinc-600";
    case "text":
    default:
      return "text-zinc-700 dark:text-zinc-300";
  }
}

function tokenizeJsonLine(line: string): Token[] {
  const tokens: Token[] = [];
  const regex = /("(?:\\.|[^"\\])*")(?:\s*(:))?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])|(\/\/.*)|(\s+)|([^"{}[\],\s:]+)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match[1]) {
      if (match[2]) {
        tokens.push({ type: "property", content: match[1] });
        tokens.push({ type: "punctuation", content: ":" });
      } else {
        tokens.push({ type: "string", content: match[1] });
      }
    } else if (match[3]) {
      tokens.push({ type: "boolean", content: match[3] });
    } else if (match[4]) {
      tokens.push({ type: "number", content: match[4] });
    } else if (match[5]) {
      tokens.push({ type: "punctuation", content: match[5] });
    } else if (match[6]) {
      tokens.push({ type: "comment", content: match[6] });
    } else if (match[7]) {
      tokens.push({ type: "text", content: match[7] });
    } else if (match[8]) {
      tokens.push({ type: "text", content: match[8] });
    }
  }
  return tokens.length > 0 ? tokens : [{ type: "text", content: line }];
}

function tokenizeJsLine(line: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:import|export|from|function|return|const|let|var|if|else|new|typeof|async|await|try|catch|finally|throw|class|extends|interface|type)\b)|(\b(?:true|false|null|undefined)\b)|(\b(?:Buffer|crypto|Object|Array|String|Number|Boolean|JSON|Promise|Error)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())|(=>|===|!==|==|!=|<=|>=|\+=|-=|\+\+|--|&&|\|\||[=+\-*/%&|^!<>?:])|([{}()[\];,.]|\$\{|\})|(\s+)|([a-zA-Z_$][a-zA-Z0-9_$]*)|([^a-zA-Z0-9_$\s{}()[\];,."'/`+\-*/%&|^!<>?:=]+)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match[1]) {
      tokens.push({ type: "comment", content: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "string", content: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "keyword", content: match[3] });
    } else if (match[4]) {
      tokens.push({ type: "boolean", content: match[4] });
    } else if (match[5]) {
      tokens.push({ type: "builtin", content: match[5] });
    } else if (match[6]) {
      tokens.push({ type: "number", content: match[6] });
    } else if (match[7]) {
      tokens.push({ type: "function", content: match[7] });
    } else if (match[8]) {
      tokens.push({ type: "operator", content: match[8] });
    } else if (match[9]) {
      tokens.push({ type: "punctuation", content: match[9] });
    } else if (match[10]) {
      tokens.push({ type: "text", content: match[10] });
    } else if (match[11]) {
      tokens.push({ type: "text", content: match[11] });
    } else if (match[12]) {
      tokens.push({ type: "text", content: match[12] });
    }
  }
  return tokens.length > 0 ? tokens : [{ type: "text", content: line }];
}

function tokenizeBashLine(line: string): Token[] {
  if (/^\s*"[^"]+"\s*:/.test(line)) {
    return tokenizeJsonLine(line);
  }

  const tokens: Token[] = [];
  const regex = /(#[^\n]*)|(\bcurl\b)|(-[a-zA-Z]|--[a-zA-Z0-9-]+)|(https?:\/\/[^\s"'`]+)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\\)|(\s+)|([^\s"'`#\\]+)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match[1]) {
      tokens.push({ type: "comment", content: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "keyword", content: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "flag", content: match[3] });
    } else if (match[4]) {
      tokens.push({ type: "url", content: match[4] });
    } else if (match[5]) {
      tokens.push({ type: "string", content: match[5] });
    } else if (match[6]) {
      tokens.push({ type: "operator", content: match[6] });
    } else if (match[7]) {
      tokens.push({ type: "text", content: match[7] });
    } else if (match[8]) {
      tokens.push({ type: "text", content: match[8] });
    }
  }
  return tokens.length > 0 ? tokens : [{ type: "text", content: line }];
}

function highlightLine(line: string, lang: string): Token[] {
  const normalized = lang.toLowerCase();
  if (normalized === "json") {
    return tokenizeJsonLine(line);
  }
  if (normalized === "javascript" || normalized === "js" || normalized === "typescript" || normalized === "ts") {
    return tokenizeJsLine(line);
  }
  if (normalized === "bash" || normalized === "sh" || normalized === "curl" || normalized === "shell") {
    return tokenizeBashLine(line);
  }
  return [{ type: "text", content: line }];
}

export function CodeBlock({
  code,
  language = "json",
  title,
  maxHeight,
  showLineNumbers = true,
  hideHeader = false,
  borderless = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const lines = code.split("\n");
  const displayLineNumbers = showLineNumbers && lines.length > 1;

  return (
    <div className="w-full space-y-1.5 font-sans">
      {!hideHeader && (
        <div className="flex items-center justify-between text-xs pb-1">
          <div className="flex items-center gap-2">
            {language && (
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                {language}
              </span>
            )}
            {title && (
              <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                {title}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            title="Copy code"
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
      )}

      <div
        className={`py-3 ${borderless ? "" : "border-y border-[#e7e7e5] dark:border-white/[0.08]"} font-mono text-[12px] leading-relaxed overflow-x-auto ${maxHeight || ""}`}
      >
        <pre className="whitespace-pre">
          {lines.map((line, lineIndex) => {
            const tokens = highlightLine(line, language);
            return (
              <div key={lineIndex} className="table-row">
                {displayLineNumbers && (
                  <span className="table-cell select-none text-zinc-300 dark:text-zinc-700 pr-4 text-right tabular-nums w-6">
                    {lineIndex + 1}
                  </span>
                )}
                <span className="table-cell">
                  {tokens.map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      className={getTokenClass(token.type)}
                    >
                      {token.content}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
