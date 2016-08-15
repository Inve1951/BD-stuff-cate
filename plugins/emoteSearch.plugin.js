//META{"name":"emoteSearch"}*//
var emoteSearch = function () {};
var emoteStore;
emoteSearch.prototype.start = function () {
    this.attachParser();
    var start = (new Date).getTime();
    try{
        emoteStore = jQuery.extend({}, emotesTwitch["emotes"], subEmotesTwitch, emotesFfz, emotesBTTV, emotesBTTV2);
        console.log('emoteSearch: emotes loaded');
        var diff = (new Date).getTime() - start;
        console.log('emoteSearch: took ' + diff + 'ms');
    }catch(e){ console.warn('emoteSearch: failed to load emotes: ' + e); }
};
emoteSearch.prototype.attachParser = function(){
    var el = $('.channel-textarea textarea');
    if (el.length == 0) return;
    this.handleKeypress = function (e) {
        var code = e.keyCode || e.which;
        if(code !== 13) return;
        var text;
	    try{var val = $('.channel-textarea textarea').val();
            if(val.startsWith('/es')){
	            var arg = val.split(' ');
	            if(arg[1] != undefined)
		            emoteSearch.showPrompt(emoteSearch.search(arg[1])); 
	            $(this).val("");
	            e.preventDefault();
	            e.stopPropagation();
	            return;
	        }
	    }catch(e){ console.warn("emoteSearch: unable to attach to textarea: " + e); }
    };
    el[0].addEventListener("keydown", this.handleKeypress, false);
};
emoteSearch.search = function(s) {
    var matches = [];
    for(var k in emoteStore) if(k.toLowerCase().indexOf(s.toLowerCase()) > -1) matches.push(k);
    return matches;
};
emoteSearch.showPrompt = function(emoteArray) {
    var emotePics = "";
    for(i=0;i<emoteArray.length;i++){
        var emoteKey = emoteArray[i];
        var emote = "";
        if (emotesTwitch["emotes"].hasOwnProperty(emoteKey)) {
            emote = '//static-cdn.jtvnw.net/emoticons/v1/' + emotesTwitch['emotes'][emoteKey].image_id + '/1.0' 
        } else if (subEmotesTwitch.hasOwnProperty(emoteKey)) {
            emote = '//static-cdn.jtvnw.net/emoticons/v1/' + subEmotesTwitch[emoteKey] + '/1.0' 
        } else if (emotesFfz.hasOwnProperty(emoteKey)) {
            emote = '//cdn.frankerfacez.com/emoticon/' + emotesFfz[emoteKey] + '/1'; 
        } else if (emotesBTTV.hasOwnProperty(emoteKey)) {
            emote = emotesBTTV[emoteKey];
        } else if (emotesBTTV2.hasOwnProperty(emoteKey)) {
            emote = '//cdn.betterttv.net/emote/' + emotesBTTV2[emoteKey] + '/1x'; 
        }
        emotePics += '<span class=emotewrapper><a href=#><img draggable=false onclick="$(\'.channel-textarea textarea\').val($(\'.channel-textarea textarea\').val()+\''+' '+emoteKey+'\')" class=emote src='+emote+' alt='+emoteKey+'></a></span>';
    }
    Core.prototype.alert(emoteArray.length + " results found",emotePics);
}
emoteSearch.prototype.onSwitch = function () {
    this.attachParser();
};
emoteSearch.prototype.load = function () {};
emoteSearch.prototype.unload = function () {};
emoteSearch.prototype.stop = function () {};
emoteSearch.prototype.onMessage = function () {};
emoteSearch.prototype.observer = function (e) {};
emoteSearch.prototype.getSettingsPanel = function () {
    return "";
};
emoteSearch.prototype.getName = function () {
    return "Emote search";
};
emoteSearch.prototype.getDescription = function () {
    return "Search through all emotes in bd with /es <search>";
};
emoteSearch.prototype.getVersion = function () {
    return ".1.1";
};
emoteSearch.prototype.getAuthor = function () {
    return "Ckat/Catblaster edited by confus";
};

