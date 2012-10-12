/*
 *
 * MorphAnimator.js
 * Animates single or multi-frame morph within a model's Morphs object.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/game/core/MorphAnimator.js",
		_MorphAnimator = {},
		_MathHelper;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _MorphAnimator,
		requirements: [
			"js/game/utils/MathHelper.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mh ) {
		console.log('internal MorphAnimator', _MorphAnimator);
		
		// utility
		
		_MathHelper = mh;
		
		// properties
		
		_MorphAnimator.defaults = {
			duration: 1000,
			durationChange: 125,
			durationPerFrameMinimum: shared.timeDeltaExpected || 1000 / 60,
			durationShift: 0,
			loop: false,
			loopDelay: 0,
			loopChance: 1,
			reverseOnComplete: false,
			startDelay: 0,
			reset: true
		};
		
		// instance
		
		_MorphAnimator.Instance = MorphAnimator;
		_MorphAnimator.Instance.prototype.constructor = _MorphAnimator.Instance;
		
		_MorphAnimator.Instance.prototype.reset = reset;
		
		_MorphAnimator.Instance.prototype.play = play;
		_MorphAnimator.Instance.prototype.resume = resume;
		_MorphAnimator.Instance.prototype.stop = stop;
		_MorphAnimator.Instance.prototype.clear = clear;
		
		_MorphAnimator.Instance.prototype.update = update;
		
		_MorphAnimator.Instance.prototype.reverse_direction = reverse_direction;
		_MorphAnimator.Instance.prototype.reverse_interpolation = reverse_interpolation;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function MorphAnimator ( morphs, library, name ) {
		
		this.morphs = morphs;
		this.library = library;
		this.name = name;
		
		this.reset();
		
	}
	
	function reset () {
		
		this.animating = this.clearing = this.reverse = false;
		this.cleared = true;
		
		this.direction = 1;
		this.interpolationDirection = 1;
		
		return this;
		
	}
	
	/*===================================================
    
    play
    
    =====================================================*/
	
	function play ( parameters ) {
		
		this.options = $.extend( {}, _MorphAnimator.defaults, parameters );
		
		if ( this.updating !== true ) {
			
			this.durationOriginal = this.options.duration;
			
			// reset
			
			if ( this.cleared !== false && this.options.reset !== false ) {
				
				this.reset();
				
			}
			
			// resume
			
			this.startTimeoutHandle = window.requestTimeout( $.proxy( this.resume, this ), this.options.startDelay );
		
		}
		
		return this;
		
	}
	
	function resume () {
		
		if ( this.updating !== true ) {
			
			clear_delays.call( this );
			
			this.updating = true;
			this.cleared = false;
			
			shared.signals.onGameUpdated.add( this.update, this );
			
		}
		
		return this;
		
	}
	
	/*===================================================
    
    stop
    
    =====================================================*/
	
	function stop () {
		
		if ( this.updating === true ) {
			
			this.updating = false;
				
			shared.signals.onGameUpdated.remove( this.update, this );
			
		}
		
		return this;
		
	}
	
	/*===================================================
    
    clear
    
    =====================================================*/
	
	function clear ( parameters ) {
		
		var i, l,
			mesh,
			influences,
			map,
			duration;
		
		if ( this.cleared !== true ) {
			
			mesh = this.morphs.mesh;
			influences = mesh.morphTargetInfluences;
			map = this.library.maps[ this.name ];
			
			parameters = parameters || {};
			duration = parameters.duration;
			
			// clear over duration
			
			if ( main.is_number( duration ) && duration > 0 ) {
				
				// if not already clearing over duration
				
				if ( this.clearing !== true || this.options.duration !== duration ) {
					
					this.options.duration = duration;
					this.clearing = true;
					
					this.reset( false ).resume();
					
				}
				
			}
			else {
				
				this.stop().reset( false );
					
				for ( i = 0, l = map.length; i < l; i ++ ) {
					
					influences[ map[ i ].index ] = 0;
					
				}
				
				this.clearing = false;
				this.cleared = true;
				
			}
			
		}
		
		return this;
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function reverse_direction () {
		
		this.direction = -this.direction;
		
		return this;
		
	}
	
	function reverse_interpolation () {
		
		this.interpolationDirection = -this.interpolationDirection;
		
		return this;
		
	}
	
	function clear_delays () {
		
		// loop delay
		
		if ( typeof this.loopTimeoutHandle !== 'undefined' ) {
			
			window.clearRequestTimeout( this.loopTimeoutHandle );
			delete this.loopTimeoutHandle;
			
		}
		
		// start delay
		
		if ( typeof this.startTimeoutHandle !== 'undefined' ) {
			
			window.clearRequestTimeout( this.startTimeoutHandle );
			delete this.startTimeoutHandle;
			
		}
		
		return this;
		
	}
	
	function change () {
		
		
		
	}
	
	updater.changeParameters = function ( parameters ) {
			
			var durationNew,
				durationPrev,
				durationFramePrev,
				durationFrameNew,
				timeFromStart,
				framePct;
			
			parameters = parameters || {};
			
			// stop clearing
			
			if ( this.clearing === true ) {
				
				this.clearing = false;
				
			}
			
			// duration
			
			if ( main.is_number( parameters.duration ) && ( parameters.duration / this.morphsMap.length ) > this.defaults.durationPerFrameMinimum && this.durationOriginal !== parameters.duration ) {
				
				durationNew = parameters.duration;
				
				durationPrev = this.duration;
				
				timeFromStart = this.time - this.timeStart;
				
				cyclePct = timeFromStart / durationPrev;
				
				// fix time start to account for difference in durations
				
				this.timeStart += ( durationPrev * cyclePct ) - ( durationNew * cyclePct );
				
				// fix frame time delta to account for new duration per frame
				
				durationFramePrev = durationPrev / this.morphsMap.length;
				
				durationFrameNew = durationNew / this.morphsMap.length;
				
				framePct = this.frameTimeDelta / durationFramePrev;
				
				this.frameTimeDelta = durationFrameNew * framePct;
				
				// store new duration
				
				this.duration = this.durationOriginal = durationNew;
				
			}
			
			// direction
			
			if ( typeof parameters.reverse === 'boolean' && this.reverse !== parameters.reverse ) {
				
				this.reverse = parameters.reverse;
				
				this.direction = ( this.reverse === true ) ? -1 : 1;
				
				// special case for single morph
				
				if ( this.morphsMap.length === 1 ) {
					
					// if morph is not already in zero state
					
					if ( this.direction === -1 && mesh.morphTargetInfluences[ this.morphsMap[0] ] > 0 ) {
						this.interpolationDirection = -1;
					}
					
					// direction cannot be in reverse
					
					this.direction = 1;
					
				}
				
			}
			
			return this;
			
		};
		
		updater.reset = function ( isLooping ) {
			
			var loopDelay;
			
			this.timeStart = new Date().getTime();
			
			this.numFramesUpdated = 0;
			
			this.duration = this.durationOriginal + ( Math.random() * this.durationShift );
			
			if ( this.reverseOnComplete === true ) {
				
				this.direction = -this.direction;
				
				if ( this.direction === -1 ) {
					this.frame = this.morphsMap.length - 1;
				}
				else {
					this.frame = 0;
				}
				
			}
			
			// if first reset, or not looping
			
			if ( isLooping !== true ) {
				
				this.time = this.timeLast = this.timeStart;
				
				this.frameTimeDelta = 0;
				
				if ( this.direction === -1 ) {
					this.frame = this.morphsMap.length - 1;
				}
				else {
					this.frame = 0;
				}
				
				this.frameLast = this.frameLast || -1;
				
			}
			// handle looping
			else {
				
				updater.handleLooping( this.loopDelay );
				
			}
			
			return this;
			
		};
	
	function make_morph_updater ( name ) {
		
		
		updater.handleLooping = function ( delay ) {
			
			// delay
			
			delay = delay || 0;
			
			if ( Math.random() > this.loopChance ) {
				
				delay += this.durationOriginal;
				
			}
			
			// if should resume after loop delay
			
			if ( delay > 0 ) {
				
				updater.clearDelays();
				
				// pause updater
				
				updater.stop();
				
				this.loopTimeoutHandle = requestTimeout( updater.handleLooping, delay );
				
			}
			// else resume
			else {
				
				updater.resume();
				
			}
			
		};
		
		updater.update = function ( timeDelta ) {
			
			var i, l,
				loop = this.loop,
				morphsMap = this.morphsMap,
				mesh = this.mesh,
				scale = mesh.scale,
				influences = mesh.morphTargetInfluences,
				numFrames = morphsMap.length,
				time = this.time,
				timeStart = this.timeStart,
				timeLast = this.timeLast,
				timeFromStart = time - timeStart,
				duration = this.duration * Math.max( scale.x, scale.y, scale.z ),
				cyclePct = timeFromStart / duration,
				frameTimeDelta,
				frame,
				frameLast,
				morphIndex,
				morphIndexLast,
				direction,
				durationFrame,
				interpolationDirection,
				interpolationDelta;
			
			// if clearing
			
			if ( this.clearing === true ) {
				
				// properties
				
				interpolationDelta = (timeDelta / duration);
				
				// decrease all morphs by the same amount at the same time
				
				for ( i = 0, l = numFrames; i < l; i++ ) {
					
					morphIndex = morphsMap[ i ].index;
					
					influences[ morphIndex ] = Math.min( 1, Math.max( 0, influences[ morphIndex ] - interpolationDelta ) );
					
				}
				
			}
			// else default frame to frame interpolation
			else {
				
				// properties
				
				frame = this.frame;
				frameLast = this.frameLast;
				morphIndex = morphsMap[ frame ].index;
				direction = this.direction;
				durationFrame = duration / numFrames;
				interpolationDirection = this.interpolationDirection;
				interpolationDelta = (timeDelta / durationFrame) * interpolationDirection;
				
				// update frameTimeDelta
			
				frameTimeDelta = this.frameTimeDelta += timeDelta;
				
				// if frame should swap
				
				if ( frameTimeDelta >= durationFrame ) {
					
					// reset frame time delta
					// account for large time delta
					this.frameTimeDelta = Math.max( 0, frameTimeDelta - durationFrame );
					
					// record new frames for next cycle
					
					this.frameLast = this.frame;
					
					this.frame = frame + 1 * direction;
					
					this.numFramesUpdated++;
					
					// reset frame to start?
					
					if ( direction === -1 && this.frame < 0  ) {
						
						this.frame = numFrames - 1;
						
					}
					else if ( direction === 1 && this.frame > numFrames - 1 ) {
						
						this.frame = 0;
						
					}

					// push influences to max / min
						
					if ( frameLast > -1 ) {
						
						morphIndexLast = morphsMap[ frameLast ].index;
						
						influences[ morphIndexLast ] = 0;
						
					}
					
					influences[ morphIndex ] = 1;
					
					// special case for looping single morphs
						
					if ( morphsMap.length === 1 ) {
						
						if ( interpolationDirection === -1 ) {
							
							influences[ morphIndex ] = 0;
							
						}
						
						this.frameLast = -1;
						
						updater.reverse_interpolation();
						
					}
					
				}
				// change influences by interpolation delta
				else {
					
					// current frame
					
					influences[ morphIndex ] = Math.max( 0, Math.min ( 1, influences[ morphIndex ] + interpolationDelta ) );
					
					// last frame
					
					if ( frameLast > -1 ) {
						
						morphIndexLast = morphsMap[ frameLast ].index;
						
						influences[ morphIndexLast ] = Math.min( 1, Math.max( 0, influences[ morphIndexLast ] - interpolationDelta ) );
						
					}
					
				}
				
			}
			
			// update time
			
			this.timeLast = this.time;
			this.time += timeDelta;
			
			// reset, looping and callback
			
			if ( cyclePct >= 1 || this.numFramesUpdated >= numFrames ) {
				
				// if clearing, finish
				if ( this.clearing === true ) {
					
					updater.clear();
					
				}
				// if looping, do looping cycle reset
				else if ( loop === true ) {
					
					updater.reset( loop );
					
				}
				// else stop
				else {
					
					updater.stop();
					
				}
				
				if ( typeof this.callback === 'function' ) {
					
					this.callback();
					
				}
				
			}
			
		};
		
		
		return updater;
	}
	
} (OGSUS) );