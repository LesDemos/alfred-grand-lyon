window.Viz = {
  'apiEndpoint': 'https://alfred-grand-lyon.herokuapp.com/api/',
  'access_token': 'pk.eyJ1IjoiZGV2ZGV2bHlvIiwiYSI6ImNqMjFwMmp6ODAwMGwycW5yZDJ4dXMxcnoifQ.ijq4gzGhRdL9KLfg65_HTA'
}

"use strict"
var mymap;
/* Layer groups*/
var mapLayerGroups = [];
/* Control layer */
var overlayMaps;


/* Map loading, with a first filter */
$('#mapButton').mouseup( function () {

  setTimeout(function(){
    mymap = L.map('mapId').setView([45.621856, 5.227350], 13);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: window.Viz.access_token
  }).addTo(mymap);
  /* We take the data of the last week */
  let now = new Date();
  let before = new Date();
  before.setDate(now.getDate()-7);
  let filter = {
    filters : [{
      type : "time_range",
      from : before.toString(),
      to : now.toString()
    }],
    full : true
  }

  retrieveReports(filter, addData);
}, 500);

  

});


/* Retrieves reports corresponding to a filter provided */
function retrieveReports(query, callback) {
  mapLayerGroups = [];
  fetch(window.Viz.apiEndpoint + 'reports', {
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
      console.log(data);
      callback(data, onClick);
    });
  })
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}

/* Add a GeoJSON file to the map, with a customized icon */
function addData(data, onClick) {
  /* Add the control layer to the map */
  overlayMaps = L.control.layers(undefined, overlayMaps).addTo(mymap);

  let myIcon = L.icon({
    iconUrl: 'resources/fix-icon.png',
    iconSize: [50, 50],
    popupAnchor: [10, -20],
  });

  /* Add the data to the map */
  L.geoJSON(data,{
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {icon: myIcon});
    }
  }).on("click", onClick);

}

/* Method called when a popup is opened */
function onClick(event) {
  var clickedMarker = event.layer;
  console.log(clickedMarker);
}

/* Creation of layer groups, added to the map, and binding of popups */
function onEachFeature(feature, layer) {
  var lg = mapLayerGroups[feature.properties.hashtags[0]];

  /* If the layer group doesn't exist, we create it */
  if (lg === undefined) {
    lg = new L.layerGroup();
    //add group layer to the map 
    lg.addTo(mymap);
    //store layer
    mapLayerGroups[feature.properties.hashtags[0]] = lg;
    // add group layer to the control layer
    overlayMaps.addOverlay(lg, [feature.properties.hashtags[0]]);
  }

  //add the feature to the layer
  lg.addLayer(layer);
  getInfoFb(feature, layer);
}

/* Getting basic facebook user info, thanks to its id */
function getInfoFb(feature, layer) {
  fetch(window.Viz.apiEndpoint + 'user?user_id=' + feature.properties.user_id, {
    method: 'GET',
    headers: {'Content-Type': 'application/json; charset=UTF-8'}
  }).then(
  function(response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      return;
    }
    response.json().then(data => {
      data_treatment(data, feature, layer);
    });
  })
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}

/* Binding of popups */
function data_treatment(response, feature, layer) {
  let date= new Date(feature.properties.date),
  dformat = [date.getDate().padLeft(),
  (date.getMonth()+1).padLeft(),
  date.getFullYear()].join('/');
  let popup_text = '<div class="popup-container">' + '<div class="fb-container">' +
  '<div class="fb-informations">'+
  '<div class="fb-thumb"><img src="' + response.profile_pic + '" height=60 width=60/></div>' +
  '<div class="fb-content">' +
  '<div class="fb-title">' + response.last_name+ '</div>' +
  '<div class="fb-subtitle">' + response.first_name + '</div>' +
  '<div class="fb-text">' + dformat + '</div>' +
  '</div></div><div class="report-informations">';

  /* We add the report hashtags */
  feature.properties.hashtags.forEach(function(hashtag){
    popup_text = popup_text + '<span class="fb-tag">' + hashtag + '</span>';
  });
  popup_text = popup_text + '</div></div>';

  /* We add the report image if there is one */
  if(feature.properties.image) {
    popup_text = popup_text + '<div class="report-thumb"><img src="' + feature.properties.image + '" height=140 width=100/></div>';
  }
  popup_text = popup_text + '</div>';

  /* Binding of the popup created */
  if (feature.properties) {
    layer.bindPopup(popup_text, {
      maxWidth : 800
    });
  }
}

Number.prototype.padLeft = function(base,chr){
  var  len = (String(base || 10).length - String(this).length)+1;
  return len > 0? new Array(len).join(chr || '0')+this : this;
}