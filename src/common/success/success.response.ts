

export const successResponse = (
    {res , message = "Success" , statusCode = 200  , data}:{
        res: any,
        message?: string,
        statusCode?: number,
        data?: unknown
    }
) => {  
    return res.status(statusCode).json({
        status: "success",
        message,
        data
    })
}