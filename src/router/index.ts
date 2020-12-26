import {route} from "quasar/wrappers";
import VueRouter from "vue-router";
import routes from "./routes";
import {stats, vars} from "src/model/models";
import {PlaceName, places, placeTypes} from "src/model/place";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

function defaultStat(place: string) {
	const currentPlace = places[place as PlaceName];
	return placeTypes[currentPlace.type].defaultStat;
}

function defaultVar(stat: string) {
	return stats[stat].defaultVar;
}

function statAvailable(stat: string, place: string) {
	const currentPlace = places[place as PlaceName];
	return placeTypes[currentPlace.type].isStatAvailable(stat);
}

function varAvailable(stat: string, var_: string) {
	return stats[stat].isVarAvailable(var_);
}

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
		const place = to.params.place, stat = to.params.stat, var_ = to.params.var;
		if (place && stat && var_) {
			if (place in places && stat in stats && var_ in vars) {
				if (statAvailable(stat, place)) {
					if (varAvailable(stat, var_)) {
						next();
					} else {
						const dest = {place: place, stat: stat, var: defaultVar(stat)};
						next({name: "stat", params: dest, replace: true});
					}
				} else {
					if (varAvailable(stat, var_)) {
						const dest = {place: place, stat: defaultStat(place), var: var_};
						next({name: "stat", params: dest, replace: true});
					} else {
						const dest = {place: place, stat: defaultStat(place), var: defaultVar(stat)};
						next({name: "stat", params: dest, replace: true});
					}
				}
			} else next("/");
		} else next();
	});
	return router;
});
