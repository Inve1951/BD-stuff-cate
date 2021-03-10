//META{"name": "translateOption"}*//
var translateOption = function(){};

translateOption.prototype.replace = function(){
};

translateOption.prototype.onMessage = function(){
};
translateOption.prototype.onSwitch = function(){
};
translateOption.prototype.start = function(){
    $(document).ready(function() {
        $("body").mousedown(function(ev){
          if(ev.which == 3){
              setTimeout(function(){
                  if($('.context-menu .item span')[1].innerHTML.indexOf('Google') > 0)
                    $('.context-menu .item-group:contains("Google")')
                        .append('',"<div class=\"item-group\" onclick=\"window.open('https://translate.google.com/#auto/en/'+encodeURIComponent(window.getSelection().toString()))\"><div class=\"item\"><span>Translate with Google</span> </div></div></div ><div class=\"hint\">");
              },250);
              // if you are reading this and have a better solution to this, feel free to leave a PR or pm me about it -cate#4444/Ckath
          }
        });
    });
};
translateOption.prototype.load = function(){};
translateOption.prototype.unload = function(){};
translateOption.prototype.stop = function(){
    $("body").off('mousedown');
};
translateOption.prototype.getSettingsPanel = function(){
    return "";
};
translateOption.prototype.getName = function(){
    return "Translate with Google";
};
translateOption.prototype.getDescription = function(){
    return "Adds a \"Translate with Google\" option, similar to the existing \"Search with Google\"";
};
translateOption.prototype.getVersion = function(){
    return "0.0.2";
};
translateOption.prototype.getAuthor = function(){
    return "Catblaster/Ckath";
};
