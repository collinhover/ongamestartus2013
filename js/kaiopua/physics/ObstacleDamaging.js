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
				duration: 150
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
		
	}
	
	/*===================================================
    
    affect
    
    =====================================================*/
	
	function affect ( object ) {
		
		var numAffected = this.affecting.length,
			affected = _ObstacleDamaging.Instance.prototype.supr.affect.apply( this, arguments );
		
		// new affected
		
		if ( this.affecting.length !== numAffected ) {
			
			affected.timeCooldown = 0;
			affected.cooldown = false;
			
		}
		
		// existing affected
		
		affected.timePushback = 0;
		affected.pushback = true;
		affected.damaging = true;
		
		if ( numAffected === 0 && this.affecting.length === 1 ) {
			
			shared.signals.onGameUpdated.add( this.update, this );
			
		}
		
		return affected;
		
	}
	
	function unaffect ( object ) {
		
		var affected = _ObstacleDamaging.Instance.prototype.supr.unaffect.apply( this, arguments );
		
		if ( this.affecting.length === 0 ) {
			
			shared.signals.onGameUpdated.remove( this.update, this );
			
		}
		
		return affected;
		
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
			rigidBody,
			collisions,
			collisionMovement,
			collisionGravity,
			distance,
			pushbackDelta = this.utilVec31Update,
			relativeToQ = this.utilQ1Update;
		
		for ( i = this.affecting.length - 1; i >= 0; i-- ) {
			
			affected = this.affecting[ i ];
			object = affected.object;
			
			// damage
			
			if ( affected.damaging === true && typeof object.hurt === 'function' ) {
				
				if ( affected.cooldown !== true ) {
					
					object.hurt( options.damage );
					
					affected.cooldown = true;
					
				}
				else {
					
					affected.timeCooldown += timeDelta;
					
				}
				
				if ( affected.timeCooldown >= options.cooldownDuration ) {
					
					affected.damaging = false;
					
				}
				
			}
			
			// pushback
			
			if ( affected.pushback === true && typeof object.rigidBody !== 'undefined' ) {
				
				rigidBody = object.rigidBody;
				
				collisions = rigidBody.collisions;
				collisionGravity = collisions.gravity;
				collisionMovement = collisions.movement;
				
				// get closest collision with this
				
				distance = Number.MAX_VALUE;
				
				if ( collisionMovement && collisionMovement.object === this && collisionMovement.distance < distance ) {
					
					affected.collision = collisionMovement;
					affected.velocity = rigidBody.velocityMovement;
					
				}
				
				if ( collisionGravity && collisionGravity.object === this && collisionGravity.distance < distance ) {
					
					affected.collision = collisionGravity;
					affected.velocity = rigidBody.velocityGravity;
					
				}
				
				// push object away based on normal of collision
				
				if ( affected.collision ) {
					
					
					
					
					// TODO: fix pushback sending object into world
					
					
					pushbackDelta.copy( affected.collision.normal );
					affected.collision.object.matrixWorld.rotateAxis( pushbackDelta );
					
					relativeToQ.copy( affected.velocity.relativeToQ ).inverse().multiplyVector3( pushbackDelta );
					
					timePushbackRatio = affected.timePushback / pushback.duration;
					
					pushbackDelta.multiplyScalar( pushback.speedStart * ( 1 - timePushbackRatio ) + pushback.speedEnd * timePushbackRatio );
					affected.velocity.forceDelta.addSelf( pushbackDelta );
					
				}
				
				affected.timePushback += timeDelta;
				
				if ( affected.timePushback >= pushback.duration ) {
					
					affected.pushback = false;
					
				}
				
			}
			
			// unaffect
			
			if ( affected.pushback === false && affected.damaging === false ) {
				
				this.unaffect( object );
				
			}
			
		}
		
	}
	
} ( KAIOPUA ) );