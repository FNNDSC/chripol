str_aboutME     = `

NAME

    CUBE.js -- part of chrispol
    (ChRIS POlling explorations)

SYNOPSIS

    CLI: node CUBE.js [options]

DESC

    CUBE.js models an extremely simple CUBE that maintains an internal
    feed list state. This state is available to a caller in two formats:

        * a shallow state, analogous to the data returned by a call
          to the API to get a feeds list;

        * a deep state, that contains additional per-feed information
          assumeed to be only accessible via another directed API call
          on a given feed.

ARGS
    --man
    Show this man page. All other options, even if specified, are ignored.

    --verbose
    Be chatty!

    --generateNewFeedTable <noOfFeeds>
    Create a new deep-state feed table with <noOfFeeds> elements. This will
    overwrite any existing states and is an effective RESET.

`

const   yargs       = require("yargs");

const   CUBE        = require('../uCUBE/uCUBE.js');
const   CUBEoptions = CUBE.CUBEoptions;
const   ChRIS       = new CUBE.uCUBE(CUBEoptions);

if(CUBEoptions.man) {
    ChRIS.CLIoutput_show(str_aboutME);
}
else {
    if(CUBEoptions.generateNewFeedTable) {
        b_stateExist    = ChRIS.feeds_newCreate();
    } else {
        if(!ChRIS.feeds_stateRead()) {
            ChRIS.newFeedTable = 50;
            ChRIS.initialize();
        }
    }
    // if(ChRIS.l_feeds.length) {
    //     ChRIS.table_generate();
    //     ChRIS.feeds_stateSave();
    // }
}