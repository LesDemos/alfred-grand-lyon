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

const UNTREATED = 'Untreated';
const IN_PROGRESS = 'In progress';
const DONE = 'Done';


let table_state = [];
table_state[UNTREATED] = "Non traité";
table_state[IN_PROGRESS] = "En cours de traitement";
table_state[DONE] = "Traité";

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

getTheListMan.counter = 0;
retrieveReports(filter, getTheListMan);

/* Map loading, with a first filter */
$('#mapButton').mouseup( function () {

  setTimeout(function(){
    mymap = L.map('mapId').setView([45.750000, 4.850000], 13);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend');

      div.innerHTML =
      '<img src="resources/State_Untreated_icon.png" alt="Untreated" style="width:20px;height:20px;">' + '<span>' + table_state[UNTREATED] + '</span>' + '<br>' +
      '<img src="resources/State_In_Progress_icon.png" alt="In progress" style="width:20px;height:20px;">' + '<span>' + table_state[IN_PROGRESS] + '</span>';
      return div;
    };

    legend.addTo(mymap);

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
        values : [UNTREATED, IN_PROGRESS]
      }],
      full : true
    }
    retrieveReports(filter, addData);
  }, 500);
});


function SubForm(featureNum){
  var url="https://alfred-grand-lyon.herokuapp.com/api/reports/state",
  data=$("#"+featureNum+"Form").serialize();
  console.log(data);
  $.ajax({
    url:url,
    type:'post',
    data:data,
    success:function(){
      console.log("Submitted");
      setTimeout(function(){location.reload();}, 500);
    }
  });
}

function getTheListMan(data, onClick)
{
  $.each(data.features, function(i, feature) {
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

        let date= new Date(feature.properties.date),
        dformat = [date.getDate().padLeft(),
        (date.getMonth()+1).padLeft(),
        date.getFullYear()].join('/');

        let date_final= new Date(feature.properties.date_final),
        dformat2 = [date_final.getDate().padLeft(),
        (date_final.getMonth()+1).padLeft(),
        date_final.getFullYear()].join('/');

        let popup_text = '<div class="">' +
        '<div class="card horizontal">' +
        '<div class="card-image">' +
        '<img class="reportImage" src="' + feature.properties.image + '">' +
        '</div>' +
        '<div class="card-stacked">' +
        '<div class="card-content">' +
        '<ul class="collection">' +
        '<li class="collection-item avatar">' +
        '<img src=" '+ data.profile_pic + '" class="circle"/>' +
        '<span class="title">' + data.last_name+ '</span>' +
        '<p>' + data.first_name + '</br></p>' +
        '<p>' + dformat + ((feature.properties.date_final!=null) ? " - " + dformat2 : "") + "</br></p>" +
        '</li>' +
        '</ul>' +
        '<div class="col">' +
        '<blockquote>';



        /* We add the report hashtags */
        feature.properties.hashtags.forEach(function(hashtag){
          popup_text = popup_text + '<span class="chip">#' + hashtag + ' </span>';
        });
        popup_text = popup_text + '<p></br>';

        if(feature.properties.state == UNTREATED)
        {
          popup_text = popup_text + '<img class="stateIcon" src="resources/State_Untreated_icon.png"/>';
        }
        else if (feature.properties.state == IN_PROGRESS)
        {
          popup_text = popup_text + '<img class="stateIcon" src="resources/State_In_Progress_icon.png"/>';
        }
        else
        {
          popup_text = popup_text + '<img class="stateIcon" src="resources/State_Done_icon.png"/>';
        }


        popup_text = popup_text + '  ' + table_state[feature.properties.state] + '</br></p>' +
        '</blockquote></div>' +
        '</div>' +
        '<div class="card-action center-align">';

        if(feature.properties.state == UNTREATED)
        {
          popup_text = popup_text + '<form id="feature'+getTheListMan.counter+'Form" action="https://alfred-grand-lyon.herokuapp.com/api/reports/state" method="post">' +
          '<input type="text" name="request_id" id="request_id" value="' + feature.properties.request_id + '" hidden=true/>' +
          '<input type="text" name="technician_id" id="technician_id" value="58" hidden=true/>' +
          '</form>' +
          '<button onClick="SubForm(\'feature'+getTheListMan.counter+'\')" class="waves-effect waves-light btn-large buttonCard">Affecter un technicien</button>';
        }
        else if (feature.properties.state == IN_PROGRESS)
        {
          popup_text = popup_text + '<button disabled class="waves-effect waves-light btn-large buttonCard">Affecter un technicien</button>';
        }
        else
        {
          if(feature.properties.image_final != null)
          {
            popup_text = popup_text + '<a class="waves-effect waves-light btn-large" href="#modal1">Resultat de l\'intervention</a>' +
            '<div id="modal1" class="modal">' +
            '<div class="modal-content">' +
            '<h4>Resultat de l\'intervention</h4>' +
            '<img src="feature.properties.image_final"/>' +
            '</div>' +
            '</div>';
          }
          else
          {
            popup_text = popup_text + '<a disabled class="waves-effect waves-light btn-large" href="#modal1">Resultat de l\'intervention</a>';
          }
        }

        popup_text = popup_text +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

        var y = getTheListMan.counter + 1;

        $('#feature'+getTheListMan.counter).html(popup_text);
        $('.modal').modal();
        $('#feature'+getTheListMan.counter).after('</li><li id=feature' + y + '>');

        getTheListMan.counter = y;

      });
})
.catch(function(err) {
  console.log('Fetch Error :-S', err);
});
});
}

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
        case IN_PROGRESS :
        pre_icon.iconUrl = 'resources/State_In_Progress_icon.png';
        myIcon = L.icon(pre_icon);
        break;
        case DONE :
        pre_icon.iconUrl = 'resources/State_Done_icon.png';
        myIcon= L.icon(pre_icon);
        break;
        default :
        pre_icon.iconUrl = 'resources/State_Untreated_icon.png';
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

