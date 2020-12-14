<template>
	<q-item v-ripple :to="route" active-class="menu-link-active" clickable>
		<q-item-section>
			<q-item-label class="text-bold">{{ title }}</q-item-label>
		</q-item-section>
	</q-item>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {PlaceName, places} from "src/model/place";

@Component
export default class MenuLink extends Vue {
	@Prop({type: String, required: true}) readonly title!: string;
	@Prop({type: String, required: true}) readonly link!: string;

	get route() {
		let placeName = this.link;
		if (!placeName) return false;
		let currentPlace = places[<PlaceName>placeName];
		switch (currentPlace.type) {
			case "state":
			case "region":
				return {params: {place: this.link}};
			case "province":
				return {params: {place: this.link, stat: "casi", var: "totale"}};
		}
	}
}
</script>

<style lang="scss" scoped>
.menu-link-active {
	color: darken($primary, 5);
	background-color: lighten($primary, 45);
}
</style>
