interface ResetTemplateOptions {
  otp: string;
  title?: string;
}

export const twoFactorAuthenticationTemplate = ({ otp, title = "Two Factor Authentication" }:ResetTemplateOptions )=> {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Rest Code</title>
  <style>
    body {
      padding: 0;
      margin: 0;
      background-color: #5a1ea1; /* خلفية بنفسجية */
      font-family: Arial, sans-serif;
      color: #e0d7f5;
      font-weight: bold;
    }
    .box {
      max-width: 600px;
      width: 90%;
      background-color: #3b0e70; /* بنفسجي داكن */
      padding: 30px 40px;
      border-radius: 15px;
      box-sizing: border-box;
      box-shadow: 0 0 15px rgba(90, 30, 161, 0.7);
      color: #e0d7f5;
      margin: 40px auto;
    }
    table.header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    table.header-table td {
      vertical-align: middle;
    }
    .header-Social Media {
      font-size: 48px;           /* تكبير الخط */
      font-weight: 900;
      color: #d8b4fe;
      letter-spacing: 4px;       /* زيادة التباعد بين الحروف */
      user-select: none;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6); /* ظل للنص */
      padding-left: 10px;
    }
    .visit-link {
      font-weight: bold;
      font-size: 18px;
      color: #d8b4fe;
      user-select: none;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-align: right;
      padding-right: 10px;
    }
    .visit-link a {
      color: inherit;
      text-decoration: none;
    }
    h1, h3, p, a, span, div.otp-code {
      font-weight: bold;
    }
    h1 {
      font-size: 36px;
      margin: 15px 0;
      color: #d8b4fe;
      text-align: center;
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
    }
    h3 {
      margin-top: 30px;
      text-align: center;
      color: #bb86fc;
    }
    .otp-code {
      display: inline-block;
      background-color: transparent;
      border: 2px solid #d8b4fe;
      color: #d8b4fe;
      border-radius: 50px;
      padding: 14px 36px;
      font-size: 22px;
      text-align: center;
      user-select: text;
      margin: 20px auto;
      display: block;
      width: fit-content;
      letter-spacing: 3px;
      font-family: 'Courier New', Courier, monospace;
      cursor: text;
    }
    .social-links {
      margin-top: 25px;
      text-align: center;
    }
    .social-links a {
      display: inline-block;
      margin: 0 15px;
      text-decoration: none;
    }
    .social-links img {
      width: 50px;
      height: 50px;
      filter: brightness(0) invert(1);
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="box">

    <table class="header-table">
      <tr>
        <td class="header-Social Media">Social Media</td>
        <td class="visit-link">
          <a href="http://localhost:4200/#/" target="_blank">Visit Us</a>
        </td>
      </tr>
    </table>

    <h1>
      <img
        src="https://cdn-icons-png.flaticon.com/512/9152/9152783.png"
        alt="Email Icon"
        width="150"
        height="130"
        style="display:block; margin: 0 auto 15px auto;"
      />
      ${title}
    </h1>

    <div class="otp-code" tabindex="0" aria-label="One Time Password Code">${otp}</div>

    <h3>Stay in touch</h3>

    <div class="social-links">
      <a href="${process.env.facebookLink}" target="_blank" aria-label="Facebook">
        <img
          src="https://img.icons8.com/?size=100&id=106163&format=png&color=FFFFFF"
          alt="Facebook"
        />
      </a>
      <a href="${process.env.instegram}" target="_blank" aria-label="Instagram">
        <img
          src="https://img.icons8.com/?size=100&id=RhYNENh5cxlS&format=png&color=FFFFFF"
          alt="Instagram"
        />
      </a>
      <a href="${process.env.twitterLink}" target="_blank" aria-label="Twitter">
        <img
          src="https://img.icons8.com/?size=100&id=A4DsujzAX4rw&format=png&color=FFFFFF"
          alt="Twitter"
        />
      </a>
    </div>
  </div>
</body>
</html>`;
};
