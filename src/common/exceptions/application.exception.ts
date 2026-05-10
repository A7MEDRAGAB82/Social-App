

class ApplicationException extends Error {
    constructor(message: string , public statusCode: number = 500, cause: unknown) {
        super(message , { cause });
        this.name = this.constructor.name;
        if (cause) {
            this.cause = cause;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApplicationException;