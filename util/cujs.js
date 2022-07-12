
const   outbox          = require('../util/outbox.js');
const   uCUBE           = require("../uCUBE/uCUBE.js");
const   uCUBEoptions    = uCUBE.CUBEoptions;
const   chris_client    = require("../lib/chris_client.js")
var       _             = require('lodash');
var     PRINTJ          = require('printj');
var     sprintf         = PRINTJ.sprintf, vsprintf = PRINTJ.vsprintf;

module.exports = {
    cujs:  function(options) {
        this.str_help   = `

        A simulation of a hypothetical 'cujs' module that
        provides higher level convenience functions for
        interacting with a CUBE backend.

        `;


        this.options        = options;
        this.error          = null;
        this.CUBE           = new uCUBE.uCUBE(uCUBEoptions);
        this.CUBE.initialize();
        this.client         = new chris_client.chris_client(options);
        this.outbox         = new outbox.outbox(options);
        this.outbox.outputBox_setup();
    }
}

module.exports.cujs.prototype  = {
    constructor:    module.exports.cujs,

    feeds_get:              function(d_param) {
        const l_feeds = this.client.getFeeds(d_param);
        const l_feedsFull = l_feeds.map(function (d_i) {
            d_i['Progress'] = '-';
            return(d_i);
        });
        return(l_feedsFull);
    },

    id_exists:                  function(aid, ld_feeds) {
        const idCheck   = (id) => id == aid;
        l_index = ld_feeds.map(function (d_i) {
            return(d_i['id']);
        });
        return(l_index.findIndex(idCheck));
    },

    feed_getFieldValue:         function(aid, ld_feeds, str_field = 'Size') {
        let str_about   = `
            For a given list of feed dictionaries, return the field value specified.
        `;
        let b_getOK     = false;
        let d_ret       = {
            'status'    : b_getOK,
            'id'        : aid,
            'index'     : -1,
            'key'       : str_field,
            'value'     : ""
        }
        let index       = -1;
        if(str_field in ld_feeds[0]) {
            index           = this.id_exists(aid);
            if(index == -1) return d_ret;
            d_ret.status    = true;
            d_ret.index     = index;
            d_ret.key       = str_field;
            d_ret.value     = this.l_feeds[index][str_field];
            return(d_ret);
        }
    },

    progress_update:        function(d_jobInfo, str_prefix = "") {
        console.log(str_prefix + 'Updating job progress...');
        const { JobsDone, JobsRunning, JobsTotal } = d_jobInfo;
        let progress = (JobsDone +  JobsRunning) / JobsTotal*100;
        // A slight fob for the case when progress is just less
        // than 100%
        if((JobsDone +  JobsRunning == JobsTotal) && JobsRunning)
            progress = 98;
        return(progress.toFixed(2));
    },

    feeds_poll:             function(d_param, ld_currentState) {
        let str_about = `
            This method collects and preserves UI table state and will
            return the "next state" of the UI table.
        `;
        let     ld_nextState    = this.feeds_get(d_param);
        let     deepCount       = 0;

        // Some helper/nested functions
        const   deepProbe       = (id, state) => {
            ['Run_Time', 'Size'].forEach(field => {
                let str_prefix = sprintf("ID: %03d -- ", state.id);
                state[field]    = this.client.getDeepProbeOnID(id, field);
                ++deepCount;
                let str_probe   = sprintf(" (deepProbe %02d) Getting [%10s] from CUBE |", deepCount, field);
                let str_resp    = sprintf(" <---(RESP%5s)", state[field]);
                console.log(str_prefix + str_probe + str_resp);
            });
        }
        const   shallowProbe    = (d_nextJobs, d_nextState, d_currentState) => {
            let str_prefix = sprintf("ID: %03d -- ", d_nextState.id);
            console.log(str_prefix + " (shallowProbe) Getting [Run_Time] and [Size] from current state")
            d_nextState.Run_Time = d_currentState.Run_Time;
            d_nextState.Size     = d_currentState.Size;
            if(d_nextState.Progress == '-')
                d_nextState.Progress    = d_currentState.Progress;
        }
        const jobCountGet = (d_feed) => {
            return( {
                'JobsDone':     d_feed.JobsDone,
                'JobsRunning':  d_feed.JobsRunning,
                'JobsTotal':    d_feed.JobsTotal
            });
        }

        if(typeof ld_currentState !== 'undefined') {
            if(ld_currentState.length) {
                // For each feed in nextState, check if a corresponding
                // feed id exists in currentState. If it does, check if
                // any of the jobCounters are different. If any are different
                // or if JobsRunning is non-zero, calculate the progress.
                // If jobsDone is different then deep probe CUBE for next
                // Run_Time and Size, otherwise use the current state Run_Time
                // and Size.
                for(const d_nextState of ld_nextState) {
                    let str_prefix = sprintf("ID: %03d -- \t\t", d_nextState.id);
                    let idx = this.id_exists(d_nextState.id, ld_currentState);
                    if(idx != -1) {
                        // Get the job counter values for next and current
                        let d_currentState  = ld_currentState[idx];
                        let d_currentJobs   = jobCountGet(d_currentState);
                        let d_nextJobs      = jobCountGet(d_nextState);
                        if(! _.isEqual(d_currentJobs, d_nextJobs) || d_nextJobs.JobsRunning ) {
                            d_nextState.Progress = this.progress_update(d_nextJobs, str_prefix);
                        }
                        if(d_currentJobs.JobsCurrent != d_nextJobs.JobsCurrent) {
                            deepProbe(d_nextState.id, d_nextState);
                        } else {
                            shallowProbe(d_nextJobs, d_nextState, d_currentState);
                        }
                    } else {
                        deepProbe(d_nextState.id, d_nextState);
                        d_nextState.Progress = this.progress_update(jobCountGet(d_nextState), str_prefix);
                    }
                };
            } else {
                ld_nextState.forEach(d_nextState => {
                    deepProbe(d_nextState.id, d_nextState);
                    d_nextState.Progress = this.progress_update(d_nextState);
                });
            }
        }
        return(ld_nextState);
    },

    info_error:             function(heading = 'ERROR!') {
        str_info        = `
${heading}

${this.error}
        `;
        return(str_info);
    },


}