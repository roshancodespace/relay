const isColorSupported =
  !process.env.NO_COLOR &&
  (process.env.FORCE_COLOR || process.stdout.isTTY || process.env.NODE_ENV !== "production");

// ANSI color escape codes
const c = isColorSupported
  ? {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    gray: "\x1b[90m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    brightGreen: "\x1b[92m",
    brightCyan: "\x1b[96m",
    brightRed: "\x1b[91m",
    brightYellow: "\x1b[93m",
  }
  : {
    reset: "",
    bold: "",
    dim: "",
    gray: "",
    red: "",
    green: "",
    yellow: "",
    blue: "",
    magenta: "",
    cyan: "",
    white: "",
    brightGreen: "",
    brightCyan: "",
    brightRed: "",
    brightYellow: "",
  };

function time(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${c.gray}${h}:${m}:${s}${c.reset}`;
}

function badge(text: string, color: string, width = 10): string {
  const content = `[${text}]`;
  const padded = content.padEnd(width, " ");
  return `${color}${c.bold}${padded}${c.reset}`;
}

function shortId(id: string): string {
  const short = id.length > 8 ? id.slice(0, 8) : id;
  return `${c.cyan}${c.bold}${short}${c.reset}`;
}

export const log = {
  banner(queueName: string, concurrency: number) {
    console.log();
    console.log(`  ${c.magenta}${c.bold}▲ Relay Webhook Worker${c.reset}`);
    console.log(`  ${c.gray}queue${c.reset}       ${c.white}${queueName}${c.reset}`);
    console.log(`  ${c.gray}concurrency${c.reset} ${c.white}${concurrency} jobs${c.reset}`);
    console.log(`  ${c.gray}status${c.reset}      ${c.green}ready and listening${c.reset}`);
    console.log();
  },

  ready(queueName: string, concurrency: number) {
    console.log(
      `${time()} ${badge("relay", c.magenta)} Worker active on ${c.bold}'${queueName}'${c.reset} ${c.gray}(concurrency: ${concurrency})${c.reset}`
    );
  },

  dispatch(deliveryId: string, url: string, attempt: number, maxAttempts: number) {
    console.log(
      `${time()} ${badge("dispatch", c.cyan)} ${shortId(deliveryId)} ${c.gray}→${c.reset} ${c.white}${url}${c.reset} ${c.gray}(attempt ${attempt}/${maxAttempts})${c.reset}`
    );
  },

  success(deliveryId: string, reason: string, durationMs: number) {
    console.log(
      `${time()} ${badge("success", c.brightGreen)} ${shortId(deliveryId)} ${c.green}✓${c.reset} ${reason} ${c.gray}(${durationMs}ms)${c.reset}`
    );
  },

  retry(deliveryId: string, nextAttempt: number, maxAttempts: number, delayMs: number, reason: string) {
    const delaySec = Math.round(delayMs / 1000);
    console.log(
      `${time()} ${badge("retry", c.brightYellow)} ${shortId(deliveryId)} ${c.yellow}↻${c.reset} ${reason} ${c.gray}→ retry ${nextAttempt}/${maxAttempts} in ${delaySec}s${c.reset}`
    );
  },

  failed(deliveryId: string, reason: string) {
    console.log(
      `${time()} ${badge("failed", c.brightRed)} ${shortId(deliveryId)} ${c.red}✕${c.reset} ${reason}`
    );
  },

  skip(deliveryId: string, reason: string) {
    console.log(
      `${time()} ${badge("skip", c.gray)} ${shortId(deliveryId)} ${c.gray}${reason}${c.reset}`
    );
  },

  recovery(count: number) {
    console.log(
      `${time()} ${badge("recovery", c.blue)} ${c.blue}⚡${c.reset} Rescheduled ${c.bold}${count}${c.reset} pending/overdue ${count === 1 ? "delivery" : "deliveries"}`
    );
  },

  info(msg: string) {
    console.log(`${time()} ${badge("info", c.blue)} ${msg}`);
  },

  warn(msg: string) {
    console.warn(`${time()} ${badge("warn", c.yellow)} ${c.yellow}${msg}${c.reset}`);
  },

  error(msg: string, err?: unknown) {
    const errorDetail = err instanceof Error ? err.message : err ? String(err) : "";
    console.error(
      `${time()} ${badge("error", c.red)} ${c.red}${msg}${c.reset}${errorDetail ? ` ${c.gray}${errorDetail}${c.reset}` : ""}`
    );
  },

  shutdown(signal: string) {
    console.log();
    console.log(
      `${time()} ${badge("shutdown", c.magenta)} Received ${signal}. Stopping worker cleanly...`
    );
  },
};
