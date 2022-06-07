import karas from 'karas';

function recursion(dom, hash) {
  if(dom.tagName === 'img') {
    if(dom.src) {
      hash[dom.src] = true;
    }
  }
  else if(Array.isArray(dom.children)) {
    dom.children.forEach(item => {
      recursion(item, hash);
    });
  }
  let backgroundImage = dom.currentStyle[karas.enums.STYLE_KEY.BACKGROUND_IMAGE];
  if(backgroundImage && /url/i.test(backgroundImage)) {
    let url = /url(\([^)]+\))/.exec(backgroundImage);
    if(url) {
      hash[url[1]] = true;
    }
  }
}

const IMG_COUNTER = {};

export default function() {
  class Root extends karas.Root {
    appendTo(dom) {
      if(dom && dom.getContext) {
        this.__dom = dom;
        this.__ctx = dom.getContext('2d');
      }
      else {
        this.__dom = dom.canvas;
        this.__ctx = dom;
      }
      this.__children = karas.builder.initRoot(this.__cd, this);
      this.__initProps();
      this.__root = this;
      this.cache = !!this.props.cache;
      this.__refreshLevel = karas.refresh.level.REFLOW;
      this.__renderMode = karas.mode.CANVAS;
      this.__defs = {
        clear() {},
      };
      this.refresh(null, true);
      if(this.__dom.__root) {
        this.__dom.__root.destroy();
      }
      this.__dom.root = this;
      // 收集img
      let imgHash = {};
      recursion(this, imgHash);
      let imgList = [];
      Object.keys(imgHash).forEach(url => {
        imgList.push(url);
        IMG_COUNTER[url] = IMG_COUNTER[url] || 0;
        IMG_COUNTER[url]++;
      });
      this.__imgList = imgList;
    }

    refresh(cb, isFirst) {
      let self = this;

      function wrap() {
        self.emit('myRefresh');
      }

      super.refresh(wrap, isFirst);
    }

    __destroy() {
      super.__destroy();
      if(Array.isArray(this.__imgList)) {
        this.__imgList.forEach(url => {
          if(IMG_COUNTER[url]) {
            IMG_COUNTER[url]--;
          }
          if(!IMG_COUNTER[url]) {
            delete karas.inject.IMG[url];
          }
        });
      }
    }
  }

  // Root引用指过来
  let createVd = karas.createVd;
  karas.createVd = function(tagName, props, children) {
    if(['canvas', 'svg', 'webgl'].indexOf(tagName) > -1) {
      return new Root(tagName, props, children);
    }
    return createVd(tagName, props, children);
  };

  const IMG = karas.inject.IMG;
  const INIT = karas.inject.INIT;
  const LOADING = karas.inject.LOADING;
  const LOADED = karas.inject.LOADED;

  karas.inject.measureImg = function(url, cb, optinos = {}) {
    let { width = 0, height = 0, ctx } = optinos;

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
      // base64特殊处理
      if(url.indexOf('data:') === 0) {
        let img = ctx.canvas.createImage();
        img.onload = function() {
          cache.state = LOADED;
          cache.success = true;
          cache.width = width;
          cache.height = height;
          cache.source = img;
          cache.url = url;
          let list = cache.task.splice(0);
          list.forEach(cb => cb(cache));
          img.onload = null;
          img.onerror = null;
        };
        img.onerror = function() {
          cache.state = LOADED;
          cache.success = false;
          cache.width = width;
          cache.height = height;
          cache.url = url;
          let list = cache.task.splice(0);
          list.forEach(cb => cb(cache));
          img.onload = null;
          img.onerror = null;
        };
        img.src = url;
        return;
      }
      my.getImageInfo({
        src: url,
        success: function(res) {
          let img = ctx.canvas.createImage();
          img.onload = function() {
            cache.state = LOADED;
            cache.success = true;
            cache.width = res.width;
            cache.height = res.height;
            cache.source = img;
            cache.url = url;
            let list = cache.task.splice(0);
            list.forEach(cb => cb(cache));
            img.onload = null;
            img.onerror = null;
          };
          img.onerror = function() {
            cache.state = LOADED;
            cache.success = false;
            cache.width = res.width;
            cache.height = res.height;
            cache.url = url;
            let list = cache.task.splice(0);
            list.forEach(cb => cb(cache));
            img.onload = null;
            img.onerror = null;
          };
          img.src = url;
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
    return o && (o.getContext || o.arc);
  }

  const CANVAS = {};
  const CANVAS_LIST = [];
  const WEBGL_LIST = [];

  function cache(key, width, height, hash, message) {
    let o;
    if(!key) {
      let target = hash === CANVAS ? CANVAS_LIST : WEBGL_LIST;
      if(target.length) {
        o = target.pop();
      }
      else {
        if(my.createOffscreenCanvas) {
          o = my.createOffscreenCanvas(width, height);
        }
        else {
          o = my._createOffscreenCanvas(width, height);
        }
      }
    }
    else if(!hash[key]) {
      if(my.createOffscreenCanvas) {
        o = hash[key] = my.createOffscreenCanvas(width, height);
      }
      else {
        o = hash[key] = my._createOffscreenCanvas(width, height);
      }
    }
    else {
      o = hash[key];
    }
    o.width = width;
    o.height = height;
    return {
      canvas: o,
      ctx: hash === CANVAS ? o.getContext('2d')
        : (o.getContext('webgl') || o.getContext('experimental-webgl')),
      draw() {
        // 空函数，仅对小程序提供hook特殊处理，flush缓冲
      },
      available: true,
      release() {
        if(!key) {
          if(hash === CANVAS) {
            CANVAS_LIST.push(this.canvas);
          }
          else {
            WEBGL_LIST.push(this.canvas);
          }
        }
        this.canvas = null;
        this.ctx = null;
      },
    };
  }

  function cacheCanvas(key, width, height, message) {
    return cache(key, width, height, CANVAS, message);
  }

  karas.inject.hasCacheCanvas = function(key) {
    return key && CANVAS.hasOwnProperty(key);
  };

  karas.inject.getCacheCanvas = function(width, height, key, message) {
    return cacheCanvas(key, width, height, message);
  };

  karas.inject.releaseCacheCanvas = function(o) {
    CANVAS_LIST.push(o);
  };

  karas.inject.delCacheCanvas = function(key) {
    key && delete CANVAS[key];
  };
};
