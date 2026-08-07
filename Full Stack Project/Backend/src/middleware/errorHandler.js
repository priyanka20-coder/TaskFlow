//The ONE place all error end up. Express knows this is an error handler
//because it has FOUR arguments: (err, req, res, next).
const errorHandler = (err, req, res, next) => {
    //if status code is not set, default set to 500 (bad server)
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // --- friendlier messages for common Mongoose errors ----

    //bad ObjectId, e.g. GET/api/tasks/not-a-real-id (Agar koi objectId error ho to)
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 404;
        message = "Resource not found";
    }

    //schema validation failed - required field missing, wrong enum, etc. (kissi bhi schema mae validation error ho)
    if (err.name === "ValidationError"){
        statusCode = 400;
        message = Object.values(err.errors)
        .map((e)=>e.message)
        .join(", ");
    }

    // duplicates value on unique field, e.g. email already used
    if(err.code === 11000){
        statusCode = 400;
        message = `Duplicate value for: ${Object.keys(err.keyValue).join(",")}`;
    }

    res.status(statusCode).json({
        message,
        //hide the stack trace in production, show it while developing
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};

export default errorHandler;