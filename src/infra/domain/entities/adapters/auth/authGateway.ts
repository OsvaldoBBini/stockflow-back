import { 
  SignInInterface, 
  AccessPayloadInterface, 
  SignUpInterface, 
  ChangePasswordInterface, 
  ConfirmAccountInterface 
} from './auth';


export interface AuthGatewayInterface {
  signUp(signUpData: SignUpInterface): Promise<{ userId: string | undefined }>;
  signIn(signInData: SignInInterface): Promise<AccessPayloadInterface>;
  refreshToken(refreshToken: string): Promise<AccessPayloadInterface>;
  changePassword(changePasswordData: ChangePasswordInterface): Promise<void>;
  changePasswordConfirmationCode(email: string): Promise<void>;
  confirmAccount(confirmAccountData: ConfirmAccountInterface): Promise<void>;
}