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
  before.setDate(now.getDate()-4);
  let filter = {
    filters : [{
      type : "time_range",
      from : before.toString(),
      to : now.toString()
    }],
    full : true
  }
  myLayer = L.geoJSON(undefined,{
    onEachFeature: onEachFeature
  }).addTo(mymap);
  retrieveReports(filter, addData);
});

function retrieveReports(query, callback) {
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

function addData(data, onClick) {
  myLayer.addData(data).on("click", onClick);
}

function onClick(event) {
  var clickedMarker = event.layer;
  console.log(clickedMarker);
}

function onEachFeature(feature, layer) {
  getInfoFb(feature, layer);
}

// getting basic user info
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

function data_treatment(response, feature, layer) {
  // does this feature have a property named popupContent?
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
    feature.properties.hashtags.forEach(function(hashtag){
      popup_text = popup_text + '<span class="fb-tag">' + hashtag + '</span>';
    });
    popup_text = popup_text + '</div></div>';
    if(feature.properties.image) {
      popup_text = popup_text + '<div class="report-thumb"><img src="' + feature.properties.image + '" height=140 width=100/></div>';
    }
  popup_text = popup_text + '</div>';
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


