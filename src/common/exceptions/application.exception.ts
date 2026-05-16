interface AError {
    statusCode: number;
    message: string;
    cause?: unknown;
    stack?: string;
}

export default class ApplicationException extends Error implements AError {
    constructor(message: string , public statusCode: number = 500, cause: unknown) {
        super(message , { cause });
        this.name = this.constructor.name;
        if (cause) {
            this.cause = cause;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 400, {cause});
    }
}

export class conflictException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 409, {cause});
    }
}

export class NotFoundException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 404, {cause});
    }
}