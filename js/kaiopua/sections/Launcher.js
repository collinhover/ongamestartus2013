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
            { path: shared.pathToAssets + "spawn_main.js", type: 'model' },
            { path: shared.pathToAssets + "hero.js", type: 'model' },
            { path: shared.pathToAssets + "asteroid.js", type: 'model' },
			shared.pathToAssets + "skybox.jpg",
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, pl, w, sb, oh, obs, obd, gSpawnMain, gHero, gAsteroid ) {
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
		
		var spawnMain =  new _Model.Instance( {
			geometry: gSpawnMain,
			center: true
		} );
		shared.spawns.main.copy( spawnMain.position );
		
		shared.player = new _Player.Instance( {
			geometry: gHero,
			material: new THREE.MeshFaceMaterial(),
			options: {
				animation: {
					names: {
						idleAlt: 'idle_alt'
					},
					durations: {
						idle: 600,
						idleAlt: 1500,
						jump: 600,
						jumpStart: 175,
						jumpEnd: 300
					}
				}
			}
		} );
		shared.player.controllable = true;
		
		// environment
		
		shared.skybox = new _Skybox.Instance( shared.pathToAssets + "skybox", { repeat: 2, oneForAll: true } );
		
		shared.world = new _World.Instance( {
			geometry: gAsteroid,
			material: new THREE.MeshFaceMaterial(),
			physics:  {
				bodyType: 'mesh',
				gravitySource: true
			}
		} );
        
		main.asset_require( { path: shared.pathToAssets + "asteroid_colliders.js", type: 'model' }, function ( geometry ) {
			var model = new _Model.Instance( {
				geometry: geometry,
				material: new THREE.MeshFaceMaterial(),
				physics:  {
					bodyType: 'mesh'
				}
			} );
			shared.world.add( model );
		} );
		
		main.asset_require( { path: shared.pathToAssets + "asteroid_noncolliders.js", type: 'model' }, function ( geometry ) {
			var model = new _Model.Instance( {
				geometry: geometry,
				material: new THREE.MeshFaceMaterial()
			} );
			shared.world.add( model );
		} );
		
		main.asset_require( { path: shared.pathToAssets + "moon.js", type: 'model' }, function ( gMoon ) {
			shared.world.parts.moon = new _Model.Instance( {
				geometry: gMoon,
				material: new THREE.MeshFaceMaterial(),
				center: true
			} );
			
			shared.world.parts.moonLight.distance = shared.world.parts.moon.boundRadius * 10;
			shared.world.parts.moon.add( shared.world.parts.moonLight );
			
			shared.world.add( shared.world.parts.moon );
			
		} );
		main.asset_require( { path: shared.pathToAssets + "ship.js", type: 'model' }, function ( gShip ) {
			var ship = new _Model.Instance( {
				geometry: gShip,
				material: new THREE.MeshFaceMaterial(),
				physics:  {
					bodyType: 'mesh'
				},
				center: true
			} );
			shared.world.add( ship );
		} );
		
		// lights, seems as if lights must be in world before world is added for the first time to scene
		
		shared.world.parts.ambientLight = new THREE.AmbientLight( 0x555555 );
		shared.world.add( shared.world.parts.ambientLight );
		
		shared.world.parts.moonLight = new THREE.PointLight( 0xffffff, 1 );
		shared.world.add( shared.world.parts.moonLight );
	
		
		/*
		// secondary gravity sources
		
		var moon1 = new _Model.Instance( {
			geometry: asteroidGeometry,
			physics: {
				bodyType: 'mesh',
				gravitySource: true
			}
		} );
		moon1.position.set( 1000, 1200, 1000 );
		moon1.scale.set( 0.35, 0.35, 0.35 );
		shared.world.add( moon1 );
		
		var moon2 = new _Model.Instance( {
			geometry: asteroidGeometry,
			physics: {
				bodyType: 'mesh',
				gravitySource: true
			}
		} );
		moon2.position.set( 1800, 1700, 1000 );
		moon2.scale.set( 0.15, 0.15, 0.15 );
		shared.world.add( moon2 );
		
		var moon3 = new _Model.Instance( {
			geometry: asteroidGeometry,
			physics: {
				bodyType: 'mesh',
				gravitySource: true
			}
		} );
		moon3.position.set( 1800, 2200, 1200 );
		moon3.scale.set( 0.1, 0.1, 0.1 );
		shared.world.add( moon3 );
		
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
		console.log( 'adding world' );
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