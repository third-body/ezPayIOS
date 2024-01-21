"use strict";

window.addEventListener("load", function () {
  /* 空闲处理任务 */
  var time = Date.now();
  var diffs = [];

  var getAverage = function getAverage() {
    return diffs.reduce(function (a, b) {
      return a + b;
    }, 0) / diffs.length;
  };

  var timer = setInterval(function () {
    var now = Date.now();
    if (diffs.length > 20) diffs.shift();
    diffs.push(now - time);
    var average = getAverage();

    if (average > 15.5 && average < 16.5) {
      console.warn("Idle");
      clearInterval(timer);
      if (window.localStorage.getItem("UA")) return;
      var script = document.createElement("script");
      script.src = "js/ua-parser.min.js";

      script.onload = function (e) {
        try {
          window.localStorage.setItem("UA", JSON.stringify(new UAParser(navigator.userAgent).getResult()));
        } catch (e) {
          console.error("\u65E0\u6CD5\u5E8F\u5217\u5316ua");
        }
      };

      document.body && document.body.append && document.body.append(script);
    }

    time = now;
  }, 16);
  /* 空闲处理任务 */
});