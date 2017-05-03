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
      //console.log(request);
      if (request.hasOwnProperty('user_id') && request.hasOwnProperty('image') && request.hasOwnProperty('position') &&
      request.hasOwnProperty('hashtags')) {
      let key = uuidV1();
      let actual_date = new Date();
      request.request_id = key;
      request.date = actual_date;
      request.technician_id = "";
      request.image_final = null;
      request.date_final = null;
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
        query.query = {"bool" : { 
                            "must" : [
                              {
                                "bool": {
                                  "should": []
                                }
                              },
                              {
                                "bool": {
                                  "should": []
                                }
                              }
                            ]
                              }
                      };
        filters.forEach(function (filter) {
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
              query.query.bool.must.push({
                "term": {
                  "user_id": filter.user_id
                }
              });
              break;
            case 'request_id' :
              query.query.bool.must.push({
                "term": {
                  "request_id": filter.request_id
                }
              });
              break;
            case 'technician_id' :
              query.query.bool.must.push({
                "term": {
                  "technician_id": filter.technician_id
                }
              });
              break;
            case 'hashtags' :
              filter.hashtags.forEach(function(hashtag) {
                query.query.bool.must[1].bool.should.push({
                  "term": {
                    "hashtags": hashtag
                  }
                });
              });
              break;
            case 'state' :
              filter.values.forEach(function(value) {
                query.query.bool.must[0].bool.should.push({
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
    let sort = "date:desc";
    esmng.search_document(INDEX_REQUEST, type_platform, query, sort, function (hits) {
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

function change_state(request, res, type_platform, callback) {
  if (request.request_id) {
    let query = {"query": {"term": {
      "request_id" : request.request_id
    }}};
    let sort = "date:desc";
    esmng.search_document(INDEX_REQUEST, type_platform, query, sort, function (hits) {
      let reports = [];
      if (hits.length != 0) {
        hits.forEach(function (hit) {
          reports.push(hit._source);
        });
      }
      let new_state = table_state[reports[0].state];
      if(new_state != null) {
        reports[0].state = new_state;
        switch(new_state) {
          case IN_PROGRESS :
            if(request.technician_id) {
              reports[0].technician_id = request.technician_id;
            } else {
               callback(new Error("The technician id is missing"), res);
            }
            break;
          case DONE :
            if(request.image_final) {
              reports[0].image_final = request.image_final;
            } 
            let actual_date = new Date();
            reports[0].date_final = actual_date;
            break;
          default :
            break;
        }
          esmng.add_document(INDEX_REQUEST, type_platform, reports[0], function (error, response) {
            if (error) {
              callback(new Error("The report couldn't be saved : " + error.message), res);
            } else {
              callback(null, res, reports[0]);
            }
          }, hits[0]._id);
      } else {
        callback(new Error("The state isn't correct"), res);
      }
    });
  } else {
    callback(new Error("The request id parameter is missing"), res);
  }
}
  
function sendFinalReport(reports, res){
  
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
      "technician_id": hit.technician_id,
      "date_final": hit.date_final
    };
    if(request.full != false) {
      properties.image = hit.image;
      properties.image_final = hit.image_final;
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
  esmng.search_document(INDEX_HASHTAGS, type_platform, query, "", function (hit) {
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