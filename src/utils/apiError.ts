class ApiError extends Error {
    statusCode: number;
    error: any[];
    stack!: string;
    success: boolean

    constructor(
        statusCode: number,
        message: string = "Something went wrong.",
        error: any[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.success = false

        if (stack) {
            this.stack = stack;
        } else if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = '';
        }
    }
}

export default ApiError;
