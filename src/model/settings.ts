import {Dark, LocalStorage} from "quasar";
import {lookahead} from "src/model/functions";

export default class Settings {
	public static readonly instance = new Settings();
	public readonly maxLookahead = lookahead;

	constructor() {
		if (LocalStorage.has("dark")) {
			this.darkMode = LocalStorage.getItem<boolean>("dark") ?? false;
		} else this.darkMode = false;
		if (LocalStorage.has("hiddenStats")) {
			this.hiddenStats = new Set<string>(LocalStorage.getItem<string[]>("hiddenStats") ?? []);
		} else this.hiddenStats = new Set<string>();
		if (LocalStorage.has("hideFirstLockdown")) {
			this.hideFirstLockdown = LocalStorage.getItem<boolean>("hideFirstLockdown") ?? false;
		} else this.hideFirstLockdown = false;
	}

	get darkMode(): boolean {
		return Dark.isActive;
	}

	set darkMode(value: boolean) {
		Dark.set(value);
		LocalStorage.set("dark", value);
	}

	private _hideFirstLockdown!: boolean;

	get hideFirstLockdown(): boolean {
		return this._hideFirstLockdown;
	}

	set hideFirstLockdown(value: boolean) {
		this._hideFirstLockdown = value;
		LocalStorage.set("hideFirstLockdown", value);
	}

	private _hiddenStats!: Set<string>;

	get hiddenStats(): Set<string> {
		return this._hiddenStats;
	}

	set hiddenStats(value: Set<string>) {
		this._hiddenStats = value;
		LocalStorage.set("hiddenStats", [...value]);
	}

	private _lookahead: number = 30;

	get lookahead() {
		return this._lookahead;
	}

	set lookahead(value) {
		this._lookahead = value;
	}
}
