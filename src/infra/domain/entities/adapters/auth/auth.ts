export interface SignUpInterface {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInInterface {
  email: string;
  password: string;
}

export interface AccessPayloadInterface {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordInterface {
  email: string;
  confirmationCode: string;
  newPassword: string;
}

export interface ConfirmAccountInterface {
  email: string;
  confirmationCode: string;
}