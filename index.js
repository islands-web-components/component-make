var fs = require('fs');
var log = require('pretty-log');

var CssMake = require("./lib/css-builder");
var vulcan = require("vulcanize/lib/vulcan");

var Q = require('q');

var cmd = require('coa').Cmd()
  .name('component-make')
  .opt()
    .name('block')
    .short('b').long('block')
    .act(function(opts) {
      return opts;
    })
    .end();

cmd.do(process.argv.slice(2)).then(function(args) {
  var cssMaker = new CssMake(args.block);

  cssMaker.run()
    .then(
      function(res) {
        return writeCssFile(res.name, res.css);
      }, 
      logError
    )
    .then(
      function(name) {
        log.success(name + '.css file has been created!');
        return readHtmlFile(name);
      },
      logError
    )
    .then(
      function(res) {
        var options = {
          inputSrc: res.data,
          output: res.name + '-built.html',
          inline: true,
          csp: true,
          verbose: true
        };
        vulcan.setOptions(options, function(err) {
          if (err) {
            logError(err);
            return;
          }
          vulcan.processDocument();
          log.success('Done!');
        });
      },
      logError
    )
});

function writeCssFile(filename, data) {
  var writing = Q.defer();

  fs.writeFile(filename + '.css', data, function(err) {
    if (err) {
      writing.reject(err);
      return;
    }
    writing.resolve(filename);
  });

  return writing.promise;
}

function readHtmlFile(filename) {
  var reading = Q.defer();

  fs.readFile(filename + '.html', function(err, buf) {
    if (err) {
      reading.reject(err);
      return;
    }
    reading.resolve({
      name: filename,
      data: buf
    });
  });

  return reading.promise;
}

function logError(err) {
  log.error(err);
  process.exit(1);
}