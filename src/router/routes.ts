import {RouteConfig} from "vue-router";

const routes: RouteConfig[] = [
	{
		path: "/",
		component: () => import("layouts/MainLayout.vue"),
		children: [
			{
				name: "stat",
				path: ":place/:stat",
				component: () => import("pages/Stat.vue")
			},
			{
				path: "",
				redirect: {name: "stat", params: {place: "italia", stat: "nuovi_positivi"}}
			},
			{
				path: "*",
				redirect: {name: "stat", params: {place: "italia", stat: "nuovi_positivi"}}
			}
		]
	},
	{
		path: "*",
		redirect: "/"
	}
];

export default routes;
