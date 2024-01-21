(function (w) {
  var fnStack = {};

  // 空函数
  function shield() {
    return false;
  }

  var fnIdentify = 1;
  w.h5p.on = function (event, fn) {
    fnIdentify += 1;
    fn._fnIdentify = fnIdentify;
    var eventFnQueue = fnStack[event];
    fn = fn || shield;
    if (eventFnQueue) {
      fnStack[event].push(fn);
    } else {
      fnStack[event] = [fn];
    }
  };
  w.h5p.emit = function (event, load) {
    var eventFnQueue = fnStack[event];
    if (eventFnQueue) {
      fnStack[event].forEach(function (fn) {
        try {
          fn(load);
        } catch (e) {
          console.error(e);
        }
      });
    }
  };
  w.h5p.remove = function (event, fn) {
    var eventFnQueue = fnStack[event];
    if (eventFnQueue) {
      var index = -1;
      fnStack[event].forEach(function (_fn, _index) {
        if (_fn._fnIdentify === fn._fnIdentify) {
          index = _index;
        }
      });
      if (index > -1) {
        fnStack[event].splice(index, 1);
      }
    }
  };
  w.h5p.once = function (event, fn) {
    var decoratedFn = function (load) {
      fn(load);
      w.h5p.remove(event, decoratedFn);
    };
    w.h5p.on(event, decoratedFn);
  };

  function onPlusReady() {
    // w.XMLHttpRequest = plus.net.XMLHttpRequest;
    // 加载页面，运行钩子
    w.h5p.openCustomerService = openCustomerService;
    w.h5p.startQrcodeScan = startQrcodeScan;
    w.h5p.uploadImage = uploadImage;
    w.h5p.upload = upload;
    w.h5p.downWgt = downWgt;
    w.h5p.closeSplash = closeSplash;
    w.h5p.installWgt = installWgt;
    w.h5p.h5pFetch = h5pFetch;
    w.h5p.beep = function () {
      plus.device.beep();
      plus.device.vibrate();
    };
    // 注入参数
    // 获取手机唯一码 uuid,设备型号，操作系统
    // 传入schema参数
    getUUID(function (uuid) {
      getVersion(function (appid) {
        var schemaArguments = checkArguments();
        var info = {
          schemaArguments,
          uuid,
          appid,
          ...getDeviceModelAndSystem(),
        };
        try {
          console.log(JSON.stringify(info));
        } catch (error) {
          console.error(error);
        }
        w.h5p.runPool(info);
      });
    });
    // 其他内容处理
    try {
      plus.key.addEventListener("backbutton", function (e) {
        // 忽略返回按钮
      });

      if (plus.os.name != "Android") {
        return;
      }
      // 安卓中利用播放音乐保活app
      var audioHandler = plus.audio.createPlayer("/assets/audio/10-seconds-of-silence.mp3");
      audioHandler.addEventListener("ended", function () {
        // console.log("静音播放结束");
        playSilence();
      });
      audioHandler.addEventListener("stop", function () {
        // console.log("静音播放停止");
      });
      audioHandler.addEventListener("error", function () {
        // console.log("静音播放失败");
      });
      audioHandler.addEventListener("waiting", function () {
        // console.log("静音加载中");
      });
      audioHandler.addEventListener("canplay", function () {
        // console.log("静音可以播放");
        playSilence();
      });
      var playSilence = function () {
        // plus.device.setVolume(0.1);
        audioHandler.play(
          function () {
            // console.log("静音播放中");
          },
          function (e) {
            // console.log(e, "播放失败");
          }
        );
      };

      playSilence();
    } catch (e) {}
  }

  if (w.plus) {
    onPlusReady();
  } else {
    w.document.addEventListener("plusready", onPlusReady, false);
  }

  // w.document.addEventListener(
  //   "resume",
  //   function () {
  //     console.log("event:resume");
  //     checkArguments();
  //   },
  //   false
  // );
  w.document.addEventListener(
    "newintent",
    function () {
      console.log("event:newintent");
      checkArguments();
    },
    false
  );
  // w.document.addEventListener(
  //   "foreground",
  //   function () {
  //     console.log("event:foreground");
  //     checkArguments();
  //   },
  //   false
  // );

  // function createTestPage() {
  // 	createWithoutTitle("plus/test.html", {
  // 		width: "100%",
  // 		height: "65%",
  // 		left: 0,
  // 		bottom: 0,
  // 	})
  // }

  function closeSplash() {
    var has = plus.navigator.hasSplashscreen();
    if (has) {
      plus.navigator.closeSplashscreen();
    }
    plus.navigator.hasShortcut({}, function (e) {
      if (e.result === "none") {
        try {
          plus.navigator.createShortcut(
            {
              name: "VipPay",
              toast: "",
            },
            shield
          );
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  function upload({ url, filePath, fileKey, options, headers, callback }) {
    options = options || {};
    headers = headers || {};
    callback = callback || shield;
    var task = plus.uploader.createUpload(
      url,
      {
        method: "POST",
      },
      function (upload, status) {
        if (status == 200) {
          callback(true, upload);
        } else {
          callback(false, upload);
        }
      }
    );
    task.addFile(filePath, {
      key: fileKey,
    });
    Object.entries(options).forEach(function (arr) {
      return task.addFile(arr[0], arr[1]);
    });
    Object.entries(headers).forEach(function (arr) {
      return task.setRequestHeader(arr[0], arr[1]);
    });
    task.start();
  }

  // 获取版本号
  function getVersion(cb) {
    plus.runtime.getProperty(plus.runtime.appid, function (inf) {
      var wgtVer = inf.version;
      console.log("当前应用版本：" + wgtVer);
      cb(inf.version);
    });
  }

  // 删除
  function deleteFile(path, callback) {
    plus.io.resolveLocalFileSystemURL(
      path,
      function (entry) {
        entry.removeRecursively &&
          entry.removeRecursively(
            function (entry) {
              callback(true);
            },
            function (e) {
              console.error(e.message);
              callback(false, e.message);
            }
          );
      },
      function () {
        console.error("读取目录失败：" + e.message);
        callback(false, "读取目录失败：" + e.message);
      }
    );
  }

  // 下载更新包
  function downWgt(wgtUrl, cb) {
    plus.downloader
      .createDownload(
        wgtUrl,
        {
          filename: "_doc/update/",
        },
        function (d, status) {
          if (status == 200) {
            console.log("下载wgt成功：" + d.filename);
            plus.storage.setItem("wgtPackName", d.filename);
            cb(true, function (installCb) {
              installWgt(d.filename, function (ok) {
                installCb && installCb(ok);
              }); // 安装wgt包
            });
          } else {
            console.log("下载wgt失败！");
            cb(false);
          }
        }
      )
      .start();
  }

  // 更新应用资源
  function installWgt(path, cb) {
    plus.storage.removeItem("downloadedCv");
    plus.runtime.install(
      path,
      {},
      function () {
        console.log("安装wgt文件成功！");
        // 删除wgt文件
        deleteFile(path, shield);
        plus.nativeUI.closeWaiting();
        plus.nativeUI.alert("应用资源更新完成！", function () {
          cb(true);
        });
      },
      function (e) {
        console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
        // 删除wgt文件
        deleteFile(path, shield);
        cb(false);
      }
    );
  }

  /**
   * 创建uuid
   * @returns
   */
  function createUUID() {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }

  // 获取设备信UUID
  function getUUID(cb) {
    function makeUUID(uuid) {
      uuid = "";
      uuid = uuid || plus.storage.getItem("UUID");
      if (!uuid) {
        uuid = createUUID();
        plus.storage.setItem("UUID", uuid);
      }
      cb(uuid);
    }

    plus.device.getInfo({
      success(e) {
        makeUUID(e.uuid);
      },
      fail() {
        makeUUID(plus && plus.device && plus.device.uuid);
      },
    });
  }
  // 获取 device-model and system
  function getDeviceModelAndSystem() {
    return {
      system: plus.os.name,
      version: plus.os.version,
      model: plus.device.model,
    };
  }

  // 开始扫描
  function startQrcodeScan(cb) {
    var openw = createWithoutTitle("plus/qrcode.html", {
      width: "100%",
      height: "65%",
      left: 0,
      bottom: 0,
    });
    w.h5p.once("scand-qrcode", function (res) {
      console.log(res);
      cb(res);
    });

    return function back() {
      openw && openw.close();
    };
  }

  // 获取app唤起传参
  function checkArguments(type) {
    if (!window.plus) return;
    var args = plus.runtime.arguments;
    console.log(args, "launcher:", plus.runtime.launcher);
    w.h5p.emit("arguments", args);
    return args;
  }

  // 上传图片操作
  function uploadImage(cb, isFilePath) {
    plus.nativeUI.actionSheet(
      {
        title: "选择获取图片方式",
        cancel: "取消",
        buttons: [
          {
            color: "#333",
            title: "相机",
          },
          {
            color: "#333",
            title: "系统相册",
          },
        ],
      },
      function (e) {
        if (e.index == 0) {
          return cb(false);
        }
        if (e.index === 1) {
          // 摄像头
          var cmr = plus.camera.getCamera();
          cmr.supportedImageFormats;
          cmr.captureImage(
            function (filePath /* 拍照或摄像操作保存的文件路径 */) {
              if (isFilePath) return cb(filePath);
              // 得到图片路径
              readFile(filePath, function (blob, name, type) {
                cb(blob, name, type, filePath);
              });
            },
            function (err) {
              // 失败
              console.error(err);
              cb(false);
            },
            {
              filename: "_doc/camera/",
              format: "png",
              index: 1,
              optimize: true,
            }
          );
          return;
        }
        if (e.index === 2) {
          // 相册
          pickImage(function (filePath) {
            if (isFilePath) return cb(filePath);
            if (filePath) {
              readFile(filePath, function (blob, name, type) {
                cb(blob, name, type, filePath);
              });
            } else {
              cb(false);
            }
          });
        }
      }
    );
  }

  // 选取图片
  function pickImage(cb) {
    plus.gallery.pick(
      function (path) {
        cb(path);
      },
      function (err) {
        console.error(err);
        cb(false);
      }
    );
  }

  // 读取图片文件
  function readFile(path, cb) {
    plus.io.resolveLocalFileSystemURL(
      path,
      function (entry) {
        entry.file(function (evt) {
          var reader = new plus.io.FileReader();
          reader.readAsDataURL(evt);
          reader.onloadend = function (e) {
            // console.log(reader.result);
            var blob = base64toBlob(reader.result, "UTF-8");
            cb(blob, evt.name, evt.type);
          };
          //Base64转二进制
          function base64toBlob(base64, type) {
            // 将base64转为Unicode规则编码,切记需要将头部文件类型做截取
            var bstr = atob(base64.substring(base64.indexOf(",") + 1), type),
              n = bstr.length,
              u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n); // 转换编码后才可以使用charCodeAt 找到Unicode编码
            }
            return new Blob([u8arr], {
              type,
            });
          }
        });
      },
      function (err) {
        console.error(err);
        cb(false);
      }
    );
  }

  /**
   * 打开客服页面
   * @param { String } url
   */
  function openCustomerService(url) {
    var kfService = createWebView(url, "kfService", {
      width: "100%",
      height: "65%",
      left: 0,
      bottom: 0,
    });
    kfService.show();
    return function () {
      kfService.close();
    };
  }

  function encodeFormData(data) {
    if (!data) return "";
    if (window.$) return $.param(data);
    var pairs = [];
    for (var name in data) {
      if (!data.hasOwnProperty(name)) continue;
      if (typeof data[name] === "function") continue;
      if (!data[name]) continue;
      var value = data[name].toString();
      name = encodeURIComponent(name.replace("%20", "+"));
      value = encodeURIComponent(value.replace("%20", "+"));
      pairs.push(name + "=" + value);
    }
    return pairs.join("&");
  }
  /**
   * url 必须是 / 开头 或是一段完整的地址
   * @param {*} config
   * @param {*} opt
   */
  function h5pFetch(config, opt) {
    config.url = config.url || "";
    var url = config.url.startsWith("/") ? (h5pFetch.baseUrl || "") + config.url : config.url;
    var method = config.method || "GET";
    var data, params;

    switch (method.toUpperCase()) {
      case "POST":
      case "PUT":
      case "PATCH":
        data = config.data;
        break;
      default:
        params = config.data;
        break;
    }

    var xhr = new plus.net.XMLHttpRequest();
    xhr.ontimeout = 20000;
    xhr.onprogress = function (e) {
      if (opt && opt.onUploadProgress) opt.onUploadProgress(e);
    };
    xhr.onabort = function (e) {
      opt && opt.fail(e, "请求abort");
    };
    xhr.onerror = function (e) {
      opt && opt.fail(e, "请求错误");
    };
    xhr.ontimeout = function (e) {
      opt && opt.fail(e, "请求超时");
    };
    xhr.onreadystatechange = function () {
      switch (xhr.readyState) {
        case 0:
          console.log(`xhr请求[${url}]已初始化`);
          break;
        case 1:
          console.log(`xhr请求[${url}]已打开`);
          break;
        case 2:
          console.log(`xhr请求[${url}]已发送`);
          break;
        case 3:
          console.log(`xhr请求[${url}]已响应`);
          break;
        case 4:
          /**
           * url,
            JSON.stringify(opt),
            xhr.status,
            xhr.responseText,
            xhr.statusText,
           */
          console.log(`
          >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
          Api请求路径:[${url}]
          Api请求methods:[${method}]
          Api请求config:[${JSON.stringify(config)}]
          Api请求data:[${encodeFormData(data)}]
          Api请求opt:[${JSON.stringify(opt)}]
          Api请求状态:[${xhr.status}]
          Api请求状态文字:[${xhr.statusText}]
          Api请求返回数据:[${xhr.responseText}]
          >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
          `);
          if (xhr.status == 200) {
            opt && opt.success(xhr.status, xhr.responseText, xhr.statusText, null);
          } else {
            opt && opt.success(xhr.status, xhr.responseText, xhr.statusText, "请求失败");
          }
          break;
        default:
          break;
      }
    };

    if (!!params) {
      url = url + "?" + encodeFormData(params);
    }

    xhr.open(method, url);

    if (opt && opt.headers && opt.headers.length > 0) {
      opt.headers.forEach(function (arr) {
        xhr.setRequestHeader(arr[0], arr[1]);
      });
    }
    if (method == "POST") {
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(encodeFormData(data));
    } else {
      xhr.send();
    }
  }
})(window);
