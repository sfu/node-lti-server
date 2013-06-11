$('.cover_image').load(function() {
    if (this.width === 1) {
        this.src = "/images/no_cover_image.png";
    }
});
