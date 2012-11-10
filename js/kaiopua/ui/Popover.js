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
		_Popover = {};
	
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
		console.log('internal Popover', _Popover);
		
		// properties
		
		_Popover.options = {
			placement: 'top',
			template: '<div></div>'
		};
		
		// instance
		
		_Popover.Instance = Popover;
		_Popover.Instance.prototype.constructor = _Popover.Instance;
		
		_Popover.Instance.prototype.content = content;
		
		_Popover.Instance.prototype.show = show;
		_Popover.Instance.prototype.hide = hide;
		
		_Popover.Instance.prototype.reposition = reposition;
		_Popover.Instance.prototype.update_placement = update_placement;
		_Popover.Instance.prototype.update_position = update_position;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Popover ( parameters ) {
		
		// handle parameters
		
		parameters = parameters || {};
		
		this.options = $.extend( true, {}, _Popover.options, parameters.options );
		
		this.position = { top: 0, left: 0 };
		this.positionBase = { top: 0, left: 0 };
		this.offset = { top: 0, left: 0 };
		
		this.$element = $( this.options.template );
		this.$inner = this.$element.find( parameters.inner || parameters.$inner );
		if ( this.$inner.length === 0 ) {
			
			this.$inner = this.$element;
			
		}
		this.$container = $( parameters.container || parameters.$container || shared.domElements.$uiInGame || shared.domElements.$game );
		
		this.content( parameters.content );
		
	}
	
	/*===================================================
    
    content
    
    =====================================================*/
	
	function content ( content ) {
		
		if ( typeof content === 'string' ) {
			
			this.$inner.html( content );
			
			return this;
			
		}
		else {
			
			return this.$inner.html();
			
		}
		
	}
	
	/*===================================================
    
    show / hide
    
    =====================================================*/
	
	function show () {
		
		this.$element
			.css( {
				'left' : '',
				'top' : ''
			} )
			.appendTo( this.$container )
			.addClass('in');
		
		return this;
		
	}
	
	function hide () {
		
		this.$element.remove();
		
		return this;
		
	}
	
	/*===================================================
    
    position
    
    =====================================================*/
	
	function reposition ( position ) {
		
		var placement = this.options.placement,
			placementBounded,
			positionChanged,
			outHorizontal;
		
		if ( typeof position !== 'undefined' ) {
			
			// left
			
			if ( main.is_number( position.left ) ) {
				
				if ( this.positionBase.left !== position.left ) positionChanged = true;
				
				this.positionBase.left = position.left;
				
			}
			else if ( main.is_number( position.x ) ) {
				
				if ( this.positionBase.left !== position.x ) positionChanged = true;
				
				this.positionBase.left = position.x;
				
			}
			
			// top
			
			if ( main.is_number( position.top ) ) {
				
				if ( this.positionBase.top !== position.top ) positionChanged = true;
				
				this.positionBase.top = position.top;
				
			}
			else if ( main.is_number( position.y ) ) {
				
				if ( this.positionBase.top !== position.y ) positionChanged = true;
				
				this.positionBase.top = position.y;
				
			}
			
			// change position
			
			if ( positionChanged === true ) {
				
				if ( this.placementCurrent !== placement ) {
					
					this.update_placement( placement );
					
				}
				
				this.update_position();
				
				// top / bottom bounds
				
				placementBounded = '';
				
				if ( this.position.top < 0 ) {
					
					placementBounded += 'bottom';
					
				}
				else if ( this.position.top + this.elementHeight > shared.screenViewableHeight ) {
					
					placementBounded += 'top';
					
				}
				
				// left / right bounds
				
				if ( this.position.left < 0 ) {
					
					placementBounded += 'right';
					outHorizontal = 'right';
					
				}
				else if ( this.position.left + this.elementWidth > shared.screenViewableWidth ) {
					
					placementBounded += 'left';
					outHorizontal = 'left';
					
				}
				
				if ( this.placementCurrent !== placementBounded && placementBounded.length > 0 ) {
					
					this.update_placement( placementBounded ).update_position();
					
				}
				
				// redo top/bottom check if horizontal placement changed
				
				if ( typeof outHorizontal === 'string' ) {
					
					if ( this.position.top < 0 ) {
						
						placementBounded = 'bottom' + outHorizontal;
						
					}
					else if ( this.position.top + this.elementHeight > shared.screenViewableHeight ) {
						
						placementBounded = 'top' + outHorizontal;
						
					}
					
					if ( this.placementCurrent !== placementBounded ) {
						
						this.update_placement( placementBounded ).update_position();
						
					}
					
				}
				
				this.$element.css( this.position );
				
			}
			
		}
		
		return this;
		
	}
	
	function update_placement ( placement ) {
		
		if ( this.placementCurrent !== placement ) {
			
			if ( typeof this.placementCurrent === 'string' ) {
				
				this.$element.removeClass( this.placementCurrent );
				
			}
			
			if ( typeof placement === 'string' ) {
				
				this.$element.addClass( placement );
				
				this.placementCurrent = placement;
				
				this.elementWidth = this.$element.outerWidth();
				this.elementHeight = this.$element.outerHeight();
				
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
		else if ( placementCurrent === 'bottom' ) {
			
			this.position.left = this.positionBase.left - this.elementWidth * 0.5 + this.offset.left;
			this.position.top = this.positionBase.top + this.offset.top;
			
		}
		else if ( placementCurrent === 'left' ) {
			
			this.position.left = this.positionBase.left - this.elementWidth + this.offset.left;
			this.position.top = this.positionBase.top - this.elementHeight * 0.5 + this.offset.top;
			
		}
		else if ( placementCurrent === 'right' ) {
			
			this.position.left = this.positionBase.left + this.offset.left;
			this.position.top = this.positionBase.top - this.elementHeight * 0.5 + this.offset.top;
			
		}
		else if ( placementCurrent === 'bottomleft' ) {
			
			this.position.left = Math.min( this.positionBase.left - this.elementWidth + this.offset.left, shared.screenViewableWidth - this.elementWidth );
			this.position.top = this.positionBase.top + this.offset.top;
			
		}
		else if ( placementCurrent === 'bottomright' ) {
			
			this.position.left = Math.max( this.positionBase.left + this.offset.left, 0 );
			this.position.top = this.positionBase.top + this.offset.top;
			
		}
		else if ( placementCurrent === 'topleft' ) {
			
			this.position.left = Math.min( this.positionBase.left - this.elementWidth + this.offset.left, shared.screenViewableWidth - this.elementWidth );
			this.position.top = this.positionBase.top - this.elementHeight + this.offset.top;
			
		}
		else if ( placementCurrent === 'topright' ) {
			
			this.position.left = Math.max( this.positionBase.left + this.offset.left, 0 );
			this.position.top = this.positionBase.top - this.elementHeight + this.offset.top;
			
		}
		
		return this;
		
	}
	
} ( KAIOPUA ) );