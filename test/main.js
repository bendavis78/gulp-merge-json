/*!
 * Copyright 2015 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/gulp-merge/blob/master/LICENSE
 */
'use strict';

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var merge = require('../');

var PLUGIN_NAME = 'gulp-merge-json';

require('mocha');
require('should');

it('should combine JSON files', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json'));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should modify property based on input function', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', function(json) {
    if (json.place) {
      json.place = 'New York';
    }

    return json;
  }));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "New York",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should add property based on input function', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', function(json) {
    if (json.settings) {
      json.settings.timezone = 'PST';
    }

    return json;
  }));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true,', '\t\t"timezone": "PST"', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should delete property based on input function', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', function(json) {
    if (json.pet) {
      delete json.pet;
    }

    return json;
  }));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should merge object if given as input function', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', {"testing": true}));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"testing": true,', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use supplied start object as base', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, {"initial": "value"}));

  stream.on('data', function(file) {
    var expected = ['{', '\t"initial": "value",', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use supplied final object to overwrite', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, false, {"place": "Las Vegas"}));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "Las Vegas",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should output a node module when true is passed as the exportModule param', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, false, false, true));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    expected = 'module.exports = ' + expected + ';';

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should not output a node module when false is passed as the exportModule param', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, false, false, false));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should not output a node module when nothing is passed as the exportModule param', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, false, false));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should not output a node module when empty string is passed as the exportModule param', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, false, false, ''));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should output the passed variable when a name is passed as the exportModule param', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, false, false, 'varname'));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    expected = 'varname = ' + expected + ';';

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should do nothing with no files', function(done) {
  var stream = gulp.src('test/empty/*.json').pipe(merge('combined.json'));

  stream.on('end', function() {
    done();
  });

  stream.on('data', function() {
    should.fail(null, null, 'Should have produced no output!');
  });
});

it('should error on invalid start object', function(done) {
  try {
    var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, 10));

    should.fail(null, null, 'Should have failed!');
  } catch (err) {
    err.message.should.equal(PLUGIN_NAME + ': Invalid start and/or end object!');

    done();
  }
});

it('should error on invalid end object', function(done) {
  try {
    var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', false, false, 10));

    should.fail(null, null, 'Should have failed!');
  } catch (err) {
    err.message.should.equal(PLUGIN_NAME + ': Invalid start and/or end object!');

    done();
  }
});

it('should error in editor function', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge('combined.json', function(json) {
    throw new Error('Oh no!');
  }));

  stream.on('error', function(err) {
    err.message.should.equal('Oh no!');

    done();
  });

  stream.on('data', function(newFile) {
    should.fail(null, null, 'Should have failed!');
  });
});

it('should error on invalid JSON', function(done) {
  var stream = gulp.src('test/invalid.json').pipe(merge('combined.json'));

  stream.on('error', function(err) {
    err.message.should.match(/Error while parsing .+test\/invalid.json: Unexpected token I/);

    done();
  });

  stream.on('data', function(newFile) {
    should.fail(null, null, 'Should have failed!');
  });
});

it('should error on stream', function(done) {
  var srcFile = new gutil.File({
    path: 'test/invalid/stream.txt',
    cwd: 'test/',
    base: 'test/invalid',
    contents: fs.createReadStream('test/invalid/stream.txt')
  });

  var stream = merge('stream.json');

  stream.on('error', function(err) {
    err.message.should.equal(PLUGIN_NAME + ': Streaming not supported!');
    
    done();
  });

  stream.on('data', function (newFile) {
    should.fail(null, null, 'Should have failed!');
  });

  stream.write(srcFile);
  stream.end();
});

it('should merge when file is passed in options object', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge({fileName: 'combined.json'}));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});


it('should allow the editor function in options object', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge({
    fileName: 'combined.json',
    edit: function(json) {
      if (json.place) {
        json.place = 'New York';
      }

      return json;
    }
  }));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "New York",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use supplied start object as base when passed in options object', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge({
    fileName: 'combined.json',
    startObj: {'initial': 'value'}
  }));

  stream.on('data', function(file) {
    var expected = ['{', '\t"initial": "value",', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use supplied final object to overwrite when passed in options object', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge({
    fileName: 'combined.json',
    endObj: {'place': 'Las Vegas'}
  }));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "Las Vegas",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should output a node module when exportModule is true in options object', function(done) {
  var stream = gulp.src('test/json/*.json').pipe(merge({
    fileName: 'combined.json',
    exportModule: true
  }));

  stream.on('data', function(file) {
    var expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    expected = 'module.exports = ' + expected + ';';

    file.contents.toString().should.eql(expected);

    done();
  });
});

