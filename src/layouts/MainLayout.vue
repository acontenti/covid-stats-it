<template>
	<q-layout view="hHh LpR fFf">
		<q-header :height-hint="100" elevated>
			<q-toolbar>
				<q-btn aria-label="Menu" dense flat icon="menu" round @click="leftDrawerOpen = !leftDrawerOpen"/>
				<q-toolbar-title>
					Statistiche e proiezioni COVID-19
				</q-toolbar-title>
				<q-btn flat icon="refresh" round @click="refresh"/>
				<q-btn flat icon="more_vert" round>
					<q-menu content-class="slider-container">
						<q-list class="slider-container">
							<q-item>
								<q-item-section avatar>
									<q-item-label>Previsione</q-item-label>
								</q-item-section>
								<q-item-section>
									<q-slider :label-value="lookahead + ' giorni'" :max="30" :min="1" :step="1"
											  :value="lookahead" dense label markers snap @input="updateLookahead"/>
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
		<q-drawer v-model="leftDrawerOpen" :width="200" content-class="bg-grey-1" elevated show-if-above>
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
		<q-footer :height-hint="30" bordered class="q-dark q-py-xs q-px-md">
			Copyright © 2020 Alessandro Contenti &mdash; <a class="q-link q-dark text-bold"
															href="https://github.com/acontenti/covid-stats-it"
															target="_blank">Github</a> &mdash; Ultimo aggiornamento:
			{{ lastUpdate | dateTimeFormat }}
		</q-footer>
	</q-layout>
</template>

<script lang="ts">
import MenuLink from "components/MenuLink.vue";
import {Component, Vue} from "vue-property-decorator";
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
