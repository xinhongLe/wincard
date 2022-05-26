import { App } from "vue";

import PPTEditor from "./PPTEditor.vue";
import ScreenView from "./ScreenView.vue";
import ThumbnailSlide from "./ThumbnailSlide/index.vue";
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

declare global {
    interface Window {
        electron: any;
        VUE_APP_WINCARD_AI_XUE_SHI_API: string;
        VUE_APP_WINCARD_AI_XUE_SHI_FLASH_WEB: string;
        Hls: any;
        flvjs: any;
    }
}

export default {
    install(app: App, url: string, flashWeb: string, getLocalFileUrl?: () => Promise<string>) {
        window.VUE_APP_WINCARD_AI_XUE_SHI_API = url;
        window.VUE_APP_WINCARD_AI_XUE_SHI_FLASH_WEB = flashWeb;
        app.use(Icon);
        app.use(Component);
        app.use(Directive);
        app.use(Antd);
        app.use(store, key);
        app.component("PPTEditor", PPTEditor);
        app.component("ScreenView", ScreenView);
        app.component("ThumbnailSlide", ThumbnailSlide);
        const _getLocalFileUrl = () => {
            return new Promise(resolve => {
                resolve("");
            });
        };
        app.config.globalProperties.$getLocalFileUrl = getLocalFileUrl || _getLocalFileUrl;
    }
};
