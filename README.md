# my-karas
A karas runtime on Alipay.

[![NPM version](https://img.shields.io/npm/v/my-karas.svg)](https://npmjs.org/package/my-karas)

## INSTALL
```
npm install karas
npm install my-karas
```

小程序目前有升级canvas2.0，以及native canvas1.0，所以出现了3种api，2.0新版支持离屏功能，老版默认不行。新版在sdk2.7.0及以上支持。

## Demo
```jsx
// 老版
import karas from 'my-karas';

Page({
  onLoad() {
    my.createSelectorQuery()
      .select('#canvas')
      .boundingClientRect()
      .exec(res => {
        if (!res || !res.length || !res[0]) {
          return;
        }
        const { width, height } = res[0];
        const pixelRatio = my.getSystemInfoSync().pixelRatio;
        const w = width * pixelRatio;
        const h = height * pixelRatio;
        this.setData({
          width: w,
          height: h,
        }, () => {
          const ctx = my.createCanvasContext('canvas');
          // 上面都是小程序固有的，因环境问题不得不如此，下面真正内容和h5基本一致
          karas.parse({
            tagName: 'canvas',
            props: {
              width: w,
              height: h,
            },
            children: [
              json, // ui制作的数据，这里和h5一样
            ],
          }, ctx);
        });
      });
  },
});
```
```jsx
// 新版2.0
import karas from 'my-karas';
// 版本api不一致，所以要多调用一次
setCanvasType('canvas2');

Page({
  onLoad() {
    my._createCanvas({
      id: 'canvas',
      success: (canvas) => {
        karas.parse(
          {
            tagName: 'canvas',
            props: {
              width: 360,
              height: 360,
            },
            children: [
              'Hello world'
            ]
          },
          canvas.getContext('2d')
        );
      },
    });
  }
});
```
```jsx
// 1.0native
import karas from 'my-karas';
// 版本api不一致，所以要多调用一次
setCanvasType('canvas1n');

Page({
  onLoad() {
    my._createCanvas({
      id: 'canvas',
      success: (canvas) => {
        karas.parse(
          {
            tagName: 'canvas',
            props: {
              width: 360,
              height: 360,
            },
            children: [
              'Hello world'
            ]
          },
          canvas.getContext('2d')
        );
      },
    });
  }
});
```
