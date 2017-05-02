"use strict"
// API Elasticsearch
const esmng = require('./esmng.js');
const uuidV1 = require('uuid/v1');

// ES variables
const INDEX_REQUEST = 'request';
const INDEX_HASHTAGS = 'syntax_tree';
const FIRST_HASHTAG = 'Origine';
const UNTREATED = 'Untreated';
const IN_PROGRESS = 'In progress';
const DONE = 'Done';


let table_state = [];
table_state[UNTREATED] = IN_PROGRESS;
table_state[IN_PROGRESS] = DONE;
table_state[DONE] = DONE;

var exports = module.exports = {};

/*
This function save the request into the ES server. The only parameters contains the image, the user_id, the position,
and the hashtags. The date and the request_id are automatically generated.
 */

function save_request(request, res, type_platform) {
  try {
      if (request.hasOwnProperty('user_id') && request.hasOwnProperty('image') && request.hasOwnProperty('position') &&
      request.hasOwnProperty('hashtags')) {
      let key = uuidV1();
      let actual_date = new Date();
      request.request_id = key;
      request.date = actual_date;
      request.technician_id = "";
      request.state = "Untreated";
      esmng.add_document(INDEX_REQUEST, type_platform, request, function (error, response) {
        if (error) {
          res.status(500).send("The report couldn't be saved : " + error.message);
        } else {
          res.send("Request considered");
        }
      });
    } else {
      throw new Error("The request isn't correct");
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
}

/* This function retrieve all of the reports within the filter provided*/

function get_reports_filtered(request, res, type_platform) {
  let query = {"query": {}};
  try {
    let filters = request.filters;
    if (filters) {
      if(filters.length == 0) {
        query.query = {
            "match_all": {}
        };
      } else {
        filters.forEach(function (filter) {
          query.query = {"bool" : { "must" : [], "should" : []}};
          switch(filter.type) {
            case 'time_range' :
              if(filter.from) {
                let from = new Date(filter.from);
                query.query.bool.must.push({
                  "range": {
                    "date": {
                      "gte": from.getTime()
                    }
                  }
                });
              }
              if(filter.to) {
                let to = new Date(filter.to);
                query.query.bool.must.push({
                  "range": {
                    "date": {
                      "lte": to.getTime()
                    }
                  }
                });
              }
              break;
            case 'user_id' :
              break;
            case 'request_id' :
              query.query.bool.must.push({
                "term": {
                  "request_id": filter.request_id
                }
              });
              break;
            case 'hashtags' :
              break;
            case 'state' :
              filter.values.forEach(function(value) {
                query.query.bool.should.push({
                  "term": {
                    "state": value
                  }
                });
              });
              break;
            default :
              break;
          }
        });
      }
    esmng.search_document(INDEX_REQUEST, type_platform, query, function (hits) {
      let reports = [];
      if (hits.length != 0) {
        hits.forEach(function (hit) {
          reports.push(hit._source);
        });
      }
      let reports_geojson = toGeoJSON(reports, request);
      res.json(reports_geojson);
    });
    } else {
      throw new Error("The request isn't correct");
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
}

function change_state(request, res) {
  try {
    if (request.request_id) {
      let query = {"query": {"term": {
        "request_id" : request.request_id
      }}};
      esmng.search_document(INDEX_REQUEST, TYPE_FACEBOOK, query, function (hits) {
        let reports = [];
        if (hits.length != 0) {
          hits.forEach(function (hit) {
            reports.push(hit._source);
          });
        }
        let new_state = table_state[reports[0].state];
        if(new_state != null) {
          reports[0].state = new_state;
          esmng.add_document(INDEX_REQUEST, TYPE_FACEBOOK, reports[0], function (error, response) {
            if (error) {
              res.status(500).send("The report couldn't be saved : " + error.message);
            } else {
              res.json(reports[0]);
            }
          }, hits[0]._id);
        } else {
          throw new Error("The state isn't correct");
        }
      });
    } else {
      throw new Error("The request id parameter is missing");
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
}

function toGeoJSON(hits, request) {
  let geojson = {
    "type": "FeatureCollection",
    "features": []
  };
  hits.forEach(function (hit) {
    let properties = {
      "user_id": hit.user_id,
      "request_id": hit.request_id,
      "date": hit.date,
      "hashtags": hit.hashtags,
      "state": hit.state,
      "technician_id": hit.technician_id
    };
    if(request.full == true) {
      properties.image = hit.image;
    }
    let coordinates = [hit.position.lon, hit.position.lat];
    geojson.features.push({
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": coordinates
      },
      "properties": properties
    });
  });
  return geojson;
}

/* The hashtags associated with the parameter are retrieved from the ES Server and returned. */
function get_next_hashtags(hashtag, res, type_platform) {
  if(hashtag === '') {
    hashtag = FIRST_HASHTAG;
  }
  let query =  {
    match: { "name": hashtag }
  };
  esmng.search_document(INDEX_HASHTAGS, type_platform, query, function (hit) {
    console.log(hit.length);
    if (hit.length != 0) {
      let hashtags = { hashtags : [] };
      hashtags.hashtags = hit[0]._source.following;
      res.json(hashtags);
    } else {
      res.status(500).send("The hashtag doesn't exist");
    }
  });
}

//Exports
exports.save_request = save_request;
exports.get_next_hashtags = get_next_hashtags;
exports.get_reports_filtered = get_reports_filtered;
exports.change_state = change_state;