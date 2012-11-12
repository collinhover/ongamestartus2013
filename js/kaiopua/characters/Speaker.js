/*
 *
 * Speaker.js
 * General collision based Speaker.
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
		console.log('internal Speaker', _Speaker);
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
			dialogues: {
				greeting: {
					responses: [
						{
							message: "Hi!",
							next: 'about'
						},
						{
							message: "Sup son?",
							next: 'fun'
						},
						{
							message: "Yo!",
							next: 'unsaid'
						},
						{
							message: "Check it out:",
							next: 'random'
						},
						"Hey friend!"
					],
					randomable: false
				},
				about: {
					responses: "I'll be presenting about web gaming and development at oGS 2013. I <3 web and gaming!"
				},
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
		
		// functions
		
		_Speaker.load = load;
		
		// instance
		
		_Speaker.Instance = Speaker;
		_Speaker.Instance.prototype = new _Character.Instance();
		_Speaker.Instance.prototype.constructor = _Speaker.Instance;
		
	}
	
	/*===================================================
    
    load
    
    =====================================================*/
	
	function load ( url ) {
		
		
		
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