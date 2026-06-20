export const resendConfirmationCodeMessage = (name: string, code: string) => ({
  subject: 'Formsbuilder - Confirmation Code',
  emailMessage:
    `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="format-detection" content="telephone=no, date=no, address=no, email=no"><meta name="x-apple-disable-message-reformatting"><meta name="keywords" content="DAG9MsUHCHo, BAFrAJAf7yw"><!--[if mso]><div>
                <noscript>
                  <xml>
                    <o:OfficeDocumentSettings>
                      <o:AllowPNG/>
                      <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                  </xml>
                </noscript></div><![endif]--><!--[if !mso]><!--><style>@media (max-width: 100px) {
        .layout-0 {
          display: none !important;
        }
      }
@media (max-width: 100px) and (min-width: 0px) {
        .layout-0-under-100 {
          display: table !important;
        }
      }</style><!--<![endif]--></head><body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f0f1f5;margin:0;padding:0"><table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color:#f0f1f5"><tbody><tr><td style="background-color:#f0f1f5"><!--[if mso]><center>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                      <tbody>
                        <tr>
                          <td><![endif]--><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;min-height:600px;margin:0 auto;background-color:#ffffff"><tbody><tr><td style="vertical-align:top"></td></tr><tr><td style="vertical-align:top;padding:10px
           0px
           10px
           0px"><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr><td style="padding:10px 0 10px 0;vertical-align:top"><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color:#000;font-style:normal;font-weight:normal;font-size:16px;line-height:1.4;letter-spacing:0;text-align:left;direction:ltr;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;white-space:normal;word-wrap:break-word;word-break:break-word"><tbody><tr><td dir="ltr" style="font-size:18.6667px;font-weight:700;white-space:pre-wrap;text-align:center;padding:0px 20px">Hi ${name}!<br></td></tr><tr><td style="font-size:0;height:16px" height="16">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:center;padding:0px 20px">Your New Verification Code<br></td></tr><tr><td style="font-size:0;height:16px" height="16">&nbsp;</td></tr><tr><td style="padding:0px 20px"><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px"><tbody><tr><td height="1px" style="height:1px;border-radius:999px;line-height:1px;font-size:0;background-color:#bfc3c8">&nbsp;</td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="font-size:0;height:16px" height="16">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:center;padding:0px 20px"><a href="tel:123456" target="_blank" rel="noopener noreferrer" style="color:#000000;text-decoration:none">${code}</a><br></td></tr><tr><td style="font-size:0;height:16px" height="16">&nbsp;</td></tr><tr><td style="padding:0px 20px"><table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px"><tbody><tr><td height="1px" style="height:1px;border-radius:999px;line-height:1px;font-size:0;background-color:#bfc3c8">&nbsp;</td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="font-size:0;height:16px" height="16">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:center;padding:0px 20px">This code will expire in 24 hours.<br></td></tr><tr><td style="font-size:0;height:16px" height="16">&nbsp;</td></tr><tr><td dir="ltr" style="font-size:16px;white-space:pre-wrap;text-align:center;padding:0px 20px">If you didn't request this, please ignore this email.<br></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--[if mso]></td></tr></tbody></table></center><![endif]--></td></tr></tbody></table></body></html>
    `
});
