/**
 * Standard success envelope. Keeps every response shaped the same:
 * { success, message, data }.
 */
export class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  /** Send this response through an Express `res`. */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }

  static ok(res, data, message = "Success") {
    return new ApiResponse(200, data, message).send(res);
  }

  static created(res, data, message = "Created") {
    return new ApiResponse(201, data, message).send(res);
  }
}
