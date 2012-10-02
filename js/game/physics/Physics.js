/*
 *
 * Physics.js
 * Simple raycasting based physics using octree for faster casting.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/physics/Physics.js",
		_Physics = {},
		_RigidBody,
		_RayHelper,
		_MathHelper,
		_VectorHelper,
		_ObjectHelper,
		_PhysicsHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Physics,
		requirements: [
			"js/game/physics/RigidBody.js",
			"js/game/utils/MathHelper.js",
			"js/game/utils/VectorHelper.js",
			"js/game/utils/RayHelper.js",
			"js/game/utils/ObjectHelper.js",
			"js/game/utils/PhysicsHelper.js",
			"js/lib/three/ThreeOctree.min.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( rb, mh, vh, rh, oh, ph ) {
		console.log('internal physics');
		
		_RigidBody = rb;
		_MathHelper = mh;
		_VectorHelper = vh;
		_RayHelper = rh;
		_ObjectHelper = oh;
		_PhysicsHelper = ph;
		
		// properties
		
		_Physics.timeWithoutIntersectionThreshold = 500;
		
		// instance
		
		_Physics.Instance = Physics;
		_Physics.Instance.prototype = {};
		_Physics.Instance.prototype.constructor = _Physics.Instance;
		
		_Physics.Instance.prototype.add = add;
		_Physics.Instance.prototype.remove = remove;
		_Physics.Instance.prototype.modify_bodies = modify_bodies;
		_Physics.Instance.prototype.update = update;
		_Physics.Instance.prototype.handle_velocity = handle_velocity;
		
	}
	
	/*===================================================
    
	instance
    
    =====================================================*/
	
	function Physics ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		// shared
		
		shared.universeGravitySource = parameters.universeGravitySource instanceof THREE.Vector3 ? parameters.universeGravitySource : shared.universeGravitySource;
		shared.universeGravityMagnitude = parameters.universeGravityMagnitude instanceof THREE.Vector3 ? parameters.universeGravityMagnitude : shared.universeGravityMagnitude;
		
		// util
		
		this.utilVec31Update = new THREE.Vector3();
		this.utilVec32Update = new THREE.Vector3();
		this.utilVec33Update = new THREE.Vector3();
		this.utilVec34Update = new THREE.Vector3();
		this.utilVec35Update = new THREE.Vector3();
		this.utilVec31Velocity = new THREE.Vector3();
		
		// octree
		
		this.octree = new THREE.Octree();
		
		// properties
		
		this.timeWithoutIntersectionThreshold = main.is_number( parameters.timeWithoutIntersectionThreshold ) ? parameters.timeWithoutIntersectionThreshold : _Physics.timeWithoutIntersectionThreshold;
		
		this.bodies = [];
		this.bodiesGravity = [];
		this.bodiesDynamic = [];
		
	}
	
	/*===================================================
    
	add / remove
    
    =====================================================*/
	
	function add ( object ) {
		
		this.modify_bodies( object, true );
		
	}
	
	function remove( object ) {
		
		this.modify_bodies( object );
		
	}
	
	function modify_bodies ( object, adding ) {
		
		var i, l,
			rigidBody,
			collider,
			index,
			child;
		
		if ( typeof object !== 'undefined' ) {
			
			if ( typeof object.rigidBody !== 'undefined' ) {
				
				rigidBody = object.rigidBody;
				
				collider = rigidBody.collider;
				
				// zero out velocities
				
				rigidBody.velocityMovement.force.set( 0, 0, 0 );
				
				rigidBody.velocityGravity.force.set( 0, 0, 0 );
				
				// get indices
				
				index = main.index_of_value( this.bodies, rigidBody );
				
				// if adding
				
				if ( adding === true ) {
					
					// snap rotation on next update
					
					rigidBody.rotateSnapOnNextUpdate = true;
					
					// bodies
					
					if ( index === -1 ) {
						
						this.bodies.push( rigidBody );
						
					}
					
					// gravity bodies
					
					if ( rigidBody.gravitySource === true ) {
					
						index = main.index_of_value( this.bodiesGravity, rigidBody );
						
						if ( index === -1 ) {
							
							this.bodiesGravity.push( rigidBody );
							
							rigidBody.mesh.morphs.play( 'idle', { loop: true, startDelay: true } );
							
						}
						
					}
					
					// dynamic body
					
					if ( rigidBody.dynamic === true ) {
						
						index = main.index_of_value( this.bodiesDynamic, rigidBody );
						
						if ( index === -1 ) {
							
							this.bodiesDynamic.push( rigidBody );
							
						}
						
					}
					// static colliders in octree and split by faces if collider is mesh
					else {
						
						this.octree.add( object, collider instanceof _RayHelper.MeshCollider ? true : false );
						
					}
					
				}
				// default to remove
				else {
					
					// bodies
					
					if ( index !== -1 ) {
						
						this.bodies.splice( index, 1 );
						
					}
					
					// gravity bodies
					
					if ( rigidBody.gravitySource === true ) {
					
						index = main.index_of_value( this.bodiesGravity, rigidBody );
						
						if ( index === -1 ) {
							
							this.bodiesGravity.splice( index, 1 );
							
						}
						
					}
					
					// dynamic colliders
					
					if ( rigidBody.dynamic === true ) {
						
						index = main.index_of_value( this.bodiesDynamic, rigidBody );
						
						if ( index !== -1 ) {
							
							this.bodiesDynamic.splice( index, 1 );
							
						}
						
					}
					// static colliders in octree
					else {
						
						this.octree.remove( object );
						
					}
					
				}
				
			}
			
			// search for physics in children
			
			if ( typeof object.children !== 'undefined' ) {
				
				for ( i = 0, l = object.children.length; i < l; i++ ) {
					
					child = object.children[ i ];
					
					this.modify_bodies( child, adding );
					
				}
				
			}
			
		}
		
	}
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update ( timeDelta, timeDeltaMod ) {
		
		var i, l,
			j, k,
			rigidBody,
			mesh,
			gravityOrigin = this.utilVec31Update,
			gravityMagnitude = this.utilVec32Update,
			gravityUp = this.utilVec33Update,
			lerpDelta,
			velocityGravity,
			velocityMovement,
			safetynet;
		
		// dynamic bodies
		
		for ( i = 0, l = this.bodiesDynamic.length; i < l; i++ ) {
			
			rigidBody = this.bodiesDynamic[ i ];
			
			// properties
			
			mesh = rigidBody.mesh;
			
			velocityGravity = rigidBody.velocityGravity;
			
			velocityMovement = rigidBody.velocityMovement;
			
			safetynet = rigidBody.safetynet;
			
			gravityBody = rigidBody.gravityBody;
			
			// if has gravity body
			
			if ( gravityBody instanceof _RigidBody.Instance ) {
				
				gravityMesh = gravityBody.mesh;
				
				gravityOrigin.copy( gravityMesh.matrixWorld.getPosition() );
				
				gravityMagnitude.copy( rigidBody.gravityMagnitude || shared.universeGravityMagnitude );
				
			}
			// else use world gravity
			else {
				
				gravityOrigin.copy( shared.universeGravitySource );
				
				gravityMagnitude.copy( shared.universeGravityMagnitude );
				
			}
			
			// add non rotated gravity to gravity velocity
			
			gravityMagnitude.multiplyScalar( timeDeltaMod );
			
			velocityGravity.force.addSelf( gravityMagnitude );
			
			// rotate to stand on source
			
			if ( rigidBody.rotateSnapOnNextUpdate === true ) {
				
				lerpDelta = 1;
				rigidBody.rotateSnapOnNextUpdate = false;
				
			}
			else {
				
				lerpDelta = rigidBody.lerpDelta;
				
			}
			
			_PhysicsHelper.rotate_relative_to_source( mesh.quaternion, mesh.position, gravityOrigin, rigidBody.axes.up, rigidBody.axes.forward, lerpDelta, rigidBody );
			
			// movement velocity
			
			this.handle_velocity( rigidBody, velocityMovement );
			
			// find up direction and set relative rotation of gravity
			
			gravityUp.sub( mesh.position, gravityOrigin ).normalize();
			
			velocityGravity.relativeTo = gravityUp;
			
			// gravity velocity
			
			this.handle_velocity( rigidBody, velocityGravity );
			
			// update gravity body
			
			rigidBody.find_gravity_body( this.bodiesGravity, timeDelta );
			
			// post physics
			// TODO: correct safety net for octree and non-infinite rays
			
		}
		
	}
	
	/*===================================================
    
    velocity functions
    
    =====================================================*/
	
	function handle_velocity ( rigidBody, velocity ) {
		
		var mesh = rigidBody.mesh,
			position = mesh.position,
			force = velocity.force,
			forceLength,
			forceRotated,
			forceScalar,
			damping = velocity.damping,
			boundingRadius,
			intersection,
			intersectionDist;
		
		if ( rigidBody.dynamic !== true || velocity.lockedUntilChanged === true || force.isZero() === true ) {
			
			velocity.moving = false;
			
			return;
			
		} 
		else {
			
			velocity.moving = true;
			
		}
		
		// get length
		
		forceLength = force.length();
		
		// make velocity relative
		
		velocity.update();
		forceRotated = velocity.forceRotated;
		
		// get bounding radius
		//boundingRadius = rigidBody.radius;
		
		// get bounding radius in direction of velocity
		// more accurate than plain radius, but about 4x more cost
		boundingRadius = rigidBody.bounds_in_direction( forceRotated ).length();
		
		// get intersection
		
		intersection = _RayHelper.raycast( {
			octree: this.octree,
			origin: position,
			direction: forceRotated,
			offsets: velocity.offsetsRotated,
			far: forceLength + boundingRadius,
			ignore: mesh
		} );
		
		// modify velocity based on intersection distances to avoid passing through or into objects
		
		if ( intersection ) {
			
			velocity.intersection = intersection;
			
			intersectionDist = intersection.distance;
			
			// set the rotated velocity to be no more than intersection distance
			
			if ( intersectionDist - forceLength <= boundingRadius ) {
				
				forceScalar = ( intersectionDist - boundingRadius ) / forceLength;
				
				forceRotated.multiplyScalar( forceScalar );
				//console.log( ' > intersection too close: intersectionDist', intersectionDist, ' forceScalar ', forceScalar );
				velocity.moving = false;
				
				velocity.collision = intersection;
				
			}
			
		}
		else {
			
			velocity.intersection = false;
			velocity.collision = false;
			
		}
		
		// add velocity to position
		
		position.addSelf( forceRotated );
		
		// damp velocity
		
		force.multiplySelf( damping );
		
		// if velocity low enough, set zero
		
		if ( force.length() < 0.01 ) {
			force.multiplyScalar( 0 );
		}
		
		// return intersection
		
		return intersection;
	}
	
} ( OGSUS ) );