import { HttpException, HttpStatus } from "@nestjs/common";

export function ValidBase64(data) {
  const decode = Buffer.from(data, "base64").toString("ascii");
  const encode = Buffer.from(decode).toString("base64");
  return { valid: data === encode, value: data === encode ? decode : null };
}

export function validateObject(value, returnValue) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return returnValue ? value : {};
  }
}

export function parseStrObject(item, returnValue = false) {
  try {
    if (typeof item === "object") {
      return item;
    } else {
      const base64 = ValidBase64(item);
      if (base64.valid) {
        item = base64.value;
      }
      return validateObject(item, returnValue);
    }
  } catch (e) {
    return returnValue ? item : {};
  }
}

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const handleQueryError = (err: any) => {
  if (err.name === "ValidationError") {
    const errorMessage = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: Object.keys(err.errors).map((field) => `${field} ${err.errors[field].message}`),
      error: "Bad Request"
    };
    throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
  } else {
    throw new HttpException(
      {
        statusCode: 500,
        message: err.message,
        error: "Internal Server Error"
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};
