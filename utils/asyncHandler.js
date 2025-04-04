const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // Handling async errors gracefully
    Promise.resolve(requestHandler(req, res, next))
      .catch(next); // forward the error to the next middleware (error handler)
  };
};

module.exports = { asyncHandler };
