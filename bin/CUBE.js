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

    --stateFile <stateFileName>
    The name of the CUBE json statefile.

    --getFullDeepState
    Show the full (Feed) deep state.

    --getDeepState <limit>,<offset>
    Show a partial (Feed) deep state bounded by <limit>,<offset>

    --getFieldForID <id>,<field>
    Return the <value> for <field> in feed <id>.

    --addFeed
    Add a new Feed to the CUBE core state.

    --advanceFeed <feedID>
    Advance the internals of the <feedID>.

`;

const   yargs       = require("yargs");

const   CUBE        = require('../uCUBE/uCUBE.js');
const   CUBEoptions = CUBE.CUBEoptions;
const   ChRIS       = new CUBE.uCUBE(CUBEoptions);
const { table }     = require('table');
const   outbox      = require('../util/outbox.js');
const   colorize    = require("json-colorizer");

/**
 * The table_generate function accepts a list of dictionaries and
 * returns a list with only the dictionary values.
 *
 *
 * @param l_feeds List of dictionary elements for a set of feeds.
 * @return The body of the table.
 *
 * @doc-author Trelent
 */
 function table_generate(l_feeds) {
    let l_body          = []
    if(l_feeds.length) {
        l_body      = l_feeds.map(function (d_i) {
            return Object.values(d_i);
          });
    }
    if(!l_body.length) {
        output.outputBox_print('No feeds returned!', comms = 'warning');
    }
    return(l_body);
}

/**
 * The table_render function takes a list of feeds and returns a
 * rendered table containing those feeds.
 *
 *
 * @param l_feeds Used to Generate the table rows.
 * @return The table_generate function.
 *
 * @doc-author Trelent
 */
function table_render(l_feeds) {
    let l_header    = ['id', 'Analysis', 'Created', 'Creator', 'Run Time', 'Size', 'JobsDone', 'JobsRunning', 'TotalJobs'];
    l_feeds.splice(0, 0, l_feeds[0]);
    l_feeds[0]      = l_header;
    let l_rows      = table_generate(l_feeds);
    console.log(table(l_rows));
}

let output  = new outbox.outbox(CUBEoptions);
output.outputBox_setup();

if(CUBEoptions.man) {
    ChRIS.CLIoutput_show(str_aboutME);
    process.exit();
}

if(CUBEoptions.generateNewFeedTable) {
    b_stateExist    = ChRIS.feeds_newCreate();
} else {
    if(!ChRIS.feeds_stateRead()) {
        ChRIS.newFeedTable = 50;
        ChRIS.initialize();
    }
}

if(CUBEoptions.getFullDeepState) {
    table_render(ChRIS.l_feeds);
}

if(CUBEoptions.getFieldForID.length) {
    let l_args  = CUBEoptions.getFieldForID.split(',')
    let d_query = ChRIS.feed_getFieldValue(l_args[0], l_args[1]);
    if(d_query['status']) {
        ChRIS.CLIoutput_show('For ID ' + l_args[0] + ', the ' + l_args[1] +
                            ' is ' + d_query['value']);
    } else {
        ChRIS.CLIoutput_show('Error: ' + JSON.stringify(d_query, 0, 4), 'error');
    }
}

if(CUBEoptions.addFeed) {
    ChRIS.feed_addNew();
}

if(CUBEoptions.advanceFeed) {
    ChRIS.CLIoutput_show(colorize(ChRIS.feed_advanceState(CUBEoptions.advanceFeed), {pretty: true}));
}

if(CUBEoptions.getDeepState.length) {
    let l_numberOffset  = CUBEoptions.getDeepState.split(',');
    let l_feeds         = ChRIS.getStates({'limit': l_numberOffset[0], 'offset': l_numberOffset[1]});
    table_render(l_feeds);
}

