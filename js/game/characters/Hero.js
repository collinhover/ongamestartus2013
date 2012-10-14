/*
 *
 * Hero.js
 * Adds additional functionality to basic character.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/characters/Hero.js",
		_Hero = {},
		_Character;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Hero,
		requirements: [
			"js/game/characters/Character.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal( c ) {
		console.log('internal hero', _Hero);
		
		// utility
		
		_Character = c;
		
		// properties
		
		_Hero.options = {
			stats: {
				respawnOnDeath: true
			},
			movement: {
				move: {
					speed: 3
				},
				jump: {
					speed: 2,
					duration: 200,
					startDelay: 0,
					moveSpeedMod: 0
				}
			}
		};
		
		// instance
		
		_Hero.Instance = Hero;
		_Hero.Instance.prototype = new _Character.Instance();
		_Hero.Instance.prototype.constructor = _Hero.Instance;
		
	}
	
	/*===================================================
    
    hero
    
    =====================================================*/
	
	function Hero ( parameters ) {
		
		var me = this;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.name = 'Hero';
		
		parameters.geometry = parameters.geometry instanceof THREE.Geometry ? parameters.geometry : new THREE.CubeGeometry( 50, 100, 50 );
		parameters.material = parameters.material instanceof THREE.Material ? parameters.material : new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0 } );
		
		parameters.physics = parameters.physics || {};
		parameters.physics.bodyType = 'capsule';
		parameters.physics.movementDamping = 0.5;
		
		parameters.options = $.extend( true, {}, _Hero.options, parameters.options );
		
		// prototype constructor
		
		_Character.Instance.call( this, parameters );
		
		// axis helper
		
		this.add( new THREE.AxisHelper() );
		
		// actions
		/*
		this.actions.add( 'pointer', {
			eventCallbacks: {
				tap: [ $.proxy( this.planting.select_puzzle, this.planting ), $.proxy( this.planting.select_plant, this.planting ) ],
				hold: $.proxy( this.planting.activate_puzzle, this.planting ),
				dragstart: $.proxy( this.planting.activate_plant, this.planting ),
				drag: $.proxy( this.planting.step, this.planting ),
				dragend: $.proxy( this.planting.complete, this.planting ),
				doubletap: $.proxy( this.planting.delete_plant, this.planting )
			},
			deactivateCallbacks: $.proxy( this.planting.stop, this.planting ),
			activeCheck: function () {
				return me.planting.started;
			}
		} );
		*/
	}
	
} ( OGSUS ) );