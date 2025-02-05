// file for handling general erros (eg. document upload failed)

const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Logs the full error stack in the console
  
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  };
  
  module.exports = { errorHandler };