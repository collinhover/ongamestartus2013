/*
 *
 * Speaker.js
 * Speaker npc.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/characters/Speaker.js",
		_Speaker = {},
		_Character;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Speaker,
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
		
		// modules
		
		_Character = c;
		
		// properties
		
		_Speaker.options = {
			interactive: true,
			physics: {
				bodyType: 'box',
				movementOffsetPct: 0,
				gravityOffsetPct: 0
			},
			stats: {
				invincible: true
			},
			animation: {
				options: {
					idle: {
						startDelay: true,
						loopDelayPct: 1,
						loopDelayRandom: true,
						loopChance: 0.2
					}
				}
			},
			dialogues: {
				greeting: {
					responses: [
						{
							message: "Nice to meet you!",
							next: 'name'
						},
						{
							message: "Hi!",
							next: 'unsaid'
						},
						{
							message: "Hey friend!",
							next: 'random'
						}
					],
					randomable: false
				},
				name: {
					responses: {
						message: function () { return ( Math.random() > 0.5 ? "I'm " : "My name is " ) + this.name + "."; },
						next: 'presenting'
					},
					randomable: false
				},
				presenting: "I'm presenting at oGS 2013.",
				about: "I <3 web and gaming!",
				fun: "oGS 2013 or bust!",
				goodbye: {
					responses: [
						"See ya!",
						"Cheers!",
						"Bye!"
					],
					random: true,
					randomable: false
				}
			}
		};
		
		// instance
		
		_Speaker.Instance = Speaker;
		_Speaker.Instance.prototype = new _Character.Instance();
		_Speaker.Instance.prototype.constructor = _Speaker.Instance;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Speaker ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.name = typeof parameters.name === 'string' && parameters.name.length > 0 ? parameters.name : 'Speaker';
		
		// TODO: physics parameters should be handled by options
		
		parameters.options = $.extend( true, {}, _Speaker.options, parameters.options );
		parameters.physics = $.extend( {}, _Speaker.options.physics, parameters.physics );
		
		// prototype constructor
		
		_Character.Instance.call( this, parameters );
		
	}
	
	
} ( KAIOPUA ) );