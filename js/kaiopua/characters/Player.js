/*
 *
 * Player.js
 * Centralizes all player related functionality.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/characters/Player.js",
        _Player = {},
		_Character,
		_NonPlayer,
		_Tooltip,
		_MathHelper,
		_KeyHelper,
		_ObjectHelper,
		_RayHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Player,
		requirements: [
			"js/kaiopua/characters/Character.js",
			"js/kaiopua/characters/NonPlayer.js",
			"js/kaiopua/ui/Tooltip.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/KeyHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/RayHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init_internal ( c, np, tt, mh, kh, oh, rh ) {
		console.log('internal player');
		
		// assets
		
		_Character = c;
		_NonPlayer = np;
		_Tooltip = tt;
		_MathHelper = mh;
		_KeyHelper = kh;
		_ObjectHelper = oh;
		_RayHelper = rh;
		
		// properties
		
		_Player.options = {
			stats: {
				respawnOnDeath: true
			},
			movement: {
				move: {
					speed: 3
				},
				jump: {
					speedStart: 3,
					duration: 200
				}
			},
			physics: {
				volumetric: true
			}
		};
		
		// instance
		
		_Player.Instance = Player;
		_Player.Instance.prototype = new _Character.Instance();
		_Player.Instance.prototype.constructor = _Player.Instance;
		_Player.Instance.prototype.supr = _Character.Instance.prototype;
		
		_Player.Instance.prototype.set_scene = set_scene;
		
		_Player.Instance.prototype.die = die;
		_Player.Instance.prototype.respawn = respawn;
		
		_Player.Instance.prototype.hover = hover;
		_Player.Instance.prototype.select = select;
		_Player.Instance.prototype.interact = interact;
		
		_Player.Instance.prototype.set_keybindings = set_keybindings;
		_Player.Instance.prototype.trigger_action = trigger_action;
		
		_Player.Instance.prototype.pause = pause;
		
		Object.defineProperty( _Player.Instance.prototype, 'controllable', { 
			get : function () { return this.state.controllable; },
			set : function ( controllable ) {
				
				var last = this.state.controllable;
				
				this.state.controllable = controllable;
				
				if ( this.state.controllable !== last ) {
					
					if ( this.state.controllable === true ) {
						
						shared.signals.onGameInput.add( this.trigger_action, this );
						
					}
					else {
						
						shared.signals.onGameInput.remove( this.trigger_action, this );
						
						this.actions.clear_active();
						
					}
					
				}
				
			}
		});
		
		Object.defineProperty( _Player.Instance.prototype, 'target', { 
			get : function () { return this._target; },
			set: function ( target ) {
				
				this._target = target;
				
				// TODO: update UI to reflect target change
				
			}
		});
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
    function Player ( parameters ) {
		
		var me = this,
			kb;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.name = typeof parameters.name === 'string' && parameters.name.length > 0 ? parameters.name : 'Hero';
		
		// TODO: physics parameters should be handled by options
		
		parameters.options = $.extend( true, {}, _Player.options, parameters.options );
		parameters.physics = $.extend( {}, _Player.options.physics, parameters.physics );
		
		_Character.Instance.call( this, parameters );
		
		// default keybindings
		
		kb = this.keybindingsDefault = {};
		
		// pointer
		
		kb[ 'pointer' ] = 'pointer';
		
		// wasd / arrows
		
		kb[ 'w' ] = kb[ 'up_arrow' ] = 'w';
		kb[ 's' ] = kb[ 'down_arrow' ] = 's';
		kb[ 'a' ] = kb[ 'left_arrow' ] = 'a';
		kb[ 'd' ] = kb[ 'right_arrow' ] = 'd';
		
		// qe
		
		kb[ 'q' ] = 'q';
		kb[ 'e' ] = 'e';
		
		// numbers
		
		kb[ '1' ] = '1';
		kb[ '2' ] = '2';
		kb[ '3' ] = '3';
		kb[ '4' ] = '4';
		kb[ '5' ] = '5';
		kb[ '6' ] = '6';
		
		// misc
		
		kb[ 'escape' ] = 'escape'
		kb[ 'space' ] = 'space';
		
		// set list of keys that are always available
		
		kb.alwaysAvailable = [];
		
		this.set_keybindings( kb );
		
		// actions
		
		// wasd / arrows
		
		this.actions.add( [
			{
				names: 'w up_arrow',
				eventCallbacks: {
					down: function () {
						me.move_state_change( 'forward' );
					},
					up: function () {
						me.move_state_change( 'forward', true );
					}
				},
				deactivateCallbacks: 'up'
			},
			{
				names: 's down_arrow',
				eventCallbacks: {
					down: function () {
						me.move_state_change( 'back' );
					},
					up: function () {
						me.move_state_change( 'back', true );
					}
				},
				deactivateCallbacks: 'up'
			},
			{
				names: 'a left_arrow',
				eventCallbacks: {
					down: function () {
						me.move_state_change( 'left' );
					},
					up: function () {
						me.move_state_change( 'left', true );
					}
				},
				deactivateCallbacks: 'up'
			},
			{
				names: 'd right_arrow',
				eventCallbacks: {
					down: function () {
						me.move_state_change( 'right' );
					},
					up: function () {
						me.move_state_change( 'right', true );
					}
				},
				deactivateCallbacks: 'up'
			},
			// jump
			{
				names: 'space',
				eventCallbacks: {
					down: function () {
						me.move_state_change( 'up' );
					},
					up: function () {
						me.move_state_change( 'up', true );
					}
				},
				deactivateCallbacks: 'up'
			},
			{
				names: 'escape',
				eventCallbacks: {
					up: function () {
						
						me.select();
						
					}
				},
			},
			// selection
			{
				names: 'pointer',
				eventCallbacks: {
					mousemove: $.proxy( this.hover, this ),
					tap: $.proxy( this.select, this ),
					doubletap: $.proxy( this.interact, this ),
				},
				activeCheck: function () {
					return me.targetHover instanceof THREE.Object3D || me.target instanceof THREE.Object3D;
				},
				deactivateCallbacks: [ 'mousemove', 'tap' ]
			},
			{
				names: 'pointer',
				eventCallbacks: {
					dragstart: $.proxy( shared.cameraControls.rotate_start, shared.cameraControls ),
					drag: $.proxy( shared.cameraControls.rotate, shared.cameraControls  ),
					dragend: $.proxy( shared.cameraControls.rotate_stop, shared.cameraControls  ),
					wheel: $.proxy( shared.cameraControls.zoom, shared.cameraControls  )
				},
				activeCheck: function () {
					return shared.cameraControls.rotating;
				},
				options: {
					priority: 1,
					silencing: true
				}
			} 
		] );
		
		// tooltip
		
		this.tooltip = new _Tooltip.Instance( parameters.tooltip );
		
	}
	
	/*===================================================
    
    scene
    
    =====================================================*/
	
	function set_scene ( scene ) {
		
		_Player.Instance.prototype.supr.set_scene.call( this, scene );
		
		if ( this._scene instanceof THREE.Scene ) {
			
			shared.signals.onGamePaused.add( this.pause, this );
			this.controllable = true;
			
		}
		else {
			
			shared.signals.onGamePaused.remove( this.pause, this );
			this.controllable = false;
			this.target = undefined;
			
		}
		
	}
	
	/*===================================================
    
    die
    
    =====================================================*/
	
	function die () {
		
		_Player.Instance.prototype.supr.die.apply( this, arguments );
		
		// TODO: ui changes
		
	}
	
	/*===================================================
    
    respawn
    
    =====================================================*/
	
	function respawn () {
		
		_Player.Instance.prototype.supr.respawn.apply( this, arguments );
		
		shared.cameraControls.target = undefined;
		shared.cameraControls.target = this;
		shared.cameraControls.rotateTarget = true;
		
	}
	
	/*===================================================
    
    interaction
    
    =====================================================*/
	
	function hover ( parameters ) {
		
		var clean = true,
			e,
			pointer,
			target,
			targetLast = this.targetHover;
		
		if ( typeof parameters !== 'undefined' ) {
			
			e = parameters.event;
			pointer = main.get_pointer( e );
			
			target = _RayHelper.raycast( {
				pointer: pointer,
				camera: shared.camera,
				objects: shared.scene.dynamics,
				octrees: shared.scene.octree,
				objectOnly: true
			} );
				
			// cursor change on mouse over interactive
			
			if ( target instanceof THREE.Object3D && target.interactive === true ) {
				
				clean = false;
				
				this.targetHover = target;
				
				if ( this.targetHover !== targetLast ) {
					
					shared.domElements.$game.css( 'cursor', 'pointer' );
					
					this.tooltip.content( this.targetHover.name ).show( pointer );
					
				}
				
			}
			
		}
		
		if ( clean === true ) {
			
			this.targetHover = undefined;
			
			if ( this.targetHover !== targetLast ) {
				
				shared.domElements.$game.css( 'cursor', 'auto' );
				
				this.tooltip.hide();
				
			}
			
		}
		
	}
	
	function select ( parameters ) {
		
		var target,
			e;
		
		// find target
		
		if ( typeof parameters !== 'undefined' ) {
			
			if ( parameters instanceof THREE.Object3D ) {
				
				target = parameters;
				
			}
			else if ( parameters.target instanceof THREE.Object3D ) {
				
				target = parameters.target;
				
			}
			else {
				
				e = parameters.event;
				
				target = _RayHelper.raycast( {
					pointer: main.get_pointer( e ),
					camera: shared.camera,
					objects: shared.scene.dynamics,
					octrees: shared.scene.octree,
					objectOnly: true
				} );
				
			}
			
		}
		
		// update target
		
		_Player.Instance.prototype.supr.select.call( this, target );
		
		if ( this.target === this.targetHover  ) {
			
			this.tooltip.hide();
			
		}
		
	}
	
	function interact () {
		
		if ( this.target instanceof _NonPlayer.Instance ) {
			
			// look at each other
			
			this.look_at( this.target );
			this.target.look_at( this );
			
			console.log( 'Hi ', this.target.name );
			this.target.actions.execute( 'communicate', 'greeting' );
			
		}
		
	}
	
	/*===================================================
    
    keybindings
    
    =====================================================*/
	
	function set_keybindings ( keybindings ) {
		
		this.keybindings = $.extend( true, this.keybindings || {}, keybindings );
		
	}
	
	function trigger_action ( e, keyName, state ) {
		
		var kbMap = this.keybindings,
			keyNameActual = kbMap[ keyName ] || keyName,
			isAlwaysAvailable = main.index_of_value( kbMap.alwaysAvailable, keyNameActual ) !== -1;
		
		if ( this.state.controllable === true || isAlwaysAvailable ) {
			
			// perform action
			
			this.actions.execute( keyNameActual, state, {
				event: e,
				allowDefault: isAlwaysAvailable || main.paused
			} );
			
		}
		
	}
	
	/*===================================================
    
    pause
    
    =====================================================*/
	
	function pause () {
		
		this.actions.clear_active();
		
	}
	
} ( KAIOPUA ) );