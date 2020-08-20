import $ from "jquery";
import L from "leaflet";
$('.spinner').toggle();

$(document).ready(function() {
    // Navbar

    $(window).scroll(function() {
        if (window.innerWidth <= 800){
            $('.navbar__nav').hide('slow');
        }
        var height = $('.jumbotron').height();
        var scrollTop = $(window).scrollTop();
        if (scrollTop >= height - 78) {
            $('nav').addClass('solid-nav');
        } else {
            $('nav').removeClass('solid-nav');
        }
    });

    $('.navbar__toggler').click( (e) =>{
        $('.navbar__nav').toggle(800);
    });
    $('main').click( (e) => {
        if (window.innerWidth <= 800){
            $('.navbar__nav').hide('slow');
        }
    });
    // Back to top Button
    $(window).scroll(function() {
        if ($(window).scrollTop() > 200) {
            $('.gotop').show('fast');
        } else {
            $('.gotop').hide('fast');
        }
    });

    $('.gotop').click( (e) => {
        e.preventDefault();
        $('html, body').animate({scrollTop:0}, '500');
    });      
    // crew details
    var crewRequestSettings = {
        "url": "http://api.open-notify.org/astros.json",
        "method": "GET",
        "timeout": 0,
        "headers": {
        }
    }
    $.ajax(crewRequestSettings).done(function (data) {
        $('.crew-no').html(data.number);
        var crew_list = '';
        data['people'].forEach( (people) => {
            crew_list += `<li>${people.name}</li>`;
        });
        $('.crew-list').html(crew_list);
    })

    // Live Map
    // initialize the map
    var map = L.map('map').setView([20, 0], 3);

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
      minZoom: 1
    }).addTo(map);

    map.touchZoom.disable();
    map.scrollWheelZoom.disable();

    var layerGroup = L.layerGroup().addTo(map);

    var iss = L.icon({
        iconUrl: "../assets/iss_png.png",
        iconSize: [25, 25]
    });
    // User location
    var settings = {
        "url": 'https://api.ipdata.co?api-key=test',
        "method": "GET",
        "timeout": 0,
        "headers": {   
        }
    };
    var settings_1 = {
        "url": 'https://api.ipdata.co?api-key=de8fe20471e70f59c26717e16923744ece733cfeeb9e3e0969ee9e3c',
        "method": "GET",
        "timeout": 0,
        "headers": {   
        }
    };
    try{
        $.ajax(settings).done( function(data) {
            var user = L.marker([data.latitude,data.longitude]).addTo(map);
            user.bindPopup(`Your location`).openPopup();
        });
    }catch{
        $.ajax(settings_1).done( function(data) {
            var user = L.marker([data.latitude,data.longitude]).addTo(map);
            user.bindPopup(`Your location`).openPopup();
        });
    }
    // ISS location
    function moveISS () {
        var settings = {
            "url": 'https://api.wheretheiss.at/v1/satellites/25544',
            "method": "GET",
            "timeout": 0,
            "headers": {   
            }
        };
        $.ajax(settings).done( function(data) {
            var lat = data.latitude;
            var lon = data.longitude;
            var timestamp = data.timestamp*1000;
            var newdate = new Date(timestamp);
            var velocity = data.velocity.toFixed(3)+' km/h';
            var visibility = data.visibility;

            $('.timestamp').html(newdate.toLocaleString("en-US"));
            $('.latitude').html(lat.toFixed(3));
            $('.longitude').html(lon.toFixed(3));
            $('.velocity').html(velocity);
            $('.visibility').html(visibility);


            
            layerGroup.clearLayers();
            var circle = L.circle([lat, lon], {
                color: '#e63946',
                fillColor: '#e63946',
                fillOpacity: 0.2,
                radius: 950000
            }).addTo(layerGroup);
            var marker = L.marker([lat, lon], {icon: iss}).addTo(layerGroup);
            marker.bindPopup(`<b>ISS</b><br>Lat:${lat}<br>Lon:${lon}`)
            map.setView([lat, lon]);
        });
        setTimeout(moveISS, 5000); 
    }
    moveISS();
    // // ISS orbit
    // function drawOrbit () {
    //     var settings = {
    //         "url": 'https://api.wheretheiss.at/v1/satellites/25544/tles',
    //         "method": "GET",
    //         "timeout": 0,
    //         "headers": {   
    //         }
    //     };
    //     $.ajax(settings).done( function(linedata) {
    //         var lines = []
    //         lines.push(linedata.line1);
    //         lines.push(linedata.line2);
    //         L.geoJSON(lines[0], {
    //             style: function (feature) {
    //                 return {color: "#1d3557"};
    //             }
    //         }).addTo(map);
    //         console.log(lines);
    //     });
    //     setTimeout(drawOrbit, 20000);
    // }
    // // drawOrbit();
    // NOT working code

    // forecast
    function ISSForcast (latitude_user, longitude_user){
        var settings = {
            "url": "http://www.n2yo.com/rest/v1/satellite/visualpasses/25544/",
            "method": "GET",
            "timeout": 0,
            "headers": {   
            }
        }
        settings.url += latitude_user + '/' + longitude_user + '/0/2/300/&apiKey=DRRUCD-UZHYNU-VHFCJK-4J3M';
        $.ajax(settings).done( (data) => {
            if( data.info.passescount != 0){
                var pass_info = `<p>We found that International space station will be visible for ${data.info.passescount} times from \"${window.city}\" (provided location). Further details are following:</p>`
                pass_info += '<ol>';
                data.passes.forEach(element => {
                    console.log(element);
                    var starttime = new Date(element.startUTC*1000);
                    var maxtime = new Date(element.maxUTC*1000);
                    var endtime = new Date(element.endUTC*1000);
                    pass_info += '<li><ul class="data-list">';
                    pass_info += `<li><b>Start Date&Time: </b>${starttime.toString()}</li>`;
                    pass_info += `<li><b>Duration: </b>${(element.duration/60).toFixed(2)} Minutes</li>`; 
                    pass_info += '</ul></li>';
                    pass_info += `<div class="table"><table class="pass-table"><thead><tr><th>Phase</th><th>Azimuth</th><th>Direction</th><th>ISS Elivation</th><th>Time</th></tr></thead><tbody><tr><th>Start</th><td>${element.startAz}</td><td>${element.startAzCompass}</td><td>${element.startEl}</td><td>${starttime.toLocaleTimeString()}</td></tr><tr><th>Max</th><td>${element.maxAz}</td><td>${element.maxAzCompass}</td><td>${element.maxEl}</td><td>${maxtime.toLocaleTimeString()}</td></tr><tr><th>End</th><td>${element.endAz}</td><td>${element.endAzCompass}</td><td>${element.endEl}</td><td>${endtime.toLocaleTimeString()}</td></tr></tbody></table></div>`;
                });
                pass_info += '</ol><p class="note"><i>Above mentioned time has calculated according your device time.</i></p>'
                $('.pass-info').html(pass_info);
                $('.spinner').toggle(200);
                $('.show-forecast').toggle(500);
            }else{
                alert("No Pass Found!");
                location.reload();
            }
        });

    }
    $('.forecast__btn').click((e) => {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: ($('#forecast').offset().top)
        },400);
        $('.spinner').toggle(200);
        $('.show-forecast').toggle(500);
        // geolocation
        function getLocation() {
            if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation is not supported by this browser.");
                location.reload();          
            }
        }
        function showPosition(position) {
            ISSForcast(position.coords.latitude,  position.coords.longitude);
        }
        function showError(error) {
            switch(error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                location.reload();
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                location.reload();
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                location.reload();
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                location.reload();
                break;
            }
        }
        if($('.form__field').val() != ""){
            var settings = {
                "url": `https://geocode.xyz/${$('.form__field').val()}?json=1`
            }
            $.ajax(settings).done((data) => {
                window.city = data.standard.city;
                ISSForcast(data.latt,data.longt);
            });
        }else{
            getLocation();
        }
    });
});
