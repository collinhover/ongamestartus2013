/*
 *
 * Morphs.js
 * Handles morphs and animation for models.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/core/Morphs.js",
		_Morphs = {},
		_MorphAnimator;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _Morphs,
		requirements: [
			"js/game/core/MorphAnimator.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( ma ) {
		console.log('internal Morphs', _Morphs);
		
		// utility
		
		_MorphAnimator = ma;
		
		// properties
		
		_Morphs.defaults = {
			numMin: 5,
			stabilityID: 'morph_stability'
		};
		
		// instance
		
		_Morphs.Instance = Morphs;
		_Morphs.Instance.prototype.constructor = _Morphs.Instance;
		
		_Morphs.Instance.prototype.play = play;
		_Morphs.Instance.prototype.stop = stop;
		_Morphs.Instance.prototype.stop_all = stop_all;
		_Morphs.Instance.prototype.clear = clear;
		_Morphs.Instance.prototype.clear_all = clear_all;
		
		_Morphs.Instance.prototype.stabilize = stabilize;
		
		_Morphs.Instance.prototype.get_morph_name_data = get_morph_name_data;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Morphs ( parameters ) {
		
		var property;
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.defaults = $.extend( {}, _Morphs.defaults, parameters.defaults );
		
		this.mesh = parameters.mesh;
		
		// libraries
		
		this.libraries = {
			morphTargets: new MorphsLibrary( this.mesh.geometry.morphTargets, this.defaults.stabilityID )
		}
		
		this.libraryNames = [];
		for ( property in this.libraries ) {
			
			this.libraryNames.push( this.libraries[ property ] );
			
		}
		
		this.stabilize();
		
	}
	
	/*===================================================
	
	play
	
	=====================================================*/
	
	function play ( name, parameters ) {
		
		return for_each_library.call( this, play_from_library, name, parameters );
		
	}
	
	function play_from_library ( library, name, parameters ) {
		
		var i, l,
			names = library.names,
			name,
			maps,
			map,
			animators,
			animatorNames,
			animator,
			index = main.index_of_value( names, name );
		
		if ( index !== -1 ) {
			
			maps = library.maps;
			animators = library.animators;
			animatorNames = library.animatorNames;
			
			name = names[ index ];
			map = maps[ name ];
			
			if ( animators.hasOwnProperty( name ) !== true ) {
				
				animator = animators[ name ] = new _MorphAnimator.Instance( this, library, name );
				
				animatorNames.push( animator );
				
			}
			
			animator = animators[ name ];
			
			animator.play( parameters );
			
		}
		else if ( typeof parameters.callback === 'function' ) {
			
			parameters.callback();
			
		}
		
	}
	
	/*===================================================
	
	stop
	
	=====================================================*/
	
	function stop ( name, parameters ) {
		
		return for_each_library.call( this, stop_from_library, name, parameters );
		
	}
	
	function stop_from_library ( library, name, parameters ) {
		
		var animators = library.animators,
			animator = animators[ name ];
		
		if ( animator instanceof _MorphAnimator.Instance ) {
			
			animator.stop( parameters );
			
		}
		
	}
	
	function stop_all ( parameters ) {
		
		return for_each_library.call( this, stop_all_from_library, parameters );
		
	}
	
	function stop_all_from_library ( library, parameters ) {
		
		var i, l,
			animators = library.animators,
			animatorNames = library.animatorNames,
			animator;
		
		for ( i = 0, l = animatorNames.length; i < l; i++ ) {
			
			animator = animators[ animatorNames[ i ] ];
			
			animator.stop( parameters );
			
		}
		
	}
	
	/*===================================================
	
	clear
	
	=====================================================*/
	
	function clear ( name, parameters ) {
		
		return for_each_library.call( this, clear_from_library, name, parameters );
		
	}
	
	function clear_from_library ( library, name, parameters ) {
		
		var animators = library.animators,
			animator = animators[ name ];
		
		if ( animator instanceof _MorphAnimator.Instance ) {
			
			animator.clear( parameters );
			
		}
		
	}
	
	function clear_all ( parameters ) {
		
		return for_each_library.call( this, clear_all_from_library, parameters );
		
	}
	
	function clear_all_from_library ( library, parameters ) {
		
		var i, l,
			animators = library.animators,
			animatorNames = library.animatorNames,
			animator;
		
		for ( i = 0, l = animatorNames.length; i < l; i++ ) {
			
			animator = animators[ animatorNames[ i ] ];
			
			animator.clear( parameters );
			
		}
		
	}
	
	/*===================================================
	
	stabilize
	
	=====================================================*/
	
	function stabilize () {
		
		var i, l,
			mesh = this.mesh,
			geometry = mesh.geometry,
			morphs = geometry.morphTargets || [],
			morph,
			nameData,
			needsStability = !this.stable;
		
		// adds stability morph to end of morphs list, identical to base geometry
		// as required to make model + morphtargets work
		
		if ( needsStability === true ) {
			
			// find if has stability morph
			
			for ( i = 0, l = morphs.length; i < l; i ++ ) {
				
				morph = morphs[i];
				
				nameData = get_morph_name_data( morph.name );
				
				if ( nameData.name === this.defaults.stabilityID ) {
					
					needsStability = false;
					break;
					
				}
			
			}
			
			if ( morphs.length > 0 && ( needsStability === true || morphs.length < this.defaults.numMin ) ) {
				
				// have to add at least one stability morph
				
				add_stability_morph.call( this );
				
				// ensure minimum number of morphs
				
				for ( i = morphs.length, l = this.defaults.numMin; i < l; i++ ) {
					
					add_stability_morph.call( this );
					
				}
				
			}
			
			this.stable = true;
			
		}
		
	}
	
	function add_stability_morph ( mesh ) {
		
		var i, l,
			mesh = this.mesh,
			geometry = mesh.geometry,
			vertices = geometry.vertices,
			vertex,
			vertPos,
			morphNumber = mesh.morphTargetInfluences.length,
			morphInfo = {
				name: this.defaults.stabilityID + '_' + morphNumber,
				vertices: []
			},
			morphVertices = morphInfo.vertices;
		
		for ( i = 0, l = vertices.length; i < l; i++ ) {
			
			vertex = vertices[ i ];
			
			morphVertices.push( vertex.clone() );
			
		}
		
		// add morph target to list
		
		geometry.morphTargets.push( morphInfo );
		
		// update morph target info in mesh
		
		mesh.morphTargetInfluences.push( 0 );
		mesh.morphTargetDictionary[ morphInfo.name ] = morphNumber;
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function for_each_library ( callback ) {
		
		var i, l,
			args = arguments.slice( 1 ),
			libraries = this.libraries,
			libraryNames = this.libraryNames,
			library;
		
		parameters = parameters || {};
		library = parameters.library || '';
		
		// specific morph library
		
		if ( libraries.hasOwnProperty( library ) ) {
			
			args = arguments.slice( 1 ).unshift( libraries[ library ] );
			callback.apply( this, args );
			
		}
		// all libraries
		else {
			
			for ( i = 0, l = libraryNames.length; i < l; i++ ) {
				
				args = arguments.slice( 1 ).unshift( libraries[ libraryNames[ i ] ] );
				callback.apply( this, args );
				
			}
			
		}
		
		return this;
		
	}
	
	function get_morph_name_data ( name ) {
		
		var nameData = { 
				name: name,
				number: 0
			},
			index,
			numberTest;
		
		// get split of base name and number by last _
		
		index = name.lastIndexOf('_');
		
		if ( index !== -1) {
			
			numberTest = parseFloat(name.substr( index + 1 ));
			
			// test if is number
			
			if ( main.is_number( numberTest ) ) {
				
				nameData.name = name.substr( 0, index );
				
				nameData.number = numberTest;
				
			}
		}
		
		return nameData;
		
	}
	
	function morph_colors_to_face_colors( geometry ) {
		
		var i, l;

		if ( main.is_array( geometry.morphColors ) ) {
			
			var colorMap = geometry.morphColors[ 0 ];

			for ( i = 0, l = colorMap.colors.length; i < l; i++ ) {

				geometry.faces[ i ].color = colorMap.colors[ i ];

			}

		}

	}
	
	/*===================================================
	
	library
	
	=====================================================*/
	
	function MorphsLibrary ( morphTargets, stabilityID ) {
		
		var i, l,
			morph,
			morphName,
			nameData,
			name,
			number,
			map;
		
		this.names = [];
		this.maps = {};
		
		morphs = main.ensure_array( morphs );
		
		if ( typeof stabilityID !== 'string' ) {
			
			stabilityID = _Morphs.defaults.stabilityID;
			
		}
		
		// get mapped data for each morph
		
		for ( i = 0, l = morphs.length; i < l; i ++ ) {
			
			morph = morphs[ i ];
			morphName = morph.name;
			
			nameData = get_morph_name_data( morphName );
			name = nameData.name;
			number = nameData.number;
			
			if ( name !== stabilityID ) {
				
				if ( this.maps.hasOwnProperty( name ) !== true ) {
					
					this.maps[ name ] = [];
					this.names.push( name );
					
				}
				
				map = maps[ name ];
				map.push( { index: i, number: number } );
				
			}
			
		}
		
		// sort maps
		
		for ( i = 0, l = this.names.length; i < l; i ++ ) {
			
			name = this.names[i];
			map = this.maps[ name ];
				
			map.sort( sort_map );
			
		}
		
		// animators
		
		this.animators = {};
		this.animatorNames = [];
		
	}
	
	function sort_map ( a, b ) {
		
		return a.number - b.number;
		
	}
	
} (OGSUS) );