# Mlindos AI Gumede — Netlify starter

## Deploy
1. Sign in to Netlify.
2. Choose **Add new project** / **Deploy manually** (the wording may vary).
3. Upload the contents of this project folder, or connect a Git repository containing these files.
4. In your Netlify site, open **Project configuration → Environment variables**.
5. Add a variable:
   - Key: `OPENAI_API_KEY`
   - Value: your OpenAI secret key
   Make sure it is available to Functions.
6. Trigger a fresh deploy after adding the variable.

The site calls `/.netlify/functions/chat`. The OpenAI key is read only by the server-side function and is not included in browser code.

## Important
- Never put the API key in `index.html`, JavaScript sent to the browser, or `netlify.toml`.
- API usage is billed separately by OpenAI. Set usage limits/budgets in your OpenAI API billing settings.
- This starter uses the OpenAI Responses API and the `gpt-4.1-mini` model. You can change the model in `netlify/functions/chat.mjs`.
- Add rate limiting, abuse protection, and user authentication before making this public to lots of users. This starter does not include accounts or saved projects.
