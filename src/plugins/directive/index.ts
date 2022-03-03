import { App } from "vue";
import Contextmenu from "./contextmenu";
import ClickOutside from "./clickOutside";
import FontScale from "./fontScale";

export default {
    install(app: App) {
        app.directive("contextmenu", Contextmenu);
        app.directive("click-outside", ClickOutside);
        app.directive("font-scale", FontScale);
    }
};
