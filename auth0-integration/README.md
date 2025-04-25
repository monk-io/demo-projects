# Auth0 Express App

This is a simple Express.js app that uses Auth0 for authentication. It displays user info after login, supports login/logout, and expects configuration via environment variables.

## Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the root directory with the following variables:

   ```env
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_CALLBACK_URL=http://localhost:3000/callback
   PORT=3000
   SESSION_SECRET=your_session_secret
   ```

   - You can get these values from your Auth0 dashboard.

4. **Run the app:**

   ```bash
   node app.js
   ```

5. **Visit** [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Login with Auth0
- Callback route for Auth0
- Logout route
- Displays user info after login
- Configurable listen port

## Notes

- Make sure your Auth0 application allows the callback URL you set in `AUTH0_CALLBACK_URL`.
- For production, use a strong `SESSION_SECRET` and secure session settings.
