/*
 *
 * RigidBody.js
 * Basic objects in physics world.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/physics/RigidBody.js",
		_RigidBody = {},
		_Velocity,
		_VectorHelper,
		_ObjectHelper,
		_SceneHelper,
		bodyCount = 0;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _RigidBody,
		requirements: [
			"js/kaiopua/physics/Velocity.js",
			"js/kaiopua/utils/VectorHelper.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/utils/SceneHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( vel, vh, oh, sh ) {
		
		_Velocity = vel;
		_VectorHelper = vh;
		_ObjectHelper = oh;
		_SceneHelper = sh;
		
		// properties
		
		_RigidBody.movementOffsetPct = 0.4;
		_RigidBody.gravityOffsetPct = 0.4;
		_RigidBody.gravityCollisionAngleThreshold = Math.PI * 0.3;
		_RigidBody.lerpDelta = 0.1;
		_RigidBody.lerpDeltaGravityChange = 0;
		_RigidBody.gravityBodyRadiusAdditionPct = 1;
		_RigidBody.gravityBodyChangeDelayTimeMax = 250;
		_RigidBody.gravityBodyChangeLerpDeltaTimeMax = 500;
		_RigidBody.gravityBodyChangeMagnitudeTimeMax = 500;
		_RigidBody.gravityBodyChangeGravityProjectionMod = 10;
		_RigidBody.gravityBodyChangeMovementProjectionMod = 20;
		_RigidBody.gravityBodyChangeForceMod = 0.5;
		_RigidBody.gravityBodyChangeMagnitude = new THREE.Vector3( 0, -0.1, 0 );
		
		// functions
		
		_RigidBody.Collider = Collider;
		_RigidBody.PlaneCollider = PlaneCollider;
		_RigidBody.SphereCollider = SphereCollider;
		_RigidBody.BoxCollider = BoxCollider;
		_RigidBody.MeshCollider = MeshCollider;
		_RigidBody.ObjectColliderOBB = ObjectColliderOBB;
		
		_RigidBody.extract_parent_gravity_body = extract_parent_gravity_body;
		
		// instance
		
		_RigidBody.Instance = RigidBody;
		_RigidBody.Instance.prototype = {};
		_RigidBody.Instance.prototype.constructor = _RigidBody.Instance;
		_RigidBody.Instance.prototype.clone = clone;
		
		_RigidBody.Instance.prototype.collider_dimensions = collider_dimensions;
		_RigidBody.Instance.prototype.collider_dimensions_scaled = collider_dimensions_scaled;
		_RigidBody.Instance.prototype.collider_radius = collider_radius;
		
		_RigidBody.Instance.prototype.bounds_in_direction = bounds_in_direction;
		
		_RigidBody.Instance.prototype.find_gravity_body = find_gravity_body;
		_RigidBody.Instance.prototype.find_gravity_body_closest = find_gravity_body_closest;
		_RigidBody.Instance.prototype.change_gravity_body = change_gravity_body;
		
		Object.defineProperty( _RigidBody.Instance.prototype, 'grounded', { 
			get : function () { return Boolean( this.velocityGravity.collision ) && !this.velocityGravity.moving; }
		});
		
		Object.defineProperty( _RigidBody.Instance.prototype, 'sliding', { 
			get : function () { return this.velocityGravity.sliding; }
		});
		
		Object.defineProperty( _RigidBody.Instance.prototype, 'collisions', { 
			get : function () { return { gravity: this.velocityGravity.collision, movement: this.velocityMovement.collision }; }
		});
		
		Object.defineProperty( _RigidBody.Instance.prototype, 'radiusGravity', { 
			get : function () {
				
				var scale = this.object.scale,
					scaleMax = Math.max( scale.x, scale.y, scale.z ),
					radiusGravity = this.radiusCore * scaleMax;
				
				if ( this.radiusGravityScaled === false ) {
					
					radiusGravity += this.radiusGravityAddition;
					
				}
				else {
					
					radiusGravity += this.radiusGravityAddition * scaleMax;
					
				}
				
				return radiusGravity;
				
			}
		});
		
	}
	
	/*===================================================
	
	colliders
	
	=====================================================*/
	
	function Collider ( rigidBody ) {
		
		this.rigidBody = rigidBody;
		this.normal = new THREE.Vector3();
		
	}

	function PlaneCollider ( rigidBody, point, normal ) {
		
		Collider.call( this, rigidBody );

		this.point = point;
		this.normal.copy( normal );

	}
	PlaneCollider.prototype = new Collider();
	PlaneCollider.prototype.constructor = PlaneCollider;

	function SphereCollider ( rigidBody, center, radius ) {
		
		Collider.call( this, rigidBody );

		this.center = center;
		this.radius = radius;
		this.radiusSq = radius * radius;

	}
	SphereCollider.prototype = new Collider();
	SphereCollider.prototype.constructor = SphereCollider;

	function BoxCollider ( rigidBody, min, max ) {
		
		Collider.call( this, rigidBody );

		this.min = min;
		this.max = max;

	}
	BoxCollider.prototype = new Collider();
	BoxCollider.prototype.constructor = BoxCollider;

	function ObjectColliderAABB ( rigidBody ) {
		
		var geometry = rigidBody.geometry,
			object = rigidBody.object || rigidBody,
			bbox,
			min,
			max;
		
		if ( !geometry.boundingBox ) {
			
			geometry.computeBoundingBox();
			
		}
		
		bbox = geometry.boundingBox;
		min = bbox.min.clone();
		max = bbox.max.clone();
		
		// proto
		
		BoxCollider.call( this, rigidBody, min, max );
		
		// add object position
		
		this.min.addSelf( object.position );
		this.max.addSelf( object.position );

	}
	ObjectColliderAABB.prototype = new BoxCollider();
	ObjectColliderAABB.prototype.constructor = ObjectColliderAABB;
	
	function ObjectColliderOBB ( rigidBody ) {
		
		var geometry = rigidBody.geometry,
			bbox,
			min,
			max;
		
		if ( !geometry.boundingBox ) {
			
			geometry.computeBoundingBox();
			
		}
		
		bbox = geometry.boundingBox;
		min = bbox.min.clone();
		max = bbox.max.clone();
		
		// proto
		
		BoxCollider.call( this, rigidBody, min, max );

	}
	ObjectColliderOBB.prototype = new BoxCollider();
	ObjectColliderOBB.prototype.constructor = ObjectColliderOBB;

	function MeshCollider ( rigidBody, box ) {
		
		Collider.call( this, rigidBody );
		
		this.box = box || new ObjectColliderOBB( this.rigidBody );
		
	}
	MeshCollider.prototype = new Collider();
	MeshCollider.prototype.constructor = MeshCollider;
	
	/*===================================================
    
    rigid body
    
    =====================================================*/
	
	function RigidBody ( object, parameters ) {
		
		var i, l,
			vertices,
			vertex,
			bboxDimensions,
			bodyType,
			width,
			height,
			depth,
			needWidth,
			needHeight,
			needDepth,
			radius,
			radiusAvg,
			position,
			volumetric,
			movementOffsets,
			gravityOffsets,
			movementOffsetPct,
			gravityOffsetPct,
			gravityBodyRadiusAdditionPct,
			gravityBodyRadiusAddition;
		
		// utility
		
		this.utilVec31Dimensions = new THREE.Vector3();
		this.utilVec31GravityBody = new THREE.Vector3();
		this.utilVec32GravityBody = new THREE.Vector3();
		this.utilVec33GravityBody = new THREE.Vector3();
		this.utilVec34GravityBody = new THREE.Vector3();
		this.utilVec35GravityBody = new THREE.Vector3();
		this.utilVec36GravityBody = new THREE.Vector3();
		this.utilVec31Bounds = new THREE.Vector3();
		this.utilQ1Bounds = new THREE.Quaternion();
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.id = bodyCount++;
		
		this.object = object;
		this.geometry = parameters.geometry || this.object.geometry;
		
		position = this.object.position;
		
		// physics width/height/depth
		
		width = parameters.width;
		
		height = parameters.height;
		
		depth = parameters.depth;
		
		if ( main.is_number( width ) === false ) {
			
			needWidth = true;
			
		}
		
		if ( main.is_number( height ) === false ) {
			
			needHeight = true;
			
		}
		
		if ( main.is_number( depth ) === false ) {
			
			needDepth = true;
			
		}
		
		if ( needWidth === true || needHeight === true || needDepth === true ) {
			
			// model bounding box
			
			bboxDimensions = _ObjectHelper.dimensions( this.object );
			
			if ( needWidth === true ) {
				
				width = bboxDimensions.x;
				
			}
			
			if ( needHeight === true ) {
				
				height = bboxDimensions.y;
			
			}
			
			if ( needDepth === true ) {
				
				depth = bboxDimensions.z;
				
			}
			
		}
		
		this.mass = parameters.mass || width * height * depth;
		
		// create collider by body type
		
		bodyType = parameters.bodyType;
		
		if ( bodyType === 'mesh' ) {
			
			this.collider = new MeshCollider( this );
			
		}
		else if ( bodyType === 'sphere' ) {
			
			radius = Math.max( width, height, depth ) * 0.5;
			
			this.collider = new SphereCollider( this, position, radius );
			
		}
		else if ( bodyType === 'plane' ) {
			
			this.collider = new PlaneCollider( this, position, parameters.normal || new THREE.Vector3( 0, 0, 1 ) );
			
		}
		// default box
		else {
			
			this.collider = new ObjectColliderOBB( this );
			
		}
		
		// radius
		
		this.radius = this.collider_radius();
		
		// radius average
		
		this.radiusCore = 0;
		
		vertices = this.geometry.vertices;
		
		for ( i = 0, l = vertices.length; i < l; i++ ) {
			
			vertex = vertices[ i ];
			
			this.radiusCore += vertex.length();
			
		}
		
		this.radiusCore = this.radiusCore / vertices.length;
		
		// radius gravity
		
		if ( main.is_number( parameters.radiusGravityAddition ) ) {
			
			this.radiusGravityAddition = parameters.radiusGravityAddition;
			this.radiusGravityScaled = false;
			
		}
		else {
			
			gravityBodyRadiusAdditionPct = main.is_number( parameters.gravityBodyRadiusAdditionPct ) ? parameters.gravityBodyRadiusAdditionPct : _RigidBody.gravityBodyRadiusAdditionPct;
			this.radiusGravityAddition = this.radiusCore * gravityBodyRadiusAdditionPct;
			this.radiusGravityScaled = true;
			
		}
		
		// dynamic or static, set mass to 0 for a static object
		
		if ( parameters.hasOwnProperty('dynamic') ) {
			
			this.dynamic = parameters.dynamic;
			
		}
		else {
			
			this.mass = 0;
			this.dynamic = false;
			
		}
		
		// gravity source
		
		this.gravitySource = typeof parameters.gravitySource === 'boolean' ? parameters.gravitySource : false;
		this.gravityChildren = [];
		
		// gravity magnitude
		
		if ( parameters.gravityMagnitude instanceof THREE.Vector3 ) {
			
			this.gravityMagnitude = parameters.gravityMagnitude;
			
		}
		
		// gravity body
		
		this.gravityBodyChangeTime = 0;
		this.gravityBodyChangeDelayTime = 0;
		this.gravityBodyChangeDelayTimeMax = main.is_number( parameters.gravityBodyChangeDelayTimeMax ) ? parameters.gravityBodyChangeDelayTimeMax : _RigidBody.gravityBodyChangeDelayTimeMax;
		
		this.gravityBodyChangeGravityProjectionMod = main.is_number( parameters.gravityBodyChangeGravityProjectionMod ) ? parameters.gravityBodyChangeGravityProjectionMod : _RigidBody.gravityBodyChangeGravityProjectionMod;
		this.gravityBodyChangeMovementProjectionMod = main.is_number( parameters.gravityBodyChangeMovementProjectionMod ) ? parameters.gravityBodyChangeMovementProjectionMod : _RigidBody.gravityBodyChangeMovementProjectionMod;
		this.gravityBodyChangeForceMod = main.is_number( parameters.gravityBodyChangeForceMod ) ? parameters.gravityBodyChangeForceMod : _RigidBody.gravityBodyChangeForceMod;
		this.gravityBodyChangeMagnitude = parameters.gravityBodyChangeMagnitude instanceof THREE.Vector3 ? parameters.gravityBodyChangeMagnitude : _RigidBody.gravityBodyChangeMagnitude.clone();
		
		this.gravityBodyChangeLerpDeltaTimeMax = main.is_number( parameters.gravityBodyChangeLerpDeltaTimeMax ) ? parameters.gravityBodyChangeLerpDeltaTimeMax : _RigidBody.gravityBodyChangeLerpDeltaTimeMax;
		this.gravityBodyChangeMagnitudeTimeMax = main.is_number( parameters.gravityBodyChangeMagnitudeTimeMax ) ? parameters.gravityBodyChangeMagnitudeTimeMax : _RigidBody.gravityBodyChangeMagnitudeTimeMax;
		
		// lerp delta
		
		this.lerpDeltaLast = this.lerpDelta = main.is_number( parameters.lerpDelta ) ? parameters.lerpDelta : _RigidBody.lerpDelta;
		this.lerpDeltaGravityChange = main.is_number( parameters.lerpDeltaGravityChange ) ? parameters.lerpDeltaGravityChange : _RigidBody.lerpDeltaGravityChange;
		
		// axes
		
		this.axes = {
			up: shared.cardinalAxes.up.clone(),
			forward: shared.cardinalAxes.forward.clone(),
			right: shared.cardinalAxes.right.clone()
		};
		
		// offsets for the illusion of volume
		
		volumetric = parameters.volumetric;
		movementOffsets = parameters.movementOffsets;
		gravityOffsets = parameters.gravityOffsets;
		
		if ( volumetric === true ) {
			
			movementOffsetPct = main.is_number( parameters.movementOffsetPct ) ? parameters.movementOffsetPct : _RigidBody.movementOffsetPct;
			gravityOffsetPct = main.is_number( parameters.gravityOffsetPct ) ? parameters.gravityOffsetPct : _RigidBody.gravityOffsetPct;
			
			movementOffsets = movementOffsetPct === 0 ? [] : [
				new THREE.Vector3( -width * movementOffsetPct, 0, 0 ), // left waist side
				new THREE.Vector3( width * movementOffsetPct, 0, 0 ), // right waist side
				new THREE.Vector3( 0, height * movementOffsetPct, 0 ) // near head
			];
			gravityOffsets = gravityOffsetPct === 0 ? [] : [
				new THREE.Vector3( -width * gravityOffsetPct, 0, -depth * gravityOffsetPct ),
				new THREE.Vector3( width * gravityOffsetPct, 0, -depth * gravityOffsetPct ),
				new THREE.Vector3( width * gravityOffsetPct, 0, depth * gravityOffsetPct ),
				new THREE.Vector3( -width * gravityOffsetPct, 0, depth * gravityOffsetPct )
			];
			
		}
		
		// velocity trackers
		
		this.velocityMovement = new _Velocity.Instance( { 
			rigidBody: this,
			relativeTo: this.object,
			offsets: movementOffsets,
			options: {
				damping: parameters.movementDamping,
				dampingDecay: parameters.movementDampingDecay,
				collisionAngleThreshold: parameters.movementCollisionAngleThreshold,
				forceLengthMax: parameters.movementForceLengthMax
			}
		} );
		
		this.velocityGravity = new _Velocity.Instance( { 
			rigidBody: this,
			offsets: gravityOffsets,
			options: {
				damping: parameters.gravityDamping,
				dampingDecay: parameters.gravityDampingDecay,
				collisionAngleThreshold: parameters.gravityCollisionAngleThreshold || _RigidBody.gravityCollisionAngleThreshold,
				forceLengthMax: parameters.gravityForceLengthMax
			}
		} );
		
		// safety net
		
		this.safe = true;
		this.safetynet = {
			position: new THREE.Vector3(),
			quaternion: new THREE.Quaternion()
		};
		this.onSafetyNetStarted = new signals.Signal();
		this.onSafetyNetEnd = new signals.Signal();
		
	}
	
	function clone ( object ) {
		
		var parameters = {};
		
		object = object || this.object;
		
		if ( this.collider instanceof MeshCollider ) {
			
			parameters.bodyType = 'mesh';
			
		}
		else if ( this.collider instanceof SphereCollider ) {
			
			parameters.bodyType = 'sphere';
			
		}
		else if ( this.collider instanceof PlaneCollider ) {
			
			parameters.bodyType = 'plane';
			parameters.normal = this.collider.normal.clone();
			
		}
		else {
			
			parameters.bodyType = 'box';
			
		}
		
		parameters.dynamic = this.dynamic;
		parameters.mass = this.mass;
		parameters.movementDamping = this.velocityMovement.damping.clone();
		parameters.gravityDamping = this.velocityGravity.damping.clone();
		
		return new _RigidBody.Instance( object, parameters );
		
	}
	
	/*===================================================
    
    collider properties
    
    =====================================================*/
	
	function collider_dimensions () {
		
		var collider = this.collider,
			colliderMin,
			colliderMax,
			dimensions = this.utilVec31Dimensions;
		
		// handle collider type
		
		if ( typeof collider.min !== 'undefined' ) {
			
			colliderMin = collider.min;
			colliderMax = collider.max;
			
		}
		else if ( typeof collider.box !== 'undefined' ) {
			
			colliderMin = collider.box.min;
			colliderMax = collider.box.max;
			
		}
		else if ( typeof collider.radiusSq !== 'undefined' ) {
			
			colliderMin = new THREE.Vector3();
			colliderMax = new THREE.Vector3().addScalar( collider.radiusSq );
			
		}
		// collider type not supported
		else {
			
			return dimensions.set( 0, 0, 0 );
			
		}
		
		dimensions.sub( colliderMax, colliderMin );
		
		return dimensions;
		
	}
	
	function collider_dimensions_scaled () {
		
		return this.collider_dimensions().multiplySelf( this.object.scale );
		
	}
	
	function collider_radius () {
		
		var dimensions = this.collider_dimensions_scaled();
		
		return Math.max( dimensions.x, dimensions.y, dimensions.z ) * 0.5;
		
	}
	
	/*===================================================
    
	utility
    
    =====================================================*/
	
	function bounds_in_direction ( direction ) {
		
		var boundsHalf = this.collider_dimensions_scaled().multiplyScalar( 0.5 ).subSelf( _ObjectHelper.center_offset( this.geometry ) ),//this.object ) ),
			localDirection = this.utilVec31Bounds,
			objectRotation = this.utilQ1Bounds;
		
		// get local direction
		// seems like extra unnecessary work
		// not sure if there is better way
		
		objectRotation.copy( this.object.quaternion ).inverse();
		
		localDirection.copy( direction ).normalize();
		
		objectRotation.multiplyVector3( localDirection );
		
		// set in direction
		
		boundsHalf.multiplySelf( localDirection );
		
		// rotate to match object
		
		return _VectorHelper.rotate_relative_to( boundsHalf, this.object );
		
	}
	
	/*===================================================
    
	gravity body find
    
    =====================================================*/
	
	function find_gravity_body ( gravityBodies, timeDelta, closest ) {
		
		var i, l,
			j, jl,
			gravityBodiesAttracting,
			gravityBodiesAttractingObjects,
			gravityBodiesAttractingObjectsExcludingCurrent,
			gravityBody,
			gravityBodyPotential,
			gravityBodyChildren,
			gravityBodyChild,
			gravityMesh,
			gravityBodyDifference = this.utilVec31GravityBody,
			gravityBodyDistancePotential,
			gravityBodyDistance = Number.MAX_VALUE,
			gravityBodyChangeLerpDeltaPct, 
			matrixWorld,
			matrixWorldElements,
			matrixWorldAxis = this.utilVec32GravityBody,
			matrixWorldScale = this.utilVec33GravityBody,
			matrixWorldScaleMax,
			velocityGravity = this.velocityGravity,
			velocityGravityCollision,
			velocityGravityCollisionObject,
			velocityGravityCollisionGravityBody,
			velocityMovement = this.velocityMovement,
			velocityMovementCollision,
			velocityMovementCollisionObject,
			velocityMovementCollisionGravityBody,
			velocityGravityRotatedProjected = this.utilVec34GravityBody,
			velocityMovementRotatedProjected = this.utilVec35GravityBody,
			object = this.object,
			objectPositionProjected = this.utilVec36GravityBody;
		
		// get velocity collisions
		
		velocityGravityCollision = velocityGravity.collision;
		velocityMovementCollision = velocityMovement.collision;
		
		// get velocity collision rigid bodies
		
		if ( velocityGravityCollision ) {
			velocityGravityCollisionObject = velocityGravityCollision.object;
			velocityGravityCollisionGravityBody = extract_parent_gravity_body( velocityGravityCollisionObject );
		}
		if ( velocityMovementCollision ) {
			velocityMovementCollisionObject = velocityMovementCollision.object;
			velocityMovementCollisionGravityBody = extract_parent_gravity_body( velocityMovementCollisionObject );
		}
		
		// attempt to change gravity body
		
		// movement collision with new gravity body
		if ( velocityMovementCollisionGravityBody && this.gravityBody !== velocityMovementCollisionGravityBody ) {
			
			this.change_gravity_body( velocityMovementCollisionGravityBody );
			
		}
		// gravity collision with new gravity body
		else if ( velocityGravityCollisionGravityBody && this.gravityBody !== velocityGravityCollisionGravityBody ) {
			
			this.change_gravity_body( velocityGravityCollisionGravityBody );
			
		}
		// currently changing gravity body
		else if ( this.gravityBodyChanging === true ) {
			
			// lerp delta while changing
			
			if ( this.gravityBodyChangeTime < this.gravityBodyChangeMagnitudeTimeMax ) {
				
				gravityBodyChangeLerpDeltaPct = Math.min( this.gravityBodyChangeTime / this.gravityBodyChangeLerpDeltaTimeMax, 1 );
				this.lerpDelta = this.lerpDeltaGravityChange * ( 1 - gravityBodyChangeLerpDeltaPct ) + this.lerpDeltaLast * gravityBodyChangeLerpDeltaPct;
			
			}
			else {
				
				this.lerpDelta = this.lerpDeltaLast;
				
			}
			
			// gravity magnitude while changing
			
			if ( this.gravityBodyChangeTime >= this.gravityBodyChangeMagnitudeTimeMax ) {
				
				this.gravityMagnitude = this.gravityMagnitudeLast;
				
			}
			
			this.gravityBodyChangeTime += timeDelta;
			
			// if grounded, end change
			
			if ( this.grounded === true ) {
				
				change_gravity_body_end.call( this );
				
			}
			
		}
		// else if not grounded and no movement property or is jumping ( i.e. characters must jump to trigger gravity change to avoid unexpected shift )
		else if ( this.grounded === false && ( typeof object.jumping === 'undefined' || object.jumping === true ) ) {
			
			// record maximum force values
			
			if ( velocityGravity.forceRecentMax.lengthSq() < velocityGravity.force.lengthSq() ) {
				
				velocityGravity.forceRecentMax.copy( velocityGravity.force );
				
			}
			if ( velocityMovement.forceRecentMax.lengthSq() < velocityMovement.force.lengthSq() ) {
				
				velocityMovement.forceRecentMax.copy( velocityMovement.force );
				
			}
			
			// delay time, so dynamic body does not get stuck between two close gravity bodies
		
			this.gravityBodyChangeDelayTime += timeDelta;
			
			// if delay over max
			
			if ( this.gravityBodyChangeDelayTime >= this.gravityBodyChangeDelayTimeMax ) {
				
				this.gravityBodyChangeDelayTime = 0;
				
				// project object position along combined rotated recent max velocity
				
				object.quaternion.multiplyVector3( velocityGravityRotatedProjected.copy( velocityGravity.forceRecentMax ).multiplyScalar( this.gravityBodyChangeGravityProjectionMod ) );
				object.quaternion.multiplyVector3( velocityMovementRotatedProjected.copy( velocityMovement.forceRecentMax ).multiplyScalar( this.gravityBodyChangeMovementProjectionMod ) );
				
				objectPositionProjected.copy( object.matrixWorld.getPosition() ).addSelf( velocityGravityRotatedProjected ).addSelf( velocityMovementRotatedProjected );
				
				// get all gravity bodies that overlap this with gravity radius
				
				gravityBodiesAttracting = [];
				gravityBodiesAttractingObjects = [];
				
				for ( i = 0, l = gravityBodies.length; i < l; i++ ) {
					
					gravityBodyPotential = gravityBodies[ i ];
					gravityMesh = gravityBodyPotential.object;
					
					// if is current gravity body
					
					if ( this.gravityBody === gravityBodyPotential ) {
						
						gravityBodiesAttracting.push( gravityBodyPotential );
						gravityBodiesAttractingObjects.push( gravityBodyPotential.object );
						
					}
					else {
						
						gravityBodyDifference.sub( objectPositionProjected, gravityMesh.matrixWorld.getPosition() );
						
						// if within gravity radius
						
						if ( gravityBodyDifference.length() <= gravityBodyPotential.radiusGravity ) {
							
							gravityBodiesAttracting.push( gravityBodyPotential );
							gravityBodiesAttractingObjects.push( gravityBodyPotential.object );
							
						}
						
					}
					
				}
				
				// find closest gravity body
				
				gravityBody = this.find_gravity_body_closest( gravityBodiesAttracting, objectPositionProjected );
				/*
				if ( gravityBodiesAttracting.length === 1 ) {
					
					gravityBody = gravityBodiesAttracting[ 0 ];
				
				}
				else if ( gravityBodiesAttracting.length > 1 ) {
					
					for ( i = 0, l = gravityBodiesAttracting.length; i < l; i++ ) {
						
						gravityBodyPotential = gravityBodiesAttracting[ i ];
						gravityMesh = gravityBodyPotential.object;
						
						// for each child of gravity body, excluding all attracting objects that are not this gravity object
						
						gravityBodiesAttractingObjectsExcludingCurrent = gravityBodiesAttractingObjects.slice( 0, i ).concat( gravityBodiesAttractingObjects.slice( i + 1 ) );
						
						gravityBodyChildren = _SceneHelper.extract_children_from_objects( gravityMesh, gravityMesh, gravityBodiesAttractingObjectsExcludingCurrent );
						
						for ( j = 0, jl = gravityBodyChildren.length; j < jl; j++ ) {
							
							gravityBodyChild = gravityBodyChildren[ j ];
							
							// child must be the gravity object or have a rigid body and not be a gravity source itself
							
							if ( gravityBodyChild === gravityMesh || ( gravityBodyChild.rigidBody && gravityBodyChild.rigidBody.gravitySource !== true ) ) {
								
								matrixWorld = gravityBodyChild.matrixWorld;
								
								// difference in position
								
								gravityBodyDifference.sub( objectPositionProjected, matrixWorld.getPosition() );
								
								// account for bounding radius of child scaled to world
								
								matrixWorldElements = matrixWorld.elements;

								matrixWorldScale.x = matrixWorldAxis.set( matrixWorldElements[0], matrixWorldElements[1], matrixWorldElements[2] ).length();
								matrixWorldScale.y = matrixWorldAxis.set( matrixWorldElements[4], matrixWorldElements[5], matrixWorldElements[6] ).length();
								matrixWorldScale.z = matrixWorldAxis.set( matrixWorldElements[8], matrixWorldElements[9], matrixWorldElements[10] ).length();
								matrixWorldScaleMax = Math.max( matrixWorldScale.x, matrixWorldScale.y, matrixWorldScale.z );
								
								gravityBodyDistancePotential = gravityBodyDifference.length() - ( gravityBodyChild.boundRadius * matrixWorldScaleMax );
								
								if ( gravityBodyDistancePotential < gravityBodyDistance ) {
									
									gravityBody = gravityBodyPotential;
									gravityBodyDistance = gravityBodyDistancePotential;
									
								}
								
							}
							
						}
						
					}
					
				}
				*/
				// swap to closest gravity body
				
				if ( gravityBody instanceof RigidBody && this.gravityBody !== gravityBody ) {
					
					this.change_gravity_body( gravityBody, true );
					
					velocityGravity.force.multiplyScalar( this.gravityBodyChangeForceMod );
					//velocityMovement.force.multiplyScalar( this.gravityBodyChangeForceMod );
					
				}
				
			}
			
		}
		else {
			
			velocityGravity.forceRecentMax.set( 0, 0, 0 );
			velocityMovement.forceRecentMax.set( 0, 0, 0 );
			
		}
		
	}
	
	function find_gravity_body_closest ( gravityBodies, fromPosition ) {
		
		var i, l,
			j, jl,
			object = this.object,
			gravityBody,
			gravityBodyPotential,
			gravityBodyChildren,
			gravityBodyChild,
			gravityObject,
			gravityBodyDifference = this.utilVec31GravityBody,
			gravityBodyDistancePotential,
			gravityBodyDistance = Number.MAX_VALUE,
			matrixWorld,
			matrixWorldScale;
		
		// find closest gravity body
		
		if ( gravityBodies.length === 1 ) {
			
			gravityBody = gravityBodies[ 0 ];
		
		}
		else if ( gravityBodies.length > 1 ) {
			
			if ( typeof fromPosition === 'undefined' ) {
				
				fromPosition = object.matrixWorld.getPosition().clone();
				
			}
			
			for ( i = 0, l = gravityBodies.length; i < l; i++ ) {
				
				gravityBodyPotential = gravityBodies[ i ];
				gravityObject = gravityBodyPotential.object;
				
				// extract all children of gravity body, exclude any children that are gravity sources themselves
				
				gravityBodyChildren = _SceneHelper.extract_children_from_objects( gravityObject, gravityObject, gravity_body_check );
				
				for ( j = 0, jl = gravityBodyChildren.length; j < jl; j++ ) {
					
					gravityBodyChild = gravityBodyChildren[ j ];
					
					matrixWorld = gravityBodyChild.matrixWorld;
					
					// difference in position
					
					gravityBodyDifference.sub( fromPosition, matrixWorld.getPosition() );
					
					// account for bounding radius of child scaled to world
					
					matrixWorldScale = matrixWorld.getMaxScaleOnAxis();
					gravityBodyDistancePotential = gravityBodyDifference.length() - ( gravityBodyChild.boundRadius * matrixWorldScale );
					
					if ( gravityBodyDistancePotential < gravityBodyDistance ) {
						
						gravityBody = gravityBodyPotential;
						gravityBodyDistance = gravityBodyDistancePotential;
						
					}
					
				}
				
			}
			
		}
		
		return gravityBody;
		
	}
	
	function gravity_body_check ( obj ) {
		return !( obj.rigidBody && obj.rigidBody.gravitySource !== true );
	}
	
	function extract_parent_gravity_body ( object, last ) {
		
		var gravityBody;
		
		while( object ) {
			
			if ( object.rigidBody && object.rigidBody.gravitySource === true ) {
				
				gravityBody = object.rigidBody;
				
				if ( last !== true ) {
					
					break;
					
				}
				
			}
			
			object = object.parent;
			
		}
		
		return gravityBody;
		
	}
	
	/*===================================================
    
	gravity body change
    
    =====================================================*/
	
	function change_gravity_body ( gravityBody, ease ) {
		
		var index,
			gravityBodyLast = this.gravityBody;
		
		// if in middle of change already
		
		if ( this.gravityBodyChanging !== false ) {
			
			change_gravity_body_end.call( this );
		
		}
		
		// new gravity body
		
		this.gravityBody = gravityBody;
		
		if ( this.gravityBody instanceof RigidBody ) {
			
			// add to body's gravity children
			
			add_gravity_child.call( this.gravityBody, this );
			
			// if should ease change
			
			if ( ease === true ) {
				
				this.lerpDeltaLast = this.lerpDelta;
				this.lerpDelta = this.lerpDeltaGravityChange;
				
				if ( this.gravityMagnitude instanceof THREE.Vector3 ) {
					
					this.gravityMagnitudeLast = this.gravityMagnitude;
					
				}
				this.gravityMagnitude = this.gravityBodyChangeMagnitude;
				this.gravityBodyChangeTime = 0;
				
				this.gravityBodyChanging = true;
				
			}
			
		}
		// remove from previous gravity body
		else if ( gravityBodyLast instanceof RigidBody ) {
			
			remove_gravity_child.call( gravityBodyLast, this );
			
		}
		
	}
	
	function change_gravity_body_end () {
		
		this.gravityBodyChanging = false;
		
		this.lerpDelta = this.lerpDeltaLast;
		this.gravityMagnitude = this.gravityMagnitudeLast;
		
	}
	
	/*===================================================
    
	gravity children
    
    =====================================================*/
	
	function add_gravity_child ( gravityChild ) {
		
		var index;
		
		// remove from previous gravity body
		
		if ( gravityChild.gravityBody instanceof RigidBody ) {
			
			remove_gravity_child.call( gravityChild.gravityBody, gravityChild );
			
		}
		
		// add to new
		
		index = main.index_of_value( this.gravityChildren, gravityChild );
		
		if ( index === -1 ) {
			
			this.gravityChildren.push( gravityChild );
			
			// if at least 1 child
			
			if ( this.gravityChildren.length > 0 ) {
				
				// stop all morphs
				
				this.object.morphs.stop_all();
				
			}
			
		}
		
	}
	
	function remove_gravity_child ( gravityChild ) {
		
		var index;
		
		index = main.index_of_value( this.gravityChildren, gravityChild );
		
		if ( index !== -1 ) {
			
			this.gravityChildren.splice( index, 1 );
			
			// if no children
			
			if ( this.gravityChildren.length === 0 ) {
				
				// play idle morph
				
				this.object.morphs.play( 'idle', { loop: true, startDelay: true } );
				
			}
			
		}
		
	}
	
} (KAIOPUA) );