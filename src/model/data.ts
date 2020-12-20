import {Place, PlaceName, places, placeTypes} from "src/model/place";
import axios from "axios";
import _ from "lodash";
import {Datum, RawDatum, Values} from "src/model/models";
import {date} from "quasar";

export class Data {
	public static readonly lookahead = 60;
	private static readonly MAX = 60000000;
	private static readonly DAY = 1000 * 60 * 60 * 24;
	private static instance?: Data = undefined;
	private readonly data: Map<PlaceName, Datum[]>;

	public readonly updated: Date;

	private constructor(data: Map<PlaceName, Datum[]>) {
		this.data = data;
		this.updated = new Date();
	}

	public get(place: PlaceName): Datum[] {
		return this.data.get(place)!;
	}

	public get futureStart(): Date {
		return (this.data.get("italia")!.find(it => it.projection) ?? {data: new Date()}).data;
	}

	public static async getInstance(): Promise<Data> {
		if (!this.instance) {
			const data = new Map<PlaceName, Datum[]>();
			for (const [typename, type] of Object.entries(placeTypes)) {
				const response = await axios.get(type.url);
				let placeData: RawDatum[] = response.data;
				if (placeData) {
					Object.values(places).filter((place: Place) => place.type === typename).forEach((place: Place) => {
						let input = placeData.filter((it: RawDatum) => type.filter(it, place));
						if (input.length > 0)
							data.set(place.link, this.elaborateData(input));
					});
				} else throw new Error(`Cannot load ${type} data`);
			}
			this.instance = new Data(data);
		}
		return this.instance;
	}

	private static elaborateData(input: RawDatum[]): Datum[] {
		const result: Datum[] = [];
		const min = _.minBy(input, "data");
		const max = _.maxBy(input, "data");
		const startDate = date.adjustDate(min?.data!, {hours: 12});
		const endDate = date.adjustDate(date.addToDate(max?.data!, {days: this.lookahead + 1}), {hours: 12});
		const dates = _.range(startDate.valueOf(), endDate.valueOf(), Data.DAY).map(it => new Date(it));
		dates.forEach((it: Date, index: number) => {
			result.push(this.createDatum(it, index, input[index], input[index - 1] ?? {}, result));
		});
		return result;
	}

	private static createDatum(date: Date, index: number, datum: RawDatum, last: RawDatum, result: Datum[]): Datum {
		const i_totale_casi = this.calcGrowth(result, index, "totale_casi");
		const i_totale_positivi = this.calcGrowth(result, index, "totale_positivi");
		const i_totale_deceduti = this.calcGrowth(result, index, "totale_deceduti");
		const i_totale_guariti = this.calcGrowth(result, index, "totale_guariti");
		const i_totale_ricoverati = this.calcGrowth(result, index, "totale_ricoverati");
		const i_totale_intensiva = this.calcGrowth(result, index, "totale_intensiva");
		const i_totale_isolamento = this.calcGrowth(result, index, "totale_isolamento");
		const i_totale_tamponi = this.calcGrowth(result, index, "totale_tamponi");
		const i_totale_testati = this.calcGrowth(result, index, "totale_testati");
		const i_totale_casi_tamponi = this.calcGrowth(result, index, "totale_casi_tamponi");
		const i_totale_casi_testati = this.calcGrowth(result, index, "totale_casi_testati");
		const i_nuovi_casi = this.calcGrowth(result, index, "nuovi_casi");
		const i_nuovi_positivi = this.calcGrowth(result, index, "nuovi_positivi", true);
		const i_nuovi_deceduti = this.calcGrowth(result, index, "nuovi_deceduti");
		const i_nuovi_guariti = this.calcGrowth(result, index, "nuovi_guariti");
		const i_nuovi_ricoverati = this.calcGrowth(result, index, "nuovi_ricoverati", true);
		const i_nuovi_intensiva = this.calcGrowth(result, index, "nuovi_intensiva", true);
		const i_nuovi_isolamento = this.calcGrowth(result, index, "nuovi_isolamento", true);
		const i_nuovi_tamponi = this.calcGrowth(result, index, "nuovi_tamponi");
		const i_nuovi_testati = this.calcGrowth(result, index, "nuovi_testati");
		const i_nuovi_casi_tamponi = this.calcGrowth(result, index, "nuovi_casi_tamponi");
		const i_nuovi_casi_testati = this.calcGrowth(result, index, "nuovi_casi_testati");
		let nuovi_casi: number, nuovi_positivi: number, nuovi_deceduti: number, nuovi_guariti: number,
			nuovi_ricoverati: number, nuovi_intensiva: number, nuovi_isolamento: number,
			nuovi_tamponi: number, nuovi_testati: number, nuovi_casi_tamponi: number, nuovi_casi_testati: number,
			totale_casi: number, totale_positivi: number, totale_deceduti: number, totale_guariti: number,
			totale_ricoverati: number, totale_intensiva: number, totale_isolamento: number,
			totale_tamponi: number, totale_testati: number, totale_casi_tamponi: number, totale_casi_testati: number;
		if (datum) {
			totale_casi = Math.round(Math.max(datum.totale_casi ?? 0, 0));
			totale_positivi = Math.round(Math.max(datum.totale_positivi ?? 0, 0));
			totale_deceduti = Math.round(Math.max(datum.deceduti ?? 0, 0));
			totale_guariti = Math.round(Math.max(datum.dimessi_guariti ?? 0, 0));
			totale_ricoverati = Math.round(Math.max(datum.ricoverati_con_sintomi ?? 0, 0));
			totale_intensiva = Math.round(Math.max(datum.terapia_intensiva ?? 0, 0));
			totale_isolamento = Math.round(Math.max(datum.isolamento_domiciliare ?? 0, 0));
			totale_tamponi = Math.round(Math.max(datum.tamponi ?? 0, 0));
			totale_testati = Math.round(Math.max(datum.casi_testati ?? 0, 0));
			totale_casi_tamponi = Math.min(totale_casi / totale_tamponi * 100, 100);
			totale_casi_testati = Math.min(totale_casi / totale_testati * 100, 100);
			nuovi_casi = Math.round(Math.max(datum.nuovi_positivi ?? 0, 0));
			nuovi_positivi = Math.round(datum.variazione_totale_positivi ?? 0);
			nuovi_deceduti = Math.round(Math.max((datum.deceduti ?? 0) - (last.deceduti ?? 0), 0));
			nuovi_guariti = Math.round(Math.max((datum.dimessi_guariti ?? 0) - (last.dimessi_guariti ?? 0), 0));
			nuovi_ricoverati = Math.round((datum.ricoverati_con_sintomi ?? 0) - (last.ricoverati_con_sintomi ?? 0));
			nuovi_intensiva = Math.round((datum.terapia_intensiva ?? 0) - (last.terapia_intensiva ?? 0));
			nuovi_isolamento = Math.round((datum.isolamento_domiciliare ?? 0) - (last.isolamento_domiciliare ?? 0));
			nuovi_tamponi = Math.round((datum.tamponi ?? 0) - (last.tamponi ?? 0));
			if (nuovi_tamponi < 0)
				nuovi_tamponi = Math.round(this.calcFuture(result, index - 1, "nuovi_tamponi", i_nuovi_tamponi));
			nuovi_testati = Math.round((datum.casi_testati ?? 0) - (last.casi_testati ?? 0));
			if (nuovi_testati < 0)
				nuovi_testati = Math.round(this.calcFuture(result, index - 1, "nuovi_testati", i_nuovi_testati));
			nuovi_casi_tamponi = Math.min(nuovi_casi / nuovi_tamponi * 100, 100);
			nuovi_casi_testati = Math.min(nuovi_casi / nuovi_testati * 100, 100);
		} else {
			totale_casi = Math.round(this.calcFuture(result, index, "totale_casi", i_totale_casi));
			totale_positivi = Math.round(this.calcFuture(result, index, "totale_positivi", i_totale_positivi));
			totale_deceduti = Math.round(this.calcFuture(result, index, "totale_deceduti", i_totale_deceduti));
			totale_guariti = Math.round(this.calcFuture(result, index, "totale_guariti", i_totale_guariti));
			totale_ricoverati = Math.round(this.calcFuture(result, index, "totale_ricoverati", i_totale_ricoverati));
			totale_intensiva = Math.round(this.calcFuture(result, index, "totale_intensiva", i_totale_intensiva));
			totale_isolamento = Math.round(this.calcFuture(result, index, "totale_isolamento", i_totale_isolamento));
			totale_tamponi = Math.round(this.calcFuture(result, index, "totale_tamponi", i_totale_tamponi));
			totale_testati = Math.round(this.calcFuture(result, index, "totale_testati", i_totale_testati));
			totale_casi_tamponi = Math.min(this.calcFuture(result, index, "totale_casi_tamponi", i_totale_casi_tamponi), 100);
			totale_casi_testati = Math.min(this.calcFuture(result, index, "totale_casi_testati", i_totale_casi_testati), 100);
			nuovi_casi = Math.round(this.calcFuture(result, index, "nuovi_casi", i_nuovi_casi));
			nuovi_positivi = Math.round(this.calcFuture(result, index, "nuovi_positivi", i_nuovi_positivi, true));
			nuovi_deceduti = Math.round(this.calcFuture(result, index, "nuovi_deceduti", i_nuovi_deceduti));
			nuovi_guariti = Math.round(this.calcFuture(result, index, "nuovi_guariti", i_nuovi_guariti));
			nuovi_ricoverati = Math.round(this.calcFuture(result, index, "nuovi_ricoverati", i_nuovi_ricoverati, true));
			nuovi_intensiva = Math.round(this.calcFuture(result, index, "nuovi_intensiva", i_nuovi_intensiva, true));
			nuovi_isolamento = Math.round(this.calcFuture(result, index, "nuovi_isolamento", i_nuovi_isolamento, true));
			nuovi_tamponi = Math.round(this.calcFuture(result, index, "nuovi_tamponi", i_nuovi_tamponi));
			nuovi_testati = Math.round(this.calcFuture(result, index, "nuovi_testati", i_nuovi_testati));
			nuovi_casi_tamponi = Math.min(this.calcFuture(result, index, "nuovi_casi_tamponi", i_nuovi_casi_tamponi), 100);
			nuovi_casi_testati = Math.min(this.calcFuture(result, index, "nuovi_casi_testati", i_nuovi_casi_testati), 100);
		}
		return {
			data: date,
			totale_casi: isFinite(totale_casi) ? totale_casi : 0,
			totale_positivi: isFinite(totale_positivi) ? totale_positivi : 0,
			totale_deceduti: isFinite(totale_deceduti) ? totale_deceduti : 0,
			totale_guariti: isFinite(totale_guariti) ? totale_guariti : 0,
			totale_ricoverati: isFinite(totale_ricoverati) ? totale_ricoverati : 0,
			totale_intensiva: isFinite(totale_intensiva) ? totale_intensiva : 0,
			totale_isolamento: isFinite(totale_isolamento) ? totale_isolamento : 0,
			totale_tamponi: isFinite(totale_tamponi) ? totale_tamponi : 0,
			totale_testati: isFinite(totale_testati) ? totale_testati : 0,
			totale_casi_tamponi: isFinite(totale_casi_tamponi) ? totale_casi_tamponi : 0,
			totale_casi_testati: isFinite(totale_casi_testati) ? totale_casi_testati : 0,
			nuovi_casi: isFinite(nuovi_casi) ? nuovi_casi : 0,
			nuovi_positivi: isFinite(nuovi_positivi) ? nuovi_positivi : 0,
			nuovi_deceduti: isFinite(nuovi_deceduti) ? nuovi_deceduti : 0,
			nuovi_guariti: isFinite(nuovi_guariti) ? nuovi_guariti : 0,
			nuovi_ricoverati: isFinite(nuovi_ricoverati) ? nuovi_ricoverati : 0,
			nuovi_intensiva: isFinite(nuovi_intensiva) ? nuovi_intensiva : 0,
			nuovi_isolamento: isFinite(nuovi_isolamento) ? nuovi_isolamento : 0,
			nuovi_tamponi: isFinite(nuovi_tamponi) ? nuovi_tamponi : 0,
			nuovi_testati: isFinite(nuovi_testati) ? nuovi_testati : 0,
			nuovi_casi_tamponi: isFinite(nuovi_casi_tamponi) ? nuovi_casi_tamponi : 0,
			nuovi_casi_testati: isFinite(nuovi_casi_testati) ? nuovi_casi_testati : 0,
			i_totale_casi: isFinite(i_totale_casi) ? i_totale_casi : 0,
			i_totale_positivi: isFinite(i_totale_positivi) ? i_totale_positivi : 0,
			i_totale_deceduti: isFinite(i_totale_deceduti) ? i_totale_deceduti : 0,
			i_totale_guariti: isFinite(i_totale_guariti) ? i_totale_guariti : 0,
			i_totale_ricoverati: isFinite(i_totale_ricoverati) ? i_totale_ricoverati : 0,
			i_totale_intensiva: isFinite(i_totale_intensiva) ? i_totale_intensiva : 0,
			i_totale_isolamento: isFinite(i_totale_isolamento) ? i_totale_isolamento : 0,
			i_totale_tamponi: isFinite(i_totale_tamponi) ? i_totale_tamponi : 0,
			i_totale_testati: isFinite(i_totale_testati) ? i_totale_testati : 0,
			i_totale_casi_tamponi: isFinite(i_totale_casi_tamponi) ? i_totale_casi_tamponi : 0,
			i_totale_casi_testati: isFinite(i_totale_casi_testati) ? i_totale_casi_testati : 0,
			i_nuovi_casi: isFinite(i_nuovi_casi) ? i_nuovi_casi : 0,
			i_nuovi_positivi: isFinite(i_nuovi_positivi) ? i_nuovi_positivi : 0,
			i_nuovi_deceduti: isFinite(i_nuovi_deceduti) ? i_nuovi_deceduti : 0,
			i_nuovi_guariti: isFinite(i_nuovi_guariti) ? i_nuovi_guariti : 0,
			i_nuovi_ricoverati: isFinite(i_nuovi_ricoverati) ? i_nuovi_ricoverati : 0,
			i_nuovi_intensiva: isFinite(i_nuovi_intensiva) ? i_nuovi_intensiva : 0,
			i_nuovi_isolamento: isFinite(i_nuovi_isolamento) ? i_nuovi_isolamento : 0,
			i_nuovi_tamponi: isFinite(i_nuovi_tamponi) ? i_nuovi_tamponi : 0,
			i_nuovi_testati: isFinite(i_nuovi_testati) ? i_nuovi_testati : 0,
			i_nuovi_casi_tamponi: isFinite(i_nuovi_casi_tamponi) ? i_nuovi_casi_tamponi : 0,
			i_nuovi_casi_testati: isFinite(i_nuovi_casi_testati) ? i_nuovi_casi_testati : 0,
			projection: !datum
		};
	}

	private static calcFuture(input: Datum[], index: number, property: keyof Values, growth: number, sum = false): number {
		const last1 = input[index - 7] ?? {};
		const last2 = input[index - 14] ?? {};
		const avg = [];
		if (property in last1) {
			const value = last1[property];
			if (Number.isFinite(value))
				if (sum)
					avg.push((value + growth));
				else
					avg.push(value * growth);
		}
		if (property in last2) {
			const value = last2[property];
			if (Number.isFinite(value))
				if (sum)
					avg.push((value + growth + growth));
				else
					avg.push(value * growth * growth);
		}
		return _.clamp(_.mean(avg) ?? 0, -Data.MAX, Data.MAX);
	}

	private static calcGrowth(input: Datum[], index: number, property: keyof Values, subtract = false): number {
		const avg = [];
		for (let i = 1; i <= 7; i++) {
			const d1 = input[index - i] ?? {}, d2 = input[index - (i + 7)] ?? {};
			const value1 = property in d1 ? d1[property] : 0;
			const value2 = property in d2 ? d2[property] : 0;
			const result = subtract ? value1 - value2 : value1 / value2;
			avg.push(Number.isFinite(result) ? result : 0);
		}
		return _.mean(avg) ?? 0;
	}

	public static reset() {
		this.instance = undefined;
	}
}
