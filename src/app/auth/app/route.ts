import { NextResponse } from "next/server";

export function GET(request: Request) {
  const incoming = new URL(request.url);
  const appUrl = new URL("albuc://auth/callback");
  incoming.searchParams.forEach((value, key) => {
    appUrl.searchParams.set(key, value);
  });
  const href = appUrl.toString();

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Open Albuc</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f7; color: #1d1d1f; }
    main { text-align: center; padding: 32px; max-width: 360px; }
    a { display: inline-block; margin-top: 16px; background: #1d1d1f; color: #fff; text-decoration: none; border-radius: 999px; padding: 12px 20px; font-weight: 600; }
    p { color: #6e6e73; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>Open Albuc</h1>
    <p>This link signs you in on iPhone. If the app did not open, tap the button.</p>
    <a href="${href}">Open Albuc</a>
  </main>
  <script>location.replace(${JSON.stringify(href)});</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
