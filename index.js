
Function.prototype.stringify = function () {
  var match = this.toString().match(/[^]*\/\*([^]*)\*\/\s*\}$/);
  return match ? match[1] : '';
};

function _wrap_console() {
    var util = require('util');

    var new_console = {
        log: function () {
            new_console._stdout.push(util.format.apply(global, arguments));
            global.console.log.apply(global, arguments);
        },
        _stdout: []
    };

    for (var i in global.console)
        if (!new_console[i])
            new_console[i] = global.console[i];

    return new_console;
}

function _wrap_callback(cb, console) {
    return function (error, data) {
        var result = {
            stdout: console._stdout
        };
        if (error) {
            if (typeof error === 'string') {
              result.error = { message: error };
            }
            else if (typeof error === 'object') {
              result.error = { name: 'Error' };
              ['name','message','code','description','user_id','stack','status_code']
                .forEach(function (p) {
                  if (error[p] !== undefined)
                    result.error[p] = error[p];
                });
            }
            else {
              result.error = { message: error };
            }
        }
        else {
          result.result = data;
        }
        cb(null, result);
    };
}

function ip (ipAddress) {
  var range_check = require('range_check');
  return {
    in_range: function (ranges) {
      return range_check.in_range(ipAddress, ranges);
    }
  };
}

function mongo (url, callback) {
  var getDb = require('mongo-getdb');

  if (!url || /^mongo\:\/\//.exec(url)){
    throw new Error('invalid mongodb url');
  }

  getDb(url, callback);
}

['Long', 'Double', 'ObjectID', 'Timestamp', 'BSON'].forEach(function (k) {
  Object.defineProperty(mongo, k, {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('mongodb')[k];
    }
  });
});

function mysql (options) {
  var mysqlDriver = require('mysql');
  return mysqlDriver.createConnection(options);
}

var mysql_pooles = {};

function mysql_pool (options) {
  var mysqlDriver = require('mysql');

  if (typeof options === 'string') {
    var ConnectionConfig = require('mysql/lib/ConnectionConfig');
    options = ConnectionConfig.parseUrl(options);
  }

  if (!options.connectionLimit) {
    options.connectionLimit = 30;
  }

  var key = typeof options === 'string' ? options : JSON.stringify(options);
  if (mysql_pooles[key]) {
    console.log('pool length: ', mysql_pooles[key]._connectionQueue.length);
    return mysql_pooles[key];
  }

  var pool = (mysql_pooles[key] = mysqlDriver.createPool(options));

  //once the pool creates a new connection
  pool.on('connection', function (connection) {
    //when the connection emits an error,
    //remove the connection from the pool
    connection.on('error', function () {
      connection.destroy();
    });

    //make a ping in the connection every 30seconds
    setInterval(function () {
      connection.ping(function(){});
    }, 30 * 1000);
  });

  return pool;
}

function postgres (connString, callback) {
  var pg = require('pg');
  var client = new pg.Client(connString);
  client.connect(function(err) {
    if (err) return callback(err);
    callback(null, client);
  });
}

// Allow consumers of the module to expose the api on
exports.extend = extend;

// Export a copy of the exposed api
exports.api = {};
// Expose api on the exported api object.
extend(exports.api);

function extend (api) {
  if (api.__auth0_api) return;

  api.__auth0_api = true;

  api.Buffer = Buffer;
  api.mongo = mongo;
  api.mysql = mysql;
  api.mysql_pool = mysql_pool;
  api.postgres = postgres;
  api.ip = ip;
  api._wrap_callback = _wrap_callback;
  api._wrap_console = _wrap_console;

  Object.defineProperty(api, 'querystring', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('querystring');
    }
  });

  Object.defineProperty(api, 'ObjectID', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('mongodb').ObjectID;
    }
  });

  Object.defineProperty(api, 'async', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('async');
    }
  });

  Object.defineProperty(api, 'pg', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('pg');
    }
  });

  Object.defineProperty(api, 'jwt', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('jsonwebtoken');
    }
  });

  Object.defineProperty(api, 'cql', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('node-cassandra-cql');
    }
  });

  Object.defineProperty(api, '_', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('lodash');
    }
  });

  Object.defineProperty(api, 'Pubnub', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('pubnub');
    }
  });

  Object.defineProperty(api, 'Auth0', {
    configurable: false,
    enumerable: true,
    get: function (){
      return require('auth0');
    }
  });

  Object.defineProperty(api, 'sqlserver', {
    configurable: false,
    enumerable: true,
    get:  function () {
      var tediousSpec = require.__verquire
        ? 'tedious@0.1.4'
        : 'tedious';
      var tedious = require(tediousSpec);
      var sqlserver = {
        connect: function (config) {
          var Connection = tedious.Connection;
          return new Connection(config);
        },
        Request: tedious.Request,
        Types: tedious.TYPES
      };
      return sqlserver;
    }
  });

  Object.defineProperty(api, 'uuid', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('uuid');
    }
  });

  Object.defineProperty(api, 'request', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('request');
    }
  });

  Object.defineProperty(api, 'bcrypt', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('bcrypt');
    }
  });

  Object.defineProperty(api, 'crypto', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('crypto');
    }
  });

  Object.defineProperty(api, 'pbkdf2', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('easy-pbkdf2')();
    }
  });

  Object.defineProperty(api, 'xmldom', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('xmldom');
    }
  });

  Object.defineProperty(api, 'xml2js', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('xml2js');
    }
  });

  Object.defineProperty(api, 'xpath', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('xpath');
    }
  });

  Object.defineProperty(api, 'couchbase', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('couchbase');
    }
  });

  Object.defineProperty(api, 'xtend', {
    configurable: false,
    enumerable: true,
    get: function () {
      var xtendSpec = require.__verquire
        ? 'xtend@1.0.3'
        : 'xtend';
      return require(xtendSpec);
    }
  });

  Object.defineProperty(api, 'q', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('q');
    }
  });

  Object.defineProperty(api, 'azure_storage', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('azure-storage');
    }
  });

  // using capital letters because it is a factory
  // it must then be invoked var knex = Knex(...)
  // ref: https://github.com/tgriesser/knex/blob/master/knex.js
  Object.defineProperty(api, 'Knex', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('knex');
    }
  });

  Object.defineProperty(api, 'ValidationError', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('./lib/errors/ValidationError');
    }
  });

  Object.defineProperty(api, 'WrongUsernameOrPasswordError', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('./lib/errors/WrongUsernameOrPasswordError');
    }
  });

  Object.defineProperty(api, 'UnauthorizedError', {
    configurable: false,
    enumerable: true,
    get: function () {
      return require('./lib/errors/UnauthorizedError');
    }
  });
};
