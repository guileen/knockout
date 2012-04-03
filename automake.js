var watch = require('watch')
  , spawn = require('child_process').spawn
  , exec = require('child_process').exec
  ;

watch.createMonitor('.', { ignoreDotFiles: true }, function (monitor) {
    monitor.on("created", function (f, stat) {
        // Handle file changes
    })
    monitor.on("changed", function (f, curr, prev) {
        if(f == 'Makefile' || /\.jade$/.test(f)) make();
    })
    monitor.on("removed", function (f, stat) {
        // Handle removed files
    })
});

function make() {
  console.log('start make')

  var makeprg = spawn('make')

  makeprg.stdout.on('data', function(data) {
      console.log(data.toString());
  });

  makeprg.stderr.on('data', function(data) {
      console.log(data.toString());
  });

  makeprg.on('exit', function(code) {
      console.log('make done ' + code);
  })
}
