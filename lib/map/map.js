"use strict"
var mymap = L.map('app').setView([45.621856, 5.227350], 13);
var myLayer;
$(window).on('load', function () {
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: window.Viz.access_token
  }).addTo(mymap);
  let now = new Date();
  let before = new Date();
  before.setDate(now.getDate()-2);
  let filter = {
    filters : [{
      type : "time_range",
      from : before.toString,
      to : now.toString()
    }]
  }
  myLayer = L.geoJSON(undefined,{
    onEachFeature: onEachFeature
  }).addTo(mymap);
  retrieveReports(filter);
});

function retrieveReports(query) {
  fetch(window.Viz.apiEndpoint + '/reports', {
    body: JSON.stringify(query),
    method: 'POST',
    headers: {'Content-Type': 'application/json; charset=UTF-8'}
  }).then(
  function(response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      return;
    }
    response.json().then(data => {
      console.log(JSON.stringify(data));
      myLayer.addData(data);
  });
  })
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}

function onEachFeature(feature, layer) {
  // does this feature have a property named popupContent?
  console.log(JSON.stringify(feature));
  let date= new Date(feature.properties.date),
    dformat = [(date.getMonth()+1).padLeft(),
        date.getDate().padLeft(),
        date.getFullYear()].join('/') +' ' +
      [date.getHours().padLeft(),
        date.getMinutes().padLeft(),
        date.getSeconds().padLeft()].join(':');
  let customised_popup = "User id " + feature.properties.user_id + "<br/>" + "Date " + dformat;
  if (feature.properties) {
    layer.bindPopup(customised_popup);
  }
}

Number.prototype.padLeft = function(base,chr){
  var  len = (String(base || 10).length - String(this).length)+1;
  return len > 0? new Array(len).join(chr || '0')+this : this;
}


