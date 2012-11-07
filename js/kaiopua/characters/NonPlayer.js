/*
 *
 * NonPlayer.js
 * General collision based NonPlayer.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/characters/NonPlayer.js",
		_NonPlayer = {},
		_Character;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _NonPlayer,
		requirements: [
			"js/kaiopua/characters/Character.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( c ) {
		console.log('internal NonPlayer', _NonPlayer);
		// modules
		
		_Character = c;
		
		// properties
		
		_NonPlayer.options = {
			physics: {
				movementOffsetPct: 0,
				gravityOffsetPct: 0
			}
		};
		
		// functions
		
		_NonPlayer.load = load;
		
		// instance
		
		_NonPlayer.Instance = NonPlayer;
		_NonPlayer.Instance.prototype = new _Character.Instance();
		_NonPlayer.Instance.prototype.constructor = _NonPlayer.Instance;
		
	}
	
	/*===================================================
    
    load
    
    =====================================================*/
	
	function load ( url ) {
		
		
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function NonPlayer ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.name = 'NPC';
		
		// TODO: physics parameters should be handled by options
		
		parameters.options = $.extend( true, {}, _NonPlayer.options, parameters.options );
		parameters.physics = $.extend( {}, _NonPlayer.options.physics, parameters.physics );
		
		// prototype constructor
		
		_Character.Instance.call( this, parameters );
		
	}
	
	
} ( KAIOPUA ) );