import { createApp } from "vue";
import App from "./App.vue";

import PPTEditor from "@/components";

const app = createApp(App);
app.use(PPTEditor);
app.mount("#app");
