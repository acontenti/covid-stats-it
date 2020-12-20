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

interface Stat {
	short: string
	long: string
	ratio?: boolean
}

export const stats = <{ [key: string]: Stat }>{
	casi: {
		short: "casi",
		long: "casi"
	},
	positivi: {
		short: "positivi",
		long: "attualmente positivi"
	},
	deceduti: {
		short: "deceduti",
		long: "deceduti"
	},
	guariti: {
		short: "guariti",
		long: "guariti"
	},
	ricoverati: {
		short: "ricoverati",
		long: "ricoverati con sintomi"
	},
	intensiva: {
		short: "t. intensiva",
		long: "ricoverati in terapia intensiva"
	},
	isolamento: {
		short: "isolamento",
		long: "in isolamento domiciliare"
	},
	tamponi: {
		short: "tamponi",
		long: "tamponi"
	},
	testati: {
		short: "testati",
		long: "soggetti testati",
	},
	casi_tamponi: {
		short: "casi/tamponi",
		long: "rapporto casi/tamponi",
		ratio: true
	},
	casi_testati: {
		short: "casi/testati",
		long: "rapporto casi/persone testate",
		ratio: true
	}
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

export interface Indexes extends DailyIndexes, TotalIndexes {
}

export interface Datum extends Values, Indexes {
	data: Date
	projection: boolean
}
