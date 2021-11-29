import { createApp } from "vue";
import App from "./App.vue";

import PPTEditor from "@/components";
const app = createApp(App);
app.use(PPTEditor, "http://42.192.7.46:5002", "https://wincard.lyx-edu.com/swf2canvas.html");
app.mount("#app");
