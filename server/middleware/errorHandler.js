/**
 * Centralized Global Error Handler
 * Ensures that unexpected errors never crash the Node process 
 * or leak sensitive stack traces to the frontend in production.
 */
const errorHandler = (err, req, res, next) => {
    // 1. Log the error internally (Keep stack traces out of user-facing responses)
    console.error(`❌ [Global Error] ${req.method} ${req.originalUrl}:`, err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // 2. Determine Status Code (Default to 500 if unknown)
    const statusCode = err.statusCode || 500;

    // 3. Construct a safe, predictable response format
    const errorResponse = {
        success: false,
        error: err.message || "Internal Server Error",
    };

    // 4. Optionally include Zod validation details if present
    if (err.details) {
        errorResponse.details = err.details;
    }

    // 5. Send Response
    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
