"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
var config = require("../config/db.js")

if (process.env.DATABASE_URL) {
  var sequelize = new Sequelize(process.env.DATABASE_URL);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect
  });
}

sequelize
  .authenticate()
  .then(function (err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  })

sequelize
  .sync( /*{ force: true }*/ ) // Force To re-initialize tables on each run
  .then(function (err) {
    console.log('It worked!');
  }, function (err) {
    console.log('An error occurred while creating the table:', err);
  })

var db = {};

// Security configuration
const allowedExtension = '.js';
const basePath = path.resolve(__dirname);

fs
  .readdirSync(basePath)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && 
           (file !== 'index.js') && 
           file.endsWith(allowedExtension);
  })
  .forEach(function (file) {
    const fullPath = path.normalize(path.join(basePath, file));
    
    // Security check: Verify the path hasn't escaped the base directory
    if (!fullPath.startsWith(basePath)) {
      console.error(`Security warning: Invalid path detected: ${file}`);
      return;
    }

    try {
      // Modern sequelize model loading (replacing deprecated import)
      const model = require(fullPath)(sequelize, Sequelize.DataTypes);
      if (!model || !model.name) {
        console.error(`Invalid model in file: ${file}`);
        return;
      }
      db[model.name] = model;
    } catch (error) {
      console.error(`Error loading model ${file}:`, error);
    }
  });

Object.keys(db).forEach(function (modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;