/*
 *
 * Obstacle.js
 * General collision based obstacle.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/physics/Obstacle.js",
		_Obstacle = {},
		_Model;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Obstacle,
		requirements: [
			"js/game/core/Model.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( m ) {
		console.log('internal Obstacle', _Obstacle);
		// modules
		
		_Model = m;
		
		// properties
		
		_Obstacle.defaults = {
			physics: {
				bodyType: 'box'
			}
		};
		
		// instance
		
		_Obstacle.Instance = Obstacle;
		_Obstacle.Instance.prototype = new _Model.Instance();
		_Obstacle.Instance.prototype.constructor = _Obstacle.Instance;
		
	}
	
	/*===================================================
    
    obstacle
    
    =====================================================*/
	
	function Obstacle ( parameters ) {
		
		var d = _Obstacle.defaults,
			physics;
		
		parameters = parameters || {};
		
		physics = parameters.physics = parameters.physics || {};
		physics.bodyType = physics.bodyType || d.physics.bodyType;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
	}
	
} ( OGSUS ) );