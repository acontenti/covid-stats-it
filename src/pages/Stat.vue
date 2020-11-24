<template>
	<q-page :key="this.place.link+this.stat" class="no-wrap q-px-sm q-py-md items-end">
		<div class="chart-container fit">
			<ve-line :colors="chart.colors" :data="chart.data" :data-zoom="chart.dataZoom" :extend="chart.extend"
					 :height="chart.height+'px'" :loading="loading" :mark-area="chart.markArea"
					 :mark-line="chart.markLine" :settings="chart.settings" :width="chart.width+'px'"/>
			<q-resize-observer @resize="onResize"/>
		</div>
	</q-page>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import {Data, Indexes, Place, places, Values} from "components/models";
import "echarts/lib/component/dataZoom";
import "echarts/lib/component/markLine";
import "echarts/lib/component/markArea";
import "v-charts/lib/style.css";
import {date} from "quasar";

interface ChartData {
	columns: string[]
	rows: { [x: string]: string | number }[]
}

@Component({})
export default class Stat extends Vue {
	place: Place = places.italia;
	stat: keyof Values = "nuovi_positivi";
	istat: keyof Indexes = "i_nuovi_positivi";
	futureStart = new Date();
	loading = true;
	chart = {
		width: 100,
		height: 200,
		data: <ChartData>{
			columns: [],
			rows: []
		},
		settings: {
			labelMap: {
				"data": "Data",
				"nuovi_positivi": "Nuovi casi",
				"i_nuovi_positivi": "Crescita nuovi casi",
				"nuovi_guariti": "Nuovi guariti",
				"i_nuovi_guariti": "Crescita nuovi guariti",
				"nuovi_deceduti": "Nuovi deceduti",
				"i_nuovi_deceduti": "Crescita nuovi deceduti",
				"nuovi_tamponi": "Nuovi tamponi",
				"i_nuovi_tamponi": "Crescita nuovi tamponi"
			},
			axisSite: {right: ["i_nuovi_positivi", "i_nuovi_guariti", "i_nuovi_deceduti", "i_nuovi_tamponi"]},
			yAxisType: ["normal", "normal"],
			yAxisName: ["", ""]
		},
		extend: {
			title: {
				text: "",
				left: "center"
			},
			legend: {
				padding: [35, 5, 5, 5]
			},
			"tooltip.axisPointer.type": "shadow",
			"series.0.markLine": undefined,
			"series.0.symbol": "circle",
			"series.0.symbolSize": 5,
			"series.1.symbol": "none",
			"series.1.lineStyle.width": 1,
			"xAxis.0.max": "dataMax",
			"xAxis.0.axisLabel.formatter": (value: string) => {
				return value.substring(value.indexOf(", ") + 2, value.lastIndexOf("/"));
			}
		},
		colors: ["#4472C4", "#BF9000"],
		dataZoom: [
			{
				type: "slider",
				show: true,
				labelFormatter: (value: number, valueStr: string) => {
					return valueStr.substring(valueStr.indexOf(", ") + 2);
				}
			},
			{
				type: "inside"
			}
		],
		markLine: {
			symbol: "none",
			silent: true,
			label: {
				show: false
			},
			data: [{
				yAxis: 1,
				lineStyle: {
					color: "#000"
				}
			}]
		},
		markArea: {
			silent: true,
			label: {
				color: "#000"
			},
			data: [
				[{
					xAxis: "max",
					name: "Proiezione",
					itemStyle: {
						color: "#22222222"
					}
				}, {
					xAxis: "max"
				}]
			]
		}
	};

	init() {
		this.loading = true;
		this.place = places[<keyof typeof places>this.$route.params.place];
		this.stat = <keyof Values>(this.$route.params.stat);
		this.istat = <keyof Indexes>("i_" + this.stat);
		Data.getInstance()
			.then((instance: Data) => ({instance, value: instance.get(this.place)}))
			.then(({instance, value}) => ({
				instance,
				value: value.map(it => ({
					"data": Data.timeFormat(it.data),
					[this.stat]: it[this.stat],
					[this.istat]: it[this.istat]
				}))
			}))
			.then(({instance, value}) => {
				if (value.length > 0) {
					this.chart.data.columns = Object.keys(value[0]);
					this.chart.data.rows = value;
					this.futureStart = instance.futureStart();
					this.chart.markArea.data[0][0].xAxis = Data.timeFormat(this.futureStart);
					this.chart.extend.title.text = this.place.title;
					this.$root.$emit("updated", instance.updated)
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
		this.chart.extend["xAxis.0.max"] = Data.timeFormat(fdate);
	}

	@Watch("$route")
	route() {
		this.init();
	}

	mounted() {
		this.init();
		this.$root.$on("lookaheadChange", this.onLookaheadChange);
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
