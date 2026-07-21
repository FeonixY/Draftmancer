import { createApp } from "vue";
import VueClazy from "./vue-clazy-load.vue";
import i18n from "./i18n";

export function createCommonApp(component: any) {
	const app = createApp(component);
	app.component("clazy-load", VueClazy);
	app.use(i18n);
	return app;
}
