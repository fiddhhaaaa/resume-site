import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PATTERN = /\[Client[: ]|YourBrand|yourdomain\.com/;
const found = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (/\.(ts|tsx)$/.test(name)) {
      readFileSync(path, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (PATTERN.test(line)) found.push(`${path}:${i + 1}  ${line.trim()}`);
        });
    }
  }
}

walk("src");

if (found.length > 0) {
  console.log(`${found.length} unfilled placeholder(s):\n`);
  console.log(found.join("\n"));
  process.exit(1);
}
console.log("No placeholders left.");