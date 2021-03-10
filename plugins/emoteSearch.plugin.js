//META{"name": "emoteSearch", "displayName":"emoteSearch"}*//

/* global BdApi:false, emotesTwitch:false, subEmotesTwitch:false, emotesFfz:false, emotesBTTV:false, emotesBTTV2:false, performance:false */

/* eslint-disable no-console */

class emoteSearch {

	constructor() {
		this.lastSearch = '';
		this.emoteStore = {};

		this.css = `/* emoteSearch CSS */

		@keyframes backdrop-open {
			to { opacity: 0.85; }
		}

		@keyframes modal-open {
			to { transform: scale(1); opacity: 1; }
		}

		@keyframes backdrop-close {
			to { opacity: 0; }
		}

		@keyframes modal-close {
			to { transform: scale(0.7); opacity: 0; }
		}

		#emoteSearchModal .backdrop-2ohBEd {
			animation: backdrop-open 250ms ease;
			animation-fill-mode: forwards;
			opacity: 0;
			background-color: rgb(0, 0, 0);
			transform: translateZ(0px);
		}

		#emoteSearchModal.closing .backdrop-2ohBEd {
			animation: backdrop-close 200ms linear;
			animation-fill-mode: forwards;
			animation-delay: 50ms;
			opacity: 0.85;
		}

		#emoteSearchModal.closing .modal-2LIEKY {
			animation: modal-close 250ms cubic-bezier(0.19, 1, 0.22, 1);
			animation-fill-mode: forwards;
			opacity: 1;
			transform: scale(1);
		}

		#emoteSearchModal .modal-2LIEKY {
			animation: modal-open 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
			animation-fill-mode: forwards;
			transform: scale(0.7);
			opacity: 0;
		}

		#emoteSearchModal .emote-list {
			padding: 12px;
			min-height: 245px;
		}

		#emoteSearchModal .footer {
			display: flex;
			justify-content: space-between;
			color: white;
		}

		#emoteSearchModal .page-button {
			cursor: pointer;
		}

		#emoteSearchModal .page-button.disabled {
			pointer-events: none;
			color: transparent;
		}
		`;

		this.modalHTML = `<div id="emoteSearchModal" class="theme-dark">
		<div class="backdrop-2ohBEd"></div>
		<div class="modal-2LIEKY">
			<div class="inner-1_1f7b">
				<div class="modal-3HOjGZ size-2pbXxj">
					<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE">
						<h4 class="title h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl"></h4>
						<svg viewBox="0 0 12 12" name="Close" width="18" height="18" class="close-button close-3ejNTg flexChild-1KGW5q"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
					</div>
					<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
						<div class="emote-list scroller-fzNley inner-tqJwAU">

						</div>
					</div>
					<div class="footer footer-1PYmcw">
						<div class="page-button previous">←</div>
						<div class="page-indicator"></div>
						<div class="page-button next">→</div>
					</div>
				</div>
			</div>
		</div>
	</div>`;

	}

	start() {
		BdApi.injectCSS(this.getName(), this.css);
		this.attachParser();
		var start = performance.now();
		try {
			this.emoteStore = Object.assign({}, emotesTwitch, subEmotesTwitch, emotesFfz, emotesBTTV, emotesBTTV2);
			if (Object.keys(this.emoteStore).length < 10) {
				console.error('emoteSearch: zerebos probably broke it go ping him');
			} else {
				console.log('emoteSearch: emotes loaded');
			}
			var diff = performance.now() - start;
			console.log('emoteSearch: took ' + diff + 'ms');
		}
		catch(e) { console.warn('emoteSearch: failed to load emotes: ' + e); }
	}

	stop() {
		$('*').off("." + this.getName());
		BdApi.clearCSS(this.getName());
	}

	attachParser() {
		var el = $('.textArea-20yzAH');
		if (el.length == 0) return;
		el.on("keydown." + this.getName(), this.handleKeypress.bind(this));
	}

	handleKeypress(e) {
		var code = e.keyCode || e.which;
		if(code !== 13) return;
		try {
			var val = $('.textArea-20yzAH').val().trim(),
				split = val.split(' '),
				commandIndex = split.indexOf('/es'),
				text = "",
				query = null;
			if (commandIndex >= 0) {
				e.preventDefault();
				e.stopPropagation();
				if (commandIndex > 0) text = split.slice(0, commandIndex).join(' ');
				if (query = split[commandIndex + 1]) {
					this.lastSearch = query;
					this.showResults(this.search(query));
				}
				this.setText(text);
				return;
			}
		}
		catch(e) { console.warn("emoteSearch: failed to show search results: " + e); }
	}

	showResults(results) {
		var modal = $(this.modalHTML),
			emoteList = modal.find('.emote-list'),
			closeButton = modal.find('.close-button'),
			backdrop = modal.find('.backdrop-2ohBEd'),
			nextButton = modal.find('.next'),
			prevButton = modal.find('.previous'),
			pageLabel = modal.find('.page-indicator');

		var closeModal = () => {
			modal.addClass('closing');
			$(document).off(`mouseover.${this.getName()}`);
			setTimeout(() => { modal.remove(); }, 300);
		};
		closeButton.on('click', closeModal);
		backdrop.on('click', closeModal);
		modal.find('.title').text(results.length + " Results containing '" + this.lastSearch + "'");

		var totalPages = results.length / 100,
			currentPage = totalPages && 1;
		if (results.length % 100) totalPages = (0 | totalPages) + 1;

		var changePage = (pageNum) => {
			currentPage = pageNum;
			if (totalPages === currentPage) nextButton.addClass("disabled");
			else nextButton.removeClass("disabled");
			if (currentPage === 0 || currentPage === 1) prevButton.addClass("disabled");
			else prevButton.removeClass("disabled");
			pageLabel.text(`Page ${currentPage}/${totalPages}`);
			emoteList.empty();
			if (currentPage) emoteList.append(this.getEmoteElements(results, (pageNum - 1) * 100, ((pageNum - 1) * 100) + 100));
		};

		changePage(currentPage);

		nextButton.on('click', () => {changePage(currentPage + 1);});
		prevButton.on('click', () => {changePage(currentPage - 1);});

		$("body").append(modal);

		$(document).on(`mouseover.${this.getName()}`, ".emote", () => {
			let tipsy = document.querySelector(".tipsy");
			if (tipsy) modal[0].appendChild(tipsy);
		});
	}

	getEmoteElements(results, start, end) {
		var emotes = [];
		if (end >= results.length) end = results.length;
		for (let i = start; i < end; i++){
			var emoteKey = results[i];
			var emote = "";

			if (Object.hasOwnProperty.call(emotesTwitch, emoteKey)) emote = '//static-cdn.jtvnw.net/emoticons/v1/' + emotesTwitch[emoteKey].id + '/1.0' ;
			else if (Object.hasOwnProperty.call(subEmotesTwitch, emoteKey)) emote = '//static-cdn.jtvnw.net/emoticons/v1/' + subEmotesTwitch[emoteKey] + '/1.0' ;
			else if (Object.hasOwnProperty.call(emotesFfz, emoteKey)) emote = '//cdn.frankerfacez.com/emoticon/' + emotesFfz[emoteKey] + '/1';
			else if (Object.hasOwnProperty.call(emotesBTTV, emoteKey)) emote = emotesBTTV[emoteKey];
			else if (Object.hasOwnProperty.call(emotesBTTV2, emoteKey)) emote = '//cdn.betterttv.net/emote/' + emotesBTTV2[emoteKey] + '/1x';

			var element = $(`<span class="emotewrapper"><a href="#"><img draggable="false" class="emote" src="${emote}" alt="${emoteKey}"></a></span>`);
			((el, key) => {
				el.on('click', () => {this.addText(key);});
				//el.find('img').on('error', () => {el.remove();});
			})(element, emoteKey);
			emotes.push(element);
		}
		return emotes;
	}

	search(s) {
		s = s.toLowerCase()
		var matches = [];
		for (var k in this.emoteStore) if (k.toLowerCase().indexOf(s) > -1) matches.push(k);
		return matches;
	}

	setText(new_val) {
		try {
			var textarea = $('.textArea-20yzAH')[0];
			textarea.focus();
			textarea.selectionStart = 0;
			textarea.selectionEnd = textarea.value.length;
			document.execCommand("insertText", false, new_val);
		} catch(e) { console.log('failed to set text: ' + e); }
	}

	addText(new_val) {
		try {
			new_val = ' ' + new_val;
			var textarea = $('.textArea-20yzAH')[0];
			textarea.focus();
			textarea.selectionStart = textarea.value.length;
			textarea.selectionEnd = textarea.value.length;
			document.execCommand("insertText", false, new_val);
		} catch(e) { console.log( 'failed to add text: ' + e); }
	}

	observer(e) {
		if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
		if (e.addedNodes[0].querySelector(".textArea-20yzAH"))	this.attachParser();
	}


	load() {}
	onSwitch() { this.attachParser(); }
	getName() { return "emoteSearch"; }
	getDescription() { return "Search through all emotes in bd with /es emoteuwant"; }
	getVersion() { return "1.1.0"; }
	getAuthor() { return "Ckat/Catblaster edited by confus, rewritten by zerebos"; }
}
