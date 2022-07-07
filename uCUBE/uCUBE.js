// str_aboutME     = `
//     Module and class that mimics a CUBE instance in as much
//     as returning Feed Analysis table objects.
// `

const   yargs       = require("yargs");
const   faker       = require('faker');
const   fs          = require('fs');

const   colorize    = require("json-colorizer");

const   outputbox   = require('../util/outbox.js');
const { throws }    = require('assert');

module.exports      = {

    CUBEoptions:  yargs
    .usage("Usage: [--verbose] [--man] [--generateFeedTable <noOfFeeds>] [--stateFile <stateFile>]")
    .option(
        "v", {
            alias:          "verbose",
            describe:       "If specified, be chatty",
            type:           "boolean",
            default:        false
        })
    .option(
        "F", {
            alias:          "generateNewFeedTable",
            describe:       "Create a new deep state of <noOfFeed> entries.",
            type:           "int",
            default:        0
        })
    .option(
        "S", {
            alias:          "stateFile",
            describe:       "Name of the stateFile generated by uCUBE.",
            type:           "string",
            default:        "CUBE-coreState.json"
        })
    .option(
        "m", {
            alias:          "man",
            describe:       "If specified, show a man page",
            type:           "boolean",
            default:        false
        })
    .option(
        "d", {
            alias:          "getDeepState",
            describe:       "If specified, show the full (deep) state of CUBE",
            type:           "boolean",
            default:        false
        })
    .option(
        "f", {
            alias:          "getFieldForID",
            describe:       "Return the <value> for <field> in feed <id>",
            type:           "string",
            default:        ""
        })
    .option(
        "a", {
            alias:          "addFeed",
            describe:       "Add a new Feed to the CUBE core state",
            type:           "boolean",
            default:        false
        })
    .option(
        "i", {
            alias:          "increaseCompletedJobs",
            describe:       "Increase the completed jobs count in Feed <id>",
            type:           "string",
            default:        ""
        })
    .argv,

    uCUBE:      function(options) {
        this.str_help       = `

        "micro"CUBE simulator. On startup generates a table of
        feeds with <totalAnalyses> rows.

        `;
        this.options        = options;
        this.jid            = 0;
        this.l_feeds        = [];
        this.error          = null;
        this.newFeedTable   = options.generateNewFeedTable;

        this.stateFile      = options.stateFile;
        this.b_stateOK      = false;
        this.b_stateSaved   = false;
        this.b_stateRead    = false;

        this.error          = null;

        this.outbox         = new outputbox.outbox(options);
        this.outbox.outputBox_setup();
    }
}

module.exports.uCUBE.prototype  = {
    constructor:    module.exports.uCUBE,

    created:        function() {
        return(faker.date.recent());
    },

    creator:        function() {
        return(faker.name.findName());
    },

    analysis:       function() {
        return(faker.animal.bird());
    },

    id:             function() {
        this.jid += 1;
        return(this.jid);
    },

    randint:        function(min, max) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    row_generate:   function() {
        totalJobs   = this.randint(1, 10);
        doneJobs    = this.randint(1, totalJobs);
        runTime     = this.randint(1, 500);
        jobSize     = this.randint(1, 500);
        return ( {
            'id':           this.id(),
            'Analysis':     this.analysis(),
            'Created':      this.created().toUTCString(),
            'Creator':      this.creator(),
            'Run_Time':     runTime,
            'Size':         jobSize,
            'JobsDone':     doneJobs,
            'JobsTotal':    totalJobs
        })
    },

    initialize:         function() {
        str_about = `
            Initialize the CUBE "instance" by either reading from an existing
            state file, or creating a new state table. If a state file does not
            exist, and if a newFeedTable size has not been specified, default to
            50.
        `;
        let b_init  = false;
        if(fs.existsSync(this.stateFile)) {
            b_init = this.feeds_stateRead();
        }
        else {
            if(!this.newFeedTable)
                this.newFeedTable   = 50;
            b_init = this.feeds_newCreate();
        }
        return(b_init);
    },

    feed_addNew:        function() {
        let d_ret   = {
            'insertFeed':   false,
            'stateSave':    false
        }
        try {
            this.l_feeds.splice(0, 0, this.row_generate());
            d_ret.insertFeed    = true;
        } catch(e) {
            this.error  = e;
            this.outputBox_print(this.info_error(), 'error');
            return d_ret;
        }
        d_ret.stateSave = this.feeds_stateSave();
        return(d_ret);
    },

    feeds_newCreate:    function() {
        let row = 0;
        for(row=0; row<this.newFeedTable; row++) {
            this.l_feeds.splice(0, 0, this.row_generate());
        }
        if(row) {
            this.b_stateOK      = true;
            this.feeds_stateSave();
        }
        else {
            this.b_stateOK      = false;
        }
        return this.b_stateOK;
    },

    feeds_stateSave:        function() {
        const data = JSON.stringify(this.l_feeds, null, 4);
        this.b_stateSaved   = false;
        try {
            fs.writeFileSync(this.stateFile, data)
            this.b_stateSaved       = true;
            this.outbox.outputBox_print("CUBE state saved to " + this.stateFile + "\n" +
                                 this.jid + " Feeds saved.");
        } catch (e) {
            this.error      = e;
            this.outbox.outputBox_print(this.info_error(), 'error');
        }
        return(this.b_stateSaved);
    },

    feeds_stateRead:            function() {
        this.b_stateRead        = false;
        let fileData            = null;
        try {
            fileData            = fs.readFileSync(this.stateFile);
            this.b_stateRead    = true
        } catch(e) {
            this.error          = e;
            this.outbox.outputBox_print(this.info_error(), 'warning');
        }
        if(this.b_stateRead) {
            this.l_feeds        = JSON.parse(fileData);
            this.jid            = this.l_feeds[0]['id'];
        }
        return(this.b_stateRead);
    },

    feeds_shallowReturn:        function() {
        let str_about = `
            Return the feed list but with 'Run Time' and 'Size' set
            as '-'.
        `;
        return this.l_feeds.map(function (d_i) {
            d_i.Run_Time    = '-';
            d_i.Size        = '-';
            return(d_i);
        });
    },

    feed_getFieldValue(aid, str_field = 'Size') {
        let str_about   = `
            For a give feed ID, return the field value specified.
        `;
        let b_getOK     = false;
        let d_ret       = {
            'status'    : b_getOK,
            'id'        : aid,
            'index'     : -1,
            'key'       : str_field,
            'value'     : ""
        }
        const idCheck   = (id) => id == aid;
        let l_index     = [];
        let index       = -1;
        if(str_field in this.l_feeds[0]) {
            l_index = this.l_feeds.map(function (d_i) {
                return(d_i['id']);
            });
            index = l_index.findIndex(idCheck);
            if(index == -1) return d_ret;
            d_ret.status    = true;
            d_ret.index     = index;
            d_ret.key       = str_field;
            d_ret.value     = this.l_feeds[index][str_field];
            return(d_ret);
        }
    },

    CLIoutput_show:          function(str_data, comms = 'normal') {
        this.outbox.outputBox_print(str_data, comms);
    },

    info_error:             function() {
        str_info        = `
ERROR!

${this.error}
        `;
        return(str_info);
    },

    info_normal:            function() {
        const str_INcolor   = colorize(this.IN.str_data);
        const str_OUTcolor  = colorize(this.OUT.str_data);
        str_info        = `
Conversion summary

InputFile:      ${this.options.inputFile}
InputSteam:     ${this.options.stdin}
OutputFile:     ${this.options.outputFile}
OutputStream:   ${this.options.stdout}

InputJSON:
${str_INcolor}
`;
        return(str_info);
    },

}
