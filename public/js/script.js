(function($) {
	// Constants
	var ACTIVE_CLASS = 'active'
		, MOUSE_ENTER = 'mouseenter'
		, MOUSE_LEAVE = 'mouseleave'
	;

	// DOM cache
	var $win = $(window)
		, $body = $('body')
		, $headerMenu = $('.head-menu')
		, $headerMenuItems = $headerMenu.children('li')
		, $menuBorder = $('.border-a')
		, $sliderFlip = $('.slider-flip')
		, $sliderFlipFront = []
		, resizeMenuTimer
		, resizeSliderTimer
	;

	// Corporata cache
	var Corporata = {
		/**
		 * @type {Object.<string,Swipe>}
		 */
		swipes: {},
		/**
		 * @type {number}
		 */
		scrollDiff: 1
	};

	$('.accordion, .nav-accordion').
		on('show hide', function onTick(e) {
			$(e.target).prev('.accordion-heading').parent().eq(0).toggleClass(ACTIVE_CLASS, e.type === 'show');
		});

	// Hovers
	$('.pricing-table .span4 a, .pricing-table .span3 a, .serv li a').
		on(MOUSE_ENTER + ' ' + MOUSE_LEAVE, function onTick(e) {
			$(this).parent().toggleClass('hover', e.type === MOUSE_ENTER);
		});

	$('.social li a').
		on(MOUSE_ENTER + ' ' + MOUSE_LEAVE, function onTick(e) {
			$('img', this).toggleClass('desaturate', e.type === MOUSE_LEAVE);
		});

	// Instagram
	var igSettings = {
		userId: '1189404006',
		accessToken: '1189404006.674061d.1e30f6c4ac4746bfbd276b08ee264980'
	};

	$('#instagram').igPics($.extend({
		count: 12,
		complete: function() {
			var $items = $(this).find('li');

      $items.filter(':nth-child(4n+4)').css('margin-right', 0);
			$items.children('a').addClass('desaturate').on(MOUSE_ENTER + ' ' + MOUSE_LEAVE, function onTick(e) {
				$(this).toggleClass('desaturate', e.type === MOUSE_LEAVE);
			});

      $(this).find('img[data-lazy-img]').lazyImages();
		}
	}, igSettings));

	$('#sidebar-inst').igPics($.extend({
		count: 9,
		complete: function() {
			$(this).
				find('a').
				addClass('desaturate').
				on(MOUSE_ENTER + ' ' + MOUSE_LEAVE, function onTick(e) {
					$(this).toggleClass('desaturate', e.type === MOUSE_LEAVE);
				})
			;

      $(this).find('img[data-lazy-img]').lazyImages();
		}
	}, igSettings));

	// Mobile drop down navigation
	(function() {
			var mainNavigationMenu = $('<div class="topmenu-select" id="topmenu-select" />'),
					selectMenu = $('<select class="select_styled" id="topm-select" />')
							.on('change', function() {
									window.location = this.options[this.selectedIndex].value;
							});

			selectMenu.appendTo(mainNavigationMenu);
			$headerMenu.after(mainNavigationMenu);

			/**
			 * @param {jQuery} $li
			 * @param {number=} level
			 */
			function insertOption($li, level) {
					var $link = $li.children('a'),
							href = $link.attr('href'),
							selected = ($li.hasClass('active') && href !== '#') ? ' selected="selected"' : '',
							disabled = (!selected && href === '#') ? ' disabled="disabled"' : '',
							textPrefix = '';

					if (href === undefined) {
							return;
					}

					if (level > 0) {
						for (var i=0; i<level; i++) {
							textPrefix += '&nbsp;';
						}
						textPrefix += '|-- ';
					}

					selectMenu.append('<option value="' + href + '"' + selected + disabled + '>' + textPrefix + $link.text() + '</option>');
			}

			/**
			 * @param {jQuery} $li
			 * $param {number=} level
			 */
			function parseChildren($li, level) {
				if ('number' !== typeof level || level < 1) {
					level = 1;
				}

				if ($li.children('ul').length > 0) {
					$li.children('ul').children('li').each(function() {
						var $li = $(this);
						insertOption($li, level);
						parseChildren($li, level + 1);
					});
				}
			}

			$headerMenu.children('li').each(function() {
					var $li = $(this);
					insertOption($li);
					parseChildren($li);
			});
	})();

	// Search Bar
	$('.search input').on('focus blur', function onTick(e) {
		$(this).parent().toggleClass(ACTIVE_CLASS, e.type === 'focus');
	});

	// Navigation drop down
	$headerMenu.superfish({
		animation: {
			opacity: 'show',
			height: 'show'
		},  // fade-in and slide-down animation
		animationOut: {
			opacity: 'hide',
			height: 'hide'
		},  // fade-in and slide-down animation
		speed: '350',                          // faster animation speed
		delay: '0',                          // faster animation speed
		autoArrows: false
	});

	// Colorbox
	if (typeof $.fn.colorbox === 'function') {
		$(".group1").colorbox({rel:'nofollow'});

		$(window).on('resize.coloxHW', function () {
					if ($('body').width() <= 979) {
						$(".group1").colorbox({height: '100%',width:'100%'});
					} else {
						$(".group1").colorbox({height: false,width:false});
			}
		}).trigger('resize.coloxHW');

		$('.vimeo,.youtube').colorbox({
			iframe: true,
			innerWidth: 640,
			innerHeight: 320,
			rel: 'group-video'
		});

		$(window).on('resize.coloxVHW', function () {
					if ($('body').width() <= 979) {
						$('.vimeo,.youtube').colorbox({height: '100%',width:'100%'});
					} else {
						$('.vimeo,.youtube').colorbox({height: false,width:false});
			}
		}).trigger('resize.coloxVHW');
	}

	// SwipeJS Helper
	$('[data-swipe]').each(function onTick(index) {
		var data = $(this).data()
			, settings = {
					speed: data.speed || 1000,
					callback: function(index, elem) {
						$body.trigger('swipe.fx.start', [index, elem, data.swipe]);
					},
					transitionEnd: function(index, elem) {
						$body.trigger('swipe.fx.end', [index, elem, data.swipe]);
					}
				}
		;

		if (data.hasOwnProperty('auto')) {
			settings.auto = data.auto || 5000;
		}

		$.data(this, 'Swipe', Corporata.swipes[data.swipe] = Swipe(this, settings))
	});

	// Portfolio block switch
	(function() {
		var $recent = $('.content .recent').
				hide().
				eq(0).
				show().
				end()
			;

		$('.port-page a').
			click(function onClick(e) {
				e.preventDefault();
				$(this).addClass(ACTIVE_CLASS).siblings().removeClass(ACTIVE_CLASS);
				$recent.hide().filter($(this).attr('href')).show();
				$body.
					trigger('mansory.reload').
					trigger('lazy.touch')
				;
			}).
			eq(0).addClass(ACTIVE_CLASS)
		;
	})();

	// Portfolio Masonry
	if(typeof($.fn.masonry) === 'function') {
		$('[data-masonry-cols]').each(function () {
			var $elem = $(this);
			$elem.
				masonry({
					columnWidth : function (width) {
						return width / (parseInt($elem.data('masonry-cols'), 10) || 2);
					},
					itemSelector: $elem.data('masonry-item') || '.portfolio-item',
					isAnimated: true
				}).
				addClass('recent-works-ready').
				data('mansory-ready', 1).
				on('masonry.complete', function () {
					$body.trigger('lazy.touch');
				})
			;
		});
	}

	function reflowMenu() {
		var $activeItem = $headerMenuItems.filter('.active');
		$menuBorder.css({
			'width': $activeItem.width(),
			'left': $activeItem.offset().left - $headerMenu.offset().left
		});
	}

	/**
	 * @param {{content:string=, nav:boolean=}}
	 */
	function reflowSlideComponents(sections) {
		if (!$sliderFlip.length) {
			return;
		}

		if (!sections) {
			sections = {};
		}

		if (sections.content) {
			var sides = ['back', 'front'],
				padding,
				height = 0,
				sideIndex,
				$content,
				$contentItems;

			if ($sliderFlip.hasClass('slider-flip-flipped')) {
				sideIndex = sections.content === 'next' ? 1 : 0;
			} else {
				sideIndex = sections.content === 'next' ? 0 : 1;
			}

			$content = $('.slider-flip-' + sides[sideIndex]).remove('style');
			$contentItems = $content.children();

			if ('function' === typeof window.getComputedStyle) {
				var styles = window.getComputedStyle($content.get(0), null);
				padding = parseInt(styles.getPropertyValue('padding-top'), 10);

				if (padding > 0) {
					height = padding;
				}

				padding = parseInt(styles.getPropertyValue('padding-bottom'), 10);

				if (padding > 0) {
					height += padding;
				}
			} else {
				padding = $.map($content.css('padding').split(' '), function(val) {
					return parseInt(val, 10);
				});

				if (padding[0] > 0) {
					height = padding[0];
				}

				if (padding[2] > 0) {
					height += padding[2];
				}
			}

			$contentItems.each(function() {
				height += $(this).outerHeight(true);
			});

			$sliderFlip.css({
				height: height + 'px',
				bottom: String(-(height/2)) + 'px'
			});
		}

		if (sections.nav) {
			$('.home-prev, .home-next').css('top', ($('.swipe-slide-active img').height() / 2) +'px');
		}
	}

	$body.
		on('click', '[data-swipe-nav]', function(e) {
			e.preventDefault();
			var $button = $(this)
				, data = $button.data()
				, swipeInstance = Corporata.swipes[data.swipeNav]
			;

			if (swipeInstance) {
				if (data.active !== '') {
					$button.
						addClass(data.active).
						siblings('.' + data.active).
						removeClass(data.active)
					;
				}

				if (data.dir === 'prev' || data.dir === 'next') {
					swipeInstance[data.dir]()
				} else {
					swipeInstance.slide(parseInt(data.dir, 10));
				}
			}
		}).
		on('click', '[data-tab]', function(e) {
			e.preventDefault();

			var $this = $(this)
				, $works
				, category
			;

			if ($(this).hasClass(ACTIVE_CLASS) && !e.data.refresh) {
				return;
			}

			$works = $('[data-category]');
			category = $this.data('tab');

			$this.
				addClass(ACTIVE_CLASS).
				siblings('.' + ACTIVE_CLASS).
				removeClass(ACTIVE_CLASS)
			;

			if (category === 'all') {
				$works.
					filter(':hidden').
					each(function () {
						var classes = $.data(this, 'orig-classes');
						if (classes) {
							$(this).attr('class', classes);
						}
					}).
					show();
			} else {
				$works.
					filter(function () {
						return $(this).data('category') !== category;
					}).
					each(function () {
						var classes = $(this).attr('class');
						if (classes) {
							$.data(this, 'orig-classes', classes);
						}
					}).
					hide().
					removeAttr('class')
				;
				$works.
					filter('[data-category="' + category + '"]').
					each(function () {
						var classes = $.data(this, 'orig-classes');
						if (classes) {
							$(this).attr('class', classes);
						}
					}).
					show()
				;
			}

			$body.
				trigger('mansory.reload').
				trigger('lazy.touch')
			;
		}).
		on('swipe.fx.start', function(e, index, element, id, firstStart) {
			var $slide = $(element)
				, data
				, panel
			;

			if (id === 'mainFlip') {
				data = $slide.data();
				panel = $sliderFlip.hasClass('slider-flip-flipped') ? 'front' : 'back';

				if (firstStart) {
					panel = 'front';
					$slide.addClass('swipe-slide-active');
				}

				$sliderFlip.
					find('.slider-flip-' + panel).
					empty().
					append("<h3>" + data.title + "</h3>\n<p>" + data.description + "</p>")
				;

				if (!firstStart) {
					$sliderFlip.toggleClass('slider-flip-flipped', panel === 'back');
				}

				if (firstStart) {
					$body.trigger('swipe.ready');
				}
			}

			$slide.closest('.swipe').height($slide.height());
			reflowSlideComponents({
				content: 'next'
			});
		}).
		on('swipe.fx.end', function(e, index, element) {
			var $slide = $(element),
				activeClass = 'swipe-slide-active';

			$slide.parent().find('.' + activeClass).removeClass(activeClass);
			$slide.addClass(activeClass);
			reflowSlideComponents({
				nav: true
			});
		}).
		on('mansory.reload', function (e) {
			$('[data-masonry-cols]').
				filter(function () {
					return $(this).data('mansory-ready');
				}).
				each(function () {
					$(this).masonry('reload')
				})
			;
		}).
		on('lazy.touch', function() {
			$win.scrollTop($win.scrollTop() + Corporata.scrollDiff);
			Corporata.scrollDiff = (Corporata.scrollDiff == 1 ? -1 : 1);
		}).
		on('submit', '#contact-form', function(e) {
			e.preventDefault();

			var $form = $(this),
					$formTitle = $form.find('fieldset h3'),
					promise;

			/**
			 * @param {Array|string} messages
			 */
			function displayError(messages) {
        var $element = $('<div class="form-block-error" />');

        if ('object' === typeof messages && null !== messages) {
          var list = ['<ul>'];

          $.each(messages, function(name, message) {
            list.push('<li>' + message + '</li>');
            $form.find('[name="' + name + '"]').addClass('field-invalid');
          });
          
          list.push('</ul>')
          $element.append(list.join("\n"));
        } else {
          $element.text(('string' === typeof messages) ? messages : $form.data('unknownErrorMessage') || 'Undefined error')
        }

        $formTitle.after($element);
			}

			if (!$form.hasClass('form-busy')) {
					$form
							.addClass('form-busy')
							.find('.form-block-success').remove().end()
							.find('.form-block-error').remove().end()
							.find('.field-invalid').removeClass('field-invalid')
					;

					promise = $.post($form.attr('action'), $form.serialize(), function onSuccess(res) {
							if (res.hasOwnProperty('success')) {
									$form.reset();
									$formTitle.after('<div class="form-block-success">' + res.success + '</div>');
							} else {
								if (res.hasOwnProperty('errors')) {
										displayError(res.errors);
								} else if (res.hasOwnProperty('error')) {
										displayError(res.error);
								} else {
										displayError(null);
								}
							}
					}, 'json');

					promise.fail(function onFail() {
							displayError(null);
					});

					promise.always(function onTick() {
							$form.removeClass('form-busy');
					});
			}
		})
	;

	$win.
		on('resize.menu', function(e, force) {
			if (force) {
				reflowMenu();
			} else {
				clearTimeout(resizeMenuTimer);
				resizeMenuTimer = setTimeout(reflowMenu, 100);
			}
		}).
		on('resize.slider', function() {
			clearTimeout(resizeSliderTimer);
			resizeSliderTimer = setTimeout(function() {
				reflowSlideComponents({
					content: 'current',
					nav: true
				})
			}, 100);
		}).
		trigger('resize.menu', true).
		trigger('resize.slider')
	;

	$headerMenuItems.on('mouseenter mouseleave', function(e) {
		var isEnter = (e.type === 'mouseenter'),
			borderWidth,
			borderLeft;

		$headerMenu.toggleClass('hover-menu', isEnter);

		if (isEnter) {
			borderWidth = $(this).width();
			borderLeft = $(this).offset().left;
		} else {
			var $activeItem = $headerMenuItems.filter('.active');
			borderWidth = $activeItem.width();
			borderLeft = $activeItem.offset().left;
		}

		$menuBorder.css({
			'width': borderWidth,
			'left': borderLeft - $headerMenu.offset().left
		});
	});

	// Initialize Main Slide with flip on page load
	var $slide = $('[data-swipe]');
	if ($slide.length) {
		$body.trigger('swipe.fx.start', [0, $slide.find('[data-index]').get(0), $slide.data('swipe'), true]);
	}

	var IE_Fix = '\v' == 'v';
	if (IE_Fix) {
		$('.head-menu li').hover(function () {
			$(this).addClass('hover');
		}, function () {
			$(this).removeClass('hover');
		});
		$('.categories ul li').hover(function () {
			$(this).addClass('hover');
		}, function () {
			$(this).removeClass('hover');
		});

		$('.recent-works li:nth-child(4n+4), .pricing-table .span4:last-child, .pricing-table .span3:last-child').css('margin-left', '6px');
		$('.social li:last-child').css('margin-right', '0');
		$('.cont-list li:last-child > div').css('border', 'none');
	}
}(jQuery));
