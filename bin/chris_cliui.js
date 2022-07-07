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

`;

const   yargs       = require("yargs");
const   interface   = require("../util/cujs.js");
const { table }     = require('table');
const   outbox      = require('../util/outbox.js');

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
          alias:            "getfeeds",
          describe:         "Number of feeds to get as comma separated list of number,offset",
          type:             "string",
          default:          ""
      })
      .option(
        "m", {
            alias:          "man",
            describe:       "If specified, show a man page",
            type:           "boolean",
            default:        false
        })
    .argv;

let CUJS             = new interface.cujs(CLIoptions);

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
 * The table_generate function takes in a list of dictionaries and returns an list
 * with only the dictionary values.
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
 * The table_render function takes a list of feeds and returns an rendered table
 * containing those feeds. Some additional columns are UI-specific and are added
 * here, too.
 *
 *
 * @param l_feeds Used to Generate the table rows.
 * @return The table_generate function.
 *
 * @doc-author Trelent
 */
function table_render(l_feeds) {
    let l_header = ['select', 'id', 'Analysis', 'Created', 'Creator', 'Run Time', 'Size', 'JobsDone', 'TotalJobs', 'Progress'];
    let l_feedsDisplay = l_feeds.map(function (d_i) {
        let d_disp = {};
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

if(CLIoptions.man)
    output.outputBox_print(str_aboutMe);

if(CLIoptions.getfeeds.length) {
    let l_numberOffset  = CLIoptions.getfeeds.split(',');
    let l_feeds         = feeds_get({'limit': l_numberOffset[0], 'offset': l_numberOffset[1]});
    table_render(l_feeds);
}

