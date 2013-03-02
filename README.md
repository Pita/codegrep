# codegrep
```bash
# install using
sudo npm install -g codegrep

# get help by just typing
codegrep

# go to a code directory and search trough it using
codegrep YOURSEARCHTERM

# search trough all js files
codegrep YOURSEARCHTERM --in *.js --in public/javascript/*

# exclude certain files from results
codegrep YOURSEARCHTERM --ex *.bin --ex build/*

# search case insensitive
codegrep YOURSEARCHTERM -i

# use a regex to search 
codegrep /YOURREGEX/
```

### Search results design inspired by Sublime Text

![search results](https://github.com/pita/codegrep/raw/master/screenshot.png "search results")