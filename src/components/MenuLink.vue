<template>
	<q-item v-ripple :to="{params:{place:link}}" active-class="menu-link-active" clickable>
		<q-item-section>
			<q-item-label class="text-bold">{{ title }}</q-item-label>
		</q-item-section>
	</q-item>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class MenuLink extends Vue {
	@Prop({type: String, required: true}) readonly title!: string;
	@Prop({type: String, required: true}) readonly link!: string;
}
</script>

<style lang="scss" scoped>
.menu-link-active {
	color: darken($primary, 5);
	background-color: lighten($primary, 45);
}
</style>
