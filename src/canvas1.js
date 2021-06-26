import { isFunction } from './util';

const CANVAS = {};
const CANVAS_LIST = [];

export default function injectCanvas1(karas, createVd, Root) {
  class newRoot extends Root {
    refresh(cb, isFirst) {
      let self = this;
      let ctx = self.ctx;
      // 小程序bug，可能restore失败，刷新前手动restore下
      ctx.restore();

      function wrap() {
        ctx.draw && ctx.draw(true, function() {
          self.emit('myRefresh');
        });
      }

      super.refresh(wrap, isFirst);
    }
  }

  karas.createVd = function(tagName, props, children) {
    if(['canvas', 'svg'].indexOf(tagName) > -1) {
      return new newRoot(tagName, props, children);
    }
    return createVd(tagName, props, children);
  };

  const IMG = karas.inject.IMG;
  const INIT = karas.inject.INIT;
  const LOADING = karas.inject.LOADING;
  const LOADED = karas.inject.LOADED;

  karas.inject.checkSupportFontFamily = () => false

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
    return o && (isFunction(o.getContext) || isFunction(o.arc));
  }

  karas.inject.hasCacheCanvas = function(key) {
    return key && CANVAS.hasOwnProperty(key);
  };
  karas.inject.getCacheCanvas = function(w, h, key, message) {
    if(message) {
      key = message;
    }
    // console.log(message,CANVAS);
    if(!CANVAS[key]) {
      throw new Error('Need a cache canvas');
    }
    let o = CANVAS[key];
    return {
      ctx: o,
      canvas: o,
      draw() {
        o.draw(true);
      },
    };
  };
  karas.inject.setCacheCanvas = function(k, v) {
    CANVAS[k] = v;
  };

  karas.inject.releaseCacheCanvas = function(o) {
    CANVAS_LIST.push(o);
  };

  karas.inject.delCacheCanvas = function(key) {
    key && delete CANVAS[key];
  };
}
