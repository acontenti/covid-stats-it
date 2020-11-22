import axios from "axios";
import * as d3 from "d3";

export interface RawDatum {
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

interface Values {
	nuovi_positivi: number
	nuovi_guariti: number
	nuovi_deceduti: number
	nuovi_tamponi: number
}

interface Indexes {
	i_nuovi_positivi: number
	i_nuovi_guariti: number
	i_nuovi_deceduti: number
	i_nuovi_tamponi: number
}

export interface Datum extends Values, Indexes {
	data: Date
	projection: boolean
}

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

export class Data {
	private data!: Map<Place, Array<Datum>>;
	private static instance?: Data = undefined;
	public static lookahead = 30;
	public static readonly timeFormat = d3.timeFormat("%A, %d/%m/%Y");

	private constructor(data: Map<Place, Array<Datum>>) {
		this.data = data;
	}

	public get(place: Place): Array<Datum> {
		return this.data.get(place)!;
	}

	public futureStart(): Date {
		return (this.data.get(places[0])!.find(it => it.projection) ?? {data: new Date()}).data;
	}

	public static async getInstance(): Promise<Data> {
		if (!this.instance) {
			const data = new Map<Place, Array<Datum>>();
			const itaResponse = await axios.get("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json");
			if (itaResponse.data !== undefined)
				data.set(places[0], this.createStats(itaResponse.data));
			else throw Error("Imposibile caricare dati nazionali");
			const regionalResponse = await axios.get("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json");
			const regionalData = regionalResponse.data;
			if (regionalData !== undefined) {
				places.slice(1).forEach(place => {
					const value = regionalData.filter((it: RawDatum) => it.codice_regione == place.code);
					data.set(place, this.createStats(value));
				});
			} else throw Error("Impossibile scaricare i dati regionali");
			this.instance = new Data(data);
		}
		return this.instance;
	}

	private static createStats(input: Array<RawDatum>): Array<Datum> {
		let extent = d3.extent(input, datum => Date.parse(datum.data));
		let startDate = d3.timeDay.offset(new Date(extent[0]!), -1);
		let endDate = d3.timeDay.offset(new Date(extent[1]!), this.lookahead);
		let dates = d3.timeDay.range(startDate, endDate, 1);
		const result: Array<Datum> = [];
		dates.forEach((it, index) => {
			const rawDatum = input[index];
			const lastDatum = input[index - 1] ?? {};
			const i_nuovi_positivi = this.calcGrowth(result, index, "nuovi_positivi");
			const i_nuovi_guariti = this.calcGrowth(result, index, "nuovi_guariti");
			const i_nuovi_deceduti = this.calcGrowth(result, index, "nuovi_deceduti");
			const i_nuovi_tamponi = this.calcGrowth(result, index, "nuovi_tamponi");
			let nuovi_deceduti = 0, nuovi_guariti = 0, nuovi_tamponi = 0, nuovi_positivi: number;
			if (rawDatum) {
				nuovi_positivi = Math.max(rawDatum.nuovi_positivi ?? 0, 0);
				nuovi_deceduti = Math.max((rawDatum.deceduti ?? 0) - (lastDatum.deceduti ?? 0), 0);
				nuovi_guariti = Math.max((rawDatum.dimessi_guariti ?? 0) - (lastDatum.dimessi_guariti ?? 0), 0);
				nuovi_tamponi = Math.max((rawDatum.tamponi ?? 0) - (lastDatum.tamponi ?? 0), 0);
			} else {
				nuovi_positivi = this.calcFuture(result, index, "nuovi_positivi", i_nuovi_positivi);
			}
			result.push({
				data: it,
				nuovi_positivi,
				nuovi_deceduti,
				nuovi_guariti,
				nuovi_tamponi,
				i_nuovi_positivi,
				i_nuovi_guariti,
				i_nuovi_deceduti,
				i_nuovi_tamponi,
				projection: !rawDatum
			});
		});
		return result;
	}

	private static calcFuture(input: Array<Datum>, index: number, property: keyof Values, growth: number): number {
		const last1 = input[index - 7] ?? {};
		const last2 = input[index - 14] ?? {};
		const avg = [];
		if (property in last1) {
			const value = last1[property];
			if (Number.isFinite(value))
				avg.push(value * growth);
		}
		if (property in last2) {
			const value = last2[property];
			if (Number.isFinite(value))
				avg.push(value * growth * growth);
		}
		return d3.mean(avg) ?? 0;
	}

	private static calcGrowth(input: Datum[], index: number, property: keyof Values): number {
		const avg = [];
		for (let i = 1; i <= 7; i++) {
			const d1 = input[index - i] ?? {}, d2 = input[index - (i + 7)] ?? {};
			const value1 = property in d1 ? d1[property] : 0;
			const value2 = property in d2 ? d2[property] : 0;
			const result = value1 / value2;
			avg.push(Number.isFinite(result) ? result : 0);
		}
		return d3.mean(avg) ?? 0;
	}
}

export interface Place {
	title: string
	link: string
	code: number
}

export const places: Array<Place> = [
	{
		title: "Italia",
		link: "italia",
		code: 0
	},
	{
		title: "Abruzzo",
		link: "abruzzo",
		code: 13
	},
	{
		title: "Basilicata",
		link: "basilicata",
		code: 17
	},
	{
		title: "Calabria",
		link: "calabria",
		code: 18
	},
	{
		title: "Campania",
		link: "campania",
		code: 15
	},
	{
		title: "Emilia-Romagna",
		link: "emilia-romagna",
		code: 8
	},
	{
		title: "Friuli Venezia Giulia",
		link: "friuli-venezia-giulia",
		code: 6
	},
	{
		title: "Lazio",
		link: "lazio",
		code: 12
	},
	{
		title: "Liguria",
		link: "liguria",
		code: 7
	},
	{
		title: "Lombardia",
		link: "lombardia",
		code: 3
	},
	{
		title: "Marche",
		link: "marche",
		code: 11
	},
	{
		title: "Molise",
		link: "molise",
		code: 14
	},
	{
		title: "P.A. Bolzano",
		link: "bolzano",
		code: 21
	},
	{
		title: "P.A. Trento",
		link: "trento",
		code: 22
	},
	{
		title: "Piemonte",
		link: "piemonte",
		code: 1
	},
	{
		title: "Puglia",
		link: "puglia",
		code: 16
	},
	{
		title: "Sardegna",
		link: "sardegna",
		code: 20
	},
	{
		title: "Sicilia",
		link: "sicilia",
		code: 19
	},
	{
		title: "Toscana",
		link: "toscana",
		code: 9
	},
	{
		title: "Umbria",
		link: "umbria",
		code: 10
	},
	{
		title: "Valle d'Aosta",
		link: "valle-d-aosta",
		code: 2
	},
	{
		title: "Veneto",
		link: "veneto",
		code: 5
	}
];
