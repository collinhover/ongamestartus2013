/*
 *
 * CameraControls.js
 * Adds additional functionality to basic camera.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/core/CameraControls.js",
		_CameraControls = {},
		_ObjectHelper,
		_MathHelper,
		_VectorHelper,
		_PhysicsHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _CameraControls,
		requirements: [
			"js/game/utils/ObjectHelper.js",
			"js/game/utils/MathHelper.js",
			"js/game/utils/VectorHelper.js",
			"js/game/utils/PhysicsHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
	internal init
    
    =====================================================*/
	
	function init_internal ( oh, mh, vh, ph ) {
		console.log('internal cameracontrols');
		// assets
		
		_ObjectHelper = oh;
		_MathHelper = mh;
		_VectorHelper = vh;
		_PhysicsHelper = ph;
		
		// instance
		
		_CameraControls.Instance = CameraControls;
		_CameraControls.Instance.prototype.zoom = zoom;
		_CameraControls.Instance.prototype.update = update;
		
		Object.defineProperty( _CameraControls.Instance.prototype, 'camera', { 
			get : function () { return this._camera; },
			set : function ( newCamera ) {
				
				if ( typeof newCamera !== 'undefined' ) {
					
					this._camera = newCamera;
					
					this.camera.useQuaternion = true;
					this.camera.quaternion.setFromRotationMatrix( this.camera.matrix );
					
				}
				
			}
		});
		
	}
	
	/*===================================================
    
	external init
    
    =====================================================*/
	
	function CameraControls ( camera, target ) {
		
		var pRot,
			pPos;
		
		// utility
		
		this.utilVec31Update = new THREE.Vector3();
		this.utilVec32Update = new THREE.Vector3();
		this.utilVec33Update = new THREE.Vector3();
		this.utilQ31Update = new THREE.Quaternion();
		this.utilQ32Update = new THREE.Quaternion();
		
		// properties
		
		this.camera = camera;
		this.target = this.targetLast = target;
		
		this.position = new THREE.Vector3();
		this.quaternion = new THREE.Quaternion();
		
		this.up = shared.cardinalAxes.up.clone();
		this.forward = shared.cardinalAxes.forward.clone();
		
		this.cameraLerpDelta = 0.1;
		this.cameraLerpDeltaWhenNew = 0;
		this.cameraLerpDeltaWhenNewGrow = 0.02;
		
		this.positionOffsetBoundRadiusMod = 1.5;
		this.positionOffsetBase = new THREE.Vector3( 0, 50, 550 );
		this.positionOffset = new THREE.Vector3();
		this.positionOffsetMin = new THREE.Vector3( 0, 50, 200 );
		this.positionOffsetMax = new THREE.Vector3( 0, 50, 1200 );
		this.positionOffsetDelta = new THREE.Vector3();
		this.positionOffsetDeltaMin = new THREE.Vector3( -40, -40, -40 );
		this.positionOffsetDeltaMax = new THREE.Vector3( 40, 40, 40 );
		this.positionOffsetDeltaSpeedMin = 0.1;
		this.positionOffsetDeltaSpeedMax = 0.3;
		this.positionOffsetDeltaDecay = 0.7;
		
		this.rotationOffset = new THREE.Vector3( -Math.PI * 0.2, 0, 0 );
		
		this.distanceThresholdPassed = false;
		this.distanceThresholdMin = 1;
		this.distanceThresholdPct = 0.35;
		this.distanceThresholdMax = this.positionOffset.length() * this.distanceThresholdPct;
		this.distanceSpeedPctMax = 0.25;
		this.distanceSpeedPctMin = 0.01;
		this.distanceSpeedPctAlphaGrow = 0.025;
		this.distanceSpeedPctAlphaShrink = 0.1;
		this.distanceSpeedPctWhenNew = 0;
		this.distanceSpeedPctWhenNewGrow = 0.0005;
		this.distanceSpeedPct = this.distanceSpeedPctMin;
		this.distanceSpeed = 0;
		this.distanceNormal = new THREE.Vector3();
		this.distanceMagnitude = new THREE.Vector3();
		
	}
	
	/*===================================================
	
	zoom
	
	=====================================================*/
	
	function zoom ( e ) {
		
		var eo = e.originalEvent || e,
			wheelDelta = eo.wheelDelta,
			positionOffset = this.positionOffset,
			positionOffsetMin = this.positionOffsetMin,
			positionOffsetMax = this.positionOffsetMax,
			positionOffsetDeltaMin = this.positionOffsetDeltaMin,
			positionOffsetDeltaMax = this.positionOffsetDeltaMax,
			positionOffsetDelta = this.positionOffsetDelta,
			positionOffsetDeltaSpeedMin = this.positionOffsetDeltaSpeedMin,
			positionOffsetDeltaSpeedMax = this.positionOffsetDeltaSpeedMax,
			positionOffsetPctToMin = (positionOffset.z - positionOffsetMin.z) / ( positionOffsetMax.z - positionOffsetMin.z ),
			positionOffsetDeltaSpeed;
		
		// set new zoom delta
		
		positionOffsetDeltaSpeed = positionOffsetDeltaSpeedMin * ( 1 - positionOffsetPctToMin ) + positionOffsetDeltaSpeedMax * positionOffsetPctToMin;
		
		positionOffsetDelta.z = _MathHelper.clamp( positionOffsetDelta.z - wheelDelta * positionOffsetDeltaSpeed, positionOffsetDeltaMin.z, positionOffsetDeltaMax.z );
		
	}
	
	/*===================================================
	
	update
	
	=====================================================*/
	
	function update () {
		
		var target = this.target,
			scale,
			rigidBody,
			gravityBody,
			gravityMesh,
			upReferencePosition,
			distance,
			distanceDiff,
			distanceSpeedMod,
			distanceSpeedPctAlphaGrow,
			distanceSpeedPctAlphaShrink,
			qToNew,
			positionOffsetBase = this.positionOffsetBase,
			positionOffset = this.positionOffset,
			positionOffsetMin = this.positionOffsetMin,
			positionOffsetMax = this.positionOffsetMax,
			positionOffsetDelta = this.positionOffsetDelta,
			positionOffsetScaled = this.utilVec31Update,
			rotationOffsetQ = this.utilQ31Update.setFromEuler( this.rotationOffset ).normalize(),
			cameraQTarget = this.utilQ32Update,
			cameraLerpDelta = this.cameraLerpDelta;
		
		// update position offset
		
		positionOffsetBase.addSelf( positionOffsetDelta );
		_VectorHelper.clamp( positionOffsetBase, positionOffsetMin, positionOffsetMax );
		positionOffset.copy( positionOffsetBase );
		
		if ( target instanceof THREE.Object3D !== true ) {
			
			positionOffsetScaled.copy( positionOffset );
			
		}
		else {
			
			scale = Math.max( target.scale.x, target.scale.y, target.scale.z );
			rigidBody = target.rigidBody;
			gravityBody = target.gravityBody;
			/*
			// make sure camera and target parents are same
			
			if ( this.camera.parent !== target.parent ) {
				
				target.parent.add( this.camera );
				
			}
			*/
			// first time target is new
			
			if ( this.targetNew !== true && target !== this.targetLast ) {
				
				this.targetNew = true;
				this.distanceSpeedPctWhenNew = 0;
				this.cameraLerpDeltaWhenNew = 0;
				
				if ( typeof this.targetLast !== 'undefined' ) {
					
					positionOffsetScaled.set( 0, 0, this.targetLast.boundRadius * this.positionOffsetBoundRadiusMod ).multiplyScalar( scale );
					this.camera.quaternion.multiplyVector3( positionOffsetScaled );
					
					this.position.addSelf( positionOffsetScaled );
					
				}
					
			}
			
			// get distance to target position
			
			distance = _VectorHelper.distance_to( this.position, target.position );
			
			// get scaled position offset
			
			if( this.targetNew !== true ) {
				
				positionOffset.z += target.boundRadius * this.positionOffsetBoundRadiusMod;
				
			}
			else if ( distance - this.distanceThresholdMin <= this.distanceThresholdMax ) {
				
				this.targetNew = false;
				this.targetLast = target;
				this.distanceThresholdPassed = true;
				
			}
			
			positionOffsetScaled.copy( positionOffset ).multiplyScalar( scale );
			
			// decay position offset delta
			
			positionOffsetDelta.multiplyScalar( this.positionOffsetDeltaDecay );
			
			// handle distance
			
			if ( distance > this.distanceThresholdMin ) {
				
				// update threshold max based on position offset
				
				this.distanceThresholdMax = positionOffsetScaled.length() * this.distanceThresholdPct;
				
				// if greater than max threshold, move with target at max distance
				
				if ( this.targetNew !== true && distance - this.distanceThresholdMin > this.distanceThresholdMax ) {
					
					distanceDiff = distance - this.distanceThresholdMax;
					
					// change flag
					
					this.distanceThresholdPassed = true;
					
					// update speed
					
					this.distanceSpeed = Math.max( this.distanceSpeed, distanceDiff );
					
				}
				// if distance threshold not yet passed, slow movement while target moving, speed up when stopped
				else if ( this.distanceThresholdPassed === false ) {
					
					// get speed pct
					
					if ( target.moving === true ) {
						
						this.distanceSpeedPct += ( this.distanceSpeedPctMin - this.distanceSpeedPct ) * this.distanceSpeedPctAlphaShrink;
						
					}
					else {
						
						if ( this.targetNew === true ) {
							
							distanceSpeedPctAlphaGrow = this.distanceSpeedPctWhenNew;
							this.distanceSpeedPctWhenNew = Math.min( this.distanceSpeedPctAlphaGrow, this.distanceSpeedPctWhenNew + this.distanceSpeedPctWhenNewGrow );
							
						}
						else {
							
							distanceSpeedPctAlphaGrow = this.distanceSpeedPctAlphaGrow;
							
						}
						
						this.distanceSpeedPct += ( this.distanceSpeedPctMax - this.distanceSpeedPct ) * distanceSpeedPctAlphaGrow;
						
					}
					
					// update speed
					
					this.distanceSpeed = Math.max( this.distanceSpeed, distance * this.distanceSpeedPct );
					
				}
				
				// get speed modifier
				
				distanceSpeedMod = Math.min( 1, distance / Math.max( this.distanceSpeed, this.distanceThresholdMax ) );
				
				// normal / magnitude to target
				console.log( 'this.distanceSpeed', this.distanceSpeed );
				this.distanceNormal.sub( target.position, this.position ).normalize();
				this.distanceMagnitude.copy( this.distanceNormal ).multiplyScalar( this.distanceSpeed * distanceSpeedMod );
				
				// update position
				
				this.position.addSelf( this.distanceMagnitude );
				
			}
			// reset position variables
			else if ( this.distanceThresholdPassed !== false ) {
				
				this.position.copy( target.position );
				this.distanceSpeed = 0;
				this.distanceThresholdPassed = false;
				
			}
			
			// handle gravity body
			
			if ( typeof gravityBody === 'undefined' && rigidBody && rigidBody.gravitySource === true ) {
				
				gravityBody = rigidBody;
				
			}
			
			if ( gravityBody ) {
				
				gravityMesh = gravityBody.mesh;
				upReferencePosition = gravityMesh.matrixWorld.getPosition();
				
			}
			else {
				
				upReferencePosition = shared.universeGravitySource;
				
			}
			
			// rotate quaternion and up/forward
			
			qToNew = _PhysicsHelper.rotate_relative_to_source ( this.quaternion, this.position, upReferencePosition, this.up, this.forward, 1, true );
			
		}
		
		// get camera target rotation
		
		cameraQTarget.copy( this.quaternion );
		
		if ( target && target.turn instanceof THREE.Quaternion ) {
			
			cameraQTarget.multiplySelf( target.turn );
			
		}
		
		cameraQTarget.multiplySelf( rotationOffsetQ );
		
		// lerp camera rotation to target
		
		if ( this.targetNew === true ) {
			
			cameraLerpDelta = this.cameraLerpDeltaWhenNew;
			this.cameraLerpDeltaWhenNew = Math.min( this.cameraLerpDelta, this.cameraLerpDeltaWhenNew + ( this.cameraLerpDelta - this.cameraLerpDeltaWhenNew ) * this.cameraLerpDeltaWhenNewGrow );
			
		}
		
		_VectorHelper.lerp_normalized( this.camera.quaternion, cameraQTarget, cameraLerpDelta );
		
		// adjust position
		
		this.camera.quaternion.multiplyVector3( positionOffsetScaled );
		
		// apply position
		
		this.camera.position.copy( this.position ).addSelf( positionOffsetScaled );
		
	}
	
} ( OGSUS ) );