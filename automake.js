var watch = require('watch')
  , spawn = require('child_process').spawn
  , exec = require('child_process').exec
  , myconsole = require('myconsole')
  ;

myconsole.replace();

watch.createMonitor('.', { ignoreDotFiles: true }, function (monitor) {
    monitor.on("created", check_make)
    monitor.on("changed", check_make)
    monitor.on("removed", check_make)
});

function check_make(f) {
  var match = f == 'Makefile' || /\.jade$/.test(f) || /public\/marklet\/.*\.js/.test(f);
  match = match && ! /.*\/(marklet|.*template)(.min)?.js$/.test(f)
  match = match && ! /(^\.|.*\/\.).*/.test(f)
  if( ! match ) return;
  console.log(f + ' changed, start make')
  exec('cake build', function(error, stdout, stderr) {
      if(error) myconsole.traceError(error);
      if(stdout) console.log(stdout);
      if(stderr) console.error(stderr);
  })

  // var makeprg = spawn('make')

  // makeprg.stdout.on('data', function(data) {
  //     console.log(data.toString());
  // });

  // makeprg.stderr.on('data', function(data) {
  //     console.log(data.toString());
  // });

  // makeprg.on('exit', function(code) {
  //     console.log('make done ' + code);
  // })

  // makeprg.on('error', function(error) {
  //     console.traceError(error);
  // })
}
