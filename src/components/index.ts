import { App } from "vue";

import PPTEditor from "./PPTEditor.vue";
import { store, key } from "@/store";
import Antd from "ant-design-vue";

// 样式引用
import "ant-design-vue/dist/antd.css";
import "@icon-park/vue-next/styles/index.css";
import "prosemirror-view/style/prosemirror.css";
import "animate.css";

import "@/assets/styles/prosemirror.scss";
import "@/assets/styles/global.scss";
import "@/assets/styles/antd.scss";
import "@/assets/styles/font.scss";
import "@/assets/styles/variable.scss";

import Icon from "@/plugins/icon";
import Component from "@/plugins/component";
import Directive from "@/plugins/directive";

export default {
    install(app: App) {
        app.use(Icon);
        app.use(Component);
        app.use(Directive);
        app.use(Antd);
        app.use(store, key);
        app.component("PPTEditor", PPTEditor);
    }
};
