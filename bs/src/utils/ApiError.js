class ApiError extends Error{
    constructor(
        statusCode, 
        message = "Something went wrong", 
        errors = []
    ){
        this.statusCode = statusCode,
        this.message = message,
        this.errors = errors, 
        this.dadta = null,
        this.success = false

    }
}

export {ApiError}