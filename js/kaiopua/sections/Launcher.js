/*
 *
 * Launcher.js
 * Launcher section.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/sections/Launcher.js",
		_Launcher = {},
		_Model,
		_Player,
		_World,
		_Skybox,
		_ObjectHelper,
		_ObstacleSlippery,
		_ObstacleDamaging;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Launcher,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/core/Player.js",
			"js/kaiopua/env/World.js",
			"js/kaiopua/env/Skybox.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/physics/ObstacleSlippery.js",
			"js/kaiopua/physics/ObstacleDamaging.js",
            { path: shared.pathToAssets + "hero.js", type: 'model' },
            { path: shared.pathToAssets + "asteroid.js", type: 'model' },
			shared.pathToAssets + "skybox_world_posx.jpg",
            shared.pathToAssets + "skybox_world_negx.jpg",
			shared.pathToAssets + "skybox_world_posy.jpg",
            shared.pathToAssets + "skybox_world_negy.jpg",
			shared.pathToAssets + "skybox_world_posz.jpg",
            shared.pathToAssets + "skybox_world_negz.jpg"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, pl, w, sb, oh, obs, obd, heroGeometry, asteroidGeometry ) {
		console.log('internal Launcher', _Launcher);
		
		// assets
		
		_Model = m;
		_Player = pl;
		_World = w;
		_Skybox = sb;
		_ObjectHelper = oh;
		_ObstacleSlippery = obs;
		_ObstacleDamaging = obd;
		
		// properties
		
		_Launcher.show = show;
		_Launcher.hide = hide;
		_Launcher.remove = remove;
		_Launcher.update = update;
		
		shared.player = new _Player.Instance( {
			geometry: heroGeometry,
			material: new THREE.MeshFaceMaterial()
		} );
		shared.player.controllable = true;
		
		// environment
		
		shared.skybox = new _Skybox.Instance( shared.pathToAssets + "skybox_world" );
		
		shared.world = new _World.Instance( {
			geometry: asteroidGeometry,
			physics:  {
				bodyType: 'mesh',
				gravitySource: true
			}
		} );
		
		// lights
		
		var light = new THREE.PointLight( 0xffffff, 1 );
		light.position.set( 0, 3000, 0 );
		
		shared.world.add( light );
		shared.world.add( new THREE.AmbientLight( 0x555555 ) );
		
		
		// random shapes
		/*
		var numShapes = 60,
			points = THREE.GeometryUtils.randomPointsInGeometry( shared.world.geometry, numShapes ),
			shapeSizeMin = 50,
			shapeSize = 600,
			shape;
		
		
			// tester shape
			
			shape = new _Model.Instance( {
				geometry: new THREE.CubeGeometry( 500, 800, 500 ),
				material: new THREE.MeshLambertMaterial( { color: 0x555555, ambient: 0xAAAAAA } ),
				physics: {
					bodyType: 'box'
				}
			} );
			
			shared.world.add( shape );
			
			shape.position.set( 0, 1500, 0 );
			shape.quaternion.setFromEuler( new THREE.Vector3( 45, 45, 45 ) );
			
		
		
		for ( var i = 0, l = 30; i < l; i++ ) {
			
			shape = new _Model.Instance( {
				geometry: new THREE.CubeGeometry( shapeSizeMin + Math.random() * shapeSize, shapeSizeMin + Math.random() * shapeSize, shapeSizeMin + Math.random() * shapeSize ),
				material: new THREE.MeshLambertMaterial( { color: 0x555555, ambient: 0xAAAAAA } ),
				physics: {
					bodyType: 'box'
				}
			} );
			
			shared.world.add( shape );
			
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
		shared.world.add( moon );
		
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
		
		
		
		// obstacle tests
		
		var ice = new _ObstacleSlippery.Instance( {
			geometry: new THREE.CubeGeometry( 500, 300, 500 ),
			material: new THREE.MeshLambertMaterial( { color: 0xBAFEFF, ambient: 0xE3FFFF } ),
			physics: {
				bodyType: 'box'
			}
		} );
		ice.position.set( 0, 1400, 0 );
		shared.world.add( ice );
		
		var lava = new _ObstacleDamaging.Instance( {
			geometry: new THREE.CubeGeometry( 500, 300, 500 ),
			material: new THREE.MeshLambertMaterial( { color: 0xE01B3C, ambient: 0xFF9742 } ),
			physics: {
				bodyType: 'box'
			},
			options: {
				damage: 25
			}
		} );
		lava.position.set( -600, 1300, 0 );
		shared.world.add( lava );
		*/
	}
    
    /*===================================================
    
    show / hide
    
    =====================================================*/
    
    function show () {
		
		shared.sceneBG.add( shared.skybox );
		
		shared.world.show();
		
		_ObjectHelper.revert_change( shared.cameraControls.options, true );
		shared.cameraControls.target = shared.world;
		shared.cameraControls.enabled = true;
		shared.cameraControls.controllable = true;
		
		shared.signals.onGameUpdated.add( update );
        
    }
	
	function hide () {
        
        shared.signals.onGameUpdated.remove( update );
		
    }
    
    function remove () {
		
		shared.world.hide();
		
		shared.sceneBG.remove( shared.skybox );
        
    }
	
	/*===================================================
    
    update
    
    =====================================================*/
    
    function update () {
		
    }
    
} ( KAIOPUA ) );