const { parse } = require("node-html-parser");

/** Attribute which if found on a heading means the heading is excluded */
const ignoreAttribute = "data-toc-exclude";

const defaults = {
  tags: ["h2", "h3", "h4"],
  ignoredElements: [],
  wrapper: "nav",
  wrapperClass: "toc",
  headingText: "",
  headingTag: "h2",
};

function getParent(prev, current) {
  if (current.level > prev.level) {
    return prev;
  } else if (current.level === prev.level) {
    return prev.parent;
  } else {
    return getParent(prev.parent, current);
  }
}

class Item {
  constructor(el) {
    if (el) {
      this.slug = el.getAttribute("id");
      this.text = el.text.trim();
      this.level = +el.tagName.slice(1);
    } else {
      this.level = 0;
    }
    this.children = [];
  }

  html() {
    let markup = "";
    if (this.slug && this.text) {
      markup += `
                    <li><a href="#${this.slug}">${this.text}</a>
            `;
    }
    if (this.children.length > 0) {
      markup += `
                <ol>
                    ${this.children.map((item) => item.html()).join("\n")}
                </ol>
            `;
    }

    if (this.slug && this.text) {
      markup += "\t\t</li>";
    }

    return markup;
  }
}

class Toc {
  constructor(htmlstring = "", options = defaults) {
    this.options = { ...defaults, ...options };
    const selector = this.options.tags.join(",");
    this.root = new Item();
    this.root.parent = this.root;

    const root = parse(htmlstring || "");
    let headings = root
      .querySelectorAll(selector)
      .filter((el) => el.getAttribute("id"))
      .filter((el) => !el.hasAttribute(ignoreAttribute));

    if (this.options.ignoredElements.length) {
      const ignoredSelector = this.options.ignoredElements.join(",");
      headings.forEach((heading) => {
        heading.querySelectorAll(ignoredSelector).forEach((el) => el.remove());
      });
    }

    if (headings.length) {
      let previous = this.root;
      for (const heading of headings) {
        const current = new Item(heading);
        const parent = getParent(previous, current);
        current.parent = parent;
        parent.children.push(current);
        previous = current;
      }
    }
  }

  get() {
    return this.root;
  }

  html() {
    const { wrapper, wrapperClass, headingText, headingTag } = this.options;
    const root = this.get();

    let html = "";

    if (root.children.length) {
      if (headingText) {
        html += `<${headingTag}>${headingText}</${headingTag}>\n`;
      }

      html += `<${wrapper} class="${wrapperClass}">${root.html()}</${wrapper}>`;
    }

    return html;
  }
}

function tocFilter(content, options = {}) {
  return new Toc(content, options).html();
}

module.exports = Toc;
module.exports.Item = Item;
module.exports.tocFilter = tocFilter;
