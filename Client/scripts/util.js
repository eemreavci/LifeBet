$(window).scroll(function () {
  if ($(document).scrollTop() == 0) {
    $('nav').removeClass('tiny');
    $('.navbar-user-picture').show();
    $('.navbar-user-name').css('top', '-7em');
    $('.navbar-logout').css('top', '-14em');
  } else {
    $('nav').addClass('tiny');
    $('.navbar-user-picture').hide();
    $('.navbar-user-name').css('top', '-1em');
    $('.navbar-logout').css('top', '-4em');
  }
});