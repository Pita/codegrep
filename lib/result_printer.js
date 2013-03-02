var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var colors = require('colors');

var ResultPrinter = module.exports = function () {

};

var NO_DISPLAY = 1, FULL_DISPLAY = 2, HIGHLIGHTED_DISPLAY = 3; 

ResultPrinter.prototype = {
  _write: function(str){
    try{
      fs.writeSync(1, str);    
    } catch(e){}
  }

  , _writeln: function(str){
    this._write((str || "") + "\n");
  } 

  , _splitLines: function(str){
    var seperator = "\n";
    var lines = [];

    var start = 0, end = 0, length = str.length;
    while(start < length){

      end = str.indexOf(seperator, start);
      if(end === -1){
        end = length;
      }

      var text = str.substring(start, end);

      lines.push({
          text: text
        , start: start
        , end: end
        , display: NO_DISPLAY
      });

      start = end + 1;
    }

    return lines;
  }

  , _markLines: function(lines, matches){
    var mark = function(number, level){
      if(number >= 0 && number < lines.length && level > lines[number].display){
        lines[number].display = level;
      }
    };

    matches.forEach(function(match){
      var matchLine = 0;
      for(var i = 0;i<lines.length;i++){
        var line = lines[i];
        if(line.end >= match.position){
          matchLine = i;
          break;
        }
      }

      mark(matchLine - 2, FULL_DISPLAY);
      mark(matchLine - 1, FULL_DISPLAY);
      mark(matchLine    , HIGHLIGHTED_DISPLAY);
      mark(matchLine + 1, FULL_DISPLAY);
      mark(matchLine + 2, FULL_DISPLAY);
    });
  }

  , _pad: function(str, length){
    while(str.length < length){
      str = " " + str;
    }

    return str;
  }

  , _formatDotedLine: function(line){
    var lineNumber = ""+(line + 1);
    lineNumber = lineNumber.replace(/[0-9]/g, ".");
    lineNumber = this._pad(lineNumber, 5);
    lineNumber = lineNumber.white;
    return lineNumber;
  }

  , _formatLineOutput: function(lines, line, regex){
    var lineNumber = this._pad(""+(line + 1), 5);
    var text = lines[line].text;

    switch(lines[line].display){
      case NO_DISPLAY:
        return false;
      case FULL_DISPLAY:
        return lineNumber.magenta + "  " +  text.white;
      case HIGHLIGHTED_DISPLAY:
        text = regex.replace(text, function(str){
          return str.inverse;
        });
        return lineNumber.magenta.bold + ": ".white.bold + text.white;
    }
  }

  , printResult: function(result){
    var lines = this._splitLines(result.fileContent);
    this._markLines(lines, result.matches);

    this._write("\n" + result.path.yellow + "\n");

    var fill = false;
    for(var i=0;i<lines.length;i++){
      var lineText = this._formatLineOutput(lines, i, result.regex);

      if(lineText !== false){
        fill = true;
        this._writeln(lineText);
      } else if(fill){
        this._writeln(this._formatDotedLine(i));
        fill = false;
      }
    }
  }
};

