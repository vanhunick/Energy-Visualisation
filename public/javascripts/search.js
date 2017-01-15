/**
 * Created by Nicky on 12/01/2017.
 */
function search(){

    // Grab the main search string from the search bar
    var val = $('search-box').text();

    var selected = $('.selectpicker option:selected').val();


    // If empty return
    if(val == null)return;

    // Create all the parameters
    var parameters = {
        category : val

    };

    window.location.replace("/search?" + serialise(parameters));
}

function serialise(obj) {
    var str = [];
    for(var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}



$(document).ready( function() {

    //Responds to enter being pressed in the search bar
    $('#main-search').on('keyup keypress', function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            search();
            return false;
        }
    });
});
