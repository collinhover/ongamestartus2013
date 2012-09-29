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
    	
    }
	
	function show () {
		
		// temp
		
		var temp1 = new _Model.Instance( {
			geometry: new THREE.CubeGeometry( 200, 50, 200 ),
			material: new THREE.MeshLambertMaterial( { color: 0x555555, ambient: 0xAAAAAA } ),
			physics: {
				bodyType: 'mesh'
			}
		} );
		temp1.position.set( 200, 1450, 200 );
		this.add( temp1 );
		
		var temp2 = new _Model.Instance( {
			geometry: new THREE.CubeGeometry( 200, 100, 200 ),
			material: new THREE.MeshLambertMaterial( { color: 0x555555, ambient: 0xAAAAAA } ),
			physics: {
				bodyType: 'mesh'
			}
		} );
		temp2.position.set( 250, 1450, 250 );
		this.add( temp2 );
		
		var temp3 = new _Model.Instance( {
			geometry: new THREE.CubeGeometry( 200, 150, 200 ),
			material: new THREE.MeshLambertMaterial( { color: 0x555555, ambient: 0xAAAAAA } ),
			physics: {
				bodyType: 'mesh'
			}
		} );
		temp3.position.set( 200, 1450, 250 );
		this.add( temp3 );
		
		
		main.scene.add( this );
		
		main.sceneBG.add( this.skybox );
		
	}
	
	function hide () {
		
		main.scene.remove( this );
		
		main.sceneBG.remove( this.skybox );
		
	}
	
} ( OGSUS ) );