"use strict"
var mymap = L.map('app').setView([45.783374, 4.875381], 13);
/* Layer groups*/
var mapLayerGroups = [];
/* Control layer */
var overlayMaps;

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend');

  div.innerHTML =
  '<img src="static/resources/State_Untreated_icon.png" alt="Untreated" style="width:20px;height:20px;">' + '<span>' + "Untreated" + '</span>' + '<br>' +
  '<img src="static/resources/State_In_Progress_icon.png" alt="In progress" style="width:20px;height:20px;">' + '<span>' + "In progress" + '</span>';
  return div;
};

legend.addTo(mymap);

/* Map loading, with a first filter */
$(window).on('load', function () {
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
    }, {
      type : "state",
      values : ["Untreated", "In progress"]
    }],
    full : true
  }
  retrieveReports(filter, addData);
});

function changeState(id) {
  let object_id = {
    "request_id" : id
  } 
  fetch(window.Viz.apiEndpoint + '/reports/state', {
    body: JSON.stringify(object_id),
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
    });
    })
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}

/* Retrieves reports corresponding to a filter provided */
function retrieveReports(query, callback) {
  mapLayerGroups = [];
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

  let pre_icon = {
    iconUrl: '',
    iconSize: [25, 25],
    popupAnchor: [5, -20],
  };

  /* Add the data to the map */
  L.geoJSON(data,{
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      let myIcon;
      switch(feature.properties.state) {
        case "In progress" :
          pre_icon.iconUrl = 'static/resources/State_In_Progress_icon.png';
          myIcon = L.icon(pre_icon);
          break;
        case "Done" :
          pre_icon.iconUrl = 'static/resources/State_Done_icon.png';
          myIcon= L.icon(pre_icon);
          break;
        default :
          pre_icon.iconUrl = 'static/resources/State_Untreated_icon.png';
          myIcon= L.icon(pre_icon);
          break;
      }
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
  fetch(window.Viz.apiEndpoint + '/user?user_id=' + feature.properties.user_id, {
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


