# WinCard

# use

main.js 中引用 WinCard：

```js
import { createApp } from "vue";
import App from "./App.vue";

import WinCard from "wincard";

createApp(App)
    .use(WinCard)
    .mount("#app");
```

vue 中使用：

```html
<!-- 素材页编辑 -->
<PPTEditor :slide="slide" @onSave="onSave" />

<!-- 预览 -->
<ScreenView :slide="slide" @pagePrev="pagePrev()" @pageNext="pageNext()" />
```

slide数据示例：
```ts
// 素材页
{
    id: "39FFFBBE2B08D1CFD8FCA24DE655B35B",
    type: "element",
    viewportRatio: 0.5625,
    elements: [
        {
            name: "形状1",
            type: "shape",
            id: "4cbRxp",
            left: 0,
            top: 200,
            width: 546,
            height: 362.5,
            viewBox: 200,
            path: "M 0 0 L 0 200 L 200 200 Z",
            fill: "#5b9bd5",
            fixedRatio: false,
            opacity: 0.7,
            rotate: 0
        },
        {
            name: "形状2",
            type: "shape",
            id: "ookHrf",
            left: 0,
            top: 0,
            width: 300,
            height: 320,
            viewBox: 200,
            path: "M 0 0 L 0 200 L 200 200 Z",
            fill: "#5b9bd5",
            fixedRatio: false,
            flipV: true,
            rotate: 0
        },
        {
            name: "文本1",
            type: "text",
            id: "idn7Mx",
            left: 355,
            top: 65.25,
            width: 585,
            height: 188,
            lineHeight: 1.2,
            content:
                "<p><strong><span style='font-size:  112px'>PPTIST</span></strong></p>",
            rotate: 0,
            defaultFontName: "Microsoft Yahei",
            defaultColor: "#333"
        },
        {
            name: "文本2",
            type: "text",
            id: "7stmVP",
            left: 355,
            top: 253.25,
            width: 585,
            height: 56,
            content:
                "<p><span style='font-size:  24px'>基于 Vue 3.x + TypeScript 的在线演示文稿应用</span></p>",
            rotate: 0,
            defaultFontName: "Microsoft Yahei",
            defaultColor: "#333"
        },
        {
            name: "线条",
            type: "line",
            id: "FnpZs4",
            left: 361,
            top: 238,
            start: [0, 0],
            end: [549, 0],
            points: ["", ""],
            color: "#5b9bd5",
            style: "solid",
            width: 2
        }
    ],
    background: {
        type: "solid",
        color: "#ffffff"
    }
}

// 听写页
{
    id: "39FFFBBE2B08D1CFD8FCA24DE655B35B",
    type: "listen",
    viewportRatio: 0.5625,
    elements: [],
    listenWords: [
        {
            id: "39FED7308B47FE07436EC33844DE78F5",
            name: "苹果1",
            file: "TeachPageFile/EFF4D19486842BDF411839B61AE22B71.mp3",
            extention: "mp3",
            pageWordID: "39FFFC10573FB3AD0BC87C17A08E2AD5"
        },
        {
            name: "121212",
            id: "39FECC5CDF3022C43C032688958B16BF",
            file: "TeachPageFile/28D7326F7772879CDCF564A2A755B264.m4a",
            extention: "m4a",
            pageWordID: "39FFFC10574015C89FAEF9355BB5E7CB"
        },
        {
            name: "121212",
            id: "39FECC5CDF3022C43C032688958B16BF",
            file: "TeachPageFile/28D7326F7772879CDCF564A2A755B264.m4a",
            extention: "m4a",
            pageWordID: "39FFFC65054430D68B36F090A1875989"
        },
        {
            name: "测试",
            id: "39FEBCA9648BE111E08E1B4CD1C5104E",
            file: "TeachPageFile/814F94E1DBA66566099B0787FA7678D7.mp4",
            extention: "mp4",
            pageWordID: "39FFFC654B2BDC6027B84AE7E1021F3A"
        },
        {
            name: "敦实",
            id: "39FEBCA933D981CE5D2A348A65ABC0DB",
            file: "TeachPageFile/CA7DC5A89DD86B2DD66B8D996EAB67E3.mp3",
            extention: "mp3",
            pageWordID: "39FFFC654B2B2A9804F1F6914BF1D786"
        }
    ],
    background: {
        type: "solid",
        color: "#ffffff"
    }
}

// 跟读页
{
    id: "39FFFBBE2B08D1CFD8FCA24DE655B35B",
    type: "follow",
    viewportRatio: 0.5625,
    elements: [],
    follow: {
        src: "ElementFile/435F9C581336C2582C98A7708699585D.mp4"
    },
    background: {
        type: "solid",
        color: "#ffffff"
    }
}
```

**_【注】：支持数据导入和导出_**
