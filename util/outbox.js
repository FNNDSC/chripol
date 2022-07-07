const   chalk       = require("chalk");
const   boxen       = require("boxen");

module.exports = {
    outbox:  function(options) {
        this.str_help   = `

        A simple output "box" handler.

        `;

        this.options        = options;
        this.boxOptions     = null;
        this.error          = null;
    }
}

module.exports.outbox.prototype  = {
    constructor:    module.exports.outbox,

    outputBox_setup:        function() {
        this.boxenOptions  = {
            padding:            1,
            margin:             0,
            borderStyle:        "round",
            borderColor:        "green",
            backgroundColor:    "#222222"
        };
    },

    outputBox_print:        function(str_info, comms = "normal") {
        let str_boxText     = ""
        switch(comms) {
            case 'normal':
                str_boxText   = chalk.white.bold(str_info);
                break;
            case 'error':
                str_boxText   = chalk.red.bold(str_info);
                break;
            case 'warning':
                str_boxText   = chalk.yellow.bold(str_info);
                break;
            default:
                str_boxText   = chalk.white.bold(str_info);
                break;
            }
        const msgBox        = boxen(str_boxText, this.boxenOptions);
        console.log("\n");
        console.log(msgBox);
    }

}