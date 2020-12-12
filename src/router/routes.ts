import {RouteConfig} from "vue-router";

const routes: RouteConfig[] = [
	{
		path: "/",
		component: () => import("layouts/MainLayout.vue"),
		children: [
			{
				name: "stat",
				path: ":place/:stat/:var",
				component: () => import("pages/Stat.vue")
			},
			{
				path: "",
				redirect: {name: "stat", params: {place: "italia", stat: "casi", var: "nuovi"}}
			},
			{
				path: "*",
				redirect: {name: "stat", params: {place: "italia", stat: "casi", var: "nuovi"}}
			}
		]
	},
	{
		path: "*",
		redirect: "/"
	}
];

export default routes;
