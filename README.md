# Redirect Chain Checker (CLI)

A lightweight command-line tool to trace the full HTTP redirect chain of any URL — see every hop, its status code (301, 302, 307, 308), and catch SEO-damaging redirect issues before Google does.

Built by **[FrostRank](https://frostrank.com)** — free SEO & developer tools.

**Prefer a UI?** Use the hosted web version, no install needed:
🔗 **https://frostrank.com/tools/redirect-chain-checker**

More free tools: **https://frostrank.com/tools**

---

## Why this matters

Redirect chains (A → B → C → final) quietly hurt SEO:
- Google may stop following a chain after too many hops, and the final page never gets indexed
- Link equity leaks at every hop
- Mixed 301/302 chains confuse canonical signals

This tool flags both issues automatically.

## Installation

```bash
npm install -g redirect-chain-checker
```

Or run without installing:

```bash
npx redirect-chain-checker https://example.com
```

## Usage

```bash
redirect-chain-checker <url>
```

### Example

```bash
redirect-chain-checker https://example.com/old-page
```

**Output:**

```
Redirect Chain Checker — by FrostRank (https://frostrank.com)

Redirect Chain:

Start: https://example.com/old-page
  Status: 301
  Redirects to: https://example.com/new-page

Hop 1: https://example.com/new-page
  Status: 200

Total hops: 1

Full visual report, history & bulk checks:
https://frostrank.com/tools/redirect-chain-checker

More free SEO & dev tools: https://frostrank.com/tools
```

The tool automatically warns you when:
- **Mixed redirect types** are detected (e.g. a 301 followed by a 302)
- The chain has **4+ hops** (worth flattening to a single redirect)

## Features

- Traces up to 20 redirect hops
- Detects 301, 302, 307, 308 redirects
- Flags mixed redirect-type chains
- Flags long redirect chains
- Zero dependencies — pure Node.js

## Related FrostRank Tools

- [Redirect Chain Checker (web)](https://frostrank.com/tools/redirect-chain-checker)
- [More SEO & Dev Tools](https://frostrank.com/tools)

## License

MIT © [FrostRank](https://frostrank.com)
