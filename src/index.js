import karas from 'karas';
import { version } from '../package.json';

karas.inject.requestAnimationFrame = function(cb) {
  setTimeout(cb, 1000 / 60);
};

const REFRESH = karas.Event.REFRESH_ASYNC = 'refresh-async';

class Root extends karas.Root {
  // 需要小程序内部监听事件手动调用
  onEvent(e) {
    this.__wrapEvent(e, data => {
      this.__emitEvent(data);
    });
  }
  __wrapEvent(e, cb) {
    const { id } = this.ctx;
    my.createSelectorQuery().select(`#${id}`).boundingClientRect().exec(ret => {
      let x, y;

      if (ret && ret[0] && e.detail) {
        const { clientX, clientY, x: ox, y: oy } = e.detail;
        const { left, top, width, height } = ret[0];
        const { __scx, __scy } = this;

        x = ox ?? clientX - left;
        y = oy ?? clientY - top;

        if (!karas.util.isNil(__scx)) {
          x /= __scx;
        } else {
          x *= this.width / width;
        }
        if (!karas.util.isNil(__scy)) {
          y /= __scy;
        } else {
          y *= this.height / height;
        }
      }
      cb({
        event: e,
        stopPropagation() {
          this.__stopPropagation = true;
        },
        stopImmediatePropagation() {
          this.__stopPropagation = true;
          this.__stopImmediatePropagation = true;
        },
        preventDefault() {},
        x,
        y,
        __hasEmitted: false,
      });
    });
  }
  appendTo(ctx) {
    this.__children = karas.builder.initRoot(this.__cd, this);
    this.__initProps();
    this.__root = this;
    this.__refreshLevel = karas.animate.level.REFLOW;
    this.__ctx = ctx;
    this.__renderMode = karas.mode.CANVAS;
    this.__defs = {
      clear() {},
    };
    this.refresh();
  }

  refresh(cb) {
    let self = this;
    let ctx = self.ctx;

    function wrap() {
      ctx.draw(true, function() {
        self.emit(REFRESH);
        cb && cb();
      });
    }

    super.refresh(wrap);
  }
}

// Root引用指过来
let createVd = karas.createVd;
karas.createVd = function(tagName, props, children) {
  if(['canvas', 'svg'].indexOf(tagName) > -1) {
    return new Root(tagName, props, children);
  }
  return createVd(tagName, props, children);
};

const IMG = karas.inject.IMG;
const INIT = karas.inject.INIT;
const LOADING = karas.inject.LOADING;
const LOADED = karas.inject.LOADED;

karas.inject.measureImg = function(url, cb, optinos = {}) {
  if(url.indexOf('data:') === 0) {
    let { width = {}, height = {} } = optinos;
    cb({
      success: true,
      width: width.value,
      height: height.value,
      url,
      source: url,
    });
    return;
  }
  let cache = IMG[url] = IMG[url] || {
    state: INIT,
    task: [],
  };
  if(cache.state === LOADED) {
    cb(cache);
  }
  else if(cache.state === LOADING) {
    cache.task.push(cb);
  }
  else {
    cache.state = LOADING;
    cache.task.push(cb);
    my.getImageInfo({
      src: url,
      success: function(res) {
        cache.state = LOADED;
        cache.success = true;
        cache.width = res.width;
        cache.height = res.height;
        cache.source = url;
        cache.url = url;
        let list = cache.task.splice(0);
        list.forEach(cb => cb(cache));
      },
      fail: function() {
        cache.state = LOADED;
        cache.success = false;
        cache.url = url;
        let list = cache.task.splice(0);
        list.forEach(cb => cb(cache));
      },
    });
  }
};

karas.inject.isDom = function(o) {
  return o && karas.util.isFunction(o.arc);
}

const CANVAS = {};

karas.inject.setCacheCanvas = function(k, v) {
  CANVAS[k] = v;
};

karas.inject.getCacheCanvas = function(w, h, key = '__$$cache$$__') {
  if(!CANVAS[key]) {
    throw new Error('Need a cache canvas');
  }
  let o = CANVAS[key];
  return {
    ctx: o,
    canvas: o,
    draw(ctx) {
      ctx.draw(true);
    },
  };
};

karas.myVersion = version;

export default karas;
