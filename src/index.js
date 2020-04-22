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
    let { style } = this;
    if(['flex', 'block'].indexOf(style.display) === -1) {
      style.display = 'block';
    }
    // 同理position不能为absolute
    if(style.position === 'absolute') {
      style.position = 'static';
    }
    let { renderMode, ctx: myCtx } = this;
    this.__traverse(myCtx, undefined, renderMode);
    this.__traverseCss(this, this.props.css);
    this.__init();
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

karas.inject.measureImg = function(src, cb, optinos = {}) {
  if(src.indexOf('data:') === 0) {
    let { width = {}, height = {} } = optinos;
    cb({
      success: true,
      width: width.value,
      height: height.value,
      source: src,
    });
    return;
  }
  my.getImageInfo({
    src,
    success: function(res) {
      cb({
        success: true,
        width: res.width,
        height: res.height,
        source: src,
      });
    },
    fail: function() {
      cb({
        success: false,
      });
    },
  });
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
