$(document).ready(function()	{
	$('body').css( "font-size", $(window).width() / 80 );
});

$(window).on('resize orientationChanged', function() {
	$('body').css( "font-size", $(window).width() / 80 );
});