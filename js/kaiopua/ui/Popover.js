/*
 *
 * Popover.js
 * General use popover.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/ui/Popover.js",
		_Popover = {},
		placementsClockwise = [ 'top', 'topright', 'right', 'bottomright', 'bottom', 'bottomleft', 'left', 'topleft' ],
		placementsCounterclockwise = [],
		indicesClockwise = {},
		indicesCounterclockwise = {};
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	init_internal();
	
	main.asset_register( assetPath, { 
		data: _Popover
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal () {
		
		var i, il, placement;
		
		// generate placements and indices
		
		for( i = 0, il = placementsClockwise.length; i < il; i++ ) {
			
			placement = placementsClockwise[ i ];
			indicesClockwise[ placement ] = i;
			indicesCounterclockwise[ placement ] = ( placementsClockwise.length - 1 ) - i;
			placementsCounterclockwise[ indicesCounterclockwise[ placement ] ] = placement;
			
		}
		
		// properties
		
		_Popover.options = {
			placement: 'top',
			template: '<div></div>',
			animate: false,
			checkBoundsClockwise: true,
			normalThreshold: 0.5
		};
		
		// instance
		
		_Popover.Instance = Popover;
		_Popover.Instance.prototype.constructor = _Popover.Instance;
		
		_Popover.Instance.prototype.reset = reset;
		_Popover.Instance.prototype.content = content;
		
		_Popover.Instance.prototype.show = show;
		
		_Popover.Instance.prototype.hide = hide;
		_Popover.Instance.prototype.hide_complete = hide_complete;
		
		_Popover.Instance.prototype.remove = remove;
		_Popover.Instance.prototype.remove_complete = remove_complete;
		
		_Popover.Instance.prototype.reposition = reposition;
		_Popover.Instance.prototype.check_bounds = check_bounds;
		_Popover.Instance.prototype.update_placement = update_placement;
		_Popover.Instance.prototype.update_position = update_position;
		_Popover.Instance.prototype.normal_to_placement = normal_to_placement;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Popover ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.options = $.extend( true, {}, _Popover.options, parameters.options );
		
		this.showing = false;
		
		this.$element = $( this.options.template );
		this.$inner = this.$element.find( this.options.inner );
		if ( this.$inner.length === 0 ) {
			
			this.$inner = this.$element;
			
		}
		this.$container = $( parameters.container || parameters.$container || shared.domElements.$uiOverGame || shared.domElements.$uiInGame || shared.domElements.$game );
		
		this.content( parameters.content );
		
		this.reset();
		
	}
	
	function reset () {
		
		this.position = { top: 0, left: 0 };
		this.positionBase = { top: 0, left: 0 };
		this.offset = { top: 0, left: 0 };
		
	}
	
	/*===================================================
    
    content
    
    =====================================================*/
	
	function content ( text ) {
		
		if ( typeof text === 'string' ) {
			
			this.$inner.html( text );
			
			//if ( this.showing ) {
				
				this.update_placement( this.placementCurrent, true ).update_position();
				this.$element.css( this.position );
				
			//}
			
			return this;
			
		}
		else {
			
			return this.$inner.html();
			
		}
		
	}
	
	/*===================================================
    
    show
    
    =====================================================*/
	
	function show ( options ) {
		
		if ( typeof options !== 'undefined' ) {
			
			this.options = $.extend( true, this.options, options );
			
		}
		
		if ( this.showing !== true ) {
			
			this.showing = true;
			
			this.$element
				.appendTo( this.$container )
				.addClass('in');
			
			if ( this.options.animate === true ) {
				
				main.dom_fade( {
					element: this.$element,
					duration: this.options.animateDuration,
					opacity: 1,
					initHidden: true
				} );
				
			}
			
			this.update_placement( this.options.placement, true );
			
		}
		
		return this;
		
	}
	
	/*===================================================
    
    hide
    
    =====================================================*/
	
	function hide () {
		
		var oneHidden;
		
		if ( this.showing !== false ) {
			
			this.showing = false;
			
			oneHidden = this.options.oneHidden;
			
			if ( typeof oneHidden === 'function' ) {
				
				delete this.options.oneHidden;
				oneHidden();
				
			}
			
			if ( typeof this.options.onHidden === 'function' ) {
				
				this.options.onHidden();
				
			}
			
			if ( this.options.animate === true ) {
				
				main.dom_fade( {
					element: this.$element,
					duration: this.options.animateDuration,
					callback: $.proxy( this.hide_complete, this )
				} );
				
			}
			else {
				
				this.hide_complete();
				
			}
			
		}
		else {
			
			this.hide_complete();
			
		}
		
		return this;
		
	}
	
	function hide_complete () {
		
		this.$element.removeClass('in').remove();
		
		return this;
		
	}
	
	/*===================================================
    
    remove
    
    =====================================================*/
	
	function remove () {
		
		if ( this.showing !== false ) {
			
			this.showing = false;
			
			oneRemoved = this.options.oneRemoved;
			
			if ( typeof oneRemoved === 'function' ) {
				
				delete this.options.oneRemoved;
				oneRemoved();
				
			}
			
			if ( typeof this.options.onRemoved === 'function' ) {
				
				this.options.onRemoved();
				
			}
			
			if ( this.options.animate === true ) {
				
				main.dom_fade( {
					element: this.$element,
					duration: this.options.animateDuration,
					callback: $.proxy( this.remove_complete, this )
				} );
				
			}
			else {
				
				this.remove_complete();
				
			}
			
		}
		else {
			
			this.remove_complete();
			
		}
		
		return this;
		
	}
	
	function remove_complete () {
		
		this.$element.removeClass('in').remove();
		
		this.reset();
		
		return this;
		
	}
	
	/*===================================================
    
    position
    
    =====================================================*/
	
	function reposition ( left, top ) {
		
		var i, il,
			placements,
			placement,
			indices,
			index,
			positionChanged;
			
		// left
		
		if ( main.is_number( left ) && this.positionBase.left !== left ) {
			
			positionChanged = true;
			this.positionBase.left = left;
			
		}
		
		// top
		
		if ( main.is_number( top ) && this.positionBase.top !== top ) {
			
			positionChanged = true;
			this.positionBase.top = top;
			
		}
			
		// change position
		
		if ( positionChanged === true ) {
			
			// handle bounds by checking each placement possibility until one found
			
			if ( this.options.checkBoundsClockwise !== true ) {
				
				placements = placementsCounterclockwise;
				indices = indicesCounterclockwise;
				
			}
			else {
				
				placements = placementsClockwise;
				indices = indicesClockwise;
				
			}
			
			placement = this.options.placement;
			index = indices[ placement ];
			
			for ( i = 0, il = placements.length; i < il; i++ ) {
				
				placement = placements[ index ];
				
				// change
				
				if ( this.placementCurrent !== placement ) {
					
					this.update_placement( placement );
					
				}
				
				this.update_position();
				
				// test
				
				if ( this.check_bounds() ) {
					
					break;
					
				}
				
				// update index
				
				index++;
				
				if ( index === il ) {
					
					index = 0;
					
				}
				
			}
			
			this.$element.css( this.position );
			
		}
		
		return this;
		
	}
	
	function check_bounds () {
		
		if ( this.position.top < 0 ) return false;
		else if ( this.position.top + this.elementHeight > shared.screenViewableHeight ) return false;
		
		if ( this.position.left < 0 ) return false;
		else if ( this.position.left + this.elementWidth > shared.screenViewableWidth ) return false;
		
		return true;
		
	}
	
	function update_placement ( placement, force ) {
		
		if ( this.placementCurrent !== placement || force === true ) {
			
			if ( typeof this.placementCurrent === 'string' ) {
				
				this.$element.removeClass( this.placementCurrent );
				
			}
			
			if ( typeof placement === 'string' ) {
				
				this.$element.addClass( placement );
				
				this.placementCurrent = placement;
				
				this.elementWidth = this.$element.outerWidth( true );
				this.elementHeight = this.$element.outerHeight( true );
				
			}
			
		}
		
		return this;
		
	}
	
	function update_position () {
		
		var placementCurrent = this.placementCurrent;
		
		if ( placementCurrent === 'top' ) {
			
			this.position.left = this.positionBase.left - this.elementWidth * 0.5 + this.offset.left;
			this.position.top = this.positionBase.top - this.elementHeight + this.offset.top;
			
		}
		else if ( placementCurrent === 'topright' ) {
			
			this.position.left = Math.max( this.positionBase.left + this.offset.left, 0 );
			this.position.top = this.positionBase.top - this.elementHeight + this.offset.top;
			
		}
		else if ( placementCurrent === 'right' ) {
			
			this.position.left = this.positionBase.left + this.offset.left;
			this.position.top = this.positionBase.top - this.elementHeight * 0.5 + this.offset.top;
			
		}
		else if ( placementCurrent === 'bottomright' ) {
			
			this.position.left = Math.max( this.positionBase.left + this.offset.left, 0 );
			this.position.top = this.positionBase.top + this.offset.top;
			
		}
		else if ( placementCurrent === 'bottom' ) {
			
			this.position.left = this.positionBase.left - this.elementWidth * 0.5 + this.offset.left;
			this.position.top = this.positionBase.top + this.offset.top;
			
		}
		else if ( placementCurrent === 'bottomleft' ) {
			
			this.position.left = Math.min( this.positionBase.left - this.elementWidth + this.offset.left, shared.screenViewableWidth - this.elementWidth );
			this.position.top = this.positionBase.top + this.offset.top;
			
		}
		else if ( placementCurrent === 'left' ) {
			
			this.position.left = this.positionBase.left - this.elementWidth + this.offset.left;
			this.position.top = this.positionBase.top - this.elementHeight * 0.5 + this.offset.top;
			
		}
		else if ( placementCurrent === 'topleft' ) {
			
			this.position.left = Math.min( this.positionBase.left - this.elementWidth + this.offset.left, shared.screenViewableWidth - this.elementWidth );
			this.position.top = this.positionBase.top - this.elementHeight + this.offset.top;
			
		}
		
		return this;
		
	}
	
	function normal_to_placement ( normal ) {
		
		var nx = normal.x,
			ny = normal.y,
			threshold = this.options.normalThreshold,
			difference;
		
		// left
		
		if ( nx < 0 ) {
			
			// top
			
			if ( ny < 0 ) {
				
				difference = nx - ny;
				
				if ( difference < -threshold ) {
					this.options.placement = 'left';
				}
				else if ( difference > threshold ) {
					this.options.placement = 'top';
				}
				else {
					this.options.placement = 'topleft';
				}
				
				this.options.checkBoundsClockwise = false;
				
			}
			// bottom
			else {
				
				difference = ny + nx;
				
				if ( difference < -threshold ) {
					this.options.placement = 'left';
				}
				else if ( difference > threshold ) {
					this.options.placement = 'bottom';
				}
				else {
					this.options.placement = 'bottomleft';
				}
				
				this.options.checkBoundsClockwise = true;
				
			}
			
		}
		// right
		else {
			
			// top
			
			if ( ny < 0 ) {
				
				difference = nx + ny;
				
				if ( difference < -threshold ) {
					this.options.placement = 'top';
				}
				else if ( difference > threshold ) {
					this.options.placement = 'right';
				}
				else {
					this.options.placement = 'topright';
				}
				
				this.options.checkBoundsClockwise = true;
				
			}
			// bottom
			else {
				
				difference = nx - ny;
				
				if ( difference < -threshold ) {
					this.options.placement = 'bottom';
				}
				else if ( difference > threshold ) {
					this.options.placement = 'right';
				}
				else {
					this.options.placement = 'bottomright';
				}
				
				this.options.checkBoundsClockwise = false;
				
			}
			
		}
		
		return this;
		
	}
	
} ( KAIOPUA ) );