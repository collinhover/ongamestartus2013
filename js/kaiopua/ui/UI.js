(function(d){var A=d.shared=d.shared||{},E="js/kaiopua/ui/UI.js",y={},n,M=false,f=false,L=[],a=3,p=2000,x=[],H=1000,r,D,e;d.asset_register(E,{data:y,requirements:["js/kaiopua/ui/UIQueue.js",{path:A.pathToAssets+"speakers.js",type:"json"},"js/lib/jquery.scrollbarwidth.min.js","js/lib/jquery.multi-sticky.js"],callbacksOnReqs:q,wait:true});function q(Q,S){n=Q;y.pause=b;y.resume=m;y.resize=t;y.show_error=G;y.show_speaker=o;y.show_message=J;y.hide_message=s;Object.defineProperty(y,"ready",{get:function(){return f}});A.domElements=A.domElements||{};A.domElements.cloneables=A.domElements.cloneables||{};A.domElements.cloneables.$speaker=$('<div class="speaker well"><div class="row"><div class="span3"><div class="thumbnail borderless"></div></div><div class="span9"><h2 class="speaker-name"></h2><h6>Presenting</h6><p class="speaker-presentation sidekick-type"></p><h6>About</h6><p class="speaker-about"></p><h6>Links</h6><p class="speaker-links"></p></div></div></div>');A.domElements.cloneables.$speakerUnlocked=$('<div class="player-message"><h2 class="skewed-type scifi-type shadowed-type">SPEAKER PROFILE UNLOCKED!</h2><p class="lead sidekick-type dim">(open your speakers list to view)</p></div>');A.domElements.$uiGameDimmer=$("#uiGameDimmer");A.domElements.$uiBlocker=$("#uiBlocker");A.domElements.$ui=$("#ui");A.domElements.$uiInGame=$("#uiInGame");A.domElements.$uiOverGame=$("#uiOverGame");A.domElements.$uiOutGame=$("#uiOutGame");A.domElements.$uiOverlay=$("#uiOverlay");A.domElements.$autoCenter=$(".auto-center");A.domElements.$autoCenterVertical=$(".auto-center-vertical");A.domElements.$autoCenterHorizontal=$(".auto-center-horizontal");A.domElements.$preloader=$("#preloader");A.domElements.$statusInactive=$("#statusInactive");A.domElements.$statusActive=$("#statusActive");A.domElements.$statusItems=$(".status-item");A.domElements.$worker=$("#worker");A.domElements.$workerProgressBarStarted=$("#workerProgressBarStarted");A.domElements.$workerProgressBarCompleted=$("#workerProgressBarCompleted");A.domElements.$uiState=$("#uiState");A.domElements.$gameState=$("#gameState");A.domElements.$dropdowns=$(".dropdown");A.domElements.$tabToggles=$(".tab-toggles").find('[href^="#"]').not(".tab-toggle-empty");A.domElements.$stickied=$(".is-sticky");A.domElements.$actionsActive=$("#actionsActive");A.domElements.$actionsInactive=$("#actionsInactive");A.domElements.$actionItems=$(".action-item");A.domElements.$menus=$(".menu");A.domElements.$menuDefault=$("#menuMain");A.domElements.$menusInner=$();A.domElements.$menuToggles=$();A.domElements.$menuToggleDefault=$();A.domElements.$menuActive=$("#menuActive");A.domElements.$menuInactive=$("#menuInactive");A.domElements.$navbars=$(".navbar, .subnavbar");A.domElements.$navMenus=$("#navMenus");A.domElements.$navMain=$("#navMain");A.domElements.$navMainAlt=$("#navMainAlt");A.domElements.$social=$("#social");A.domElements.$sponsors=$("#sponsors");A.domElements.$sponsorsLite=$("#sponsorsLite");A.domElements.$speakersList=$("#speakersList");A.domElements.$buttonsSpeakersShow=$(".speakers-show");A.domElements.$playerMessages=$("#playerMessages");A.domElements.$buttonsGameStart=$(".game-start");A.domElements.$buttonsGameStop=$(".game-stop");A.domElements.$buttonsGamePause=$(".game-pause");A.domElements.$buttonsGameResume=$(".game-resume");$("img").attr("draggable",false);$('a[href^="#"]').each(function(){var V=$(this),W=$(V.data("section")),U=$(V.attr("href"));V.attr("onclick","return false;");if(W.length>0||U.length>0){V.on("tap",function(){(W[0]||U[0]).scrollIntoView(true)})}});if(A.supports.pointerEvents===false){d.dom_ignore_pointer($(".ignore-pointer, .disabled"),true)}A.domElements=A.domElements||{};for(i=0,l=A.errorTypes.length;i<l;i++){errorName=A.errorString+A.errorTypes[i];A.domElements["$"+errorName]=$("#"+errorName)}A.domElements.$worker.on("hidden.reset",function(){d.worker_reset()});A.domElements.$statusItems.each(function(){var U=$(this);if(U.is(".hidden, .collapsed")){A.domElements.$statusInactive.append(U)}}).on("show.active",function(){A.domElements.$statusActive.removeClass("hidden").append(this)}).on("hidden.active",function(){A.domElements.$statusInactive.append(this);if(A.domElements.$statusActive.children().length===0){A.domElements.$statusActive.addClass("hidden")}});A.domElements.$statusActive.addClass("hidden");A.domElements.$actionItems.each(function(){var U=$(this);if(U.parent().is(A.domElements.$actionsActive)&&U.is(".hidden, .collapsed")){A.domElements.$actionsInactive.append(U)}}).on("show.active",function(){A.domElements.$actionsActive.append(this)}).on("hidden.active",function(){A.domElements.$actionsInactive.append(this)});A.domElements.$dropdowns.each(function(){var U=$(this);U.find(".dropdown-menu a").each(function(){var V=$(this);V.on("tap",function(){V.parent().removeClass("active");U.removeClass("open")})})});A.domElements.$navbars.each(function(){var W=$(this),V=W.find('[data-toggle="collapse"]'),U=W.find(".nav-collapse");if(V.length>0&&U.length>0){U.find("a").each(function(){var X=$(this);X.on("tap",function(){if(V.is(".collapsed")!==true){V.trigger("click")}})})}});A.domElements.$stickied.each(function(){var V=$(this),W=$(V.data("relative")),U=$(V.data("target"));if(U.length===0){U=A.domElements.$uiOutGame}V.removeClass("is-sticky").sticky({topSpacing:function(){return W.offset().top+W.outerHeight(true)},scrollTarget:U,handlePosition:false})});A.domElements.$menus.each(function(){var U=$(this),ad=U.find(".menu-inner"),V=A.domElements.$tabToggles.filter('[href="#'+U.attr("id")+'"]'),X,W,Z,ab,aa,ac,Y;U.data("$inner",ad);U.data("$toggle",V);U.data("scrollTop",0);A.domElements.$menusInner=A.domElements.$menusInner.add(ad);X=function(){k(false,U);if(V.length>0){V.closest("li").addClass("active")}U.addClass("active");d.dom_fade({element:U,opacity:1});$(window).trigger("resize");A.domElements.$uiOutGame.scrollTop(U.data("scrollTop"))};W=function(){U.data("scrollTop",A.domElements.$uiOutGame.scrollTop());if(V.length>0){V.closest("li").removeClass("active")}U.removeClass("active");d.dom_fade({element:U,duration:0})};Z=function(){k(false,U)};ab=function(){I()};aa=function(){n.add({element:U,container:A.domElements.$uiOutGame,activate:X,deactivate:W,first:Z,last:ab})};ac=function(){n.remove(U)};Y=function(){if(U.is(".active")===true){U.trigger("close")}else{U.trigger("open")}};U.on("open",aa).on("close",ac).on("toggle",Y);if(V.length>0){V.data("$menu",U);A.domElements.$menuToggles=A.domElements.$menuToggles.add(V);V.on("tap",Y)}if(U.is(".active")===true){A.domElements.$menuDefault=U;A.domElements.$menuToggleDefault=V}});if(A.domElements.$sponsors.length>0&&A.domElements.$sponsorsLite.length>0){A.domElements.$sponsorsLite.html(A.domElements.$sponsors.clone().html())}A.domElements.$buttonsGameStop.on("tap",d.stop);A.domElements.$buttonsGamePause.on("tap",k);A.domElements.$buttonsGameResume.on("tap",I);A.signals.onError.add(G);A.signals.onGameInput.add(C);A.signals.onWorkerReset.add(K);A.signals.onWorkerTaskStarted.add(h);A.signals.onWorkerTaskCompleted.add(P);A.signals.onWorkerTasksCompleted.add(c);A.signals.onGameStateChange.add(B);A.signals.onGameStarted.add(z);A.signals.onGameStartedCompleted.add(j);A.signals.onGameStopped.add(u);A.signals.onGameStoppedCompleted.add(F);A.signals.onGamePaused.add(b);A.signals.onGameResumed.add(m);f=true;A.domElements.$uiState.find(".state-loading").removeClass("active").end().find(".state-usable").removeClass("active").end().find(".state-ready").addClass("active");$(window).trigger("resize");A.domElements.$menuDefault.trigger("open");d.dom_fade({element:A.domElements.$preloader,duration:0});d.dom_fade({element:A.domElements.$uiGameDimmer});d.dom_fade({element:A.domElements.$navMain,opacity:1});N();for(i=0,il=S.length;i<il;i++){var R=S[i];var T=R.options.paths.assets;if(window.localStorage){if(typeof window.localStorage[T]!=="undefined"){o(R,true)}}}A.domElements.$buttonsSpeakersShow.one("tap.speakers",function(){A.domElements.$buttonsSpeakersShow.off(".speakers").removeClass("dim").addClass("disabled");for(i=0,il=S.length;i<il;i++){o(S[i],true)}})}function O(T){var W=T.options.paths.assets;var U=A.domElements.cloneables.$speaker.clone();var V=U.find(".thumbnail");var Y=U.find(".speaker-name");var S=U.find(".speaker-presentation");var R=U.find(".speaker-about");var X=U.find(".speaker-links");var Q=d.dom_generate_image(A.pathToAssets+(T.options.paths.image||W+".png"));V.append(Q);Y.html(T.name);S.html(T.presentation||"TBA");R.html(T.about||"TBA");X.html(T.links||"TBA");U.attr("id",W).addClass("hidden").appendTo(A.domElements.$speakersList);return U}function o(S,R){if(d.index_of_value(x,S)===-1){x.push(S);var T=S.options.paths.assets;var Q=A.domElements.$speakersList.find("#"+T);if(Q.length===0){Q=O(S)}d.dom_fade({element:Q,opacity:1});if(window.localStorage){window.localStorage[T]="unlocked"}if(R!==true){J(A.domElements.cloneables.$speakerUnlocked.clone())}}}function J(R){var Q=$(R);if(Q.length>0){while(L.length>a){s(L.shift(),true)}L.push(Q);Q.addClass("hidden").appendTo(A.domElements.$playerMessages);d.dom_fade({element:Q,opacity:1,callback:function(){Q.data("playerMessageTimeout",window.requestTimeout(function(){s(Q)},p))}})}}function s(T,S){var R=$(T);if(R.length>0){if(typeof R.data("playerMessageTimeout")!=="undefined"){window.clearRequestTimeout(R.data("playerMessageTimeout"))}var Q={element:R,callback:function(){R.remove()}};if(S===true){Q.duration=0}d.dom_fade(Q)}}function K(){$().add(A.domElements.$workerProgressBarStarted).add(A.domElements.$workerProgressBarCompleted).children(".work-task").remove()}function h(Q){if(typeof r!=="undefined"){window.clearTimeout(r);r=undefined}d.dom_fade({element:A.domElements.$worker,opacity:1});A.domElements.$workerProgressBarStarted.prepend($('<img src="img/bar_vertical_rev_64.png" id="'+Q+'" class="iconk-tiny-widthFollow-tight work-task">'))}function P(R){var Q=R.replace(/([ #;?&,.+*~\':"!^$[\]()=>|\/@])/g,"\\$1");A.domElements.$workerProgressBarStarted.find("#"+Q).remove();A.domElements.$workerProgressBarCompleted.append($('<img src="img/bar_vertical_rev_64.png" id="'+R+'" class="iconk-tiny-widthFollow-tight work-task">'))}function c(){if(typeof r!=="undefined"){window.clearTimeout(r);r=undefined}r=window.setTimeout(function(){d.dom_fade({element:A.domElements.$worker})},H)}function B(){if(d.playable===true&&A.supports.webGL===true){A.domElements.$gameState.find(".state-loading").removeClass("active");if(d.ready===true){A.domElements.$gameState.find(".state-usable").removeClass("active").end().find(".state-ready").addClass("active")}else{A.domElements.$gameState.find(".state-ready").removeClass("active").end().find(".state-usable").addClass("active")}v()}else{A.domElements.$gameState.find(".state-loading").addClass("active").end().find(".state-usable").removeClass("active").end().find(".state-ready").removeClass("active");N()}}function v(){var Q,R,S;Q=$().add(A.domElements.$buttonsGameStart).add(A.domElements.$buttonsGameStop);R=Q.closest("li");if(R.length===0){R=Q}R.removeClass("disabled dim");A.domElements.$buttonsGameStart.tooltip("destroy").on("tap",d.start)}function N(){var Q,R,S;Q=$().add(A.domElements.$buttonsGameStart).add(A.domElements.$buttonsGameStop);R=Q.closest("li");if(R.length===0){R=Q}R.addClass("disabled dim");if(A.supports.webGL!==true){A.domElements.$gameState.find(".state-loading").text("No WebGL");A.domElements.$buttonsGameStart.tooltip("destroy").tooltip({title:"We need WebGL!",trigger:"manual",placement:"left",selector:A.domElements.$buttonsGameStart}).tooltip("show");R=A.domElements.$buttonsGameStart.closest("li");if(R.length===0){R=A.domElements.$buttonsGameStart}S=A.domElements.$buttonsGameStart.data("tooltip").$tip;S.css({top:(R.height()-S.height())*0.5,left:-(S.outerWidth()+5)}).appendTo(R)}}function z(){m()}function j(){}function u(){}function F(){d.dom_fade({element:A.domElements.$navMain,opacity:1})}function w(){if(d.started!==true){A.domElements.$uiGameDimmer.off(".resume");d.dom_fade({element:A.domElements.$uiGameDimmer})}d.dom_fade({element:A.domElements.$navMainAlt,duration:0});A.domElements.$social.removeClass("blocking");A.domElements.$sponsorsLite.removeClass("hidden");if(A.domElements.$menuToggleDefault.length>0){A.domElements.$menuToggleDefault.trigger("tap")}else{if(A.domElements.$menuDefault.length>0){A.domElements.$menuDefault.trigger("open")}}}function C(S,Q,R){if(R==="up"){if(Q==="escape"){if((d.started===true&&d.paused===true)||M===true){I()}else{k()}}}}function k(Q,R){if(d.started===true){if(d.paused!==true){d.pause(Q,R)}else{b(Q,R)}}else{b(Q,R)}}function b(S,T){var Q=T instanceof jQuery,R=Q&&!A.domElements.$menuDefault.is(T);M=true;if(d.focusLost===true&&d.started!==true){return}d.dom_fade({element:A.domElements.$buttonsGamePause,duration:0,invisible:true});d.dom_fade({element:A.domElements.$buttonsGameResume,duration:0,invisible:true});if(S===true){d.dom_fade({element:A.domElements.$uiBlocker,opacity:0.9})}else{if(R===true){D=T;A.domElements.$social.addClass("blocking");A.domElements.$sponsorsLite.addClass("hidden");d.dom_fade({element:A.domElements.$navMainAlt,opacity:1})}else{D=undefined;w()}if(d.started===true||R===true){d.dom_fade({element:A.domElements.$uiGameDimmer,opacity:0.9});A.domElements.$uiGameDimmer.on("tap.resume",m);d.dom_fade({element:A.domElements.$buttonsGameResume,opacity:1})}}}function I(){if(d.started===true&&typeof D==="undefined"){d.resume()}else{m()}}function m(Q){M=false;d.dom_fade({element:A.domElements.$uiBlocker});if(Q!==true){if(typeof D!=="undefined"){w()}else{A.domElements.$uiGameDimmer.off(".resume");d.dom_fade({element:A.domElements.$uiGameDimmer});if(d.started===true){n.clear(A.domElements.$uiOutGame);d.dom_fade({element:A.domElements.$uiOutGame});d.dom_fade({element:A.domElements.$buttonsGamePause,opacity:1})}else{w()}}}if(d.started===true&&d.paused!==true){d.dom_fade({element:A.domElements.$buttonsGamePause,opacity:1})}else{if(typeof D!=="undefined"){d.dom_fade({element:A.domElements.$buttonsGameResume,opacity:1})}else{d.dom_fade({element:A.domElements.$buttonsGameResume,duration:0,invisible:true})}}}function G(S,R,Q){var T=S,U;g();if(d.index_of_value(A.errorTypes,T)===-1){T=A.errorTypeGeneral}U=d.index_of_value(A.errorTypesOnlyOnce,T);if(U!==-1){if(window.localStorage){if(typeof window.localStorage[T]!=="undefined"){return}else{window.localStorage[T]="shown"}}$(document).one("tap.errorclear",function(){g();I()})}e=A.domElements["$"+A.errorString+T];if(T===A.errorTypeGeneral){if(typeof R==="string"){index=R.search(/\/(?![\s\S]*\/)/);if(index!==-1){R=R.slice(index+1)}index=R.search(/\?(?![\s\S]*\?)/);if(index!==-1){R=R.slice(0,index)}}e.find("#errorMessage").html(S);e.find("#errorFile").html(R);e.find("#errorLine").html(Q)}k(true);d.dom_collapse({element:e,show:true})}function g(){if(typeof e!=="undefined"){d.dom_collapse({element:e})}}function t(){if(A.domElements.$uiOutGame[0].scrollHeight>A.screenViewableHeight){A.domElements.$menusInner.css("padding-left",$.scrollbarWidth())}}}(KAIOPUA));