(function(e){function l(b){this.rigidBody=b;this.normal=new THREE.Vector3}function p(b,a,c){l.call(this,b);this.point=a;this.normal.copy(c)}function q(b,a,c){l.call(this,b);this.center=a;this.radius=c;this.radiusSq=c*c}function n(b,a,c){l.call(this,b);this.min=a;this.max=c}function u(b){var a=b.geometry,c=b.object||b,d;a.boundingBox||a.computeBoundingBox();d=a.boundingBox;a=d.min.clone();d=d.max.clone();n.call(this,b,a,d);this.min.addSelf(c.position);this.max.addSelf(c.position)}function r(b){var a=
b.geometry,c;a.boundingBox||a.computeBoundingBox();c=a.boundingBox;a=c.min.clone();c=c.max.clone();n.call(this,b,a,c)}function s(b,a){l.call(this,b);this.box=a||new r(this.rigidBody)}function t(b,a){var c,h,f,m,i,g,k,j;this.utilVec31Dimensions=new THREE.Vector3;this.utilVec31GravityBody=new THREE.Vector3;this.utilVec32GravityBody=new THREE.Vector3;this.utilVec33GravityBody=new THREE.Vector3;this.utilVec34GravityBody=new THREE.Vector3;this.utilVec35GravityBody=new THREE.Vector3;this.utilVec36GravityBody=
new THREE.Vector3;this.utilVec31Bounds=new THREE.Vector3;this.utilQ1Bounds=new THREE.Quaternion;a=a||{};this.id=C++;this.object=b;this.geometry=a.geometry||this.object.geometry;c=this.object.position;i=a.width;g=a.height;k=a.depth;e.is_number(i)===!1&&(f=!0);e.is_number(g)===!1&&(m=!0);e.is_number(k)===!1&&(j=!0);if(f===!0||m===!0||j===!0){h=v.dimensions(this.object);if(f===!0)i=h.x;if(m===!0)g=h.y;if(j===!0)k=h.z}this.mass=a.mass||i*g*k;h=a.bodyType;h==="mesh"?this.collider=new s(this):h==="sphere"?
(h=Math.max(i,g,k)*0.5,this.collider=new q(this,c,h)):this.collider=h==="plane"?new p(this,c,a.normal||new THREE.Vector3(0,0,1)):new r(this);this.radius=this.collider_radius();this.radiusCore=0;f=this.geometry.vertices;for(c=0,h=f.length;c<h;c++)m=f[c],this.radiusCore+=m.length();this.radiusCore/=f.length;e.is_number(a.radiusGravityAddition)?(this.radiusGravityAddition=a.radiusGravityAddition,this.radiusGravityScaled=!1):(c=e.is_number(a.gravityBodyRadiusAdditionPct)?a.gravityBodyRadiusAdditionPct:
d.gravityBodyRadiusAdditionPct,this.radiusGravityAddition=this.radiusCore*c,this.radiusGravityScaled=!0);a.hasOwnProperty("dynamic")?this.dynamic=a.dynamic:(this.mass=0,this.dynamic=!1);this.gravitySource=typeof a.gravitySource==="boolean"?a.gravitySource:!1;this.gravityChildren=[];if(a.gravityMagnitude instanceof THREE.Vector3)this.gravityMagnitude=a.gravityMagnitude;this.gravityBodyChangeDelayTime=this.gravityBodyChangeTime=0;this.gravityBodyChangeDelayTimeMax=e.is_number(a.gravityBodyChangeDelayTimeMax)?
a.gravityBodyChangeDelayTimeMax:d.gravityBodyChangeDelayTimeMax;this.gravityBodyChangeGravityProjectionMod=e.is_number(a.gravityBodyChangeGravityProjectionMod)?a.gravityBodyChangeGravityProjectionMod:d.gravityBodyChangeGravityProjectionMod;this.gravityBodyChangeMovementProjectionMod=e.is_number(a.gravityBodyChangeMovementProjectionMod)?a.gravityBodyChangeMovementProjectionMod:d.gravityBodyChangeMovementProjectionMod;this.gravityBodyChangeForceMod=e.is_number(a.gravityBodyChangeForceMod)?a.gravityBodyChangeForceMod:
d.gravityBodyChangeForceMod;this.gravityBodyChangeMagnitude=a.gravityBodyChangeMagnitude instanceof THREE.Vector3?a.gravityBodyChangeMagnitude:d.gravityBodyChangeMagnitude.clone();this.gravityBodyChangeLerpDeltaTimeMax=e.is_number(a.gravityBodyChangeLerpDeltaTimeMax)?a.gravityBodyChangeLerpDeltaTimeMax:d.gravityBodyChangeLerpDeltaTimeMax;this.gravityBodyChangeMagnitudeTimeMax=e.is_number(a.gravityBodyChangeMagnitudeTimeMax)?a.gravityBodyChangeMagnitudeTimeMax:d.gravityBodyChangeMagnitudeTimeMax;this.lerpDeltaLast=
this.lerpDelta=e.is_number(a.lerpDelta)?a.lerpDelta:d.lerpDelta;this.lerpDeltaGravityChange=e.is_number(a.lerpDeltaGravityChange)?a.lerpDeltaGravityChange:d.lerpDeltaGravityChange;this.axes={up:w.cardinalAxes.up.clone(),forward:w.cardinalAxes.forward.clone(),right:w.cardinalAxes.right.clone()};h=a.volumetric;c=a.movementOffsets;f=a.gravityOffsets;h===!0&&(c=e.is_number(a.movementOffsetPct)?a.movementOffsetPct:d.movementOffsetPct,h=e.is_number(a.gravityOffsetPct)?a.gravityOffsetPct:d.gravityOffsetPct,
c=c===0?[]:[new THREE.Vector3(-i*c,0,0),new THREE.Vector3(i*c,0,0),new THREE.Vector3(0,g*c,0)],f=h===0?[]:[new THREE.Vector3(-i*h,0,-k*h),new THREE.Vector3(i*h,0,-k*h),new THREE.Vector3(i*h,0,k*h),new THREE.Vector3(-i*h,0,k*h)]);this.velocityMovement=new x.Instance({rigidBody:this,relativeTo:this.object,offsets:c,options:{damping:a.movementDamping,dampingDecay:a.movementDampingDecay,collisionAngleThreshold:a.movementCollisionAngleThreshold,forceLengthMax:a.movementForceLengthMax}});this.velocityGravity=
new x.Instance({rigidBody:this,offsets:f,options:{damping:a.gravityDamping,dampingDecay:a.gravityDampingDecay,collisionAngleThreshold:a.gravityCollisionAngleThreshold||d.gravityCollisionAngleThreshold,forceLengthMax:a.gravityForceLengthMax}});this.safe=!0;this.safetynet={position:new THREE.Vector3,quaternion:new THREE.Quaternion};this.onSafetyNetStarted=new signals.Signal;this.onSafetyNetEnd=new signals.Signal}function D(b){var a={},b=b||this.object;this.collider instanceof s?a.bodyType="mesh":this.collider instanceof
q?a.bodyType="sphere":this.collider instanceof p?(a.bodyType="plane",a.normal=this.collider.normal.clone()):a.bodyType="box";a.dynamic=this.dynamic;a.mass=this.mass;a.movementDamping=this.velocityMovement.damping.clone();a.gravityDamping=this.velocityGravity.damping.clone();return new d.Instance(b,a)}function E(){var b=this.collider,a,c=this.utilVec31Dimensions;if(typeof b.min!=="undefined")a=b.min,b=b.max;else if(typeof b.box!=="undefined")a=b.box.min,b=b.box.max;else if(typeof b.radiusSq!=="undefined")a=
new THREE.Vector3,b=(new THREE.Vector3).addScalar(b.radiusSq);else return c.set(0,0,0);c.sub(b,a);return c}function F(){return this.collider_dimensions().multiplySelf(this.object.scale)}function G(){var b=this.collider_dimensions_scaled();return Math.max(b.x,b.y,b.z)*0.5}function H(b){var a=this.collider_dimensions_scaled().multiplyScalar(0.5).subSelf(v.center_offset(this.geometry)),c=this.utilVec31Bounds,d=this.utilQ1Bounds;d.copy(this.object.quaternion).inverse();c.copy(b).normalize();d.multiplyVector3(c);
a.multiplySelf(c);return z.rotate_relative_to(a,this.object)}function I(b,a){var c,d,f,m,i,g,k;i=this.utilVec31GravityBody;var j;j=this.velocityGravity;var e;c=this.velocityMovement;var l;d=this.utilVec34GravityBody;f=this.utilVec35GravityBody;m=this.object;var o=this.utilVec36GravityBody;e=j.collision;k=c.collision;if(e)g=e.object,g=y(g);if(k)k=k.object,l=y(k);if(l&&this.gravityBody!==l)this.change_gravity_body(l);else if(g&&this.gravityBody!==g)this.change_gravity_body(g);else if(this.gravityBodyChanging===
!0){this.gravityBodyChangeTime<this.gravityBodyChangeMagnitudeTimeMax?(j=Math.min(this.gravityBodyChangeTime/this.gravityBodyChangeLerpDeltaTimeMax,1),this.lerpDelta=this.lerpDeltaGravityChange*(1-j)+this.lerpDeltaLast*j):this.lerpDelta=this.lerpDeltaLast;if(this.gravityBodyChangeTime>=this.gravityBodyChangeMagnitudeTimeMax)this.gravityMagnitude=this.gravityMagnitudeLast;this.gravityBodyChangeTime+=a;if(this.grounded===!0)this.gravityBodyChanging=!1,this.lerpDelta=this.lerpDeltaLast,this.gravityMagnitude=
this.gravityMagnitudeLast}else if(this.grounded===!1&&(typeof m.jumping==="undefined"||m.jumping===!0)){if(j.forceRecentMax.lengthSq()<j.force.lengthSq()&&j.forceRecentMax.copy(j.force),c.forceRecentMax.lengthSq()<c.force.lengthSq()&&c.forceRecentMax.copy(c.force),this.gravityBodyChangeDelayTime+=a,this.gravityBodyChangeDelayTime>=this.gravityBodyChangeDelayTimeMax){this.gravityBodyChangeDelayTime=0;m.quaternion.multiplyVector3(d.copy(j.forceRecentMax).multiplyScalar(this.gravityBodyChangeGravityProjectionMod));
m.quaternion.multiplyVector3(f.copy(c.forceRecentMax).multiplyScalar(this.gravityBodyChangeMovementProjectionMod));o.copy(m.matrixWorld.getPosition()).addSelf(d).addSelf(f);f=[];m=[];for(c=0,d=b.length;c<d;c++)g=b[c],k=g.object,this.gravityBody===g?(f.push(g),m.push(g.object)):(i.sub(o,k.matrixWorld.getPosition()),i.length()<=g.radiusGravity&&(f.push(g),m.push(g.object)));i=this.find_gravity_body_closest(f,o);i instanceof t&&this.gravityBody!==i&&(this.change_gravity_body(i,!0),j.force.multiplyScalar(this.gravityBodyChangeForceMod))}}else j.forceRecentMax.set(0,
0,0),c.forceRecentMax.set(0,0,0)}function J(b,a){var c,d,f,e;c=this.object;var i,g,k,j,l=this.utilVec31GravityBody,n=Number.MAX_VALUE,o;if(b.length===1)i=b[0];else if(b.length>1){typeof a==="undefined"&&(a=c.matrixWorld.getPosition().clone());for(c=0,d=b.length;c<d;c++){g=b[c];f=g.object;k=A.extract_children_from_objects(f,f,K);for(f=0,e=k.length;f<e;f++)j=k[f],o=j.matrixWorld,l.sub(a,o.getPosition()),o=o.getMaxScaleOnAxis(),j=l.length()-j.boundRadius*o,j<n&&(i=g,n=j)}}return i}function K(b){return!(b.rigidBody&&
b.rigidBody.gravitySource!==!0)}function y(b,a){for(var c;b;){if(b.rigidBody&&b.rigidBody.gravitySource===!0&&(c=b.rigidBody,a!==!0))break;b=b.parent}return c}function L(b,a){var c=this.gravityBody;if(this.gravityBodyChanging!==!1)this.gravityBodyChanging=!1,this.lerpDelta=this.lerpDeltaLast,this.gravityMagnitude=this.gravityMagnitudeLast;this.gravityBody=b;if(this.gravityBody instanceof t){if(M.call(this.gravityBody,this),a===!0){this.lerpDeltaLast=this.lerpDelta;this.lerpDelta=this.lerpDeltaGravityChange;
if(this.gravityMagnitude instanceof THREE.Vector3)this.gravityMagnitudeLast=this.gravityMagnitude;this.gravityMagnitude=this.gravityBodyChangeMagnitude;this.gravityBodyChangeTime=0;this.gravityBodyChanging=!0}}else c instanceof t&&B.call(c,this)}function M(b){b.gravityBody instanceof t&&B.call(b.gravityBody,b);e.index_of_value(this.gravityChildren,b)===-1&&(this.gravityChildren.push(b),this.gravityChildren.length>0&&this.object.morphs.stop_all())}function B(b){b=e.index_of_value(this.gravityChildren,
b);b!==-1&&(this.gravityChildren.splice(b,1),this.gravityChildren.length===0&&this.object.morphs.play("idle",{loop:!0,startDelay:!0}))}var w=e.shared=e.shared||{},d={},x,z,v,A,C=0;e.asset_register("js/kaiopua/physics/RigidBody.js",{data:d,requirements:["js/kaiopua/physics/Velocity.js","js/kaiopua/utils/VectorHelper.js","js/kaiopua/utils/ObjectHelper.js","js/kaiopua/utils/SceneHelper.js"],callbacksOnReqs:function(b,a,c,e){x=b;z=a;v=c;A=e;d.movementOffsetPct=0.4;d.gravityOffsetPct=0.4;d.gravityCollisionAngleThreshold=
Math.PI*0.3;d.lerpDelta=0.1;d.lerpDeltaGravityChange=0;d.gravityBodyRadiusAdditionPct=1;d.gravityBodyChangeDelayTimeMax=250;d.gravityBodyChangeLerpDeltaTimeMax=500;d.gravityBodyChangeMagnitudeTimeMax=500;d.gravityBodyChangeGravityProjectionMod=10;d.gravityBodyChangeMovementProjectionMod=20;d.gravityBodyChangeForceMod=0.5;d.gravityBodyChangeMagnitude=new THREE.Vector3(0,-0.1,0);d.Collider=l;d.PlaneCollider=p;d.SphereCollider=q;d.BoxCollider=n;d.MeshCollider=s;d.ObjectColliderOBB=r;d.extract_parent_gravity_body=
y;d.Instance=t;d.Instance.prototype={};d.Instance.prototype.constructor=d.Instance;d.Instance.prototype.clone=D;d.Instance.prototype.collider_dimensions=E;d.Instance.prototype.collider_dimensions_scaled=F;d.Instance.prototype.collider_radius=G;d.Instance.prototype.bounds_in_direction=H;d.Instance.prototype.find_gravity_body=I;d.Instance.prototype.find_gravity_body_closest=J;d.Instance.prototype.change_gravity_body=L;Object.defineProperty(d.Instance.prototype,"grounded",{get:function(){return Boolean(this.velocityGravity.collision)&&
!this.velocityGravity.moving}});Object.defineProperty(d.Instance.prototype,"sliding",{get:function(){return this.velocityGravity.sliding}});Object.defineProperty(d.Instance.prototype,"collisions",{get:function(){return{gravity:this.velocityGravity.collision,movement:this.velocityMovement.collision}}});Object.defineProperty(d.Instance.prototype,"radiusGravity",{get:function(){var a=this.object.scale,a=Math.max(a.x,a.y,a.z),b=this.radiusCore*a;b+=this.radiusGravityScaled===!1?this.radiusGravityAddition:
this.radiusGravityAddition*a;return b}})},wait:!0});p.prototype=new l;p.prototype.constructor=p;q.prototype=new l;q.prototype.constructor=q;n.prototype=new l;n.prototype.constructor=n;u.prototype=new n;u.prototype.constructor=u;r.prototype=new n;r.prototype.constructor=r;s.prototype=new l;s.prototype.constructor=s})(KAIOPUA);
