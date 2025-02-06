const asyncHandler = (requestHandler: (req: any, res: any, next: any) => Promise<any>) => {
    return (req: any, res: any, next: any) => {
      // Handling async errors gracefully
      Promise.resolve(requestHandler(req, res, next))
        .catch(next); // forward the error to the next middleware (error handler)
    };
  };
  
  export { asyncHandler };
  