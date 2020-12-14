import {RawDatum} from "src/model/models";

interface PlaceTypeInfo {
	url: string
	filter: (datum: RawDatum, place: Place) => boolean
}

export const placeTypes = {
	state: <PlaceTypeInfo>{
		url: "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json",
		filter: (_datum: RawDatum, _place: Place) => true
	},
	region: <PlaceTypeInfo>{
		url: "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json",
		filter: (datum: RawDatum, place: Place) => datum.codice_regione == place.code
	},
	province: <PlaceTypeInfo>{
		url: "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-province.json",
		filter: (datum: RawDatum, place: Place) => datum.codice_provincia == place.code
	}
};
export type PlaceType = keyof typeof placeTypes;

export class Place {
	constructor(
		public readonly title: string,
		public readonly link: PlaceName,
		public readonly code: number,
		public readonly type: PlaceType
	) {}

	isRegion() {
		return this.type == "region";
	}

	isProvince() {
		return this.type == "province";
	}

	isState() {
		return this.type == "state";
	}
}


interface Provinces {
	agrigento: Place
	alessandria: Place
	ancona: Place
	aosta: Place
	arezzo: Place
	ascoli_piceno: Place
	asti: Place
	avellino: Place
	bari: Place
	barletta_andria_trani: Place
	belluno: Place
	benevento: Place
	bergamo: Place
	biella: Place
	bologna: Place
	bolzano: Place
	brescia: Place
	brindisi: Place
	cagliari: Place
	caltanissetta: Place
	campobasso: Place
	caserta: Place
	catania: Place
	catanzaro: Place
	chieti: Place
	como: Place
	cosenza: Place
	cremona: Place
	crotone: Place
	cuneo: Place
	enna: Place
	fermo: Place
	ferrara: Place
	firenze: Place
	foggia: Place
	forli_cesena: Place
	frosinone: Place
	genova: Place
	gorizia: Place
	grosseto: Place
	imperia: Place
	isernia: Place
	l_aquila: Place
	la_spezia: Place
	latina: Place
	lecce: Place
	lecco: Place
	livorno: Place
	lodi: Place
	lucca: Place
	macerata: Place
	mantova: Place
	massa_carrara: Place
	matera: Place
	messina: Place
	milano: Place
	modena: Place
	monza_e_della_brianza: Place
	napoli: Place
	novara: Place
	nuoro: Place
	oristano: Place
	padova: Place
	palermo: Place
	parma: Place
	pavia: Place
	perugia: Place
	pesaro_e_urbino: Place
	pescara: Place
	piacenza: Place
	pisa: Place
	pistoia: Place
	pordenone: Place
	potenza: Place
	prato: Place
	ragusa: Place
	ravenna: Place
	reggio_di_calabria: Place
	reggio_nell_emilia: Place
	rieti: Place
	rimini: Place
	roma: Place
	rovigo: Place
	salerno: Place
	sassari: Place
	savona: Place
	siena: Place
	siracusa: Place
	sondrio: Place
	sud_sardegna: Place
	taranto: Place
	teramo: Place
	terni: Place
	torino: Place
	trapani: Place
	trento: Place
	treviso: Place
	trieste: Place
	udine: Place
	varese: Place
	venezia: Place
	verbano_cusio_ossola: Place
	vercelli: Place
	verona: Place
	vibo_valentia: Place
	vicenza: Place
	viterbo: Place
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
	pa_bolzano: Place
	pa_trento: Place
	piemonte: Place
	puglia: Place
	sardegna: Place
	sicilia: Place
	toscana: Place
	umbria: Place
	valle_d_aosta: Place
	veneto: Place
}

interface States {
	italia: Place
}

interface Places extends States, Regions, Provinces {
}

export type PlaceName = keyof typeof places;

export const places = <Places>{
	//states
	italia: new Place("Italia", "italia", 0, "state"),
	//regions
	abruzzo: new Place("Abruzzo", "abruzzo", 13, "region"),
	basilicata: new Place("Basilicata", "basilicata", 17, "region"),
	calabria: new Place("Calabria", "calabria", 18, "region"),
	campania: new Place("Campania", "campania", 15, "region"),
	emilia_romagna: new Place("Emilia-Romagna", "emilia_romagna", 8, "region"),
	friuli_venezia_giulia: new Place("Friuli Venezia Giulia", "friuli_venezia_giulia", 6, "region"),
	lazio: new Place("Lazio", "lazio", 12, "region"),
	liguria: new Place("Liguria", "liguria", 7, "region"),
	lombardia: new Place("Lombardia", "lombardia", 3, "region"),
	marche: new Place("Marche", "marche", 11, "region"),
	molise: new Place("Molise", "molise", 14, "region"),
	pa_bolzano: new Place("P.A. Bolzano", "pa_bolzano", 21, "region"),
	pa_trento: new Place("P.A. Trento", "pa_trento", 22, "region"),
	piemonte: new Place("Piemonte", "piemonte", 1, "region"),
	puglia: new Place("Puglia", "puglia", 16, "region"),
	sardegna: new Place("Sardegna", "sardegna", 20, "region"),
	sicilia: new Place("Sicilia", "sicilia", 19, "region"),
	toscana: new Place("Toscana", "toscana", 9, "region"),
	umbria: new Place("Umbria", "umbria", 10, "region"),
	valle_d_aosta: new Place("Valle d'Aosta", "valle_d_aosta", 2, "region"),
	veneto: new Place("Veneto", "veneto", 5, "region"),
	//provinces
	agrigento: new Place("Agrigento", "agrigento", 84, "province"),
	alessandria: new Place("Alessandria", "alessandria", 6, "province"),
	ancona: new Place("Ancona", "ancona", 42, "province"),
	aosta: new Place("Aosta", "aosta", 7, "province"),
	arezzo: new Place("Arezzo", "arezzo", 51, "province"),
	ascoli_piceno: new Place("Ascoli Piceno", "ascoli_piceno", 44, "province"),
	asti: new Place("Asti", "asti", 5, "province"),
	avellino: new Place("Avellino", "avellino", 64, "province"),
	bari: new Place("Bari", "bari", 72, "province"),
	barletta_andria_trani: new Place("Barletta-Andria-Trani", "barletta_andria_trani", 110, "province"),
	belluno: new Place("Belluno", "belluno", 25, "province"),
	benevento: new Place("Benevento", "benevento", 62, "province"),
	bergamo: new Place("Bergamo", "bergamo", 16, "province"),
	biella: new Place("Biella", "biella", 96, "province"),
	bologna: new Place("Bologna", "bologna", 37, "province"),
	bolzano: new Place("Bolzano", "bolzano", 21, "province"),
	brescia: new Place("Brescia", "brescia", 17, "province"),
	brindisi: new Place("Brindisi", "brindisi", 74, "province"),
	cagliari: new Place("Cagliari", "cagliari", 92, "province"),
	caltanissetta: new Place("Caltanissetta", "caltanissetta", 85, "province"),
	campobasso: new Place("Campobasso", "campobasso", 70, "province"),
	caserta: new Place("Caserta", "caserta", 61, "province"),
	catania: new Place("Catania", "catania", 87, "province"),
	catanzaro: new Place("Catanzaro", "catanzaro", 79, "province"),
	chieti: new Place("Chieti", "chieti", 69, "province"),
	como: new Place("Como", "como", 13, "province"),
	cosenza: new Place("Cosenza", "cosenza", 78, "province"),
	cremona: new Place("Cremona", "cremona", 19, "province"),
	crotone: new Place("Crotone", "crotone", 101, "province"),
	cuneo: new Place("Cuneo", "cuneo", 4, "province"),
	enna: new Place("Enna", "enna", 86, "province"),
	fermo: new Place("Fermo", "fermo", 109, "province"),
	ferrara: new Place("Ferrara", "ferrara", 38, "province"),
	firenze: new Place("Firenze", "firenze", 48, "province"),
	foggia: new Place("Foggia", "foggia", 71, "province"),
	forli_cesena: new Place("Forlì-Cesena", "forli_cesena", 40, "province"),
	frosinone: new Place("Frosinone", "frosinone", 60, "province"),
	genova: new Place("Genova", "genova", 10, "province"),
	gorizia: new Place("Gorizia", "gorizia", 31, "province"),
	grosseto: new Place("Grosseto", "grosseto", 53, "province"),
	imperia: new Place("Imperia", "imperia", 8, "province"),
	isernia: new Place("Isernia", "isernia", 94, "province"),
	l_aquila: new Place("L'Aquila", "l_aquila", 66, "province"),
	la_spezia: new Place("La Spezia", "la_spezia", 11, "province"),
	latina: new Place("Latina", "latina", 59, "province"),
	lecce: new Place("Lecce", "lecce", 75, "province"),
	lecco: new Place("Lecco", "lecco", 97, "province"),
	livorno: new Place("Livorno", "livorno", 49, "province"),
	lodi: new Place("Lodi", "lodi", 98, "province"),
	lucca: new Place("Lucca", "lucca", 46, "province"),
	macerata: new Place("Macerata", "macerata", 43, "province"),
	mantova: new Place("Mantova", "mantova", 20, "province"),
	massa_carrara: new Place("Massa Carrara", "massa_carrara", 45, "province"),
	matera: new Place("Matera", "matera", 77, "province"),
	messina: new Place("Messina", "messina", 83, "province"),
	milano: new Place("Milano", "milano", 15, "province"),
	modena: new Place("Modena", "modena", 36, "province"),
	monza_e_della_brianza: new Place("Monza e della Brianza", "monza_e_della_brianza", 108, "province"),
	napoli: new Place("Napoli", "napoli", 63, "province"),
	novara: new Place("Novara", "novara", 3, "province"),
	nuoro: new Place("Nuoro", "nuoro", 91, "province"),
	oristano: new Place("Oristano", "oristano", 95, "province"),
	padova: new Place("Padova", "padova", 28, "province"),
	palermo: new Place("Palermo", "palermo", 82, "province"),
	parma: new Place("Parma", "parma", 34, "province"),
	pavia: new Place("Pavia", "pavia", 18, "province"),
	perugia: new Place("Perugia", "perugia", 54, "province"),
	pesaro_e_urbino: new Place("Pesaro e Urbino", "pesaro_e_urbino", 41, "province"),
	pescara: new Place("Pescara", "pescara", 68, "province"),
	piacenza: new Place("Piacenza", "piacenza", 33, "province"),
	pisa: new Place("Pisa", "pisa", 50, "province"),
	pistoia: new Place("Pistoia", "pistoia", 47, "province"),
	pordenone: new Place("Pordenone", "pordenone", 93, "province"),
	potenza: new Place("Potenza", "potenza", 76, "province"),
	prato: new Place("Prato", "prato", 100, "province"),
	ragusa: new Place("Ragusa", "ragusa", 88, "province"),
	ravenna: new Place("Ravenna", "ravenna", 39, "province"),
	reggio_di_calabria: new Place("Reggio di Calabria", "reggio_di_calabria", 80, "province"),
	reggio_nell_emilia: new Place("Reggio nell'Emilia", "reggio_nell_emilia", 35, "province"),
	rieti: new Place("Rieti", "rieti", 57, "province"),
	rimini: new Place("Rimini", "rimini", 99, "province"),
	roma: new Place("Roma", "roma", 58, "province"),
	rovigo: new Place("Rovigo", "rovigo", 29, "province"),
	salerno: new Place("Salerno", "salerno", 65, "province"),
	sassari: new Place("Sassari", "sassari", 90, "province"),
	savona: new Place("Savona", "savona", 9, "province"),
	siena: new Place("Siena", "siena", 52, "province"),
	siracusa: new Place("Siracusa", "siracusa", 89, "province"),
	sondrio: new Place("Sondrio", "sondrio", 14, "province"),
	sud_sardegna: new Place("Sud Sardegna", "sud_sardegna", 111, "province"),
	taranto: new Place("Taranto", "taranto", 73, "province"),
	teramo: new Place("Teramo", "teramo", 67, "province"),
	terni: new Place("Terni", "terni", 55, "province"),
	torino: new Place("Torino", "torino", 1, "province"),
	trapani: new Place("Trapani", "trapani", 81, "province"),
	trento: new Place("Trento", "trento", 22, "province"),
	treviso: new Place("Treviso", "treviso", 26, "province"),
	trieste: new Place("Trieste", "trieste", 32, "province"),
	udine: new Place("Udine", "udine", 30, "province"),
	varese: new Place("Varese", "varese", 12, "province"),
	venezia: new Place("Venezia", "venezia", 27, "province"),
	verbano_cusio_ossola: new Place("Verbano-Cusio-Ossola", "verbano_cusio_ossola", 103, "province"),
	vercelli: new Place("Vercelli", "vercelli", 2, "province"),
	verona: new Place("Verona", "verona", 23, "province"),
	vibo_valentia: new Place("Vibo Valentia", "vibo_valentia", 102, "province"),
	vicenza: new Place("Vicenza", "vicenza", 24, "province"),
	viterbo: new Place("Viterbo", "viterbo", 56, "province")
};
