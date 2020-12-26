export interface RawDatum {
	data: string
	stato: string
	codice_regione?: number
	denominazione_regione?: string
	codice_provincia?: number
	denominazione_provincia?: string
	sigla_provincia?: string
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

class StatInfo {
	readonly short: string;
	readonly long: string;
	readonly index: boolean;
	readonly ratio: boolean;

	constructor(short: string, long: string, ratio: boolean = false, index: boolean = false) {
		this.short = short;
		this.long = long;
		this.index = index;
		this.ratio = ratio;
	}

	isVarAvailable(var_: string) {
		switch (var_) {
			case "totale":
				return true;
			case "nuovi":
				return !this.index;
			default:
				return false;
		}
	}

	get defaultVar() {
		return  "totale";
	}
}

export const stats = <{ [key: string]: StatInfo }>{
	rt: new StatInfo("rt", "indice R(t) [metodo Kohlberg-Neyman]", false, true),
	casi: new StatInfo("casi", "casi"),
	positivi: new StatInfo("positivi", "attualmente positivi"),
	deceduti: new StatInfo("deceduti", "deceduti"),
	guariti: new StatInfo("guariti", "guariti"),
	ricoverati: new StatInfo("ricoverati", "ricoverati con sintomi"),
	intensiva: new StatInfo("t. intensiva", "ricoverati in terapia intensiva"),
	isolamento: new StatInfo("isolamento", "in isolamento domiciliare"),
	tamponi: new StatInfo("tamponi", "tamponi"),
	testati: new StatInfo("testati", "soggetti testati"),
	casi_tamponi: new StatInfo("casi/tamponi", "rapporto casi/tamponi", true),
	casi_testati: new StatInfo("casi/testati", "rapporto casi/persone testate", true)
};

interface Var {
	normal: string
	ratio: string
}

export const vars = <{ [key: string]: Var }>{
	nuovi: {
		normal: "nuovi",
		ratio: ""
	},
	totale: {
		normal: "totale",
		ratio: "totale"
	}
};

interface TotalValues {
	totale_rt: number
	totale_casi: number
	totale_positivi: number
	totale_guariti: number
	totale_deceduti: number
	totale_ricoverati: number
	totale_intensiva: number
	totale_isolamento: number
	totale_tamponi: number
	totale_testati: number
	totale_casi_tamponi: number
	totale_casi_testati: number
}

interface DailyValues {
	nuovi_casi: number
	nuovi_positivi: number
	nuovi_guariti: number
	nuovi_deceduti: number
	nuovi_ricoverati: number
	nuovi_intensiva: number
	nuovi_isolamento: number
	nuovi_tamponi: number
	nuovi_testati: number
	nuovi_casi_tamponi: number
	nuovi_casi_testati: number
}

interface TotalIndexes {
	i_totale_casi: number
	i_totale_positivi: number
	i_totale_guariti: number
	i_totale_deceduti: number
	i_totale_ricoverati: number
	i_totale_intensiva: number
	i_totale_isolamento: number
	i_totale_tamponi: number
	i_totale_testati: number
	i_totale_casi_tamponi: number
	i_totale_casi_testati: number
}

interface DailyIndexes {
	i_nuovi_casi: number
	i_nuovi_positivi: number
	i_nuovi_guariti: number
	i_nuovi_deceduti: number
	i_nuovi_ricoverati: number
	i_nuovi_intensiva: number
	i_nuovi_isolamento: number
	i_nuovi_tamponi: number
	i_nuovi_testati: number
	i_nuovi_casi_tamponi: number
	i_nuovi_casi_testati: number
}

export interface Values extends DailyValues, TotalValues {
}

export type Value = keyof Values

export interface Indexes extends DailyIndexes, TotalIndexes {
}

export type Index = keyof Indexes

export interface Datum extends Values, Indexes {
	data: Date
	projection: boolean
}
