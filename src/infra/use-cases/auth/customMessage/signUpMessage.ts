export const singUpMessage = (name: string, code: string) => ({
  subject: `Welcome ${name}!`,
  emailMessage:
    `
      <h1> 
        Your Signup Verification Code<br/><br/>
        ${code}<br/><br/>
        Don't share this code to anyone!
        If you did not initiate the request, you can safely ignore this email.
        This is an automated message. Please do not reply.
      </h1>
    `
});