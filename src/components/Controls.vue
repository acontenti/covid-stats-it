<template>
	<q-header :height-hint="100" elevated>
		<q-bar v-if="$q.electron" class="q-electron-drag">
			<q-icon name="bar_chart"/>
			<div>Statistiche COVID-19</div>
			<q-space/>
			<q-btn dense flat icon="minimize" @click="minimize"/>
			<q-btn dense flat icon="crop_square" @click="maximize"/>
			<q-btn dense flat icon="close" @click="close"/>
		</q-bar>
		<q-toolbar>
			<q-btn aria-label="Menu" dense flat icon="menu" round @click="_leftDrawerOpen = !_leftDrawerOpen"/>
			<q-toolbar-title>
				Statistiche COVID-19
			</q-toolbar-title>
			<q-btn-toggle v-if="isVarToggleable()"
						  :options="Object.entries(vars).map(([k,v])=>({label:v.normal,value:k}))"
						  :value="$route.params.var" toggle-color="white" toggle-text-color="black" unelevated
						  @input="setVar"/>
			<q-btn flat icon="refresh" round @click="refresh()">
				<q-tooltip>Aggiorna</q-tooltip>
			</q-btn>
			<q-btn flat icon="more_vert" round>
				<q-tooltip>Opzioni</q-tooltip>
				<q-menu content-class="slider-container">
					<q-list class="slider-container" separator>
						<q-item>
							<q-item-section avatar>
								<q-icon name="update"/>
							</q-item-section>
							<q-item-section avatar>
								<q-item-label>Previsione</q-item-label>
							</q-item-section>
							<q-item-section>
								<q-slider :label-value="$settings.lookahead + ' giorni'" :max="$settings.maxLookahead"
										  :min="1" :step="1" :value="$settings.lookahead" label snap
										  @input="value => $settings.lookahead = value"/>
							</q-item-section>
						</q-item>
						<q-item v-ripple tag="label">
							<q-item-section avatar>
								<q-icon name="visibility_off"/>
							</q-item-section>
							<q-item-section>
								<q-item-label>Nascondi primo lockdown</q-item-label>
							</q-item-section>
							<q-item-section avatar>
								<q-toggle v-model="$settings.hideFirstLockdown" dense/>
							</q-item-section>
						</q-item>
						<q-item v-ripple tag="label">
							<q-item-section avatar>
								<q-icon name="brightness_medium"/>
							</q-item-section>
							<q-item-section>
								<q-item-label>Modalità scura</q-item-label>
							</q-item-section>
							<q-item-section avatar>
								<q-toggle :value="$settings.darkMode" dense
										  @input="$settings.darkMode = !$settings.darkMode"/>
							</q-item-section>
						</q-item>
						<q-item v-ripple href="https://github.com/acontenti/covid-stats-it" tag="a" target="_blank">
							<q-item-section avatar>
								<q-icon>
									<svg viewBox="0 0 24 24">
										<path
											d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/>
									</svg>
								</q-icon>
							</q-item-section>
							<q-item-section>
								<q-item-label>Progetto su Github</q-item-label>
							</q-item-section>
							<q-item-section side>
								<q-icon name="open_in_new"/>
							</q-item-section>
						</q-item>
						<q-item v-ripple href="https://www.hbs.edu/faculty/Pages/item.aspx?num=58078" tag="a"
								target="_blank">
							<q-item-section avatar>
								<q-icon name="read_more"/>
							</q-item-section>
							<q-item-section>
								<q-item-label>Metodo Kohlberg-Neyman</q-item-label>
							</q-item-section>
							<q-item-section side>
								<q-icon name="open_in_new"/>
							</q-item-section>
						</q-item>
					</q-list>
				</q-menu>
			</q-btn>
		</q-toolbar>
		<q-tabs align="center" dense mobile-arrows outside-arrows>
			<q-route-tab v-for="(stat, key) in stats" v-if="isStatAvailable(key) && isStatVisible(key)" :key="key"
						 :label="stat.short" :to="{params:{stat:key}}" exact>
				<q-menu auto-close context-menu>
					<q-list dense>
						<q-item clickable @click="hideStat(key)">
							<q-item-section>Nascondi</q-item-section>
						</q-item>
					</q-list>
				</q-menu>
			</q-route-tab>
			<q-btn-dropdown v-if="hiddenStatsSize > 0" auto-close flat icon="more_horiz" stretch>
				<template v-slot:label>
					<q-badge :label="hiddenStatsSize" color="white" floating style="top: 0" text-color="primary"/>
					<q-menu auto-close context-menu>
						<q-list dense>
							<q-item clickable @click="showAllStats()">
								<q-item-section>Mostra tutti</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
				</template>
				<template v-slot:default>
					<q-list dense>
						<q-item v-for="(stat, key) in stats" v-if="isStatAvailable(key) && !isStatVisible(key)"
								:key="key" :to="{params:{stat:key}}" clickable exact>
							<q-item-section class="text-uppercase">{{ stat.short }}</q-item-section>
							<q-menu auto-close context-menu>
								<q-list dense>
									<q-item clickable @click="showStat(key)">
										<q-item-section>Mostra</q-item-section>
									</q-item>
								</q-list>
							</q-menu>
						</q-item>
					</q-list>
				</template>
			</q-btn-dropdown>
		</q-tabs>
	</q-header>
</template>
<script lang="ts">
import {PlaceName, places, placeTypes} from "src/model/place";
import {Data} from "src/model/data";
import {Component, PropSync, Vue} from "vue-property-decorator";
import {stats, vars} from "src/model/models";

@Component({})
export default class Controls extends Vue {
	readonly vars = vars;
	readonly stats = stats;
	@PropSync("leftDrawerOpen")
	_leftDrawerOpen!: boolean;

	get hiddenStatsSize() {
		return [...this.$settings.hiddenStats].filter(value => this.isStatAvailable(value)).length;
	}

	setVar(value: string) {
		this.$router.push({params: {var: value}});
	}

	isStatAvailable(stat: string) {
		let placeName = this.$route.params.place;
		if (!placeName) return false;
		let currentPlace = places[<PlaceName>placeName];
		return placeTypes[currentPlace.type].isStatAvailable(stat);
	}

	isVarToggleable() {
		const stat = this.$route.params.stat;
		if (!stat) return false;
		return !stats[stat].index;
	}

	isStatVisible(stat: string) {
		return !this.$settings.hiddenStats.has(stat);
	}

	hideStat(stat: string) {
		this.$settings.hiddenStats.add(stat);
		this.$settings.hiddenStats = new Set(this.$settings.hiddenStats);
	}

	showStat(stat: string) {
		this.$settings.hiddenStats.delete(stat);
		this.$settings.hiddenStats = new Set(this.$settings.hiddenStats);
	}

	showAllStats() {
		this.$settings.hiddenStats = new Set();
	}

	refresh() {
		Data.reset();
		this.$root.$emit("refresh");
	}

	minimize() {
		if (process.env.MODE === "electron") {
			this.$q.electron.remote.BrowserWindow.getFocusedWindow()?.minimize();
		}
	}

	maximize() {
		if (process.env.MODE === "electron") {
			const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow();
			if (win) {
				if (win.isMaximized()) {
					win.unmaximize();
				} else {
					win.maximize();
				}
			}
		}
	}

	close() {
		if (process.env.MODE === "electron") {
			this.$q.electron.remote.BrowserWindow.getFocusedWindow()?.close();
		}
	}
}
</script>
<style lang="scss">

.slider-container {
	width: 500px;
	max-width: 80vw;
	overflow: visible;

	@media (max-width: $breakpoint-xs) {
		min-width: 80vw;
	}
}

.q-btn-toggle button {
	border: 1px solid white;

}

</style>
