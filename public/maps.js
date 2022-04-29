var watchID = null;
$(document).ready(function(){

    if(navigator.geolocation)
    {

        var optn = {

            enableHighAccurancy: true,
            timeout: Infinity,
            maximumAge: 0
        };

        var watchID = navigator.geolocation.watchPosition(success,failure,optn);
    }
    else
    $("p").html("HTML5 Not Supported");

    $("button").click(function(){

        if(watchID)
          navigator.geolocation.clearWatch(watchID);

          watchID = null;
          return false;

    });
});

  