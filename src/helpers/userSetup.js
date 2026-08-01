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

/**
 * Add the dynamic node links to the graph so home stays connected.
 */
function connectHomeToRecentNotes(graph, notes) {
  if (!graph?.nodes) return graph;

  const home =
    graph.nodes[graph.homeAlias] ||
    Object.values(graph.nodes).find((node) => node.home);
  if (!home) return graph;

  if (!Array.isArray(home.outBound)) home.outBound = [];
  if (!Array.isArray(home.neighbors)) home.neighbors = [];
  if (!Array.isArray(graph.links)) graph.links = [];

  for (const item of recentNotes(notes)) {
    const target = graph.nodes[item.url];
    if (!target || target.url === home.url) continue;

    if (!home.outBound.includes(target.url)) home.outBound.push(target.url);
    if (!home.neighbors.includes(target.url)) home.neighbors.push(target.url);

    if (!Array.isArray(target.neighbors)) target.neighbors = [];
    if (!Array.isArray(target.backLinks)) target.backLinks = [];
    if (!target.neighbors.includes(home.url)) target.neighbors.push(home.url);
    if (!target.backLinks.includes(home.url)) target.backLinks.push(home.url);

    const alreadyLinked = graph.links.some(
      (link) => link.source === home.id && link.target === target.id
    );
    if (!alreadyLinked) {
      graph.links.push({ source: home.id, target: target.id });
    }

    target.size = target.neighbors.length;
  }

  home.size = home.neighbors.length;
  return graph;
}

function userEleventySetup(eleventyConfig) {
  eleventyConfig.addFilter("recentNotes", recentNotes);
}

exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
exports.recentNotes = recentNotes;
exports.connectHomeToRecentNotes = connectHomeToRecentNotes;
