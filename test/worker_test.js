'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const Worker = require('../worker.js');
const WebApp = require('../webapp.js');

describe('template worker test example', function () {
  let work;
  let io;
  let context;
  let config;
  let job;
  let exitCode;

  function prepareWorker(done) {
    context = {};
    io = {
      on: sinon.stub().yields('123', {exitCode: exitCode}),
      removeListener: sinon.stub(),
      emit: sinon.stub()
    };

    Worker.init(config, job, sinon.stub(), function (err, res) {
      work = function () {
        return res;
      };

      if (done) {
        done();
      }
    });
  }

  beforeEach(function (done) {
    exitCode = 0;
    job = {
      project: {name: 'strider-template'},
      ref: {branch: 'master'},
      _id: '123',
      trigger: {
        type: 'manual'
      }
    };
    process.env.strider_server_name = 'http://example.com';
    config = {
      template: {
        environment: 'test message',
        prepare: 'test message'
      }
    };
    //_.each(schema, function(v,k) { config[k] = v.default });
    //config.token = 'token';
    //config.subdomain = 'subdomain';

    prepareWorker(done);
  });

  it('should set up the phase actions properly', function () {
    const setup = work();
    //environment returns a string
    expect(setup.environment).to.equal('echo "test message"');
    //prepare returns an object
    expect(setup.prepare.command).to.equal('echo');
    expect(setup.prepare.args[0]).to.equal('"test message"');

    //test returns a function
    expect(typeof setup.test).to.equal('function');
  });
});
