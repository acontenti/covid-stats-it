import {RawDatum, stats} from "src/model/models";

class PlaceTypeInfo {
	readonly url: string;
	readonly filter: (datum: RawDatum, place: Place) => boolean;
	readonly availableStats: string[];

	constructor(url: string, filter: (datum: RawDatum, place: Place) => boolean, availableStats: string[]) {
		this.url = url;
		this.filter = filter;
		this.availableStats = availableStats;
	}

	get defaultStat() {
		return this.availableStats[0];
	}

	isStatAvailable(stat: string) {
		return this.availableStats.includes(stat);
	}
}

export const placeTypes = {
	state: new PlaceTypeInfo(
		"https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json",
		() => true,
		Object.keys(stats)
	),
	region: new PlaceTypeInfo(
		"https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json",
		(datum: RawDatum, place: Place) => datum.codice_regione == place.code,
		Object.keys(stats)
	),
	province: new PlaceTypeInfo(
		"https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-province.json",
		(datum: RawDatum, place: Place) => datum.codice_provincia == place.code,
		["casi", "rt"]
	)
};
export type PlaceType = keyof typeof placeTypes;

export class Place {
	constructor(
		readonly title: string,
		readonly link: PlaceName,
		readonly code: number,
		readonly type: PlaceType,
		readonly population: number
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

export const places: Places = {
	//states
	italia: new Place("Italia", "italia", 0, "state", 59641488),
	//regions
	abruzzo: new Place("Abruzzo", "abruzzo", 13, "region", 1293941),
	basilicata: new Place("Basilicata", "basilicata", 17, "region", 553254),
	calabria: new Place("Calabria", "calabria", 18, "region", 1894110),
	campania: new Place("Campania", "campania", 15, "region", 5712143),
	emilia_romagna: new Place("Emilia-Romagna", "emilia_romagna", 8, "region", 4464119),
	friuli_venezia_giulia: new Place("Friuli Venezia Giulia", "friuli_venezia_giulia", 6, "region", 1206216),
	lazio: new Place("Lazio", "lazio", 12, "region", 5755700),
	liguria: new Place("Liguria", "liguria", 7, "region", 1524826),
	lombardia: new Place("Lombardia", "lombardia", 3, "region", 10027602),
	marche: new Place("Marche", "marche", 11, "region", 1512672),
	molise: new Place("Molise", "molise", 14, "region", 300516),
	pa_bolzano: new Place("P.A. Bolzano", "pa_bolzano", 21, "region", 532644),
	pa_trento: new Place("P.A. Trento", "pa_trento", 22, "region", 545425),
	piemonte: new Place("Piemonte", "piemonte", 1, "region", 4311217),
	puglia: new Place("Puglia", "puglia", 16, "region", 3953305),
	sardegna: new Place("Sardegna", "sardegna", 20, "region", 1611621),
	sicilia: new Place("Sicilia", "sicilia", 19, "region", 4875290),
	toscana: new Place("Toscana", "toscana", 9, "region", 3692555),
	umbria: new Place("Umbria", "umbria", 10, "region", 870165),
	valle_d_aosta: new Place("Valle d'Aosta", "valle_d_aosta", 2, "region", 125034),
	veneto: new Place("Veneto", "veneto", 5, "region", 4879133),
	//provinces
	agrigento: new Place("Agrigento", "agrigento", 84, "province", 423488),
	alessandria: new Place("Alessandria", "alessandria", 6, "province", 417288),
	ancona: new Place("Ancona", "ancona", 42, "province", 467451),
	aosta: new Place("Aosta", "aosta", 7, "province", 125034),
	arezzo: new Place("Arezzo", "arezzo", 51, "province", 339172),
	ascoli_piceno: new Place("Ascoli Piceno", "ascoli_piceno", 44, "province", 206172),
	asti: new Place("Asti", "asti", 5, "province", 212010),
	avellino: new Place("Avellino", "avellino", 64, "province", 410369),
	bari: new Place("Bari", "bari", 72, "province", 1230205),
	barletta_andria_trani: new Place("Barletta-Andria-Trani", "barletta_andria_trani", 110, "province", 384801),
	belluno: new Place("Belluno", "belluno", 25, "province", 201309),
	benevento: new Place("Benevento", "benevento", 62, "province", 272318),
	bergamo: new Place("Bergamo", "bergamo", 16, "province", 1108126),
	biella: new Place("Biella", "biella", 96, "province", 174170),
	bologna: new Place("Bologna", "bologna", 37, "province", 1021501),
	bolzano: new Place("Bolzano", "bolzano", 21, "province", 532644),
	brescia: new Place("Brescia", "brescia", 17, "province", 1255437),
	brindisi: new Place("Brindisi", "brindisi", 74, "province", 385235),
	cagliari: new Place("Cagliari", "cagliari", 92, "province", 422840),
	caltanissetta: new Place("Caltanissetta", "caltanissetta", 85, "province", 255931),
	campobasso: new Place("Campobasso", "campobasso", 70, "province", 217362),
	caserta: new Place("Caserta", "caserta", 61, "province", 913666),
	catania: new Place("Catania", "catania", 87, "province", 1072634),
	catanzaro: new Place("Catanzaro", "catanzaro", 79, "province", 349344),
	chieti: new Place("Chieti", "chieti", 69, "province", 378840),
	como: new Place("Como", "como", 13, "province", 597642),
	cosenza: new Place("Cosenza", "cosenza", 78, "province", 690503),
	cremona: new Place("Cremona", "cremona", 19, "province", 355908),
	crotone: new Place("Crotone", "crotone", 101, "province", 168581),
	cuneo: new Place("Cuneo", "cuneo", 4, "province", 586113),
	enna: new Place("Enna", "enna", 86, "province", 160161),
	fermo: new Place("Fermo", "fermo", 109, "province", 171737),
	ferrara: new Place("Ferrara", "ferrara", 38, "province", 344510),
	firenze: new Place("Firenze", "firenze", 48, "province", 995517),
	foggia: new Place("Foggia", "foggia", 71, "province", 606904),
	forli_cesena: new Place("Forlì-Cesena", "forli_cesena", 40, "province", 395306),
	frosinone: new Place("Frosinone", "frosinone", 60, "province", 477502),
	genova: new Place("Genova", "genova", 10, "province", 826194),
	gorizia: new Place("Gorizia", "gorizia", 31, "province", 137795),
	grosseto: new Place("Grosseto", "grosseto", 53, "province", 219690),
	imperia: new Place("Imperia", "imperia", 8, "province", 209382),
	isernia: new Place("Isernia", "isernia", 94, "province", 83154),
	l_aquila: new Place("L'Aquila", "l_aquila", 66, "province", 294838),
	la_spezia: new Place("La Spezia", "la_spezia", 11, "province", 217418),
	latina: new Place("Latina", "latina", 59, "province", 562592),
	lecce: new Place("Lecce", "lecce", 75, "province", 782165),
	lecco: new Place("Lecco", "lecco", 97, "province", 334961),
	livorno: new Place("Livorno", "livorno", 49, "province", 331877),
	lodi: new Place("Lodi", "lodi", 98, "province", 227412),
	lucca: new Place("Lucca", "lucca", 46, "province", 382543),
	macerata: new Place("Macerata", "macerata", 43, "province", 310815),
	mantova: new Place("Mantova", "mantova", 20, "province", 406919),
	massa_carrara: new Place("Massa Carrara", "massa_carrara", 45, "province", 191685),
	matera: new Place("Matera", "matera", 77, "province", 194853),
	messina: new Place("Messina", "messina", 83, "province", 613887),
	milano: new Place("Milano", "milano", 15, "province", 3265327),
	modena: new Place("Modena", "modena", 36, "province", 707119),
	monza_e_della_brianza: new Place("Monza e della Brianza", "monza_e_della_brianza", 108, "province", 870193),
	napoli: new Place("Napoli", "napoli", 63, "province", 3034410),
	novara: new Place("Novara", "novara", 3, "province", 364980),
	nuoro: new Place("Nuoro", "nuoro", 91, "province", 205205),
	oristano: new Place("Oristano", "oristano", 95, "province", 154974),
	padova: new Place("Padova", "padova", 28, "province", 933700),
	palermo: new Place("Palermo", "palermo", 82, "province", 1222988),
	parma: new Place("Parma", "parma", 34, "province", 454873),
	pavia: new Place("Pavia", "pavia", 18, "province", 540376),
	perugia: new Place("Perugia", "perugia", 54, "province", 646710),
	pesaro_e_urbino: new Place("Pesaro e Urbino", "pesaro_e_urbino", 41, "province", 356497),
	pescara: new Place("Pescara", "pescara", 68, "province", 316363),
	piacenza: new Place("Piacenza", "piacenza", 33, "province", 286433),
	pisa: new Place("Pisa", "pisa", 50, "province", 418122),
	pistoia: new Place("Pistoia", "pistoia", 47, "province", 291697),
	pordenone: new Place("Pordenone", "pordenone", 93, "province", 310502),
	potenza: new Place("Potenza", "potenza", 76, "province", 358401),
	prato: new Place("Prato", "prato", 100, "province", 257073),
	ragusa: new Place("Ragusa", "ragusa", 88, "province", 315601),
	ravenna: new Place("Ravenna", "ravenna", 39, "province", 387970),
	reggio_di_calabria: new Place("Reggio di Calabria", "reggio_di_calabria", 80, "province", 530967),
	reggio_nell_emilia: new Place("Reggio nell'Emilia", "reggio_nell_emilia", 35, "province", 529609),
	rieti: new Place("Rieti", "rieti", 57, "province", 152497),
	rimini: new Place("Rimini", "rimini", 99, "province", 336798),
	roma: new Place("Roma", "roma", 58, "province", 4253314),
	rovigo: new Place("Rovigo", "rovigo", 29, "province", 231734),
	salerno: new Place("Salerno", "salerno", 65, "province", 1081380),
	sassari: new Place("Sassari", "sassari", 90, "province", 484407),
	savona: new Place("Savona", "savona", 9, "province", 271832),
	siena: new Place("Siena", "siena", 52, "province", 265179),
	siracusa: new Place("Siracusa", "siracusa", 89, "province", 389344),
	sondrio: new Place("Sondrio", "sondrio", 14, "province", 180425),
	sud_sardegna: new Place("Sud Sardegna", "sud_sardegna", 111, "province", 344195),
	taranto: new Place("Taranto", "taranto", 73, "province", 563995),
	teramo: new Place("Teramo", "teramo", 67, "province", 303900),
	terni: new Place("Terni", "terni", 55, "province", 223455),
	torino: new Place("Torino", "torino", 1, "province", 2230946),
	trapani: new Place("Trapani", "trapani", 81, "province", 421256),
	trento: new Place("Trento", "trento", 22, "province", 545425),
	treviso: new Place("Treviso", "treviso", 26, "province", 883522),
	trieste: new Place("Trieste", "trieste", 32, "province", 231445),
	udine: new Place("Udine", "udine", 30, "province", 526474),
	varese: new Place("Varese", "varese", 12, "province", 884876),
	venezia: new Place("Venezia", "venezia", 27, "province", 848829),
	verbano_cusio_ossola: new Place("Verbano-Cusio-Ossola", "verbano_cusio_ossola", 103, "province", 156320),
	vercelli: new Place("Vercelli", "vercelli", 2, "province", 169390),
	verona: new Place("Verona", "verona", 23, "province", 924742),
	vibo_valentia: new Place("Vibo Valentia", "vibo_valentia", 102, "province", 154715),
	vicenza: new Place("Vicenza", "vicenza", 24, "province", 855297),
	viterbo: new Place("Viterbo", "viterbo", 56, "province", 309795)
};
