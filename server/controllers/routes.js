var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var helpers = require('../helpers/app-helpers.js');

router.get('/:app/routes', function(req, res) {
  var successcb = function(data){
    res.json(data.routes);
  }

  helpers.getApiEndpoint(req, "/v1/apps/" + encodeURIComponent(req.params.app) + "/routes", {}, successcb, helpers.standardErrorcb(res))
});

// Create New Route
router.post('/:app/routes', function(req, res) {
  var successcb = function(data){
    res.json(data);
  }

  helpers.postApiEndpoint(req, "/v1/apps/" + encodeURIComponent(req.params.app) + "/routes", {}, {route: req.body}, successcb, helpers.standardErrorcb(res));
});

// Update Route
router.patch('/:app/routes/:route', function(req, res) {
  var successcb = function(data){
    res.json(data);
  }
  var data = req.body;
  delete data.path;

  helpers.execApiEndpoint('PATCH', req,  "/v1/apps/" + encodeURIComponent(req.params.app)+ "/routes/" + encodeURIComponent(req.params.route), {}, {route: data}, successcb, helpers.standardErrorcb(res));
});

// Delete Route
router.delete('/:app/routes/:route', function(req, res) {
  var successcb = function(data){
    res.json(data);
  }

  helpers.execApiEndpoint('DELETE', req,  "/v1/apps/" + encodeURIComponent(req.params.app)+ "/routes/" + encodeURIComponent(req.params.route) , {}, {}, successcb, helpers.standardErrorcb(res));
});

// Run Route
router.post('/:app/routes/:route/run', function(req, res) {
  var successcb = function(data){
    res.json({output: data});
  };
  var errcb = function(status, err){
    console.log("Error. Api responded with ", status, err);
    var text = "Something went terribly wrong (Status Code: " + status + ") ";
    if (err){
      try {
        var parsed = JSON.parse(err);
        if (parsed && parsed.error && parsed.error.message){
          text = parsed.error.message;
        }
        if (parsed.request_id){
          text += "\n request_id: " + parsed.request_id;
        };
      } catch (e) {
      }
    }
    res.status(400).json({msg: text});
  }
  var data = req.body.payload;
  if (req.headers['x-jwt-key']) {
    var token = jwt.sign(data, req.headers['x-jwt-key']);
    var authHeader = {'Authorization': 'Bearer ' + token };
  }
  else {
    var authHeader = {};
  }
  var path = "/r/" + encodeURIComponent(req.params.app)+ "/" + encodeURIComponent(req.params.route);
  helpers.execApiEndpointRaw('POST', req,  path, {}, data, successcb, errcb, authHeader);

});


module.exports = router;
