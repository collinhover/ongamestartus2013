/*
 *
 * Tooltip.js
 * General use tooltip for hovering or selecting.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/ui/Tooltip.js",
		_Tooltip = {},
		_Popover;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Tooltip,
		requirements: [
			"js/kaiopua/ui/Popover.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( po ) {
		
		_Popover = po;
		
		// properties
		
		_Tooltip.options = {
			placement: 'left',
			template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
			inner: '.tooltip-inner'
		};
		
		// instance
		
		_Tooltip.Instance = Tooltip;
		_Tooltip.Instance.prototype = new _Popover.Instance();
		_Tooltip.Instance.prototype.constructor = _Tooltip.Instance;
		_Tooltip.Instance.prototype.supr = _Popover.Instance.prototype;
		
		_Tooltip.Instance.prototype.show = show;
		_Tooltip.Instance.prototype.hide = hide;
		_Tooltip.Instance.prototype.remove = remove;
		
		_Tooltip.Instance.prototype.update_placement = update_placement;
		
		_Tooltip.Instance.prototype.follow = follow;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Tooltip ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.options = $.extend( true, {}, _Tooltip.options, parameters.options );
		
		// prototype constructor
		
		_Popover.Instance.call( this, parameters );
		
		this.$arrow = $( parameters.arrow || parameters.$arrow || this.$element.find( '.tooltip-arrow' ) );
		
	}
	
	/*===================================================
    
    show / hide
    
    =====================================================*/
	
	function show ( pointer ) {
		
		_Tooltip.Instance.prototype.supr.show.apply( this, arguments );
		
		this.pointer = pointer || this.pointer;
		
		shared.signals.onGamePointerMoved.add( this.follow, this );
		this.follow( undefined, this.pointer );
		
		return this;
		
	}
	
	function hide () {
		
		shared.signals.onGamePointerMoved.remove( this.follow, this );
		
		return _Tooltip.Instance.prototype.supr.hide.apply( this, arguments );
		
	}
	
	function remove () {
		
		shared.signals.onGamePointerMoved.remove( this.follow, this );
		
		return _Tooltip.Instance.prototype.supr.remove.apply( this, arguments );
		
	}
	
	/*===================================================
    
    position
    
    =====================================================*/
	
	function update_placement ( placement ) {
		
		_Tooltip.Instance.prototype.supr.update_placement.apply( this, arguments );
		
		if ( typeof placement === 'string' ) {
			
			// offsets
			
			this.offset.top = 0;
			
			if ( placement === 'topright' || placement === 'bottomright' ) {
				
				this.offset.left = -( this.$arrow.outerWidth() * 0.5 + parseInt( this.$arrow.css( 'margin-left' ) ) );
				
			}
			else if ( placement === 'topleft' || placement === 'bottomleft' ) {
				
				this.offset.left = this.$arrow.outerWidth() * 0.5 + parseInt( this.$arrow.css( 'margin-right' ) );
				
			}
			else {
				
				this.offset.left = 0;
				
			}
			
		}
		
		return this;
		
	}
	
	/*===================================================
    
    follow
    
    =====================================================*/
	
	function follow ( e, pointer ) {
		
		pointer = pointer || main.get_pointer( e );
		
		if ( this.pointer === pointer ) {
			
			this.reposition( pointer.x, pointer.y );
			
		}
		
		return this;
		
	}
	
} ( KAIOPUA ) );