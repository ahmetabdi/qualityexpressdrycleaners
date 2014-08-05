(function($) {
  /**
   * @type {jQuery}
   */
  var $win = $(window);

  /**
   * @type {jQuery}
   */
  var $document = $(document);

  /**
   * @type {string|boolean}
   */
  var transitionEvent = (function() {
    var founded = false;
    var names = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend'
    };

    for (var prop in names) {
      if (names.hasOwnProperty(prop) && document.body.style[prop]) {
        founded = names[prop];
        break;
      }
    }

    return founded;
  })();

  /**
   * @type {{addImage:Function, removeImage:Function}}
   */
  var LazyLoader = (function() {
    /**
     * @type {Array.<LazyImage>}
     */
    var images = [];

    /**
     * @type {number}
     */
    var renderTimer = null;

    /**
     * @type {number}
     */
    var renderDelay = 100;

    /**
     * @type {number}
     */
    var documentHeight = null;

    /**
     * @type {number}
     */
    var documentTimer = null;

    /**
     * @type {number}
     */
    var documentDelay = 2000;

    /**
     * @type {boolean}
     */
    var isWatchingWindow = false;

    /**
     * @param {LazyImage} image
     */
    function addImage(image) {
      images.push(image);

      if (!renderTimer) {
        startRenderTimer();
      }

      if (!isWatchingWindow) {
        startWatchingWindow();
      }
    }

    /**
     * @param {LazyImage} image
     */
    function removeImage(image) {
      for (var i = 0; i < images.length; i++) {
        if (images[i] === image) {
          images.splice(i, 1);
          break;
        }
      }

      if (!images.length) {
        clearRenderTimer();
        stopWatchingWindow();
      }
    }

    /**
     * @returns {void}
     */
    function checkDocumentHeight() {
      if (renderTimer) {
        return;
      }

      var currentDocumentHeight = $document.height();

      if (currentDocumentHeight === documentHeight) {
        return;
      }

      documentHeight = currentDocumentHeight;
      startRenderTimer();
    }

    /**
     * @returns {void}
     */
    function checkImages() {
      var visible = [];
      var hidden = [];
      var windowHeight = $win.height();
      var scrollTop = $win.scrollTop();
      var bottomFoldOffset = (scrollTop + windowHeight);
      var i = images.length;

      while (i--) {
        var image = images[i];
        if (image.isVisible(scrollTop, bottomFoldOffset)) {
          visible.push(image);
        } else {
          hidden.push(image);
        }
      }

      i = visible.length;

      while (i--) {
        visible[i].render();
      }

      images = hidden;
      clearRenderTimer();

      if (!images.length) {
        stopWatchingWindow();
      }
    }

    /**
     * @returns {void}
     */
    function clearRenderTimer() {
      clearTimeout(renderTimer);
      renderTimer = null;
    }

    /**
     * @returns {void}
     */
    function startRenderTimer() {
      renderTimer = setTimeout(checkImages, renderDelay);
    }

    /**
     * @returns {void}
     */
    function startWatchingWindow() {
      isWatchingWindow = true;
      $win.on('resize.lazyImage', windowChanged);
      $win.on('scroll.lazyImage', windowChanged);
      documentTimer = setInterval(checkDocumentHeight, documentDelay);
    }

    /**
     * @returns {void}
     */
    function stopWatchingWindow() {
      isWatchingWindow = false;
      $win.off('resize.lazyImage', windowChanged);
      $win.off('scroll.lazyImage', windowChanged);
      clearInterval(documentTimer);
    }

    /**
     * @returns {void}
     */
    function windowChanged() {
      if (!renderTimer) {
        startRenderTimer();
      }
    }

    return({
      addImage: addImage,
      removeImage: removeImage
    });
  })();

  // ------------------------------------------ //

  /**
   * @param {jQuery} $element
   * @param {Object=} settings
   * @constructor
   */
  function LazyImage($element, settings) {
    var source = $element.data('lazyImg');
    var origStyle = $element.attr('style');
    var isRendered = false;
    var height = null;
    var top;
    var bottom;
    var fadeDelay;
    var options = $.extend({
      classNamePrefix: 'lazy-img-'
    }, settings || {});

    /**
     * @param {string} name
     * @return {string}
     */
    function className(name) {
      return (options.classNamePrefix || '') + name;
    }

    $element.addClass(className('busy'));

    /**
     * @param {number} topFoldOffset
     * @param {number} bottomFoldOffset
     * @returns {boolean}
     */
    function isVisible(topFoldOffset, bottomFoldOffset) {
      if ($element.is(':hidden')) {
        return false;
      }

      if (height === null) {
        height = $element.height();
      }

      top = $element.offset().top;
      bottom = top + height;

      return (
        (top <= bottomFoldOffset && top >= topFoldOffset) ||
        (bottom <= bottomFoldOffset && bottom >= topFoldOffset) ||
        (top <= topFoldOffset && bottom >= bottomFoldOffset)
      );
    }

    /**
     * @returns {void}
     */
    function render() {
      isRendered = true;
      renderSource();
    }

    /**
     * @params {string} newSource
     */
    function setSource(newSource) {
      source = newSource;

      if (isRendered) {
        renderSource();
      }
    }

    /**
     * @params {Object=} event
     */
    function fadeTransitionEnd() {
      if (origStyle) {
        $element.attr('style', origStyle);
      } else {
        $element.removeAttr('style');
      }

      $element
        .removeClass(className('fade-in'))
        .addClass(className('success'))
//        .off(transitionEvent, fadeTransitionEnd)
      ;

      clearTimeout(fadeDelay);
      fadeDelay = null;
    }

    function renderSource() {
      var img = new Image();
      var src = source;

      img.onerror = function onTick() {
        $element
          .removeClass(className('busy'))
          .addClass(className('fail'));
      };

      img.onload = function() {
        if ($element[0].nodeName.toLowerCase() === 'img') {
          $element.attr('src', src);
        } else {
          $element.css('background-image', 'url("' + src + '")');
          origStyle = $element.attr('style');
        }

        $element.removeClass(className('lazy-busy'));

        if (transitionEvent) {
          $element.css('opacity', 0);
          fadeDelay = setTimeout(function() {
            $element
              .addClass(className('fade-in'))
              .one(transitionEvent, fadeTransitionEnd);
          }, 0);
        } else {
          fadeTransitionEnd();
        }
      };

      img.src = src;
    }

    return({
      isVisible: isVisible,
      render: render,
      setSource: setSource
    });
  }

  $.LazyImage = LazyImage;
  $.LazyLoader = LazyLoader;

  /**
   * @param {Object=} options
   * @returns {jQuery}
   */
  $.fn.lazyImages = function(options) {
    return this.each(function() {
      var lazyImage = new LazyImage($(this), options);

      $.data(this, 'lazyImage', lazyImage);
      LazyLoader.addImage(lazyImage);
    });
  };

  $document.ready(function() {
    $('[data-lazy-img]').lazyImages();
  });
})(jQuery);
