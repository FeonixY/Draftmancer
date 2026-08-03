<template>
	<div>
		<div class="section-title">
			<h2>
				{{ $t("communities.title") }}
				<font-awesome-icon class="clickable" @click="explain" :icon="['fas', 'question-circle']" size="sm" />
			</h2>
		</div>
		<div style="position: relative">
			<div class="community-carousel">
				<div class="scroller" ref="communitiesEl">
					<div
						v-for="c in communities"
						:key="c.name"
						class="community"
						:style="`--icon: url(${require(`../assets/img/communities/${c.icon}`)})`"
					>
						<div class="icon"></div>
						<h2 class="name">{{ c.name }}</h2>
						<div class="description" v-html="c.brief"></div>
						<div class="links">
							<a v-if="c.links.website" :href="c.links.website" target="_blank">
								<font-awesome-icon :icon="['fas', 'globe']" /><span class="link-label"> 网站</span>
							</a>
						</div>
						<div class="tags">
							<div v-for="t in c.tags" :key="t" class="tag">{{ t }}</div>
						</div>
					</div>
				</div>
			</div>
			<div class="carousel-controls">
				<div @click="prev" class="clickable">
					<font-awesome-icon icon="fa-solid fa-chevron-left" />
				</div>
				<div class="bubbles">
					<div
						v-for="(c, idx) in communities"
						:key="c.name"
						class="clickable bubble"
						:class="{ active: selected === idx }"
						@click="select(idx)"
					>
						<div class="circle">
							<div v-if="selected === idx" class="circle fill"></div>
						</div>
					</div>
				</div>
				<div @click="next" class="clickable">
					<font-awesome-icon icon="fa-solid fa-chevron-right" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { Alert } from "../alerts";
import { ref, useTemplateRef } from "vue";
import { fitFontSize } from "../helper";

function shuffleArray<T>(array: Array<T>, start = 0, end = array.length) {
	for (let i = end - 1; i > start; i--) {
		const j = start + Math.floor(Math.random() * (i - start + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

const communitiesEl = useTemplateRef("communitiesEl");

function fitDescriptionTexts() {
	communitiesEl.value?.querySelectorAll(".community").forEach((c: Element) => {
		fitFontSize(c.querySelector(".description")!);
	});
}

onMounted(() => {
	if ("requestIdleCallback" in window) {
		// Fit the first description immediately
		fitFontSize(communitiesEl.value!.querySelector(".community .description")!);
		// And the others on idle
		requestIdleCallback(fitDescriptionTexts);
	} else fitDescriptionTexts();
});

const communities = ref([
	{
		name: "轮抽社区",
		brief: "中文 MTG 轮抽与 Cube 社区。提供 Draftmancer 轮抽服务、XMage 对局平台，以及丰富的卡表资源与活动。",
		icon: "cube_gathering.webp",
		tags: ["中文", "轮抽", "Cube", "XMage", "Draftmancer"],
		links: {
			website: "https://draft.magicdraftcommunity.cn",
		},
	},
]);
shuffleArray(communities.value);

const selected = ref(0);

const next = () => {
	selected.value = (selected.value + 1) % communities.value.length;
	resetTimeout();
};
const prev = () => {
	selected.value = (communities.value.length + selected.value - 1) % communities.value.length;
	resetTimeout();
};

const timer = 1000 * 15;
let timeout = setTimeout(next, timer);
const timeoutStart = ref(0);

const resetTimeout = () => {
	clearInterval(timeout);
	timeout = setInterval(next, timer);
	timeoutStart.value = Date.now();
};

const select = (idx: number) => {
	selected.value = idx;
	resetTimeout();
};

const explain = () => {
	Alert.fire({
		icon: "info",
		title: "推荐社区",
		html: "<p>这里展示活跃的 MTG 轮抽与 Cube 社区。</p><p>想要添加你的社区？请联系服务器管理员！</p>",
	});
};
</script>

<style scoped>
.community-carousel {
	--card-width: 800px;
	--card-height: 250px;
	--count: v-bind(communities.length);
	--selected: v-bind(selected);

	position: relative;
	overflow: hidden;
	width: var(--card-width);
	height: var(--card-height);
}

.carousel-controls {
	position: relative;
	display: flex;
	align-items: center;
	gap: 1em;
	margin: 0.2em auto;
	width: fit-content;
	--timer: calc(1ms * v-bind(timer));
}

.bubbles {
	display: flex;
	gap: 1em;
	align-items: center;
}

.bubble {
	width: 17.6px;
	height: 17.6px;
	position: relative;
	color: #888;
}

.bubble:hover .circle {
	background-color: #888;
}

.bubble.active .circle {
	border: 2px solid #fff;
}

.circle {
	position: absolute;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	border-radius: 100%;
	background-color: #ffffff80;
}

.fill {
	background-color: #fff;
	animation: fill var(--timer) linear both;
}

@keyframes fill {
	0% {
		clip-path: polygon(0 100%, 0 100%, 100% 100%, 100% 100%);
	}
	100% {
		clip-path: polygon(0 0, 0 100%, 100% 100%, 100% 0);
	}
}

.scroller {
	position: absolute;
	display: flex;
	width: calc(var(--count) * var(--card-width));
	height: var(--card-height);
	transition: all 0.25s ease;

	left: calc(-1 * var(--selected) * var(--card-width));
}

.community {
	box-sizing: border-box;
	display: inline-grid;
	grid-template-areas:
		"icon name"
		"icon description"
		"icon links"
		"icon tags";
	grid-template-rows: auto 1fr auto auto;
	column-gap: 0.5em;
	row-gap: 0.25em;
	width: var(--card-width);
	height: var(--card-height);
	overflow: hidden;
	border-radius: 20px;
	background-color: #333;
}

h1 {
	margin: 0;
}

h2 {
	margin: 0.25em;
}

.icon {
	grid-area: icon;
	background-size: cover;
	background-position: center;
	background-image: var(--icon);
	width: var(--card-height);
}

.name {
	grid-area: name;
}

.description {
	grid-area: description;

	display: flex;
	justify-content: center;
	align-items: center;
	padding-left: 0.5em;
	padding-right: 0.5em;
}

.links {
	grid-area: links;
	display: flex;
	justify-content: space-evenly;
	align-content: center;
	align-items: center;
}

.tags {
	grid-area: tags;
	display: flex;
	flex-wrap: wrap;
	align-content: center;
	gap: 0.25em;
	padding: 0.5em;
}

.tag {
	padding: 2.5px 10px 2.5px 10px;
	border-radius: 10px;
	background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 799px) {
	.community-carousel {
		--card-width: 95vw;
		--card-height: 300px;
	}
	.community {
		grid-template-rows: auto 1fr auto auto;
		grid-template-columns: 100px 1fr;
		grid-template-areas:
			"name name"
			"description description"
			"icon links"
			"icon tags";
	}

	.icon {
		width: auto;
		height: auto;
		aspect-ratio: 1;
	}

	.name {
		text-align: center;
	}

	.carousel-controls {
		width: auto;
		max-width: 100%;
	}

	.bubbles {
		flex: 1;
		flex-wrap: wrap;
		justify-content: center;
		min-width: 0;
	}
}

@media (max-width: 500px) {
	.link-label {
		display: none;
	}
}
</style>
