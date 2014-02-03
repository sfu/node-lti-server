$('.cover_image').load(function() {

    var img = new Image();
    var self = this;
    img.onload = function() {
        if (img.width === 1) {
            self.src = "/libraryReserves/images/no_cover_image.png";
        }
    }

    img.src = this.src;
});
