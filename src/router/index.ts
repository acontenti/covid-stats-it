import {route} from "quasar/wrappers";
import VueRouter from "vue-router";
import routes from "./routes";
import {stats, vars} from "components/models";
import {places} from "components/place";

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
		if (to.params.place && to.params.stat) {
			if (to.params.place in places && stats.includes(to.params.stat) && vars.includes(to.params.var))
				next();
			else
				next("/");
		} else next();
	});
	return router;
});
