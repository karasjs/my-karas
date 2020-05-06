import karas from 'karas';

karas.inject.requestAnimationFrame = function(cb) {
  setTimeout(cb, 1000 / 60);
};

class Root extends karas.Root {
  appendTo(ctx) {
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

const IMG = {};
const INIT = 0;
const LOADING = 1;
const LOADED = 2;

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

let cc, mc;

karas.inject.setCacheCanvas = function(o) {
  cc = o;
};

karas.inject.setMaskCanvas = function(o) {
  mc = o;
};

karas.inject.getCacheCanvas = function() {
  if(!cc) {
    throw new Error('Need a cache canvas');
  }
  return {
    ctx: cc,
    canvas: cc,
    draw(ctx) {
      ctx.draw(true);
    },
  };
};

karas.inject.getMaskCanvas = function() {
  if(!mc) {
    throw new Error('Need a mask canvas');
  }
  return {
    ctx: mc,
    canvas: mc,
    draw(ctx) {
      ctx.draw(true);
    },
  };
};

export default karas;
