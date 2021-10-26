# ppt-editor

# use
main.js中引用 WinCard：
```js
import { createApp } from 'vue'
import App from './App.vue'

import WinCard from "win-card";

createApp(App).use(WinCard).mount('#app')
```
vue中使用：
```html
<!-- 素材页编辑 -->
<PPTEditor :slide="slide" @onSave="onSave" />

<!-- 预览 -->
<ScreenView :slide="slide" @pagePrev="pagePrev()" @pageNext="pageNext()" />
```

***【注】：支持数据导入和导出***