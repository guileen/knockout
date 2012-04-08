MARKLET_VER = 0.1
VERSION = 0.1

config = require './config.js'
{exec:_exec} = require 'child_process'
fs = require 'fs'

STAGE_TEMPLATE = 'public/marklet/stage_template.js'
TB_TEMPLATE = 'public/marklet/tb_template.js'
MARKLET_MODULES = [
  # javascript to combind
  'public/marklet/intro.js'
  'public/marklet/bootstrap-transition.js'
  'public/marklet/bootstrap-tooltip.js'
  'public/marklet/bootstrap-popover.js'
  'public/marklet/bootstrap-modal.js'
  'public/assets/js/jade.runtime.js'

  STAGE_TEMPLATE
  TB_TEMPLATE

  'public/marklet/main.js'
  'public/marklet/outro.js'
]

LOADER_JS = 'public/marklet/loader.js'
LOADER_MIN_JS = 'public/marklet/loader.min.js'
MARKLET_JS = 'public/marklet/marklet.js'
MARKLET_MIN_JS = 'public/marklet/marklet.min.js'

exec = (cmd, cb) ->
  _exec cmd, (err, stdout, stderr)->
    console.log(stdout)
    console.error(stderr)
    cb() if cb

task 'build', ()->
  invoke 'loader'
  invoke 'marklet'
  console.log 'cake done'

task 'marklet', 'build marklet', () ->
  invoke 'jade'
  console.log MARKLET_MODULES
  marklet = MARKLET_MODULES.map (filename)->
    console.log(filename)
    fs.readFileSync(filename, 'utf8')

  marklet = marklet.join('\n')
  console.log(marklet)
  marklet = marklet
    .replace(/\(function\( window \) {/g, '')
    .replace(/}...window..;/g, '')
    .replace(/((1))/, '1')
    .replace(/window.jQuery/g, 'jQuery')
    .replace(/@BASE_URL/, config.staticRoot)
    .replace(/@DATE/, new Date())
    .replace(/@VERSION/, VERSION)
    .replace(/@MARKLET_VER/, MARKLET_VER)
  console.log(marklet)
  fs.writeFileSync(MARKLET_JS, marklet, 'utf8')
  exec "uglifyjs --unsafe #{MARKLET_JS} > #{MARKLET_MIN_JS}"

task 'loader', 'build loader', () ->
  loaderjs = fs.readFileSync(LOADER_JS, 'utf8')
  loaderjs = loaderjs.replace(/@BASE_URL/g, config.staticRoot)
  fs.writeFileSync(LOADER_MIN_JS + '.temp', loaderjs)
  exec "uglifyjs --unsafe #{LOADER_MIN_JS}.temp > #{LOADER_MIN_JS}", ()->
    fs.unlink(LOADER_MIN_JS + '.temp')



task 'jade', 'build jade', ()->
  exec "jade -c -D --out #{STAGE_TEMPLATE} --var stage_template views/marklet/stage.jade"
  exec "jade -c -D --out #{TB_TEMPLATE} --var tb_template views/marklet/tb.jade"
