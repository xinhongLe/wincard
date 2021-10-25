# ppt-editor

# use
main.js中引用 PPTEditor：
```js
import { createApp } from 'vue'
import App from './App.vue'

import PPTEditor from "@window-card/ppt-editor";

createApp(App).use(PPTEditor).mount('#app')
```
vue中使用：
```html
<PPTEditor :slide="slide" @onSave="onSave" />
```

***【注】：支持数据导入和导出***