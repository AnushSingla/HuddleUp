const baseLayout = require('./baseLayout');

/**
 * Welcome email sent immediately after a user registers.
 *
 * @param {string} username - The new user's username
 * @returns {string} Full HTML email string
 */
const welcomeTemplate = (username) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';


  const body = `
    <div class="hero" style="text-align:center;">
  <div class="hero-img" 
       style="width:80px; height:80px; border-radius:50%; background:#6366f1; 
              display:flex; align-items:center; justify-content:center; 
              margin:0 auto 14px auto; font-size:40px; color:#fff; 
              box-shadow:0 2px 12px #6366f155;">
    🏆
  </div>
  <h1 style="font-size:2rem; font-weight:800; color:#fff; margin-bottom:8px;">
    Welcome, ${username}!
  </h1>
  <p style="font-size:1.1rem; color:#a5b4fc; margin-bottom:0;">
    Your HuddleUp journey starts now.
  </p>
</div>

    <p style="margin: 18px 0 0 0; color:#e2e8f0; font-size:16px;">We're thrilled to have you join our sports community. Dive in to share your passion, connect with fans, and create unforgettable moments.</p>

    <div class="info-box">
      <p style="margin:0; font-size:15px; color:#c7d2fe;"><strong>What you can do right now:</strong></p>
      <ul>
        <li>Upload your first video or post</li>
        <li>Explore trending sports content</li>
        <li>Add friends and grow your network</li>
        <li>Create and manage playlists</li>
      </ul>
    </div>

    <div style="text-align:center;">
      <a class="btn" href="${clientUrl}">Start Exploring →</a>
    </div>

    <hr class="divider" />

    <p style="font-size:13px; color:#64748b; margin-top:18px;">
      If you didn't create this account, you can safely ignore this email.
    </p>
  `;

  return baseLayout(body, `Welcome ${username} — your HuddleUp account is ready.`);
};

module.exports = welcomeTemplate;
