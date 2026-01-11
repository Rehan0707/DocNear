# Deployment Guide for DocNear

## Deploying to Netlify

### Prerequisites
- A Netlify account (sign up at https://netlify.com)
- Your Supabase project credentials
- Your Gemini API key

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Ensure all dependencies are in `package.json`

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI

1. **Login to Netlify**
   - Go to https://app.netlify.com
   - Sign in or create an account

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your DocNear repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (Netlify will detect this automatically)

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```
   - Follow the prompts to link your site

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_SUPABASE_URL "your_supabase_project_url"
   netlify env:set VITE_SUPABASE_ANON_KEY "your_supabase_anon_key"
   netlify env:set VITE_GEMINI_API_KEY "your_gemini_api_key"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Step 3: Verify Deployment

1. Check that your site is accessible at the provided Netlify URL
2. Test the main features:
   - Patient signup/login
   - Doctor signup/login
   - Appointments booking
   - AI Chatbot

### Environment Variables Required

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard → Project Settings → API |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Google AI Studio (console.cloud.google.com) |

### Important Notes

- **SPA Routing**: The app uses React Router for client-side routing. The `netlify.toml` and `public/_redirects` files ensure all routes redirect to `index.html` for proper SPA functionality.

- **Build Output**: Vite builds to the `dist` directory, which is configured in `netlify.toml`.

- **Environment Variables**: Make sure all environment variables are set in Netlify's dashboard. These are required for:
  - Database connections (Supabase)
  - AI chatbot functionality (Gemini API)

- **Custom Domain**: After deployment, you can add a custom domain in Netlify's site settings.

### Troubleshooting

1. **Build Fails**
   - Check the build logs in Netlify dashboard
   - Verify Node version (should be 18+)
   - Ensure all dependencies are in `package.json`

2. **404 Errors on Routes**
   - Verify `netlify.toml` and `public/_redirects` files exist
   - Check that redirects are properly configured

3. **API Errors**
   - Verify environment variables are set correctly
   - Check Supabase CORS settings
   - Verify API keys are valid

4. **Database Connection Issues**
   - Ensure Supabase URL and keys are correct
   - Check Supabase project is active
   - Verify RLS policies allow public access where needed

### Post-Deployment

1. Test all user flows
2. Monitor error logs in Netlify dashboard
3. Set up custom domain (optional)
4. Configure automatic deployments from your Git repository
