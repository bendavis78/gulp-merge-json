/*!
 * Copyright 2015 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/gulp-merge/blob/master/LICENSE
 */
'use strict';

var gutil = require('gulp-util');
var merge = require('deepmerge');
var path = require('path');
var through = require('through');

var PLUGIN_NAME = 'gulp-merge-json';

module.exports = function(fileName, edit, startObj, endObj, exportModule) {

  var jsonReplacer, jsonSpace;
  if (typeof fileName === 'object') {
    // use first argument as opts
    var opts = fileName;
    fileName = opts.fileName;
    edit = opts.edit;
    startObj = opts.startObj;
    endObj = opts.endObj;
    exportModule = opts.exportModule;
    jsonReplacer = opts.jsonReplacer || null;
    jsonSpace = opts.jsonSpace || '\t';
  } else {
    jsonReplacer = null;
    jsonSpace = '\t';
  }

  if ((startObj && typeof startObj !== 'object') || (endObj && typeof endObj !== 'object')) {
    throw new gutil.PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Invalid start and/or end object!');
  }

  var editFunc;

  if (typeof edit === 'function') {
    editFunc = edit;
  } else if (typeof edit === 'object') {
    editFunc = function(json) { return merge(json, edit); };
  } else {
    editFunc = function(json) { return json; };
  }

  var merged = startObj || {};
  var firstFile = null;

  function parseAndMerge(file) {
    var parsed;

    if (file.isNull()) {
      return this.queue(file);
    }

    if (file.isStream()) {
      return this.emit('error', new gutil.PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Streaming not supported!'));
    }

    if (!firstFile) {
      firstFile = file;
    }

    try {
      parsed = JSON.parse(file.contents.toString('utf8'));
    } catch(err) {
      err.message = 'Error while parsing ' + file.path + ': ' + err.message;
      return this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
    }

    try {
      merged = merge(merged, editFunc(parsed));
    } catch (err) {
      return this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
    }
  }

  function endStream() {
    if (!firstFile) {
      return this.emit('end');
    }

    if (endObj) {
      merged = merge(merged, endObj);
    }

    var contents = JSON.stringify(merged, jsonReplacer, jsonSpace);

    if (exportModule === true) {
      contents = 'module.exports = ' + contents + ';';
    } else if (exportModule){
      contents = exportModule + ' = ' + contents + ';';
    }

    var output = new gutil.File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: path.join(firstFile.base, fileName),
      contents: new Buffer(contents),
    });

    this.emit('data', output);
    this.emit('end');
  }

  return through(parseAndMerge, endStream);
};
