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
        errorCurrent,
        webGLNames = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
    /*===================================================
    
    public properties
    
    =====================================================*/
    
    _ErrorHandler.generate = generate;
    _ErrorHandler.process = process;
	
	Object.defineProperty( _ErrorHandler, 'error', { 
		get : function () { return errorCurrent; }
	} );
	
	Object.defineProperty( _ErrorHandler, 'errorState', { 
		get : function () {
			
			if ( typeof errorCurrent === 'string' ) {
				
				return true;
				
			}
			else {
				
				return false;
				
			}
			
		}
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
		
		shared.signals = shared.signals || {};
		shared.signals.onError = new signals.Signal();
		
		try {
			
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
		
		}
		catch ( err ) {
			
			errorType = shared.errorTypeGeneral;
			
		}
		
		errorCurrent = errorType;
		
	}
    
    /*===================================================
    
    functions
    
    =====================================================*/
	
	// generate error
    function generate ( error, origin, lineNumber ) {
		
        if (typeof error !== 'undefined') {
			
            errorCurrent = error;
            
            process( origin, lineNumber );
			
        }
		
    }
    
    // process error state
    function process ( origin, lineNumber ) {
		
        if ( _ErrorHandler.errorState === true ) {
			
            // show error
			
            _UI.error( errorCurrent, origin, lineNumber );
			
            // trigger shared error signal
			
            shared.signals.onError.dispatch( errorCurrent.type, origin || 'Unknown Origin', lineNumber || 'N/A' );
			
        }
		
    }
    
} ( KAIOPUA ) );