/*
 *
 * NonPlayer.js
 * General collision based NonPlayer.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/characters/NonPlayer.js",
		_NonPlayer = {},
		_Character;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _NonPlayer,
		requirements: [
			"js/kaiopua/characters/Character.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( c ) {
		console.log('internal NonPlayer', _NonPlayer);
		// modules
		
		_Character = c;
		
		// properties
		
		_NonPlayer.options = {
			communication: {
				charactersPerStatement: 50,
				wordsPerStatement: 10
			}
		};
		
		// instance
		
		_NonPlayer.Instance = NonPlayer;
		_NonPlayer.Instance.prototype = new _Character.Instance();
		_NonPlayer.Instance.prototype.constructor = _NonPlayer.Instance;
		
		_NonPlayer.Instance.prototype.communicate = communicate;
		_NonPlayer.Instance.prototype.silence = silence;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function NonPlayer ( parameters ) {
		
		var me = this,
			actionCallbacks = {},
			dialogueName;
		
		// handle parameters
		
		parameters = parameters || {};
		
		// TODO: physics parameters should be handled by options
		
		parameters.options = $.extend( true, {}, _NonPlayer.options, parameters.options );
		parameters.physics = $.extend( {}, _NonPlayer.options.physics, parameters.physics );
		
		// prototype constructor
		
		_Character.Instance.call( this, parameters );
		
		// init conversations
		
		this.communicating = false;
		
		this.conversations = {};
		this.conversations.names = [];
		this.conversations.said = [];
		this.conversations.unsaid = [];
		this.conversations.randomable = [];
		this.conversations.randomableUnsaid = [];
		this.conversations.dialogueData = {};
		
		// handle dialogues
		
		for ( dialogueName in this.options.dialogues ) {
			
			actionCallbacks[ dialogueName ] = add_dialogue.call( this, dialogueName );
			
		}
		
		// init actions for conversations
		
		actionCallbacks.silence = $.proxy( this.silence, this );
		
		this.actions.add( {
			names: 'communicate',
			eventCallbacks: actionCallbacks,
			deactivateCallbacks: 'silence',
			activeCheck: $.proxy( function () { return this.communicating; }, this )
		} );
		
	}
	
	function add_dialogue ( dialogueName ) {
		
		var me = this,
			dialogue = this.options.dialogues[ dialogueName ];
		
		// record dialogue in lists
		
		main.array_cautious_add( this.conversations.names, dialogueName );
		main.array_cautious_add( this.conversations.unsaid, dialogueName );
		
		if ( dialogue.randomable !== false ) {
			
			main.array_cautious_add( this.conversations.randomable, dialogueName );
			main.array_cautious_add( this.conversations.randomableUnsaid, dialogueName );
			
		}
		
		// make action callback for dialogue
		
		return function () {
			
			me.communicate( dialogueName );
			
		};
		
	}
	
	/*===================================================
    
    communication
    
    =====================================================*/
	
	function communicate ( dialogueName ) {
		
		var i, il,
			conversations = this.conversations,
			dialogueData = conversations.dialogueData,
			dialogue = this.options.dialogues[ dialogueName ],
			data,
			saidAll,
			responses,
			response,
			message,
			next,
			randomable;
		
		if ( typeof dialogue !== 'undefined' ) {
			
			// data
			
			if ( dialogueData.hasOwnProperty( dialogueName ) !== true ) {
				
				dialogueData[ dialogueName ] = {
					said: []
				};
				
				// ensure dialogue correctly on randomable list
				
				if ( dialogue.randomable !== false ) {
					
					main.array_cautious_add( conversations.randomable, dialogueName );
					main.array_cautious_add( conversations.randomableUnsaid, dialogueName );
					
				}
				else {
					
					main.array_cautious_remove( conversations.randomable, dialogueName );
					main.array_cautious_remove( conversations.randomableUnsaid, dialogueName );
					
				}
				
			}
			
			data = dialogueData[ dialogueName ];
			
			// responses
		
			if ( typeof dialogue === 'string' ) {
				
				responses = dialogue;
				
			}
			else {
				
				responses = dialogue.responses;
				
			}
			
			// response
			
			if ( typeof responses === 'string' ) {
				
				response = responses;
				
			}
			else {
				
				// when all responses said, pick at random
				
				saidAll = dialogue.random === true || data.said.length === responses.length;
				
				if ( saidAll === true ) {
					
					response = main.array_random_value( responses );
					
				}
				// until all said, go through linearly
				else {
					
					for ( i = 0, il = responses.length; i < il; i++ ) {
						
						if ( main.index_of_value( data.said, responses[ i ] ) === -1 ) {
							
							response = responses[ i ];
							data.said.push( response );
							break;
							
						}
						
					}
					
				}
				
			}
			
			// message
			
			if ( typeof response === 'string' ) {
				
				message = response;
				
			}
			else {
				
				message = response.message;
				next = response.next;
				
			}
			
			// dialogue has now been said
			
			main.array_cautious_add( conversations.said, dialogueName );
			
			main.array_cautious_remove( conversations.unsaid, dialogueName );
			main.array_cautious_remove( conversations.randomableUnsaid, dialogueName );
			
			// communicate
			
			this.communicating = true;
			console.log( this.name, 'COMMUNICATING: ', message );
			
			// next dialogue
			
			if ( next === 'unsaid' ) {
				
				if ( conversations.randomableUnsaid.length > 0 ) {
					
					next = main.array_random_value( conversations.randomableUnsaid );
					
				}
				else {
					
					next = undefined;
					
				}
			
			}
			
			if ( next === 'random' ) {
				
				randomable = conversations.randomable.slice( 0 );
				main.array_cautious_remove( randomable, dialogueName );
				
				next = main.array_random_value( randomable );
				
			}
			
			if ( typeof next === 'string' && next !== dialogueName ) {
				
				this.communicate( next );
				
			}
			
		}
		
	}
	
	function silence () {
		
		this.communicating = false;
		
		// TODO
		
	}
	
	
} ( KAIOPUA ) );