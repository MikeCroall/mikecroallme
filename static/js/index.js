$(document).ready(function() {
    var movingBackground = true;

    $("#chkBackground").change(function() {
        movingBackground = this.checked;
        if (!this.checked) {
            $("body").css("background-position", "50% 50%");
        }
    });

    $(document).on("mousemove", function(event) {
        if (movingBackground) {
            // 50 - default image position as percentage
            // 0.5 - to convert 0 to 1, to 0.5 to -0.5
            // 10 - multiplied by above range (0.5 to -0.5) to be offset from default image position percentage
            var cssPosX = 50 - ((0.5 - (event.pageX / $(document).innerWidth())) * 10);
            var cssPosY = 50 - ((0.5 - (event.pageY / $(document).innerHeight())) * 10);
            $("body").css("background-position", cssPosX + "% " + cssPosY + "%");
        }
    });
});
