/*
 *
 * Intro.js
 * Handles introduction to story and teaching user basic game mechanics.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/sections/Intro.js",
		intro = {},
		_World,
		_Player,
        _ready = false,
		waitingToShow = false;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    intro.show = show;
    intro.hide = hide;
    intro.remove = remove;
    intro.update = update;
	
	main.asset_register( assetPath, { 
		data: intro,
		requirements: [
			"js/game/env/World.js",
			"js/game/core/Player.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( w, p, m ) {
		console.log('internal intro');
		if ( _ready !== true ) {
			
			// assets
			
			_World = w;
			_Player = p;
			
			_ready = true;
			
			if ( waitingToShow === true ) {
				
				waitingToShow = false;
				
				show();
				
			}
			
		}
		
	}
	
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		if ( _ready === true ) {
			
			// add world
			
			main.world.show();
			
			// start player
			
			_Player.character.position.set( 0, 2000, 0 );
			
			_Player.show();
			
			_Player.enable();
			
			// signals
			
			shared.signals.onGameUpdated.add( update );
			
		}
		else {
			
			waitingToShow = true;
			
		}
        
    }
	
	function hide () {
		
		waitingToShow = false;
        
        shared.signals.onGameUpdated.remove( update );
		
    }
    
    function remove () {
		
		if ( _ready === true ) {
			
			// stop player
			
			_Player.disable();
			
			_Player.hide();
			
			// hide world
			
			main.world.hide();
			
		}
		else {
			
			waitingToShow = false;
			
		}
        
    }
    
    function update () {
		
    }
    
} ( OGSUS ) );