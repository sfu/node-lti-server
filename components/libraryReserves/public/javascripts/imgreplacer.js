$('.cover_image').load(function() {
    if (this.width === 1) {
        this.src = "/libraryReserves/images/no_cover_image.png";
    }
});
