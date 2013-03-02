var _ = require("underscore");

var UniversalRegex = module.exports = function (str, options) {
  if(options){
     _.extend(this._options, options);
  }

  this._buildRegex(str);
};

var NORMAL_REGEX_REGEX = (/^(\/)(.+)(\/)$/);
var SIMPLE_REGEX_REGEX = (/^([^\*]*)(\*)([^\*]*)$/);

UniversalRegex.prototype = {
    _regex: null
  , _options: {
      ignoreCase: false
  }
  
  , _buildRegex: function(str){
    if(this._isNormalRegex(str)){
      this._regex = this._buildFromNormalRegex(str);
    } else if(this._isSimpleRegex(str)){
      this._regex = this._buildFromSimpleRegex(str);
    } else {
      this._regex = this._buildFromSimpleTerm(str);
    }
  }

  , _isNormalRegex: function(str){
    return NORMAL_REGEX_REGEX.test(str);
  }

  , _isSimpleRegex: function(str){
    return SIMPLE_REGEX_REGEX.test(str);
  }

  , _escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  , _buildRegexOptionString: function () {
    return (this._options.ignoreCase ? "i" : "") +
           "g";
  }

  , _buildFromNormalRegex: function(str){
    var split = NORMAL_REGEX_REGEX.exec(str);
    var regexOptions = this._buildRegexOptionString();
    var regexText = split[2];

    return new RegExp(regexText, regexOptions);
  }

  , _buildFromSimpleRegex: function(str){
    var split = SIMPLE_REGEX_REGEX.exec(str);
    var regexOptions = this._buildRegexOptionString();
    var regexText = this._escapeRegExp(split[1]) + ".*" + this._escapeRegExp(split[3]);

    return new RegExp(regexText, regexOptions);
  }

  , _buildFromSimpleTerm: function(str){
    var regexOptions = this._buildRegexOptionString();
    var regexText = this._escapeRegExp(str);

    return new RegExp(regexText, regexOptions);
  }

  , search: function (text) {
    var matches = [];
    text.replace(this._regex, function(){
      var position = arguments[arguments.length - 2];
      var text = arguments[0];

      matches.push({
          text: text
        , position: position
      });

      return text;
    });

    return matches;
  }

  , replace: function(text, func){
    return text.replace(this._regex, func);
  }

  , matches: function(text){
    return !!text.match(this._regex);
  }

  , join: function(uRegexs, options){
    var regexSources = [this._regex.source];

    uRegexs.forEach(function(regex){
      regexSources.push(regex._regex.source);
    });

    var regexText = "/(" + regexSources.join('|') + ")/";

    return new UniversalRegex(regexText, options);
  }
}