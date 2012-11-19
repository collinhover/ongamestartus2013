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
		assetPath = "js/kaiopua/core/MorphAnimator.js",
		_MorphAnimator = {},
		_MathHelper;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _MorphAnimator,
		requirements: [
			"js/kaiopua/utils/MathHelper.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mh ) {
		
		// utility
		
		_MathHelper = mh;
		
		// properties
		
		_MorphAnimator.options = {
			duration: 1000,
			durationClear: 125,
			direction: 1,
			interpolationDirection: 1,
			loop: false,
			loopDelayPct: 0,
			loopDelayRandom: false,
			loopChance: 1,
			reverseOnComplete: false,
			clearOnComplete: true,
			startDelay: 0,
			startAt: -1,
			startAtMax: false,
			alternate: false,
			alternateDelay: 0,
			alternateDelayRandom: true,
			solo: false,
			clearOnly: false,
			clearExceptions: false,
			interruptable: true,
			prepare: true
		};
		
		// instance
		
		_MorphAnimator.Instance = MorphAnimator;
		_MorphAnimator.Instance.prototype.constructor = _MorphAnimator.Instance;
		
		_MorphAnimator.Instance.prototype.prepare = prepare;
		_MorphAnimator.Instance.prototype.recycle = recycle;
		_MorphAnimator.Instance.prototype.change = change;
		
		_MorphAnimator.Instance.prototype.play = play;
		_MorphAnimator.Instance.prototype.resume = resume;
		_MorphAnimator.Instance.prototype.complete = complete;
		_MorphAnimator.Instance.prototype.stop = stop;
		_MorphAnimator.Instance.prototype.clear = clear;
		_MorphAnimator.Instance.prototype.reset = reset;
		
		_MorphAnimator.Instance.prototype.update = update;
		
		_MorphAnimator.Instance.prototype.reverse_direction = reverse_direction;
		_MorphAnimator.Instance.prototype.reverse_interpolation = reverse_interpolation;
		_MorphAnimator.Instance.prototype.get_frame_duration = get_frame_duration;
		
	}
	
	/*===================================================
    
    instance
    
    =====================================================*/
	
	function MorphAnimator ( morphs, name, parameters ) {
		
		this.morphs = morphs;
		this.name = name;
		this.map = this.morphs.maps[ this.name ];
		
		this.options = $.extend( true, this.options || {}, _MorphAnimator.options, parameters );
		
		this.prepare();
		
	}
	
	function prepare ( looping ) {
		
		if ( this.cleared !== true && main.is_number( this.frame ) ) {
			
			if ( this.options.direction === -1 ) {
				
				if ( this.frame < 0 ) {
					
					this.frame = this.map.length - 1;
					
				}
				
			}
			else if ( this.frame >= this.map.length ) {
				
				this.frame = 0;
				
			}
			
		}
		else {
			
			if ( this.options.direction === -1 ) {
				
				this.frame = this.map.length - 1;
				
			}
			else {
				
				this.frame = 0;
				
			}
			
		}
		
		this.frameLast = main.is_number( this.frameLast ) && this.frameLast !== this.frame ? this.frameLast : -1;
		
		if ( looping !== true ) {
			
			this.animating = this.clearing = false;
			this.alternateTime = 0;
			
		}
		
		if ( this.alternatingNeedsClear !== false ) {
			
			this.alternating = this.alternatingNeedsClear = false;
			
		}
		
		this.recycle();
		
		return this;
		
	}
	
	function recycle () {
		
		this.framesUpdated = 0;
		this.frameTimeDelta = 0;
		this.time = this.timeLast = this.timeStart = new Date().getTime();
		
		return this;
		
	}
	
	function change ( changes ) {
		
		changes = changes || {};
		
		var duration,
			durationNew = changes.duration,
			timeFromStart,
			cyclePct,
			frameCount,
			frameDuration,
			frameDurationNew,
			framePct;
		
		// duration
		
		if ( main.is_number( durationNew ) && this.durationOriginal !== durationNew ) {
			
			duration = this.options.duration;
			timeFromStart = this.time - this.timeStart;
			cyclePct = timeFromStart / duration;
			frameCount = this.map.length;
			
			// fix time start to account for difference in durations
			
			this.timeStart += ( duration * cyclePct ) - ( durationNew * cyclePct );
			
			// fix frame time delta to account for new duration per frame
			
			frameDuration = duration / frameCount;
			
			frameDurationNew = durationNew / frameCount;
			
			framePct = this.frameTimeDelta / frameDuration;
			
			this.frameTimeDelta = frameDurationNew * framePct;
			
			this.durationOriginal = durationNew;
			
		}
		
		// direction
		
		if ( changes.reverse === true ) {
			
			this.reverse_direction();
			
		}
		
		// clear only and exceptions
		
		if ( changes.clearOnly ) {
			
			changes.clearOnly = main.to_array( changes.clearOnly );
			
		}
		
		if ( changes.clearExceptions ) {
			
			changes.clearExceptions = main.to_array( changes.clearExceptions );
			
		}
		
		// merge changes
		
		this.options = $.extend( this.options || {}, changes );
		
		return this;
		
	}
	
	/*===================================================
    
    play
    
    =====================================================*/
	
	function play ( parameters ) {
		
		var clearExceptions,
			startDelay;
		
		if ( this.clearing === true ) {
			
			this.clearing = false;
			
			this.recycle();
			
		}
		
		this.change( parameters );
		
		// solo
		
		if ( this.options.solo === true && this.morphs.animatingNames.length > 1 ) {
			
			// clear duration is single frame duration
			
			if ( this.options.durationClear === true ) {
				
				this.options.durationClear = this.get_frame_duration();
				
			}
			
			// clear only or exceptions
			
			if ( this.options.clearOnly ) {
				
				this.morphs.clear_only( this.options.clearOnly, { duration: this.options.durationClear } );
				
			}
			else {
				
				clearExceptions = [ this.name ];
				
				if ( this.options.clearExceptions ) {
					
					clearExceptions = clearExceptions.concat( this.options.clearExceptions );
					
				}
				
				if ( this.alternating === true ) {
					
					clearExceptions.push( this.options.alternate );
					
				}
				
				this.morphs.clear_all( { duration: this.options.durationClear }, clearExceptions );
				
			}
			
		}
		
		if ( this.animating !== true && typeof this.startTimeoutHandle === 'undefined' && typeof this.loopTimeoutHandle === 'undefined' ) {
			
			if ( this.cleared !== false && this.options.prepare !== false ) {
				
				this.prepare();
				
			}
			
			if ( main.is_number( this.options.startAt ) && this.options.startAt > -1 && this.options.startAt < this.map.length ) {
				
				this.frame = this.options.startAt;
				
			}
			
			if ( this.options.startAtMax === true ) {
				
				this.morphs.mesh.morphTargetInfluences[ this.map[ this.frame ].index ] = 1;
				this.frameTimeDelta = this.get_frame_duration();
				
			}
			
			if ( this.options.startDelay === true ) {
				
				startDelay = Math.round( Math.random() * this.options.duration );
				
			}
			else if ( main.is_number( this.options.startDelay ) ) {
				
				startDelay = this.options.startDelay;
				
			}
			else {
				
				startDelay = 0;
				
			}
			
			// resume
			
			if ( startDelay > 0 ) {
				
				this.startTimeoutHandle = window.requestTimeout( $.proxy( this.resume, this ), startDelay );
				
			}
			else {
				
				this.resume();
				
			}
		
		}
		
		return this;
		
	}
	
	function resume () {
		
		if ( this.animating !== true ) {
			
			clear_delays.call( this );
			
			this.animating = true;
			this.cleared = false;
			
			shared.signals.onGameUpdated.add( this.update, this );
			
		}
		
		return this;
		
	}
	
	/*===================================================
    
    complete
    
    =====================================================*/
	
	function complete () {
		
		var alternate,
			alternateParameters,
			index,
			alternating = false;
		
		// interruptable reset on complete
		
		this.options.interruptable = true;
		
		// clear
		
		if ( this.clearing === true ) {
			
			this.clear();
			
		}
		else {
			
			// properties
			
			if ( this.options.reverseOnComplete === true ) {
				
				this.reverse_direction();
				
			}
			
			// stop when not looping
			
			if ( this.options.loop !== true ) {
				
				this.stop().prepare();
				
				if ( this.options.clearOnComplete === true ) {
					
					this.clear( { duration: this.options.durationClear } );
					
				}
				
			}
			
			// one time callback
			
			if ( typeof this.options.oneComplete === 'function' ) {
				
				this.options.oneComplete();
				delete this.options.oneComplete;
				
			}
			
			// callback
			
			if ( typeof this.options.onComplete === 'function' ) {
				
				this.options.onComplete();
				
			}
			
			// attempt to play alternate
			
			alternate = this.options.alternate;
			
			if ( typeof alternate === 'string' && alternate !== this.name ) {
				
				this.alternateDelay = this.options.alternateDelay;
				
				if ( this.options.alternateDelayRandom ) {
					
					this.alternateDelay += Math.round( Math.random() * this.options.alternateDelay );
					
				}
				
				this.alternateTime += this.options.duration;
				
				if ( this.alternateTime >= this.alternateDelay ) {
					
					this.alternateTime = 0;
					
					index = main.index_of_value( this.morphs.names, alternate );
					
					if ( index !== -1 ) {
						
						alternateParameters = $.extend( true, {}, this.options.alternateParameters );
						alternateParameters.clearOnly = alternateParameters.clearOnly || this.options.clearOnly;
						alternateParameters.clearExceptions = alternateParameters.clearExceptions || this.options.clearExceptions;
						alternating = true;
						
						this.alternateLoopDelay = alternateParameters.duration || 0;
						
						this.morphs.play( alternate, alternateParameters );
						
					}
					
				}
				
			}
			
			this.alternating = alternating;
			
			if ( this.options.loop === true ) {
				
				loop.call( this );
				
			}
			
		}
		
	}
	
	function loop ( delay ) {
		
		var delay = this.options.duration * this.options.loopDelayPct * ( this.options.loopDelayRandom === true ? Math.random() : 1 );
		
		this.prepare( true );
		
		// alternate loop delay
		
		if ( this.alternating === true ) {
			
			this.alternatingNeedsClear = true;
			
			delay += this.alternateLoopDelay;
			
		}
		
		loop_try.call( this, delay );
		
		return this;
		
	}
	
	function loop_try ( delay ) {
		
		clear_delays.call( this );
		
		// loop chance
		
		if ( this.options.loopChance < 1 && Math.random() > this.options.loopChance ) {
			
			delay = Math.round( this.options.duration * ( this.options.loopDelayRandom === true ? Math.random() : 1 ) );
			
		}
		
		// if should resume after loop delay
		
		if ( delay > 0 ) {
			
			// pause updater
			
			this.stop();
			
			this.loopTimeoutHandle = window.requestTimeout( $.proxy( loop_try, this ), delay );
			
		}
		// else resume
		else {
			
			this.resume();
			
		}
		
		return this;
		
	}
	
	/*===================================================
    
    stop
    
    =====================================================*/
	
	function stop () {
		
		clear_delays.call( this );
		
		this.animating = false;
			
		shared.signals.onGameUpdated.remove( this.update, this );
		
		return this;
		
	}
	
	/*===================================================
    
    clear
    
    =====================================================*/
	
	function clear ( parameters ) {
		
		var duration;
		
		if ( this.options.interruptable !== false ) {
			
			clear_delays.call( this );
			
			if ( this.cleared !== true ) {
				
				parameters = parameters || {};
				duration = parameters.duration;
				
				// clear over duration
				
				if ( main.is_number( duration ) && duration > 0 ) {
					
					if ( this.clearing !== true || this.durationClear !== duration ) {
						
						this.clearing = true;
						this.durationClear = duration;
						
						this.recycle().resume();
						
					}
					
				}
				else {
					
					this.reset();
					
					// one time callback
					
					if ( typeof this.options.oneClear === 'function' ) {
						
						this.options.oneClear();
						delete this.options.oneClear;
						
					}
					
					// callback
					
					if ( typeof this.options.onClear === 'function' ) {
						
						this.options.onClear();
						
					}
					
				}
				
			}
			
		}
		
		return this;
		
	}
	
	function reset () {
		
		var i, l,
			mesh = this.morphs.mesh,
			influences = mesh.morphTargetInfluences,
			map = this.map;
		
		this.stop().prepare();
			
		for ( i = 0, l = map.length; i < l; i ++ ) {
			
			influences[ map[ i ].index ] = 0;
			
		}
		
		this.cleared = true;
		
		this.morphs.remove( this.name );
		
		return this;
		
	}
	
	/*===================================================
    
    update
    
    =====================================================*/
	
	function update ( timeDelta ) {
		
		var i, l,
			mesh = this.morphs.mesh,
			influences = mesh.morphTargetInfluences,
			map = this.map,
			o = this.options,
			duration,
			timeFromStart,
			cyclePct,
			direction,
			interpolationDirection,
			interpolationDelta,
			frameCount = map.length,
			frameDuration,
			index,
			indexLast;
		
		// update time
		
		this.timeLast = this.time;
		this.time += timeDelta;
		timeFromStart = this.time - this.timeStart;
		
		// clearing
		
		if ( this.clearing === true ) {
			
			duration = this.durationClear;
			cyclePct = timeFromStart / duration;
			
			interpolationDelta = timeDelta / duration;
			
			// decrease all morphs by the same amount at the same time
			
			for ( i = 0, l = frameCount; i < l; i++ ) {
				
				index = map[ i ].index;
				
				influences[ index ] = _MathHelper.clamp( influences[ index ] - interpolationDelta, 0, 1 );
				
			}
			
		}
		// frame to frame
		else {
			
			duration = o.duration * Math.max( mesh.scale.x, mesh.scale.y, mesh.scale.z, 0.5 );
			cyclePct = timeFromStart / duration;
			
			direction = o.direction;
			interpolationDirection = o.interpolationDirection;
			
			frameDuration = this.get_frame_duration();
			interpolationDelta = ( timeDelta / frameDuration ) * interpolationDirection;
			
			index = map[ this.frame ].index;
		
			this.frameTimeDelta += timeDelta;
			
			// if frame should swap
			
			if ( this.frameTimeDelta >= frameDuration ) {
				
				this.framesUpdated++;
				this.frameTimeDelta = Math.max( 0, this.frameTimeDelta - frameDuration );

				// push influences to max / min
				
				influences[ index ] = 1;
					
				if ( this.frameLast > -1 ) {
					
					indexLast = map[ this.frameLast ].index;
					
					influences[ indexLast ] = 0;
					
				}
				
				this.frameLast = this.frame;
				this.frame = this.frame + 1 * direction;
				
				// reset frame to start?
				
				if ( direction === -1 && this.frame < 0  ) {
					
					this.frame = frameCount - 1;
					
				}
				else if ( direction === 1 && this.frame > frameCount - 1 ) {
					
					this.frame = 0;
					
				}
				
				// special case for looping single morphs
					
				if ( map.length === 1 ) {
					
					if ( interpolationDirection === -1 ) {
						
						influences[ index ] = 0;
						
					}
					
					this.frameLast = -1;
					
					this.reverse_interpolation();
					
				}
				
			}
			// change influences by interpolation delta
			else {
				
				influences[ index ] = _MathHelper.clamp( influences[ index ] + interpolationDelta, 0, 1 );
				
				if ( this.frameLast > -1 ) {
					
					indexLast = map[ this.frameLast ].index;
					
					influences[ indexLast ] = _MathHelper.clamp( influences[ indexLast ] - interpolationDelta, 0, 1 );
					
				}
				
			}
			
		}
		
		// completion
		
		if ( cyclePct >= 1 || this.framesUpdated >= frameCount ) {
			
			this.complete();
			
		}
		
	}
	
	/*===================================================
    
    utility
    
    =====================================================*/
	
	function reverse_direction () {
		
		this.options.direction = -this.options.direction;
		
		// special case for single morph
		
		if ( this.map.length === 1 ) {
			
			// if morph is not already in zero state
			
			if ( this.options.direction === -1 && this.morphs.mesh.morphTargetInfluences[ this.map[ 0 ] ] > 0 ) {
				
				this.options.interpolationDirection = -1;
				
			}
			
			// direction cannot be in reverse
			
			this.options.direction = 1;
			
		}
		
		return this;
		
	}
	
	function reverse_interpolation () {
		
		this.options.interpolationDirection = -this.options.interpolationDirection;
		
		return this;
		
	}
	
	function get_frame_duration () {
		
		var mesh = this.morphs.mesh,
			frameDuration = this.options.duration;
		
		if ( mesh instanceof THREE.Object3D ) {
			
			frameDuration *= Math.max( mesh.scale.x, mesh.scale.y, mesh.scale.z, 0.5 );
			
		}
		
		return frameDuration / this.map.length;
		
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
		
} (KAIOPUA) );