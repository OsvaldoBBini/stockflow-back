import { CustomMessageTriggerEvent } from 'aws-lambda';
import { singUpMessage } from './signupMessage';
import { forgotPasswordMessage } from './forgotPasswordMessage';
import { resendConfirmationCodeMessage } from './resendConfirmationCodeMessage';

export async function handler(event: CustomMessageTriggerEvent) {

  const code = event.request.codeParameter;
  const name = event.request.userAttributes.given_name;
  const email = event.request.userAttributes.email;

  const frontUrl = `http://localhost:5173/new-password/${email}/${code}`;
 
  if (event.triggerSource === 'CustomMessage_SignUp') {
    const { subject, emailMessage } = singUpMessage(name, code);
    event.response.emailSubject = subject;
    event.response.emailMessage = emailMessage;
  }

  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    const { subject, emailMessage } = forgotPasswordMessage(frontUrl);
    event.response.emailSubject = subject;
    event.response.emailMessage = emailMessage;
  }

  if (event.triggerSource === 'CustomMessage_ResendCode') {
    const { subject, emailMessage } = resendConfirmationCodeMessage(name, code);
    event.response.emailSubject = subject;
    event.response.emailMessage = emailMessage;
  }

  return event;
}

