import {Datum, RawDatum, Value} from "src/model/models";
import _ from "lodash";
import {Place} from "src/model/place";
import {date} from "quasar";

export const lookahead = 60;
const DAY = 1000 * 60 * 60 * 24;

export function elaborateData(input: RawDatum[], place: Place): Datum[] {
	const result: Datum[] = [];
	const min = _.minBy(input, "data");
	const max = _.maxBy(input, "data");
	const startDate = date.adjustDate(min?.data!, {hours: 12});
	const endDate = date.adjustDate(date.addToDate(max?.data!, {days: lookahead + 1}), {hours: 12});
	const dates = _.range(startDate.valueOf(), endDate.valueOf(), DAY).map(it => new Date(it));
	dates.forEach((it: Date, index: number) => {
		result.push(createDatum(it, index, input[index], input[index - 1] ?? {}, result, place));
	});
	return result;
}

function createDatum(date: Date, index: number, datum: RawDatum, last: RawDatum, result: Datum[], place: Place): Datum {
	const i_rt = calcGrowth(result, index, "totale_rt");
	const i_totale_casi = calcGrowth(result, index, "totale_casi");
	const i_totale_positivi = calcGrowth(result, index, "totale_positivi");
	const i_totale_deceduti = calcGrowth(result, index, "totale_deceduti");
	const i_totale_guariti = calcGrowth(result, index, "totale_guariti");
	const i_totale_ricoverati = calcGrowth(result, index, "totale_ricoverati");
	const i_totale_intensiva = calcGrowth(result, index, "totale_intensiva");
	const i_totale_isolamento = calcGrowth(result, index, "totale_isolamento");
	const i_totale_tamponi = calcGrowth(result, index, "totale_tamponi");
	const i_totale_testati = calcGrowth(result, index, "totale_testati");
	const i_totale_casi_tamponi = calcGrowth(result, index, "totale_casi_tamponi");
	const i_totale_casi_testati = calcGrowth(result, index, "totale_casi_testati");
	const i_nuovi_casi = calcGrowth(result, index, "nuovi_casi");
	const i_nuovi_positivi = calcGrowth(result, index, "nuovi_positivi", true);
	const i_nuovi_deceduti = calcGrowth(result, index, "nuovi_deceduti");
	const i_nuovi_guariti = calcGrowth(result, index, "nuovi_guariti");
	const i_nuovi_ricoverati = calcGrowth(result, index, "nuovi_ricoverati", true);
	const i_nuovi_intensiva = calcGrowth(result, index, "nuovi_intensiva", true);
	const i_nuovi_isolamento = calcGrowth(result, index, "nuovi_isolamento", true);
	const i_nuovi_tamponi = calcGrowth(result, index, "nuovi_tamponi");
	const i_nuovi_testati = calcGrowth(result, index, "nuovi_testati");
	const i_nuovi_casi_tamponi = calcGrowth(result, index, "nuovi_casi_tamponi");
	const i_nuovi_casi_testati = calcGrowth(result, index, "nuovi_casi_testati");
	let nuovi_casi: number, nuovi_positivi: number, nuovi_deceduti: number, nuovi_guariti: number,
		nuovi_ricoverati: number, nuovi_intensiva: number, nuovi_isolamento: number,
		nuovi_tamponi: number, nuovi_testati: number, nuovi_casi_tamponi: number, nuovi_casi_testati: number,
		rt: number,
		totale_casi: number, totale_positivi: number, totale_deceduti: number, totale_guariti: number,
		totale_ricoverati: number, totale_intensiva: number, totale_isolamento: number,
		totale_tamponi: number, totale_testati: number, totale_casi_tamponi: number, totale_casi_testati: number;
	if (datum) {
		rt = Math.max(calcRt(result, index), 0);
		totale_casi = _.round(Math.max(datum.totale_casi ?? 0, 0));
		totale_positivi = _.round(Math.max(datum.totale_positivi ?? 0, 0));
		totale_deceduti = _.round(Math.max(datum.deceduti ?? 0, 0));
		totale_guariti = _.round(Math.max(datum.dimessi_guariti ?? 0, 0));
		totale_ricoverati = _.round(Math.max(datum.ricoverati_con_sintomi ?? 0, 0));
		totale_intensiva = _.round(Math.max(datum.terapia_intensiva ?? 0, 0));
		totale_isolamento = _.round(Math.max(datum.isolamento_domiciliare ?? 0, 0));
		totale_tamponi = _.round(Math.max(datum.tamponi ?? 0, 0));
		totale_testati = _.round(Math.max(datum.casi_testati ?? 0, 0));
		totale_casi_tamponi = _.clamp(totale_casi / totale_tamponi * 100, 0, 100);
		totale_casi_testati = _.clamp(totale_casi / totale_testati * 100, 0, 100);
		if ("nuovi_positivi" in datum)
			nuovi_casi = _.round(Math.max(datum.nuovi_positivi ?? 0, 0));
		else
			nuovi_casi = _.round(Math.max((datum.totale_casi ?? 0) - (last.totale_casi ?? 0), 0));
		nuovi_positivi = _.round(datum.variazione_totale_positivi ?? 0);
		nuovi_deceduti = _.round(Math.max((datum.deceduti ?? 0) - (last.deceduti ?? 0), 0));
		nuovi_guariti = _.round(Math.max((datum.dimessi_guariti ?? 0) - (last.dimessi_guariti ?? 0), 0));
		nuovi_ricoverati = _.round((datum.ricoverati_con_sintomi ?? 0) - (last.ricoverati_con_sintomi ?? 0));
		nuovi_intensiva = _.round((datum.terapia_intensiva ?? 0) - (last.terapia_intensiva ?? 0));
		nuovi_isolamento = _.round((datum.isolamento_domiciliare ?? 0) - (last.isolamento_domiciliare ?? 0));
		nuovi_tamponi = _.round((datum.tamponi ?? 0) - (last.tamponi ?? 0));
		if (nuovi_tamponi < 0)
			nuovi_tamponi = _.round(calcFuture(result, index - 1, "nuovi_tamponi", i_nuovi_tamponi, 0, place.population * 10));
		nuovi_testati = _.round((datum.casi_testati ?? 0) - (last.casi_testati ?? 0));
		if (nuovi_testati < 0)
			nuovi_testati = _.round(calcFuture(result, index - 1, "nuovi_testati", i_nuovi_testati, 0, place.population * 10));
		nuovi_casi_tamponi = _.clamp(nuovi_casi / nuovi_tamponi * 100, 0, 100);
		nuovi_casi_testati = _.clamp(nuovi_casi / nuovi_testati * 100, 0, 100);
	} else {
		rt = calcFuture(result, index, "totale_rt", i_rt, 0, 100);
		totale_casi = _.round(calcFuture(result, index, "totale_casi", i_totale_casi, 0, place.population));
		totale_positivi = _.round(calcFuture(result, index, "totale_positivi", i_totale_positivi, 0, place.population));
		totale_deceduti = _.round(calcFuture(result, index, "totale_deceduti", i_totale_deceduti, 0, place.population));
		totale_guariti = _.round(calcFuture(result, index, "totale_guariti", i_totale_guariti, 0, place.population));
		totale_ricoverati = _.round(calcFuture(result, index, "totale_ricoverati", i_totale_ricoverati, 0, place.population));
		totale_intensiva = _.round(calcFuture(result, index, "totale_intensiva", i_totale_intensiva, 0, place.population));
		totale_isolamento = _.round(calcFuture(result, index, "totale_isolamento", i_totale_isolamento, 0, place.population));
		totale_tamponi = _.round(calcFuture(result, index, "totale_tamponi", i_totale_tamponi, 0, place.population * 10));
		totale_testati = _.round(calcFuture(result, index, "totale_testati", i_totale_testati, 0, place.population * 10));
		totale_casi_tamponi = calcFuture(result, index, "totale_casi_tamponi", i_totale_casi_tamponi, 0, 100);
		totale_casi_testati = calcFuture(result, index, "totale_casi_testati", i_totale_casi_testati, 0, 100);
		nuovi_casi = _.round(calcFuture(result, index, "nuovi_casi", i_nuovi_casi, 0, place.population));
		nuovi_positivi = _.round(calcFuture(result, index, "nuovi_positivi", i_nuovi_positivi, 0, place.population, true));
		nuovi_deceduti = _.round(calcFuture(result, index, "nuovi_deceduti", i_nuovi_deceduti, 0, place.population));
		nuovi_guariti = _.round(calcFuture(result, index, "nuovi_guariti", i_nuovi_guariti, 0, place.population));
		nuovi_ricoverati = _.round(calcFuture(result, index, "nuovi_ricoverati", i_nuovi_ricoverati, 0, place.population, true));
		nuovi_intensiva = _.round(calcFuture(result, index, "nuovi_intensiva", i_nuovi_intensiva, 0, place.population, true));
		nuovi_isolamento = _.round(calcFuture(result, index, "nuovi_isolamento", i_nuovi_isolamento, 0, place.population, true));
		nuovi_tamponi = _.round(calcFuture(result, index, "nuovi_tamponi", i_nuovi_tamponi, 0, place.population * 10));
		nuovi_testati = _.round(calcFuture(result, index, "nuovi_testati", i_nuovi_testati, 0, place.population * 10));
		nuovi_casi_tamponi = calcFuture(result, index, "nuovi_casi_tamponi", i_nuovi_casi_tamponi, 0, 100);
		nuovi_casi_testati = calcFuture(result, index, "nuovi_casi_testati", i_nuovi_casi_testati, 0, 100);
	}
	return {
		data: date,
		totale_rt: rt,
		totale_casi,
		totale_positivi,
		totale_deceduti,
		totale_guariti,
		totale_ricoverati,
		totale_intensiva,
		totale_isolamento,
		totale_tamponi,
		totale_testati,
		totale_casi_tamponi,
		totale_casi_testati,
		nuovi_casi,
		nuovi_positivi,
		nuovi_deceduti,
		nuovi_guariti,
		nuovi_ricoverati,
		nuovi_intensiva,
		nuovi_isolamento,
		nuovi_tamponi,
		nuovi_testati,
		nuovi_casi_tamponi,
		nuovi_casi_testati,
		i_totale_casi,
		i_totale_positivi,
		i_totale_deceduti,
		i_totale_guariti,
		i_totale_ricoverati,
		i_totale_intensiva,
		i_totale_isolamento,
		i_totale_tamponi,
		i_totale_testati,
		i_totale_casi_tamponi,
		i_totale_casi_testati,
		i_nuovi_casi,
		i_nuovi_positivi,
		i_nuovi_deceduti,
		i_nuovi_guariti,
		i_nuovi_ricoverati,
		i_nuovi_intensiva,
		i_nuovi_isolamento,
		i_nuovi_tamponi,
		i_nuovi_testati,
		i_nuovi_casi_tamponi,
		i_nuovi_casi_testati,
		projection: !datum
	};
}

function calcFuture(input: Datum[], index: number, property: Value, growth: number, min: number, max: number, sum = false): number {
	const last1 = input[index - 7] ?? {};
	const last2 = input[index - 14] ?? {};
	const avg = [];
	if (property in last1) {
		const value = last1[property];
		if (_.isFinite(value))
			if (sum)
				avg.push((value + growth));
			else
				avg.push(value * growth);
	}
	if (property in last2) {
		const value = last2[property];
		if (_.isFinite(value))
			if (sum)
				avg.push((value + growth + growth));
			else
				avg.push(value * growth * growth);
	}
	return _.clamp(_.mean(avg) ?? 0, min, max);
}

function calcRt(input: Datum[], index: number): number {
	return calcGrowth(input, index, "nuovi_casi", false, 11, 7);
}

function calcGrowth(input: Datum[], index: number, property: Value, subtract = false, D = 7, N = 7): number {
	const avgN = [];
	const avgD = [];
	for (let i = 1; i <= N; i++) {
		const d1 = input[index - i] ?? {}, d2 = input[index - (i + D)] ?? {};
		const value1 = property in d1 ? d1[property] : 0;
		const value2 = property in d2 ? d2[property] : 0;
		avgN.push(value1);
		avgD.push(value2);
	}
	const rt = subtract ? _.mean(avgN) - _.mean(avgD) : _.mean(avgN) / _.mean(avgD);
	return _.isFinite(rt) ? rt : 0;
}
