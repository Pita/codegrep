var _ = require("underscore");
var fs = require("fs");
var EventEmitter = require('events').EventEmitter;

var Finder = module.exports = function (searchRegex, fileIncludeRegex, fileExcludeRegex) {
  this._searchRegex = searchRegex;
  this._fileIncludeRegex = fileIncludeRegex;
  this._fileExcludeRegex = fileExcludeRegex;
};

Finder.prototype = {
  scan: function(){
    this._scanFolder(".");
  }

  , _readdirSync: function(path){
    try {
      var prefix = (path === ".") ? "" : (path + "/");
      var paths = fs.readdirSync(path).map(function(listingPoint){
        return prefix + listingPoint;
      });

      return paths;
    } catch(e){
      return [];
    }
  }

  , _readPathTypeSync: function(path){
    try {
      var stats = fs.statSync(path);

      if(stats.isDirectory()){
        return "dir";
      } else if(stats.isFile()){
        return "file";
      } else {
        return "unknown";
      }
    } catch(e){
      return "unknown";
    }
  }

  , _readFileSync: function(path){
    try {
      var content = fs.readFileSync(path, "utf8");
      return content;
    } catch(e){
      return "";
    }
  }

  , _scanFolder: function(path){
    var self = this;

    var paths = this._readdirSync(path);

    paths.forEach(function(path){
      var type = self._readPathTypeSync(path);

      if(type === "dir"){
        self._scanFolder(path);
      } else if(type === "file"){
        self._handleFile(path);
      }
    });
  }

  , _handleFile: function(path){
    if(!this._validPath(path)) return;

    var fileContent = this._readFileSync(path);
    var matches = this._searchRegex.search(fileContent);

    if(matches.length > 0){
      this.emit("find", {
          path: path
        , matches: matches
        , fileContent: fileContent
        , regex: this._searchRegex
      });
    }
  }

  , _validPath: function(path){
    if(this._fileExcludeRegex.matches(path)){
      return false;
    } 

    return this._fileIncludeRegex.matches(path);
  }
};

_.extend(Finder.prototype, EventEmitter.prototype);