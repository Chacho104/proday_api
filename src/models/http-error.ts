// HttpError class to use to handle errors across the application
export class HttpError extends Error {
  code: number; // Add "code" property to class
  constructor(message: string, errorCode: number) {
    super(message); // Add "message" prop to instances of this class
    this.code = errorCode;
  }
}
