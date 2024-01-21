(function (w) {
  var ws = null;
  // 空函数
  function shield() {
    return false;
  }

  document.addEventListener("touchstart", shield, false); //取消浏览器的所有事件，使得active的样式在手机上正常生效
  // document.oncontextmenu = shield; //屏蔽选择函数

  function onPlusReady() {
    ws = plus.webview.currentWebview();
  }

  if (w.plus) {
    onPlusReady();
  } else {
    w.document.addEventListener("plusready", onPlusReady, false);
  }

  // DOMContentLoaded事件处理
  document.addEventListener(
    "DOMContentLoaded",
    function () {
      document.body.onselectstart = shield;
    },
    false
  );

  var openw = null;
  /**
   * 创建新窗口（无原始标题栏），
   * @param {URIString} id : 要打开页面url
   * @param {JSON} ws : Webview窗口属性
   */
  w.createWithoutTitle = function (id, ws) {
    if (openw) {
      //避免多次打开同一个页面
      return null;
    }
    if (w.plus) {
      ws = ws || {};
      ws.scrollIndicator || (ws.scrollIndicator = "none");
      ws.scalable || (ws.scalable = false);
      ws.backButtonAutoControl || (ws.backButtonAutoControl = "close");
      openw = plus.webview.create(id, id, ws);
      openw.addEventListener(
        "close",
        function () {
          openw = null;
        },
        false
      );
      return openw;
    } else {
      w.open(id);
    }
    return null;
  };

  w.createWebView = function (url, id, style, extras) {
    var handler = null;
    if (handler) {
      //避免多次打开同一个页面
      return null;
    }
    if (w.plus) {
      extras = extras || {};
      style = style || {};
      style.scrollIndicator || (style.scrollIndicator = "none");
      style.scalable || (style.scalable = false);
      style.backButtonAutoControl || (style.backButtonAutoControl = "close");
      handler = plus.webview.create(url, id, style, extras);
      handler.addEventListener(
        "close",
        function () {
          handler = null;
        },
        false
      );
      return handler;
    } else {
      w.open(id);
    }
    return null;
  };

  // 返回
  w.back = function (hide) {
    if (w.plus) {
      ws || (ws = plus.webview.currentWebview());
      hide || ws.preate ? ws.hide("auto") : ws.close("auto");
    } else if (history.length > 1) {
      history.back();
    } else {
      w.close();
    }
  };
})(window);
