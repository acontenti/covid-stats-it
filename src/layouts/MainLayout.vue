<template>
	<q-layout view="hHh LpR fFf">
		<controls :leftDrawerOpen.sync="leftDrawerOpen"/>
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
import Controls from "components/Controls.vue";
import {Component, Vue} from "vue-property-decorator";
import {Place, places} from "src/model/place";

@Component({
	components: {Controls, MenuLink},
	filters: {
		dateTimeFormat(date?: Date) {
			return date ? date.toLocaleString() : "";
		},
		dateFormat(date?: Date) {
			return date ? date.toLocaleDateString() : "";
		}
	}
})
export default class MainLayout extends Vue {
	readonly menuLinks: Place[] = Object.values(places);
	leftDrawerOpen = false;
	lastUpdate: Date | null = null;
	lastData: Date | null = null;

	async onUpdated(updated: Date, lastData: Date) {
		await this.$nextTick();
		this.lastUpdate = updated;
		this.lastData = lastData;
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

.q-btn-toggle button {
	border: 1px solid white;

	.q-btn__wrapper {
		padding: 2px 8px 0 !important;
		min-height: 0 !important;
	}
}

</style>
