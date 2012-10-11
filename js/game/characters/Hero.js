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
		
		_Character = c;
		
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
		
		parameters.model = parameters.model || {};
		parameters.model.geometry = parameters.model.geometry instanceof THREE.Geometry ? parameters.model.geometry : new THREE.CubeGeometry( 50, 100, 50 );
		parameters.model.material = parameters.model.material instanceof THREE.Material ? parameters.model.material : new THREE.MeshLambertMaterial( { color: 0xFFF7E0, ambient: 0xFFF7E0 } );
		
		parameters.model.physics = parameters.model.physics || {};
		parameters.model.physics.bodyType = 'capsule';
		parameters.model.physics.movementDamping = 0.5;//0.97;//
		
		parameters.movement = parameters.movement || {};
		parameters.movement.moveSpeed = 3;//0.5;//
		parameters.movement.jumpSpeedStart = 2;
		parameters.movement.jumpTimeMax = 300;
		parameters.movement.jumpStartDelay = 0;
		parameters.movement.jumpMoveSpeedMod = 0;
		
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