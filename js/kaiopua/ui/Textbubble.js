/*
 *
 * Textbubble.js
 * General use Textbubble for npc interaction.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/ui/Textbubble.js",
		_Textbubble = {},
		_Popover;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Textbubble,
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
		console.log('internal Textbubble', _Textbubble);
		_Popover = po;
		
		// properties
		
		_Textbubble.options = {
			placement: 'topleft',
			template: '<div class="textbubble bottom"><div class="textbubble-arrow"></div><div class="textbubble-ring"><div class="textbubble-ring-inner"></div></div><div class="textbubble-inner"><div class="textbubble-content"><div class="textbubble-content-inner">Hello world, it looks like a good day!</div></div></div></div>',
			inner: '.textbubble-content-inner'
		};
		
		// instance
		
		_Textbubble.Instance = Textbubble;
		_Textbubble.Instance.prototype = new _Popover.Instance();
		_Textbubble.Instance.prototype.constructor = _Textbubble.Instance;
		_Textbubble.Instance.prototype.supr = _Popover.Instance.prototype;
		
		_Textbubble.Instance.prototype.show = show;
		_Textbubble.Instance.prototype.hide = hide;
		
		_Textbubble.Instance.prototype.update_placement = update_placement;
		
		_Textbubble.Instance.prototype.follow = follow;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Textbubble ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.options = $.extend( true, {}, _Textbubble.options, parameters.options );
		
		// prototype constructor
		
		_Popover.Instance.call( this, parameters );
		
		this.$arrow = $( parameters.arrow || parameters.$arrow || this.$element.find( '.textbubble-arrow' ) );
		
	}
	
	/*===================================================
    
    show / hide
    
    =====================================================*/
	
	function show ( pointer ) {
		
		_Textbubble.Instance.prototype.supr.show.apply( this, arguments );
		
		this.pointer = pointer;
		
		shared.signals.onGamePointerMoved.add( this.follow, this );
		this.follow( undefined, this.pointer );
		
	}
	
	function hide () {
		
		shared.signals.onGamePointerMoved.remove( this.follow, this );
		this.pointer = undefined;
		
		return _Textbubble.Instance.prototype.supr.hide.apply( this, arguments );
		
	}
	
	/*===================================================
    
    position
    
    =====================================================*/
	
	function update_placement ( placement ) {
		
		_Textbubble.Instance.prototype.supr.update_placement.apply( this, arguments );
		
		if ( typeof placement === 'string' ) {
			
			// add placement to element
			
			this.$element.addClass( placement );
			
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
			
			this.reposition( pointer );
			
		}
		
		return this;
		
	}
	
} ( KAIOPUA ) );