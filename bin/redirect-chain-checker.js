#!/usr/bin/env node

/**
 * Redirect Chain Checker (CLI)
 * Traces the full HTTP redirect chain for a given URL and prints
 * each hop with its status code, so you can spot redirect loops,
 * mixed 301/302 chains, and SEO-damaging redirect hops.
 *
 * Part of the FrostRank Tools suite: https://frostrank.com/tools
 * Full web version (no install needed):
 * https://frostrank.com/tools/redirect-chain-checker
 *
 * Usage:
 *   redirect-chain-checker <url>
 *   redirect-chain-checker https://example.com
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");

const MAX_REDIRECTS = 20;

function colorize(code) {
  if (code >= 200 && code < 300) return `\x1b[32m${code}\x1b[0m`; // green
  if (code >= 300 && code < 400) return `\x1b[33m${code}\x1b[0m`; // yellow
  if (code >= 400) return `\x1b[31m${code}\x1b[0m`; // red
  return code;
}

function fetchOnce(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === "http:" ? http : https;

    const req = client.request(
      parsed,
      { method: "HEAD", timeout: 10000 },
      (res) => {
        resolve({
          url: targetUrl,
          statusCode: res.statusCode,
          location: res.headers.location || null,
        });
        res.resume();
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Request timed out: ${targetUrl}`));
    });

    req.on("error", (err) => reject(err));
    req.end();
  });
}

async function traceRedirectChain(startUrl) {
  const chain = [];
  let currentUrl = startUrl;
  let redirectType = null; // tracks 301 vs 302 mix

  for (let i = 0; i < MAX_REDIRECTS; i++) {
    let result;
    try {
      result = await fetchOnce(currentUrl);
    } catch (err) {
      chain.push({ url: currentUrl, statusCode: "ERR", error: err.message });
      break;
    }

    chain.push(result);

    if (result.statusCode === 301 || result.statusCode === 302 || result.statusCode === 307 || result.statusCode === 308) {
      if (redirectType && redirectType !== result.statusCode) {
        chain.mixedTypes = true;
      }
      redirectType = result.statusCode;

      if (!result.location) break;

      // Resolve relative redirects against the current URL
      currentUrl = new URL(result.location, currentUrl).toString();
      continue;
    }

    break; // final destination reached (2xx, 4xx, 5xx)
  }

  return chain;
}

function printChain(chain) {
  console.log("\nRedirect Chain:\n");

  chain.forEach((hop, index) => {
    const prefix = index === 0 ? "Start" : `Hop ${index}`;
    if (hop.error) {
      console.log(`${prefix}: ${hop.url}\n  -> ERROR: ${hop.error}\n`);
      return;
    }
    console.log(`${prefix}: ${hop.url}`);
    console.log(`  Status: ${colorize(hop.statusCode)}${hop.location ? `\n  Redirects to: ${hop.location}` : ""}\n`);
  });

  const hopCount = chain.length - 1;
  console.log(`Total hops: ${hopCount}`);

  if (chain.mixedTypes) {
    console.log("\x1b[33mWarning: mixed 301/302 redirects detected in this chain — this can confuse canonical signals.\x1b[0m");
  }
  if (hopCount > 3) {
    console.log("\x1b[33mWarning: long redirect chain (4+ hops) — consider flattening this to a single redirect.\x1b[0m");
  }

  console.log("\nFull visual report, history & bulk checks:");
  console.log("https://frostrank.com/tools/redirect-chain-checker\n");
  console.log("More free SEO & dev tools: https://frostrank.com/tools\n");
}

async function main() {
  const inputUrl = process.argv[2];

  console.log("\nRedirect Chain Checker — by FrostRank (https://frostrank.com)");

  if (!inputUrl) {
    console.log("\nUsage: redirect-chain-checker <url>");
    console.log("Example: redirect-chain-checker https://example.com\n");
    process.exit(1);
  }

  let normalizedUrl = inputUrl;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    const chain = await traceRedirectChain(normalizedUrl);
    printChain(chain);
  } catch (err) {
    console.error(`\nFailed to check URL: ${err.message}\n`);
    process.exit(1);
  }
}

main();
