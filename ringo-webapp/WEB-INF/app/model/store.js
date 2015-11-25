/**
 * @fileoverview This module instantiates the SQL store used by this application.
 * It has to distinguish between the production and development server.
 */

var log = require("ringo/logging").getLogger(module.id);
var config = require("../config/config");

var {Store, ConnectionPool, Cache} = require("ringo-sqlstore");

/**
 * A connection pool for the MySQL database.
 */
var connectionPool = module.singleton("connectionpool", function() {
    var url = config.get("db:url");
    var driver = config.get("db:driver");
    var username = config.get("db:username");
    var password = config.get("db:password");

    log.info("Instantiating connection pool:", username + "@" + url);
    return new ConnectionPool({
        "url": url,
        "driver": driver,
        "username": username,
        "password": password
    });
});

var entityCache = module.singleton("entityCache", function() {
    return new Cache(config.get("db:cacheSize"));
});

var queryCache = module.singleton("queryCache", function() {
    return new Cache(config.get("db:cacheSize"));
});

/**
 * The Store this application uses.
 */
var store = module.exports = new Store(connectionPool);

store.setEntityCache(entityCache);
store.setQueryCache(queryCache);
store.registerEntityModule(module.resolve("./all"));