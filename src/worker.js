export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const { email, message } = await request.json();

      if (!email || !message) {
        return new Response("Invalid input", { status: 400 });
      }

      const SHEET_ID = "1-csciiB0W3DK--GIVSh2_R3-G1eAWsREixTgZ1Aymb8";
      const ACCESS_TOKEN = await getAccessToken(env);

      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`;

      const response = await fetch(sheetUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [[new Date().toISOString(), email, message]],
        }),
      });

      if (!response.ok) {
        console.error(await response.text());
        return new Response("Failed to save data", { status: 500 });
      }

      return new Response("Message saved successfully", { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};

async function getAccessToken(env) {
  const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  return data.access_token;
}