import { createApp } from "vue";
import App from "./App.vue";

import PPTEditor from "@/components";
const app = createApp(App);
const getLocalFileUrl = () => {
    return new Promise(resolve => {
        resolve("");
    });
};
app.use(PPTEditor, "http://apitest.aixueshi.top:5002", "https://wincard.lyx-edu.com/swf2canvas.html", getLocalFileUrl);
app.mount("#app");
