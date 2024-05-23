const { createLogger, transports } = require('winston');
const { AppError } = require('./app-errors');

// Create a logger instance
const LogErrors = createLogger({
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'app_error.log' })
    ]
});

class ErrorLogger {
    constructor(){}

    // Log error to console and file
    async logError(err) {
        console.log('==================== Start Error Logger ===============');
        LogErrors.log({
            private: true,
            level: 'error',
            message: `${new Date()}-${JSON.stringify(err)}`
        });
        console.log('==================== End Error Logger ===============');
        // Return false if needed
        return false;
    }

    // Check if error is trusted (operational)
    isTrustError(error) {
        return error instanceof AppError && error.isOperational;
    }
}

const ErrorHandler = async (err, req, res, next) => {
    const errorLogger = new ErrorLogger();

    // Log uncaught exceptions
    process.on('uncaughtException', (error) => {
        errorLogger.logError(error);
        if (errorLogger.isTrustError(err)) {
            // Process exit if needed
            process.exit(1);
        }
    });

    // Log errors and handle responses
    if (err) {
        await errorLogger.logError(err);
        if (errorLogger.isTrustError(err)) {
            const errorMessage = err.errorStack ? err.errorStack : err.message;
            return res.status(err.statusCode).json({ 'message': errorMessage });
        } else {
            // Terminate process if untrusted error
            process.exit(1);
        }
    }
    // Call next middleware if no error
    next();
}

module.exports = ErrorHandler;
