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

**_【注】：支持数据导入和导出_**
