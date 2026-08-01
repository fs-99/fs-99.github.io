const { getGraph } = require("../../helpers/linkUtils");
const { getFileTree } = require("../../helpers/filetreeUtils");
const { userComputed } = require("../../helpers/userUtils");

function fromNoteProps(data, key) {
  const props = data["dg-note-properties"];
  if (data[key] != null && data[key] !== "") return data[key];
  if (props && props[key] != null && props[key] !== "") return props[key];
  return null;
}

module.exports = {
  graph: async (data) => await getGraph(data),
  filetree: (data) => getFileTree(data),
  userComputed: (data) => userComputed(data),
  noteProps: (data) => data["dg-note-properties"],
  // Digital Garden stores custom props under dg-note-properties when publishing
  created: (data) => fromNoteProps(data, "created"),
  updated: (data) => fromNoteProps(data, "updated"),
};
