const log4js = require('log4js');

log4js.configure({
    appenders: {
        console: { 
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '[%d{ISO8601}] [%p] [%c] [%X{className}] - %m'
            }
        },
        fileError: { 
            type: 'file', 
            filename: 'logs/error.log',
            layout: {
                type: 'pattern',
                pattern: '[%d{ISO8601}] [%p] [%c] [%X{className}] - %m'
            }
        },
        fileAll: { 
            type: 'file', 
            filename: 'logs/all.log',
            layout: {
                type: 'pattern',
                pattern: '[%d{ISO8601}] [%p] [%c] [%X{className}] - %m'
            }
        },
        errorFilter: {
            type: 'logLevelFilter',
            appender: 'fileError',
            level: 'error'
        }
    },
    categories: {
        default: { 
            appenders: ['console', 'fileAll', 'errorFilter'], 
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' 
        }
    }
});

class Logger {
    constructor(className) {
        this.logger = log4js.getLogger();
        this.className = className;
    }

    _addContext(message, ...args) {
        this.logger.addContext('className', this.className);
        return args.length ? [message, ...args] : [message];
    }

    info(message, ...args) {
        this.logger.info(...this._addContext(message, ...args));
    }

    error(message, ...args) {
        this.logger.error(...this._addContext(message, ...args));
    }

    debug(message, ...args) {
        this.logger.debug(...this._addContext(message, ...args));
    }

    warn(message, ...args) {
        this.logger.warn(...this._addContext(message, ...args));
    }
}

module.exports = Logger;