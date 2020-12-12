import axios from "axios";
import * as d3 from "d3";
import _ from "lodash";

const MAX = 60000000;

const LOCALE_IT: d3.TimeLocaleDefinition = {
	dateTime: "%A %e %B %Y, %X",
	date: "%d/%m/%Y",
	time: "%H:%M:%S",
	periods: ["AM", "PM"],
	days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
	shortDays: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
	months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
	shortMonths: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
};
d3.timeFormatDefaultLocale(LOCALE_IT);

interface RawDatum {
	data: string
	stato: string
	codice_regione?: number
	denominazione_regione?: string
	lat?: number
	long?: number
	ricoverati_con_sintomi?: number
	terapia_intensiva?: number
	totale_ospedalizzati?: number
	isolamento_domiciliare?: number
	totale_positivi?: number
	variazione_totale_positivi?: number
	nuovi_positivi?: number
	dimessi_guariti?: number
	deceduti?: number
	casi_da_sospetto_diagnostico?: number
	casi_da_screening?: number
	totale_casi?: number
	tamponi?: number
	casi_testati?: number
	note?: string
}

export const stats: string[] = ["casi", "positivi", "guariti", "deceduti", "tamponi", "casi_tamponi"];
export const vars: string[] = ["nuovi", "totale"];

interface TotalValues {
	totale_casi: number
	totale_positivi: number
	totale_guariti: number
	totale_deceduti: number
	totale_tamponi: number
	totale_casi_tamponi: number
}

interface DailyValues {
	nuovi_casi: number
	nuovi_positivi: number
	nuovi_guariti: number
	nuovi_deceduti: number
	nuovi_tamponi: number
	nuovi_casi_tamponi: number
}

interface TotalIndexes {
	i_totale_casi: number
	i_totale_positivi: number
	i_totale_guariti: number
	i_totale_deceduti: number
	i_totale_tamponi: number
	i_totale_casi_tamponi: number
}

interface DailyIndexes {
	i_nuovi_casi: number
	i_nuovi_positivi: number
	i_nuovi_guariti: number
	i_nuovi_deceduti: number
	i_nuovi_tamponi: number
	i_nuovi_casi_tamponi: number
}

export interface Values extends DailyValues, TotalValues {
}

export interface Indexes extends DailyIndexes, TotalIndexes {
}

export interface Datum extends Values, Indexes {
	data: Date
	projection: boolean
}

export class Data {
	private readonly data: Map<PlaceName, Datum[]>;
	private static instance?: Data = undefined;
	public static lookahead = 60;
	public static readonly timeFormat = d3.timeFormat("%A, %d/%m/%Y");
	public readonly updated: Date;

	private constructor(data: Map<PlaceName, Datum[]>) {
		this.data = data;
		this.updated = new Date();
	}

	public get(place: PlaceName): Datum[] {
		return this.data.get(place)!;
	}

	public futureStart(): Date {
		return (this.data.get("italia")!.find(it => it.projection) ?? {data: new Date()}).data;
	}

	public static async getInstance(): Promise<Data> {
		if (!this.instance) {
			const data = new Map<PlaceName, Datum[]>();
			const itaResponse = await axios.get("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json");
			if (itaResponse.data !== undefined)
				data.set("italia", this.createStats(itaResponse.data));
			else throw Error("Imposibile caricare dati nazionali");
			const regionalResponse = await axios.get("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json");
			const regionalData = regionalResponse.data;
			if (regionalData !== undefined) {
				Object.values(places).forEach(place => {
					if (place !== places.italia) {
						const value = regionalData.filter((it: RawDatum) => it.codice_regione == place.code);
						data.set(place.link, this.createStats(value));
					}
				});
			} else throw Error("Impossibile scaricare i dati regionali");
			this.instance = new Data(data);
		}
		return this.instance;
	}

	private static createStats(input: RawDatum[]): Datum[] {
		let extent = d3.extent(input, datum => Date.parse(datum.data));
		let startDate = d3.timeDay.offset(new Date(extent[0]!), -1);
		let endDate = d3.timeDay.offset(new Date(extent[1]!), this.lookahead);
		let dates = d3.timeDay.range(startDate, endDate, 1);
		const result: Datum[] = [];
		dates.forEach((it: Date, index: number) => result.push(this.elaborateDatum(it, index, input, result)));
		return result;
	}

	private static elaborateDatum(date: Date, index: number, input: RawDatum[], result: Datum[]): Datum {
		const rawDatum = input[index];
		const lastDatum = input[index - 1] ?? {};
		const i_totale_casi = this.calcGrowth(result, index, "totale_casi");
		const i_totale_positivi = this.calcGrowth(result, index, "totale_positivi");
		const i_totale_deceduti = this.calcGrowth(result, index, "totale_deceduti");
		const i_totale_guariti = this.calcGrowth(result, index, "totale_guariti");
		const i_totale_tamponi = this.calcGrowth(result, index, "totale_tamponi");
		const i_totale_casi_tamponi = this.calcGrowth(result, index, "totale_casi_tamponi");
		const i_nuovi_casi = this.calcGrowth(result, index, "nuovi_casi");
		const i_nuovi_positivi = this.calcGrowth(result, index, "nuovi_positivi", 1000);
		const i_nuovi_guariti = this.calcGrowth(result, index, "nuovi_guariti");
		const i_nuovi_deceduti = this.calcGrowth(result, index, "nuovi_deceduti");
		const i_nuovi_tamponi = this.calcGrowth(result, index, "nuovi_tamponi");
		const i_nuovi_casi_tamponi = this.calcGrowth(result, index, "nuovi_casi_tamponi");
		let nuovi_casi: number, nuovi_positivi: number, nuovi_guariti: number, nuovi_deceduti: number,
			nuovi_tamponi: number, nuovi_casi_tamponi: number,
			totale_casi: number, totale_positivi: number, totale_deceduti: number, totale_guariti: number,
			totale_tamponi: number, totale_casi_tamponi: number;
		if (rawDatum) {
			totale_casi = Math.round(Math.max(rawDatum.totale_casi ?? 0, 0));
			totale_positivi = Math.round(Math.max(rawDatum.totale_positivi ?? 0, 0));
			totale_deceduti = Math.round(Math.max(rawDatum.deceduti ?? 0, 0));
			totale_guariti = Math.round(Math.max(rawDatum.dimessi_guariti ?? 0, 0));
			totale_tamponi = Math.round(Math.max(rawDatum.tamponi ?? 0, 0));
			totale_casi_tamponi = Math.min(totale_casi / totale_tamponi * 100, 100);
			nuovi_casi = Math.round(Math.max(rawDatum.nuovi_positivi ?? 0, 0));
			nuovi_positivi = Math.round(rawDatum.variazione_totale_positivi ?? 0);
			nuovi_deceduti = Math.round(Math.max((rawDatum.deceduti ?? 0) - (lastDatum.deceduti ?? 0), 0));
			nuovi_guariti = Math.round(Math.max((rawDatum.dimessi_guariti ?? 0) - (lastDatum.dimessi_guariti ?? 0), 0));
			nuovi_tamponi = Math.round(Math.max((rawDatum.tamponi ?? 0) - (lastDatum.tamponi ?? 0), 0));
			nuovi_casi_tamponi = Math.min(nuovi_casi / nuovi_tamponi * 100, 100);
		} else {
			totale_casi = Math.round(this.calcFuture(result, index, "totale_casi", i_totale_casi));
			totale_positivi = Math.round(this.calcFuture(result, index, "totale_positivi", i_totale_positivi));
			totale_deceduti = Math.round(this.calcFuture(result, index, "totale_deceduti", i_totale_deceduti));
			totale_guariti = Math.round(this.calcFuture(result, index, "totale_guariti", i_totale_guariti));
			totale_tamponi = Math.round(this.calcFuture(result, index, "totale_tamponi", i_totale_tamponi));
			totale_casi_tamponi = Math.min(this.calcFuture(result, index, "totale_casi_tamponi", i_totale_casi_tamponi), 100);
			nuovi_casi = Math.round(this.calcFuture(result, index, "nuovi_casi", i_nuovi_casi));
			nuovi_positivi = Math.round(this.calcFuture(result, index, "nuovi_positivi", i_nuovi_positivi));
			nuovi_deceduti = Math.round(this.calcFuture(result, index, "nuovi_deceduti", i_nuovi_deceduti));
			nuovi_guariti = Math.round(this.calcFuture(result, index, "nuovi_guariti", i_nuovi_guariti));
			nuovi_tamponi = Math.round(this.calcFuture(result, index, "nuovi_tamponi", i_nuovi_tamponi));
			nuovi_casi_tamponi = Math.min(this.calcFuture(result, index, "nuovi_casi_tamponi", i_nuovi_casi_tamponi), 100);
		}
		return {
			data: date,
			totale_casi: isFinite(totale_casi) ? totale_casi : 0,
			totale_positivi: isFinite(totale_positivi) ? totale_positivi : 0,
			totale_deceduti: isFinite(totale_deceduti) ? totale_deceduti : 0,
			totale_guariti: isFinite(totale_guariti) ? totale_guariti : 0,
			totale_tamponi: isFinite(totale_tamponi) ? totale_tamponi : 0,
			totale_casi_tamponi: isFinite(totale_casi_tamponi) ? totale_casi_tamponi : 0,
			nuovi_casi: isFinite(nuovi_casi) ? nuovi_casi : 0,
			nuovi_positivi: isFinite(nuovi_positivi) ? nuovi_positivi : 0,
			nuovi_deceduti: isFinite(nuovi_deceduti) ? nuovi_deceduti : 0,
			nuovi_guariti: isFinite(nuovi_guariti) ? nuovi_guariti : 0,
			nuovi_tamponi: isFinite(nuovi_tamponi) ? nuovi_tamponi : 0,
			nuovi_casi_tamponi: isFinite(nuovi_casi_tamponi) ? nuovi_casi_tamponi : 0,
			i_totale_casi: isFinite(i_totale_casi) ? i_totale_casi : 0,
			i_totale_positivi: isFinite(i_totale_positivi) ? i_totale_positivi : 0,
			i_totale_guariti: isFinite(i_totale_guariti) ? i_totale_guariti : 0,
			i_totale_deceduti: isFinite(i_totale_deceduti) ? i_totale_deceduti : 0,
			i_totale_tamponi: isFinite(i_totale_tamponi) ? i_totale_tamponi : 0,
			i_totale_casi_tamponi: isFinite(i_totale_casi_tamponi) ? i_totale_casi_tamponi : 0,
			i_nuovi_casi: isFinite(i_nuovi_casi) ? i_nuovi_casi : 0,
			i_nuovi_positivi: isFinite(i_nuovi_positivi) ? i_nuovi_positivi : 0,
			i_nuovi_guariti: isFinite(i_nuovi_guariti) ? i_nuovi_guariti : 0,
			i_nuovi_deceduti: isFinite(i_nuovi_deceduti) ? i_nuovi_deceduti : 0,
			i_nuovi_tamponi: isFinite(i_nuovi_tamponi) ? i_nuovi_tamponi : 0,
			i_nuovi_casi_tamponi: isFinite(i_nuovi_casi_tamponi) ? i_nuovi_casi_tamponi : 0,
			projection: !rawDatum
		};
	}

	private static calcFuture(input: Datum[], index: number, property: keyof Values, growth: number): number {
		const last1 = input[index - 7] ?? {};
		const avg = [];
		if (property in last1) {
			const value = last1[property];
			if (Number.isFinite(value))
				avg.push(value * growth);
		}
		return _.clamp(d3.mean(avg) ?? 0, -MAX, MAX);
	}

	private static calcGrowth(input: Datum[], index: number, property: keyof Values, smooth: number = 1): number {
		const avg = [];
		for (let i = 1; i <= 7; i++) {
			const d1 = input[index - i] ?? {}, d2 = input[index - (i + 7)] ?? {};
			const value1 = property in d1 ? Math.abs(d1[property]) : 0;
			const value2 = property in d2 ? Math.abs(d2[property]) : 0;
			const result = (value2 == 0 ? 0 : (value1 + smooth)) / (value2 == 0 ? 0 : (value2 + smooth));
			avg.push(Number.isFinite(result) ? result : 0);
		}
		return d3.mean(avg) ?? 0;
	}

	static reset() {
		this.instance = undefined;
	}
}

export class Place {
	title: string;
	link: PlaceName;
	code: number;

	constructor(title: string, link: PlaceName, code: number) {
		this.title = title;
		this.link = link;
		this.code = code;
	}
}

interface Regions {
	abruzzo: Place
	basilicata: Place
	calabria: Place
	campania: Place
	emilia_romagna: Place
	friuli_venezia_giulia: Place
	lazio: Place
	liguria: Place
	lombardia: Place
	marche: Place
	molise: Place
	bolzano: Place
	trento: Place
	piemonte: Place
	puglia: Place
	sardegna: Place
	sicilia: Place
	toscana: Place
	umbria: Place
	valle_d_aosta: Place
	veneto: Place
}

interface Places extends Regions {
	italia: Place
}

export type PlaceName = keyof Places;

export const places = <Places>{
	italia: new Place("Italia", "italia", 0),
	abruzzo: new Place("Abruzzo", "abruzzo", 13),
	basilicata: new Place("Basilicata", "basilicata", 17),
	calabria: new Place("Calabria", "calabria", 18),
	campania: new Place("Campania", "campania", 15),
	emilia_romagna: new Place("Emilia-Romagna", "emilia_romagna", 8),
	friuli_venezia_giulia: new Place("Friuli Venezia Giulia", "friuli_venezia_giulia", 6),
	lazio: new Place("Lazio", "lazio", 12),
	liguria: new Place("Liguria", "liguria", 7),
	lombardia: new Place("Lombardia", "lombardia", 3),
	marche: new Place("Marche", "marche", 11),
	molise: new Place("Molise", "molise", 14),
	bolzano: new Place("P.A. Bolzano", "bolzano", 21),
	trento: new Place("P.A. Trento", "trento", 22),
	piemonte: new Place("Piemonte", "piemonte", 1),
	puglia: new Place("Puglia", "puglia", 16),
	sardegna: new Place("Sardegna", "sardegna", 20),
	sicilia: new Place("Sicilia", "sicilia", 19),
	toscana: new Place("Toscana", "toscana", 9),
	umbria: new Place("Umbria", "umbria", 10),
	valle_d_aosta: new Place("Valle d'Aosta", "valle_d_aosta", 2),
	veneto: new Place("Veneto", "veneto", 5)
};
