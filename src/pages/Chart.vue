<template>
	<q-page :key="this.place.link+this.stat" class="no-wrap q-px-sm q-pt-md q-pb-sm items-end">
		<div class="chart-container fit">
			<ve-line :colors="chart.colors" :data="chart.data" :data-zoom="chart.dataZoom" :extend="chart.extend"
					 :height="chart.height+'px'" :loading="loading" :mark-area="chart.markArea"
					 :settings="chart.settings" :width="chart.width+'px'"/>
			<q-resize-observer @resize="onResize"/>
		</div>
	</q-page>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import {Index, stats, Value, vars} from "src/model/models";
import "echarts/lib/component/dataZoom";
import "echarts/lib/component/markLine";
import "echarts/lib/component/markArea";
import "v-charts/lib/style.css";
import {date, DateLocale} from "quasar";
import {Place, PlaceName, places} from "src/model/place";
import {Data} from "src/model/data";
import _ from "lodash";

interface ChartData {
	columns: string[]
	rows: { [x: string]: string | number }[]
}

const LOCALE_IT: DateLocale = {
	days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
	daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
	months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
	monthsShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
};

@Component({})
export default class Chart extends Vue {
	place: Place = places.italia;
	stat: Value = "nuovi_casi";
	istat: Index = "i_nuovi_casi";
	futureStart = new Date();
	loading = true;
	textColor = this.$q.dark.isActive ? "#fff" : "#000";
	chart = {
		width: 100,
		height: 200,
		data: <ChartData>{
			columns: [],
			rows: []
		},
		settings: {
			labelMap: this.labels,
			axisSite: {
				right: this.indexes
			},
			yAxisType: ["normal", "normal"],
			yAxisName: ["", ""],
			nullAddZero: true,
			smooth: true,
			type: "line"
		},
		extend: {
			textStyle: {
				color: this.textColor
			},
			title: {
				text: "",
				padding: 0,
				left: "center",
				textStyle: {
					color: this.textColor
				}
			},
			legend: {
				padding: [25, 5, 5, 5],
				textStyle: {
					color: this.textColor
				}
			},
			"tooltip.axisPointer.type": "shadow",
			"series.0.type": "line",
			"series.0.symbol": "circle",
			"series.0.symbolSize": 5,
			"series.1.type": "line",
			"series.1.symbol": "none",
			"series.1.lineStyle.width": 1,
			"series.1.markLine": {
				symbol: "none",
				silent: true,
				label: {
					show: false
				},
				lineStyle: {
					color: this.textColor,
					width: 1.3
				},
				data: [{
					yAxis: 1
				}]
			},
			"xAxis.0.scale": true,
			"xAxis.0.max": "dataMax",
			"xAxis.0.min": this.formatDate(new Date("2020-02-24")),
			"xAxis.0.axisLabel.formatter"(value: string) {
				return value ? value.substring(value.indexOf(", ") + 2, value.lastIndexOf("/")) : "";
			},
			"yAxis.0.splitLine.lineStyle.color": "rgba(128, 128, 128, 0.2)",
			"yAxis.1.splitLine.lineStyle.color": "rgba(128, 128, 128, 0.2)"
		},
		colors: ["#4472C4", "#BF9000"],
		dataZoom: [
			{
				type: "slider",
				show: true,
				labelFormatter(value: number, valueStr: string) {
					return valueStr ? valueStr.substring(valueStr.indexOf(", ") + 2) : "";
				},
				textStyle: {
					color: this.textColor
				}
			},
			{
				type: "inside"
			}
		],
		markArea: {
			silent: true,
			label: {
				color: this.textColor
			},
			itemStyle: {
				color: "#22222222"
			},
			data: [
				[{
					xAxis: "max",
					name: "Proiezione"
				}, {
					xAxis: "max"
				}]
			]
		}
	};

	get indexes(): string[] {
		return _.flatMap(_.keys(stats), (s: string) => _.keys(vars).map((v: string) => "i_" + v + "_" + s));
	}

	get labels() {
		return _.fromPairs(_.flatMap(_.flatMap(_.entries(stats), ([sk, sv]) => {
			return sv.index ? [["totale_" + sk, sv.long]] : _.entries(vars).map(([vk, vv]) => {
				return [vk + "_" + sk, (sv.ratio ? vv.ratio : vv.normal) + " " + sv.long];
			});
		}), ([k, v]) => [
			[k, _.upperFirst(v.trim())],
			["i_" + k, "Crescita " + v.trim()]
		]));
	}

	init() {
		this.loading = true;
		this.place = places[<PlaceName>this.$route.params.place];
		this.stat = <Value>(this.$route.params.var + "_" + this.$route.params.stat);
		this.istat = <Index>("i_" + this.stat);
		Data.getInstance()
			.then((instance: Data) => ({instance, value: instance.get(this.place.link)}))
			.then(({instance, value}) => ({
				instance,
				value: value.map(it => ({
					data: this.formatDate(it.data),
					...(this.stat in it ? {[this.stat]: it[this.stat]} : {}),
					...(this.istat in it ? {[this.istat]: it[this.istat]} : {})
				}))
			}))
			.then(({instance, value}) => {
				if (value.length > 0) {
					this.chart.data.columns = Object.keys(value[0]);
					this.chart.data.rows = value;
					this.futureStart = instance.futureStart;
					this.chart.markArea.data[0][0].xAxis = this.formatDate(this.futureStart);
					this.chart.extend.title.text = this.place.title;
					let lastData = date.subtractFromDate(this.futureStart, {days: 1});
					this.$root.$emit("updated", instance.updated, lastData);
				}
			})
			.catch(reason => alert(reason))
			.finally(() => {
				this.loading = false;
			});
	}

	onResize(size: { width: number, height: number }) {
		this.chart.height = size.height;
		this.chart.width = size.width;
	}

	onLookaheadChange(value: number) {
		let fdate = date.addToDate(this.futureStart, {days: value});
		this.chart.extend["xAxis.0.max"] = this.formatDate(fdate);
	}

	onHideFirstLockdownChange(value: boolean) {
		this.chart.extend["xAxis.0.min"] = value ? this.formatDate(new Date("2020-05-05")) : "dataMin";
	}

	@Watch("$route")
	route() {
		this.init();
	}

	@Watch("$q.dark.isActive")
	onDarkModeCHange(value: boolean) {
		this.textColor = value ? "#fff" : "#000";
		this.chart.extend.textStyle.color = this.textColor;
		this.chart.extend.legend.textStyle.color = this.textColor;
		this.chart.extend.title.textStyle.color = this.textColor;
		this.chart.dataZoom[0].textStyle!.color = this.textColor;
		this.chart.markArea.itemStyle.color = value ? "#cccccc22" : "#22222222";
		this.chart.markArea.label.color = this.textColor;
		this.chart.extend["series.1.markLine"].lineStyle.color = this.textColor;
	}

	formatDate(date_: Date) {
		return date.formatDate(date_, "dddd, DD/MM/YYYY", LOCALE_IT);
	}

	mounted() {
		this.init();
		this.$root.$on("lookaheadChange", this.onLookaheadChange);
		this.$root.$on("hideFirstLockdownChange", this.onHideFirstLockdownChange);
		this.$root.$on("refresh", this.init);
	}
};
</script>
<style lang="scss">
.q-page {
	min-height: 0 !important;
	height: 100%;
	width: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;

	.chart-container {
		flex: 1 1 0;
		overflow: hidden;
	}
}
</style>
