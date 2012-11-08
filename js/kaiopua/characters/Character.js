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
	
	function init_internal ( m, mh, vh, oh ) {
		console.log('internal Character', _Character);
		// modules
		
		_Model = m;
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
				invulnerabilityDuration: 1000,
				invulnerabilityOpacityPulses: 3,
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
					respawn: 'respawn'
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
					clear: 125,
					clearSolo: 125
				},
				delays: {
					decay: 500,
					idleAlt: 5000
				}
			}
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
					console.log( this, ' is now invulnerable!' );
					this.material.transparent = true;
					
					tweenShow = _ObjectHelper.tween( this.material, { opacity: 1 }, {
						start: false,
						duration: durationPerTween
					} );
					
					tweenHide = _ObjectHelper.tween( this.material, { opacity: stats.invulnerabilityOpacityMin }, {
						start: false,
						duration: durationPerTween
					} );
					
					tweenHide.chain( tweenShow.chain( tweenHide ) ).start();
					
				}
				// tween opacity back to normal
				else {
					
					_ObjectHelper.tween( this.material, { opacity: 1 }, {
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
			animation;
		
		// utils
		
		this.utilVec31Look = new THREE.Vector3();
		this.utilVec32Look = new THREE.Vector3();
		this.utilVec33Look = new THREE.Vector3();
		
		// handle parameters
		
		parameters = parameters || {};
		
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
		state.movingHorizontal = false;
		state.movingBack = false;
		state.grounded = false;
		state.invulnerable = false;
		state.invulnerableTime = 0;
		state.dead = false;
		state.decaying = false;
		state.health = stats.healthMax;
		
		this.morphs.clear_all();
		
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
		console.log( this, ' trying to hurt for ', damage, ', invulnerable? ', state.invulnerable );
		if ( stats.invincible !== true && state.invulnerable !== true && state.dead !== true && main.is_number( damage ) && damage > 0 ) {
			
			this.health -= damage;
			
			this.onHurt.dispatch();
			
			this.morphs.play( animationNames.hurt, {
				duration: animationDurations.hurt,
				solo: true,
				durationClear: animationDurations.clearSolo
			} );
			
			console.log( ' > hurt for ', damage, ' new hp = ', this.health );
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
		console.log( this, ' DEAD ' );
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
			console.log( this, ' decaying... ' );
			this.morphs.play( animationNames.decay, {
				duration: animationDurations.decay,
				delay: animationDelays.decay,
				solo: true,
				durationClear: animationDurations.clearSolo
			} );
			
			// opacity to 0
			
			this.material.transparent = true;
			
			_ObjectHelper.tween( this.material, { opacity: 0 }, { 
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
			
			this.material.transparent = true;
			this.material.opacity = 0;
			
			// add and position
			
			state.spawnParent.add( this );
			
			if ( state.spawnLocation instanceof THREE.Vector3 ) {
				
				this.position.copy( state.spawnLocation );
				
			}
			console.log( this, ' respawned! ' );
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
			facingAngleDelta = _VectorHelper.signed_angle_between_coplanar_vectors( facingDirectionLast, direction, rotateAxis ) * lerp,
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
			rotateDelta = rotate.delta,
			difference = _VectorHelper.vector_between( this.position, object.position ),
			diffDotAxis= difference.dot( axis ),
			axisToObjPosition = this.utilVec31Look.copy( axis ).multiplyScalar( diffDotAxis ),
			projectedPosition = this.utilVec32Look.sub( object.position, axisToObjPosition ),
			normal = _VectorHelper.normal_between( this.position, projectedPosition ),
			forward = this.utilVec33Look.copy( rotate.facingDirectionBase ),
			angle;
		
		rotate.turn.multiplyVector3( forward );
		rotate.facing.multiplyVector3( forward );
		angle = _VectorHelper.signed_angle_between_coplanar_vectors( forward, normal, axis );
		
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
		
		// set moving
				
		if ( state.forward === 1 || state.back === 1 || state.left === 1 || state.right === 1 ) {
			
			state.movingHorizontal = true;
			
		}
		else {
			
			state.movingHorizontal = false;
			
		}
		
		if ( state.movingHorizontal || state.up === 1 || state.down === 1 ) {
			
			state.moving = true;
			
		}
		else {
			
			state.moving = false;
			
		}
		
		// update movement
		
		moveDir.z = state.movingHorizontal ? 1 : 0;
		
		// if moving
		
		if ( state.movingHorizontal === true ) {
			
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
				
				morphs.play( animationNames.jump, {
					duration: animationDurations.jump,
					loop: true,
					solo: true, 
					durationClear: animationDurations.clearSolo,
					startAt: 0,
					startAtMax: false,
				} );
				
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
						
						morphs.play( animationNames.jumpStart, {
							duration: animationDurations.jumpStart,
							loop: false,
							solo: true,
							durationClear: animationDurations.clearSolo,
							oneComplete: function () {
								
								jump.started = true;
								jump.starting = false;
								velocityGravity.reset();
								
							}
						} );
						
					}
					else {
						
						jump.starting = false;
						velocityGravity.reset();
						
					}
					
				}
				else {
					
					// play jump
					
					morphs.clear( animationNames.jumpStart );
					
					morphs.play( animationNames.jump, {
						duration: animationDurations.jump,
						loop: true,
						solo: true, 
						durationClear: animationDurations.clearSolo,
						startAt: 0,
						startAtMax: jump.started
					} );
					
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
						
						morphs.play( animationNames.jumpEnd, { 
							duration: animationDurations.jumpEnd,
							loop: false,
							interruptable: false,
							startAt: 0,
							startAtMax: true,
							oneComplete: function () {
								morphs.clear( animationNames.jumpEnd, { duration: animationDurations.clear } );
							}
						} );
						
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
					
					// get approximate terminal velocity based on acceleration (moveVec) and damping
					// helps morphs play faster if character is moving faster, or slower if moving slower
					// drag coefficient of 0.083 assumes damping of 0.5
					
					terminalVelocity = Math.round( Math.sqrt( ( 2 * Math.abs( velocityMovement.force.z * 0.5 ) ) / 0.083 ) ) * 0.5;
					playSpeedModifier = terminalVelocity / Math.round( velocityMovementForceRotatedLength );
					
					if ( main.is_number( playSpeedModifier ) !== true ) {
						
						playSpeedModifier = 1;
						
					}
					
					if ( velocityMovementForceRotatedLength >= move.runThreshold ) {
						
						this.morphs.play( animationNames.run, { duration: animationDurations.run * playSpeedModifier, loop: true, solo: true, durationClear: animationDurations.clearSolo, reverse: state.movingBack } );
						
					}
					else {
						
						this.morphs.play( animationNames.walk, { duration: animationDurations.walk * playSpeedModifier, loop: true, solo: true, durationClear: animationDurations.clearSolo, reverse: state.movingBack } );
						
					}
					
				}
				// idle cycle
				else {
					
					this.morphs.play( animationNames.idle, {
						duration: animationDurations.idle,
						loop: true,
						solo: true,
						durationClear: animationDurations.clearSolo,
						alternate: animationNames.idleAlt,
						alternateDelay: animationDelays.idleAlt,
						alternateParameters: {
							duration: animationDurations.idleAlt,
							solo: true,
							durationClear: animationDurations.clearSolo
						}
					} );
					
				}
				
			}
			
			// record grounded state
			// this helps avoid minor issues when grounded on a slope and suddenly running the other direction, becoming ungrounded
			
			state.grounded = grounded;
			
		}
		
	}
	
} ( KAIOPUA ) );