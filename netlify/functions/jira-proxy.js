/**
 * BombParty — Jira API Proxy (Netlify Function)
 *
 * SETUP:
 * 1. In your repo, create this folder structure:
 *       netlify/functions/jira-proxy.js   ← this file
 *
 * 2. In Netlify dashboard → Site → Environment Variables, add:
 *       JIRA_URL    →  https://bombparty.atlassian.net
 *       JIRA_EMAIL  →  your-email@bombparty.com
 *       JIRA_TOKEN  →  your API token
 *
 * 3. Push to GitHub → Netlify auto-deploys.
 *
 * 4. Your proxy URL will be:
 *       https://YOUR-SITE.netlify.app/.netlify/functions/jira-proxy
 *
 * 5. Paste that URL into RACI app → Jira Boards → Configure → Proxy URL
 */
 
exports.handler = async function (event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
 
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
 
  const path = event.queryStringParameters?.path;
 
  if (!path) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing ?path= parameter' }),
    };
  }
 
  const { JIRA_URL, JIRA_EMAIL, JIRA_TOKEN } = process.env;
 
  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_TOKEN) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing environment variables. Set JIRA_URL, JIRA_EMAIL, JIRA_TOKEN in Netlify.' }),
    };
  }
 
  const creds   = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
  const jiraUrl = `${JIRA_URL.replace(/\/$/, '')}${path}`;
 
  try {
    const response = await fetch(jiraUrl, {
      headers: {
        'Authorization': `Basic ${creds}`,
        'Accept':        'application/json',
        'Content-Type':  'application/json',
      },
    });
 
    const data = await response.json();
 
    return {
      statusCode: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
 
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
