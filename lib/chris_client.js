
const   uCUBE           = require("../uCUBE/uCUBE.js");
const   uCUBEoptions    = uCUBE.CUBEoptions;
const   outbox          = require("../util/outbox.js");

module.exports = {
    chris_client:           function(options) {
        this.str_help   = `

        A simulation of the chris_client js library.

        `;


        this.options        = options;

        this.outbox         = new outbox.outbox(options);
        this.outbox.outputBox_setup();
        this.error          = null;
        this.CUBE           = new uCUBE.uCUBE(uCUBEoptions);
        this.CUBE.initialize();
    }
}

module.exports.chris_client.prototype  = {
    constructor:    module.exports.chris_client,

    getDeepProbeOnID:       function(id, str_field) {
        return(this.CUBE.feed_getFieldValue(id, str_field).value);
    },

    getFeeds:               function(params) {
        let b_feedsOK   = false
        try {
            feedLength  = this.CUBE.l_feeds.length;
            b_feedsOK   = true;
        } catch(e) {
            this.outbox.outbox_print("CUBE has no feeds!", comms = 'error')
        }
        if(b_feedsOK) {
            let offset  = parseInt(params.offset);
            let limit   = parseInt(params.limit);
            if(offset < feedLength) {
                if(offset + limit < feedLength) {
                    return(this.CUBE.feeds_shallowReturn().slice(offset, offset+limit));
                } else {
                    return(this.CUBE.feeds_shallowReturn().slice(offset));
                }
            }
        }
    },

    info_error:             function() {
        str_info        = `
ERROR!

${this.error}
        `;
        return(str_info);
    },


}