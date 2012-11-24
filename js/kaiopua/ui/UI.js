/*
 *
 * UI.js
 * Handles game UI.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "js/kaiopua/ui/UI.js",
		_UI = {},
		_UIQueue,
		paused = false,
		ready = false,
		workerCollapseDelay = 1000,
		workerCollapseTimeoutHandle,
		$menuActive,
		$error;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	main.asset_register( assetPath, {
		data: _UI,
		requirements: [
			"js/kaiopua/ui/UIQueue.js",
			"js/lib/jquery.scrollbarwidth.min.js",
			"js/lib/jquery.multi-sticky.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( uiq ) {
		
		// modules
		
		_UIQueue = uiq;
		
		// properties
		
		_UI.pause = pause;
		_UI.resume = resume;
		_UI.resize = resize;
		_UI.error = error;
		
		Object.defineProperty( _UI, 'ready', { 
			get : function () { return ready; }
		});
		
		// dom elements
		
		shared.domElements = shared.domElements || {};
		
		shared.domElements.cloneables = shared.domElements.cloneables || {};
		
		shared.domElements.$uiGameDimmer = $('#uiGameDimmer');
		shared.domElements.$uiBlocker = $('#uiBlocker');
		shared.domElements.$ui = $('#ui');
		shared.domElements.$uiInGame = $( '#uiInGame' );
		shared.domElements.$uiOverGame = $( '#uiOverGame' );
		shared.domElements.$uiOutGame = $( '#uiOutGame' );
		shared.domElements.$uiOverlay = $( '#uiOverlay' );
		
		shared.domElements.$autoCenter = $( '.auto-center' );
		shared.domElements.$autoCenterVertical = $( '.auto-center-vertical' );
		shared.domElements.$autoCenterHorizontal = $( '.auto-center-horizontal' );
		
		shared.domElements.$preloader = $("#preloader");
		
		shared.domElements.$statusInactive = $( '#statusInactive' );
		shared.domElements.$statusActive = $( '#statusActive' );
		shared.domElements.$statusItems = $('.status-item');
		
		shared.domElements.$worker =  $("#worker");
		shared.domElements.$workerProgressBarStarted = $( "#workerProgressBarStarted" );
		shared.domElements.$workerProgressBarCompleted = $( "#workerProgressBarCompleted" );
		shared.domElements.$uiState =  $("#uiState");
		shared.domElements.$gameState =  $("#gameState");
		
		shared.domElements.$dropdowns = $( '.dropdown' );
		
        shared.domElements.$tabToggles = $( '.tab-toggles' ).find( '[href^="#"]' ).not( '.tab-toggle-empty' );
		
		shared.domElements.$stickied = $( ".is-sticky" );
		
		shared.domElements.$actionsActive = $( '#actionsActive' );
		shared.domElements.$actionsInactive = $( '#actionsInactive' );
		shared.domElements.$actionItems = $('.action-item');
		
		shared.domElements.$menus = $( '.menu' );
		shared.domElements.$menuDefault = $('#menuMain');
		shared.domElements.$menusInner = $();
		shared.domElements.$menuToggles = $();
		shared.domElements.$menuToggleDefault = $();
		shared.domElements.$menuActive = $( '#menuActive' );
		shared.domElements.$menuInactive = $( '#menuInactive' );
		
		shared.domElements.$navbars = $( '.navbar, .subnavbar' );
		shared.domElements.$navMenus = $('#navMenus');
		shared.domElements.$navMain = $( '#navMain' );
		shared.domElements.$navMainAlt = $( '#navMainAlt' );
		
		shared.domElements.$social = $( '#social' );
		shared.domElements.$sponsors = $( '#sponsors' );
		shared.domElements.$sponsorsLite = $( '#sponsorsLite' );
		
		// major buttons
		
		shared.domElements.$buttonsGameStart = $('.game-start');
		shared.domElements.$buttonsGameStop = $('.game-stop');
		shared.domElements.$buttonsGamePause = $('.game-pause');
		shared.domElements.$buttonsGameResume = $('.game-resume');
		
		// set all images to not draggable
		
		$( 'img' ).attr( 'draggable', false );
		
		// all links that point to a location in page
		
		$( 'a[href^="#"]' ).each( function () {
			
			var $element = $( this ),
				$section = $( $element.data( 'section' ) ),
				$target = $( $element.attr( 'href' ) );
			
			// remove click
			
			$element.attr( 'onclick', 'return false;' );
			
			// if has section or target, prioritize section over target
			
			if ( $section.length > 0 || $target.length > 0 ) {
				
				$element.on( 'tap', function () {
					
					( $section[0] || $target[0] ).scrollIntoView( true );
					
				} );
				
			}
				
		} );
		
		// handle disabled items only if pointer-events are not supported
		
		if ( shared.supports.pointerEvents === false ) {
			
			main.dom_ignore_pointer( $(".ignore-pointer, .disabled"), true );
			
		}
		
		// errors
		
		shared.domElements = shared.domElements || {};
		
		for ( i = 0, l = shared.errorTypes.length; i < l; i++ ) {
			
			errorName = shared.errorString + shared.errorTypes[ i ];
			
			shared.domElements[ '$' + errorName ] = $( '#' + errorName );
			
		}
		
		// worker
		
		shared.domElements.$worker.on( 'hidden.reset', function () {
			
			main.worker_reset();
			
		} );
		
		// status items show/hide
		
		shared.domElements.$statusItems.each( function () {
			
			var $item = $( this );
			
			if ( $item.is( '.hidden, .collapsed' ) ) {
				
				shared.domElements.$statusInactive.append( $item );
				
			}
			
		} ).on('show.active', function () {
			
			shared.domElements.$statusActive.append( this );
			
		}).on('hidden.active', function () {
			
			shared.domElements.$statusInactive.append( this );
			
		});
		
		// primary action items
		
		shared.domElements.$actionItems.each( function () {
			
			var $item = $( this );
			
			if ( $item.parent().is( shared.domElements.$actionsActive ) && $item.is( '.hidden, .collapsed' ) ) {
				
				shared.domElements.$actionsInactive.append( $item );
				
			}
			
		} ).on('show.active', function () {
			
			shared.domElements.$actionsActive.append( this );
			
		})
		.on('hidden.active', function () {
			
			shared.domElements.$actionsInactive.append( this );
			
		});
		
		// for all drop downs
		
		shared.domElements.$dropdowns.each( function () {
			
			var $dropdown = $( this );
			
			// close when drop down item is selected
			
			$dropdown.find( '.dropdown-menu a' ).each( function () {
				
				var $button = $( this );
				
				$button.on( 'tap', function () {
						
						$button.parent().removeClass( 'active' );
						
						$dropdown.removeClass('open');
						
					} );
				
			} );
			
		} );
		
		// for each navbar
		
		shared.domElements.$navbars.each( function () {
			
			var $navbar = $( this ),
				$buttonCollapse = $navbar.find( '[data-toggle="collapse"]' ),
				$navCollapse = $navbar.find( '.nav-collapse' );
			
			// if has collapsable
			
			if ( $buttonCollapse.length > 0 && $navCollapse.length > 0 ) {
				
				$navCollapse.find( 'a' ).each( function () {
					
					var $button = $( this );
					
					$button.on( 'tap', function () {
							
							if( $buttonCollapse.is( '.collapsed' ) !== true ) {
								
								$buttonCollapse.trigger( 'click' );
								
							}
							
						} );
					
				} );
				
			}
			
		} );
		
		// sticky elements
		
		shared.domElements.$stickied.each( function () {
			
			var $stickied = $( this ),
				$relative = $( $stickied.data( "relative" ) ),
				$target = $( $stickied.data( "target" ) );
			
			// if target empty, assume uiOutGame
			
			if ( $target.length === 0 ) {
				
				$target = shared.domElements.$uiOutGame;
				
			}
			
			$stickied.removeClass( 'is-sticky' ).sticky( {
				
				topSpacing: function () {
					
					return $relative.offset().top + $relative.outerHeight( true );
					
				},
				scrollTarget: $target,
				handlePosition: false
				
			} );
			
		} );
		
		// for each menu
		
		shared.domElements.$menus.each( function () {
			
			var $menu = $( this ),
				$inner = $menu.find( '.menu-inner' ),
				$toggle = shared.domElements.$tabToggles.filter( '[href="#' + $menu.attr( 'id' ) + '"]' ),
				activate,
				deactivate,
				first,
				last,
				open,
				close,
				toggle;
			
			$menu.data( '$inner', $inner );
			$menu.data( '$toggle', $toggle );
			$menu.data( 'scrollTop', 0 );
			
			shared.domElements.$menusInner = shared.domElements.$menusInner.add( $inner );
			
			// functions
			
			activate = function () {
				
				pause_consider_started( false, $menu );
				
				if ( $toggle.length > 0 ) {
					
					$toggle.closest( 'li' ).addClass( 'active' );
						
				}
				
				$menu.addClass( 'active' );
				
				main.dom_fade( {
					element: $menu,
					opacity: 1
				} );
				
				// resize and scroll to last location for this tab
				
				$( window ).trigger( 'resize' );
				
				shared.domElements.$uiOutGame.scrollTop( $menu.data( 'scrollTop' ) );
				
			};
			
			deactivate = function () {
				
				// store scroll position
				
				$menu.data( 'scrollTop', shared.domElements.$uiOutGame.scrollTop() );
				
				if ( $toggle.length > 0 ) {
					
					$toggle.closest( 'li' ).removeClass( 'active' );
					
				}
				
				$menu.removeClass( 'active' );
				
				main.dom_fade( {
					element: $menu,
					duration: 0
				} );
				
			};
			
			first = function () {
				
				pause_consider_started( false, $menu );
				
			};
			
			last = function () {
					
				resume_consider_started();
				
			};
			
			open = function () {
				
				_UIQueue.add( {
						element: $menu,
						container: shared.domElements.$uiOutGame,
						activate: activate,
						deactivate: deactivate,
						first: first,
						last: last
					} );
				
			};
			
			close = function () {
				
				_UIQueue.remove( $menu );
				
			};
			
			toggle = function () {
				
				if ( $menu.is( '.active' ) === true ) {
					
					$menu.trigger( 'close' );
					
				}
				else {
					
					$menu.trigger( 'open' );
					
				}
				
			};
			
			$menu.on( 'open', open )
				.on( 'close', close )
				.on( 'toggle', toggle );
			
			// attach events to toggle when present
			
			if ( $toggle.length > 0 ) {
				
				$toggle.data( '$menu', $menu );
				
				shared.domElements.$menuToggles = shared.domElements.$menuToggles.add( $toggle );
				
				// events
				
				$toggle.on( 'tap',  toggle );
				
			}
			
			// set default menu, assumes only 1 menu is active at start
			
			if ( $menu.is( '.active' ) === true ) {
				
				shared.domElements.$menuDefault = $menu;
				shared.domElements.$menuToggleDefault = $toggle;
				
			}
			
		} );
		
		// for all sponsors
		
		if ( shared.domElements.$sponsors.length > 0 && shared.domElements.$sponsorsLite.length > 0 ) {
			
			shared.domElements.$sponsorsLite.html( shared.domElements.$sponsors.clone().html() );
			
		}
		
		shared.domElements.$buttonsGameStop.on( 'tap', main.stop );
		shared.domElements.$buttonsGamePause.on( 'tap', pause_consider_started );
		shared.domElements.$buttonsGameResume.on( 'tap', resume_consider_started );
		
		// signals
		
		shared.signals.onGameInput.add( handle_input );
		
		shared.signals.onWorkerReset.add( worker_reset );
		shared.signals.onWorkerTaskStarted.add( worker_task_start );
		shared.signals.onWorkerTaskCompleted.add( worker_task_complete );
		shared.signals.onWorkerTasksCompleted.add( worker_tasks_complete );
		
		shared.signals.onGameStateChange.add( handle_game_state );
		shared.signals.onGameStarted.add( start );
		shared.signals.onGameStartedCompleted.add( start_complete );
		shared.signals.onGameStopped.add( stop );
		shared.signals.onGameStoppedCompleted.add( stop_complete );
		shared.signals.onGamePaused.add( pause );
		shared.signals.onGameResumed.add( resume );
		
		// ready
		
		ready = true;
		shared.domElements.$uiState
			.find( '.state-loading' )
				.removeClass( 'active' )
				.end()
			.find( '.state-usable' )
				.removeClass( 'active' )
				.end()
			.find( '.state-ready' )
				.addClass( 'active' );
		
		// resize once
		
		$( window ).trigger( 'resize' );
		
		// open default menu
		
		shared.domElements.$menuDefault.trigger( 'open' );
		
		// hide preloader
		
		main.dom_fade( {
			element: shared.domElements.$preloader,
			duration: 0
		} );
		
		// hide dimmer
		
		main.dom_fade( {
			element: shared.domElements.$uiGameDimmer
		} );
		
		// show main menu
		
		main.dom_fade( {
			element: shared.domElements.$navMain,
			opacity: 1
		} );
		
		disable_game_ui();
		
	}
	
	/*===================================================
    
    worker
    
    =====================================================*/
	
	function worker_reset () {
		
		$().add( shared.domElements.$workerProgressBarStarted ).add( shared.domElements.$workerProgressBarCompleted ).children( '.work-task' ).remove();
		
	}
	
	function worker_task_start ( id ) {
		
		// clear collapse delay
		
		if ( typeof workerCollapseTimeoutHandle !== 'undefined' ) {
			
			window.clearTimeout( workerCollapseTimeoutHandle );
			workerCollapseTimeoutHandle = undefined;
			
		}
		
		// show if hidden
		
		main.dom_collapse( {
			element: shared.domElements.$worker,
			show: true
		} );
		
		// add into worker started progress bar
		
		shared.domElements.$workerProgressBarStarted.prepend( $( '<img src="img/bar_vertical_rev_64.png" id="' + id + '" class="iconk-tiny-widthFollow-tight work-task">' ) );
		
	}
	
	function worker_task_complete ( id ) {
		
		// we need to be escape jquery's invalid selector characters when selecting worker tasks as they may be file names
		
		var idEscaped = id.replace(/([ #;?&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
		
		shared.domElements.$workerProgressBarStarted.find( '#' + idEscaped ).remove();
		
		shared.domElements.$workerProgressBarCompleted.append( $( '<img src="img/bar_vertical_rev_64.png" id="' + id + '" class="iconk-tiny-widthFollow-tight work-task">' ) );
		
	}
	
	function worker_tasks_complete () {
		
		// clear collapse delay
		
		if ( typeof workerCollapseTimeoutHandle !== 'undefined' ) {
			
			window.clearTimeout( workerCollapseTimeoutHandle );
			workerCollapseTimeoutHandle = undefined;
			
		}
		
		// new collapse delay
		
		workerCollapseTimeoutHandle = window.setTimeout( function () {
			
			// collapse
			
			main.dom_collapse( {
				element: shared.domElements.$worker
			} );
			
		}, workerCollapseDelay );
		
	}
	
	/*===================================================
    
    ready
    
    =====================================================*/
	
	function handle_game_state () {
		
		if ( main.playable === true && shared.supports.webGL === true ) {
			
			shared.domElements.$gameState
					.find( '.state-loading' )
						.removeClass( 'active' );
			
			if ( main.ready === true ) {
				
				shared.domElements.$gameState
					.find( '.state-usable' )
						.removeClass( 'active' )
						.end()
					.find( '.state-ready' )
						.addClass( 'active' );
				
			}
			else {
				
				shared.domElements.$gameState
					.find( '.state-ready' )
						.removeClass( 'active' )
						.end()
					.find( '.state-usable' )
						.addClass( 'active' );
				
			}
			
			enable_game_ui();
			
		}
		else {
			
			shared.domElements.$gameState
				.find( '.state-loading' )
					.addClass( 'active' )
					.end()
				.find( '.state-usable' )
					.removeClass( 'active' )
					.end()
				.find( '.state-ready' )
					.removeClass( 'active' );
			
			disable_game_ui();
			
		}
		
	}
	
	function enable_game_ui () {
	
		var $disableButtons,
			$disableTarget,
			$tip;
		
		$disableButtons = $()
			.add(shared.domElements.$buttonsGameStart )
			.add( shared.domElements.$buttonsGameStop );
		
		$disableTarget = $disableButtons.closest( 'li' );
		
		if ( $disableTarget.length === 0 ) {
			
			$disableTarget = $disableButtons;
			
		}
		
		$disableTarget.removeClass( 'disabled dim' );
		
		shared.domElements.$buttonsGameStart
			.tooltip( 'destroy' )
			.on( 'tap', main.start );
		
	}
	
	function disable_game_ui () {
		
		var $disableButtons,
			$disableTarget,
			$tip;
		
		$disableButtons = $()
			.add(shared.domElements.$buttonsGameStart )
			.add( shared.domElements.$buttonsGameStop );
		
		$disableTarget = $disableButtons.closest( 'li' );
		
		if ( $disableTarget.length === 0 ) {
			
			$disableTarget = $disableButtons;
			
		}
		
		$disableTarget.addClass( 'disabled dim' );
		
		// add tooltip to start button
		
		if ( shared.supports.webGL !== true ) {
			
			shared.domElements.$gameState
				.find( '.state-loading' )
					.text( 'No WebGL' );
			
			shared.domElements.$buttonsGameStart
				.tooltip( 'destroy' )
				.tooltip( {
					title: 'We need WebGL!',
					trigger: 'manual',
					placement: 'left',
					selector: shared.domElements.$buttonsGameStart
				} )
				.tooltip( 'show' );
			
			$disableTarget = shared.domElements.$buttonsGameStart.closest( 'li' );
			
			if ( $disableTarget.length === 0 ) {
				
				$disableTarget = shared.domElements.$buttonsGameStart;
				
			}
			
			$tip = shared.domElements.$buttonsGameStart.data('tooltip').$tip;
			
			$tip.css( {
					top: ( $disableTarget.height() - $tip.height() ) * 0.5,
					left: -( $tip.outerWidth() + 5 )
				} )
				.appendTo( $disableTarget );
			
		}
		
	}
	
	/*===================================================
    
    start / stop
    
    =====================================================*/
	
	function start () {
		
		resume();
		
	}
	
	function start_complete () {
		
		
		
	}
	
	function stop () {
		
		
		
	}
	
	function stop_complete () {
		
		// show main menu
		
		main.dom_fade( {
			element: shared.domElements.$navMain,
			opacity: 1
		} );
		
	}
	
	function open_default_menu () {
		
		// uiGameDimmer
		
		if ( main.started !== true ) {
			
			shared.domElements.$uiGameDimmer.off( '.resume' );
			main.dom_fade( {
				element: shared.domElements.$uiGameDimmer
			} );
			
		}
		
		main.dom_fade( {
			element: shared.domElements.$navMainAlt,
			duration: 0
		} );
		
		if ( shared.domElements.$menuToggleDefault.length > 0 ) {
			
			shared.domElements.$menuToggleDefault.trigger( 'tap' );
			
		}
		else if ( shared.domElements.$menuDefault.length > 0 ) {
			
			shared.domElements.$menuDefault.trigger( 'open' );
			
		}
		
	}
	
	/*===================================================
    
    input
    
    =====================================================*/
	
	function handle_input ( e, keyName, state ) {
		
		// releasing key
		
		if ( state === 'up' ) {
			
			// escape
			
			if ( keyName === 'escape' ) {
				
				if ( ( main.started === true && main.paused === true ) || paused === true ) {
					
					resume_consider_started();
					
				}
				else {
					
					pause_consider_started();
					
				}
				
			}
			
		}
			
	}
	
	/*===================================================
    
    pause
    
    =====================================================*/
	
	function pause_consider_started ( preventDefault, $menu ) {
		
		if ( main.started === true ) {
			
			if ( main.paused !== true ) {
				
				main.pause( preventDefault, $menu );
				
			}
			else {
				
				pause( preventDefault, $menu );
				
			}
			
		}
		else {
			
			pause( preventDefault, $menu );
			
		}
		
	}
	
	function pause ( preventDefault, $menu ) {
		
		var forMenu = $menu instanceof jQuery,
			nonDefaultMenu = forMenu && !shared.domElements.$menuDefault.is( $menu );
		
		paused = true;
		
		// hide buttons
		
		main.dom_fade( {
			element: shared.domElements.$buttonsGamePause,
			duration: 0,
			invisible: true
		} );
		
		main.dom_fade( {
			element: shared.domElements.$buttonsGameResume,
			duration: 0,
			invisible: true
		} );
		
		// block ui
		
		if ( preventDefault === true ) {
			
			main.dom_fade( {
				element: shared.domElements.$uiBlocker,
				opacity: 0.9
			} );
			
		}
		else {
			
			if ( nonDefaultMenu === true ) {
				
				$menuActive = $menu;
				
				// show alt nav
				
				shared.domElements.$social.addClass( 'blocking' );
				shared.domElements.$sponsorsLite.addClass( 'hidden' );
				
				main.dom_fade( {
					element: shared.domElements.$navMainAlt,
					opacity: 1
				} );
			
			}
			else {
				
				$menuActive = undefined;
				
				open_default_menu();
				
			}
			
			if ( main.started === true || nonDefaultMenu === true ) {
				
				// uiGameDimmer
				
				main.dom_fade( {
					element: shared.domElements.$uiGameDimmer,
					opacity: 0.9
				} );
				shared.domElements.$uiGameDimmer.on( 'tap.resume', resume );
				
				// show resume button
				
				main.dom_fade( {
					element: shared.domElements.$buttonsGameResume,
					opacity: 1
				} );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    resume
    
    =====================================================*/
	
	function resume_consider_started () {
		
		if ( main.started === true && typeof $menuActive === 'undefined' ) {
			
			main.resume();
			
		}
		else {
			
			resume();
			
		}
		
	}
	
	function resume ( refocused ) {
		
		paused = false;
		
		// unblock ui
		
		main.dom_fade( {
			element: shared.domElements.$uiBlocker
		} );
		
		if ( refocused !== true ) {
			
			if ( typeof $menuActive !== 'undefined' ) {
				
				shared.domElements.$social.removeClass( 'blocking' );
				shared.domElements.$sponsorsLite.removeClass( 'hidden' );
				
				open_default_menu();
				
			}
			else {
				
				// uiGameDimmer
				
				shared.domElements.$uiGameDimmer.off( '.resume' );
				main.dom_fade( {
					element: shared.domElements.$uiGameDimmer
				} );
				
				if ( main.started === true ) {
					
					// clear menus
					
					_UIQueue.clear( shared.domElements.$uiOutGame );
					
					main.dom_fade( {
						element: shared.domElements.$uiOutGame
					} );
					
					// show pause button
					
					main.dom_fade( {
						element: shared.domElements.$buttonsGamePause,
						opacity: 1
					} );
				
				}
				else {
					
					open_default_menu();
					
				}
				
			}
			
		}
		
		 if ( main.started === true && main.paused !== true ) {
			
			// show pause button
			
			main.dom_fade( {
				element: shared.domElements.$buttonsGamePause,
				opacity: 1
			} );
			
		}
		else if ( typeof $menuActive !== 'undefined' ) {
			
			main.dom_fade( {
				element: shared.domElements.$buttonsGameResume,
				opacity: 1
			} );
			
		}
		else {
			
			main.dom_fade( {
				element: shared.domElements.$buttonsGameResume,
				duration: 0,
				invisible: true
			} );
			
		}
		
	}
	
	/*===================================================
    
    error
    
    =====================================================*/
	
    function error ( errorType, origin, lineNumber ) {
		
		// clear existing
		
		error_clear();
        
        // if error type not in list
		
        if ( main.index_of_value( shared.errorTypes, errorType ) === -1 ) {
			
			errorType = shared.errorTypeGeneral;
			
        }
		
		// if should only show error type once to a user
		
		if( main.index_of_value( shared.errorTypesOnlyOnce, errorType ) !== -1 ) {
			
			if ( window.localStorage ) {
				
				// already shown
				
				if ( typeof window.localStorage[ errorType ] !== 'undefined' ) {
					
					return;
					
				}
				// mark as shown
				else {
					
					window.localStorage[ errorType ] = 'shown';
					
				}
				
			}
			
		}
		
		// find dom element
		
		$error = shared.domElements[ '$' + shared.errorString + errorType ];
		
		// add error info if general error
		
		if ( errorType === shared.errorTypeGeneral ) {
			
			// format origin
			
			if ( typeof origin === 'string' ) {
				
				index = origin.search( /\/(?![\s\S]*\/)/ );
				if ( index !== -1 ) {
					origin = origin.slice( index + 1 );
				}
				
				index = origin.search( /\?(?![\s\S]*\?)/ );
				if ( index !== -1 ) {
					origin = origin.slice( 0, index );
				}
				
			}
			
			$error.find( "#errorMessage" ).html( error );
			$error.find( "#errorFile" ).html( origin );
			$error.find( "#errorLine" ).html( lineNumber );
			
		}
		
		// show
		
		pause_consider_started( true );
		
		main.dom_collapse( {
			element: $error,
			show: true
		} );
		
		// if not yet started, allow click to clear error
		
		if ( main.started !== true ) {
			
			$( window ).one( 'click.errorclear', function () {
				
				error_clear();
				
				resume_consider_started();
				
			} );
			
		}
        
    }
	
	function error_clear () {
		
		if ( typeof $error !== 'undefined') {
			
			main.dom_collapse( {
				element: $error
			} );
			
		}
		
	}
	
	/*===================================================
    
    resize
    
    =====================================================*/
	
	function resize () {
		
		// because ui out game is scrollable, its grids are not aligned to main header grids
		// so we need to pad left side of the individual containers to correct for this
		
		if ( shared.domElements.$uiOutGame[0].scrollHeight > shared.screenViewableHeight ) {
			
			shared.domElements.$menusInner.css( 'padding-left', $.scrollbarWidth() );
			
		}
		
	}
	
} (KAIOPUA) );