import Vue from "vue";
// @ts-ignore
import VCharts from "v-charts";
import Settings from "src/model/settings";

Vue.use(VCharts);

declare module "vue/types/vue" {
	interface Vue {
		$settings: Settings
	}
}

Vue.prototype.$settings = Vue.observable(Settings.instance);
