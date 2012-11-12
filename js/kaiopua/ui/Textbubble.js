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
			template: '<div class="textbubble"><div class="textbubble-arrow"></div><div class="textbubble-ring"><div class="textbubble-ring-inner"></div></div><div class="textbubble-next">. . .</div><div class="textbubble-inner"><div class="textbubble-content"><div class="textbubble-content-inner"></div></div></div></div>',
			inner: '.textbubble-content-inner',
			next: '.textbubble-next',
			animate: true,
			animateDuration: 250,
			numCharactersMax: 30,
			numWordsMax: 6,
			wpm: 100
		};
		
		// instance
		
		_Textbubble.Instance = Textbubble;
		_Textbubble.Instance.prototype = new _Popover.Instance();
		_Textbubble.Instance.prototype.constructor = _Textbubble.Instance;
		_Textbubble.Instance.prototype.supr = _Popover.Instance.prototype;
		
		_Textbubble.Instance.prototype.content = content;
		_Textbubble.Instance.prototype.content_advance = content_advance;
		
		_Textbubble.Instance.prototype.show = show;
		_Textbubble.Instance.prototype.hide = hide;
		
		_Textbubble.Instance.prototype.follow = follow;
		
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
			console.log( this, ' overflow?', $(this).css('overflow') );
			return ( $(this).css('overflow') === 'auto' );
		} );
		this.$scroller = this.$inner.closest( $scrollable );
		this.$scrollerChild = this.$scroller.children().has( this.$inner );
		this.$element.remove();
		
		this.$next = this.$element.find( this.options.next );
		
		this.message = '';
		this.messages = [];
		
	}
	
	/*===================================================
    
    content
    
    =====================================================*/
	
	function content ( content ) {
		
		if ( typeof content === 'string' ) {
			
			if ( this.message !== content || typeof this.messageParts === 'undefined' || typeof this.messageParts.shown !== 'undefined' ) {
				
				this.message = $.trim( content || this.message );
				this.messageParts = undefined;
				console.log( 'textbubble messages', this.message );
				this.content_advance();
				
			}
			
		}
		else {
			
			return _Textbubble.Instance.prototype.supr.content.apply( this, arguments );
			
		}
		
		return this;
		
	}
	
	function content_advance () {
		
		this.messageParts = content_split.call( this, this.messageParts || this.message );
		console.log( 'textbubble message advance', this.messageParts );
		if ( this.messageParts.showing.length > 0 ) {
			
			_Textbubble.Instance.prototype.supr.content.call( this, this.messageParts.showing );
			
		}
		
		if ( this.messageParts.hidden.length > 0 ) {
			
			this.$next
				.show()
				.off( '.contentadvance' )
				.on( 'tap.contentadvance', $.proxy( this.content_advance, this ) );
			
		}
		else {
			
			this.$next
				.off( '.contentadvance' )
				.hide();
			
		}
		
		return this;
		
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
			message = '',
			messageLast,
			messageLastLast,
			showingNew = '',
			hiddenNew = '',
			forHiddenNew,
			widthActual;
		
		if ( typeof parts === 'string' ) {
			
			parts = { showing: '', hidden: parts };
			
		}
		else {
			
			parts.shown = parts.showing;
			
		}
		
		hidden = parts.hidden;
		
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
			
			showingNew = messageLast;
			
			// revert to original state
			
			this.$inner.html( showing );
			this.$element.placeholdme( 'revert' );
			
			duration = ( 60000 / this.options.wpm ) * numWords;
			console.log( 'parts showing', parts.showing, ' numWords ', numWords, ' duration ', duration );
			parts.showing = showingNew;
			parts.hidden = hiddenNew;
			
		}
		
		return parts;
		
	}
	
	/*===================================================
    
    show / hide
    
    =====================================================*/
	
	function show ( target ) {
		
		this.target = target;
		
		_Textbubble.Instance.prototype.supr.show.apply( this, arguments );
		
		// restart message
		
		this.content( this.message );
		
		// follow target whenever camera moves
		
		shared.cameraControls.onCameraMoved.add( this.follow, this );
		this.follow();
		
	}
	
	function hide () {
		
		shared.cameraControls.onCameraMoved.remove( this.follow, this );
		
		return _Textbubble.Instance.prototype.supr.hide.apply( this, arguments );
		
	}
	
	/*===================================================
    
    follow
    
    =====================================================*/
	
	function follow () {
		
		// project target position
		// this.target
		// this.reposition( position );
		
		return this;
		
	}
	
} ( KAIOPUA ) );