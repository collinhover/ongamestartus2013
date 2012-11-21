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
		_Skybox,
		_ObjectHelper,
		_ObstacleSlippery,
		_ObstacleDamaging,
		_Speaker;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Launcher,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/env/Skybox.js",
			"js/kaiopua/utils/ObjectHelper.js",
			"js/kaiopua/physics/ObstacleSlippery.js",
			"js/kaiopua/physics/ObstacleDamaging.js",
			"js/kaiopua/characters/Speaker.js",
            { path: shared.pathToAssets + "asteroid.js", type: 'model' },
			shared.pathToAssets + "skybox.jpg",
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, sb, oh, obs, obd, spk, gAsteroid ) {
		
		// assets
		
		_Model = m;
		_Skybox = sb;
		_ObjectHelper = oh;
		_ObstacleSlippery = obs;
		_ObstacleDamaging = obd;
		_Speaker = spk;
		
		// properties
		
		_Launcher.show = show;
		_Launcher.hide = hide;
		_Launcher.remove = remove;
		_Launcher.update = update;
		
		// world
		
		shared.skybox = new _Skybox.Instance( shared.pathToAssets + "skybox", { repeat: 2, oneForAll: true } );
		
		shared.world = new _Model.Instance();
		shared.world.parts = {};
		
		// seems as if lights must be in world before world is added for the first time to scene
		
		shared.world.parts.ambientLight = new THREE.AmbientLight( 0x555555 );
		shared.world.add( shared.world.parts.ambientLight );
		
		// asteroid
		
		shared.world.parts.asteroidMoonLight = new THREE.PointLight( 0xffffff, 1.5 );
		shared.world.add( shared.world.parts.asteroidMoonLight );
		
		shared.world.parts.asteroid = new _Model.Instance( {
			geometry: gAsteroid,
			physics:  {
				bodyType: 'mesh',
				gravitySource: true
			},
			center: true
		} );
		shared.world.add( shared.world.parts.asteroid );
		
		main.asset_require( { path: shared.pathToAssets + "asteroid_moon.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				},
				center: true
			} );
			shared.world.add( model );
			
			shared.world.parts.asteroidMoonLight.distance = model.boundRadius * 10;
			model.add( shared.world.parts.asteroidMoonLight );
			
		} );
		main.asset_require( { path: shared.pathToAssets + "asteroid_colliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				}
			} );
			shared.world.add( model );
		} );
		main.asset_require( { path: shared.pathToAssets + "asteroid_noncolliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g
			} );
			shared.world.add( model );
		} );
		
		// landing
        
		main.asset_require( { path: shared.pathToAssets + "landing_colliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				}
			} );
			shared.world.add( model );
		} );
		
		main.asset_require( { path: shared.pathToAssets + "landing_noncolliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g
			} );
			shared.world.add( model );
		} );
		
		// gem forest
		
		shared.world.parts.gemLight = new THREE.PointLight( 0xE1FB64, 2 );
		shared.world.add( shared.world.parts.gemLight );
		
		main.asset_require( { path: shared.pathToAssets + "gem.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				},
				center: true
			} );
			shared.world.add( model );
			
			shared.world.parts.gemLight.distance = model.boundRadius * 12;
			shared.world.parts.gemLight.position.copy( model.position ).normalize().multiplyScalar( shared.world.parts.gemLight.distance * 0.25 );
			model.add( shared.world.parts.gemLight );
		} );
		main.asset_require( { path: shared.pathToAssets + "gemforest_colliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				}
			} );
			shared.world.add( model );
		} );
		main.asset_require( { path: shared.pathToAssets + "gemforest_noncolliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g
			} );
			shared.world.add( model );
		} );
		
		// snow
		
		main.asset_require( { path: shared.pathToAssets + "snow_colliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				}
			} );
			shared.world.add( model );
		} );
		main.asset_require( { path: shared.pathToAssets + "snow_noncolliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g
			} );
			shared.world.add( model );
		} );
		main.asset_require( { path: shared.pathToAssets + "snow_obstacles_slippery.js", type: 'model' }, function ( g ) {
			var model = new _ObstacleSlippery.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				}
			} );
			shared.world.add( model );
		} );
		
		// TODO: allow alternate geometry in physics
		main.asset_require( [
			{ path: shared.pathToAssets + "snow_obstacles_damaging.js", type: 'model' },
			//{ path: shared.pathToAssets + "snow_obstacles_damaging_colliders.js", type: 'model' }
		], function ( g, gphys ) {
			var model = new _ObstacleDamaging.Instance( {
				geometry: g,
				physics:  {
					//geometry: gphys,
					bodyType: 'mesh'
				},
				options: {
					damage: 25
				}
			} );
			shared.world.add( model );
		} );
		
		// iceplanet
		
		shared.world.parts.iceplanetMoonLight = new THREE.PointLight( 0x6FD4FB, 2.5 );
		shared.world.add( shared.world.parts.iceplanetMoonLight );
		
		main.asset_require( { path: shared.pathToAssets + "iceplanet_moon.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh',
					gravitySource: true
				},
				center: true
			} );
			shared.world.add( model );
			
			shared.world.parts.iceplanetMoonLight.distance = model.boundRadius * 12;
			model.add( shared.world.parts.iceplanetMoonLight );
		} );
		//TODO: make it possible to get off planet, and add some life to planet
		/*
		main.asset_require( { path: shared.pathToAssets + "iceplanet.js", type: 'model' }, function ( g ) {
			var model = new _ObstacleSlippery.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh',
					gravitySource: true
				},
				center: true
			} );
			shared.world.add( model );
		} );
		main.asset_require( { path: shared.pathToAssets + "iceplanet_noncolliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g
			} );
			shared.world.add( model );
		} );
		*/
		
		// lava
		
		shared.world.parts.lavaLight = new THREE.PointLight( 0xF09E00, 2 );
		shared.world.add( shared.world.parts.lavaLight );
		
		main.asset_require( { path: shared.pathToAssets + "lava_volcano.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				},
				center: true
			} );
			shared.world.add( model );
			
			shared.world.parts.lavaLight.distance = model.boundRadius * 7;
			model.add( shared.world.parts.lavaLight );
		} );
		
		main.asset_require( { path: shared.pathToAssets + "lava_colliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh'
				}
			} );
			shared.world.add( model );
		} );
		
		// TODO: allow alternate geometry in physics
		main.asset_require( [
			{ path: shared.pathToAssets + "lava_obstacles_damaging.js", type: 'model' },
			//{ path: shared.pathToAssets + "snow_obstacles_damaging_colliders.js", type: 'model' }
		], function ( g, gphys ) {
			var model = new _ObstacleDamaging.Instance( {
				geometry: g,
				physics:  {
					//geometry: gphys,
					bodyType: 'mesh'
				},
				options: {
					damage: 50
				}
			} );
			shared.world.add( model );
		} );
		
		// star cluster
		
		shared.world.parts.starclusterLight = new THREE.PointLight( 0xFFD943, 2.5 );
		shared.world.add( shared.world.parts.starclusterLight );
		
		main.asset_require( { path: shared.pathToAssets + "starcluster_core.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh',
					gravitySource: true
				},
				center: true
			} );
			shared.world.add( model );
			
			shared.world.parts.starclusterLight.distance = model.boundRadius * 7;
			model.add( shared.world.parts.starclusterLight );
		} );
		main.asset_require( { path: shared.pathToAssets + "starcluster_1.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh',
					gravitySource: true
				},
				center: true
			} );
			shared.world.add( model );
		} );
		main.asset_require( { path: shared.pathToAssets + "starcluster_2.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh',
					gravitySource: true
				},
				center: true
			} );
			shared.world.add( model );
		} );
		main.asset_require( { path: shared.pathToAssets + "starcluster_3.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g,
				physics:  {
					bodyType: 'mesh',
					gravitySource: true
				},
				center: true
			} );
			shared.world.add( model );
		} );
		main.asset_require( { path: shared.pathToAssets + "starcluster_noncolliders.js", type: 'model' }, function ( g ) {
			var model = new _Model.Instance( {
				geometry: g
			} );
			shared.world.add( model );
		} );
		
		// speakers
		
		main.asset_require( { path: shared.pathToAssets + "spawn_random.js", type: 'model' }, function ( g ) {
			
			var i, il,
				vertices,
				vertex,
				spawns,
				spawnsUnused,
				speakersData = [
					{ name: "Michal Budzynski", assets: { path: shared.pathToAssets + "speaker_budzynski_michal.js", type: 'model' } },
					{ name: "Collin Hover", assets: { path: shared.pathToAssets + "speaker_hover_collin.js", type: 'model' } },
					{ name: "Jesse Freeman", assets: { path: shared.pathToAssets + "speaker_freeman_jesse.js", type: 'model' } },
					{ name: "Pascal Rettig", assets: { path: shared.pathToAssets + "speaker_rettig_pascal.js", type: 'model' } }
				],
				data;
			
			// process random spawns
			
			spawns = shared.spawns.random = shared.spawns.random || [];
			
			vertices = g.vertices;
			
			for ( i = 0, il = vertices.length; i < il; i++ ) {
				
				vertex = vertices[ i ];
				
				spawns.push( vertex.clone() );
				
			}
			
			// copy random spawns
			
			spawnsUnused = spawns.slice( 0 );
			
			// create all speakers
			
			for ( i = 0, il = speakersData.length; i < il; i++ ) {
				
				data = speakersData[ i ];
				data.spawn = main.array_random_value_remove( spawnsUnused );
				
				load_speaker( data );
				
			}
			
		} );
		
	}
	
	function load_speaker ( data ) {
		
		main.asset_require( data.assets, function ( g ) {
			
			var speaker = new _Speaker.Instance( {
				name: data.name,
				geometry: g
			} );
			shared.world.add( speaker );
			
			speaker.face_local_direction( new THREE.Vector3( Math.random() * 2 - 1, 0, Math.random() * 2 - 1 ).normalize() );
			
			speaker.respawn( shared.scene, data.spawn );
			
		} );
		
	}
    
    /*===================================================
    
    show / hide
    
    =====================================================*/
    
    function show () {
		
		shared.sceneBG.add( shared.skybox );
		
		shared.scene.add( shared.world );
		
		_ObjectHelper.revert_change( shared.cameraControls.options, true );
		shared.cameraControls.target = shared.world.parts.asteroid;
		shared.cameraControls.enabled = true;
		shared.cameraControls.controllable = true;
		
		shared.signals.onGameUpdated.add( update );
        
    }
	
	function hide () {
        
        shared.signals.onGameUpdated.remove( update );
		
    }
    
    function remove () {
		
		shared.scene.remove( shared.world );
		
		shared.sceneBG.remove( shared.skybox );
        
    }
	
	/*===================================================
    
    update
    
    =====================================================*/
    
    function update () {
		
    }
    
} ( KAIOPUA ) );