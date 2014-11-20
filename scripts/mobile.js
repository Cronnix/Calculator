/**
* Have mobile styling logic separately. Although only a few lines here, no need to clutter main JS file. This could be directly in script tags in DOM too.
*/

$('#app').ready(function() {

    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    // If mobile, make app fullscreen to avoid wasting screen space. 
    if (isMobile.any()) {
        console.log('mobile!');
        $("#app").css({
            'max-height' : '100%',
            'max-width' : '100%'
        });
    }
});
