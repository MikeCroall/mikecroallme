$(document).ready(function() {
    var movingBackground = $("#chkBackground").prop("checked");

    var targetX = 50;
    var targetY = 50;
    var currentX = 50;
    var currentY = 50;

    function approachTarget() {
        var xDiff = targetX - currentX;
        var yDiff = targetY - currentY;

        if (xDiff > 0.2 || xDiff < -0.2) {
            currentX += 0.1 * xDiff;
        }
        if (yDiff > 0.2 || yDiff < -0.2) {
            currentY += 0.1 * yDiff;
        }

        $("body").css("background-position", currentX + "% " + currentY + "%");

        if (movingBackground) {
            window.requestAnimationFrame(approachTarget);
        }
    }

    if (movingBackground) {
        window.requestAnimationFrame(approachTarget);
    }

    $("#chkBackground").change(function() {
        movingBackground = this.checked;
        if (this.checked) {
            window.requestAnimationFrame(approachTarget);
        } else {
            targetX = 50;
            targetY = 50;
            currentX = 50;
            currentY = 50;
            $("body").css("background-position", "50% 50%");
        }
    });

    $(document).on("mousemove", function(event) {
        if (movingBackground) {
            // 50 - default image position as percentage
            // 0.5 - to convert 0 to 1, to 0.5 to -0.5
            // 10 - multiplied by above range (0.5 to -0.5) to be offset from default image position percentage
            targetX = 50 - ((0.5 - (event.pageX / $(document).innerWidth())) * 10);
            targetY = 50 - ((0.5 - (event.pageY / $(document).innerHeight())) * 10);
        }
    });
});
