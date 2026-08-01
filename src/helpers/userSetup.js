function userMarkdownSetup(md) {
  // The md parameter stands for the markdown-it instance used throughout the site generator.
  // Feel free to add any plugin you want here instead of /.eleventy.js
}

function parseNoteDate(value) {
  if (!value) return 0;
  const t = Date.parse(String(value));
  return Number.isNaN(t) ? 0 : t;
}

function recentNotes(notes, limit = 300) {
  if (!Array.isArray(notes)) return [];
  const items = notes
    .filter((note) => {
      const tags = note.data?.tags || [];
      if (tags.includes("gardenEntry")) return false;
      if (note.data?.hide) return false;
      return Boolean(note.data?.updated || note.data?.created);
    })
    .map((note) => ({
      title: note.data.title || note.fileSlug,
      url: note.url,
      updated: note.data.updated || null,
      created: note.data.created || null,
      sortKey: parseNoteDate(note.data.updated || note.data.created),
    }))
    .sort((a, b) => b.sortKey - a.sortKey);

  const n = Number(limit);
  return Number.isFinite(n) && n > 0 ? items.slice(0, n) : items;
}

function userEleventySetup(eleventyConfig) {
  eleventyConfig.addFilter("recentNotes", recentNotes);
}

exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
exports.recentNotes = recentNotes;
