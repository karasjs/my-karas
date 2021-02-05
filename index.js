(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('karas')) :
  typeof define === 'function' && define.amd ? define(['karas'], factory) :
  (global = global || self, global.karas = factory(global.karas));
}(this, (function (karas) { 'use strict';

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

  var version = "0.50.0";

  karas.inject.requestAnimationFrame = function (cb) {
    setTimeout(cb, 1000 / 60);
  };

  var Root = /*#__PURE__*/function (_karas$Root) {
    _inherits(Root, _karas$Root);

    var _super = _createSuper(Root);

    function Root() {
      _classCallCheck(this, Root);

      return _super.apply(this, arguments);
    }

    _createClass(Root, [{
      key: "appendTo",
      value: function appendTo(ctx) {
        this.__children = karas.builder.initRoot(this.__cd, this);

        this.__initProps();

        this.__root = this;
        this.cache = !!this.props.cache;
        this.__refreshLevel = karas.refresh.level.REFLOW;
        this.__ctx = ctx;
        this.__renderMode = karas.mode.CANVAS;
        this.__defs = {
          clear: function clear() {}
        };
        this.refresh(null, true);
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

    if (url.indexOf('data:') === 0) {
      var img = ctx.createImage();

      img.onload = function () {
        cb({
          success: true,
          width: width,
          height: height,
          url: url,
          source: img
        });
      };

      img.src = url;
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
          var img = ctx.createImage();

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
    return o && karas.util.isFunction(o.arc);
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
        if (hash === CANVAS) {
          CANVAS_LIST.push(this.canvas);
        } else {
          WEBGL_LIST.push(this.canvas);
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

  karas.myVersion = version;

  return karas;

})));
//# sourceMappingURL=index.js.map
