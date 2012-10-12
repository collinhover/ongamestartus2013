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
		assetPath = "js/game/characters/Character.js",
		_Character = {},
		_Model,
		_Actions,
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
			"js/game/core/Model.js",
			"js/game/core/Actions.js",
			"js/game/utils/MathHelper.js",
			"js/game/utils/VectorHelper.js",
			"js/game/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, ac, mh, vh, oh ) {
		console.log('internal Character', _Character);
		// modules
		
		_Model = m;
		_Actions = ac;
		_MathHelper = mh;
		_VectorHelper = vh;
		_ObjectHelper = oh;
		
		// properties
		
		_Character.defaults = {
			state: {
				invulnerabilityDuration: 500,
				deathAnimationDuration: 1000,
				decayDelay: 500,
				decayDuration: 500,
				respawnOnDeath: false,
				respawnDelay: 0,
				animationChangeTimeThreshold: 0,
				morphClearDuration: 125
			},
			stats: {
				healthMax: 100
			},
			movement: {
				move: {
					speed: 3,
					runThreshold: 0,
					walkAnimationDuration: 750,
					runAnimationDuration: 500,
					idleAnimationDuration: 3000
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
					moveSpeedMod: 0.5,
					durationMin: 100,
					duration: 100,
					startDelay: 125,
					AnimationDuration: 1000,
					startAnimationDuration: 125,
					endAnimationDuration: 125
				}
			}
		};
		
		// character instance
		
		_Character.Instance = Character;
		_Character.Instance.prototype = new _Model.Instance();
		_Character.Instance.prototype.constructor = _Character.Instance;
		
		_Character.Instance.prototype.hurt = hurt;
		_Character.Instance.prototype.die = die;
		_Character.Instance.prototype.decay = decay;
		_Character.Instance.prototype.respawn = respawn;
		
		_Character.Instance.prototype.move_state_change = move_state_change;
		_Character.Instance.prototype.rotate_by_direction = rotate_by_direction;
		_Character.Instance.prototype.rotate_by_angle = rotate_by_angle;
		_Character.Instance.prototype.stop_jumping = stop_jumping;
		_Character.Instance.prototype.morph_cycle = morph_cycle;
		
		_Character.Instance.prototype.update = update;
		
		Object.defineProperty( _Character.Instance.prototype, 'scene', { 
			get : function () { return this._scene; },
			set : function ( newScene ) {
				
				if ( typeof newScene !== 'undefined' ) {
					
					// remove from previous
					
					this.hide();
					
					// add to new
					
					this.show( newScene );
					
				}
				
			}
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'health', { 
			get : function () { return this.stats.health; },
			set: function ( health ) {
				
				if ( main.is_number( health ) ) {
					
					this.stats.health = _MathHelper.clamp( health, 0, this.stats.healthMax );
					
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
			get : function () { return this.movement.jump.active; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'turn', { 
			get : function () { return this.movement.rotate.turn; }
		});
		
		Object.defineProperty( _Character.Instance.prototype, 'facing', { 
			get : function () { return this.movement.rotate.facing; }
		});
		
	}
	
	/*===================================================
    
    character
    
    =====================================================*/
	
	// adds functionality to and inherits from Model
	
	function Character ( parameters ) {
		
		var pModel,
			pMovement,
			pMove,
			pRotate,
			pJump,
			movement,
			move,
			rotate,
			jump,
			state;
		
		// handle parameters
		
		parameters = parameters || {};
		
		pModel = parameters.model || {};
		pMovement = parameters.movement || {};
		pMove = pMovement.move || {};
		pRotate = pMovement.rotate || {};
		pJump = pMovement.jump || {};
		
		// state
		state = this.state = $.extend( {}, _Character.defaults.state, parameters.state );
		state.up = 0;
		state.down = 0;
		state.left = 0;
		state.right = 0;
		state.forward = 0;
		state.back = 0;
		state.moving = false;
		state.movingHorizontal = false;
		state.movingBack = false;
		state.invulnerable = false;
		state.invulnerableTime = 0;
		state.dead = false;
		state.decaying = false;
		state.animationChangeTime = state.animationChangeTimeThreshold;
		state.morphName = '';
		
		// stats
		
		stats = this.stats = $.extend( {}, _Character.defaults.stats, parameters.stats );
		stats.health = stats.healthMax;
		
		// movement
		
		movement = this.movement = {};
		
		// move
		
		move = movement.move = $.extend( {}, _Character.defaults.movement.move, pMovement.move );
		move.direction = new THREE.Vector3();
		
		// rotate
		rotate = movement.rotate = $.extend( {}, _Character.defaults.movement.rotate, pMovement.rotate );
		rotate.facingDirection = new THREE.Vector3( 0, 0, 1 );
		rotate.facingDirectionLast = rotate.facingDirection.clone();
		rotate.facing = new THREE.Quaternion();
		rotate.facingAngle = 0;
		rotate.turn = new THREE.Quaternion();
		rotate.turnAngle = 0;
		rotate.axis = new THREE.Vector3( 0, 1, 0 );
		rotate.delta = new THREE.Quaternion();
		rotate.vector = new THREE.Quaternion();
		
		// jump
		jump = movement.jump = $.extend( {}, _Character.defaults.movement.jump, pMovement.jump );
		jump.time = 0;
		jump.timeAfterNotGrounded = 0;
		jump.timeAfterNotGroundedMax = 125;
		jump.startDelayTime = 0;
		jump.ready = true;
		jump.active = false;
		jump.holding = false;
		
		// physics
		
		if ( typeof pModel.physics !== 'undefined' ) {
			
			pModel.physics.dynamic = true;
			pModel.physics.movementDamping = main.is_number( pModel.physics.movementDamping ) ? pModel.physics.movementDamping : 0.5;
			pModel.physics.movementForceLengthMax = main.is_number( pModel.physics.movementForceLengthMax ) ? pModel.physics.movementForceLengthMax : shared.universeGravityMagnitude.length() * 20;
			
		}
		
		// prototype constructor
		
		_Model.Instance.call( this, pModel );
		
		// properties
		
		this.name = parameters.name || characterName;
		this.targeting = {
			
			targets: [],
			targetsToRemove: [],
			targetCurrent: undefined
			
		};
		
		this.actions = new _Actions.Instance();
		
	}
	
	/*===================================================
	
	health
	
	=====================================================*/
	
	function hurt ( damage ) {
		
		var state = this.state,
			stats = this.stats;
		
		if ( state.invulnerable !== true ) {
			
			this.health -= damage;
			
			if ( stats.health === 0 ) {
				
				this.die();
				
			}
			else {
			
				// small period of invulnerability after being hurt, handled by update
				
				state.invulnerable = true;
				
			}
			
		}
		
	}
	
	function die () {
		
		var state = this.state;
		
		if ( state.invulnerable !== true ) {
			
			this.health = 0;
			
			state.dead = true;
			
			// TODO: better morph cycling
			// this.morph_cycle( timeDelta, 'die', state.deathAnimationDuration, true, false );
			/*
			this.morphs.play( 'die', {
				duration: state.deathAnimationDuration,
				solo: true,
				callback: $.proxy( this.decay, this )
			} );
			*/
		}
		
	}
	
	function decay () {
		
		var state = this.state;
		
		if ( state.dead === true ) {
			
			state.decaying = true;
			/*
			this.morphs.play( 'decay', {
				duration: state.decayDuration,
				delay: state.decayDelay,
				solo: true
			} );
			*/
			
			
			
			// TODO: tween opacity to 0
			
			
			
			// TODO: respawn callback from opacity tween
			
			if ( state.respawnOnDeath === true ) {
				
				//pDecay.callback = $.proxy( this.respawn, this );
				
			}
			
		}
		
	}
	
	function respawn ( parent, location ) {
		
		state.dead = state.decaying = false;
		state.invulnerable = true;
		
		
		
		// TODO: add to parent, use default if not provided
		
		
		// TODO: send to location, use default if not provided
		
		
		
	}
	
	/*===================================================
	
	move
	
	=====================================================*/
	
	function move_state_change ( propertyName, stop ) {
		
		var movement = this.movement,
			state = this.state,
			rotate = movement.rotate,
			rotateFacingDirection = rotate.facingDirection,
			forwardBack;
		
		// handle state property
		
		if ( state.hasOwnProperty( propertyName ) ) {
			
			state[ propertyName ] = stop === true ? 0 : 1;
			
		}
		
		// rotation
		
		if ( state.forward === 1 ) {
			
			rotateFacingDirection.z = 1;
			rotateFacingDirection.x = 0;
			forwardBack = true;
			
		}
		else if ( state.back === 1 ) {
			
			rotateFacingDirection.z = -1;
			rotateFacingDirection.x = 0;
			forwardBack = true;
			
		}
		
		if ( state.left === 1 || state.right === 1 ) {
			
			rotateFacingDirection.x = state.right === 1 ? -state.right : state.left;
			
			if ( forwardBack !== true ) {
				
				rotateFacingDirection.z = 0;
				
			}
			else {
				
				rotateFacingDirection.normalize();
				
			}
			
		}
		
	}
	
	/*===================================================
	
	rotate
	
	=====================================================*/
	
	function rotate_by_direction ( dx, dy, dz ) {
		
		var rotate = this.movement.rotate;
		
		// update direction
		
		if ( main.is_number( dx ) ) {
			
			rotate.facingDirection.x = dx;
			
		}
		
		if ( main.is_number( dy ) ) {
			
			rotate.facingDirection.y = dy;
			
		}
		
		if ( main.is_number( dz ) ) {
			
			rotate.facingDirection.z = dz;
			
		}
		
	}
	
	function rotate_by_angle ( rotateAngleDelta ) {
		
		var rotate = this.movement.rotate,
			rotateAxis = rotate.axis,
			rotateDelta = rotate.delta,
			rotateAngleTarget = _MathHelper.degree_between_180( rotate.facingAngle + rotateAngleDelta ),
			rotateAngleDeltaShortest = _MathHelper.shortest_rotation_between_angles( rotate.facingAngle, rotateAngleTarget );
		
		// find delta quaternion
		
		rotateDelta.setFromAxisAngle( rotateAxis, rotateAngleDeltaShortest );
		
		// copy deltas
		
		rotateDelta.multiplyVector3( rotate.facingDirection );
		rotate.facingAngle = rotateAngleTarget;
		
	}
	
	/*===================================================
	
	jump
	
	=====================================================*/
	
	function stop_jumping () {
		
		this.movement.jump.active = false;
		this.movement.jump.holding = false;
		
	}
	
	/*===================================================
	
	morph cycling
	
	=====================================================*/
	
	function morph_cycle ( timeDelta, morphName, duration, loop, reverse ) {
		
		var morphs = this.morphs,
			state = this.state,
			movement = this.movement,
			move = movement.move;
		
		if ( state.morphName !== morphName ) {
			
			if ( state.animationChangeTime < state.animationChangeTimeThreshold ) {
				
				state.animationChangeTime += timeDelta;
				
			}
			else {
				
				state.animationChangeTime = 0;
				
				morphs.clear( state.morphName, state.morphClearDuration );
				
				state.morphName = morphName;
				
			}
			
		}
		
		morphs.play( state.morphName, { duration: duration, loop: loop, reverse: reverse } );
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update ( timeDelta, timeDeltaMod ) {
		
		var rigidBody = this.rigidBody,
			morphs = this.morphs,
			stats = this.stats,
			state = this.state,
			movement = this.movement,
			move = movement.move,
			rotate = movement.rotate,
			jump = movement.jump,
			moveDir = move.direction,
			moveSpeed = move.speed * timeDeltaMod,
			rotateTurnAngleDelta,
			rotateAxis = rotate.axis,
			rotateFacingAngleDelta,
			rotateFacingAngleDeltaShortest,
			rotateFacingAngleTarget,
			rotateFacingDirection = rotate.facingDirection,
			rotateFacingDirectionLast = rotate.facingDirectionLast,
			rotateDelta = rotate.delta,
			rotateLerpDelta = rotate.lerpDelta * timeDeltaMod,
			jumpSpeedStart,
			jumpSpeedEnd,
			jumpAirControl,
			jumpMoveDamping,
			jumpTime,
			jumpDuration,
			jumpTimeRatio,
			jumpTimeAfterNotGroundedMax,
			jumpStartDelay,
			grounded,
			sliding,
			velocityGravity,
			velocityGravityForceDelta,
			velocityMovement,
			velocityMovementForceDelta,
			velocityMovementForceLength,
			velocityMovementDamping,
			dragCoefficient,
			terminalVelocity,
			playSpeedModifier;
		
		// check stats
		
		if ( state.invulnerable === true ) {
			
			state.invulnerableTime += timeDelta;
			
			if ( state.invulnerableTime >= state.invulnerableDuration ) {
				
				state.invulnerableTime = 0;
				state.invulnerable = false;
				
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
		
		// update rotation angles
		
		rotateTurnAngleDelta = ( state.right === 1 ? -state.right : state.left ) * rotate.turnSpeed;
		rotateFacingAngleDelta = _VectorHelper.signed_angle_between_coplanar_vectors( rotateFacingDirectionLast, rotateFacingDirection, rotateAxis ) * rotateLerpDelta;
		
		// if moving
		
		if ( state.movingHorizontal === true ) {
			
			// rotate by turn angle change
			
			if ( rotateTurnAngleDelta !== 0 ) {
				
				rotateDelta.setFromAxisAngle( rotateAxis, rotateTurnAngleDelta );
				
				this.quaternion.multiplySelf( rotateDelta );
				
				// copy new turn angle
				
				rotate.turn.multiplySelf( rotateDelta );
				rotate.turnAngle = _MathHelper.degree_between_180( rotate.turnAngle + rotateTurnAngleDelta );
				
			}
			
			// rotate by direction angle change
			
			if ( rotateFacingAngleDelta !== 0 ) {
				
				rotateFacingAngleTarget = _MathHelper.degree_between_180( rotate.facingAngle + rotateFacingAngleDelta );
				rotateFacingAngleDeltaShortest = _MathHelper.shortest_rotation_between_angles( rotate.facingAngle, rotateFacingAngleTarget );
				rotateDelta.setFromAxisAngle( rotateAxis, rotateFacingAngleDeltaShortest );
				
				this.quaternion.multiplySelf( rotateDelta );
				
				// copy new direction angle
				
				rotate.facing.multiplySelf( rotateDelta );
				rotateDelta.multiplyVector3( rotateFacingDirectionLast );
				rotate.facingAngle = rotateFacingAngleTarget;
				
			}
			
		}
		
		// velocity
		
		if ( typeof rigidBody !== 'undefined' ) {
			
			// properties
			
			jumpTime = jump.time;
			jumpDuration = jump.duration;
			jumpTimeAfterNotGroundedMax = jump.timeAfterNotGroundedMax;
			jumpStartDelay = jump.startDelay;
			jumpSpeedStart = jump.speedStart * timeDeltaMod;
			jumpSpeedEnd = jump.speedEnd * timeDeltaMod;
			jumpAirControl = jump.airControl;
			jumpMoveDamping = jump.moveDamping;
			
			velocityMovement = rigidBody.velocityMovement;
			velocityMovementForce = velocityMovement.force;
			velocityMovementForceDelta = velocityMovement.forceDelta;
			velocityGravity = rigidBody.velocityGravity;
			velocityGravityForceDelta = velocityGravity.forceDelta;
			
			// jumping
			
			grounded = rigidBody.grounded;
			sliding = rigidBody.sliding;
			
			jump.timeAfterNotGrounded += timeDelta;
			
			// if falling but not jumping
			
			if ( jump.active === false && jump.timeAfterNotGrounded >= jumpTimeAfterNotGroundedMax && grounded === false ) {
				
				jump.ready = false;
				
				this.morph_cycle( timeDelta, 'jump', jump.AnimationDuration, true );
				
			}
			// do jump
			else if ( state.up !== 0 && ( ( grounded === true && sliding === false ) || jump.timeAfterNotGrounded < jumpTimeAfterNotGroundedMax ) && jump.ready === true ) {
				
				jump.time = 0;
				
				jump.startDelayTime = 0;
				
				jump.ready = false;
				
				jump.active = true;
				
				jump.starting = true;
				
				jump.holding = true;
				
			}
			else if ( jump.holding === true && jump.active === true && jump.time < jumpDuration ) {
				
				// count delay
				
				jump.startDelayTime += timeDelta;
				
				if ( state.up === 0 && jump.time >= jump.durationMin ) {
					
					jump.holding = false;
					
				}
				
				// do jump after delay
				
				if ( jump.startDelayTime >= jump.startDelay ) {
					
					// if start delay just finished
					
					if ( jump.starting === true ) {
						
						jump.starting = false;
					
						// reset velocity
						
						velocityGravity.reset();
						
						jump.movementChangeLayer = _ObjectHelper.temporary_change( velocityMovement, {
							damping: new THREE.Vector3(  jumpMoveDamping, jumpMoveDamping, jumpMoveDamping ),
							speedDelta: new THREE.Vector3(  jumpAirControl, jumpAirControl, jumpAirControl )
						} );
						
					}
					
					// play jump
					
					this.morph_cycle ( timeDelta, 'jump', jump.AnimationDuration, true );
					
					// properties
					
					jumpTimeRatio = jumpTime / jumpDuration;
					
					// update time total
					
					jump.time += timeDelta;
					
					// add speed to gravity velocity delta
					
					velocityGravityForceDelta.y += jumpSpeedStart * ( 1 - jumpTimeRatio) + jumpSpeedEnd * jumpTimeRatio;
					
				}
				else {
					
					// play jump start
					
					morphs.play( 'jump_start', { duration: jump.startAnimationDuration, loop: false, callback: function () { morphs.clear( 'jump_start' ); } } );
					
				}
				
			}
			else {
				
				if ( grounded === true && jump.active !== false ) {
					
					_ObjectHelper.revert_change( velocityMovement, jump.movementChangeLayer );
					
					this.stop_jumping();
					
					if ( jump.timeAfterNotGrounded >= jumpTimeAfterNotGroundedMax ) {
						
						morphs.clear( 'jump', state.morphClearTime );
					
						morphs.play( 'jump_end', { duration: jump.endAnimationDuration, loop: false, callback: function () { morphs.clear( 'jump_end', state.morphClearTime ); } } );
					
					}
					
				}
				
				if ( grounded === true && sliding === false && state.up === 0 ) {
					
					jump.timeAfterNotGrounded = 0;
					
					jump.ready = true;
					
				}
				
			}
			
			// movement
			
			velocityMovementForceDelta.copy( moveDir );
			
			if ( state.movingHorizontal && jump.active === true ) {
				
				velocityMovementForceDelta.z += jumpSpeedStart * jump.moveSpeedMod;
				
			}
			
			velocityMovementForceDelta.multiplyScalar( moveSpeed );
			
			// moving backwards?
			
			if ( velocityMovementForceDelta.z < 0 ) {
				
				state.movingBack = true;
				
			}
			else if ( velocityMovementForceDelta.z > 0 ) {
				
				state.movingBack = false;
				
			}
			
			// get movement force
			
			velocityMovementForceLength = velocityMovement.force.length() / timeDeltaMod;
			
			// walk/run/idle
			
			if ( jump.active === false && grounded === true ) {
				
				// walk / run cycles
				
				if ( velocityMovementForceLength > 0 || sliding === true ) {
					
					// get approximate terminal velocity based on acceleration (moveVec) and damping
					// helps morphs play faster if character is moving faster, or slower if moving slower
					// TODO: move equation into physics module
					
					velocityMovementDamping = velocityMovement.damping.z;
					dragCoefficient = ( 0.33758 * Math.pow( velocityMovementDamping, 2 ) ) + ( -0.67116 * velocityMovementDamping ) + 0.33419;
					
					terminalVelocity = Math.round( Math.sqrt( ( 2 * Math.abs( velocityMovement.force.z * 0.5 ) ) / dragCoefficient ) ) * 0.5;
					playSpeedModifier = terminalVelocity / Math.round( velocityMovementForceLength );
					
					if ( main.is_number( playSpeedModifier ) !== true ) {
						
						playSpeedModifier = 1;
						
					}
					
					if ( velocityMovementForceLength >= move.runThreshold ) {
						
						this.morph_cycle( timeDelta, 'run', move.runAnimationDuration * playSpeedModifier, true, state.movingBack );
						
					}
					else {
						
						this.morph_cycle( timeDelta, 'walk', move.walkAnimationDuration * playSpeedModifier, true, state.movingBack );
						
					}
					
				}
				// idle cycle
				else {
					
					this.morph_cycle( timeDelta, 'idle', move.idleAnimationDuration, true, false );
					
				}
				
			}
			
		}
		
	}
	
} ( OGSUS ) );