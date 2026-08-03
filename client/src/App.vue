<template>
	<div
		id="main-container"
		:style="`
			height: ${displayFixedDeck ? fixedDeckState.mainHeight : '100vh'};
			--card-back-image: url(${cardBackImage});
			--card-title-height-factor: ${cardTitleHeightFactor};
		`"
		:class="{ 'using-fixed-deck': displayFixedDeck, 'no-foil-effect': !foilEffect }"
	>
		<!-- Personal Options -->
		<div id="view-controls" class="main-controls">
			<span>
				<label for="user-name">{{ $t("session.userName") }}</label>
				<delayed-input
					id="user-name"
					v-model="userName"
					type="text"
					:maxlength="50"
					:delay="2"
					style="margin-right: 0.25em"
				/>
			</span>
			<div class="inline" v-tooltip="$t('tooltips.cardLanguage')">
				<label for="select-language" id="select-language-label">{{ $t("cards.cardLanguage") }}</label>
				<select v-model="language" id="select-language">
					<option
						v-for="lang in languages"
						v-bind:value="lang.code"
						:selected="lang.code === language"
						:key="lang.code"
					>
						{{ lang.name }}
					</option>
				</select>
			</div>
			<span v-if="sessionID && !managed">
				<label class="clickable" @click="displayedModal = hasCollection ? 'collection' : 'collectionHelp'">
					<font-awesome-layers
						v-tooltip="
							hasCollection
								? useCollection
									? 'Collection uploaded.'
									: 'Collection uploaded, but not used.'
								: 'No collection uploaded.'
						"
					>
						<font-awesome-icon
							icon="fa-solid fa-book"
							:class="{
								faded: !hasCollection,
								green: hasCollection && useCollection,
								yellow: hasCollection && !useCollection,
							}"
						/>
					</font-awesome-layers>
					MTGA Collection
				</label>
				<span
					style="
						display: inline-flex;
						gap: 0.75em;
						align-items: center;
						margin-right: 0.25em;
						vertical-align: middle;
					"
				>
					<font-awesome-icon
						icon="fa-solid fa-question-circle"
						class="clickable"
						@click="displayedModal = 'collectionHelp'"
						v-tooltip="$t('tooltips.collectionImportHelp')"
					/>
					<input
						type="file"
						id="collection-file-input"
						@change="uploadCardListAsCollection"
						style="display: none"
						accept=".txt,.csv,.log"
					/>
					<span v-tooltip="$t('tooltips.importCollection')">
						<font-awesome-icon @click="uploadMTGALogs" icon="fa-solid fa-file-upload" class="clickable" />
					</span>
					<font-awesome-icon
						icon="fa-solid fa-chart-bar"
						class="clickable"
						v-if="hasCollection"
						v-tooltip="$t('tooltips.collectionStats')"
						@click="displayedModal = 'collection'"
					/>
					<div
						v-show="hasCollection"
						class="inline"
						v-tooltip="{
							html: true,
							content: `Restrict to Collection: <strong>${
								useCollection ? 'Enabled' : 'Disabled'
							}</strong><br />
							If enabled, your collection will be used to restrict the card pool, making sure you'll only draft with cards you already own. (Ignored when using a Custom Card List)${
								ignoreCollections
									? '<p><strong>Warning:</strong> The session setting \'Restrict card pool to Player Collections\' is disabled, your collection is currently ignored.</p>'
									: ''
							}`,
						}"
					>
						<input type="checkbox" v-model="useCollection" id="useCollection" />
						<label for="useCollection">{{ $t("cards.restrictToCollection") }}</label>
					</div>
				</span>
			</span>
			<div>
				<button @click="displayedModal = 'draftLogs'" class="flat" v-tooltip="$t('tooltips.gameLogs')">
					<font-awesome-icon icon="fa-solid fa-list" /> {{ $t("menu.gameLogs") }}
				</button>
			</div>
			<span class="personal-settings">
				<div
					class="clickable personal-settings-icon"
					:class="{ faded: !foilEffect, crossed: !foilEffect }"
					@click="foilEffect = !foilEffect"
					v-tooltip="{
						content: `Foil effect: <strong>${foilEffect ? 'Enabled' : 'Disabled'}</strong>`,
						html: true,
					}"
					tabindex="0"
				>
					<div style="margin-top: 1px" alt="Foil Effect Toggle">
						<img src="./assets/img/foil.svg" width="auto" height="18px" alt="Foil Effect Toggle" />
					</div>
				</div>
				<div
					class="clickable personal-settings-icon"
					:class="{ faded: !fixedDeck, crossed: !fixedDeck }"
					@click="fixedDeck = !fixedDeck"
					v-tooltip="{
						content: `Deck always visible: <strong>${fixedDeck ? 'Enabled' : 'Disabled'}</strong>`,
						html: true,
					}"
					tabindex="0"
				>
					<font-awesome-icon icon="fa-solid fa-thumbtack" style="font-size: 1.2em; vertical-align: -20%" />
				</div>
				<div
					class="clickable personal-settings-icon"
					:class="{ faded: !pickOnDblclick, crossed: !pickOnDblclick }"
					@click="pickOnDblclick = !pickOnDblclick"
					v-tooltip="{
						content: `Pick cards by double clicking: <strong>${
							pickOnDblclick ? 'Enabled' : 'Disabled'
						}</strong>`,
						html: true,
					}"
					tabindex="0"
				>
					<font-awesome-icon
						icon="fa-solid fa-mouse-pointer"
						style="font-size: 1.2em; vertical-align: -20%"
					/>
				</div>
				<div
					class="clickable personal-settings-icon"
					:class="{ faded: !displayBotScores, crossed: !displayBotScores }"
					@click="displayBotScores = !displayBotScores"
					v-tooltip="{
						content: `Display Bot Recommendations: <strong>${
							displayBotScores ? 'Enabled' : 'Disabled'
						}</strong><br /><small>Note: Bot recommendations can be disabled by the session owner.</small>`,
						html: true,
					}"
					tabindex="0"
				>
					<div style="width: 20px; margin-top: 5px" alt="Bot Recommendations Button">
						<img src="./assets/img/bot-score.svg" width="20" height="20" alt="Bot Recommendations Button" />
					</div>
				</div>
				<div
					class="clickable personal-settings-icon"
					:class="{ faded: !enableSound }"
					@click="enableSound = !enableSound"
					v-tooltip="{
						content: `Sound: <strong>${enableSound ? 'Enabled' : 'Disabled'}</strong>`,
						html: true,
					}"
					tabindex="0"
				>
					<font-awesome-icon :icon="`fa-solid ${enableSound ? 'fa-volume-up' : 'fa-volume-mute'}`" />
				</div>
				<div
					class="clickable personal-settings-icon"
					:class="{
						faded: !enableNotifications,
						'greyed-out': notificationPermission === 'denied',
					}"
					v-tooltip="{
						content:
							notificationPermission === 'denied'
								? 'Notifications for this domain are blocked in your browser'
								: `Desktop Notifications: <strong>${
										enableNotifications ? 'Enabled' : 'Disabled'
									}</strong>`,
						html: true,
					}"
					@click="toggleNotifications"
					tabindex="0"
				>
					<font-awesome-icon :icon="`fa-solid ${enableNotifications ? 'fa-bell' : 'fa-bell-slash'}`" />
				</div>
			</span>
		</div>

		<!-- Session Options -->
		<div class="generic-container" v-if="sessionID !== undefined && !managed">
			<div id="limited-controls" class="main-controls" v-bind:class="{ disabled: drafting }">
				<span id="session-controls">
					<div
						class="inline"
						v-tooltip="
							'Unique ID of your game session. Create a new session by entering a name of your choice.'
						"
						style="margin-right: 0.25em"
					>
						<label for="session-id">{{ $t("ui.session") }}</label>
						<delayed-input
							v-model="sessionID"
							autocomplete="off"
							id="session-id"
							:type="hideSessionID ? 'password' : 'text'"
							:maxlength="50"
							:delay="2"
						/>
					</div>
					<div
						style="
							display: inline-flex;
							gap: 0.3em;
							align-items: center;
							margin-left: 0.25em;
							vertical-align: middle;
						"
					>
						<font-awesome-icon
							class="fa-regular clickable"
							:icon="'fa-regular ' + (hideSessionID ? 'fa-eye' : 'fa-eye-slash')"
							@click="hideSessionID = !hideSessionID"
							v-tooltip="$t('tooltips.toggleSessionId')"
							fixed-width
						/>

						<font-awesome-icon
							class="clickable"
							icon="fa-solid fa-share-from-square"
							v-tooltip="$t('tooltips.copySessionLink')"
							@click="sessionURLToClipboard"
							fixed-width
						/>

						<font-awesome-icon
							id="bracket-button"
							class="clickable"
							icon="fa-solid fa-trophy"
							v-if="sessionOwner === userID && !bracket"
							@click="generateBracket(teamDraft ? BracketType.Team : BracketType.Single)"
							v-tooltip="$t('tooltips.generateBracket')"
						/>
						<font-awesome-icon
							id="bracket-button"
							class="clickable"
							icon="fa-solid fa-trophy"
							v-else-if="bracket"
							@click="displayedModal = 'bracket'"
							v-tooltip="$t('tooltips.displayBracket')"
						/>

						<font-awesome-icon
							class="clickable"
							icon="fa-solid fa-user-check"
							v-if="sessionOwner === userID"
							@click="readyCheck"
							v-tooltip="'Ready Check: Ask everyone in your session if they\'re ready to play.'"
						/>
					</div>
				</span>
				<div class="generic-container card-pool-controls">
					<input
						type="file"
						id="card-list-input-main"
						@change="uploadFile($event, parseCustomCardList)"
						style="display: none"
						accept=".txt"
					/>

					<strong class="remove-below-1400">{{ $t("cards.cardPoolLabel") }}</strong>
					<template v-if="useCustomCardList && customCardList">
						<span class="inline-cube-name" style="vertical-align: text-top">{{
							customCardList.name ?? "Custom Card List"
						}}</span>
						<div style="display: inline-flex; gap: 0.25em; align-items: center; vertical-align: middle">
							<div v-if="customCardList!.sheets && Object.keys(customCardList!.sheets).length > 0">
								<font-awesome-icon
									style="padding: 0.25em"
									icon="fa-solid fa-file-alt"
									class="clickable blue"
									@click="displayedModal = 'cardList'"
									v-tooltip="$t('tooltips.reviewCardList')"
								/>
							</div>
							<div v-else>{{ $t("cards.noListLoaded") }}</div>
							<div class="clickable" onclick="document.querySelector('#card-list-input-main').click()">
								<font-awesome-icon
									style="padding: 0.25em"
									icon="fa-solid fa-file-upload"
									v-tooltip="$t('tooltips.uploadCustomList')"
									v-if="sessionOwner === userID"
								/>
							</div>
							<div @click="useCustomCardList = false" class="clickable brightred">
								<font-awesome-icon
									style="padding: 0.25em"
									icon="fa-solid fa-times"
									v-tooltip="$t('tooltips.returnToSets')"
									v-if="sessionOwner === userID"
								/>
							</div>
						</div>
					</template>
					<span v-else :class="{ disabled: sessionOwner != userID }">
						<div class="inline">
							<set-select v-model="setRestriction" :options="sets.slice().reverse()">
								<template v-slot:beforeList>
									<div
										class="clickable"
										style="
											text-align: center;
											padding: 0.5em;
											font-size: 0.75em;
											background-color: #444;
										"
										onclick="document.querySelector('#card-list-input-main').click()"
									>
										Upload a Custom Card List...
									</div>
								</template>
								<template v-slot:afterList>
									<div
										class="clickable"
										style="
											text-align: center;
											padding: 0.5em;
											font-size: 0.75em;
											background-color: #444;
										"
										@click="displayedModal = 'setRestriction'"
									>
										More sets...
									</div>
								</template>
							</set-select>
							<div
								class="inline clickable"
								style="padding: 0.4em 0.6em"
								@click="displayedModal = 'setRestriction'"
								v-tooltip="$t('tooltips.moreSets')"
							>
								<font-awesome-icon icon="fa-solid fa-ellipsis-v" />
							</div>
							<div
								class="inline clickable"
								v-tooltip="{
									html: true,
									content: `Restrict card pool to Player Collections: <strong>${
										ignoreCollections ? 'Disabled' : 'Enabled'
									}</strong>
									<br/>If enabled, card pool will be limited to cards present in all player collections.`,
								}"
								@click="ignoreCollections = !ignoreCollections"
								:class="{ faded: ignoreCollections, crossed: ignoreCollections }"
							>
								<font-awesome-icon icon="fa-solid fa-book" />
							</div>
						</div>
					</span>
				</div>
				<span class="generic-container" :class="{ disabled: sessionOwner != userID }">
					<strong>Draft:</strong>
					<div class="inline" :class="{ disabled: teamDraft }" v-tooltip="$t('tooltips.bots')">
						<label for="bots"><font-awesome-icon icon="fa-solid fa-robot" /></label>
						<input
							type="number"
							id="bots"
							class="small-number-input"
							min="0"
							:max="Math.max(7, maxPlayers - 1)"
							step="1"
							v-model.number="bots"
						/>
					</div>
					<div class="inline" v-tooltip="$t('tooltips.pickTimer')" :class="{ disabled: tournamentTimer }">
						<label for="timer">
							<font-awesome-icon icon="fa-solid fa-stopwatch" size="lg" />
						</label>
						<input
							type="number"
							id="timer"
							class="small-number-input"
							min="0"
							max="180"
							step="15"
							v-model.number="maxTimer"
						/>
					</div>
					<span v-tooltip="$t('tooltips.startDraft')">
						<button @click="startDraft" v-show="userID === sessionOwner" class="blue">
							{{ $t("common.start") }}
						</button>
					</span>
				</span>
				<span v-show="userID === sessionOwner">
					<dropdown :class="{ disabled: sessionOwner != userID }">
						<template v-slot:handle> Other Game Modes </template>
						<template v-slot:dropdown>
							<div class="game-modes-cat">
								<span class="game-modes-cat-title">{{ $t("ui.draft") }}</span>
								<div
									v-tooltip.left="
										'Starts a Winston Draft. This is a draft variant intended for two players, but playable at any number.'
									"
								>
									<button @click="startWinstonDraft()">{{ $t("modes.winston") }}</button>
								</div>
								<div
									v-tooltip.left="
										'Starts a Winchester Draft. This is a draft variant similar to Winston and Rochester draft.'
									"
								>
									<button @click="startWinchesterDraft()">{{ $t("modes.winchester") }}</button>
								</div>
								<div v-tooltip.left="$t('tooltips.startHousman')">
									<button @click="startHousmanDraft()">{{ $t("modes.housman") }}</button>
								</div>
								<div v-tooltip.left="$t('tooltips.startSolomon')">
									<button @click="startSolomonDraft()">{{ $t("modes.solomonPlayers") }}</button>
								</div>
								<div
									v-tooltip.left="
										'Starts a Grid Draft. This is a draft variant for two to four players.'
									"
								>
									<button @click="startGridDraft()">{{ $t("modes.gridPlayers") }}</button>
								</div>
								<div
									v-tooltip.left="
										'Starts a Glimpse Draft. Players also remove cards from the draft each pick.'
									"
								>
									<button @click="startGlimpseDraft()">{{ $t("modes.glimpseBurn") }}</button>
								</div>
								<div
									v-tooltip.left="
										'Starts a Rochester Draft. Every players pick from a single booster.'
									"
								>
									<button @click="startRochesterDraft()">{{ $t("modes.rochester") }}</button>
								</div>
								<div
									v-tooltip.left="
										'Starts a Rotisserie Draft. Each player picks from a single card pool one after the other.'
									"
								>
									<button @click="startRotisserieDraft()">{{ $t("modes.rotisserie") }}</button>
								</div>
								<div v-tooltip.left="$t('tooltips.startMinesweeper')">
									<button @click="startMinesweeperDraft()">{{ $t("modes.minesweeper") }}</button>
								</div>
								<div v-tooltip.left="$t('tooltips.startSupreme')">
									<button @click="startSupremeDraft()">{{ $t("modes.supremePlayers") }}</button>
								</div>
								<div v-tooltip.left="$t('tooltips.startSilentAuction')">
									<button @click="startSilentAuctionDraft()">{{ $t("modes.silentAuction") }}</button>
								</div>
							</div>
							<div class="game-modes-cat">
								<span class="game-modes-cat-title">{{ $t("modes.sealed") }}</span>
								<div v-tooltip.left="$t('tooltips.startSealed')">
									<button @click="sealedDialog(false)">{{ $t("modes.sealed") }}</button>
								</div>
								<div v-tooltip.left="$t('tooltips.startTeamSealed')">
									<button @click="sealedDialog(true)">{{ $t("modes.teamSealed") }}</button>
								</div>
								<div
									v-tooltip.left="
										'Distributes two Jumpstart boosters to everyone. Multiple sets are available.'
									"
								>
									<button @click="jumpstartDialog">{{ $t("modes.jumpstart") }}</button>
								</div>
								<div
									v-tooltip.left="
										'Distributes two Jump In! boosters to everyone. Multiple sets are available.'
									"
								>
									<button @click="startJumpIn">{{ $t("modes.jumpIn") }}</button>
								</div>
							</div>
						</template>
					</dropdown>
				</span>
				<button
					v-tooltip="$t('tooltips.moreSessionSettings')"
					@click="displayedModal = 'sessionOptions'"
					class="setting-button flat"
				>
					<font-awesome-icon icon="fa-solid fa-cog" />
					Settings
				</button>
			</div>
			<div v-if="drafting" class="controls-drafting-mask">
				<div id="url-remainder">Draftmancer.com</div>
				<div id="draft-in-progress">
					{{ gameModeName }}
					<span
						v-if="useCustomCardList && customCardList?.name"
						class="inline-cube-name remove-below-1200"
						style="vertical-align: bottom; max-width: 22em"
					>
						- {{ customCardList.name }}</span
					>
				</div>
				<div id="draft-controls">
					<template v-if="sessionOwner === userID">
						<button class="stop" @click="stopDraft">
							<font-awesome-icon icon="fa-solid fa-stop" /> Stop
						</button>
						<button
							v-if="maxTimer > 0 && !draftPaused"
							class="stop"
							:class="{ 'opaque-disabled': waitingForDisconnectedUsers }"
							@click="pauseDraft"
						>
							<font-awesome-icon icon="fa-solid fa-pause" /> Pause
						</button>
						<button
							v-else-if="maxTimer > 0 && draftPaused"
							class="confirm"
							:class="{ 'opaque-disabled': waitingForDisconnectedUsers }"
							@click="resumeDraft"
						>
							<font-awesome-icon icon="fa-solid fa-play" /> Resume
						</button>
					</template>
				</div>
			</div>
		</div>

		<!-- Session Players -->
		<div class="main-controls session-players" v-if="sessionID !== undefined">
			<div class="session-players-header">
				<div
					v-if="!ownerIsPlayer"
					class="generic-container"
					v-tooltip="
						sessionOwnerUsername
							? `${sessionOwnerUsername} is the session owner.`
							: 'Session owner is disconnected.'
					"
					style="flex: 0 3 auto; text-align: center"
				>
					<font-awesome-icon icon="fa-solid fa-crown" class="subtle-gold" />
					<div class="non-playing-session-owner-name">
						{{ sessionOwnerUsername ? sessionOwnerUsername : "(Disconnected)" }}
					</div>
					<div class="chat-bubble" :id="'chat-bubble-' + sessionOwner"></div>
				</div>
				<div
					v-tooltip="$t('tooltips.maxPlayersHint')"
					style="flex: 0 3 auto; text-align: center; font-size: 0.8em; margin-right: 0.5em"
				>
					Players
					<br />
					({{ sessionUsers.length }}/{{ maxPlayers }})
				</div>
				<div
					v-if="!drafting"
					:class="{
						crossed: !randomizeSeatingOrder,
						faded: !randomizeSeatingOrder,
						clickable: userID === sessionOwner,
					}"
					style="margin-right: 0.5em"
					@click="if (userID === sessionOwner) randomizeSeatingOrder = !randomizeSeatingOrder;"
					v-tooltip="{
						content: `Randomize Seating Order on draft start: <strong>${
							randomizeSeatingOrder ? 'Enabled' : 'Disabled'
						}</strong>`,
						html: true,
					}"
				>
					<font-awesome-icon icon="fa-solid fa-random" />
				</div>
				<div
					v-if="sessionSpectators.length > 0 || (userID === sessionOwner && allowSpectators)"
					class="session-spectators clickable"
					@click="displaySpectatorsList = !displaySpectatorsList"
				>
					<span
						class="spectator-count"
						:class="{ open: displaySpectatorsList }"
						v-tooltip="`${sessionSpectators.length} spectator(s)`"
					>
						<font-awesome-icon icon="fa-regular fa-eye" />
						<span>{{ sessionSpectators.length }}</span>
						<font-awesome-icon icon="fa-solid fa-chevron-down" class="spectator-caret" />
					</span>
					<Transition>
						<div class="spectators-dropdown" v-if="displaySpectatorsList" @click.stop>
							<div class="game-modes-cat-title">{{ $t("session.spectators") }}</div>
							<div class="spectator-list">
								<div
									class="spectator-name"
									:class="{ self: spectator.userID === userID }"
									v-for="spectator in sortedSessionSpectators"
									:key="spectator.userID"
								>
									<font-awesome-icon
										v-if="userID === sessionOwner"
										icon="fa-solid fa-user-slash"
										class="clickable red"
										v-tooltip="`Remove ${spectator.userName} from the session`"
										@click="removePlayer(spectator.userID)"
									/>
									<span class="spectator-username">{{ spectator.userName }}</span>
								</div>
								<div v-if="sessionSpectators.length === 0">{{ $t("session.noSpectators") }}</div>
							</div>
							<div class="spectator-controls" v-if="userID === sessionOwner">
								<hr />
								<!-- NOTE: If the owner changes after spectating was enabled, the new owner won't know the spectator key.
										We could send it, but for now let's avoid leaking the key on owner disconnection. -->
								<button @click="spectatorLinkToClipboard" :disabled="!spectateKey">
									<font-awesome-icon icon="fa-solid fa-clipboard" /> Copy Link
								</button>
								<button
									class="stop"
									v-tooltip="$t('tooltips.removeSpectators')"
									@click="disableSpectating"
								>
									<font-awesome-icon icon="fa-regular fa-eye-slash" /> Disable
								</button>
							</div>
						</div>
					</Transition>
					<div class="chat-bubble" id="chat-bubble-spectators"></div>
				</div>
			</div>
			<div class="player-list-container">
				<template v-if="!drafting">
					<template v-if="sessionOwner === userID">
						<Sortable
							:key="`draggable-${userOrder.length}`"
							:list="userOrder"
							:item-key="(uid: string) => uid"
							:options="{ animation: 200, disabled: userID !== sessionOwner }"
							@update="changePlayerOrder"
							class="player-list"
							tag="ul"
						>
							<template #item="{ element, index }">
								<SessionUser
									:index="index"
									:user="userByID[element]"
									:self="userID"
									:sessionOwner="sessionOwner"
									:pendingReadyCheck="pendingReadyCheck"
									:teamDraft="teamDraft"
									:useCustomCardList="useCustomCardList"
									:ignoreCollections="ignoreCollections"
									:canRequestTakeover="sessionUsers.length >= 5"
									@removePlayer="removePlayer"
									@setSessionOwner="setSessionOwner"
									@movePlayer="movePlayer"
								/>
							</template>
						</Sortable>
					</template>
					<template v-else>
						<transition-group tag="ul" name="player-list-transition" class="player-list">
							<SessionUser
								v-for="(element, index) in userOrder"
								:key="element"
								:index="index"
								:user="userByID[element]"
								:self="userID"
								:sessionOwner="sessionOwner"
								:pendingReadyCheck="pendingReadyCheck"
								:teamDraft="teamDraft"
								:useCustomCardList="useCustomCardList"
								:ignoreCollections="ignoreCollections"
								:canRequestTakeover="sessionUsers.length >= 5"
								@requestTakeover="requestTakeover"
							/>
						</transition-group>
					</template>
				</template>
				<template v-else>
					<ul class="player-list">
						<Player
							v-for="(user, idx) in virtualPlayers"
							:key="user.userID"
							:user="user"
							:userID="userID"
							:sessionOwner="sessionOwner"
							:passingOrder="passingOrder"
							:isCurrentPlayer="currentPlayer === user.userID"
							:class="{
								teama: teamDraft && idx % 2 === 0,
								teamb: teamDraft && idx % 2 === 1,
								self: userID === user.userID,
							}"
							@removePlayer="removePlayer"
							@setSessionOwner="setSessionOwner"
						/>
					</ul>
				</template>
			</div>
			<div class="chat">
				<form @submit.prevent="sendChatMessage">
					<input type="text" v-model="currentChatMessage" :placeholder="chatPlaceholder" maxlength="255" />
				</form>
				<font-awesome-icon
					class="clickable"
					icon="fa-regular fa-comments"
					@click="displayChatHistory = !displayChatHistory"
					v-tooltip="$t('tooltips.chatHistory')"
				/>
				<ChatHistory
					v-if="displayChatHistory"
					@focusout="displayChatHistory = false"
					:messagesHistory="messagesHistory"
					:userID="userID"
					:sessionOwner="sessionOwner"
					:sessionOwnerUsername="sessionOwnerUsername"
					:userByID="userByID"
					:sessionSpectators="sessionSpectators"
					:mutedUsers="mutedUsers"
				/>
			</div>
		</div>
		<div class="main-content">
			<!-- Draft Controls -->
			<div v-show="drafting || gameState === GameState.Watching" class="generic-container">
				<template v-if="draftState">
					<transition
						:name="
							draftState.pickNumber > 0
								? `slide-fade-${passingOrder === PassingOrder.Left ? 'left' : 'right'}`
								: 'booster-fade-in'
						"
						mode="out-in"
					>
						<div v-if="gameState === GameState.Watching" key="draft-watching" class="draft-watching">
							<div class="draft-watching-state">
								<h1 v-if="!drafting">{{ $t("draft.completed") }}</h1>
								<h1 v-else-if="!draftPaused">{{ $t("draft.playersDrafting") }}</h1>
								<h1 v-else>{{ $t("draft.paused") }}</h1>
								<div v-if="drafting">Pack #{{ draftState.boosterNumber + 1 }}</div>
								<div v-else>{{ $t("draft.finalizingDecks") }}</div>
							</div>
							<div
								v-if="draftLogLive && draftLogLive.sessionID === sessionID"
								class="draft-watching-live-log"
							>
								<DraftLogLiveComponent
									:draftlog="draftLogLive"
									:show="['owner', 'delayed', 'everyone'].includes(draftLogRecipients)"
									:language="language"
									:key="draftLogLive.time"
									ref="draftloglive"
								></DraftLogLiveComponent>
							</div>
						</div>
						<div
							v-else-if="
								(gameState === GameState.Waiting || gameState === GameState.Picking) &&
								draftState.booster
							"
							:key="`draft-picking-${draftState.boosterNumber}-${draftState.pickNumber}`"
							class="container"
							:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
						>
							<div id="booster-controls" class="section-title">
								<h2>Your Booster ({{ draftState.booster.length }})</h2>
								<div class="controls" style="flex-grow: 2">
									<span
										>Pack #{{ draftState.boosterNumber + 1 }}, Pick #{{
											draftState.pickNumber + 1
										}}</span
									>
									<span v-show="pickTimer >= 0" :class="{ redbg: pickTimer <= 10 }" id="chrono">
										<div
											class="timer-icon"
											:key="`${maxTimer}_${draftState.boosterNumber}_${draftState.pickNumber}`"
											:style="`--timer-max: ${maxTimer}; --timer-current: ${pickTimer - 1}`"
										>
											<font-awesome-icon icon="fa-solid fa-stopwatch" size="lg" />
											<div class="timer-icon-moving"></div>
										</div>
										<span>{{ pickTimer }}</span>
									</span>
									<template v-if="gameState == GameState.Picking">
										<template v-if="draftState.skipPick">
											<button @click="passBooster">{{ $t("draft.passBooster") }}</button>
										</template>
										<template v-else>
											<input
												type="button"
												@click="pickCard()"
												:value="$t('ui.confirm_pick')"
												v-if="
													selectedCards.length === cardsToPick &&
													burningCards.length === cardsToBurnThisRound
												"
											/>
											<span v-else>
												<span v-if="cardsToPick === 1">{{ $t("draft.pickACard") }}</span>
												<span v-else>
													Pick {{ cardsToPick }} cards ({{ selectedCards.length }}/{{
														cardsToPick
													}})
												</span>
												<span v-if="cardsToBurnThisRound === 1">
													and remove a card from the pool.
												</span>
												<span v-else-if="cardsToBurnThisRound > 1">
													and remove {{ cardsToBurnThisRound }} cards from the pool ({{
														burningCards.length
													}}/{{ cardsToBurnThisRound }}).
												</span>
											</span>

											<DraftEffectDropdown
												:available-effects="availableOptionalDraftEffects"
												v-model="selectedOptionalDraftPickEffects"
												:singular-label="'Pick Effect'"
												:plural-label="'Pick Effects'"
											/>
											<DraftEffectDropdown
												:available-effects="availableDraftEffects"
												v-model="selectedUsableDraftEffects"
												:singular-label="'Draft Effect'"
												:plural-label="'Draft Effects'"
											/>
										</template>
									</template>
									<template v-else>
										<font-awesome-icon icon="fa-solid fa-spinner" spin />
										Waiting for other players to pick...
									</template>
								</div>
								<scale-slider v-model.number="boosterCardScale" />
							</div>
							<!-- Note: Duration for booster-open can't be determined by Vue since it's composite. Be sure to keep that in sync :) -->
							<transition-group
								tag="div"
								:name="draftState.pickNumber === 0 ? 'booster-open' : 'booster-cards'"
								class="booster card-container"
								:class="{
									'booster-waiting': gameState === GameState.Waiting,
									skipped: draftState.skipPick,
								}"
								:style="`--booster-card-scale: ${boosterCardScale};`"
								:duration="
									draftState.pickNumber === 0
										? 500 + 500 + 400 + Math.min(20, draftState.booster.length) * 40
										: 0
								"
								@enter="onEnterBoosterCards"
								appear
							>
								<div class="wait" key="wait" v-if="gameState === GameState.Waiting">
									<font-awesome-icon
										class="passing-order"
										:class="{
											'booster-wait-passing-order-left': passingOrder === PassingOrder.Left,
											'booster-wait-passing-order-right': passingOrder === PassingOrder.Right,
										}"
										:icon="
											'fa-solid ' +
											(passingOrder === PassingOrder.Left
												? 'fa-angle-double-left'
												: 'fa-angle-double-right')
										"
										size="sm"
										v-show="draftState.booster.length > 0"
									/>
									<font-awesome-icon icon="fa-solid fa-spinner" size="lg" spin />
									<font-awesome-icon
										class="passing-order"
										:class="{
											'booster-wait-passing-order-left': passingOrder === PassingOrder.Left,
											'booster-wait-passing-order-right': passingOrder === PassingOrder.Right,
										}"
										:icon="
											'fa-solid ' +
											(passingOrder === PassingOrder.Left
												? 'fa-angle-double-left'
												: 'fa-angle-double-right')
										"
										size="sm"
										v-show="draftState.booster.length > 0"
									/>
								</div>
								<booster-card
									v-for="(card, idx) in draftState.booster"
									:key="`card-booster-${card.uniqueID}`"
									:card="card"
									:language="language"
									:canbeburned="draftState.burnsThisRound > 0"
									:burned="burningCards.includes(card.uniqueID)"
									:class="{ selected: selectedCards.includes(card.uniqueID) }"
									@click="draftState.skipPick ? () => {} : selectCard($event, card)"
									@dblclick="draftState.skipPick ? () => {} : doubleClickCard($event, card)"
									@burn="draftState.skipPick ? () => {} : burnCard($event, card)"
									@restore="draftState.skipPick ? () => {} : restoreCard($event, card)"
									:draggable="!draftState.skipPick"
									@dragstart="draftState.skipPick ? () => {} : dragBoosterCard($event, card)"
									:hasenoughwildcards="hasEnoughWildcards(card)"
									:wildcardneeded="displayCollectionStatus && wildcardCost(card)"
									:botscore="
										gameState !== GameState.Waiting &&
										botScores &&
										botScores.scores &&
										displayBotScores
											? botScores.scores[idx]
											: null
									"
									:botpicked="
										gameState !== GameState.Waiting &&
										botScores &&
										displayBotScores &&
										idx === botScores.chosenOption
									"
									:scale="boosterCardScale"
									:renderCommonBackside="draftState.pickNumber === 0"
								></booster-card>
							</transition-group>
						</div>
					</transition>

					<div v-if="gameState === GameState.Reviewing" style="text-align: center">
						<h1>{{ $t("draft.reviewPhase") }}</h1>
						<span class="chrono">
							<div
								class="timer-icon"
								:key="`${reviewTimer}_${draftState.boosterNumber}_${draftState.pickNumber}`"
								:style="`--timer-max: ${reviewTimer}; --timer-current: ${pickTimer - 1}`"
							>
								<font-awesome-icon icon="fa-solid fa-stopwatch" size="lg" />
								<div class="timer-icon-moving"></div>
							</div>
							<span>{{ pickTimer }}</span>
						</span>
					</div>
				</template>
				<winston-draft
					v-if="
						(gameState === GameState.WinstonPicking || gameState === GameState.WinstonWaiting) &&
						winstonDraftState
					"
					class="container"
					:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
					:language="language"
					:userID="userID"
					:sessionUsers="userByID"
					:winstonDraftState="winstonDraftState"
					@take="winstonDraftTakePile"
					@skip="winstonDraftSkipPile"
				/>
				<winchester-draft
					v-if="
						(gameState === GameState.WinchesterPicking || gameState === GameState.WinchesterWaiting) &&
						winchesterDraftState
					"
					class="container"
					:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
					:language="language"
					:userID="userID"
					:sessionUsers="userByID"
					:winchesterDraftState="winchesterDraftState"
					@pick="winchesterDraftPick"
				/>
				<housman-draft
					v-if="gameState === GameState.HousmanDraft && housmanDraftState"
					class="container"
					:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
					:socket="socket"
					:language="language"
					:userID="userID"
					:sessionUsers="userByID"
					v-model:state="housmanDraftState"
					@notifyTurn="notifyTurn"
					@addToDeck="addToDeck"
					@end="housmanDraftEnd"
				/>
				<solomon-draft
					v-if="gameState === GameState.SolomonDraft && solomonDraftState"
					class="container"
					:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
					:socket="socket"
					:language="language"
					:userID="userID"
					:sessionUsers="userByID"
					v-model:state="solomonDraftState"
					@notifyTurn="notifyTurn"
					@addToDeck="addToDeck"
					@end="solomonDraftEnd"
				/>
				<silent-auction-draft
					v-if="gameState === GameState.SilentAuctionDraft && silentAuctionDraftState"
					class="container"
					:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
					:socket="socket"
					:language="language"
					:userID="userID"
					:sessionUsers="userByID"
					v-model:state="silentAuctionDraftState"
					@addToDeck="addToDeck"
					@end="silentAuctionDraftEnd"
				/>
				<!-- Grid Draft -->
				<div
					:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
					v-if="
						(gameState === GameState.GridPicking || gameState === GameState.GridWaiting) && gridDraftState
					"
				>
					<div class="section-title">
						<h2>{{ $t("modes.grid") }}</h2>
						<div class="controls">
							<span>
								Pack #{{
									Math.min(
										Math.floor(gridDraftState.round / sessionUsers.length) + 1,
										gridDraftState.boosterCount
									)
								}}/{{ gridDraftState.boosterCount }}
							</span>
							<span>
								<template v-if="userID === gridDraftState.currentPlayer">
									<font-awesome-icon icon="fa-solid fa-exclamation-circle" /> It's your turn! Pick a
									column or a row.
								</template>
								<template v-else-if="gridDraftState.currentPlayer === null">
									<template
										v-if="
											Math.floor(gridDraftState.round / sessionUsers.length) + 1 >
											gridDraftState.boosterCount
										"
									>
										This was the last booster! Let me push these booster wrappers off the table...
									</template>
									<template v-else>{{ $t("draft.advancingBooster") }}</template>
								</template>
								<template v-else>
									<font-awesome-icon icon="fa-solid fa-spinner" spin />
									Waiting for
									{{
										gridDraftState.currentPlayer in userByID
											? userByID[gridDraftState.currentPlayer].userName
											: "(Disconnected)"
									}}...
								</template>
							</span>
						</div>
					</div>
					<grid-draft
						:state="gridDraftState"
						:picking="userID === gridDraftState.currentPlayer"
						@pick="gridDraftPick"
					></grid-draft>
				</div>
				<!-- Rochester Draft -->
				<div
					class="rochester-container"
					:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
					v-if="
						(gameState === GameState.RochesterPicking || gameState === GameState.RochesterWaiting) &&
						rochesterDraftState
					"
				>
					<div style="flex-grow: 1">
						<div class="section-title controls">
							<h2>{{ $t("modes.rochesterDraft") }}</h2>
							<div class="controls" style="flex-grow: 2">
								<span>
									Pack #{{ rochesterDraftState.boosterNumber + 1 }}/{{
										rochesterDraftState.boosterCount
									}}, Pick #{{ rochesterDraftState.pickNumber + 1 }}
								</span>
								<template v-if="userID === rochesterDraftState.currentPlayer">
									<span
										><font-awesome-icon icon="fa-solid fa-exclamation-circle" />
										It's your turn! Pick a card.
									</span>
									<span>
										<input
											type="button"
											@click="pickCard()"
											:value="$t('ui.confirm_pick')"
											v-if="selectedCards.length === cardsToPick"
										/>
									</span>
								</template>
								<template v-else>
									<span>
										<font-awesome-icon icon="fa-solid fa-spinner" spin />
										Waiting for
										{{
											rochesterDraftState.currentPlayer in userByID
												? userByID[rochesterDraftState.currentPlayer].userName
												: "(Disconnected)"
										}}...
									</span>
								</template>
							</div>
							<scale-slider v-model.number="boosterCardScale" />
						</div>
						<transition name="fade" mode="out-in" appear>
							<transition-group
								name="booster-cards"
								tag="div"
								class="booster card-container"
								:style="`--booster-card-scale: ${boosterCardScale};`"
								:key="rochesterDraftState.boosterNumber"
							>
								<booster-card
									v-for="card in rochesterDraftState.booster"
									:key="`card-booster-${card.uniqueID}`"
									:card="card"
									:language="language"
									:canbeburned="false"
									:class="{
										selected:
											userID === rochesterDraftState.currentPlayer &&
											selectedCards.includes(card.uniqueID),
									}"
									@click="if (userID === rochesterDraftState.currentPlayer) selectCard($event, card);"
									@dblclick="
										if (userID === rochesterDraftState.currentPlayer) doubleClickCard($event, card);
									"
									:draggable="userID === rochesterDraftState.currentPlayer"
									@dragstart="
										if (userID === rochesterDraftState.currentPlayer) dragBoosterCard($event, card);
									"
									:hasenoughwildcards="hasEnoughWildcards(card)"
									:wildcardneeded="displayCollectionStatus && wildcardCost(card)"
									:scale="boosterCardScale"
								></booster-card>
							</transition-group>
						</transition>
					</div>
					<pick-summary :picks="rochesterDraftState.lastPicks"></pick-summary>
				</div>
				<transition name="fade">
					<div
						v-if="draftPaused && !waitingForDisconnectedUsers && gameState !== GameState.Watching"
						class="disconnected-user-popup-container"
					>
						<div class="disconnected-user-popup">
							<div class="swal2-icon swal2-warning swal2-icon-show" style="display: flex">
								<div class="swal2-icon-content">!</div>
							</div>
							<h1>{{ $t("draft.paused") }}</h1>
							<template v-if="userID === sessionOwner">
								<div style="margin-top: 1em">
									<button class="confirm" @click="resumeDraft">
										<font-awesome-icon icon="fa-solid fa-play" /> Resume
									</button>
								</div>
							</template>
							<template v-else> Wait for the session owner to resume. </template>
						</div>
					</div>
				</transition>
				<!-- Minesweeper Draft -->
				<minesweeper-draft
					:class="{ disabled: waitingForDisconnectedUsers || draftPaused }"
					v-if="
						(gameState === GameState.MinesweeperPicking || gameState === GameState.MinesweeperWaiting) &&
						minesweeperDraftState
					"
					:state="minesweeperDraftState"
					:currentPlayerUsername="
						minesweeperDraftState.currentPlayer in userByID
							? userByID[minesweeperDraftState.currentPlayer].userName
							: minesweeperDraftState.currentPlayer == ''
								? ''
								: '(Disconnected)'
					"
					:picking="userID === minesweeperDraftState.currentPlayer"
					@pick="minesweeperDraftPick"
				></minesweeper-draft>
				<team-sealed
					v-if="gameState === GameState.TeamSealed"
					:language="language"
					:state="teamSealedState"
					:users="sessionUsers"
					@pick="teamSealedPick"
				></team-sealed>
				<rotisserie-draft
					v-if="gameState === GameState.RotisserieDraft"
					:language="language"
					:state="rotisserieDraftState"
					:users="sessionUsers"
					:userID="userID"
					@pick="rotisserieDraftPick"
				></rotisserie-draft>
				<!-- Disconnected User(s) Modal -->
				<transition name="fade">
					<div v-if="waitingForDisconnectedUsers" class="disconnected-user-popup-container">
						<div class="disconnected-user-popup">
							<div class="swal2-icon swal2-warning swal2-icon-show" style="display: flex">
								<div class="swal2-icon-content">!</div>
							</div>
							<h1>{{ $t("session.playersDisconnected") }}</h1>

							<div
								v-if="
									winstonDraftState ||
									winchesterDraftState ||
									housmanDraftState ||
									gridDraftState ||
									rochesterDraftState ||
									rotisserieDraftState ||
									minesweeperDraftState
								"
							>
								{{ `Wait for ${disconnectedUserNames} to come back...` }}
							</div>
							<div v-else>
								<template v-if="userID === sessionOwner">
									{{ `Wait for ${disconnectedUserNames} to come back, or...` }}
									<div style="margin-top: 1em">
										<button @click="socket.emit('replaceDisconnectedPlayers')" class="stop">
											Replace them by bot(s)
										</button>
									</div>
								</template>
								<template v-else>
									{{
										`Wait for ${disconnectedUserNames} to come back or for the owner to replace them by bot(s).`
									}}
								</template>
							</div>
						</div>
					</div>
				</transition>
			</div>

			<div v-if="gameState === GameState.Brewing" style="padding: 0.5em 1em 0 1em">
				<template v-if="managed">
					<a href="/draftqueue">
						<font-awesome-icon icon="fa-solid fa-arrow-left" />
						Back to Draft Queue
					</a>
				</template>
				<template v-else>
					<a @click="gameState = GameState.None">
						<font-awesome-icon icon="fa-solid fa-arrow-left" />
						Back to Home
					</a>
				</template>
			</div>

			<!-- Brewing controls (Deck & Sideboard) -->
			<div
				class="deck-and-sideboard-container"
				:class="{ 'fixed-deck-and-sideboard-container': displayFixedDeck }"
				v-show="displayDeckAndSideboard"
				ref="fixedDeckContainer"
			>
				<div
					class="deck-and-sideboard-container-resize-bar"
					@mousedown="fixedDeckMouseDown"
					v-if="displayFixedDeck"
				></div>
				<div class="deck-and-sideboard">
					<font-awesome-icon
						@click="fixedDeck = false"
						class="fixed-deck-and-sideboard-close clickable"
						icon="fa-solid fa-times"
						size="lg"
						aria-hidden="true"
						v-if="displayFixedDeck"
					/>
					<div
						class="container deck-container"
						v-show="
							(deck !== undefined && deck.length > 0) ||
							(drafting && gameState !== GameState.Watching) ||
							gameState === GameState.Brewing
						"
					>
						<div class="deck">
							<card-pool
								:cards="deck"
								:language="language"
								@cardClick="deckToSideboard"
								:readOnly="false"
								@cardDragAdd="onDeckDragAdd"
								@cardDragRemove="onDeckDragRemove"
								ref="deckDisplay"
								group="deck"
								@dragover="allowBoosterCardDrop($event)"
								@dragleave="onDragLeave($event)"
								@drop="dropBoosterCard($event)"
								:cardConditionalClasses="cardConditionalClasses"
								backupKey="deck"
							>
								<template v-slot:title>
									Deck ({{ deck.length
									}}<span
										v-show="gameState == GameState.Brewing && totalLands > 0"
										v-tooltip="$t('tooltips.addedBasics')"
									>
										+ {{ totalLands }}</span
									>)
								</template>
								<template v-slot:controls>
									<ExportDropdown
										v-if="deck.length > 0"
										:language="language"
										:deck="deck"
										:sideboard="sideboard"
										:options="{
											lands: lands,
											preferredBasics: preferredBasics,
											sideboardBasics: sideboardBasics,
										}"
									/>
									<div
										class="clickable"
										style="display: flex"
										@click="displayedModal = 'sampleHand'"
										v-tooltip="$t('tooltips.drawSampleHand')"
									>
										<img src="./assets/img/cards.svg" width="24px" height="24px" />
									</div>
									<div class="deck-stat-container clickable" @click="displayedModal = 'deckStats'">
										<font-awesome-icon
											icon="fa-solid fa-chart-pie"
											size="lg"
											v-tooltip.top="'Deck Statistics'"
										/>
										<div class="deck-stat" v-tooltip="$t('tooltips.creaturesInDeck')">
											{{ deckCreatureCount }}
											<img src="./assets/img/Creature.svg" />
										</div>
										<div class="deck-stat" v-tooltip="$t('tooltips.landsInDeck')">
											{{ deckLandCount }}
											<img src="./assets/img/Land_symbol_white.svg" />
										</div>
									</div>
									<land-control
										v-if="gameState === GameState.Brewing"
										:lands="lands"
										v-model:autoland="autoLand"
										v-model:targetDeckSize="targetDeckSize"
										v-model:sideboardBasics="sideboardBasics"
										v-model:preferredBasics="preferredBasics"
										:otherbasics="basicsInDeck"
										@removebasics="removeBasicsFromDeck"
										@update:lands="(c: keyof typeof lands, n: number) => (lands[c] = n)"
									>
									</land-control>
									<dropdown
										v-if="displayWildcardInfo && neededWildcards"
										v-tooltip.top="{
											content: `Wildcards needed to craft this deck.<br>Main Deck (Sideboard) / Available`,
											html: true,
										}"
										minwidth="8em"
									>
										<template v-slot:handle>
											<span style="display: flex; justify-content: space-around">
												<span
													:class="{
														yellow:
															collectionInfos.wildcards &&
															collectionInfos.wildcards['rare'] <
																(neededWildcards!.main?.rare ?? 0),
													}"
												>
													<img class="wildcard-icon" :src="`img/wc_rare.webp`" />
													{{ neededWildcards!.main?.rare ?? 0 }}
												</span>
												<span
													:class="{
														yellow:
															collectionInfos.wildcards &&
															collectionInfos.wildcards['mythic'] <
																(neededWildcards!.main?.mythic ?? 0),
													}"
												>
													<img class="wildcard-icon" :src="`img/wc_mythic.webp`" />
													{{ neededWildcards!.main?.mythic ?? 0 }}
												</span>
											</span>
										</template>
										<template v-slot:dropdown>
											<table style="margin: auto">
												<tr
													v-for="(value, rarity) in neededWildcards.main"
													:key="rarity"
													:class="{
														yellow:
															collectionInfos.wildcards &&
															collectionInfos.wildcards[rarity] < value,
													}"
												>
													<td>
														<img class="wildcard-icon" :src="`img/wc_${rarity}.webp`" />
													</td>
													<td>{{ value }}</td>
													<td>({{ neededWildcards!.side?.[rarity] ?? 0 }})</td>
													<template v-if="collectionInfos && collectionInfos.wildcards">
														<td style="font-size: 0.75em; color: #bbb">/</td>
														<td style="font-size: 0.75em; color: #bbb">
															{{ collectionInfos.wildcards[rarity] }}
														</td>
													</template>
												</tr>
											</table>

											<div
												v-if="collectionInfos.vaultProgress"
												v-tooltip.right="
													'Vault Progress. For every 100% you\'ll receive 1 mythic, 2 rare and 3 uncommon wildcards when opened.'
												"
												style="
													display: flex;
													align-items: center;
													justify-content: space-evenly;
													margin: 0.25em 0 0 0;
												"
											>
												<img src="./assets/img/vault.png" style="height: 1.5rem" /><span
													style="font-size: 0.8em"
													>{{ collectionInfos.vaultProgress }}%</span
												>
											</div>
										</template>
									</dropdown>
									<div
										class="deck-search input-delete-icon remove-below-1000"
										v-tooltip.top="
											'Quick search for English card names and types in your deck/sideboard.'
										"
									>
										<input type="text" :placeholder="$t('ui.search')" v-model="deckFilter" /><span
											@click="deckFilter = ''"
										>
											<font-awesome-icon icon="fa-solid fa-times-circle" />
										</span>
									</div>
								</template>
								<template v-slot:right-controls>
									<div class="swap-controls">
										<font-awesome-icon
											icon="fa-solid fa-arrow-right-arrow-left"
											class="clickable"
											v-tooltip="$t('tooltips.swapDeckSideboard')"
											@click="swapDeckAndSideboard"
										/>
										<font-awesome-icon
											icon="fa-solid fa-arrow-right-to-bracket"
											class="clickable"
											:class="{ disabled: sideboard.length === 0 }"
											flip="horizontal"
											v-tooltip="$t('tooltips.sideboardToDeck')"
											@click="moveAllToDeck"
										/>
										<font-awesome-icon
											icon="fa-solid fa-arrow-right-from-bracket"
											class="clickable"
											:class="{ disabled: deck.length === 0 }"
											v-tooltip="$t('tooltips.deckToSideboard')"
											@click="moveAllToSideboard"
										/>
									</div>
								</template>
								<template v-slot:empty>
									<h3>{{ $t("cards.deckEmpty") }}</h3>
									<p>{{ $t("ui.click_on_cards_in_your_sideboard_to_move_them_here") }}</p>
								</template>
							</card-pool>
						</div>
						<!-- Collapsed Sideboard -->
						<div
							v-if="
								collapseSideboard &&
								((sideboard != undefined && sideboard.length > 0) ||
									(drafting && gameState !== GameState.Watching) ||
									gameState == GameState.Brewing)
							"
							class="collapsed-sideboard"
						>
							<div class="section-title">
								<h2>
									Sideboard <span style="font-size: 0.8em">({{ sideboard.length }})</span>
								</h2>
								<div class="controls" style="margin-left: auto">
									<font-awesome-icon
										class="clickable"
										icon="fa-regular fa-window-maximize"
										@click="collapseSideboard = false"
										v-tooltip="$t('tooltips.maximizeSideboard')"
									/>
								</div>
							</div>
							<div
								class="card-container"
								@dragover="allowBoosterCardDrop($event)"
								@dragleave="onDragLeave($event)"
								@drop="dropBoosterCard($event, { toSideboard: true })"
							>
								<Sortable
									:key="`collapsed-sideboard-col-${sideboard.map((c) => c.uniqueID).join('-')}`"
									class="card-column drag-column"
									:list="sideboard"
									item-key="uniqueID"
									:options="{
										group: 'deck',
										animation: '200',
										ghostClass: 'ghost',
										multiDrag: true,
										selectedClass: 'multi-drag-selected',
										multiDragKey: 'ctrl',
									}"
									@add="onCollapsedSideDragAdd"
									@remove="onCollapsedSideDragRemove"
									@update="sortableUpdate($event, sideboard)"
								>
									<template #item="{ element }">
										<card
											:card="element"
											:language="language"
											@click.exact="sideboardToDeck($event, element)"
											:conditionalClasses="cardConditionalClasses"
										></card>
									</template>
								</Sortable>
							</div>
						</div>
					</div>
					<!-- Full size Sideboard -->
					<div
						v-show="
							!collapseSideboard &&
							((sideboard != undefined && sideboard.length > 0) ||
								(drafting && gameState !== GameState.Watching) ||
								gameState == GameState.Brewing)
						"
						class="container sideboard"
					>
						<card-pool
							:cards="sideboard"
							:language="language"
							@cardClick="sideboardToDeck"
							:readOnly="false"
							@cardDragAdd="onSideDragAdd"
							@cardDragRemove="onSideDragRemove"
							ref="sideboardDisplay"
							group="deck"
							@dragover="allowBoosterCardDrop($event)"
							@dragleave="onDragLeave($event)"
							@drop="dropBoosterCard($event, { toSideboard: true })"
							:cardConditionalClasses="cardConditionalClasses"
							backupKey="sideboard"
						>
							<template v-slot:title> Sideboard ({{ sideboard.length }}) </template>
							<template v-slot:right-controls>
								<font-awesome-icon
									icon="fa-solid fa-columns"
									class="clickable"
									@click="collapseSideboard = true"
									v-tooltip="$t('tooltips.minimizeSideboard')"
								/>
							</template>
							<template v-slot:empty>
								<h3>{{ $t("cards.sideboardEmpty") }}</h3>
								<p>{{ $t("ui.click_on_cards_in_your_deck_to_move_them_here") }}</p>
							</template>
						</card-pool>
					</div>
				</div>
			</div>

			<div class="welcome" v-if="gameState === GameState.None">
				<template v-if="page === 'draftqueue'">
					<DraftQueue :socket="socket"></DraftQueue>
				</template>
				<template v-else>
					<button
						v-if="previousDeck"
						@click="loadPreviousDeck"
						class="reload-deck-button"
						v-tooltip="`Reload deck of the last played session from your game logs.`"
					>
						<font-awesome-icon :icon="['fas', 'rotate-left']" /> Reload last deck
					</button>
					<h1>{{ $t("misc.welcome") }}</h1>
					<p class="important">
						Draft with other players and export your resulting deck to Magic: The Gathering Arena to play
						with them, in pod!
					</p>
					<div class="welcome-top">
						<div>
							<a href="/draftqueue">
								<div class="draft-queue-banner">
									<img
										src="./assets/img/draft_queue_banner_msh.webp"
										:alt="$t('ui.practice_marvel_super_heroes_with_human_players_ri')"
										width="500"
										height="260"
									/>
								</div>
							</a>
							<!--
							<div class="section-title">
								<h2>{{ $t("misc.quickStart") }}</h2>
							</div>
							<div class="welcome-section welcome-alt">
								There are multiple ways to get started with Draftmancer:
								<ul class="quick-start-list">
									<li>
										Pratice the latest sets with other players in the
										<a href="/draftqueue">{{ $t("menu.draftQueue") }}</a>!
									</li>
									<li>
										Draft with bots by selecting a set and clicking "<span
											@click="startDraft"
											:class="{ link: userID === sessionOwner }"
											style="font-variant: small-caps"
											>Start</span
										>" on top of the page.
									</li>
									<li>{{ $t('ui.join_one_of_the_featured_communities_and_participa') }}</li>
									<li>{{ $t('ui.tinker_with_the_settings_and_organize_your_own_eve') }}</li>
								</ul>
							</div>
						-->
						</div>
						<div class="container" style="grid-area: Communities">
							<div class="section-title">
								<h2>加入 KOOK 频道</h2>
							</div>
							<div class="kook-channel-card">
								<div class="kook-icon">
									<font-awesome-icon :icon="['fas', 'comments']" size="3x" />
								</div>
								<h3>轮抽社区</h3>
								<p>
									中文 MTG 轮抽与 Cube 社区。提供 Draftmancer 轮抽服务、XMage
									对局平台，以及丰富的卡表资源与活动。
								</p>
								<a
									href="https://kook.top/placeholder"
									target="_blank"
									class="btn-primary kook-join-btn"
								>
									<font-awesome-icon :icon="['fas', 'external-link-alt']" /> 加入频道
								</a>
							</div>
						</div>
					</div>
					<div class="welcome-sections">
						<div class="container" style="grid-area: News">
							<div class="section-title">
								<h2>{{ $t("ui.news") }}</h2>
							</div>
							<news class="welcome-section" @more-sets="displayedModal = 'setRestriction'" />
						</div>
						<div class="container" style="grid-area: Help">
							<div class="section-title">
								<h2>{{ $t("menu.help") }}</h2>
							</div>
							<div class="welcome-section welcome-alt">
								<div style="display: flex; justify-content: space-between">
									<div>
										<span class="link" @click="displayedModal = 'gettingStarted'">
											<font-awesome-icon icon="fa-solid fa-rocket" /> Get Started
										</span>
										guide
									</div>
									<div>
										<span class="link" @click="displayedModal = 'help'">
											<font-awesome-icon icon="fa-solid fa-info-circle" /> FAQ / Settings
											Description
										</span>
									</div>
								</div>
								<br />
								For any question/bug report/feature request you can email to
								<a href="mailto:dev@draftmancer.com">dev@draftmancer.com</a>
								or join the
								<a href="https://discord.gg/XscXXNw">
									<font-awesome-icon icon="fa-brands fa-discord" /> Draftmancer Discord </a
								>.
							</div>
						</div>
						<div class="container" style="grid-area: Support">
							<div class="section-title">
								<h2>
									<font-awesome-icon icon="fa-solid fa-mug-hot" aria-hidden="true" />
									Buy me a Coffee
								</h2>
							</div>
							<div class="welcome-section welcome-alt">
								<div>
									Hello there!<br />
									I hope you're enjoying using Draftmancer!<br />
									If you find it useful, please consider supporting it with a small donation using one
									of these platforms:
									<div
										style="
											display: flex;
											gap: 1em;
											justify-content: center;
											align-items: center;
											text-align: center;
											margin: 0.25em;
											margin-bottom: 0.8em;
										"
									>
										<div style="position: relative">
											<a href="https://github.com/sponsors/Senryoku" target="_blank">
												<font-awesome-icon icon="fa-brands fa-github" size="2x" />
												<div>{{ $t("misc.sponsor") }}</div>
											</a>
											<div
												style="
													font-size: 0.7em;
													color: #aaa;
													position: absolute;
													bottom: -0.8rem;
													left: 50%;
													transform: translateX(-50%);
												"
											>
												(No fees!)
											</div>
										</div>
										<div>or</div>
										<div>
											<a
												href="https://www.paypal.com/donate/?hosted_button_id=6L2CUS6DH82DL"
												target="_blank"
											>
												<font-awesome-icon icon="fa-brands fa-paypal" size="2x" />
												<div>PayPal</div>
											</a>
										</div>
									</div>
									Your support will help keep the project online, updated, and will motivate me to add
									new features.<br />
									<div style="text-align: right">Thank you! — Sen</div>
								</div>
							</div>
						</div>
						<div class="container" style="grid-area: Tools">
							<div class="section-title">
								<h2>{{ $t("ui.tools") }}</h2>
							</div>
							<div class="welcome-section welcome-alt">
								<div style="display: flex; flex-wrap: wrap; justify-content: space-between">
									<div @click="displayedModal = 'importdeck'" class="link">
										<font-awesome-icon icon="fa-solid fa-file-export" />
										Card List Importer
									</div>
									<div
										v-if="sessionID"
										v-tooltip="
											'Download the intersection of the collections of players in the session in text format.'
										"
									>
										<a
											:href="`/getCollectionPlainText/${encodeURIComponent(sessionID)}`"
											target="_blank"
										>
											<font-awesome-icon icon="fa-solid fa-file-download" />
											Download Session Collection
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="container" style="grid-area: PublicSessions">
						<div class="section-title">
							<h2>{{ $t("session.publicSessions") }}</h2>
						</div>
						<div class="welcome-section">
							<div v-if="userID === sessionOwner" style="display: flex">
								<button @click="isPublic = !isPublic">
									Set session as {{ isPublic ? "Private" : "Public" }}
								</button>
								<delayed-input
									style="flex-grow: 1"
									v-model="description"
									type="text"
									:placeholder="$t('ui.enter_a_description_for_your_session')"
									:maxlength="70"
								/>
							</div>

							<p v-if="publicSessions.length === 0" style="text-align: center">
								{{ $t("session.noPublicSessions") }}
							</p>
							<table v-else class="public-sessions">
								<thead>
									<tr>
										<th>ID</th>
										<th>{{ $t("misc.sets") }}</th>
										<th>{{ $t("ui.players") }}</th>
										<th>{{ $t("ui.description") }}</th>
										<th>{{ $t("ui.join") }}</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="s in publicSessions" :key="s.id">
										<td :title="s.id" class="id">{{ s.id }}</td>
										<td
											v-tooltip="
												s.cube
													? 'Cube'
													: s.sets.map((code) => setsInfos[code].fullName).join(', ')
											"
										>
											<template v-if="s.cube">
												<img src="./assets/img/cube.png" class="set-icon" />
											</template>
											<template v-else-if="s.sets.length === 1">
												<img :src="setsInfos[s.sets[0]].icon" class="set-icon" />
											</template>
											<template v-else-if="s.sets.length === 0">{{ $t("ui.all") }}</template>
											<template v-else>[{{ s.sets.length }}]</template>
										</td>
										<td>{{ s.players }} / {{ s.maxPlayers }}</td>
										<td class="desc">{{ s.description }}</td>
										<td>
											<button v-if="s.id !== sessionID" @click="sessionID = s.id">
												{{ $t("common.join") }}
											</button>
											<font-awesome-icon
												icon="fa-solid fa-check"
												class="green"
												v-tooltip="`You are in this session!`"
												v-else
											/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</template>
			</div>
		</div>

		<modal :displayed="displayedModal === 'help'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("menu.help") }}</h2>
			</template>
			<template v-slot:body>
				<help-modal @openSettings="displayedModal = 'sessionOptions'" />
			</template>
		</modal>
		<modal :displayed="displayedModal === 'gettingStarted'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("menu.gettingStarted") }}</h2>
			</template>
			<template v-slot:body>
				<getting-started
					:isSessionOwner="userID === sessionOwner"
					:sessionOwnerName="sessionOwner ? userByID[sessionOwner].userName : 'Unknown'"
					@openSettings="displayedModal = 'sessionOptions'"
					@sessionURLToClipboard="sessionURLToClipboard"
				/>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'collectionHelp'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("export.collectionImportHelp") }}</h2>
			</template>
			<template v-slot:body>
				<CollectionImportHelp @uploadlogs="uploadMTGALogs" @clipboard="toClipboard" />
			</template>
		</modal>
		<modal :displayed="displayedModal === 'importdeck'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("cards.cardListImporter") }}</h2>
			</template>
			<template v-slot:body>
				<div>
					<form @submit.prevent="importDeck">
						<div>
							<textarea
								:placeholder="$t('ui.paste_or_drop_a_card_list_here_any_list_mtga_accep')"
								rows="15"
								cols="40"
								id="decklist-text"
								@dragover="dragFileOver"
								@drop="dropFile($event, setImportDeckText)"
							></textarea>
						</div>
						<div>
							<input
								type="file"
								id="decklist-file-input"
								@change="uploadFile($event, setImportDeckText)"
								style="display: none"
								accept=".txt"
							/>
							<button type="button" onclick="document.querySelector('#decklist-file-input').click()">
								Browse
							</button>
							<button type="submit">{{ $t("ui.import") }}</button>
						</div>
					</form>
				</div>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'uploadBoosters'" @close="displayedModal = 'sessionOptions'">
			<template v-slot:header>
				<h2>{{ $t("booster.uploadBoosters") }}</h2>
			</template>
			<template v-slot:body>
				<div>
					<form @submit.prevent="uploadBoosters">
						<div>
							<div>
								Paste your boosters card list here. One card per line, each booster separated by a blank
								line.<br />
								Make sure each booster has the same number of cards and the total booster count is
								suitable for your settings.
							</div>
							<textarea
								:placeholder="$t('ui.paste_cards_here')"
								rows="15"
								cols="40"
								id="upload-booster-text"
							></textarea>
						</div>
						<div>
							<button type="submit">{{ $t("ui.upload") }}</button>
						</div>
					</form>
				</div>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'setRestriction'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("cards.cardPool") }}</h2>
			</template>
			<template v-slot:body>
				<set-restriction-component v-model="setRestriction"></set-restriction-component>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'draftLogs'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("menu.gameLogs") }}</h2>
			</template>
			<template v-slot:body>
				<draft-log-history
					:draftLogs="draftLogs"
					:language="language"
					:userID="userID"
					:userName="userName"
					@sharelog="shareSavedDraftLog"
					@storelogs="storeDraftLogs"
					@loadDeck="loadDeckFromLogs"
					@importMTGOLog="importMTGOLog"
					@reloadBoosters="(str: string) => setBoosters(str)"
				></draft-log-history>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'collection'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("stats.collectionStats") }}</h2>
			</template>
			<template v-slot:body>
				<collection-component
					:collection="collection"
					:collectionInfos="collectionInfos"
					:language="language"
					:displaycollectionstatus="displayCollectionStatus"
					@display-collection-status="displayCollectionStatus = $event"
				></collection-component>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'sessionOptions'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("session.additionalSessionSettings") }}</h2>
			</template>
			<template v-slot:contols>
				<div>
					<font-awesome-icon
						icon="fa-solid fa-undo"
						class="clickable"
						:class="{ disabled: userID !== sessionOwner }"
						@click="resetSessionSettings"
						v-tooltip="$t('tooltips.resetSettings')"
					/>
				</div>
			</template>
			<template v-slot:body>
				<div class="session-options-container" :class="{ disabled: userID != sessionOwner }">
					<div class="option-column option-column-left">
						<h4>{{ $t("ui.session") }}</h4>
						<div
							class="line"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: '<p>' + $t('ui.display_this_session_on_the_front_page_allowing_an') + '</p>',
								html: true,
							}"
						>
							<label for="is-public">{{ $t("ui.public") }}</label>
							<div class="right">
								<input type="checkbox" v-model="isPublic" id="is-public" />
							</div>
						</div>
						<div
							class="line"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content:
									'<p>Public description for your session. Ex: Peasant Cube, will launch at 8pm. Matches played on Arena.</p>',
								html: true,
							}"
						>
							<label for="session-desc">{{ $t("ui.description") }}</label>
							<div class="right">
								<delayed-input
									id="session-desc"
									v-model="description"
									type="text"
									:placeholder="$t('ui.session_public_description')"
									:maxlength="70"
									style="width: 90%"
								/>
							</div>
						</div>
						<div
							class="line"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: `<p>Spectate the game as the Session Owner, without participating.<br>
								If checked, the owner will still be able to observe the picks of each player (as long as the logs are available).<br>
								Mostly useful to tournament organizers.</p>`,
								html: true,
							}"
						>
							<label for="is-owner-player">{{ $t("session.spectateAsOwner") }}</label>
							<div class="right">
								<input
									type="checkbox"
									v-model="ownerIsPlayer"
									:true-value="false"
									:false-value="true"
									id="is-owner-player"
								/>
							</div>
						</div>
						<div
							class="line"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: `<p>Let users watch the game without participating.</p>
								<p>Enabling this generates a spectator link and copies it to your clipboard. Anyone opening the link joins the session as a spectator, even while a game is in progress.</p>
								<p>Spectators see the picks of each player as they happen.</p>`,
								html: true,
							}"
						>
							<label for="allow-spectators">{{ $t("settings.allowSpectators") }}</label>
							<div class="right">
								<input
									type="checkbox"
									v-model="allowSpectators"
									id="allow-spectators"
									@change="onAllowSpectatorsChange"
								/>
								<span
									v-if="allowSpectators && spectateKey"
									class="clickable"
									style="margin-left: 0.5em"
									@click="spectatorLinkToClipboard"
									v-tooltip="$t('tooltips.copySpectatorLink')"
								>
									<font-awesome-icon icon="fa-solid fa-clipboard" />
								</span>
							</div>
						</div>
						<div class="line">
							<label for="max-players">{{ $t("session.maxPlayers") }}</label>
							<div class="right">
								<input
									class="small-number-input"
									type="number"
									id="max-players"
									min="1"
									step="1"
									v-model.number="maxPlayers"
								/>
							</div>
						</div>
						<h4>{{ $t("booster.generation") }}</h4>
						<div
							class="line"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: '<p>' + $t('ui.if_set_the_system_will_attempt_to_smooth_out_the_c') + '</p>',
								html: true,
							}"
							:class="{ disabled: usePredeterminedBoosters }"
						>
							<label for="color-balance">{{ $t("cards.colorBalance") }}</label>
							<div class="right">
								<input type="checkbox" v-model="colorBalance" id="color-balance" />
							</div>
						</div>
						<div
							class="line"
							:class="{ disabled: usePredeterminedBoosters || useCustomCardList }"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: tooltipMythicUpgrade,

								html: true,
							}"
						>
							<label for="mythic-promotion">{{ $t("booster.rareToMythic") }}</label>
							<div class="right">
								<input type="checkbox" v-model="mythicPromotion" id="mythic-promotion" />
							</div>
						</div>
						<div
							class="line"
							v-bind:class="{ disabled: usePredeterminedBoosters || useCustomCardList }"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content:
									'<p>If enabled, each pack will have a chance to contain a \'foil\' card of any rarity in place of one common.</p>',
								html: true,
							}"
						>
							<label for="option-foil">{{ $t("ui.foil") }}</label>
							<div class="right">
								<input type="checkbox" v-model="foil" id="option-foil" />
							</div>
						</div>
						<div
							class="line"
							v-bind:class="{ disabled: usePredeterminedBoosters }"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: `Restrict card pool to Player Collections: <strong>${
									ignoreCollections ? 'Disabled' : 'Enabled'
								}</strong>
									<p>If enabled, card pool will be limited to cards present in all player collections.</p>`,
								html: true,
							}"
						>
							<label for="restrict-to-collections">{{ $t("session.restrictPoolToCollections") }}</label>
							<div class="right">
								<input
									type="checkbox"
									:checked="!ignoreCollections"
									id="restrict-to-collections"
									@change="ignoreCollections = !($event.target! as HTMLInputElement).checked"
								/>
							</div>
						</div>
						<div
							class="option-section"
							v-bind:class="{ disabled: usePredeterminedBoosters || useCustomCardList }"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: `<p>Lets you customize the exact content of your boosters.</p>
									<p><strong>Bonus</strong>: Controls the number of cards from a set-specific bonus sheet, they generally replace commons (and thus do not increase booster size). This setting only affect the following sets: 
										<ul>
											<li>{{ $t('ui.march_of_the_machine_multiverse_legends') }}</li> 
											<li>{{ $t('ui.shadows_over_innistrad_remastered_shadow_of_the_pa') }}</li> 
											<li>{{ $t('ui.the_brothers_war_retro_artifact_these_do_not_repla') }}</li> 
											<li>{{ $t('ui.strixhaven_mystical_archives') }}</li> 
											<li>{{ $t('ui.timespiral_remastered_timeshifted_these_do_not_rep') }}</li> 
											<li>Modern Horizons 2 (New-to-Modern - These do NOT replace commons)</li> 
										</ul>
									</p>
									<p>Notes:<ul><li>Zero is a valid value (useful for Pauper or Artisan for example).</li><li>A land slot will be automatically added for some sets.</li><li>Unused when drawing from a custom card list: See the advanced card list syntax to mimic it.</li></ul></p>`,
								html: true,
							}"
						>
							<div class="option-column-title">
								<input type="checkbox" v-model="useBoosterContent" id="edit-booster-content" />
								<label for="edit-booster-content">{{ $t("booster.editContent") }}</label>
							</div>
							<template v-if="useBoosterContent">
								<div class="line" v-for="r in ['common', 'uncommon', 'rare', 'bonus']" :key="r">
									<label :for="'booster-content-' + r" class="capitalized">{{ r }}</label>
									<div class="right">
										<input
											class="small-number-input"
											type="number"
											:id="'booster-content-' + r"
											min="0"
											max="30"
											step="1"
											v-model.number="boosterContent[r as keyof typeof boosterContent]"
											@change="
												if (boosterContent[r as keyof typeof boosterContent] < 0)
													boosterContent[r as keyof typeof boosterContent] = 0;
											"
										/>
									</div>
								</div>
							</template>
						</div>
						<div
							class="option-section"
							v-bind:class="{ disabled: usePredeterminedBoosters || useCustomCardList }"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content:
									'<p>Sets a duplicate limit for each rarity across the entire draft. Only used if no player collection is used to limit the card pool. Default: Off.</p>',
								html: true,
							}"
						>
							<div class="option-column-title">
								<input
									type="checkbox"
									:checked="maxDuplicates !== null"
									@click="toggleLimitDuplicates"
									id="max-duplicate-title"
								/><label for="max-duplicate-title">{{ $t("cards.limitDuplicates") }}</label>
							</div>
							<template v-if="maxDuplicates !== null">
								<div class="line" v-for="r in Object.keys(maxDuplicates)" :key="r">
									<label :for="'max-duplicates-' + r" class="capitalized">{{ r }}s</label>
									<div class="right">
										<input
											class="small-number-input"
											type="number"
											:id="'max-duplicates-' + r"
											min="1"
											max="16"
											step="1"
											v-model.number="maxDuplicates[r as keyof typeof maxDuplicates]"
											@change="
												if (maxDuplicates![r as keyof typeof maxDuplicates] < 1)
													maxDuplicates![r as keyof typeof maxDuplicates] = 1;
											"
										/>
									</div>
								</div>
							</template>
						</div>
						<div
							class="line"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: tooltipCustomBoosters,
								html: true,
							}"
						>
							<label for="use-predetermined-boosters">{{ $t("booster.usePredetermined") }}</label>
							<div class="right">
								<input
									type="checkbox"
									v-model="usePredeterminedBoosters"
									id="use-predetermined-boosters"
								/>
								<button @click="displayedModal = 'uploadBoosters'">
									<font-awesome-icon icon="fa-solid fa-upload" /> Upload
								</button>
								<button
									@click="shuffleUploadedBoosters"
									v-tooltip="$t('tooltips.shuffleBeforeDistribute')"
								>
									Shuffle
								</button>
							</div>
						</div>
						<h4>{{ $t("menu.gameLogs") }}</h4>
						<div
							class="line"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: '<p>' + $t('ui.if_enabled_players_will_receive_a_log_of_their_own') + '</p>',
								html: true,
							}"
						>
							<label for="option-personal-logs">{{ $t("menu.personalLogs") }}</label>
							<div class="right">
								<input type="checkbox" v-model="personalLogs" id="option-personal-logs" />
							</div>
						</div>
						<div
							class="line"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content:
									'<p>Controls who is going to receive the full game logs. Note that this setting doesn\'t affect personal logs.</p><p>\'Everyone, on owner approval\': The session owner will choose when to reveal the full game logs. Useful for tournaments.</p>',
								html: true,
							}"
						>
							<label for="draft-log-recipients">{{ $t("session.sendLogsTo") }}</label>
							<div class="right">
								<select v-model="draftLogRecipients" id="draft-log-recipients">
									<option value="everyone">{{ $t("misc.everyone") }}</option>
									<option value="delayed">{{ $t("misc.everyoneOnApproval") }}</option>
									<option value="owner">{{ $t("misc.ownerOnly") }}</option>
									<option value="none">{{ $t("misc.noOne") }}</option>
								</select>
							</div>
						</div>
						<div
							class="line"
							:class="{ disabled: draftLogRecipients !== 'delayed' }"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content:
									'<p>Automatically unlocks the draft logs for the entire session once the specified delay has elapsed. This feature is particularly useful for owners who may occasionally forget to unlock the logs :)</p><p>Note: Please remain connected to the session to ensure that you receive the logs. If the session remains inactive for an extended period, the server might drop the logs. At that point, only the owner will be able to share the logs.</p>',
								html: true,
							}"
						>
							<label for="draft-log-unlock-timer">{{ $t("settings.autoUnlockTimer") }}</label>
							<div class="right">
								<select v-model="draftLogUnlockTimer" id="draft-log-unlock-timer">
									<option :value="0">{{ $t("ui.never") }}</option>
									<option :value="60">1h</option>
									<option :value="120">2h</option>
									<option :value="180">3h</option>
								</select>
							</div>
						</div>
					</div>
					<div class="option-column option-column-right">
						<h4>{{ $t("draft.specificSettings") }}</h4>
						<div
							class="line"
							v-tooltip.right="{
								popperClass: 'option-tooltip',
								content:
									'<p>Team Draft, which is a 6-player, 3v3 mode where teams alternate seats.</p><p>This setting is mostly visual, but creates an appropriate bracket tournament where each player will only play players from the other team.</p>',
								html: true,
							}"
						>
							<label for="team-draft">{{ $t("modes.teamDraft") }}</label>
							<div class="right">
								<input type="checkbox" id="team-draft" v-model="teamDraft" />
							</div>
						</div>
						<div
							class="line"
							v-tooltip.right="{
								popperClass: 'option-tooltip',
								content: '<p>Draft: Boosters per Player; default is 3.</p>',
								html: true,
							}"
						>
							<label for="boosters-per-player">{{ $t("draft.boostersPerPlayer") }}</label>
							<div class="right">
								<delayed-input
									type="number"
									id="boosters-per-player"
									class="small-number-input"
									:min="1"
									:max="99"
									:step="1"
									:delay="0.1"
									v-model.number="boostersPerPlayer"
									:validate="(v: number) => Math.max(1, Math.min(v, 99))"
								/>
							</div>
						</div>
						<div
							class="option-section"
							v-bind:class="{ disabled: usePredeterminedBoosters || useCustomCardList }"
						>
							<div class="option-column-title">{{ $t("booster.individualSet") }}</div>
							<div
								class="line"
								v-tooltip.right="{
									popperClass: 'option-tooltip',
									content:
										'<p>Controls how the boosters will be distributed. This setting will have no effect if no individual booster rules are specified below.</p><ul><li>Regular: Every player will receive boosters from the same sets and will open them in the specified order.</li><li>Shuffle Player Boosters: Each player will receive boosters from the same sets but will open them in a random order.</li><li>Shuffle Booster Pool: Boosters will be shuffled all together and randomly handed to each player.</li></ul>',
									html: true,
								}"
							>
								<label for="distribution-mode">{{ $t("booster.distributionMode") }}</label>
								<select
									class="right"
									v-model="distributionMode"
									name="distributionMode"
									id="distribution-mode"
								>
									<option value="regular">{{ $t("booster.regular") }}</option>
									<option value="shufflePlayerBoosters">
										{{ $t("booster.shufflePlayerBoosters") }}
									</option>
									<option value="shuffleBoosterPool">{{ $t("booster.shufflePool") }}</option>
									<option value="staggered">{{ $t("booster.staggered") }}</option>
								</select>
							</div>
							<hr style="margin: 0.4em 1em; color: #555" />
							<div
								v-tooltip.right="{
									popperClass: 'option-tooltip',
									content:
										'<p>Specify the set of indiviual boosters handed to each player. Useful for classic Chaos Draft or Ixalan/Rivals of Ixalan draft for example.</p><p>Note: Collections are ignored for each booster with any other value than (Default).</p><p>\'Random Set from Card Pool\' will pick a different extension for each player, \'Random Set from Card Pool (Shared)\' means the randomly picked set will be the same for all players.</p>',
									html: true,
								}"
								style="max-height: 10em; overflow-y: auto; margin: 0.2em; padding-bottom: 0.4em"
							>
								<div v-for="(value, index) in customBoosters" class="line" :key="index">
									<label for="customized-booster">Booster #{{ index + 1 }}</label>
									<select class="right" v-model="customBoosters[index]">
										<option value>(Default)</option>
										<option value="random">{{ $t("booster.randomSet") }}</option>
										<option value="randomShared">{{ $t("booster.randomSetShared") }}</option>
										<option style="color: #888" disabled>————————————————</option>
										<option v-for="code in sets.slice().reverse()" :value="code" :key="code">
											{{ setsInfos[code].fullName }}
										</option>
										<option style="color: #888" disabled>————————————————</option>
										<option
											v-for="code in primarySets.filter((s) => !sets.includes(s))"
											:value="code"
											:key="code"
										>
											{{ setsInfos[code].fullName }}
										</option>
									</select>
								</div>
							</div>
						</div>
						<div
							v-bind:class="{
								disabled: useCustomCardList && customCardList?.settings?.boosterSettings,
							}"
						>
							<div
								class="line"
								v-tooltip.right="{
									popperClass: 'option-tooltip',
									content: tooltipCardsPerPick,

									html: true,
								}"
							>
								<label for="picked-cards-per-round">{{ $t("draft.pickedPerBooster") }}</label>
								<div class="right">
									<input
										type="number"
										id="picked-cards-per-round"
										class="small-number-input"
										min="1"
										step="1"
										v-model.number="pickedCardsPerRound"
										@change="if (pickedCardsPerRound < 1) pickedCardsPerRound = 1;"
									/>
									<label for="doubleMastersMode">{{ $t("draft.firstPickOnly") }}</label
									><input type="checkbox" id="doubleMastersMode" v-model="doubleMastersMode" />
								</div>
							</div>
							<div
								class="line"
								v-tooltip.right="{
									popperClass: 'option-tooltip',
									content: tooltipBurnedCards,

									html: true,
								}"
							>
								<label for="burned-cards-per-round">{{ $t("draft.burnedCards") }}</label>
								<div class="right">
									<input
										type="number"
										id="burned-cards-per-round"
										class="small-number-input"
										min="0"
										max="24"
										step="1"
										v-model.number="burnedCardsPerRound"
										@change="if (burnedCardsPerRound < 0) burnedCardsPerRound = 0;"
									/>
								</div>
							</div>
						</div>
						<div
							class="line"
							v-tooltip.right="{
								popperClass: 'option-tooltip',
								content: '<p>' + $t('ui.discard_burn_the_remaining_n_cards_of_each_packs_a') + '</p>',
								html: true,
							}"
						>
							<label for="discard-remaining-cards">{{ $t("booster.discardRemaining") }}</label>
							<div class="right">
								<input
									type="number"
									id="discard-remaining-cards"
									class="small-number-input"
									min="0"
									:max="
										Math.max(
											Object.values(boosterContent).reduce((v, a) => (a += v)),
											cardsPerBooster
										) - pickedCardsPerRound
									"
									step="1"
									v-model.number="discardRemainingCardsAt"
									@change="if (discardRemainingCardsAt < 0) discardRemainingCardsAt = 0;"
								/>
								cards of each pack
							</div>
						</div>
						<div
							class="line"
							v-tooltip.right="{
								popperClass: 'option-tooltip',
								content: '<p>' + $t('ui.disable_the_bot_suggestions_mechanism_for_every_pl') + '</p>',
								html: true,
							}"
						>
							<label for="disable-bot-suggestions">{{ $t("settings.disableBotSuggestions") }}</label>
							<div class="right">
								<input type="checkbox" id="disable-bot-suggestions" v-model="disableBotSuggestions" />
							</div>
						</div>
						<h4>{{ $t("session.tournamentSettings") }}</h4>
						<div
							class="line"
							v-tooltip.right="{
								popperClass: 'option-tooltip',
								content: '<p>Stricter timer starting at 40sec. used in official tournaments.</p>',
								html: true,
							}"
						>
							<label for="tournament-timer">{{ $t("session.tournamentTimer") }}</label>
							<div class="right">
								<input type="checkbox" id="tournament-timer" v-model="tournamentTimer" />
							</div>
						</div>
						<div
							class="line"
							v-tooltip.right="{
								popperClass: 'option-tooltip',
								content:
									'<p>Controls the initial duration of the review phase between booster, it will increase by 50% after each pack, up to 2 times the initial duration. This is generally used in conjonction with the \'Hide Picks\' settings. A value of 0 disables the review phase.</p>',
								html: true,
							}"
						>
							<label for="review-timer">{{ $t("draft.reviewTimer") }}</label>
							<div class="right">
								<input
									type="number"
									id="review-timer"
									class="small-number-input"
									min="0"
									step="15"
									v-model.number="reviewTimer"
								/>
							</div>
						</div>
						<div
							class="line"
							v-tooltip.right="{
								popperClass: 'option-tooltip',
								content: '<p>' + $t('ui.hide_picks_during_the_draft_outside_of_the_review_') + '</p>',
								html: true,
							}"
						>
							<label for="hide-picks">{{ $t("draft.hidePicks") }}</label>
							<div class="right">
								<input type="checkbox" id="hide-picks" v-model="hidePicks" />
							</div>
						</div>
					</div>
					<div class="option-section option-custom-card-list" :class="{ disabled: usePredeterminedBoosters }">
						<div class="option-column-title">
							<input type="checkbox" v-model="useCustomCardList" id="use-custom-card-list" /> Custom Card
							List
						</div>
						<div class="option-cube-settings">
							<div
								class="option-cube-settings-1"
								:class="{
									'disabled-simple': !useCustomCardList,
								}"
							>
								<div
									v-tooltip.left="{
										popperClass: 'option-tooltip',
										content: tooltipCardsPerBooster,

										html: true,
									}"
									:class="{
										'disabled-simple':
											useCustomCardList && customCardList && customCardList.layouts,
									}"
								>
									<label for="cards-per-booster">{{ $t("draft.cardsPerBooster") }}</label>
									<input
										type="number"
										id="cards-per-booster"
										class="small-number-input"
										min="1"
										max="100"
										step="1"
										v-model.number="cardsPerBooster"
									/>
								</div>
								<div
									v-tooltip.up="{
										popperClass: 'option-tooltip',
										content:
											'<p>If checked, picked cards will be replaced in the card pool, meaning there\'s an unlimited supply of each card in the list.</p>',
										html: true,
									}"
								>
									<input
										type="checkbox"
										v-model="customCardListWithReplacement"
										id="custom-card-list-with-replacement"
									/>
									<label for="custom-card-list-with-replacement">{{
										$t("booster.withReplacement")
									}}</label>
								</div>
								<div
									v-tooltip.up="{
										popperClass: 'option-tooltip',
										content:
											'<p>If checked, sheets will be refilled when empty. This allows to draft with more players that originally intended for a specific cube without skewing the distribution too far from the original intent.</p><p>No effect when With Replacement is enabled</p>',
										html: true,
									}"
									:class="{ disabled: customCardListWithReplacement }"
								>
									<input
										type="checkbox"
										:checked="customCardList?.settings?.refillWhenEmpty ?? false"
										id="custom-card-list-refill-when-empty"
										@change="updateCCLRefillWhenEmpty"
									/>
									<label for="custom-card-list-refill-when-empty">{{
										$t("booster.refillWhenEmpty")
									}}</label>
								</div>
								<div
									v-tooltip.up="{
										popperClass: 'option-tooltip',
										content:
											'<p>' +
											$t('ui.when_enabled_duplicates_of_the_exact_same_card_in_') +
											'</p>',
										html: true,
									}"
								>
									<input
										type="checkbox"
										v-model="customCardListDuplicateProtection"
										id="custom-card-list-duplicate-protection"
									/>
									<label for="custom-card-list-duplicate-protection">{{
										$t("cards.duplicateProtection")
									}}</label>
								</div>
							</div>
							<div
								v-if="customCardList?.sheets && Object.keys(customCardList?.sheets).length > 0"
								class="option-cube-settings-2"
							>
								<font-awesome-icon
									icon="fa-solid fa-check"
									class="green"
									v-if="useCustomCardList"
									v-tooltip="$t('tooltips.cardListLoaded')"
								/>
								<font-awesome-icon
									icon="fa-solid fa-exclamation-triangle"
									class="yellow"
									v-else
									v-tooltip="$t('tooltips.cardListLoadedUnused')"
								/>
								<div v-if="customCardList.name">
									Loaded '<span class="inline-cube-name" style="vertical-align: bottom">{{
										customCardList.name
									}}</span
									>'.
								</div>
								<div v-else>{{ $t("cards.unnamedListLoaded") }}</div>
								<button @click="displayedModal = 'cardList'">
									<font-awesome-icon icon="fa-solid fa-file-lines" />
									Review.
								</button>
							</div>
							<div v-else>(No Custom Card List loaded)</div>
						</div>
						<div class="option-cube-import">
							<input
								type="file"
								id="card-list-input"
								@change="uploadFile($event, parseCustomCardList)"
								style="display: none"
								accept=".txt"
							/>
							<div
								class="file-drop clickable"
								v-tooltip.left="{
									popperClass: 'option-tooltip',
									content: tooltipCustomCardList,

									html: true,
								}"
								@drop="dropFile($event, parseCustomCardList)"
								onclick="document.querySelector('#card-list-input').click()"
								@dragover="dragFileOver"
								style="flex-grow: 1; height: 100%"
							>
								Upload a Custom Card List file by dropping it here or by clicking to browse your
								computer.
							</div>
							<div
								style="
									display: flex;
									align-items: center;
									justify-content: space-around;
									flex-direction: column;
									min-width: 17em;
								"
							>
								<button @click="importCube('Cube Cobra')" style="position: relative; width: 100%">
									<img
										style="position: absolute; left: 0.2em; top: 10%; height: 80%"
										src="./assets/img/cubecobra-small-logo.png"
									/>
									Import From Cube Cobra
								</button>
							</div>
						</div>
						<div
							class="option-cube-select"
							v-tooltip.left="{
								popperClass: 'option-tooltip',
								content: '<p>' + $t('ui.load_a_prebuilt_cube_from_a_curated_list') + '</p>',
								html: true,
							}"
						>
							<label for="curated-cubes">{{ $t("session.loadPrebuiltCube") }}</label>
							<select name="featured-cubes" id="curated-cubes" v-model="selectedCube">
								<option v-for="cube in cubeLists" :key="cube.filename" :value="cube">
									{{ cube.name }}
									<span v-if="cube.cubeCobraID" style="font-size: 0.75em">(Cube Cobra)</span>
								</option>
							</select>
							<button @click="selectCube(selectedCube, true, true)" style="min-width: auto">
								<img
									v-if="selectedCube.cubeCobraID"
									class="set-icon"
									src="./assets/img/cubecobra-small-logo.png"
								/>
								Load Cube
							</button>
						</div>
						<div class="option-cube-infos" v-if="selectedCube">
							<strong>{{ selectedCube.name }}</strong>
							<div v-if="selectedCube.cubeCobraID">
								<a
									:href="`https://cubecobra.com/cube/overview/${selectedCube.cubeCobraID}`"
									target="_blank"
									rel="noopener nofollow"
								>
									<img class="set-icon" src="./assets/img/cubecobra-small-logo.png" />
									Cube Cobra page
								</a>
							</div>
							<div v-if="selectedCube.description" v-html="selectedCube.description"></div>
						</div>
						<div class="option-info">
							You can find more cubes or craft your own on
							<a href="https://cubecobra.com/" target="_blank" rel="noopener nofollow"
								><font-awesome-icon icon="fa-solid fa-external-link-alt" /> Cube Cobra</a
							>
							<br />Customize your list even further by using all features of the
							<a href="cubeformat.html" target="_blank" rel="noopener nofollow">
								<font-awesome-icon icon="fa-solid fa-external-link-alt" />
								format
							</a>
						</div>
					</div>
				</div>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'bracket'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("ui.bracket") }}</h2>
			</template>
			<template v-slot:body>
				<bracket-component
					:bracket="bracket"
					:teamDraft="teamDraft"
					:editable="userID === sessionOwner || !bracketLocked"
					:locked="bracketLocked"
					:fullcontrol="userID === sessionOwner"
					:sessionID="sessionID"
					:language="language"
					:draftlog="currentDraftLog"
					@updated="updateBracket"
					@generate="generateBracket"
					@lock="lockBracket"
					@syncBracketMTGO="syncBracketMTGO"
				></bracket-component>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'sampleHand'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("stats.sampleHandGenerator") }}</h2>
			</template>
			<template v-slot:body>
				<sample-hand-generator :language="language" :deck="deck" :lands="lands" />
			</template>
		</modal>
		<modal :displayed="displayedModal === 'deckStats'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("stats.deckStats") }}</h2>
			</template>
			<template v-slot:body>
				<card-stats :cards="deck" :addedbasics="totalLands"></card-stats>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'cardList'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("cards.customListReview") }}</h2>
			</template>
			<template v-slot:body>
				<card-list :cardlist="customCardList" :language="language" :collection="collection"></card-list>
			</template>
		</modal>
		<modal :displayed="displayedModal === 'About'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("menu.about") }}</h2>
			</template>
			<template v-slot:body>
				<About />
			</template>
		</modal>
		<modal :displayed="displayedModal === 'donation'" @close="displayedModal = ''">
			<template v-slot:header>
				<h2>{{ $t("misc.support") }}</h2>
			</template>
			<template v-slot:body>
				<sponsor-modal />
			</template>
		</modal>
		<CardPopup :language="language" :customCards="customCardList?.customCards" ref="cardPopup" />
		<footer>
			<span @click="displayedModal = 'About'" class="clickable">
				<span class="link">{{ $t("menu.about") }}</span>
			</span>
			<span>
				Made by
				<a href="https://github.com/sponsors/Senryoku" target="_blank" rel="noopener nofollow">Senryoku</a>
			</span>
			<span>
				<span class="link" @click="displayedModal = 'donation'">
					Buy me a Coffee
					<font-awesome-icon icon="fa-solid fa-mug-hot" aria-hidden="true" />
				</span>
			</span>
			<span>
				<a href="mailto:dev@draftmancer.com" title="Email">
					<font-awesome-icon
						icon="fa-solid fa-envelope"
						size="lg"
						style="vertical-align: baseline; padding: 0 0.25em"
					/>
				</a>
				<a href="https://discord.gg/XscXXNw" title="Discord" target="_blank" rel="noopener nofollow">
					<font-awesome-icon
						icon="fa-brands fa-discord"
						size="lg"
						style="vertical-align: baseline; padding: 0 0.25em"
					/>
				</a>
				<a
					href="https://github.com/Senryoku/Draftmancer"
					title="GitHub"
					target="_blank"
					rel="noopener nofollow"
				>
					<font-awesome-icon
						icon="fa-brands fa-github"
						size="lg"
						style="vertical-align: baseline; padding: 0 0.25em"
					/>
				</a>
			</span>
		</footer>
		<div
			class="disconnected-icon"
			v-if="!socketConnected"
			v-tooltip="
				'You are disconnected from the server, some functionnalities won\'t be available until the connection is re-established.'
			"
		>
			<font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
			Disconnected
		</div>
	</div>
</template>

<script src="./App.ts" lang="ts" />

<style src="./css/style.css"></style>
<style src="./css/tooltip.css"></style>
<style src="./css/app.css"></style>
<style src="./css/booster-open.css"></style>
<style src="./css/chat.css"></style>

<style scoped>
.collection-import-help ol li,
.collection-import-help ul li {
	margin: 0.2em 0;
}

.kook-channel-card {
	padding: 2rem;
	text-align: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 12px;
	color: white;
	margin: 1rem 0;
}

.kook-icon {
	margin-bottom: 1rem;
	color: #ffd700;
}

.kook-channel-card h3 {
	font-size: 1.5rem;
	margin: 1rem 0;
	color: white;
}

.kook-channel-card p {
	margin: 1rem 0;
	line-height: 1.6;
	opacity: 0.95;
}

.kook-join-btn {
	display: inline-block;
	padding: 0.75rem 2rem;
	background: white;
	color: #667eea;
	border-radius: 25px;
	font-weight: bold;
	text-decoration: none;
	margin-top: 1rem;
	transition: all 0.3s ease;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.kook-join-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	background: #f8f9fa;
}
</style>
