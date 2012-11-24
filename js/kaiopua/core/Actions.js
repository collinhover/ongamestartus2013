/*
 *
 * Actions.js
 * Action handler for player, character, etc.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/core/Actions.js",
		_Actions = {},
		actionCount = 0,
		actionOptions = {
			priority: 0,
			blocking: false,
			silencing: false,
			type: 'action_untyped'
		};
	
	/*===================================================
    
    public
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, { 
		data: _Actions
	} );
	
	/*===================================================
    
    init
    
    =====================================================*/
	
	function init_internal() {
		
		// functions
		
		_Actions.Instance = Actions;
		_Actions.Instance.prototype.constructor = _Actions.Instance;
		
		_Actions.Instance.prototype.add = add;
		_Actions.Instance.prototype.remove = remove;
		_Actions.Instance.prototype.execute = execute;
		
		_Actions.Instance.prototype.is_active = is_active;
		_Actions.Instance.prototype.clear_active = clear_active;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Actions () {
		
		this.map = {};
		this.actionNames = [];
		this.actionsByType = {};
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function handle_names ( names ) {
		
		var namesList;
		
		// handle names
		
		if ( typeof names === 'string' ) {
			
			namesList = names.replace(/\s{2,}/g, ' ').split( ' ' );
			
		}
		else {
			
			namesList = main.to_array( names );
			
		}
		
		return namesList;
		
	}
	
	function sort_priority ( a, b ) {
		
		return b.options.priority - a.options.priority;
		
	}
	
	/*===================================================
    
    add / remove
    
    =====================================================*/
	
	function add ( actions ) {
		
		var i, il,
			j, jl,
			parameters,
			names,
			namesList,
			name,
			nameActions,
			action,
			type;
		
		actions = main.to_array( actions );
		
		for ( i = 0, il = actions.length; i < il; i++ ) {
			
			parameters = actions[ i ];
			names = parameters.names;
			namesList = handle_names( names );
			
			// remove all previous actions at names
			
			if ( parameters.clean === true ) {
				
				this.remove( namesList );
				
			}
			
			// for each name
			
			for ( j = 0, jl = namesList.length; j < jl; j++ ) {
				
				name = namesList[ j ];
				nameActions = this.map[ name ] = this.map[ name ] || [];
				
				action = new Action( parameters );
				type = action.options.type;
				
				if ( typeof this.actionsByType[ type ] === 'undefined' ) {
					
					this.actionsByType[ type ] = [];
					
				}
				
				main.array_cautious_add( this.actionsByType[ type ], action );
				
				nameActions.push( action );
				nameActions.sort( sort_priority );
				
				main.array_cautious_add( this.actionNames, name );
				
			}
			
		}
		
	}
	
	function remove ( names ) {
		
		var i, l,
			j, k,
			namesList = handle_names( names ),
			name,
			nameActions,
			action,
			type,
			index;
		
		// for each name
		
		for ( i = 0, l = namesList.length; i < l; i++ ) {
			
			name = namesList[ i ];
			
			if ( this.map.hasOwnProperty( name ) ) {
				
				nameActions = this.map[ name ];
				
				// deactivate each action
				
				for ( j = 0, k = nameActions.length; j < k; j++ ) {
					
					action = nameActions[ j ];
					
					action.deactivate();
					type = action.options.type;
					
					main.array_cautious_remove( this.actionsByType[ type ], action );
					
					if ( this.actionsByType[ type ].length === 0 ) {
						
						delete this.actionsByType[ type ];
						
					}
					
				}
				
				delete this.map[ name ];
				main.array_cautious_remove( this.actionNames, name );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    execute
    
    =====================================================*/
	
	function execute ( name, eventName, parameters ) {
		
		var i, l,
			nameActions,
			action,
			executable;
		
		if ( this.map.hasOwnProperty( name ) ) {
			
			nameActions = this.map[ name];
			
			for ( i = 0, l = nameActions.length; i < l; i++ ) {
				
				action = nameActions[ i ];
				
				executable = action.execute( eventName, parameters );
				
				if ( ( action.options.silencing === true || ( executable === true && action.options.blocking === true ) ) && action.active === true ) {
					
					break;
					
				}
				
			}
		
		}
		
	}
	
	/*===================================================
    
    activity
    
    =====================================================*/
	
	function is_active ( names ) {
		
		var i, il,
			j, jl,
			name,
			nameActions,
			typeActions;
		
		if ( typeof names !== 'undefined' ) {
			
			names = main.to_array( names );
			
			for ( i = 0, il = names.length; i < il; i++ ) {
				
				name = names[ i ];
				
				// try name in map
				
				if ( this.map.hasOwnProperty( name ) && this.map[ name ].active ) {
				
					return true;
					
				}
				
				// try name as type
				
				if ( this.actionsByType.hasOwnProperty( name ) ) {
					
					typeActions = this.actionsByType[ name ];
					
					for ( j = 0, jl = typeActions.length; j < jl; j++ ) {
						
						if ( typeActions[ j ].active ) {
							
							return true;
							
						}
						
					}
					
				}
				
			}
			
		}
		else {
			
			// for each action name
			
			for ( i = 0, il = this.actionNames.length; i < il; i++ ) {
				
				nameActions = this.map[ this.actionNames[ i ] ];
				
				for ( j = 0, jl = nameActions.length; j < jl; j++ ) {
					
					if ( nameActions[ j ].active) {
						
						return true;
						
					}
					
				}
				
			}
			
		}
		
		return false;
		
	}
	
	function clear_active () {
		
		var i, l,
			j, k,
			nameActions;
		
		// for each action name
		
		for ( i = 0, l = this.actionNames.length; i < l; i++ ) {
			
			nameActions = this.map[ this.actionNames[ i ] ];
			
			for ( j = 0, k = nameActions.length; j < k; j++ ) {
				
				nameActions[ j ].deactivate();
				
			}
			
		}
		
	}
	
	/*===================================================
    
    action instance
    
    =====================================================*/
	
	function Action ( parameters ) {
		
		var name,
			deactivateCallbacks,
			deactivateCallback,
			index;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// options
		
		this.options = $.extend( true, {}, actionOptions, parameters.options );
		
		// properties
		
		this.id = actionCount++;
		this.eventCallbacks = parameters.eventCallbacks || {};
		this.deactivateCallbacks = main.to_array( parameters.deactivateCallbacks );
		
		this.eventsActive = [];
		this.activeCheck = parameters.activeCheck || {};
		
		// for each list of eventCallbacks
		
		for ( name in this.eventCallbacks ) {
			
			if ( this.eventCallbacks.hasOwnProperty( name ) ) {
				
				// ensure is array
				
				this.eventCallbacks[ name ] = main.to_array( this.eventCallbacks[ name ] );
				
			}
			
		}
		
	}
	
	Action.prototype = {
		
		execute: function ( eventName, parameters ) {
			
			var i, l,
				eventCallbacks,
				callback,
				executable = this.eventCallbacks.hasOwnProperty( eventName ),
				isDeactivate;
			
			if ( executable ) {
				
				parameters = parameters || {};
				
				isDeactivate = this.is_deactivate_callback( eventName );
				
				// execute each eventCallback
				
				eventCallbacks = this.eventCallbacks[ eventName ];
				
				for ( i = 0, l = eventCallbacks.length; i < l; i++ ) {
					
					callback = eventCallbacks[ i ];
					
					if ( isDeactivate !== true ) isDeactivate = this.is_deactivate_callback( callback );
					
					callback( parameters );
					
				}
				
				// if event passed
				
				if ( parameters.event && parameters.allowDefault !== true ) {
					
					parameters.event.preventDefault();
					
				}
				
				if ( isDeactivate === true ) {
					
					this.reset();
					
				}
				else {
					
					main.array_cautious_add( this.eventsActive, eventName );
					
				}
				
			}
			
			return executable;
			
		},
		
		deactivate: function () {
			
			var i, il,
				callbacks = this.deactivateCallbacks,
				callback;
			
			for ( i = 0, il = callbacks.length; i < il; i++ ) {
				
				callback = callbacks[ i ];
				
				if ( typeof callback === 'function' ) {
					
					callback();
					
				}
				else if ( typeof callback === 'string' && this.eventCallbacks.hasOwnProperty( callback ) ) {
					
					this.execute( callback );
					
				}
				
			}
			
			this.reset();
			
		},
		
		is_deactivate_callback: function ( callback ) {
			
			var i, il,
				callbacks = this.deactivateCallbacks;
			
			for ( i = 0, il = callbacks.length; i < il; i++ ) {
				
				if ( callback === callbacks[ i ] ) {
					
					return true;
					
				}
				
			}
			
			return false;
			
		},
		
		reset: function () {
			
			this.eventsActive = [];
			
		}
		
	};
	
	Object.defineProperty( Action.prototype, 'active', { 
		get : function () { 
			
			// if has check
			if ( typeof this.activeCheck === 'function' ) {
				
				return this.activeCheck();
				
			}
			// else default
			else {
				
				return this.eventsActive.length > 0;
				
			}
			
		}
	});
	
} (KAIOPUA) );