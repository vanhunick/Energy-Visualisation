/**
 * Created by Nicky on 12/01/2017.
 */
function search(){
    var value = document.getElementById('search-box').value;

    if(value == null)return;

    // Advanced search variables
    //var cat = $('#sel-catagory :selected').text();
    //var min =  $('#min-price').val();
    //var max =  $('#max-price').val();
    //var valued = $("#chk-stock").is(':checked');
    //var category = $("#category").val();
    //var isExpanded = $("#filter-panel").attr("aria-expanded");

    var parameters = { q: value
        //category: category,
        //minPrice:min,
        //maxPrice:max,
        //valued:valued,
        //adv:advanced
    };

    console.log(parameters);
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
