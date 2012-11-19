/*
 *
 * ErrorHandler.js
 * Handles compatibility checks and user viewable errors.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/utils/ErrorHandler.js",
        _ErrorHandler = {},
        errorState = false,
        errorCurrent = {},
		errorStringSearch = shared.errorString + '=',
        webGLNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    _ErrorHandler.check = check;
    _ErrorHandler.generate = generate;
    _ErrorHandler.process = process;
    _ErrorHandler.clear = clear;
	
	Object.defineProperty( _ErrorHandler, 'errorState', { 
		get : function () { return errorState; }
	} );
	
	main.asset_register( assetPath, {
		data: _ErrorHandler,
		requirements: [
			"js/kaiopua/ui/UI.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
    
    /*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( ui ) {
		
		var i, l,
			errorName,
			canvas, 
			context, 
			errorType;
		
		
		_UI = ui;
		
		// signals
		
		shared.signals = shared.signals || {};
		
		shared.signals.onError = new signals.Signal();
		
		// clean url
		
		history.pushState( { "pState": shared.originLink }, '', shared.originLink );
		
		// webgl browser check
		if ( !window.WebGLRenderingContext ) {
			
			errorType = 'WebGLBrowser';
			
		}
		else {
			
			canvas = document.createElement( 'canvas' );
			
			// try each browser's webgl type
			
			for (i = 0, l = webGLNames.length; i < l; i += 1) {
				
				try {
					
					context = canvas.getContext( webGLNames[i] );
					
				}
				catch ( e ) {
				
				}
				
				if ( context ) {
					
					break;
					
				}
				
			}
			
			// if none found, there is another problem
			if ( !context ) {
				
				errorType = 'WebGLComputer';
				
			}
			
		}
		
		// if error found, flag
		if ( typeof errorType === 'string' ) {
			
			flag( errorType );
			
		}
		
	}
    
    /*===================================================
    
    functions
    
    =====================================================*/
	
	// check for errors
    function check () {
		
        // clear current errors
        clear();
        
        // read flagged errors
        read();
        
        return errorState;
		
    }
    
    // remove error state
    function clear () {
		
        errorCurrent = {};
        errorState = false;
		
    }
	
	// read flagged error
    function read () {
		
        var hashError, 
			hashErrorIndex;
        
        // check url hash for error message
		
        hashError = window.location.hash.toString().replace( /#/, '' );
        hashErrorIndex = hashError.indexOf( errorStringSearch );
		
        if (hashErrorIndex != -1) {
			
            // get error type
            errorCurrent.type = hashError.replace( errorStringSearch, '' );
            
            // set error state
            errorState = true;
			
        }
		
    }
	
	// generate error
    function generate ( error, origin, lineNumber ) {
		
        if (typeof error !== 'undefined') {
			
            // flag error
            flag( error );
            
            // check for flagged errors
            check();
            
            // process errors
            process( origin, lineNumber );
			
        }
		
    }
    
    // flag error
    function flag ( errorType ) {
		
        if (typeof errorType !== 'undefined') {
			
            window.location.hash = errorStringSearch + errorType;
			
        }
		
    }
    
    // process error state
    function process ( origin, lineNumber ) {
		
        if (errorState === true) {
			
            // show current
			
            _UI.error( errorCurrent.type, origin, lineNumber );
            
            // set url back to origin link with history states
            // always hide unnecessary information from users
			
            history.pushState( { "pState": shared.originLink }, '', shared.originLink );
            
            // trigger shared error signal
			
            shared.signals.onError.dispatch( errorCurrent.type, origin || 'Unknown Origin', lineNumber || 'N/A' );
			
        }
		
    }
    
} ( KAIOPUA ) );