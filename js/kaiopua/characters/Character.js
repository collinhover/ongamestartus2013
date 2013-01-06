/*
 *
 * Character.js
 * Adds additional functionality to basic model.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/characters/Character.js",
		_Character = {},
		_Model,
		_Textbubble,
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		characterName = 'Character';
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Character,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/ui/Textbubble.js",
			"js/kaiopua/utils/MathHelper.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, tb, mh, vh, oh ) {
		
		// modules
		
		_Model = m;
		_Textbubble = tb;
		_MathHelper = mh;
		_VectorHelper = vh;
		_ObjectHelper = oh;
		
		// properties
		
		_Character.options = {
			dynamic: true,
			physics: {
				dynamic: true,
				bodyType: 'box',
				movementDamping: 0.5,
				movementForceLengthMax: shared.universeGravityMagnitude.length() * 20
			},
			stats: {
				healthMax: 100,
				invincible: false,
				invulnerabilityDuration: 1500,
				invulnerabilityOpacityPulses: 6,
				invulnerabilityOpacityMin: 0.5,
				respawnOnDeath: false
			},
			movement: {
				move: {
					speed: 3,
					runThreshold: 0
				},
				rotate: {
					lerpDelta: 1,
					turnSpeed: 0.025
				},
				jump: {
					speedStart: 4,
					speedEnd: 0,
					airControl: 0.1,
					moveDamping: 0.99,
					moveSpeedMod: 0,
					durationMin: 100,
					duration: 100,
					delayNotGrounded: 125,
					delayFalling: 350
				}
			},
			animation: {
				names: {
					walk: 'walk',
					run: 'run',
					idle: 'idle',
					idleAlt: false,
					jump: 'jump',
					jumpStart: 'jump_start',
					jumpEnd: 'jump_end',
					hurt: 'hurt',
					die: 'die',
					decay: 'decay',
					respawn: 'respawn',
					greeting: 'greeting'
				},
				durations: {
					walk: 750,
					run: 500,
					idle: 3000,
					idleAlt: 3000,
					jump: 1000,
					jumpStart: 125,
					jumpEnd: 125,
					hurt: 250,
					die: 1000,
					decay: 500,
					respawn: 1000,
					greeting: 1000,
					clear: 125,
					clearSolo: 125
				},
				delays: {
					decay: 500,
					idleAlt: 5000
				},
				options: {}
			},
			communication: {
				delayEnd: 500,
				activeCountMinEnd: 2,
				boundRadiusPctAway: 0.4,
				boundRadiusPctX: 0,
				boundRadiusPctY: 0.4,
				boundRadiusPctZ: 0,
				distanceMovedMax: 100,
				distanceOutsideScreenMax: 50
			},
			paths: {}
		};
		
		// character instance
		
		_Character.Instance = Character;
		_Character.Instance.prototype = new _Model.Instance();
		_Character.Instance.prototype.constructor = _Character.Instance;
		_Character.Instance.prototype.supr = _Model.Instance.prototype;
		
		_Character.Instance.prototype.reset = reset;
		
		_Character.Instance.prototype.set_scene = set_scene;
		
		_Character.Instance.prototype.hurt = hurt;
		_Character.Instance.prototype.die = die;
		_Character.Instance.prototype.decay = decay;
		
		_Character.Instance.prototype.set_spawn = set_spawn;
		_Character.Instance.prototype.respawn = respawn;
		
		_Character.Instance.prototype.select = select;
		
		_Character.Instance.prototype.add_dialogue = add_dialogue;
		_Character.Instance.prototype.communicate = communicate;
		_Character.Instance.prototype.communicate_target = communicate_target;
		_Character.Instance.prototype.communicate_start = communicate_start;
		_Character.Instance.prototype.communicate_update = communicate_update;
		_Character.Instance.prototype.communicate_next = communicate_next;
		_Character.Instance.prototype.communicate_pause = communicate_pause;
		_Character.Instance.prototype.communicate_end = communicate_end;
		_Character.Instance.prototype.silence = silence;
		
		_Character.Instance.prototype.move_state_change = move_state_change;
		_Character.Instance.prototype.stop_jumping = stop_jumping;
		
		_Character.Instance.prototype.turn_by = turn_by;
		_Character.Instance.prototype.face_local_direction = face_local_direction;
		_Character.Instance.prototype.look_at = look_at;
		
		_Character.Instance.prototype.update = update;
		
		Object.defineProperty( _Character.Instance.prototype, 'scene', { 
			get : function () { return this._scene; },
			set: function ( scene ) {
				
				this.set_scene( scene );
				
			}
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'health', { 
			get : function () { return this.state.health; },
			set: function ( health ) {
				
				if ( main.is_number( health ) ) {
					
					this.state.health = _MathHelper.clamp( health, 0, this.options.stats.healthMax );
					
				}
				
			}
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'invulnerable', { 
			get : function () { return this.state.invulnerable; },
			set: function ( invulnerable ) {
				
				var me = this,
					state = this.state,
					stats = this.options.stats,
					durationPerTween = stats.invulnerabilityDuration / ( stats.invulnerabilityOpacityPulses * 2 ),
					tweenShow,
					tweenHide;
				
				state.invulnerable = invulnerable;
				state.invulnerableTime = 0;
				
				// pulse opacity
				
				if ( state.invulnerable === true ) {
					
					this.materialAffect.transparent = true;
					
					tweenShow = _ObjectHelper.tween( this.materialAffect, { opacity: 1 }, {
						start: false,
						duration: durationPerTween
					} );
					
					tweenHide = _ObjectHelper.tween( this.materialAffect, { opacity: stats.invulnerabilityOpacityMin }, {
						start: false,
						duration: durationPerTween
					} );
					
					tweenHide.chain( tweenShow.chain( tweenHide ) ).start();
					
				}
				// tween opacity back to normal
				else {
					
					_ObjectHelper.tween( this.materialAffect, { opacity: 1 }, {
						duration: durationPerTween,
						onComplete: function () {
							
							me.material.transparent = false;
							
						}
					} );
					
				}
				
			}
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'moving', { 
			get : function () { return this.state.moving; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'movingHorizontal', { 
			get : function () { return this.state.movingHorizontal; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'jumping', { 
			get : function () { return this.options.movement.jump.active; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'turn', { 
			get : function () { return this.options.movement.rotate.turn; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'facing', { 
			get : function () { return this.options.movement.rotate.facing; }
		});
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	// adds functionality to and inherits from Model
	
	function Character ( parameters ) {
		
		var movement,
			move,
			rotate,
			jump,
			state,
			animation,
			conversations,
			communicateCallbacks = {},
			dialogueName;
		
		// utils
		
		this.utilProjector1Communicate = new THREE.Projector();
		this.utilVec31Communicate = new THREE.Vector3();
		this.utilVec32Communicate = new THREE.Vector3();
		this.utilVec31Look = new THREE.Vector3();
		this.utilVec32Look = new THREE.Vector3();
		this.utilVec33Look = new THREE.Vector3();
		this.utilVec34Look = new THREE.Vector3();
		this.utilVec35Look = new THREE.Vector3();
		this.utilVec36Look = new THREE.Vector3();
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.name = typeof parameters.name === 'string' && parameters.name.length > 0 ? parameters.name : 'Character';
		parameters.geometry = parameters.geometry || new THREE.CubeGeometry( 50, 100, 50 );
		parameters.center = true;
		
		// TODO: physics parameters should be handled by options
		
		parameters.options = $.extend( true, {}, _Character.options, parameters.options );
		parameters.physics = $.extend( {}, _Character.options.physics, parameters.physics );
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		stats = this.options.stats;
		movement = this.options.movement;
		animation = this.options.animation;
		
		// move
		
		move = movement.move;
		move.direction = new THREE.Vector3();
		
		// rotate
		rotate = movement.rotate;
		rotate.facingDirectionBase = new THREE.Vector3( 0, 0, 1 );
		rotate.facingDirection =rotate.facingDirectionBase.clone();
		rotate.facingDirectionLast = rotate.facingDirection.clone();
		rotate.facing = new THREE.Quaternion();
		rotate.facingAngle = 0;
		rotate.turn = new THREE.Quaternion();
		rotate.turnDirection = rotate.facingDirection.clone();
		rotate.turnAngle = 0;
		rotate.axis = new THREE.Vector3( 0, 1, 0 );
		rotate.delta = new THREE.Quaternion();
		rotate.vector = new THREE.Quaternion();
		
		// jump
		jump = movement.jump;
		jump.time = 0;
		jump.timeNotGrounded = 0;
		jump.ready = true;
		jump.active = false;
		jump.holding = false;
		
		// properties
		
		this.name = parameters.name || characterName;
		this.state = {};
		
		if ( this.material instanceof THREE.MeshFaceMaterial ) {
			
			this.materialAffect = this.geometry.materials[ 0 ];
			
		}
		else {
			
			this.materialAffect = this.material;
			
		}
		
		this.communicating = false;
		conversations = this.conversations = {};
		conversations.activeCount = 0;
		conversations.names = [];
		conversations.said = [];
		conversations.unsaid = [];
		conversations.randomable = [];
		conversations.randomableUnsaid = [];
		conversations.dialogueData = {};
		conversations.positionStart = new THREE.Vector3();
		conversations.projectedPosition = new THREE.Vector3();
		conversations.screenPosition = new THREE.Vector3();
		
		// handle dialogues
		
		for ( dialogueName in this.options.dialogues ) {
			
			communicateCallbacks[ dialogueName ] = this.add_dialogue( dialogueName );
			
		}
		
		communicateCallbacks.silence = $.proxy( this.silence, this );
		
		this.actions.add( {
			names: 'communicate',
			eventCallbacks: communicateCallbacks,
			deactivateCallbacks: 'silence',
			activeCheck: $.proxy( function () { return this.communicating; }, this ),
			options: {
				type: this.options.actionTypes.interactive
			}
		} );
		
		this.onHurt = new signals.Signal();
		this.onDead = new signals.Signal();
		this.onRespawned = new signals.Signal();
		
		this.reset();
		
	}
	
	function reset () {
		
		var state;
		
		state = this.state;
		state.up = 0;
		state.down = 0;
		state.left = 0;
		state.right = 0;
		state.forward = 0;
		state.back = 0;
		state.moving = false;
		state.movingSelf = false;
		state.movingHorizontal = false;
		state.movingSelfHorizontal = false;
		state.movingBack = false;
		state.grounded = false;
		state.invulnerable = false;
		state.invulnerableTime = 0;
		state.dead = false;
		state.decaying = false;
		state.health = stats.healthMax;
		
		this.morphs.clear_all();
		this.actions.clear_active();
		
	}
	
	/*===================================================
	
	scene
	
	=====================================================*/
	
	function set_scene ( scene ) {
		
		this._scene = scene;
		
		// handle start/stop of updating
		
		if ( this._scene instanceof THREE.Scene ) {
			
			shared.signals.onGameUpdated.add( this.update, this );
			
		}
		else {
			
			shared.signals.onGameUpdated.remove( this.update, this );
			
			this.reset();
			
		}
		
	}
	
	/*===================================================
	
	health
	
	=====================================================*/
	
	function hurt ( damage ) {
		
		var state = this.state,
			stats = this.options.stats,
			animation = this.options.animation,
			animationDurations = animation.durations,
			animationNames = animation.names;
		
		if ( stats.invincible !== true && state.invulnerable !== true && state.dead !== true && main.is_number( damage ) && damage > 0 ) {
			
			this.health -= damage;
			
			this.onHurt.dispatch();
			
			this.morphs.play( animationNames.hurt, {
				duration: animationDurations.hurt,
				solo: true,
				durationClear: animationDurations.clearSolo
			} );
			
			if ( state.health === 0 ) {
				
				this.die();
				
			}
			else {
			
				// small period of invulnerability after being hurt, handled by update
				
				this.invulnerable = true;
				
			}
			
			return true;
			
		}
		
	}
	
	function die () {
		
		var state = this.state,
			animation = this.options.animation,
			animationDurations = animation.durations,
			animationNames = animation.names;
			
		this.health = 0;
		
		state.dead = true;
		
		this.morphs.play( animationNames.die, {
			duration: animationDurations.die,
			solo: true,
			durationClear: animationDurations.clearSolo,
			callback: $.proxy( this.decay, this )
		} );
		
		this.onDead.dispatch();
		
	}
	
	function decay () {
		
		var state = this.state,
			stats = this.options.stats,
			animation = this.options.animation,
			animationDurations = animation.durations,
			animationDelays = animation.delays,
			animationNames = animation.names,
			me = this;
		
		if ( state.dead === true ) {
			
			state.decaying = true;
			
			this.morphs.play( animationNames.decay, {
				duration: animationDurations.decay,
				delay: animationDelays.decay,
				solo: true,
				durationClear: animationDurations.clearSolo
			} );
			
			// opacity to 0
			
			this.materialAffect.transparent = true;
			
			_ObjectHelper.tween( this.materialAffect, { opacity: 0 }, { 
				duration: animationDurations.decay,
				delay: animationDelays.decay,
				onComplete: function () {
					
					if ( me.parent instanceof THREE.Object3D ) {
						
						me.parent.remove( me );
						
					}
					
					me.material.transparent = false;
					me.material.opacity = 1;
					me.morphs.clear_all();
					
					if ( stats.respawnOnDeath === true ) {
						
						me.respawn();
						
					}
					
				}
			} );
			
		}
		
	}
	
	/*===================================================
	
	spawning
	
	=====================================================*/
	
	function set_spawn ( parent, location ) {
		
		var state = this.state;
		
		state.spawnParent = parent;
		state.spawnLocation = location;
		
	}
	
	function respawn ( parent, location ) {
		
		var state = this.state,
			animation = this.options.animation,
			animationDurations = animation.durations,
			animationNames = animation.names,
			me = this;
		
		this.reset();
		
		if ( parent instanceof THREE.Object3D ) {
			
			this.set_spawn( parent, location );
			
		}
		
		if ( state.spawnParent instanceof THREE.Object3D ) {
			
			this.materialAffect.transparent = true;
			this.materialAffect.opacity = 0;
			
			// add and position
			
			state.spawnParent.add( this );
			
			if ( state.spawnLocation instanceof THREE.Vector3 ) {
				
				this.position.copy( state.spawnLocation );
				
			}
			
			this.onRespawned.dispatch();
			
			this.morphs.play( animationNames.respawn, {
				duration: animationDurations.respawn,
				solo: true,
				durationClear: animationDurations.clearSolo
			} );
			
			this.invulnerable = true;
			
		}
		
	}
	
	/*===================================================
    
    selection
    
    =====================================================*/
	
	function select ( target ) {
		
		// update target
		
		if ( target instanceof THREE.Object3D && target.interactive === true ) {
			
			this.target = target;
			
		}
		else {
			
			this.target = undefined;
			
		}
		
	}
	
	/*===================================================
    
    communication
    
    =====================================================*/
	
	function add_dialogue ( dialogueName, dialogue ) {
		
		var me = this,
			conversations = this.conversations;
		
		dialogue = this.options.dialogues[ dialogueName ] = dialogue || this.options.dialogues[ dialogueName ] || {};
		
		// record dialogue in lists
		
		main.array_cautious_add( conversations.names, dialogueName );
		main.array_cautious_add( conversations.unsaid, dialogueName );
		
		if ( dialogue.randomable !== false ) {
			
			main.array_cautious_add( conversations.randomable, dialogueName );
			main.array_cautious_add( conversations.randomableUnsaid, dialogueName );
			
		}
		
		// make action callback for dialogue
		
		return function ( parameters ) {
			
			parameters = parameters || {};
			parameters.dialogueName = dialogueName;
			
			me.communicate( parameters );
			
		};
		
	}
	
	function communicate ( parameters ) {
		
		parameters = parameters || {};
		
		var i, il,
			animation = this.options.animation,
			animationNames = animation.names,
			animationDurations = animation.durations,
			conversations = this.conversations,
			dialogueData = conversations.dialogueData,
			dialogueName = parameters.dialogueName,
			dialogue = this.options.dialogues[ dialogueName ],
			data,
			saidAll,
			responses,
			response,
			message,
			next,
			randomable,
			textbubbleOptions;
		
		// handle target
		
		if ( parameters.target instanceof Character && parameters.target !== this ) {
			
			this.communicate_target( parameters.target );
			this.targetCommunication.communicate_target( this );
			
		}
		
		// handle dialogue
		
		if ( typeof dialogue !== 'undefined' ) {
			
			// data
			
			if ( dialogueData.hasOwnProperty( dialogueName ) !== true ) {
				
				dialogueData[ dialogueName ] = {
					said: []
				};
				
				// ensure dialogue correctly on randomable list
				
				if ( dialogue.randomable !== false ) {
					
					main.array_cautious_add( conversations.randomable, dialogueName );
					main.array_cautious_add( conversations.randomableUnsaid, dialogueName );
					
				}
				else {
					
					main.array_cautious_remove( conversations.randomable, dialogueName );
					main.array_cautious_remove( conversations.randomableUnsaid, dialogueName );
					
				}
				
			}
			
			data = dialogueData[ dialogueName ];
			
			// responses
		
			if ( typeof dialogue === 'string' ) {
				
				responses = dialogue;
				
			}
			else {
				
				responses = main.to_array( dialogue.responses || dialogue );
				
			}
			
			// response
			
			if ( typeof responses === 'string' ) {
				
				response = responses;
				
			}
			else {
				
				// when all responses said, pick at random
				
				saidAll = dialogue.random === true || data.said.length === responses.length;
				
				if ( saidAll === true ) {
					
					response = main.array_random_value( responses );
					
				}
				// until all said, go through linearly
				else {
					
					for ( i = 0, il = responses.length; i < il; i++ ) {
						
						if ( main.index_of_value( data.said, responses[ i ] ) === -1 ) {
							
							response = responses[ i ];
							data.said.push( response );
							break;
							
						}
						
					}
					
				}
				
			}
			
			// message
			
			if ( typeof response === 'string' ) {
				
				message = response;
				
			}
			else {
				
				message = response.message;
				next = response.next;
				
			}
			
			if ( typeof message === 'function' ) {
				
				message = message.call( this );
				
			}
			
			// dialogue has now been said
			
			main.array_cautious_add( conversations.said, dialogueName );
			
			main.array_cautious_remove( conversations.unsaid, dialogueName );
			main.array_cautious_remove( conversations.randomableUnsaid, dialogueName );
			
			// communicate and show message
			
			message = main.to_array( message );
			
			if ( message.length > 0 ) {
				
				conversations.activeCount++;
				conversations.active = dialogueName;
				conversations.paused = false;
				conversations.ending = parameters.ending || false;
				
				if ( conversations.greeted !== true ) {
					
					conversations.greeted = true;
					
					this.morphs.play( animationNames.greeting, {
						duration: animationDurations.greeting
					} );
					
				}
				
				// handle next
			
				if ( next === 'unsaid' ) {
					
					if ( conversations.randomableUnsaid.length > 0 ) {
						
						next = main.array_random_value( conversations.randomableUnsaid );
						
					}
					else {
						
						next = undefined;
						
					}
				
				}
				
				if ( next === 'random' ) {
					
					randomable = conversations.randomable.slice( 0 );
					main.array_cautious_remove( randomable, dialogueName );
					
					next = main.array_random_value( randomable );
					
				}
				
				// store next
				
				conversations.next = next;
				
				// textbubble
				
				if ( conversations.textbubble instanceof _Textbubble.Instance !== true ) {
					
					conversations.textbubble = new _Textbubble.Instance();
					
				}
				
				textbubbleOptions = parameters.textbubble || {};
				textbubbleOptions.oneEnded = $.proxy( this.communicate_next, this );
				textbubbleOptions.oneRemoved = $.proxy( this.silence, this );
				textbubbleOptions.disableAdvanceByUser = textbubbleOptions.disableAdvanceByUser || false;
				textbubbleOptions.delayAdvanced = textbubbleOptions.delayAdvanced || 0;
				textbubbleOptions.animateAlways = textbubbleOptions.animateAlways || false;
				
				conversations.textbubble.content( message ).show( textbubbleOptions );
				
			}
			
			// callback on dialogue
			
			if ( typeof dialogue.callback === 'function' ) {
				
				dialogue.callback();
				
			}
			
		}
		
		// handle start
		
		this.targetCommunication.communicate_start();
		this.communicate_start();
		
	}
	
	function communicate_target ( target ) {
		
		if ( this.targetCommunication !== target ) {
			
			this.targetCommunication = target;
			
			// new target
			
			if ( target instanceof Character ) {
				
				this.look_at( this.targetCommunication );
				
			}
			
		}
		
	}
	
	function communicate_start () {
		
		var conversations = this.conversations;
		
		if ( this.communicating !== true ) {
			
			this.communicating = true;
			
			// record initial position when conversation started
			// if we move too much, cancel the conversation
			
			conversations.positionStart.copy( this.position );
			
			// also make sure we update textbubble as camera moves
			
			shared.cameraControls.onCameraMoved.add( this.communicate_update, this );
			
		}
		
		this.communicate_update();
		
	}
	
	function communicate_update ( force ) {
		
		var options = this.options,
			communication = options.communication,
			target = this.targetCommunication,
			conversations = this.conversations,
			projector = this.utilProjector1Communicate,
			position = this.utilVec31Communicate,
			positionOffset = this.utilVec32Communicate,
			distanceMoved,
			distanceProjectedToScreen,
			projectedPosition = conversations.projectedPosition,
			screenPosition = conversations.screenPosition,
			screenPositionTarget,
			normal;
		
		if ( this.communicating === true || force === true ) {
			
			// compare current local position to start local position to find moved
			
			if ( force === true ) {
				
				distanceMoved = 0;
				
			}
			else {
				
				distanceMoved = _VectorHelper.distance_between( conversations.positionStart, this.position );
				
			}
			
			if ( distanceMoved > communication.distanceMovedMax ) {
				
				this.silence();
				
			}
			else {
				
				// find position and offset
				
				position.copy( this.matrixWorld.getPosition() );
				
				positionOffset.set( communication.boundRadiusPctX, communication.boundRadiusPctY, communication.boundRadiusPctZ ).multiplyScalar( this.boundRadius );
				this.matrixRotationWorld.extractRotation( this.matrixWorld ).multiplyVector3( positionOffset );
				
				position.addSelf( positionOffset );
				
				// offset away from target
				
				if ( target instanceof Character ) {
					
					positionOffset = _VectorHelper.normal_between( target.matrixWorld.getPosition(), position ).multiplyScalar( this.boundRadius * communication.boundRadiusPctAway );
					position.addSelf( positionOffset );
					
				}
				
				// project total position
				
				projector.projectVector( position, shared.camera );
				
				// store positions on screen
				
				projectedPosition.x = shared.screenWidth * ( position.x + 1 ) * 0.5;
				projectedPosition.y = -( shared.screenHeight * ( position.y - 1 ) ) * 0.5;
				
				screenPosition.x = _MathHelper.clamp( projectedPosition.x, 0, shared.screenWidth );
				screenPosition.y = _MathHelper.clamp( projectedPosition.y, 0, shared.screenHeight );
				
				distance =_VectorHelper.distance_between( projectedPosition, screenPosition );
				
				if ( distance > communication.distanceOutsideScreenMax ) {
					
					this.silence();
					
				}
				else if ( conversations.paused !== true && conversations.textbubble instanceof _Textbubble.Instance ) {
				
					// adjust placement of textbubble to keep it away from target screen position
					
					if ( target instanceof Character ) {
						
						screenPositionTarget = target.conversations.screenPosition;
						normal = _VectorHelper.normal_between( screenPositionTarget, screenPosition );
						
						conversations.textbubble.normal_to_placement( normal );
						
					}
					
					conversations.textbubble.reposition( screenPosition.x, screenPosition.y );
					
				}
				
			}
			
		}
		else {
			
			shared.cameraControls.onCameraMoved.remove( this.communicate_update, this );
			
		}
		
	}
	
	function communicate_next ( ) {
		
		var conversations = this.conversations,
			target = this.targetCommunication,
			active = conversations.active,
			next = conversations.next,
			dialogue = this.options.dialogues[ active ],
			sayNext = true;
		
		if ( this.communicating === true ) {
			
			if ( target instanceof Character ) {
				
				// start this conversation in target if target has it and is not active
				
				if ( typeof target.options.dialogues[ active ] !== 'undefined' && target.conversations.active !== active ) {
					
					sayNext = false;
					
					this.communicate_pause();
					
					target.actions.execute( 'communicate', active, { target: this } );
					
				}
				
			}
			
			// callback on dialogue complete
			
			if ( typeof dialogue.callbackComplete === 'function' ) {
				
				dialogue.callbackComplete();
				
			}
			
			// continue conversation
			
			if ( sayNext === true ) {
				
				if ( typeof next === 'string' && next !== active ) {
					
					this.communicate( {
						dialogueName: next,
						textbubble: {
							animateAlways: true
						}
					} );
					
				}
				else if ( typeof target.conversations.next === 'string' && target.conversations.next !== target.conversations.active ) {
					
					target.communicate_next();
					
				}
				else {
					
					this.communicate_end();
					
				}
				
			}
			
		}
		
	}
	
	function communicate_pause () {
		
		var conversations = this.conversations;
		
		if ( this.communicating === true ) {
			
			conversations.paused = true;
			
			if ( conversations.textbubble instanceof _Textbubble.Instance ) {
				
				conversations.textbubble.hide();
				
			}
			
		}
		
	}
	
	function communicate_end () {
		
		var options = this.options,
			communication = options.communication,
			conversations = this.conversations,
			target = this.targetCommunication,
			dialogueName = 'goodbye',
			dialogue = this.options.dialogues[ dialogueName ],
			dialogueTarget,
			noEndDialogue = true;
		
		if ( this.communicating === true && conversations.ending !== true ) {
			
			conversations.ending = true;
			
			if ( conversations.activeCount > communication.activeCountMinEnd ) {
				
				if ( target instanceof Character ) {
					
					dialogueTarget = target.options.dialogues[ dialogueName ];
					
				}
				
				// say goodbye
				
				if ( typeof dialogue !== 'undefined' ) {
					
					noEndDialogue = false;
					
					this.communicate( {
						dialogueName: dialogueName,
						ending: true,
						textbubble: {
							disableAdvanceByUser: true,
							delayAdvanced: communication.delayEnd,
							oneAdvanced: $.proxy( function () {
								
								if ( conversations.ending === true ) {
									
									this.silence();
									
								}
							
							}, this )
						}
					} );
					
				}
				
				if ( typeof dialogueTarget !== 'undefined' ) {
					
					noEndDialogue = false;
					
					target.communicate_end();
					
				}
				
			}
			
			if ( noEndDialogue === true ) {
				
				this.silence();
				
			}
			
		}
		
	}
	
	function silence () {
		
		var animation = this.options.animation,
			animationNames = animation.names,
			animationDurations = animation.durations,
			conversations = this.conversations,
			target = this.targetCommunication;
		
		if ( this.communicating !== false ) {
			
			this.communicating = false;
			
			shared.cameraControls.onCameraMoved.remove( this.communicate_update, this );
			
			conversations.greeted = conversations.ending = conversations.paused = false;
			conversations.active = conversations.next = '';
			conversations.activeCount = 0;
			
			this.morphs.clear( animationNames.greeting, { duration: animationDurations.clear } );
			
			if ( conversations.textbubble instanceof _Textbubble.Instance ) {
				
				conversations.textbubble.remove();
				delete conversations.textbubble;
				
			}
			
			// handle communication target
			
			if ( target && target.communicating === true && target.targetCommunication === this ) {
				
				target.silence();
				
			}
			
			this.targetCommunication = undefined;
			
		}
		
	}
	
	/*===================================================
	
	move
	
	=====================================================*/
	
	function move_state_change ( propertyName, stop ) {
		
		var movement = this.options.movement,
			state = this.state,
			rotate = movement.rotate,
			facingDirection = rotate.facingDirection,
			forwardBack;
		
		// handle state property
		
		if ( state.hasOwnProperty( propertyName ) ) {
			
			state[ propertyName ] = stop === true ? 0 : 1;
			
		}
		
		// rotation
		
		if ( state.forward === 1 ) {
			
			facingDirection.z = 1;
			facingDirection.x = 0;
			forwardBack = true;
			
		}
		else if ( state.back === 1 ) {
			
			facingDirection.z = -1;
			facingDirection.x = 0;
			forwardBack = true;
			
		}
		
		if ( state.left === 1 || state.right === 1 ) {
			
			facingDirection.x = state.right === 1 ? -state.right : state.left;
			
			if ( forwardBack !== true ) {
				
				facingDirection.z = 0;
				
			}
			else {
				
				facingDirection.normalize();
				
			}
			
		}
		
	}
	
	function stop_jumping () {
		
		this.options.movement.jump.active = false;
		this.options.movement.jump.holding = false;
		
	}
	
	/*===================================================
	
	rotate
	
	=====================================================*/
	
	function turn_by ( angleDelta ) {
		
		var options = this.options,
			movement = options.movement,
			rotate = movement.rotate,
			rotateDelta = rotate.delta;
		
		if ( angleDelta !== 0 ) {
			
			rotateDelta.setFromAxisAngle( rotate.axis, angleDelta );
			
			this.quaternion.multiplySelf( rotateDelta );
			
			rotate.turn.multiplySelf( rotateDelta );
			rotateDelta.multiplyVector3( rotate.turnDirection );
			rotate.turnAngle = _MathHelper.rad_between_PI( rotate.turnAngle + angleDelta );
			
		}
		
	}
	
	function face_local_direction ( direction, lerp ) {
		
		var options = this.options,
			movement = options.movement,
			rotate = movement.rotate,
			rotateAxis = rotate.axis,
			rotateDelta = rotate.delta,
			facingDirectionLast = rotate.facingDirectionLast,
			facingAngleDelta = _VectorHelper.signed_angle_between_coplanar_vectors( facingDirectionLast, direction, rotateAxis ) * ( main.is_number( lerp ) ? lerp : 1 ),
			facingAngleTarget,
			facingAngleDeltaShortest;
		
		// rotate by direction angle change
		
		if ( facingAngleDelta !== 0 ) {
			
			facingAngleTarget = _MathHelper.rad_between_PI( rotate.facingAngle + facingAngleDelta );
			facingAngleDeltaShortest = _MathHelper.shortest_rotation_between_angles( rotate.facingAngle, facingAngleTarget );
			rotateDelta.setFromAxisAngle( rotateAxis, facingAngleDeltaShortest );
			
			this.quaternion.multiplySelf( rotateDelta );
			
			// copy new direction angle
			
			rotate.facing.multiplySelf( rotateDelta );
			rotateDelta.multiplyVector3( facingDirectionLast );
			rotate.facingAngle = facingAngleTarget;
			
		}
		
	}
	
	function look_at ( object ) {
		
		var options = this.options,
			movement = options.movement,
			rotate = movement.rotate,
			axis = rotate.axis,
			axisWorld = this.utilVec31Look.copy( axis ),
			forwardWorld = this.utilVec32Look.copy( rotate.facingDirectionBase ),
			rotateDelta = rotate.delta,
			position = this.utilVec33Look.copy( this.matrixWorld.getPosition() ),
			objectPosition = this.utilVec34Look.copy( object.matrixWorld.getPosition() ),
			differenceNormal,
			diffCrossUp = this.utilVec35Look,
			forwardWorldTarget = this.utilVec36Look,
			angle;
		
		// get world axis and forward
		
		this.matrixWorld.rotateAxis( axisWorld );
		this.matrixWorld.rotateAxis( forwardWorld );
		
		// find normal from this to object
		
		differenceNormal = _VectorHelper.normal_between( position, objectPosition );
		
		// double cross difference with up to find direction to object around up
		// we want to look in object's direction while keeping our up intact
		
		diffCrossUp.cross( differenceNormal, axisWorld );
		forwardWorldTarget.cross( axisWorld, diffCrossUp );
		
		// get signed angle delta and and multiply this quaternion by delta
		
		angle = _VectorHelper.signed_angle_between_coplanar_vectors( forwardWorld, forwardWorldTarget, axisWorld );
		rotateDelta.setFromAxisAngle( axis, angle );
				
		this.quaternion.multiplySelf( rotateDelta );
		
		// copy new direction angle
		
		rotate.facing.multiplySelf( rotateDelta );
		rotateDelta.multiplyVector3( rotate.facingDirectionLast );
		rotate.facingAngle = angle;
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update ( timeDelta, timeDeltaMod ) {
		
		var me = this,
			rigidBody = this.rigidBody,
			morphs = this.morphs,
			state = this.state,
			options = this.options,
			stats = options.stats,
			movement = options.movement,
			move = movement.move,
			rotate = movement.rotate,
			jump = movement.jump,
			animation = options.animation,
			animationNames = animation.names,
			animationDurations = animation.durations,
			animationDelays = animation.delays,
			animationOptions = animation.options,
			animationParameters,
			animationNamesToClear,
			moveDir = move.direction,
			moveSpeed = move.speed * timeDeltaMod,
			jumpSpeedStart,
			jumpSpeedEnd,
			jumpAirControl,
			jumpMoveDamping,
			jumpTime,
			jumpDuration,
			jumpTimeRatio,
			jumpTimeNotGrounded,
			jumpDelayNotGrounded,
			jumpDelayFalling,
			grounded,
			sliding,
			velocityGravity,
			velocityGravityForceDelta,
			velocityMovement,
			velocityMovementForceDelta,
			velocityMovementForceRotatedLength,
			velocityMovementDamping,
			terminalVelocity,
			playSpeedModifier;
		
		// check stats
		
		if ( state.invulnerable === true ) {
			
			state.invulnerableTime += timeDelta;
			
			if ( state.invulnerableTime >= stats.invulnerabilityDuration ) {
				
				this.invulnerable = false;
				
			}
			
		}
		
		if ( state.dead !== true ) {
			
			// set moving
					
			if ( state.forward === 1 || state.back === 1 || state.left === 1 || state.right === 1 ) {
				
				state.movingSelfHorizontal = true;
				
			}
			else {
				
				state.movingSelfHorizontal = false;
				
			}
			
			if ( state.movingSelfHorizontal || state.up === 1 || state.down === 1 ) {
				
				state.movingSelf = true;
				
			}
			else {
				
				state.movingSelf = false;
				
			}
			
			// update movement
			
			moveDir.z = state.movingSelfHorizontal ? 1 : 0;
			
			// if moving
			
			if ( state.movingSelfHorizontal === true ) {
				
				// rotate by turn angle change
				
				this.turn_by( ( state.right === 1 ? -state.right : state.left ) * rotate.turnSpeed );
				
				// rotate to face direction
				
				this.face_local_direction( rotate.facingDirection, _MathHelper.clamp( rotate.lerpDelta * timeDeltaMod, 0, 1 ) );
				
			}
			
			// velocity
			
			if ( typeof rigidBody !== 'undefined' ) {
				
				// properties
				
				jumpTime = jump.time;
				jumpDuration = jump.duration;
				jumpDelayNotGrounded = jump.delayNotGrounded;
				jumpDelayFalling = jump.delayFalling;
				jumpSpeedStart = jump.speedStart * timeDeltaMod;
				jumpSpeedEnd = jump.speedEnd * timeDeltaMod;
				jumpAirControl = jump.airControl;
				jumpMoveDamping = jump.moveDamping;
				
				velocityMovement = rigidBody.velocityMovement;
				velocityMovementForceDelta = velocityMovement.forceDelta;
				velocityMovementForceRotatedLength = velocityMovement.forceRotated.length() / timeDeltaMod;
				velocityGravity = rigidBody.velocityGravity;
				velocityGravityForceDelta = velocityGravity.forceDelta;
				
				// update moving
				
				state.movingHorizontal = state.movingSelfHorizontal || velocityMovementForceRotatedLength > 0;
				state.moving = state.movingSelf || state.movingHorizontal || velocityGravity.forceRotated.lengthSq() > 0;
				
				// jumping
				
				grounded = rigidBody.grounded;
				sliding = rigidBody.sliding;
				
				jumpTimeNotGrounded = jump.timeNotGrounded += timeDelta;
				
				// air control
				
				if ( grounded === false && jumpTimeNotGrounded >= jumpDelayNotGrounded ) {
					
					if ( typeof jump.movementChangeLayer === 'undefined' ) {
						
						jump.movementChangeLayer = _ObjectHelper.temporary_change( velocityMovement, {
							damping: new THREE.Vector3(  jumpMoveDamping, jumpMoveDamping, jumpMoveDamping ),
							speedDelta: new THREE.Vector3(  jumpAirControl, jumpAirControl, jumpAirControl )
						} );
						
					}
					
				}
				else if ( typeof jump.movementChangeLayer !== 'undefined' ) {
					
					_ObjectHelper.revert_change( velocityMovement, jump.movementChangeLayer );
					
					jump.movementChangeLayer = undefined;
					
				}
				
				// if falling but not jumping
				
				if ( jump.active === false && grounded === false && jumpTimeNotGrounded >= jumpDelayFalling ) {
					
					jump.ready = false;
					
					animationParameters = {
						duration: animationDurations.jump,
						loop: true,
						solo: true, 
						durationClear: animationDurations.clearSolo,
						startAt: 0,
						startAtMax: false
					};
					if ( animationOptions.jump ) $.extend( animationParameters, animationOptions.jump );
					
					morphs.play( animationNames.jump, animationParameters );
					
				}
				// do jump
				else if ( state.up !== 0 && ( ( grounded === true && sliding === false ) || jumpTimeNotGrounded < jumpDelayNotGrounded ) && jump.ready === true ) {
					
					jump.time = 0;
					
					jump.ready = false;
					
					jump.active = true;
					
					jump.starting = true;
					jump.started = false;
					
					jump.holding = true;
					
				}
				else if ( jump.holding === true && jump.active === true && jump.time < jumpDuration ) {
					
					if ( state.up === 0 && jump.time >= jump.durationMin ) {
						
						jump.holding = false;
						
					}
					
					// play jump start
					
					if ( jump.starting === true ) {
						
						// start jump when stationary
						
						if ( velocityMovementForceRotatedLength === 0 ) {
							
							animationParameters = {
								duration: animationDurations.jumpStart,
								loop: false,
								solo: true,
								durationClear: animationDurations.clearSolo,
								oneComplete: function () {
									
									jump.started = true;
									jump.starting = false;
									velocityGravity.reset();
									
								}
							};
							if ( animationOptions.jumpStart ) $.extend( animationParameters, animationOptions.jumpStart );
							
							morphs.play( animationNames.jumpStart, animationParameters );
							
						}
						else {
							
							jump.starting = false;
							velocityGravity.reset();
							
						}
						
					}
					else {
						
						// play jump
						
						morphs.clear( animationNames.jumpStart );
						
						animationParameters = {
							duration: animationDurations.jump,
							loop: true,
							solo: true, 
							durationClear: animationDurations.clearSolo,
							startAt: 0,
							startAtMax: jump.started
						};
						if ( animationOptions.jump ) $.extend( animationParameters, animationOptions.jump );
						
						morphs.play( animationNames.jump, animationParameters );
						
						// properties
						
						jumpTimeRatio = jumpTime / jumpDuration;
						
						// update time total
						
						jump.time += timeDelta;
						
						// add speed to gravity velocity delta
						
						velocityGravityForceDelta.y += jumpSpeedStart * ( 1 - jumpTimeRatio) + jumpSpeedEnd * jumpTimeRatio;
						
					}
					
				}
				else {
					
					if ( grounded === true && jump.active !== false ) {
						
						this.stop_jumping();
						
						// end jump when not moving
						
						if ( jumpTimeNotGrounded >= jumpDelayNotGrounded && velocityMovementForceRotatedLength === 0 ) {
							
							morphs.clear( animationNames.jump );
							
							animationParameters = { 
								duration: animationDurations.jumpEnd,
								loop: false,
								interruptable: false,
								startAt: 0,
								startAtMax: true,
								oneComplete: function () {
									morphs.clear( animationNames.jumpEnd, { duration: animationDurations.clear } );
								}
							};
							if ( animationOptions.jumpEnd ) $.extend( animationParameters, animationOptions.jumpEnd );
							
							morphs.play( animationNames.jumpEnd, animationParameters );
							
						}
						
					}
					
					if ( grounded === true && sliding === false && state.up === 0 ) {
						
						jump.timeNotGrounded = 0;
						
						jump.ready = true;
						
					}
					
				}
				
				// movement
				
				if ( sliding !== true ) {
					
					moveDir.multiplyScalar( moveSpeed );
					
					if ( state.movingHorizontal && jump.active === true ) {
						
						moveDir.z += jumpSpeedStart * jump.moveSpeedMod;
						
					}
					
					velocityMovementForceDelta.addSelf( moveDir );
					
					// moving backwards?
					
					if ( moveDir.z < 0 ) {
						
						state.movingBack = true;
						
					}
					else if ( moveDir.z > 0 ) {
						
						state.movingBack = false;
						
					}
					
				}
				
				// walk/run/idle
				
				if ( jump.active === false && state.grounded === true ) {
					
					// walk / run cycles
					
					if ( velocityMovementForceRotatedLength > 0 || sliding === true ) {
						
						/*
						// get approximate terminal velocity based on acceleration (moveVec) and damping
						// helps morphs play faster if character is moving faster, or slower if moving slower
						// drag coefficient of 0.083 assumes damping of 0.5
						
						terminalVelocity = Math.round( Math.sqrt( ( 2 * Math.abs( velocityMovement.force.z * 0.5 ) ) / 0.083 ) ) * 0.5;
						playSpeedModifier = terminalVelocity / Math.round( velocityMovementForceRotatedLength );
						
						if ( main.is_number( playSpeedModifier ) !== true ) {
							
							playSpeedModifier = 1;
							
						}
						*/
						if ( velocityMovementForceRotatedLength >= move.runThreshold ) {
							
							animationParameters = {
								duration: animationDurations.run,// * playSpeedModifier,
								loop: true,
								solo: true,
								durationClear: animationDurations.clearSolo,
								reverse: state.movingBack
							};
							if ( animationOptions.run ) $.extend( animationParameters, animationOptions.run );
							
							this.morphs.play( animationNames.run, animationParameters );
							
						}
						else {
							
							animationParameters = {
								duration: animationDurations.walk,// * playSpeedModifier,
								loop: true,
								solo: true,
								durationClear: animationDurations.clearSolo,
								reverse: state.movingBack
							};
							if ( animationOptions.walk ) $.extend( animationParameters, animationOptions.walk );
							
							this.morphs.play( animationNames.walk, animationParameters );
							
						}
						
					}
					// idle cycle
					else {
						
						animationNamesToClear = [ animationNames.run, animationNames.walk, animationNames.jump ];
						
						// only idle when not doing something interactive
						
						if ( this.actions.is_active( this.options.actionTypes.interactive ) !== true ) {
							
							animationParameters = {
								duration: animationDurations.idle,
								loop: true,
								alternate: animationNames.idleAlt,
								alternateDelay: animationDelays.idleAlt,
								alternateParameters: {
									duration: animationDurations.idleAlt
								}
							};
							if ( animationOptions.idle ) $.extend( animationParameters, animationOptions.idle );
							
							this.morphs.play( animationNames.idle, animationParameters );
							
						}
						else {
							
							animationNamesToClear = animationNamesToClear.concat( [ animationNames.idle, animationNames.idleAlt ] );
							
						}
						
						this.morphs.clear_only( animationNamesToClear, { duration: animationDurations.clear } );
						
					}
					
				}
				
				// record grounded state
				// this helps avoid minor issues when grounded on a slope and suddenly running the other direction, becoming ungrounded
				
				state.grounded = grounded;
				
			}
			
		}
		
	}
	
} ( KAIOPUA ) );