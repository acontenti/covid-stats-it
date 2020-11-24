<template>
	<q-layout view="hHh LpR fFf">
		<q-header :height-hint="100" elevated>
			<q-toolbar>
				<q-btn aria-label="Menu" dense flat icon="menu" round @click="leftDrawerOpen = !leftDrawerOpen"/>
				<q-toolbar-title>
					Statistiche COVID-19
				</q-toolbar-title>
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
									<q-slider :label-value="lookahead + ' giorni'" :max="30" :min="1" :step="1"
											  :value="lookahead" label  snap @input="updateLookahead"/>
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
									<q-toggle dense v-model="dark"/>
								</q-item-section>
							</q-item>
							<q-item v-ripple href="https://github.com/acontenti/covid-stats-it" tag="a" target="_blank">
								<q-item-section avatar>
									<q-icon >
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
			<q-tabs align="center" mobile-arrows outside-arrows>
				<q-route-tab :to="{params:{stat:'nuovi_positivi'}}" exact label="Nuovi casi"/>
				<q-route-tab :to="{params:{stat:'nuovi_guariti'}}" exact label="Nuovi guariti"/>
				<q-route-tab :to="{params:{stat:'nuovi_deceduti'}}" exact label="Nuovi deceduti"/>
				<q-route-tab :to="{params:{stat:'nuovi_tamponi'}}" exact label="Nuovi tamponi"/>
			</q-tabs>
		</q-header>
		<q-drawer v-model="leftDrawerOpen" :width="200" elevated show-if-above>
			<q-scroll-area class="fit">
				<q-list dense>
					<q-item-label header>Nazionale</q-item-label>
					<menu-link v-bind="italia"/>
					<q-separator/>
					<q-item-label header>Regioni</q-item-label>
					<menu-link v-for="link in menuLinks" :key="link.title" v-bind="link"/>
				</q-list>
			</q-scroll-area>
		</q-drawer>
		<q-page-container>
			<router-view/>
		</q-page-container>
		<q-footer :height-hint="30" bordered class="flex q-dark q-py-xs q-px-md">
			Copyright © 2020 Alessandro Contenti&emsp;
			<q-space/>
			<span>Ultimo aggiornamento: {{ lastUpdate | dateTimeFormat }}</span>
		</q-footer>
	</q-layout>
</template>

<script lang="ts">
import MenuLink from "components/MenuLink.vue";
import {Component, Vue, Watch} from "vue-property-decorator";
import {Data, Place, places} from "components/models";

@Component({
	components: {MenuLink},
	filters: {
		dateTimeFormat(date?: Date) {
			if (date)
				return date.toLocaleString();
			else return "";
		}
	}
})
export default class MainLayout extends Vue {
	leftDrawerOpen = false;
	menuLinks: Place[] = Object.values(places).filter(it => it !== places.italia);
	italia: Place = places.italia;
	lookahead = 30;
	lastUpdate: Date | null = null;
	dark = this.$q.dark.isActive;

	@Watch("dark")
	onDarkModeCHange(value: boolean) {
		this.$q.dark.set(value);
	}

	async updateLookahead(value: number) {
		this.lookahead = value;
		await this.$nextTick();
		this.$root.$emit("lookaheadChange", value);
	}

	refresh() {
		Data.reset();
		this.$root.$emit("refresh");
	}

	async onUpdated(value: Date) {
		await this.$nextTick();
		this.lastUpdate = value;
	}

	mounted() {
		this.$root.$on("updated", this.onUpdated);
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
</style>
