/*
 *
 * Intro.js
 * Introduction section.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/sections/Intro.js",
		_Intro = {},
		_Model,
		_Player,
		_Speaker,
		_ObjectHelper;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
	main.asset_register( assetPath, { 
		data: _Intro,
		requirements: [
			"js/kaiopua/core/Model.js",
			"js/kaiopua/characters/Player.js",
			"js/kaiopua/characters/Speaker.js",
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
	
	function init_internal ( m, pl,  sp, oh, gSpawnMain, gHero ) {
		console.log('internal intro', _Intro);
		
		// assets
		
		_Model = m;
		_Player = pl;
		_Speaker = sp;
		_ObjectHelper = oh;
		
		// property
		
		_Intro.show = show;
		_Intro.hide = hide;
		_Intro.remove = remove;
		_Intro.update = update;
		
		// player
		
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
		
	}
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		shared.sceneBG.add( shared.skybox );
		
		shared.scene.add( shared.world );
		
		shared.player.respawn( shared.scene, shared.spawns.main );
		
		main.asset_require( { path: shared.pathToAssets + "speaker_hover_collin.js", type: 'model' }, function ( gSpeaker ) {
		//for ( var i = 0; i < 100; i++ ) {
			
			var speaker = new _Speaker.Instance( {
				name: "Collin Hover",
				geometry: gSpeaker,
				material: new THREE.MeshFaceMaterial(),
				options: {}
			} );
			var loc = shared.spawns.main.clone();
			//loc.x += Math.random() * 2000 - 1000;
			//loc.z += Math.random() * 2000 - 1000;
			speaker.respawn( shared.scene, loc );
			//speaker.move_state_change( Math.round( Math.random() ) === 1 ? 'forward' : 'back' );
			//speaker.move_state_change( Math.round( Math.random() ) === 1 ? 'left' : 'right' );
			
		//}
		
		} );
		
		_ObjectHelper.revert_change( shared.cameraControls.options, true );
		shared.cameraControls.target = shared.player;
		shared.cameraControls.enabled = true;
		shared.cameraControls.controllable = false;
		
		shared.signals.onGameUpdated.add( update );
        
    }
	
	function hide () {
        
        shared.signals.onGameUpdated.remove( update );
		
    }
    
    function remove () {
		
		shared.scene.remove( shared.player );
		
		shared.scene.remove( shared.world );
		
		shared.sceneBG.remove( shared.skybox );
        
    }
    
    function update () {
		
    }
    
} ( KAIOPUA ) );