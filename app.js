var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

app.listen(port, function() {
  console.log('Listening on port ' + port);
});

app.get('/', function(req, res) {
  console.log('Received request on /');
  res.sendStatus(200);
});