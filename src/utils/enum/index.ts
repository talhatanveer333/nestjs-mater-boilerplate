export enum ResponseMessage {
  SUCCESS = `Success`,
  CREATED_SUCCESSFULLY = `Created successfully`,
  CONTENT_NOT_FOUND = `Content not found`,

  EMAIL_CONFIRMED = `Email Confirmed Successfully`,
  EMAIL_LINK_EXPIRED = `This email link has been expired`,
  INVALID_USERNAME_OR_PASSWORD = `Invalid email or password`,
  USER_ALREADY_EXISTS = `User with the same email already exists`,
  FORGOT_PASSWORD_EMAIL = `Please Check Your Email To Reset Password`,
  EMAIL_NOT_REGISTERED = `Email not registered`,
  SET_PASSWORD_EMAIL = `Please Check Your Email To Set Password`,
  TWOFACTOR_DISABLED = `Please Enable Two Factor Authentication First`,

  INVALID_2FA_CODE = `2FA Code Is Invalid`,
  INVALID_EMAIL = `Invalid email address`,
  INVALID_PASSWORD = `Invalid Password. Use min 8 characters with a mix of letters, numbers & symbols`,
  INVALID_USERNAME = `Invalid user name`,
  INVALID_NAME = `Invalid name`,
  INVALID_COUNTRY = `Invalid country name`,
  INVALID_PHONE_NUMBER = `Invalid phone number`,
  RESET_PASSWORD_LINK_EXPIRED = `This Reset Password Link Has Been Expied`,
  USER_DOES_NOT_EXIST = `User with specified email does not exists`,

  ERROR_WHILE_SENDING_EMAIL = `Error while sending email`
}

// some code enums for sending response code in api response
export enum ResponseCode {
  SUCCESS = 200,
  CREATED_SUCCESSFULLY = 201,
  INTERNAL_ERROR = 500,
  NOT_FOUND = 404,
  CONTENT_NOT_FOUND = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  ALREADY_EXIST = 409,
}

export enum LoggerMessages {
  API_CALLED = `Api Has Been Called.`,
}

export enum NodeEnv {
  TEST = `test`,
  DEVELOPMENT = `development`,
  PRODUCTION = `production`,
}
