/*
 *
 * Start.js
 * Start section.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/sections/Start.js",
		_Start = {},
		_Model,
		_Player,
		_ObjectHelper,
		_Speaker,
		speakers = [];
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
	main.asset_register( assetPath, { 
		data: _Start,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/characters/Player.js",
			"js/kaiopua/utils/ObjectHelper.js",
            { path: shared.pathToAssets + "spawn_main.js", type: 'model' },
            { path: shared.pathToAssets + "hero.js", type: 'model' }
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, pl, oh, gSpawnMain, gHero ) {
		
		// assets
		
		_Model = m;
		_Player = pl;
		_ObjectHelper = oh;
		
		// property
		
		_Start.show = show;
		_Start.hide = hide;
		_Start.remove = remove;
		_Start.update = update;
		
		// player
		
		var spawnMain =  new _Model.Instance( {
			geometry: gSpawnMain,
			center: true
		} );
		shared.spawns.main = spawnMain.position.clone();
		
		shared.player = new _Player.Instance( {
			geometry: gHero,
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
		
	}
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		shared.sceneBG.add( shared.skybox );
		
		shared.scene.add( shared.world );
		
		shared.player.respawn( shared.scene, shared.spawns.main );
		
		_ObjectHelper.revert_change( shared.cameraControls.options, true );
		shared.cameraControls.target = shared.player;
		shared.cameraControls.enabled = true;
		shared.cameraControls.controllable = false;
		
		// speakers
		
		main.ready = false;
		
		main.asset_require( [
			"js/kaiopua/characters/Speaker.js",
			{ path: shared.pathToAssets + "spawn_random.js", type: 'model' }
		], function ( spk, g ) {
			
			_Speaker = spk;
			
			var i, il,
				vertices,
				vertex,
				spawns,
				spawnsUnused,
				speakersData = [
					{ name: "Michal Budzynski", options: { assetsPath: "speaker_budzynski_michal" } },
					{ name: "Collin Hover", options: { assetsPath: "speaker_hover_collin" } },
					{ name: "Jesse Freeman", options: { assetsPath: "speaker_freeman_jesse" } },
					{ name: "Pascal Rettig", options: { assetsPath: "speaker_rettig_pascal" } }
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
				
				speakers.push( data.name );
				
				load_speaker( data );
				
			}
			
		} );
        
    }
	
	function load_speaker ( data ) {
		
		main.asset_require( [
			{ path: shared.pathToAssets + data.options.assetsPath + ".js", type: 'model' }
		], function ( g ) {
			
			var speaker = new _Speaker.Instance( {
				name: data.name,
				options: data.options,
				geometry: g
			} );
			shared.world.add( speaker );
			
			speaker.face_local_direction( new THREE.Vector3( Math.random() * 2 - 1, 0, Math.random() * 2 - 1 ).normalize() );
			
			speaker.respawn( shared.scene, data.spawn );
			
			main.array_cautious_remove( speakers, data.name );
			
			if ( speakers.length === 0 ) {
				
				main.ready = true;
				
			}
			
		} );
		
	}
	
	function hide () {
		
    }
    
    function remove () {
		
		shared.scene.remove( shared.player );
		
		shared.scene.remove( shared.world );
		
		shared.sceneBG.remove( shared.skybox );
        
    }
    
    function update () {
		
    }
    
} ( KAIOPUA ) );