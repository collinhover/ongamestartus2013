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
		_Popover,
		_MathHelper;
	
	/*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, { 
		data: _Textbubble,
		requirements: [
			"js/kaiopua/ui/Popover.js",
			"js/kaiopua/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	});
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( po, mh ) {
		console.log('internal Textbubble', _Textbubble);
		_Popover = po;
		_MathHelper = mh;
		
		// properties
		
		_Textbubble.options = {
			placement: 'topleft',
			template: '<div class="textbubble"><div class="textbubble-arrow"></div><div class="textbubble-status"><div class="textbubble-status-inner">...</div></div><div class="textbubble-close"><div class="textbubble-close-inner">&times;</div></div><div class="textbubble-inner"><div class="textbubble-content"><div class="textbubble-content-inner"></div></div></div></div>',
			inner: '.textbubble-content-inner',
			close: '.textbubble-close',
			status: '.textbubble-status',
			statusInner: '.textbubble-status-inner',
			animate: true,
			animateDuration: 250,
			contentAdvanceDelayMin: 4000,
			wpm: 100,
			autoAdvance: false
		};
		
		// instance
		
		_Textbubble.Instance = Textbubble;
		_Textbubble.Instance.prototype = new _Popover.Instance();
		_Textbubble.Instance.prototype.constructor = _Textbubble.Instance;
		_Textbubble.Instance.prototype.supr = _Popover.Instance.prototype;
		
		_Textbubble.Instance.prototype.content = content;
		_Textbubble.Instance.prototype.content_advance = content_advance;
		_Textbubble.Instance.prototype.content_show = content_show;
		
		_Textbubble.Instance.prototype.show = show;
		_Textbubble.Instance.prototype.hide = hide;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function Textbubble ( parameters ) {
		
		var $scrollable,
			$parents;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.options = $.extend( true, {}, _Textbubble.options, parameters.options );
		
		// prototype constructor
		
		_Popover.Instance.call( this, parameters );
		
		// find scrolling element
		
		$( 'body' ).append( this.$element );
		$parents = this.$inner.parentsUntil( this.$element );
		$scrollable = $parents.filter( function () {
			return ( $(this).css('overflow') === 'auto' );
		} );
		this.$scroller = this.$inner.closest( $scrollable );
		this.$scrollerChild = this.$scroller.children().has( this.$inner );
		this.$element.remove();
		
		this.$close = this.$element.find( this.options.close );
		this.$status = this.$element.find( this.options.status );
		this.$statusInner = this.$element.find( this.options.statusInner );
		
		this.messages = [];
		
	}
	
	/*===================================================
    
    content
    
    =====================================================*/
	
	function content ( content ) {
		
		if ( typeof content !== 'undefined' ) {
			
			content = main.to_array( content );
			
			if ( this.messages !== content || typeof this.messageParts === 'undefined' || typeof this.messageParts.shown !== 'undefined' ) {
				
				this.messages = content;
				this.messageParts = undefined;
				
				this.content_advance();
				
			}
			
		}
		else {
			
			return _Textbubble.Instance.prototype.supr.content.call( this );
			
		}
		
		return this;
		
	}
	
	function content_advance () {
		
		clear_content_advance_timeout.call( this );
		
		this.messageParts = content_split.call( this, this.messageParts || this.messages );
		
		main.dom_fade( {
			element: $().add( this.$inner ).add( this.$status ),
			duration: this.messageParts.shown.length > 0 ? this.options.animateDuration : 0,
			callback: $.proxy( function () {
				
				this.content_show();
				
			}, this )
		} );
		
		return this;
		
	}
	
	function content_show () {
		
		var $elements = $();
		
		if ( this.messageParts.showing.length > 0 ) {
			
			$elements = $elements.add( this.$inner );
			_Textbubble.Instance.prototype.supr.content.call( this, this.messageParts.showing );
			
		}
		
		if ( this.messageParts.hidden.length > 0 || this.messageParts.messages.length > 0 ) {
			
			$elements = $elements.add( this.$status );
			
		}
		
		main.dom_fade( {
			element: $elements,
			opacity: 1,
			duration: this.messageParts.shown.length > 0 ? this.options.animateDuration : 0,
			callback: $.proxy( function () {
				
				clear_content_advance_timeout.call( this );
				
				if ( this.options.autoAdvance === true && ( this.messageParts.hidden.length > 0 || this.messageParts.messages.length > 0 ) ) {
					
					this.contentAdvanceTimeoutId = requestTimeout( $.proxy( this.content_advance, this ), Math.max( this.options.contentAdvanceDelayMin, ( 60000 / this.options.wpm ) * this.messageParts.numWords ) );
				
				}
				
			}, this )
		} );
		
	}
	
	function content_split ( parts ) {
		
		var i, il,
			showing,
			hidden,
			words,
			word,
			wordLast,
			wordLastLast,
			wordLastLastIsEndOfSentence,
			numWords = 0,
			duration = 0,
			messages,
			message = '',
			messageLast,
			messageLastLast,
			showingNew = '',
			hiddenNew = '',
			forHiddenNew,
			widthActual;
		
		// init or update parts
		
		if ( main.is_array( parts ) ) {
			
			parts = {
				showing: '', 
				shown: '',
				hidden: '',
				messages: parts.slice( 0 )
			};
			
		}
		else {
			
			parts.shown = parts.showing;
			
		}
		
		messages = parts.messages;
		hidden = parts.hidden;
		
		// get next usable message when none of current message is hidden
		
		while ( hidden.length === 0 && messages.length > 0 ) {
			
			hidden = messages.shift();
			
		}
		
		if ( hidden.length > 0 ) {
			
			// record current state
			
			this.$element.placeholdme().appendTo( 'body' );
			
			showing = parts.showing.length > 0 ? parts.showing : this.$inner.html();
			this.$inner.html( '' );
			
			widthActual = this.$scrollerChild.width();
			
			// add words from hidden until scroller size changes
			
			words = hidden.split( /\s* \s*/ );
			messageLast = message = words[ 0 ];
			
			for ( i = 1, il = words.length; i < il; i++ ) {
				
				wordLastLast = wordLast;
				wordLast = word;
				word = words[ i ];
				
				if ( forHiddenNew === true ) {
					
					hiddenNew += ' ' + word;
					
				}
				else {
					
					message += ' ' + word;
					
					this.$inner.html( message );
					
					if ( this.$scrollerChild.width() !== widthActual ) {
						
						// check for end of sentence in word before last
						
						if ( typeof wordLastLast === 'string' ) {
							
							wordLastLastIsEndOfSentence = wordLastLast.search( /\n|([^\r\n.!?]+([.!?]+|\n))/gi );
							
						}
						
						// we don't want any orphans or widows
						
						if ( wordLastLastIsEndOfSentence !== -1 || i === il - 1 ) {
							
							hiddenNew = wordLast + ' ' + word;
							messageLast = messageLastLast;
							
						}
						else {
							
							hiddenNew = word;
							
						}
						
						forHiddenNew = true;
						
					}
					else {
						
						messageLastLast = messageLast;
						messageLast = message;
						numWords++;
						
					}
				
				}
				
			}
			
			showingNew = $.trim( messageLast );
			
			// revert to original state
			
			this.$inner.html( showing );
			this.$element.placeholdme( 'revert' );
			
			parts.showing = showingNew;
			parts.hidden = hiddenNew;
			parts.numWords = numWords;
			
		}
		
		return parts;
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function clear_content_advance_timeout () {
		
		if ( typeof this.contentAdvanceTimeoutId !== 'undefined' ) {
			
			clearRequestTimeout( this.contentAdvanceTimeoutId );
			this.contentAdvanceTimeoutId = undefined;
			
		}
		
	}
	
	function clear_content_events () {
		
		clear_content_advance_timeout.call( this );
		
		this.$close.off( '.textbubbleClose' );
		this.$status.off( '.textbubbleStatus' );
		
	}
	
	/*===================================================
    
    show / hide
    
    =====================================================*/
	
	function show () {
		
		_Textbubble.Instance.prototype.supr.show.apply( this, arguments );
		
		clear_content_events.call( this );
		
		this.$close.on( 'tap.textbubbleClose', $.proxy( this.hide, this ) );
		this.$status.on( 'tap.textbubbleStatus', $.proxy( this.content_advance, this ) );
		
		// restart message
		
		this.content( this.messages );
		
	}
	
	function hide () {
		
		clear_content_events.call( this );
		
		return _Textbubble.Instance.prototype.supr.hide.apply( this, arguments );
		
	}
	
} ( KAIOPUA ) );