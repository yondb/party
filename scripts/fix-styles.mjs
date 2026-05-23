import fs from "fs";
import path from "path";

const reps = [
  ["font-display text-xs uppercase tracking-widest", "text-xs font-medium"],
  ["font-display text-sm font-semibold uppercase tracking-[0.12em]", "text-sm font-medium"],
  ["font-display text-sm font-semibold uppercase tracking-[0.1em]", "text-sm font-medium"],
  ["font-display text-[10px] font-semibold uppercase tracking-[0.1em]", "text-xs font-medium"],
  ["font-display text-[10px] uppercase tracking-[0.14em]", "text-xs font-medium"],
  ["font-display text-xs font-semibold uppercase tracking-[0.14em]", "text-xs font-medium"],
  ["font-display text-base font-semibold uppercase tracking-widest", "text-sm font-medium"],
  ["text-xs font-semibold uppercase tracking-widest", "text-xs font-medium"],
  ["font-display text-base font-bold", "text-base font-semibold"],
  ['className="card ', 'className="floating-card '],
  ['className="wow-card ', 'className="floating-card '],
  ["font-display text-sm text-[var(--text-primary)]", "text-sm font-semibold text-[var(--text-primary)]"],
  ["font-display text-[var(--accent)]", "font-semibold text-[var(--accent)]"],
  ["font-display text-[var(--text-primary)]", "font-semibold text-[var(--text-primary)]"],
  ["font-display w-8 text-center text-[var(--accent)]", "w-8 text-center font-semibold text-[var(--accent)]"],
  ["text-xs uppercase tracking-widest", "text-xs font-medium"],
  ["text-xs font-semibold uppercase tracking-wide", "text-xs font-semibold"],
  ["text-center font-display text-sm uppercase tracking-[0.12em]", "text-center text-sm font-medium"],
  ["block font-display text-sm font-semibold", "block text-sm font-semibold"],
];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith(".tsx")) {
      let c = fs.readFileSync(p, "utf8");
      const o = c;
      for (const [a, b] of reps) c = c.split(a).join(b);
      if (c !== o) {
        fs.writeFileSync(p, c);
        console.log("updated", p);
      }
    }
  }
}

walk(".");
