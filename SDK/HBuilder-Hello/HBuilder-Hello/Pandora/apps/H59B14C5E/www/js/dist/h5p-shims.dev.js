"use strict";

window.globalThis || (window.globalThis = window);
var h5p = {
  ready: true,
  fnPool: [],
  hook: function hook(fn) {
    h5p.fnPool.push(fn);

    if (h5p.ready) {
      fn();
    }
  },
  runPool: function runPool(opt) {
    h5p.ready = true;
    h5p.ready && h5p.fnPool.forEach(function (fn) {
      fn(opt);
    });
  }
};
window.h5p = h5p;
window.localStorage.setItem("MEIQIA_PANEL_VISIBILITY", "hidden");