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
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
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
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
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

  var version = "0.38.4";

  karas.inject.requestAnimationFrame = function (cb) {
    setTimeout(cb, 1000 / 60);
  };

  var REFRESH = karas.Event.REFRESH_ASYNC = 'refresh-async';

  var Root = /*#__PURE__*/function (_karas$Root) {
    _inherits(Root, _karas$Root);

    var _super = _createSuper(Root);

    function Root() {
      _classCallCheck(this, Root);

      return _super.apply(this, arguments);
    }

    _createClass(Root, [{
      key: "onEvent",
      value: // 需要小程序内部监听事件手动调用
      function onEvent(e) {
        var _this = this;

        this.__wrapEvent(e, function (data) {
          _this.__emitEvent(data);
        });
      }
    }, {
      key: "__wrapEvent",
      value: function __wrapEvent(e, cb) {
        var _this2 = this;

        var id = this.ctx.id;
        my.createSelectorQuery().select("#".concat(id)).boundingClientRect().exec(function (ret) {
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
      value: function appendTo(ctx) {
        this.__children = karas.builder.initRoot(this.__cd, this);

        this.__initProps();

        this.__root = this;
        this.__refreshLevel = karas.animate.level.REFLOW;
        this.__ctx = ctx;
        this.__renderMode = karas.mode.CANVAS;
        this.__defs = {
          clear: function clear() {}
        };
        this.refresh();
      }
    }, {
      key: "refresh",
      value: function refresh(cb) {
        var self = this;
        var ctx = self.ctx;

        function wrap() {
          ctx.draw(true, function () {
            self.emit(REFRESH);
            cb && cb();
          });
        }

        _get(_getPrototypeOf(Root.prototype), "refresh", this).call(this, wrap);
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
    return o && karas.util.isFunction(o.arc);
  };

  var CANVAS = {};

  karas.inject.setCacheCanvas = function (k, v) {
    CANVAS[k] = v;
  };

  karas.inject.getCacheCanvas = function (w, h) {
    var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '__$$cache$$__';

    if (!CANVAS[key]) {
      throw new Error('Need a cache canvas');
    }

    var o = CANVAS[key];
    return {
      ctx: o,
      canvas: o,
      draw: function draw(ctx) {
        ctx.draw(true);
      }
    };
  };

  karas.myVersion = version;

  return karas;

})));
//# sourceMappingURL=index.js.map
