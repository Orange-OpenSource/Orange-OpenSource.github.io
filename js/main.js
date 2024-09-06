/*
 * Orange GitHub main js - v0.2
 * SPDX-FileCopyrightText: (C) 2017 - 2024 Orange
 * SPDX-License-Identifier: Apache-2.0
 *
 * (C) 2017 Orange, all right reserved
 * 
 * Licensed under the Apache License, Version 2.0
 */

$(document).ready(function(){

    if (window.location.hash != "") {
        topPage = $(window.location.hash);
        if (!topPage.is(":visible")) {
            topPage = $("#repositories");
        }

        $(".navbar-nav li").removeClass("active");
        $(".navbar-nav a[href='#repositories']").parent("li").addClass("active");

        $('html, body').animate({
            scrollTop: topPage.offset().top + 120,
        }, 750);
    }

	/*--------------------------------------*\
                SCROLL TO
    \*--------------------------------------*/
    $('.navbar-nav li a').click(function() {

        var page = $(this).attr('href');

        $(".navbar-nav li").removeClass("active");
        $(this).parent("li").addClass("active");

        $('html, body').animate({
            scrollTop: $(page).offset().top -119,
        }, 750 );

    });

	/*--------------------------------------*\
                BACKTOTOP
    \*--------------------------------------*/
	$('.btn-backtotop').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 800);
		return false;
	});

});
