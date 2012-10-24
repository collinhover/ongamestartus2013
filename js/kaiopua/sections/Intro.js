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
		_ObjectHelper;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
    
	main.asset_register( assetPath, { 
		data: _Intro,
		requirements: [
			"js/kaiopua/utils/ObjectHelper.js",
			shared.pathToTextures + "skybox_world_posx.jpg",
            shared.pathToTextures + "skybox_world_negx.jpg",
			shared.pathToTextures + "skybox_world_posy.jpg",
            shared.pathToTextures + "skybox_world_negy.jpg",
			shared.pathToTextures + "skybox_world_posz.jpg",
            shared.pathToTextures + "skybox_world_negz.jpg"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( oh ) {
		console.log('internal intro', _Intro);
		
		// assets
		
		_ObjectHelper = oh;
		
		// property
		
		_Intro.show = show;
		_Intro.hide = hide;
		_Intro.remove = remove;
		_Intro.update = update;
		
	}
    
    /*===================================================
    
    section functions
    
    =====================================================*/
    
    function show () {
		
		shared.sceneBG.add( shared.skybox );
		
		shared.world.show();
		
		shared.player.respawn( shared.scene, new THREE.Vector3( 35, 2200, 300 ) );
		
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
		
		shared.world.hide();
		
		shared.sceneBG.remove( shared.skybox );
        
    }
    
    function update () {
		
    }
    
} ( KAIOPUA ) );