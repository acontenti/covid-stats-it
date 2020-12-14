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
