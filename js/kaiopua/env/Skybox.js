/*
 *
 * Skybox.js
 * Skybox instance.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/env/Skybox.js",
		_Skybox = {},
		_Model;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Skybox,
		requirements: [
			"js/kaiopua/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m ) {
		
		_Model = m;
		
		_Skybox.Instance = Skybox;
		_Skybox.Instance.prototype = new _Model.Instance();
		_Skybox.Instance.prototype.constructor = _Skybox.Instance;
		
	}

    /*===================================================
    
    instance
    
    =====================================================*/
    
    function Skybox ( imagesAssetPath, parameters ) {
		
		var ap = imagesAssetPath,
			texture,
			shader,
			material,
			anisotropyMax = shared.renderer ? shared.renderer.getMaxAnisotropy() : 1;
			
		parameters = parameters || {};
		
		// cube texture
		//texture = THREE.ImageUtils.loadTexture( ap + ".jpg" );
		texture = new THREE.Texture( null, parameters.mapping );
		texture.format = THREE.RGBFormat;
		texture.flipY = false;
		texture.anisotropy = Math.min( parameters.anisotropy, anisotropyMax );
		
		// use one image for all sides
		// also allows for repeated texture
		
		if ( parameters.oneForAll === true ) {
			
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( parameters.repeat || 1, parameters.repeat || 1 );
			
			main.asset_require( [ 
				ap + ".jpg"
			], function ( all ) {
				
				texture.image = all;
				texture.needsUpdate = true;
				
			} );
			
			material = new THREE.MeshBasicMaterial( {
				color: 0xffffff,
				map: texture,
				depthWrite: false,
				side: THREE.BackSide
			} );
			
		}
		// traditional cube with 6 premade sides
		else {
			
			main.asset_require( [ 
				ap + "_posx.jpg",
				ap + "_negx.jpg",
				ap + "_posy.jpg",
				ap + "_negy.jpg",
				ap + "_posz.jpg",
				ap + "_negz.jpg"
			], function ( posx, negx, posy, negy, posz, negz ) {
				
				texture.image = [ posx, negx, posy, negy, posz, negz ];
				texture.needsUpdate = true;
				
			} );
			
			shader = $.extend(true, {}, THREE.ShaderUtils.lib[ "cube" ]);
			shader.uniforms[ "tCube" ].value = texture;
			
			material = new THREE.ShaderMaterial( {
				fragmentShader: shader.fragmentShader,
				vertexShader: shader.vertexShader,
				uniforms: shader.uniforms,
				depthWrite: false,
				side: THREE.BackSide
			} );
		
		}
		
		// proto
		
		_Model.Instance.call( this, {
            geometry: new THREE.CubeGeometry( 100, 100, 100 ),
			material: material,
			shading: THREE.SmoothShading
        } );
        
    }
    
} ( KAIOPUA ) );