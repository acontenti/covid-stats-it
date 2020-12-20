import {route} from "quasar/wrappers";
import VueRouter from "vue-router";
import routes from "./routes";
import {stats, vars} from "src/model/models";
import {places} from "src/model/place";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default route(function ({Vue}) {
	Vue.use(VueRouter);
	let router = new VueRouter({
		scrollBehavior: () => ({x: 0, y: 0}),
		routes,

		// Leave these as is and change from quasar.conf.js instead!
		// quasar.conf.js -> build -> vueRouterMode
		// quasar.conf.js -> build -> publicPath
		mode: process.env.VUE_ROUTER_MODE,
		base: process.env.VUE_ROUTER_BASE
	});
	router.beforeEach((to, from, next) => {
		if (to.params.place && to.params.stat && to.params.var) {
			if (to.params.place in places && to.params.stat in stats && to.params.var in vars)
				next();
			else
				next("/");
		} else next();
	});
	return router;
});
