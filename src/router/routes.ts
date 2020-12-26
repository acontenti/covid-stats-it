import {RouteConfig} from "vue-router";
import Chart from "pages/Chart.vue";
import MainLayout from "layouts/MainLayout.vue";

const routes: RouteConfig[] = [
	{
		path: "/",
		component: MainLayout,
		children: [
			{
				name: "stat",
				path: ":place/:stat/:var",
				component: Chart
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
