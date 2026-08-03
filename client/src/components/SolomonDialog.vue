<template>
	<modal @close="cancel">
		<template v-slot:header>
			<h2>{{ $t("modes.solomonDraft") }}</h2>
		</template>
		<template v-slot:body>
			<div class="dialog">
				<p>{{ $t("ui.solomon_draft_is_a_draft_variant_for_two_players_t") }}</p>
				<p>
					In this game mode, a player splits an <strong>{{ cardCount }}</strong
					>-card pack into two face-up piles, with no restrictions on the size of each pile. The second player
					then selects one of the two piles to add to their deck, while the player who made the split keeps
					the remaining pile.
				</p>
				<div class="dialog-settings">
					<label for="card-input">{{ $t("draft.cardCount") }}</label>
					<div>
						<input
							id="card-input"
							type="number"
							min="1"
							max="24"
							step="1"
							:placeholder="$t('ui.card_count')"
							class="small-number-input"
							v-model.number="cardCount"
						/>
						<ResetButton v-model="cardCount" :default-value="8" />
					</div>

					<label for="rounds-input">{{ $t("draft.rounds") }}</label>
					<div>
						<input
							id="rounds-input"
							type="number"
							min="1"
							max="24"
							step="1"
							:placeholder="$t('ui.rounds')"
							class="small-number-input"
							v-model.number="roundCount"
						/>
						<ResetButton v-model="roundCount" :default-value="10" />
					</div>
					<label for="remove-basic-lands-input">{{ $t("draft.removeBasics") }}</label>
					<input type="checkbox" id="remove-basic-lands-input" v-model.number="removeBasicLands" />
				</div>
			</div>
		</template>
		<template v-slot:footer>
			<div class="actions">
				<button class="confirm" @click="start">{{ $t("draft.startSolomon") }}</button>
				<button class="cancel" @click="cancel">{{ $t("common.cancel") }}</button>
			</div>
		</template>
	</modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Modal from "./Modal.vue";
import ResetButton from "./ResetButton.vue";

const cardCount = ref(8);
const roundCount = ref(10);
const removeBasicLands = ref(true);

const emit = defineEmits<{
	(e: "close"): void;
	(e: "start", cardCount: number, roundCount: number, removeBasicLands: boolean): void;
}>();

const cancel = () => emit("close");
const start = () => {
	emit("start", cardCount.value, roundCount.value, removeBasicLands.value);
	emit("close");
};
</script>

<style scoped src="../css/start-game-dialog.css" />
