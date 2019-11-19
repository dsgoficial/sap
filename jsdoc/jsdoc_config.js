module.exports = {
  source: {
    includePattern: ".+\\.js(doc|x)?$",
    include: ["src"],
    exclude: ["node_modules", "docs"]
  },
  plugins: ["plugins/markdown"],
  templates: {
    default: {
      layoutFile: "./jsdoc/layout.html",
      staticFiles: {
        include: ["./jsdoc/style.css"]
      }
    }
  },
  opts: {
    destination: "./src/js_docs/",
    encoding: "utf8",
    recurse: true
  }
};
