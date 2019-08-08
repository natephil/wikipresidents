if (
  "IntersectionObserver" in window &&
  "IntersectionObserverEntry" in window &&
  "intersectionRatio" in window.IntersectionObserverEntry.prototype
) {
let observer = new IntersectionObserver(entries => {
  if (entries[0].boundingClientRect.y < 0) {
    document.body.classList.add("fixed");
  } else {
    document.body.classList.remove("fixed");
  }
});
observer.observe(document.querySelector("fixed"));
}

('fixed').click(function() { // when the button is clicked
    $('body,html').animate({scrollTop:0},500); // return to the top with a nice animation
});
