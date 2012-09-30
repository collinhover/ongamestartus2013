/*
 *
 * Player.js
 * Centralizes all player related functionality.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/core/Player.js",
        _Player = {},
		_Hero,
		_ObjectHelper,
		_PhysicsHelper,
		_MathHelper,
		_KeyHelper,
		ready = false,
		enabled = false,
		showing = false,
		actionsMap,
		keybindings,
		keybindingsDefault,
		actions,
		character,
		following = [],
		selecting;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	_Player.enable = enable;
	_Player.disable = disable;
	_Player.show = show;
	_Player.hide = hide;
	_Player.allow_control = allow_control;
	_Player.remove_control = remove_control;
	_Player.select = select;
	_Player.deselect = deselect;
	
	// getters and setters
	
	Object.defineProperty(_Player, 'enabled', { 
		get : function () { return enabled; },
		set : function ( val ) { 
			if ( val === true ) {
				enable();
			}
			else {
				disable();
			}
		}
	});
	
	Object.defineProperty(_Player, 'actions', { 
		get : function () { return actions; }
	});
	
	Object.defineProperty(_Player, 'character', { 
		get : function () { return character; }
	});
	
	Object.defineProperty(_Player, 'moving', { 
		get : function () { return character.movement.state.moving; }
	});
	
	main.asset_register( assetPath, { 
		data: _Player,
		requirements: [
			"js/game/core/Actions.js",
			"js/game/characters/Hero.js",
			"js/game/utils/ObjectHelper.js",
			"js/game/utils/PhysicsHelper.js",
			"js/game/utils/MathHelper.js",
			"js/game/utils/KeyHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    external init
    
    =====================================================*/
	
	function init_internal ( ac, h, oh, ph, mh, kh ) {
		console.log('internal player');
		
		if ( ready !== true ) {
			
			// assets
			
			_Actions = ac;
			_Hero = h;
			_ObjectHelper = oh;
			_PhysicsHelper = ph;
			_MathHelper = mh;
			_KeyHelper = kh;
			
			// selecting
			
			selecting = {};
			
			selecting.opacityMin = 0.2;
			selecting.opacityMax = 0.6;
			selecting.opacityStart = selecting.opacityMin;
			selecting.opacityTarget = selecting.opacityMax;
			selecting.opacityCycleTime = 0;
			selecting.opacityCycleTimeMax = 500;
			
			selecting.material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: selecting.opacityStart, blending: THREE.AdditiveAlphaBlending } );
			
			// initialization
			
			init_character();
			
			init_actions();
			
			init_keybindings();
			
			init_controls();
			
			// signals
			
			shared.signals.onGamePaused.add( pause );
			
			ready = true;
			
		}
		
	}
    
    /*===================================================
    
    character
    
    =====================================================*/
	
	function init_character () {
		
		// create character
		
		character = new _Hero.Instance();
		
	}
	
	/*===================================================
    
    actions
    
    =====================================================*/
	
	function init_actions () {
		
		actions = new _Actions.Instance();
		
		// add actions
		
		// pointer
		
		/*actions.add( 'pointer', {
			eventCallbacks: {
				drag: function ( parameters ) {
					
					// start rotating camera if character is not acting
					
					if ( character.actions.is_active( 'pointer' ) !== true ) {
						
						main.cameraControls.rotate( parameters.event );
						
					}
					
				},
				dragend: function ( parameters ) {
					
					// stop camera rotate
					
					main.cameraControls.rotate( undefined, true );
					
				},
				wheel: function ( parameters ) {
					
					main.cameraControls.zoom( parameters.event );
					
				}
			},
			deactivateCallbacks: 'dragend'
		} );*/
		
		// wasd / arrows
		
		actions.add( 'w up_arrow', {
			eventCallbacks: {
				down: function () {
					character.move_state_change( 'forward' );
				},
				up: function () {
					character.move_state_change( 'forward', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		actions.add( 's down_arrow', {
			eventCallbacks: {
				down: function () {
					character.move_state_change( 'back' );
				},
				up: function () {
					character.move_state_change( 'back', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		actions.add( 'a left_arrow', {
			eventCallbacks: {
				down: function () {
					character.move_state_change( 'left' );
				},
				up: function () {
					character.move_state_change( 'left', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		actions.add( 'd right_arrow', {
			eventCallbacks: {
				down: function () {
					character.move_state_change( 'right' );
				},
				up: function () {
					character.move_state_change( 'right', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		// jump
		
		actions.add( 'space', {
			eventCallbacks: {
				down: function () {
					character.move_state_change( 'up' );
				},
				up: function () {
					character.move_state_change( 'up', true );
				}
			},
			deactivateCallbacks: 'up'
		} );
		
		// misc
		
		actions.add( 'escape', {
			eventCallbacks: {
				up: function () {
					
					if ( main.paused === true ) {
						main.resume();
					}
					else {
						main.pause();
					}
					
				}
			}
		} );
		
	}
	
	/*===================================================
    
    keybindings
    
    =====================================================*/
	
	function init_keybindings () {
		
		var map = keybindingsDefault = {};
		
		// default keybindings
		
		// pointer
		
		map[ 'pointer' ] = 'pointer';
		
		// wasd / arrows
		
		map[ 'w' ] = map[ 'up_arrow' ] = 'w';
		map[ 's' ] = map[ 'down_arrow' ] = 's';
		map[ 'a' ] = map[ 'left_arrow' ] = 'a';
		map[ 'd' ] = map[ 'right_arrow' ] = 'd';
		
		// qe
		
		map[ 'q' ] = 'q';
		map[ 'e' ] = 'e';
		
		// numbers
		
		map[ '1' ] = '1';
		map[ '2' ] = '2';
		map[ '3' ] = '3';
		map[ '4' ] = '4';
		map[ '5' ] = '5';
		map[ '6' ] = '6';
		
		// misc
		
		map[ 'escape' ] = 'escape'
		map[ 'space' ] = 'space';
		
		// set list of keys that are always available
		
		map.alwaysAvailable = ['escape'];
		
		// set default as current
		
		set_keybindings( map );
		
	}
	
	function set_keybindings ( map ) {
		
		var key;
		
		// reset keybindings
		
		keybindings = {};
		
		// set all new keybindings in map
		
		for ( key in map ) {
			
			if ( map.hasOwnProperty( key ) === true ) {
				
				keybindings[ key ] = map[ key ];
				
			}
			
		}
		
	}
	
	/*===================================================
    
    controls
    
    =====================================================*/
	
	function init_controls () {
		
		// start control immediately
		
		allow_control();
		
	}
	
	function allow_control () {
		
		// signals
		
		shared.signals.onGamePointerTapped.add( trigger_key );
		shared.signals.onGamePointerDoubleTapped.add( trigger_key );
		shared.signals.onGamePointerHeld.add( trigger_key );
		shared.signals.onGamePointerDragStarted.add( trigger_key );
		shared.signals.onGamePointerDragged.add( trigger_key );
		shared.signals.onGamePointerDragEnded.add( trigger_key );
		shared.signals.onGamePointerWheel.add( trigger_key );
		
		shared.signals.onKeyPressed.add( trigger_key );
		shared.signals.onKeyReleased.add( trigger_key );
		
	}
	
	function remove_control () {
		
		// clear keys
		
		actions.clear_active();
		
		// signals
		
		shared.signals.onGamePointerTapped.remove( trigger_key );
		shared.signals.onGamePointerDoubleTapped.remove( trigger_key );
		shared.signals.onGamePointerHeld.remove( trigger_key );
		shared.signals.onGamePointerDragStarted.remove( trigger_key );
		shared.signals.onGamePointerDragged.remove( trigger_key );
		shared.signals.onGamePointerDragEnded.remove( trigger_key );
		shared.signals.onGamePointerWheel.remove( trigger_key );
		
		shared.signals.onKeyPressed.remove( trigger_key );
		shared.signals.onKeyReleased.remove( trigger_key );
		
	}
	
	/*===================================================
    
    actions
    
    =====================================================*/
	
	function trigger_key ( e ) {
		
		var kbMap = keybindings,
			keyCode,
			keyName,
			keyNameActual,
			state,
			type,
			isAlwaysAvailable,
			cameraRotated;
		
		// check for meta keys
		
		if ( e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ) {
			return;
		}
		
		// handle by type
		
		type = ( e.type + '' );
		
		// special cases for pointer / mouse
		
		if ( type === 'tap' || type === 'doubletap' || type === 'hold' || type === 'dragstart' || type === 'drag' || type === 'dragend' ) {
			
			keyName = 'pointer';
			state = type;
			
		}
		else if ( type === 'mousewheel' || type === 'DOMMouseScroll' ) {
			
			keyName = 'pointer';
			state = 'wheel';
			
		}
		// fallback to key press
		else {
			
			keyCode = ( ( e.which || e.key || e.keyCode ) + '' ).toLowerCase();
			keyName = _KeyHelper.key( keyCode );
			
			state = type.toLowerCase();
			state = state.replace( 'key', '' );
			
		}
		
		// get mapped key name
		
		keyNameActual = kbMap[ keyName ] || keyName;
		
		// if enabled or key is always available
		
		isAlwaysAvailable = main.index_of_value( kbMap.alwaysAvailable, keyNameActual ) !== -1;
		
		if ( enabled === true || isAlwaysAvailable ) {
			
			parameters = {
				event: e,
				allowDefault: isAlwaysAvailable || main.paused
			};
			
			// perform character action
			
			character.actions.execute( keyNameActual, state, parameters );
			
			// perform action
			
			actions.execute( keyNameActual, state, parameters );
			
		}
		
	}
	
	/*===================================================
    
    selection functions
    
    =====================================================*/
	
	function select ( parameters ) {
		
		var selectedMesh,
			selectedModel,
			targetsNum = 0,
			targetsNumMax,
			pointer,
			character,
			targeting,
			targets,
			targetsToRemove,
			materialIndex;
		
		// handle parameters
		
		parameters = parameters || {};
		
		pointer = parameters.pointer = parameters.pointer || main.get_pointer( parameters );
		
		character = parameters.character || character;
		
		targetsNumMax = parameters.targetsNumMax || 1;
		
		targeting = character.targeting;
		
		targets = targeting.targets;
		
		targetsToRemove = targeting.targetsToRemove;
		
		// select
			
		selectedModel = main.get_pointer_intersection( {
			pointer: pointer,
			// TODO: objects
			hierarchySearch: true,
			hierarchyIntersect: true,
			objectOnly: true
		} );
		
		// if a selection was made
		
		if ( typeof selectedModel !== 'undefined' && selectedModel.targetable === true ) {
			
			// todo
			// special selection cases
			
			// add selected to character targets
			// unless already selected, then add to removal list
			
			if ( main.index_of_value( targets, selectedModel ) === -1 ) {
				
				// check current length of targets
				// if at or over max num targets, remove earliest
				
				if ( targets.length >= targetsNumMax ) {
					
					targetsToRemove.push( targets[ 0 ] );
					
					deselect( parameters );
					
				}
				
				targets.push( selectedModel );
				/*
				 * TODO: fix for single material case
				selectedMesh = selectedModel.mesh;
				
				materialIndex = main.index_of_value( selectedMesh.material, selecting.material );
				
				if ( materialIndex === -1 ) {
					
					selectedMesh.material.push( selecting.material );
					
				}
				*/
			}
			else {
				
				targetsToRemove.push( selectedModel );
				
			}
			
			// update num targets
			
			targetsNum = targets.length;
			
			// set selected as current selection
			
			targeting.targetCurrent = selectedModel;
			
		}
		// else deselect all
		else {
			
			if ( targets.length > 0 ) {
				
				targeting.targetsToRemove = targetsToRemove.concat( targets );
				
				deselect( parameters );
				
			}
			
		}
		
		return targetsNum;
	}
	
	function deselect ( parameters ) {
		
		var i, l,
			character,
			targeting,
			targets,
			targetsToRemove,
			targetIndex,
			targetModel,
			targetMesh,
			materialIndex;
		
		// handle parameters
		
		parameters = parameters || {};
		
		character = parameters.character || character;
		
		targeting = character.targeting;
		
		targets = targeting.targets;
		
		targetsToRemove = targeting.targetsToRemove;
		
		// for each target to remove
		
		for ( i = targetsToRemove.length - 1, l = 0; i >= l; i -= 1 ) {
			
			targetModel = targetsToRemove[ i ];
			
			targetMesh = targetModel;//.mesh;
			
			// find in targets and remove
			
			targetIndex = main.index_of_value( targets, targetModel );
			
			if ( targetIndex !== -1 ) {
				
				targets.splice( targetIndex, 1 );
				
			}
			
			/* TODO: fix for no multimaterials
			// remove selecting material
			
			materialIndex = main.index_of_value( targetMesh.material, selecting.material );
			
			if ( materialIndex !== -1 ) {
				
				targetMesh.material.splice( materialIndex, 1 );
				
			}
			*/
			
			// remove from targetsToRemove
			
			targetsToRemove.splice( i, 1 );
			
		}
		
	}
	
	function update_selections ( timeDelta ) {
		
		var material = selecting.material,
			opacityMax = selecting.opacityMax,
			opacityMin = selecting.opacityMin,
			opacityStart = selecting.opacityStart,
			opacityTarget = selecting.opacityTarget,
			opacityTargetLast,
			opacityDelta = opacityTarget - opacityStart,
			opacityCycleTime,
			opacityCycleTimeMax = selecting.opacityCycleTimeMax;
		
		// update time
		
		selecting.opacityCycleTime += timeDelta;
		
		if ( selecting.opacityCycleTime >= opacityCycleTimeMax ) {
			
			material.opacity = opacityTarget;
			
			selecting.opacityCycleTime = 0;
			
			// update start and target
			
			opacityTargetLast = opacityTarget;
			
			selecting.opacityTarget = opacityStart;
			
			selecting.opacityStart = opacityTargetLast;
			
		}
		else {
		
			opacityCycleTime = selecting.opacityCycleTime;
			
			// quadratic easing
			
			opacityCycleTime /= opacityCycleTimeMax * 0.5;
			
			if ( opacityCycleTime < 1 ) {
				
				material.opacity = opacityDelta * 0.5 * opacityCycleTime * opacityCycleTime + opacityStart;
				
			}
			else {
				
				opacityCycleTime--;
				
				material.opacity = -opacityDelta * 0.5 * ( opacityCycleTime * ( opacityCycleTime - 2 ) - 1 ) + opacityStart;
				
			}
			
		}
		
	}
	
	/*===================================================
    
    custom functions
    
    =====================================================*/
	
	function pause () {
		
		disable();
		
		shared.signals.onGameResumed.add( resume );
		
	}
	
	function resume () {
			
		shared.signals.onGameResumed.remove( resume );
		
		enable();
		
	}
	
	function enable () {
		
		if ( main.started === true && enabled !== true ) {
			
			enabled = true;
			
			shared.signals.onGameUpdated.add( update );
		
		}
		
	}
	
	function disable () {
		
		// set enabled state
		
		enabled = false;
		
		// clear actions
		
		actions.clear_active();
		character.actions.clear_active();
		
		// pause updating
		
		shared.signals.onGameUpdated.remove( update );
		
	}
	
	function show () {
		
		if ( showing === false ) {
			
			main.scene.add( character );
			character.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI );
			_PhysicsHelper.rotate_relative_to_source ( character.quaternion, character.position, main.world, character.rigidBody.up, character.rigidBody.forward, 1, character.rigidBody )
			
			showing = true;
			
			allow_control();
			
		}
		
	}
	
	function hide () {
		
		if ( showing === true ) {
			
			remove_control();
			
			disable();
			
			main.scene.remove( character );
			
			showing = false;
			
		}
		
	}
	
	function update ( timeDelta, timeDeltaMod ) {
		
		// character
		
		character.update( timeDelta, timeDeltaMod );
		
		// selection material
		
		update_selections( timeDelta );
		
	}
	
} ( OGSUS ) );