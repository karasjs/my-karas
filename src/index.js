import karas from 'karas';
import { version } from '../package.json';
import { isFunction } from './util';
import injectCanvas1 from './canvas1';
import injectCanvas1n from './canvas1n';
import injectCanvas2 from './canvas2';

karas.inject.requestAnimationFrame = function(cb) {
  return setTimeout(cb, 1000 / 60);
};

karas.myVersion = version;

class Root extends karas.Root {
  static __isCanvas2 = false;

  // 需要小程序内部监听事件手动调用
  onEvent(e) {
    this.__wrapEvent(e, data => {
      this.__emitEvent(data);
    });
  }

  __wrapEvent(e, cb) {
    const id = this.__ctx?.id || this.__dom?.id;
    id && my.createSelectorQuery().select(`#${id}`).boundingClientRect().exec(ret => {
      let x, y;

      if(ret && ret[0] && e.detail) {
        const { clientX, clientY, x: ox, y: oy } = e.detail;
        const { left, top, width, height } = ret[0];
        const { __scx, __scy } = this;

        x = ox ?? clientX - left;
        y = oy ?? clientY - top;

        if(!karas.util.isNil(__scx)) {
          x /= __scx;
        }
        else {
          x *= this.width / width;
        }
        if(!karas.util.isNil(__scy)) {
          y /= __scy;
        }
        else {
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
        preventDefault() {
        },
        x,
        y,
        __hasEmitted: false,
      });
    });
  }

  appendTo(dom) {
    if(isFunction(dom.getContext)) {
      if(Root.__isCanvas2) {
        karas.inject.requestAnimationFrame = dom.requestAnimationFrame.bind(dom) || karas.inject.requestAnimationFrame;
      }
      this.__dom = dom;
      this.__ctx = dom.getContext('2d');
    }
    else {
      this.__dom = {};
      this.__ctx = dom;
    }
    this.__children = karas.builder.initRoot(this.__cd, this);
    this.__initProps();
    this.__root = this;
    this.__refreshLevel = karas.refresh.level.REFLOW;
    this.__renderMode = karas.mode.CANVAS;
    this.__defs = {
      clear() {
      },
    };
    this.refresh(null, true);
    if(this.__dom.__root) {
      this.__dom.__root.destroy();
    }
    this.__dom.root = this;
  }
}

const createVd = karas.createVd;

let injected = false;
injectCanvas1(karas, createVd, Root);

export function setCanvasType(type) {
  // 只允许注入一次
  if(injected) {
    return;
  }
  injected = true;
  if(type === 'canvas2') {
    Root.__isCanvas2 = true;
    injectCanvas2(karas, createVd, Root);
  }
  else if(type === 'canvas1n') {
    Root.__isCanvas1n = true;
    injectCanvas1n(karas, createVd, Root);
  }
}

export default karas;
