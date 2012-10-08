/*
 *
 * World.js
 * Generates worlds.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/env/World.js",
		_World = {},
		_Model,
		_Skybox;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _World,
		requirements: [
			"js/game/core/Model.js",
			"js/game/env/Skybox.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, sb ) {
		console.log('internal world');
		
		// utils
		
		_Model = m;
		_Skybox = sb;
		
		// instance
		
		_World.Instance = World;
		_World.Instance.prototype = new _Model.Instance();
		_World.Instance.prototype.constructor = _World.Instance;
		
		_World.Instance.prototype.show = show;
		_World.Instance.prototype.hide = hide;
		
	}
	
	/*===================================================
    
    world
    
    =====================================================*/
    
    function World ( parameters ) {
		
		var i, l,
			light;
    	
    	// handle parameters
		
		parameters = parameters || {};
		parameters.geometry = parameters.geometry instanceof THREE.Geometry ? parameters.geometry : new THREE.SphereGeometry( 1500, 20, 20 );
		parameters.material = parameters.material instanceof THREE.Material ? parameters.material : new THREE.MeshLambertMaterial( {color: 0x10C266, ambient: 0x4FFFA4 } );
    	
		parameters.physics = parameters.physics || {
			bodyType: 'mesh',
			gravitySource: true
		};
		
    	// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// lights
		
		this.lights = parameters.lights || [];
		
		if ( this.lights.length === 0 ) {
			
			this.lights.push( new THREE.AmbientLight( 0x555555 ) );
			
			light = new THREE.PointLight( 0xffffff, 1 );
			light.position.set( 0, 3000, 0 );
			this.lights.push( light );
			
		}
		
		for( i = 0, l = this.lights.length; i < l; i++ ) {
			
			light = this.lights[ i ];
			this.add( light );
			
		}
		
		// skybox
		
		this.skybox = parameters.skybox instanceof _Skybox.Instance ? parameters.skybox : new _Skybox.Instance( shared.pathToTextures + ( typeof parameters.skybox === 'string' ? parameters.skybox : "skybox_world" ) );
		
		
		
		
		
		// random shapes
		
		var numShapes = 60,
			points = THREE.GeometryUtils.randomPointsInGeometry( this.geometry, numShapes ),
			shapeSizeMin = 50,
			shapeSize = 600,
			shape;
		
		for ( i = 0, l = 30; i < l; i++ ) {
			
			shape = new _Model.Instance( {
				geometry: new THREE.CubeGeometry( shapeSizeMin + Math.random() * shapeSize, shapeSizeMin + Math.random() * shapeSize, shapeSizeMin + Math.random() * shapeSize ),
				material: new THREE.MeshLambertMaterial( { color: 0x555555, ambient: 0xAAAAAA } ),
				physics: {
					bodyType: 'mesh'
				}
			} );
			
			this.add( shape );
			
			shape.position.set( points[ i ].x, points[ i ].y, points[ i ].z );
			shape.quaternion.setFromEuler( new THREE.Vector3( Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI ) );
				
		}
		
		// secondary gravity source
		
		var moon = new _Model.Instance( {
			geometry: new THREE.SphereGeometry( 200, 10, 10 ),
			material: new THREE.MeshLambertMaterial( { color: 0xAAAAAA, ambient: 0xEEEEEE } ),
			physics: {
				bodyType: 'mesh',
				gravitySource: true
			}
		} );
		moon.position.set( 1000, 2000, 1000 );
		this.add( moon );
		
		var moonRock = new _Model.Instance( {
			geometry: new THREE.CubeGeometry( 150, 150, 150 ),
			material: new THREE.MeshLambertMaterial( { color: 0xAAAAAA, ambient: 0xEEEEEE } ),
			physics: {
				bodyType: 'mesh'
			}
		} );
		moonRock.position.set( 0, 150, 0 );
		moonRock.quaternion.setFromEuler( new THREE.Vector3( 45, 0, 45 ) );
		moon.add( moonRock );
		
		
		
		
		
    	
    }
	
	function show () {
		
		main.scene.add( this );
		
		main.sceneBG.add( this.skybox );
		
	}
	
	function hide () {
		
		main.scene.remove( this );
		
		main.sceneBG.remove( this.skybox );
		
	}
	
} ( OGSUS ) );