import karas from 'karas';
import { version } from '../package.json';

karas.inject.requestAnimationFrame = function(cb) {
  setTimeout(cb, 1000 / 60);
};

class Root extends karas.Root {
  appendTo(ctx) {
    this.__children = karas.builder.initRoot(this.__cd, this);
    this.__initProps();
    this.__refreshLevel = karas.level.REFLOW;
    this.__ctx = ctx;
    this.__renderMode = karas.mode.CANVAS;
    this.__defs = {
      clear() {},
    };
    this.refresh();
  }

  refresh(cb) {
    let ctx = this.ctx;

    function wrap() {
      ctx.draw(true);
      cb && cb();
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

karas.inject.getCacheCanvas = function(key = '__$$cache$$__') {
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
