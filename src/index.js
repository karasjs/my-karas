import karas from 'karas';

class MyCtx {
  constructor(ctx) {
    this.__ctx = ctx;
    [
      'fillStyle',
      'strokeStyle',
      'lineWidth',
      'lineCap',
      'globalAlpha',
    ].forEach(k => {
      let nk = 'set' + k.charAt(0).toUpperCase() + k.slice(1);
      Object.defineProperty(this, k, {
        set(v) {
          ctx[nk](v);
        },
      });
    });
    Object.defineProperty(this, 'font', {
      set(v) {
        let size = /(\d+)px/.exec(v);
        ctx.setFontSize(size[1]);
      },
    });
  }

  get ctx() {
    return this.__ctx;
  }
}

[
  'measureText',
  'setTransform',
  'setLineDash',
  'clearRect',
  'fillText',
  'fill',
  'stroke',
  'beginPath',
  'closePath',
  'rect',
  'arc',
  'moveTo',
  'lineTo',
  'bezierCurveTo',
  'quadraticCurveTo',
].forEach(fn => {
  MyCtx.prototype[fn] = function() {
    let ctx = this.ctx;
    if(ctx[fn]) {
      return ctx[fn].apply(ctx, arguments);
    }
  };
});

karas.inject.requestAnimationFrame = function(cb) {
  setTimeout(cb, 1000 / 60);
};

class Root extends karas.Root {
  appendTo(ctx) {
    this.__initProps();
    this.__refreshLevel = karas.level.REFLOW;
    this.__ctx = new MyCtx(ctx);
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
    let ctx = this.ctx.ctx;

    function wrap() {
      ctx.draw();
      cb && cb();
    }

    super.refresh(wrap);
  }
}

let createVd = karas.createVd;
karas.createVd = function(tagName, props, children) {
  if(['canvas', 'svg'].indexOf(tagName) > -1) {
    return new Root(tagName, props, children);
  }
  return createVd(tagName, props, children);
};

export default karas;
