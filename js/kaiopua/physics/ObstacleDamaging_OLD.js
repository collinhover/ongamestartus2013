/*
 *
 * ObstacleDamaging.js
 * Obstacle that damages anything running into it.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/ObstacleDamaging.js",
		_ObstacleDamaging = {},
		_Obstacle,
		_ObjectHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _ObstacleDamaging,
		requirements: [
			"js/kaiopua/physics/Obstacle.js",
			"js/kaiopua/utils/ObjectHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( ob, oh ) {
		console.log('internal ObstacleDamaging', _ObstacleDamaging);
		// modules
		
		_Obstacle = ob;
		_ObjectHelper = oh;
		
		// properties
		
		_ObstacleDamaging.options = {
			damage: 1,
			cooldownDuration: 125,
			pushback: {
				speedStart: 4,
				speedEnd: 0,
				duration: 400
			},
			effects: {
				speedDelta: 0
			}
		};
		
		// instance
		
		_ObstacleDamaging.Instance = ObstacleDamaging;
		_ObstacleDamaging.Instance.prototype = new _Obstacle.Instance();
		_ObstacleDamaging.Instance.prototype.constructor = _ObstacleDamaging.Instance;
		_ObstacleDamaging.Instance.prototype.supr = _Obstacle.Instance.prototype;
		
		_ObstacleDamaging.Instance.prototype.affect = affect;
		_ObstacleDamaging.Instance.prototype.unaffect = unaffect;
		
		_ObstacleDamaging.Instance.prototype.update = update;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function ObstacleDamaging ( parameters ) {
		
		parameters = parameters || {};
		parameters.options = $.extend( true, {}, _ObstacleDamaging.options, parameters.options );
		
		// prototype constructor
		
		_Obstacle.Instance.call( this, parameters );
		
		// utility
		
		this.utilVec31Update = new THREE.Vector3();
		this.utilQ1Update = new THREE.Quaternion();
		
		this.effects = {
			speedDelta: new THREE.Vector3( 1, 1, 1 ).multiplyScalar( this.options.effects.speedDelta )
		};
		
	}
	
	/*===================================================
    
    affect
    
    =====================================================*/
	
	function affect ( object ) {
		
		var numAffected = this.affecting.length,
			affected = _ObstacleDamaging.Instance.prototype.supr.affect.apply( this, arguments );
		
		// new affected
		
		if ( this.affecting.length !== numAffected ) {
			
			affected.cooldown = false;
			affected.timeCooldown = 0;
			affected.pushback = false;
			affected.timePushback = 0;
			
		}
		
		// existing affected
		
		affected.damaging = true;
		
		if ( numAffected === 0 && this.affecting.length === 1 ) {
			
			shared.signals.onGameUpdated.add( this.update, this );
			
		}
		
		return affected;
		
	}
	
	function unaffect () {
		
		// unaffect handled by update
		
		return false;
		
	}
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update ( timeDelta, timeDeltaMod ) {
		
		var i, il,
			options = this.options,
			pushback = options.pushback,
			affected,
			object,
			hurt,
			rigidBody,
			collisions,
			collisionMovement,
			collisionGravity,
			collisionNew,
			collisionLast,
			distance,
			pushbackDelta = this.utilVec31Update,
			relativeToQ = this.utilQ1Update;
		
		for ( i = this.affecting.length - 1; i >= 0; i-- ) {
			
			affected = this.affecting[ i ];
			object = affected.object;
			
			// find collision
			
			if ( typeof object.rigidBody !== 'undefined' ) {
				
				rigidBody = object.rigidBody;
				
				collisions = rigidBody.collisions;
				collisionGravity = collisions.gravity;
				collisionMovement = collisions.movement;
				collisionLast = affected.collision;
				
				// get closest collision with this
				
				distance = Number.MAX_VALUE;
				
				if ( collisionMovement && collisionMovement.object === this && collisionMovement.distance < distance ) {
					
					affected.collision = collisionNew = collisionMovement;
					distance = collisionMovement.distance;
					
				}
				
				if ( collisionGravity && collisionGravity.object === this && collisionGravity.distance < distance ) {
					
					affected.collision = collisionNew = collisionGravity;
					distance = collisionGravity.distance;
					
				}
				
				if ( typeof collisionNew === 'undefined' ) {
					
					affected.damagable = false;
					
				}
				else {
					
					affected.damagable = true;
					
				}
				
			}
			
			// damage
			
			if ( affected.damaging === true && typeof object.hurt === 'function' ) {
				
				if ( affected.cooldown !== true ) {
					
					if ( affected.damagable !== false ) {
						
						hurt = object.hurt( options.damage );
						
						// start cooldown and pushback when hurt
						
						if ( hurt === true ) {
							
							affected.cooldown = true;
							affected.pushback = true;
							affected.timePushback = 0;
							
						}
						
					}
					
				}
				else {
					
					affected.timeCooldown += timeDelta;
					
				}
				
				if ( affected.timeCooldown >= options.cooldownDuration ) {
					
					affected.damaging = false;
					affected.cooldown = false;
					affected.timeCooldown = 0;
					
				}
				
			}
			
			// pushback
			
			if ( affected.pushback === true ) {
				
				// effect change
				
				if ( affected.collision !== collisionLast ) {
				
					if ( typeof affected.change !== 'undefined' ) {
						
						_ObjectHelper.revert_change( object.rigidBody.velocityMovement, affected.change );
						delete affected.change;
						
					}
					
					if ( typeof affected.collision !== 'undefined' ) {
						
						affected.change = _ObjectHelper.temporary_change( object.rigidBody.velocityMovement, this.effects );
						
					}
					
				}
				
				// push object away based on normal of collision
				
				if ( affected.collision ) {
					
					// collision normal is local to collision object, i.e. this
					
					pushbackDelta.copy( affected.collision.normal );
					this.matrixWorld.rotateAxis( pushbackDelta );
					
					// scale pushback direction to speed
					
					timePushbackRatio = affected.timePushback / pushback.duration;
					pushbackDelta.multiplyScalar( ( pushback.speedStart * ( 1 - timePushbackRatio ) + pushback.speedEnd * timePushbackRatio ) );
					
					// apply pushback to force rotated
					
					rigidBody.velocityMovement.forceRotated.addSelf( pushbackDelta );
					
				}
				
				affected.timePushback += timeDelta;
				
				if ( affected.timePushback >= pushback.duration ) {
					
					affected.pushback = false;
					
				}
				
			}
			
			// unaffect if not doing pushback
			
			if ( affected.pushback === false ) {
				
				var removed = _ObstacleDamaging.Instance.prototype.supr.unaffect.call( this, object );
				
				// revert effect change
				
				if ( typeof affected.change !== 'undefined' ) {
					
					_ObjectHelper.revert_change( object.rigidBody.velocityMovement, affected.change );
					delete affected.change;
					
				}
				
				if ( this.affecting.length === 0 ) {
					
					shared.signals.onGameUpdated.remove( this.update, this );
					
				}
				
			}
			
		}
		
	}
	
} ( KAIOPUA ) );