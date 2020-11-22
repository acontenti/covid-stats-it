<template>
	<q-page :key="$route.params.place" class="column q-px-sm q-py-lg">
		<div class="col-grow fit">
			<ve-line :colors="chart.colors" :data="chart.data" :data-zoom="chart.dataZoom"
					 :extend="chart.extend" :height="chart.height+'px'" :mark-area="chart.markArea"
					 :mark-line="chart.markLine" :settings="chart.settings" :width="chart.width+'px'"></ve-line>
			<q-resize-observer @resize="onResize"/>
		</div>
	</q-page>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {Data, Place, places} from "components/models";
import "echarts/lib/component/dataZoom";
import "echarts/lib/component/markLine";
import "echarts/lib/component/markArea";

interface ChartData {
	columns: string[]
	rows: { [x: string]: string | number }[]
}

@Component({})
export default class PageIndex extends Vue {
	place: Place = places[0];
	chart = {
		width: 100,
		height: 500,
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
			"series.0.markArea": undefined,
			"series.0.symbol": "circle",
			"series.0.symbolSize": 5,
			"series.1.symbol": "none",
			"series.1.lineStyle.width": 1,
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
		this.place = places.find(({link}) => link == this.$route.params.place)!;
		Data.getInstance()
			.then((instance: Data) => ({instance, value: instance.get(this.place)}))
			.then(({instance, value}) => ({
				instance,
				value: value.map(it => ({
					"data": Data.timeFormat(it.data),
					"nuovi_positivi": it.nuovi_positivi,
					"i_nuovi_positivi": it.i_nuovi_positivi
				}))
			}))
			.then(({instance, value}) => {
				if (value.length > 0) {
					this.chart.data.columns = Object.keys(value[0]);
					this.chart.data.rows = value;
					this.chart.markArea.data[0][0].xAxis = Data.timeFormat(instance.futureStart());
					this.chart.extend.title.text = this.place.title;
				}
			})
			.catch(reason => alert(reason));
	}

	onResize(size: { width: number, height: number }) {
		console.log(size.height);
		this.chart.height = size.height;
		this.chart.width = size.width;
	}

	mounted() {
		this.init();
	}

	updated() {
		this.init();
	}
};
</script>
<style lang="scss">
.q-page {
	min-height: inherit;
	height: calc(100vh - 50px);
}
</style>
