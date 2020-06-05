$(function() {
  // allow HTML5 tags used by Silex to be styled with CSS (polyfill)
  document.createElement('HEADER');
  document.createElement('VIDEO');

  // store jquery references
  var $win = $(window);
  var $doc = $(document);
  var $body = $('body');

  // expose data to components
  window.silex = window.silex || {};
  window.silex.data = JSON.parse($('.silex-json-styles').text());
  window.silex.scale = 1;
  window.silex.scroll = {top: 0, left: 0};
  window.silex.getCurrentPage = function() {
    var pageable = $body.pageable;
    var currentPageName = pageable ? $body.pageable().data()['silexlabs-pageable'].options.currentPage : $body.attr('data-current-page');
    var currentPage = silex.pages.filter(function(idx, el2) { return el2.name === currentPageName })[0];
    return currentPage;
  };

  // retro compatibility with old components
  // TODO: check if we can remove this?
  window.silex.resizeBody = function() {};

  // ************************************
  // the page system (with hash in the URL)
  // ************************************
  // the page system is only for preview and inside the editor
  if(!$body.hasClass('silex-published')) {
    // get the first page name from silex data
    var firstPageName = silex.data.pages[0].link.value;
    /**
     * callback for change events
     * called when a page is opened
     */
    $body.on('pageChanged', function (event, pageName) {
      // mark links to the current page as active
      $('[data-silex-href*="#!'+pageName+'"]').addClass('page-link-active');
      // $('[id*="'+pageName+'"]').addClass('page-link-active');

      // prevent iframe content from staying in the dom
      // this prevent a youtube video to continue playing while on another page
      // this is useful in chrome and not firefox since display:none does not reset iframe dom in chrome
      $('[data-silex-iframe-src]').each(function() {
        this.setAttribute('src', this.getAttribute('data-silex-iframe-src'));
      });
      $('.paged-element-hidden iframe').each(function() {
        var src = this.getAttribute('src');
        if(src) {
          this.setAttribute('data-silex-iframe-src', src);
          this.setAttribute('src', '');
        }
      });
    });
    /**
     * init page system
     * Use deep links (hash) only when `body.silex-runtime` is defined, i.e. not while editing
     */
    $body.pageable({
      currentPage: firstPageName,
      useDeeplink: $body.hasClass('silex-runtime'),
      pageClass: 'paged-element'
    });
    /**
     * Silex links
     * Only when `body.silex-runtime` is defined, i.e. not while editing
     * Links are not clickable while editing
     */
    $('.silex-runtime [data-silex-href]').click(function () {
      var href = this.getAttribute('data-silex-href');
      if (href.indexOf('#') === 0){
        window.location.href = href;
      }
      else {
        window.open(href, '_blank');
      }
    });
  }

  // ************************************
  // Resize system (scale down when screen is smaller than content)
  // ************************************

  if(!$body.hasClass('silex-editor')) {
    onScroll();
    onResize();
    $win.resize(onResize);
    $win.scroll(onScroll);
  }

  // if(!$body.hasClass('silex-published')) {
  //   $body.on('pageChanged', function() {
  //     initFixedPositions();
  //     onScroll();
  //     onResize();
  //   });
  // }

  // cross browser get scroll (even IE)
  function getScroll() {
    var container = $(document.scrollingElement || 'html');
    return {
      left: container.scrollLeft(),
      top: container.scrollTop()
    }
  }

  function onResize() {
    // if the site has a defined width and the window is smaller than this width, then
    // scale the website to fit the window
    // This happens also on mobile

    // scale on mobile or on desktop only when needed
    var ratio = getScaleRatio();
    var scroll = getScroll();

    // notify the components that the resize will occure
    $doc.trigger('silex.preresize', {
      scrollTop: scroll.top/ratio,
      scrollLeft: scroll.left/ratio,
      scale: ratio
    });
    window.data = {
      scrollTop: scroll.top/ratio,
      scrollLeft: scroll.left/ratio,
      scale: ratio
    };

    // expose the ratio to components
    window.silex.scale = ratio;
    window.silex.scrollTop = scroll.top;
    window.silex.scrollLeft = scroll.left;

    if(ratio === 1) {
      // reset scale
      $body.css({
        'transform': '',
        'transform-origin': '',
        'min-width': '',
        'height': ''
      });
      // unscale some elements
      $('.prevent-scale').css({
        'transform': '',
        'transform-origin': ''
      })
    }
    else {
      // scale the body
      $body.css({
        'transform': 'scale(' + ratio + ')',
        'transform-origin': '0 0',
        'min-width': getScaleBreakPoint() + 'px',
        'height': $body.height() * ratio
      });
      // unscale some elements
      $('.prevent-scale').css({
        'transform': 'scale(' + (1/ratio) + ')',
        'transform-origin': '0 0'
      })
    }
    $doc.trigger('silex.resize', {
      scrollTop: scroll.top/ratio,
      scrollLeft: scroll.left/ratio,
      scale: ratio
    });
  }

  function onScroll() {
    // simulate the fixed position
    var ratio = getScaleRatio();
    var scroll = getScroll();
    $doc.trigger('silex.prescroll', {
      scrollTop: scroll.top/ratio,
      scrollLeft: scroll.left/ratio,
      scale: ratio
    });
    window.data = {
      scrollTop: scroll.top/ratio,
      scrollLeft: scroll.left/ratio,
      scale: ratio
    };
    var offsetTop = scroll.top / ratio;
    var offsetLeft = scroll.left / ratio;
    $('.fixed').css({
      'position': '',
      'transform': 'translate(' + offsetLeft + 'px, ' + offsetTop + 'px)',
      'transform-origin': '0 0'
    });
    $('.fixed.prevent-scale').css({
      'position': '',
      'transform': 'translate(' + offsetLeft + 'px, ' + offsetTop + 'px) scale(' + (1/ratio) + ')',
      'transform-origin': '0 0'
    });
    $doc.trigger('silex.scroll', {
      scrollTop: scroll.top/ratio,
      scrollLeft: scroll.left/ratio,
      scale: ratio
    });
  }

  // utility functions
  function isBellowBreakPoint() {
    return window.matchMedia('only screen and (max-width: 480px)').matches;
  }
  function getScaleRatio() {
    var winWidth = $win.width();
    if((window.silex.data.site.width && winWidth < window.silex.data.site.width) || isBellowBreakPoint()) {
      // scale the site
      var breakPoint = getScaleBreakPoint();
      return winWidth / breakPoint;
    }
    return 1;
  }
  function getScaleBreakPoint() {
    return isBellowBreakPoint() ? 480 : window.silex.data.site.width;
  }
});