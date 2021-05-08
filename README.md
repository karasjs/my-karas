# my-karas
A karas runtime on Alipay.

[![NPM version](https://img.shields.io/npm/v/my-karas.svg)](https://npmjs.org/package/my-karas)

## INSTALL
```
npm install karas
npm install my-karas
```

## Demo
```jsx
import karas from 'my-karas';

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
          canvas
        );
      },
    });
  }
});
```
