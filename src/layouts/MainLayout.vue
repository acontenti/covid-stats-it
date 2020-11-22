<template>
	<q-layout view="hHh LpR fFf">
		<q-header elevated>
			<q-toolbar>
				<q-btn aria-label="Menu" dense flat icon="menu" round @click="leftDrawerOpen = !leftDrawerOpen"/>
				<q-toolbar-title>
					Statistiche e proiezioni sul COVID-19 per l'Italia
				</q-toolbar-title>
			</q-toolbar>
		</q-header>
		<q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-1" show-if-above>
			<q-scroll-area class="fit">
				<q-list>
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
	</q-layout>
</template>

<script lang="ts">
import MenuLink from "components/MenuLink.vue";
import {Component, Vue} from "vue-property-decorator";
import {places} from "components/models";

@Component({
	components: {MenuLink}
})
export default class MainLayout extends Vue {
	leftDrawerOpen = false;
	menuLinks = places.slice(1);
	italia = places[0];
}
</script>

<style lang="scss">
$drawer-width: 200px;
</style>
