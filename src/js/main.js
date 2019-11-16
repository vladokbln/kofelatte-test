//=../bower_components/jquery/dist/jquery.js
//=../bower_components/bootstrap/dist/js/bootstrap.js



$(function() {
	$('.header-nav-toggle').click(function(){
		$('.header-nav').toggleClass('active')
	});
	$(".header-nav__link").click(function (event) {
		event.preventDefault();
		var id  = $(this).attr('set-link'),
				top = $('#' + id).offset().top;
		$('body,html').animate({scrollTop: top - 40}, 1000);
		$('.header-nav').removeClass('active')
	});
	
	$(window).scroll(function(){
		var elem = $('.header-nav'),
				top = $(this).scrollTop();
		if (top >= 70) {
			elem.addClass('fixed')
		} 
		else {
			elem.removeClass('fixed');
		}
	});

	$(window).scroll(function() {
		if($(this).scrollTop() != 0) {
			$('#toTop').fadeIn();
		} else { 
			$('#toTop').fadeOut();
		}
	});
	$('#toTop').click(function() {
		$('body,html').animate({scrollTop:0},1000);
	});	 
});