#!/usr/bin/env node
/**
 * Fail the build if any published note is missing created or updated dates.
 * Dates may live at the top level or under dg-note-properties (Digital Garden).
 */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const NOTES_DIR = path.join(__dirname, "..", "src", "site", "notes");

function getDate(data, key) {
  if (data[key] != null && data[key] !== "") return data[key];
  const props = data["dg-note-properties"];
  if (props && props[key] != null && props[key] !== "") return props[key];
  return null;
}

function isGardenEntry(data) {
  const tags = data.tags;
  if (!tags) return false;
  if (Array.isArray(tags)) return tags.includes("gardenEntry");
  return String(tags).split(/[,\s]+/).includes("gardenEntry");
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

const missing = [];

for (const file of walk(NOTES_DIR)) {
  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);
  if (!data["dg-publish"]) continue;
  if (isGardenEntry(data)) continue;

  const created = getDate(data, "created");
  const updated = getDate(data, "updated");
  if (!created || !updated) {
    missing.push({
      file: path.relative(path.join(__dirname, ".."), file),
      created: Boolean(created),
      updated: Boolean(updated),
    });
  }
}

if (missing.length) {
  console.error("Published notes are missing created and/or updated dates:\n");
  for (const item of missing) {
    const parts = [];
    if (!item.created) parts.push("created");
    if (!item.updated) parts.push("updated");
    console.error(`  - ${item.file} (missing: ${parts.join(", ")})`);
  }
  console.error(
    "\nSet both under dg-note-properties (or top-level frontmatter), then republish."
  );
  process.exit(1);
}

console.log("All published notes have created and updated dates.");
