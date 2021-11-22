import { createApp } from "vue";
import App from "./App.vue";

import PPTEditor from "@/components";

const app = createApp(App);
app.use(PPTEditor, "http://apitest.aixueshi.top:5002");
app.mount("#app");
