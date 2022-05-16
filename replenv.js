const jsdom = require("jsdom");

const dom = new jsdom.JSDOM();

Object.assign(global, {
  window: dom.window,
  document: dom.window.document,
  DocumentFragment: dom.window.DocumentFragment,
  Node: dom.window.Node,
});

const jsxdom = require(".");

Object.assign(global, jsxdom);
