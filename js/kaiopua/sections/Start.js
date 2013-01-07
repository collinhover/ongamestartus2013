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
		_UI,
		_Speaker;
    
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
			{ path: shared.pathToAssets + "spawn_random.js", type: 'model' },
            { path: shared.pathToAssets + "hero.js", type: 'model' }
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m, pl, oh, gSpawnMain, gSpawnsRandom, gHero ) {
		
		// assets
		
		_Model = m;
		_Player = pl;
		_ObjectHelper = oh;
		
		// property
		
		_Start.show = show;
		_Start.hide = hide;
		_Start.remove = remove;
		_Start.update = update;
		
		// spawns
		
		var spawnMain =  new _Model.Instance( {
			geometry: gSpawnMain,
			center: true
		} );
		shared.spawns.main = spawnMain.position.clone();
		
		var i, il,
			vertices;
		
		shared.spawns.random = shared.spawns.random || [];
		
		vertices = gSpawnsRandom.vertices;
		
		for ( i = 0, il = vertices.length; i < il; i++ ) {
			
			shared.spawns.random.push( vertices[ i ].clone() );
			
		}
		
		// player
		
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
			"js/kaiopua/ui/UI.js",
			"js/kaiopua/characters/Speaker.js",
			{ path: shared.pathToAssets + "speakers.js", type: 'json' }
		], function ( ui, spk, speakersList ) {
			
			_UI = ui;
			_Speaker = spk;
			
			shared.speakersLoading = [];
			
			var speakerData,
				spawnsUnused;
			
			// create all speakers
			
			spawnsUnused = shared.spawns.random.slice( 0 );
			
			for ( i = 0, il = speakersList.length; i < il; i++ ) {
				
				speakerData = speakersList[ i ];
				speakerData.spawn = main.array_random_value_remove( spawnsUnused );
				
				init_speaker( speakerData );
				
			}
			
		} );
        
    }
	
	function init_speaker ( data ) {
		
		main.array_cautious_add( shared.speakersLoading, data );
		
		main.asset_require( [
			{ path: shared.pathToAssets + ( data.geometry || data.options.paths.assets ) + ".js", type: 'model' }
		], function ( g ) {
			
			// parameters
			
			data.geometry = g;
			var options = data.options = data.options || {};
			var dialogues = options.dialogues = options.dialogues || {};
			var name = dialogues.name = dialogues.name || {};
			name.callback = function () { _UI.show_speaker( data ); };
			
			// init
			
			var speaker = new _Speaker.Instance( data );
			
			// misc properties and respawn
			
			speaker.face_local_direction( new THREE.Vector3( Math.random() * 2 - 1, 0, Math.random() * 2 - 1 ).normalize() );
			speaker.respawn( shared.scene, data.spawn );
			
			// handle speakers loading
			
			main.array_cautious_remove( shared.speakersLoading, data );
			
			if ( shared.speakersLoading.length === 0 ) {
				
				delete shared.speakersLoading;
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