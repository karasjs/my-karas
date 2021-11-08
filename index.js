(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('karas')) :
  typeof define === 'function' && define.amd ? define(['exports', 'karas'], factory) :
  (global = global || self, factory(global.karas = {}, global.karas));
}(this, (function (exports, karas) { 'use strict';

  karas = karas && Object.prototype.hasOwnProperty.call(karas, 'default') ? karas['default'] : karas;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    return function () {
      var Super = _getPrototypeOf(Derived),
          result;

      if (_isNativeReflectConstruct()) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  var version = "0.62.4";

  var toString = {}.toString;
  var isFunction = function isFunction(obj) {
    return toString.call(obj) === '[object CallbackFunction]' || toString.call(obj) === '[object Function]';
  };

  var CANVAS = {};
  function injectCanvas1(karas, createVd, Root) {
    var newRoot = /*#__PURE__*/function (_Root) {
      _inherits(newRoot, _Root);

      var _super = _createSuper(newRoot);

      function newRoot() {
        _classCallCheck(this, newRoot);

        return _super.apply(this, arguments);
      }

      _createClass(newRoot, [{
        key: "refresh",
        value: function refresh(cb, isFirst) {
          var self = this;
          var ctx = self.ctx; // 小程序bug，可能restore失败，刷新前手动restore下

          ctx.restore();

          function wrap() {
            ctx.draw && ctx.draw(true, function () {
              self.emit('myRefresh');
            });
          }

          _get(_getPrototypeOf(newRoot.prototype), "refresh", this).call(this, wrap, isFirst);
        }
      }]);

      return newRoot;
    }(Root);

    karas.createVd = function (tagName, props, children) {
      if (['canvas', 'svg'].indexOf(tagName) > -1) {
        return new newRoot(tagName, props, children);
      }

      return createVd(tagName, props, children);
    };

    var IMG = karas.inject.IMG;
    var INIT = karas.inject.INIT;
    var LOADING = karas.inject.LOADING;
    var LOADED = karas.inject.LOADED;

    karas.inject.checkSupportFontFamily = function () {
      return false;
    };

    karas.inject.measureImg = function (url, cb) {
      var optinos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (url.indexOf('data:') === 0) {
        var _optinos$width = optinos.width,
            width = _optinos$width === void 0 ? {} : _optinos$width,
            _optinos$height = optinos.height,
            height = _optinos$height === void 0 ? {} : _optinos$height;
        cb({
          success: true,
          width: width.value,
          height: height.value,
          url: url,
          source: url
        });
        return;
      }

      var cache = IMG[url] = IMG[url] || {
        state: INIT,
        task: []
      };

      if (cache.state === LOADED) {
        cb(cache);
      } else if (cache.state === LOADING) {
        cache.task.push(cb);
      } else {
        cache.state = LOADING;
        cache.task.push(cb);
        my.getImageInfo({
          src: url,
          success: function success(res) {
            cache.state = LOADED;
            cache.success = true;
            cache.width = res.width;
            cache.height = res.height;
            cache.source = url;
            cache.url = url;
            var list = cache.task.splice(0);
            list.forEach(function (cb) {
              return cb(cache);
            });
          },
          fail: function fail() {
            cache.state = LOADED;
            cache.success = false;
            cache.url = url;
            var list = cache.task.splice(0);
            list.forEach(function (cb) {
              return cb(cache);
            });
          }
        });
      }
    };

    karas.inject.isDom = function (o) {
      return o && (o.getContext || o.arc);
    };

    karas.inject.hasCacheCanvas = function (key) {
      return key && CANVAS.hasOwnProperty(key);
    };

    karas.inject.getCacheCanvas = function (w, h, key, message) {
      if (message) {
        key = message;
      } // console.log(message,CANVAS);


      if (!CANVAS[key]) {
        throw new Error('Need a cache canvas');
      }

      var o = CANVAS[key];
      return {
        ctx: o,
        canvas: o,
        draw: function draw() {
          o.draw(true);
        }
      };
    };

    karas.inject.setCacheCanvas = function (k, v) {
      CANVAS[k] = v;
    };

    karas.inject.releaseCacheCanvas = function (o) {
    };

    karas.inject.delCacheCanvas = function (key) {
      key && delete CANVAS[key];
    };
  }

  var CANVAS$1 = {};
  function injectCanvas1$1(karas, createVd, Root) {
    var newRoot = /*#__PURE__*/function (_Root) {
      _inherits(newRoot, _Root);

      var _super = _createSuper(newRoot);

      function newRoot() {
        _classCallCheck(this, newRoot);

        return _super.apply(this, arguments);
      }

      _createClass(newRoot, [{
        key: "refresh",
        value: function refresh(cb, isFirst) {
          var self = this;
          var ctx = self.ctx; // 小程序bug，可能restore失败，刷新前手动restore下

          ctx.restore();

          function wrap() {
            ctx.draw && ctx.draw(false, function () {
              self.emit('myRefresh');
            });
          }

          _get(_getPrototypeOf(newRoot.prototype), "refresh", this).call(this, wrap, isFirst);
        }
      }]);

      return newRoot;
    }(Root);

    karas.createVd = function (tagName, props, children) {
      if (['canvas', 'svg'].indexOf(tagName) > -1) {
        return new newRoot(tagName, props, children);
      }

      return createVd(tagName, props, children);
    };

    var IMG = karas.inject.IMG;
    var INIT = karas.inject.INIT;
    var LOADING = karas.inject.LOADING;
    var LOADED = karas.inject.LOADED;

    karas.inject.checkSupportFontFamily = function () {
      return false;
    };

    karas.inject.measureImg = function (url, cb) {
      var optinos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (url.indexOf('data:') === 0) {
        var _optinos$width = optinos.width,
            width = _optinos$width === void 0 ? {} : _optinos$width,
            _optinos$height = optinos.height,
            height = _optinos$height === void 0 ? {} : _optinos$height;
        cb({
          success: true,
          width: width.value,
          height: height.value,
          url: url,
          source: url
        });
        return;
      }

      var cache = IMG[url] = IMG[url] || {
        state: INIT,
        task: []
      };

      if (cache.state === LOADED) {
        cb(cache);
      } else if (cache.state === LOADING) {
        cache.task.push(cb);
      } else {
        cache.state = LOADING;
        cache.task.push(cb);
        my.getImageInfo({
          src: url,
          success: function success(res) {
            cache.state = LOADED;
            cache.success = true;
            cache.width = res.width;
            cache.height = res.height;
            cache.source = url;
            cache.url = url;
            var list = cache.task.splice(0);
            list.forEach(function (cb) {
              return cb(cache);
            });
          },
          fail: function fail() {
            cache.state = LOADED;
            cache.success = false;
            cache.url = url;
            var list = cache.task.splice(0);
            list.forEach(function (cb) {
              return cb(cache);
            });
          }
        });
      }
    };

    karas.inject.isDom = function (o) {
      return o && (o.getContext || o.arc);
    };

    karas.inject.hasCacheCanvas = function (key) {
      return key && CANVAS$1.hasOwnProperty(key);
    };

    karas.inject.getCacheCanvas = function (w, h, key, message) {
      if (message) {
        key = message;
      } // console.log(message,CANVAS);


      if (!CANVAS$1[key]) {
        throw new Error('Need a cache canvas');
      }

      var o = CANVAS$1[key];
      return {
        ctx: o,
        canvas: o,
        draw: function draw() {
          o.draw(false);
        }
      };
    };

    karas.inject.setCacheCanvas = function (k, v) {
      CANVAS$1[k] = v;
    };

    karas.inject.releaseCacheCanvas = function (o) {
    };

    karas.inject.delCacheCanvas = function (key) {
      key && delete CANVAS$1[key];
    };
  }

  function recursion(dom, hash) {
    if (dom.tagName === 'img') {
      if (dom.src) {
        hash[dom.src] = true;
      }
    } else if (Array.isArray(dom.children)) {
      dom.children.forEach(function (item) {
        recursion(item, hash);
      });
    }

    var backgroundImage = dom.currentStyle[karas.enums.STYLE_KEY.BACKGROUND_IMAGE];

    if (backgroundImage && /url/i.test(backgroundImage)) {
      var url = /url(\([^)]+\))/.exec(backgroundImage);

      if (url) {
        hash[url[1]] = true;
      }
    }
  }

  var IMG_COUNTER = {};
  function injectCanvas2 () {
    var Root = /*#__PURE__*/function (_karas$Root) {
      _inherits(Root, _karas$Root);

      var _super = _createSuper(Root);

      function Root() {
        _classCallCheck(this, Root);

        return _super.apply(this, arguments);
      }

      _createClass(Root, [{
        key: "appendTo",
        value: function appendTo(dom) {
          if (dom && (dom.getContext || dom.arc)) {
            this.__dom = dom;
            this.__ctx = dom.getContext('2d');
          } else {
            this.__dom = {};
            this.__ctx = dom;
          }

          this.__children = karas.builder.initRoot(this.__cd, this);

          this.__initProps();

          this.__root = this;
          this.cache = !!this.props.cache;
          this.__refreshLevel = karas.refresh.level.REFLOW;
          this.__renderMode = karas.mode.CANVAS;
          this.__defs = {
            clear: function clear() {}
          };
          this.refresh(null, true);

          if (this.__dom.__root) {
            this.__dom.__root.destroy();
          }

          this.__dom.root = this; // 收集img

          var imgHash = {};
          recursion(this, imgHash);
          var imgList = [];
          Object.keys(imgHash).forEach(function (url) {
            imgList.push(url);
            IMG_COUNTER[url] = IMG_COUNTER[url] || 0;
            IMG_COUNTER[url]++;
          });
          this.__imgList = imgList;
        }
      }, {
        key: "refresh",
        value: function refresh(cb, isFirst) {
          var self = this;

          function wrap() {
            self.emit('myRefresh');
          }

          _get(_getPrototypeOf(Root.prototype), "refresh", this).call(this, wrap, isFirst);
        }
      }, {
        key: "__destroy",
        value: function __destroy() {
          _get(_getPrototypeOf(Root.prototype), "__destroy", this).call(this);

          if (Array.isArray(this.__imgList)) {
            this.__imgList.forEach(function (url) {
              if (IMG_COUNTER[url]) {
                IMG_COUNTER[url]--;
              }

              if (!IMG_COUNTER[url]) {
                delete karas.inject.IMG[url];
              }
            });
          }
        }
      }]);

      return Root;
    }(karas.Root); // Root引用指过来


    var createVd = karas.createVd;

    karas.createVd = function (tagName, props, children) {
      if (['canvas', 'svg'].indexOf(tagName) > -1) {
        return new Root(tagName, props, children);
      }

      return createVd(tagName, props, children);
    };

    var IMG = karas.inject.IMG;
    var INIT = karas.inject.INIT;
    var LOADING = karas.inject.LOADING;
    var LOADED = karas.inject.LOADED;

    karas.inject.measureImg = function (url, cb) {
      var optinos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var root = optinos.root,
          _optinos$width = optinos.width,
          width = _optinos$width === void 0 ? 0 : _optinos$width,
          _optinos$height = optinos.height,
          height = _optinos$height === void 0 ? 0 : _optinos$height;
      var ctx = root.ctx;
      var cache = IMG[url] = IMG[url] || {
        state: INIT,
        task: []
      };

      if (cache.state === LOADED) {
        cb(cache);
      } else if (cache.state === LOADING) {
        cache.task.push(cb);
      } else {
        cache.state = LOADING;
        cache.task.push(cb); // base64特殊处理

        if (url.indexOf('data:') === 0) {
          var img = ctx.canvas.createImage();

          img.onload = function () {
            cache.state = LOADED;
            cache.success = true;
            cache.width = width;
            cache.height = height;
            cache.source = img;
            cache.url = url;
            var list = cache.task.splice(0);
            list.forEach(function (cb) {
              return cb(cache);
            });
            img.onload = null;
            img.onerror = null;
          };

          img.onerror = function () {
            cache.state = LOADED;
            cache.success = false;
            cache.width = width;
            cache.height = height;
            cache.url = url;
            var list = cache.task.splice(0);
            list.forEach(function (cb) {
              return cb(cache);
            });
            img.onload = null;
            img.onerror = null;
          };

          img.src = url;
          return;
        }

        my.getImageInfo({
          src: url,
          success: function success(res) {
            var img = ctx.canvas.createImage();

            img.onload = function () {
              cache.state = LOADED;
              cache.success = true;
              cache.width = res.width;
              cache.height = res.height;
              cache.source = img;
              cache.url = url;
              var list = cache.task.splice(0);
              list.forEach(function (cb) {
                return cb(cache);
              });
              img.onload = null;
              img.onerror = null;
            };

            img.onerror = function () {
              cache.state = LOADED;
              cache.success = false;
              cache.width = res.width;
              cache.height = res.height;
              cache.url = url;
              var list = cache.task.splice(0);
              list.forEach(function (cb) {
                return cb(cache);
              });
              img.onload = null;
              img.onerror = null;
            };

            img.src = url;
          },
          fail: function fail() {
            cache.state = LOADED;
            cache.success = false;
            cache.url = url;
            var list = cache.task.splice(0);
            list.forEach(function (cb) {
              return cb(cache);
            });
          }
        });
      }
    };

    karas.inject.isDom = function (o) {
      return o && (o.getContext || o.arc);
    };

    var CANVAS = {};
    var CANVAS_LIST = [];
    var WEBGL_LIST = [];

    function cache(key, width, height, hash, message) {
      var o;

      if (!key) {
        var target = hash === CANVAS ? CANVAS_LIST : WEBGL_LIST;

        if (target.length) {
          o = target.pop();
        } else {
          o = my._createOffscreenCanvas(width, height);
        }
      } else if (!hash[key]) {
        o = hash[key] = my._createOffscreenCanvas(width, height);
      } else {
        o = hash[key];
      }

      o.width = width;
      o.height = height;
      return {
        canvas: o,
        ctx: hash === CANVAS ? o.getContext('2d') : o.getContext('webgl') || o.getContext('experimental-webgl'),
        draw: function draw() {// 空函数，仅对小程序提供hook特殊处理，flush缓冲
        },
        available: true,
        release: function release() {
          if (!key) {
            if (hash === CANVAS) {
              CANVAS_LIST.push(this.canvas);
            } else {
              WEBGL_LIST.push(this.canvas);
            }
          }

          this.canvas = null;
          this.ctx = null;
        }
      };
    }

    function cacheCanvas(key, width, height, message) {
      return cache(key, width, height, CANVAS);
    }

    karas.inject.hasCacheCanvas = function (key) {
      return key && CANVAS.hasOwnProperty(key);
    };

    karas.inject.getCacheCanvas = function (width, height, key, message) {
      return cacheCanvas(key, width, height);
    };

    karas.inject.releaseCacheCanvas = function (o) {
      CANVAS_LIST.push(o);
    };

    karas.inject.delCacheCanvas = function (key) {
      key && delete CANVAS[key];
    };
  }

  karas.inject.requestAnimationFrame = function (cb) {
    setTimeout(cb, 1000 / 60);
  };

  karas.myVersion = version;

  var Root = /*#__PURE__*/function (_karas$Root) {
    _inherits(Root, _karas$Root);

    var _super = _createSuper(Root);

    function Root() {
      _classCallCheck(this, Root);

      return _super.apply(this, arguments);
    }

    _createClass(Root, [{
      key: "onEvent",
      // 需要小程序内部监听事件手动调用
      value: function onEvent(e) {
        var _this = this;

        this.__wrapEvent(e, function (data) {
          _this.__emitEvent(data);
        });
      }
    }, {
      key: "__wrapEvent",
      value: function __wrapEvent(e, cb) {
        var _this$__ctx,
            _this$__dom,
            _this2 = this;

        var id = ((_this$__ctx = this.__ctx) === null || _this$__ctx === void 0 ? void 0 : _this$__ctx.id) || ((_this$__dom = this.__dom) === null || _this$__dom === void 0 ? void 0 : _this$__dom.id);
        id && my.createSelectorQuery().select("#".concat(id)).boundingClientRect().exec(function (ret) {
          var x, y;

          if (ret && ret[0] && e.detail) {
            var _e$detail = e.detail,
                clientX = _e$detail.clientX,
                clientY = _e$detail.clientY,
                ox = _e$detail.x,
                oy = _e$detail.y;
            var _ret$ = ret[0],
                left = _ret$.left,
                top = _ret$.top,
                width = _ret$.width,
                height = _ret$.height;
            var __scx = _this2.__scx,
                __scy = _this2.__scy;
            x = ox !== null && ox !== void 0 ? ox : clientX - left;
            y = oy !== null && oy !== void 0 ? oy : clientY - top;

            if (!karas.util.isNil(__scx)) {
              x /= __scx;
            } else {
              x *= _this2.width / width;
            }

            if (!karas.util.isNil(__scy)) {
              y /= __scy;
            } else {
              y *= _this2.height / height;
            }
          }

          cb({
            event: e,
            stopPropagation: function stopPropagation() {
              this.__stopPropagation = true;
            },
            stopImmediatePropagation: function stopImmediatePropagation() {
              this.__stopPropagation = true;
              this.__stopImmediatePropagation = true;
            },
            preventDefault: function preventDefault() {},
            x: x,
            y: y,
            __hasEmitted: false
          });
        });
      }
    }, {
      key: "appendTo",
      value: function appendTo(dom) {
        if (isFunction(dom.getContext)) {
          if (Root.__isCanvas2) {
            karas.inject.requestAnimationFrame = dom.requestAnimationFrame.bind(dom) || karas.inject.requestAnimationFrame;
          }

          this.__dom = dom;
          this.__ctx = dom.getContext('2d');
        } else {
          this.__dom = {};
          this.__ctx = dom;
        }

        this.__children = karas.builder.initRoot(this.__cd, this);

        this.__initProps();

        this.__root = this;
        this.cache = !!this.props.cache;
        this.__refreshLevel = karas.refresh.level.REFLOW;
        this.__renderMode = karas.mode.CANVAS;
        this.__defs = {
          clear: function clear() {}
        };
        this.refresh(null, true);

        if (this.__dom.__root) {
          this.__dom.__root.destroy();
        }

        this.__dom.root = this;
      }
    }]);

    return Root;
  }(karas.Root);

  _defineProperty(Root, "__isCanvas2", false);

  var createVd = karas.createVd;
  var injected = false;
  injectCanvas1(karas, createVd, Root);
  function setCanvasType(type) {
    // 只允许注入一次
    if (injected) {
      return;
    }

    injected = true;

    if (type === 'canvas2') {
      Root.__isCanvas2 = true;
      injectCanvas2();
    } else if (type === 'canvas1n') {
      Root.__isCanvas1n = true;
      injectCanvas1$1(karas, createVd, Root);
    }
  }

  exports.default = karas;
  exports.setCanvasType = setCanvasType;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
