class ApiResponse {
    constructor(
            statusCode  , 
            message = "Success" , 
            data
    ){
        this.statusCode = statusCode 
        this.success = statusCode < 300
        this.message = message, 
        this.data = data
    }
}

export {ApiResponse}