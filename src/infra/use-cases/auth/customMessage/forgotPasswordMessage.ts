export const forgotPasswordMessage = (email: string, code: string) => {
  const url = process.env.URL;
  return {
    subject: 'Recuperação de Conta',
    emailMessage:
      `<h1>Para recuperar a sua conta acesse:</h1><strong>${url}/reset/?email=${encodeURIComponent(email)}&code=${code}</strong>`
  };
};