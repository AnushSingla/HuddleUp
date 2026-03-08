/**
 * Base layout wrapper for all HuddleUp emails.
 * Wrap your inner HTML with this for consistent branding.
 *
 * @param {string} bodyContent  - Inner HTML to inject into the template body
 * @param {string} [preheader]  - Short preview text shown in inbox before email is opened
 * @returns {string} Full HTML email string
 */
const baseLayout = (bodyContent, preheader = '') => {
  const year = new Date().getFullYear();
  const clientUrl = process.env.CLIENT_URL || 'https://huddleup.com'; // safer default

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f1117;
      color: #e2e8f0;
      line-height: 1.6;
      -webkit-text-size-adjust: 100%;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1a1d2e;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(99,102,241,0.15);
      box-shadow: 0 4px 24px 0 rgba(30,33,58,0.18);
    }
    .email-header {
      background: linear-gradient(135deg, #6366f1 0%, #1e213a 100%);
      padding: 36px 32px 24px 32px;
      text-align: center;
      border-bottom: 1px solid rgba(99,102,241,0.2);
    }
    .email-header .logo-mark {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
    }
    .email-header .brand-name {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 1px;
      text-shadow: 0 2px 8px #6366f1cc;
    }
    .hero {
      margin: 0 auto 24px auto;
      text-align: center;
    }
    .hero-img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #6366f1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px auto;
      font-size: 44px;
      color: #fff;
      box-shadow: 0 2px 12px #6366f155;
      line-height: 1;
      text-align: center;
      vertical-align: middle;
    }
    .email-body { padding: 40px 32px 32px 32px; }
    .btn {
      display: inline-block;
      background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
      color: #fff !important;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      margin: 24px 0 0 0;
      box-shadow: 0 2px 8px #6366f133;
      transition: background 0.2s;
    }
    .btn:hover {
      background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
    }
    .divider {
      border: none;
      border-top: 1px solid #334155;
      margin: 32px 0 18px 0;
    }
    .info-box {
      background: #23264a;
      border-radius: 8px;
      padding: 18px 20px 10px 20px;
      margin: 24px 0 18px 0;
      box-shadow: 0 1px 4px #6366f122;
    }
    .info-box ul {
      margin: 10px 0 0 18px;
      color: #a5b4fc;
      font-size: 15px;
      line-height: 1.8;
    }
    .info-box strong {
      color: #c7d2fe;
    }
    .email-footer {
      background-color: #12141f;
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .email-footer p {
      font-size: 12px;
      color: #64748b;
      margin: 3px 0;
    }
    .email-footer a {
      color: #6366f1;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper, .email-body, .email-header, .email-footer {
        padding-left: 8px !important;
        padding-right: 8px !important;
      }
      .email-body {
        padding-top: 24px !important;
        padding-bottom: 18px !important;
      }
      .btn {
        width: 100%;
        font-size: 15px;
        padding: 14px 0;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="font-size:1px; line-height:1px; opacity:0; color:#0f1117; max-height:0; overflow:hidden;">${preheader}</div>` : ''}
  <div style="padding: 24px 16px; background-color: #0f1117;">
    <div class="email-wrapper">
      <!-- HEADER -->
      <div class="email-header">
        <div class="logo-mark">
          <span class="brand-name">HuddleUp</span>
        </div>
      </div>

      <!-- BODY -->
      <div class="email-body">
        ${bodyContent}
      </div>

      <!-- FOOTER -->
      <div class="email-footer">
        <p>© ${year} HuddleUp · All rights reserved</p>
        <p>This is an automated email — please do not reply.</p>
        <p><a href="${clientUrl}">Visit HuddleUp</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = baseLayout;