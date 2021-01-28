import {Place, PlaceName, places, placeTypes} from "src/model/place";
import axios from "axios";
import {Datum, RawDatum} from "src/model/models";
import {elaborateData} from "src/model/functions";

export class Data {
	private static instance?: Data = undefined;
	public readonly updated: Date;
	private readonly data: Map<PlaceName, Datum[]>;

	private constructor(data: Map<PlaceName, Datum[]>) {
		this.data = data;
		this.updated = new Date();
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
							data.set(place.link, elaborateData(input, place));
					});
				} else throw new Error(`Cannot load ${type} data`);
			}
			this.instance = new Data(data);
		}
		return this.instance;
	}

	public static reset() {
		this.instance = undefined;
	}

	public get(place: PlaceName): Datum[] {
		return this.data.get(place)!;
	}
}
