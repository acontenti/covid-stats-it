import {RouteConfig} from "vue-router";

const routes: RouteConfig[] = [
	{
		path: "/",
		component: () => import("layouts/MainLayout.vue"),
		children: [
			{path: ":place", component: () => import("pages/Place.vue")}
		]
	},
	{
		path: "*",
		redirect: "/"
	}
];

export default routes;
