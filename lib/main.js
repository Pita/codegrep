var optimist = require('optimist');
var Finder = require("./finder");
var UniversalRegex = require("./universal_regex");
var ResultPrinter = require("./result_printer");
var _ = require("underscore");

var argv = optimist
  .usage('codegrep searchregex [...] [options]')
  
  .alias('include', 'in')
  .describe('include', 'Regex for files that should be included in the search. Can be passed multiple times. Example: -in lib/*')
  .default('include',"*")

  .alias('exclude', 'ex')
  .describe('exclude', 'Regex for files that should be excluded from the search. Can be passed multiple times. Example: -ex *.bin')

  .boolean('ignoreCase')
  .alias('ignoreCase', 'i')
  .default('ignoreCase', false)
  .describe('ignoreCase', 'Flag to describe if search should be case insensitive.')

  .argv;

if(argv._.length === 0){
  console.log(optimist.help());
  process.exit(0);
}

var buildUniversalRegex = function (parameter, options) {
  var parameters = _.isArray(parameter) ? parameter : [parameter];

  var uRegexs = parameters.map(function(regex){
    return new UniversalRegex(regex, options);
  });

  var joinedRegex = uRegexs.pop();
  if(uRegexs.length > 0){
    joinedRegex = joinedRegex.join(uRegexs, options);
  }

  return joinedRegex;
};

var options = {
  ignoreCase: argv.ignoreCase
};

var defaultExclude = [".svn/*", ".git/*", ".hg/*", "CVS/*", "*.pyc", "*.pyo", "*.exe", 
                      "*.dll", "*.obj", "*.o", "*.a", "*.lib", "*.so", "*.dylib", "*.ncb", 
                      "*.sdf", "*.suo", "*.pdb", "*.idb", "*.DS_Store", "*.class", "*.psd", 
                      "*.db", "*.jpg", "*.jpeg", "*.png", "*.gif", "*.ttf", "*.tga", "*.dds", 
                      "*.ico", "*.eot", "*.pdf", "*.swf", "*.jar", "*.zip"];

if(argv.exclude){
  if(!_.isArray(argv.exclude)){
    argv.exclude = [argv.exclude];
  }
} else {
  argv.exclude = [];
}
argv.exclude = argv.exclude.concat(defaultExclude);

var searchRegex = buildUniversalRegex(argv._, {
  ignoreCase: argv.ignoreCase 
});
var fileIncludeRegex = buildUniversalRegex(argv.include, {
  ignoreCase: true
});
var fileExcludeRegex = buildUniversalRegex(argv.exclude, {
  ignoreCase: true
});

var finder = new Finder(searchRegex, fileIncludeRegex, fileExcludeRegex);
var resultPrinter = new ResultPrinter();
finder.on("find", function(result){
  resultPrinter.printResult(result);
});
finder.scan();