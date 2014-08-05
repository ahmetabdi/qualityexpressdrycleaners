/**
 * Instagram Pictures
 */
(function ($) {
  $.fn.igPics = function (settings) {
    /**
     * @type {boolean}
     */
    var useLazyImages = (typeof $.fn.lazyImages === 'function');

    /**
     * @type {Object}
     */
    var options = $.extend({
      userId: null,
      accessToken: null,
      count: 10,
      complete: $.noop,
      error: $.noop
    }, settings || {});

    return this.each(function onTick() {
      var $container = $(this);

      if (options.userId == null || options.accessToken == null) {
        $container.append("<li>Please specify a User ID and Access Token, as outlined in the docs.</li>");
        options.error.call($container.get(0));
      } else {
        var url = "https://api.instagram.com/v1/users/" + options.userId + "/media/recent?access_token=" + options.accessToken + "&count=" + options.count + "&callback=?";

        $.getJSON(url, function onSuccess(response) {
          var list = [];

          $.each(response.data, function onTick(index, record) {
            var title = record.caption ? ' title="' + record.caption.text + '"' : '';
            var src = useLazyImages
              ? 'data-lazy-img="' + record.images.thumbnail.url + '" src="img/dot.png"'
              : 'src="' + record.images.thumbnail.url + '"';

            list.push('<li><a href="' + record.link + '" target="_blank"' + title + '>'+
              '<img ' + src + '>' +
              '</a></li>');
          });

          if (list.length) {
            $container.append(list.join("\n"));
          }

          options.complete.call($container.get(0));
        });
      }
    })
  }
})(jQuery);