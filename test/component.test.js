/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var SANDBOX =  path.resolve(__dirname, 'sandbox');
var common = require('./common');
var assert = require('assert');

describe('loopback:component generator', function() {
  beforeEach(common.resetWorkspace);
  beforeEach(function createSandbox(done) {
    helpers.testDirectory(SANDBOX, done);
  });

  // This is a simple smoke test to execute all generator steps
  // Since most of the heavy lifting is done by loopback-workspace,
  // we don't have to test it again.

  var EXPECTED_PROJECT_FILES = [
    'package.json',

    'server/config.json',
    'server/datasources.json',
    'server/model-config.json',
    'server/server.js',

    'client/README.md'
  ];

  it('creates expected files', function(done) {

    var gen = givenAppGenerator();

    helpers.mockPrompt(gen, {
      name: 'test-component'
    });

    gen.run({}, function () {
      helpers.assertFile(EXPECTED_PROJECT_FILES);
      done();
    });
  });

  it('creates the project in a subdirectory if asked to', function(done) {
    var gen = givenAppGenerator();

    helpers.mockPrompt(gen, {
      name: 'test-component',
      dir: 'test-component',
    });

    gen.run({}, function() {
      // generator calls `chdir` on change of the destination root
      process.chdir(SANDBOX);

      var expectedFiles = EXPECTED_PROJECT_FILES.map(function(f) {
        return 'test-component/' + f;
      });
      helpers.assertFile(expectedFiles);
      done();
    });
  });

  it('normalizes the appname with .', function(done) {
    var cwdName = 'x.y';
    var expectedAppName = 'x-y';
    testAppNameNormalization(cwdName, expectedAppName, done);
  });

  it('normalizes the appname with space', function(done) {
    var cwdName = 'x y';
    var expectedAppName = 'x-y';
    testAppNameNormalization(cwdName, expectedAppName, done);
  });

  it('normalizes the appname with @', function(done) {
    var cwdName = 'x@y';
    var expectedAppName = 'x-y';
    testAppNameNormalization(cwdName, expectedAppName, done);
  });

  function givenAppGenerator(modelArgs) {
    var name = 'loopback:component';
    var path = '../../component';
    var gen = common.createGenerator(name, path, [], modelArgs, {});
    return gen;
  }

  function testAppNameNormalization(cwdName, expectedAppName, done) {
    var gen = givenAppGenerator();
    var dir = path.join(SANDBOX, cwdName);
    helpers.testDirectory(dir, function() {
      helpers.mockPrompt(gen, {
      });

      gen.run({}, function() {
        // generator calls `chdir` on change of the destination root
        process.chdir(SANDBOX);

        var expectedFiles = EXPECTED_PROJECT_FILES.map(function(f) {
          return cwdName + '/' + f;
        });
        helpers.assertFile(expectedFiles);
        var pkg = require(path.join(dir, 'package.json'));
        assert.equal(pkg.name, expectedAppName);
        done();
      });
    });
  }
});