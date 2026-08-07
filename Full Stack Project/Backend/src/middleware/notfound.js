//Runs when NO routes matched the request.
//It creates a 404 error and forwards it to the central error handler.
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); //pass to errorHandler
};

export default notFound;