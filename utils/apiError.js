class ApiError extends Error {
    constructor(
        statusCode, 
        message = "Something went wrong.", 
        error = [], 
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = '';
        }
    }
}

module.exports = ApiError;
