import { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand, InitiateAuthCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { AuthGatewayInterface } from '../../domain/entities/adapters/auth/authGateway';
import { AccessPayloadInterface, ChangePasswordInterface, ConfirmAccountInterface, SignInInterface, SignUpInterface } from '../../domain/entities/adapters/auth/auth';

class CognitoGateway implements AuthGatewayInterface {
  
  private cognitoClient: CognitoIdentityProviderClient;
  private poolId: string | undefined;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient();
    this.poolId = process.env.COGNITO_CLIENT_ID;
  }
  changePasswordConfirmationCode(email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  confirmAccount(confirmAccountData: ConfirmAccountInterface): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async signUp(signUpData: SignUpInterface): Promise<{ userId: string | undefined }> {

    const { email, password, fullName } = signUpData;

    const command = new SignUpCommand({
      ClientId: this.poolId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'given_name',
          Value: fullName
        }]
    });
    
    const { UserSub } = await this.cognitoClient.send(command);
    return { userId: UserSub };
  }

  async signIn(signInData: SignInInterface): Promise<AccessPayloadInterface> {
    const { email, password } = signInData;

    const command = new InitiateAuthCommand({
      ClientId: this.poolId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      }
    });
    
    const { AuthenticationResult } = await this.cognitoClient.send(command);
    
    if (!AuthenticationResult) {
      throw new Error('Invalid Credentials.');
    }
    
    return {
      accessToken: AuthenticationResult.AccessToken || '',
      refreshToken: AuthenticationResult.RefreshToken || ''
    };
  }

  async refreshToken(refreshToken: string): Promise<AccessPayloadInterface> {
    const command = new InitiateAuthCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    });
    
    const { AuthenticationResult } = await this.cognitoClient.send(command);
    
    if (!AuthenticationResult) {
      throw new Error('Invalid refresh token.');
    }

    return {
      accessToken: AuthenticationResult.AccessToken || '',
      refreshToken: AuthenticationResult.RefreshToken || ''
    };
  }

  async changePassword(changePasswordData: ChangePasswordInterface): Promise<void> {
    const { email, confirmationCode, newPassword } = changePasswordData;
    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword
    });
    await this.cognitoClient.send(command);
  }

}


export const cognitoGateway = new CognitoGateway();