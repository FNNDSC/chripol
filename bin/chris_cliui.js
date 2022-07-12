#!/usr/bin/env node

const   str_aboutMe = `

NAME

    chris_cliui -- part of chripol
    (ChRIS POlling explorations)

SYNOPSIS

    node chris_cliui.js

DESC

    This simple nodejs program is meant to be a simple testbed for exploring
    various CUBE Feed Table (Analysis Table) polling regimes. It functions as
    a simple text/CLI-based interface to a simulated model CUBE backend.

ARGS
    --man
    Show this man page. All other options, even if specified, are ignored.

    --verbose
    Be chatty!

    --getfeeds <number>,<offset>
    Get a certain <number> of feeds starting from <offset>.

    --poll <number>,<offset>
    Simulate a polling operation that polls for <number> of feeds starting
    from offset <offset>.

    --UIstateFile <stateFileName>
    The name of the state file to use. Defaults to 'UIstateFile.json'.

    --showState
    Render the UI state (read from <stateFileName>) in a nice table
    roughly analogous to the actual ChRIS UI. The entire state is shown,
    so the table rows depend on a previous polling <number>.

`;

const   yargs       = require("yargs");
const   interface   = require("../util/cujs.js");
const { table }     = require('table');
const   outbox      = require('../util/outbox.js');
const   fs          = require('fs');
var     PRINTJ      = require('printj');
var     sprintf     = PRINTJ.sprintf, vsprintf = PRINTJ.vsprintf;

const   CLIoptions  = yargs
    .usage("Usage: [--verbose] [--man]")
    .option(
        "v", {
                alias:          "verbose",
                describe:       "If specified, be chatty",
                type:           "boolean",
                default:        false
        })
    .option(
        "g", {
                alias:          "getfeeds",
                describe:       "Number of feeds to get as comma separated list of '<number>,<offset>'",
                type:           "string",
                default:        ""
        })
    .option(
        "m", {
                alias:          "man",
                describe:       "If specified, show a man page",
                type:           "boolean",
                default:        false
        })
    .option(
        "s", {
                alias:          "UIstateFile",
                describe:       "The UI state file to use",
                type:           "string",
                default:        "UI-state.json"
        })
    .option(
        "P", {
                alias:          "showState",
                describe:       "Show the state recorded in the UIstateFile",
                type:           "boolean",
                default:        false
        })
    .option(
        "p", {
                alias:          "poll",
                describe:       "Simulate a polling event off feeds at '<number>,<offset>'",
                type:           "string",
                default:        ""
        })
    .argv;

let CUJS             = new interface.cujs(CLIoptions);

/**
 * The UIstate_readFromFile function reads the contents of a file
 * and returns it as an array representing the state.
 *
 *
 * @param stateFile The file from which to read.
 * @return A state object.
 *
 * @doc-author Trelent
 */
function    UIstate_readFromFile(stateFile) {
    let b_stateRead         = false;
    let fileData            = null;
    let state               = [];
    try {
        fileData            = fs.readFileSync(stateFile);
        b_stateRead         = true
    } catch(e) {
        CUJS.error          = e;
        output.outputBox_print(CUJS.info_error(), 'warning');
    }
    if(b_stateRead) {
        state               = JSON.parse(fileData);
    }
    return(state);

}

/**
 * The UIstate_saveToFile function saves the current state of the UI to a file.
 *
 *
 * @param state The state of the UI to save.
 * @param stateFile The file to which state is saved.
 * @return A boolean value: true success/false failure.
 *
 * @doc-author Trelent
 */
function    UIstate_saveToFile(state, stateFile) {
    const data          = JSON.stringify(state, null, 4);
    let b_stateSaved    = false;
    try {
        fs.writeFileSync(stateFile, data)
        b_stateSaved       = true;
        output.outputBox_print("UI state saved to " + stateFile);
    } catch (e) {
        CUJS.error          = e;
        output.outputBox_print(CUJS.info_error(), 'error');
    }
    return(b_stateSaved);
}

/**
 * The poll_do function polls the feeds and updates the UI state.
 *
 *
 * @param d_param Used to Pass the parameters to the poll_do function.
 * @param stateFile Used to Store the state of the application.
 * @return The current state of the ui.
 *
 * @doc-author Trelent
 */
function poll_do(d_param, stateFile) {
    let currentState    = UIstate_readFromFile(stateFile);
    currentState        = CUJS.feeds_poll(d_param, currentState);
    UIstate_saveToFile(currentState, stateFile);
    return(currentState);
}

/**
 * The feeds_get function retrieves the feeds from a simulated CUBE.
 *
 *
 * @param d_param A dictionary of {'offset': offset, 'limit': limit}
 * @return An array of feeds.
 *
 * @doc-author Trelent
 */
function feeds_get(d_param) {
    const l_feeds = CUJS.feeds_get(d_param);
    return(l_feeds);
}

/**
 * The table_generate function takes in a list of dictionaries and returns
 * a list with only the dictionary values.
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
 * The table_render function takes a list of feeds and returns an rendered
 * table containing those feeds. Some additional columns are UI-specific
 * and are added here, too.
 *
 *
 * @param l_feeds Used to Generate the table rows.
 * @return The table_generate function, logged to console.
 *
 * @doc-author Trelent
 */
function table_render(l_feeds) {
    // Remove the Jobs[Done,Total,Running] from the
    // feeds list (these are not rendered)
    l_feeds.map((d_i) => {
        delete d_i['JobsDone'];
        delete d_i['JobsTotal'];
        delete d_i['JobsRunning'];
        return(d_i);
    });
    let l_header = ['select', 'id', 'Analysis', 'Created', 'Creator', 'Run Time', 'Size', 'Progress'];
    let l_feedsDisplay = l_feeds.map(function (d_i) {
        let date        = new Date(0);
        date.setSeconds(d_i.Run_Time);
        let timeString  = date.toISOString().substr(11, 8);
        d_i.Run_Time    = timeString;
        d_i.Size       += " MB";
        d_i.Size        = sprintf("%8s", d_i.Size);
        d_i.Progress    = sprintf("%8.2f", d_i.Progress);
        let d_disp  = {};
        d_disp.select = ' [ ]';
        return(Object.assign({}, d_disp, d_i));
    });
    l_feedsDisplay.splice(0, 0, l_feeds[0]);
    l_feedsDisplay[0]  = l_header;
    let l_rows  = table_generate(l_feedsDisplay);
    console.log(table(l_rows));
}

let output  = new outbox.outbox(CLIoptions);
output.outputBox_setup();

// Process CLI flags

if(CLIoptions.man) {
    output.outputBox_print(str_aboutMe);
    process.exit();
}

if(CLIoptions.getfeeds.length) {
    let l_numberOffset  = CLIoptions.getfeeds.split(',');
    let l_feeds         = feeds_get({'limit': l_numberOffset[0], 'offset': l_numberOffset[1]});
    table_render(l_feeds);
}

if(CLIoptions.showState) {
    table_render(UIstate_readFromFile(CLIoptions.UIstateFile));
}

if(CLIoptions.poll.length) {
    let l_numberOffset  = CLIoptions.poll.split(',');
    let state = poll_do({'limit': l_numberOffset[0], 'offset': l_numberOffset[1]}, CLIoptions.UIstateFile);
    // table_render(state);
}