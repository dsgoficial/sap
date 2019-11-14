
const AppError = (name, httpCode, description, data) => {
    Error.call(this);
    Error.captureStackTrace(this);
    this.name = name;
    this.httpCode = httpCode;
    this.description = description;
    this.data = data;
};

AppError.prototype.__proto__ = Error.prototype;

module.exports = AppError;
