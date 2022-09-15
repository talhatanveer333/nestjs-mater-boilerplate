
export const MailerMock = {
    sendEmailConfirmation: jest.fn(() => {
        return;
    }),
    sendForgotPasswordMail: jest.fn(() => {
        return;
    }),
    sendEmailProfileVerificationCode: jest.fn(() => {
        return;
    }),
}
export const LoggerMock = {
    log: jest.fn((value: string) => {
        return;
    }),
    error: jest.fn((value: string) => {
        return;
    }),
    setContext: jest.fn((value: string) => {
        return;
    }),
    debug: jest.fn(() => {
        return;
    })
}
