
const   outbox          = require('../util/outbox.js');
const   uCUBE           = require("../uCUBE/uCUBE.js");
const   uCUBEoptions    = uCUBE.CUBEoptions;
const   chris_client    = require("../lib/chris_client.js")

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
        return(l_feeds);
    },

    info_error:             function(header = 'ERROR!') {
        str_info        = `
${header}

${this.error}
        `;
        return(str_info);
    },


}