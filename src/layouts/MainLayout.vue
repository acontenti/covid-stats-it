<template>
	<q-layout view="hHh LpR fFf">
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
				<q-btn aria-label="Menu" dense flat icon="menu" round @click="leftDrawerOpen = !leftDrawerOpen"/>
				<q-toolbar-title>
					Statistiche COVID-19
				</q-toolbar-title>
				<q-btn-toggle :disable="!isToggleable()"
							  :options="[{label: 'Totale', value: 'totale'},{label: 'Nuovi', value: 'nuovi'}]"
							  :value="var_" toggle-color="white" toggle-text-color="black"
							  unelevated @input="setVar"/>
				<q-btn flat icon="refresh" round @click="refresh">
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
									<q-slider v-model="lookahead" :label-value="lookahead + ' giorni'" :max="60"
											  :min="1" :step="1" label snap/>
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
									<q-toggle v-model="hideFirstLockdown" dense/>
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
									<q-toggle v-model="dark" dense/>
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
						</q-list>
					</q-menu>
				</q-btn>
			</q-toolbar>
			<q-tabs align="center" dense mobile-arrows outside-arrows>
				<q-route-tab v-if="isAvailable('casi')" :to="{params:{stat:'casi'}}" exact label="casi"/>
				<q-route-tab v-if="isAvailable('positivi')" :to="{params:{stat:'positivi'}}" exact label="positivi"/>
				<q-route-tab v-if="isAvailable('guariti')" :to="{params:{stat:'guariti'}}" exact label="guariti"/>
				<q-route-tab v-if="isAvailable('deceduti')" :to="{params:{stat:'deceduti'}}" exact label="deceduti"/>
				<q-route-tab v-if="isAvailable('tamponi')" :to="{params:{stat:'tamponi'}}" exact label="tamponi"/>
				<q-route-tab v-if="isAvailable('testati')" :to="{params:{stat:'testati'}}" exact label="testati"/>
				<q-route-tab v-if="isAvailable('casi_tamponi')" :to="{params:{stat:'casi_tamponi'}}" exact
							 label="casi/tamponi"/>
				<q-route-tab v-if="isAvailable('casi_testati')" :to="{params:{stat:'casi_testati'}}" exact
							 label="casi/testati"/>
			</q-tabs>
		</q-header>
		<q-drawer v-model="leftDrawerOpen" :width="200" elevated show-if-above>
			<q-scroll-area class="fit">
				<q-list dense>
					<q-item-label header>Nazionale</q-item-label>
					<menu-link v-for="link in menuLinks" v-if="link.isState()" :key="link.title" v-bind="link"/>
					<q-separator/>
					<q-item-label header>Regioni</q-item-label>
					<menu-link v-for="link in menuLinks" v-if="link.isRegion()" :key="link.title" v-bind="link"/>
					<q-separator/>
					<q-item-label header>Province</q-item-label>
					<menu-link v-for="link in menuLinks" v-if="link.isProvince()" :key="link.title" v-bind="link"/>
				</q-list>
			</q-scroll-area>
		</q-drawer>
		<q-page-container>
			<router-view/>
		</q-page-container>
		<q-footer :height-hint="30" bordered class="flex q-dark q-py-xs q-px-md justify-end">
			Copyright © 2020 Alessandro Contenti&emsp;
			<q-space/>
			<span v-if="lastUpdate">Aggiornamento: {{ lastUpdate | dateTimeFormat }}.</span>
			<span v-if="lastData">&ensp;Ultimo dato pubblicato: {{ lastData | dateFormat }}.</span>
		</q-footer>
	</q-layout>
</template>

<script lang="ts">
import MenuLink from "components/MenuLink.vue";
import {Component, Vue, Watch} from "vue-property-decorator";
import {Place, PlaceName, places} from "src/model/place";
import {Data} from "src/model/data";

@Component({
	components: {MenuLink},
	filters: {
		dateTimeFormat(date?: Date) {
			if (date)
				return date.toLocaleString();
			else return "";
		},
		dateFormat(date?: Date) {
			if (date)
				return date.toLocaleDateString();
			else return "";
		}
	}
})
export default class MainLayout extends Vue {
	leftDrawerOpen = false;
	menuLinks: Place[] = Object.values(places);
	lookahead = 30;
	lastUpdate: Date | null = null;
	lastData: Date | null = null;
	dark: boolean = this.$q.dark.isActive;
	hideFirstLockdown = false;
	var_: string = this.$route.params.var;

	@Watch("dark")
	onDarkModeCHange(value: boolean) {
		this.$q.localStorage.set("dark", value);
		this.$q.dark.set(value);
	}

	@Watch("hideFirstLockdown")
	onHideFirstLockdownChange(value: boolean) {
		this.$root.$emit("hideFirstLockdownChange", value);
	}

	setVar(value: string) {
		this.var_ = value;
		this.$router.push({params: {var: value}});
	}

	@Watch("$route.params.var")
	onVarChange(var_: string) {
		this.var_ = var_;
	}

	@Watch("lookahead")
	async onLookaheadChange(value: number) {
		this.$root.$emit("lookaheadChange", value);
	}

	isAvailable(stat: string) {
		let placeName = this.$route.params.place;
		if (!placeName) return false;
		let currentPlace = places[<PlaceName>placeName];
		switch (currentPlace.type) {
			case "state":
			case "region":
				return true;
			case "province":
				return stat == "casi";
		}
	}

	isToggleable() {
		let placeName = this.$route.params.place;
		if (!placeName) return false;
		let currentPlace = places[<PlaceName>placeName];
		switch (currentPlace.type) {
			case "state":
			case "region":
				return true;
			case "province":
				return false;
		}
	}

	refresh() {
		Data.reset();
		this.$root.$emit("refresh");
	}

	async onUpdated(updated: Date, lastData: Date) {
		await this.$nextTick();
		this.lastUpdate = updated;
		this.lastData = lastData;
	}

	minimize() {
		if (process.env.MODE === "electron") {
			this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize();
		}
	}

	maximize() {
		if (process.env.MODE === "electron") {
			const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow();
			if (win.isMaximized()) {
				win.unmaximize();
			} else {
				win.maximize();
			}
		}
	}

	close() {
		if (process.env.MODE === "electron") {
			this.$q.electron.remote.BrowserWindow.getFocusedWindow().close();
		}
	}

	mounted() {
		if (this.$q.localStorage.has("dark")) {
			this.dark = this.$q.localStorage.getItem("dark") ?? this.dark;
		}
		this.$root.$on("updated", this.onUpdated);
		this.onLookaheadChange(this.lookahead);
		this.onHideFirstLockdownChange(this.hideFirstLockdown);
	}
}
</script>

<style lang="scss">
.q-layout {
	display: flex;
}

.q-page-container {
	width: 100vw;
	height: 100vh;
	display: flex;
}

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

	.q-btn__wrapper {
		padding: 2px 8px 0 !important;
		min-height: 0 !important;
	}
}

</style>
