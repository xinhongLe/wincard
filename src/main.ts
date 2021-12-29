import { createApp } from "vue";
import App from "./App.vue";

import PPTEditor from "@/components";
const app = createApp(App);
const getLocalFileUrl = () => {
    return new Promise(resolve => {
        resolve("");
    });
};
app.use(PPTEditor, "https://api.aixueshi.top:5003", "https://wincard.lyx-edu.com/swf2canvas.html", getLocalFileUrl);
app.mount("#app");
