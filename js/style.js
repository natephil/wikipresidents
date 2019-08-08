$(window).scroll(function() { // when the page is scrolled run this
    if($(this).scrollTop() != 0) { // if you're NOT at the top
        $('#top').fadeIn("fast"); // fade in
    } else { // else
        $('#top').fadeOut("fast"); // fade out
    }
});

$('#top').click(function() { // when the button is clicked
    $('body,html').animate({scrollTop:0},500); // return to the top with a nice animation
});
