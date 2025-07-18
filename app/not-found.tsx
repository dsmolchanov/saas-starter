// Force static rendering
export const dynamic = 'force-static';
export const revalidate = false;

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | Dzen Yoga</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            text-align: center;
            max-width: 28rem;
            margin: 0 auto;
            padding: 1rem;
          }
          .content { margin-bottom: 1.5rem; }
          h1 {
            font-size: 2.5rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 0.5rem;
          }
          h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 1.5rem;
          }
          .buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
          }
          .btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
          }
          .btn-primary {
            background-color: #3b82f6;
            color: white;
          }
          .btn-primary:hover {
            background-color: #2563eb;
          }
          .btn-outline {
            border: 1px solid #d1d5db;
            color: #374151;
            background-color: white;
          }
          .btn-outline:hover {
            background-color: #f9fafb;
          }
          .language-section {
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
          }
          .language-text {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          .language-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
            font-size: 0.875rem;
          }
          .language-link {
            color: #2563eb;
            text-decoration: none;
          }
          .language-link:hover {
            text-decoration: underline;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="content">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="buttons">
            <a href="/" className="btn btn-primary">
              Go Home
            </a>
            
            <a href="/my_practice" className="btn btn-outline">
              My Practice
            </a>
          </div>
          
          <div className="language-section">
            <div className="language-text">Try in different languages:</div>
            <div className="language-links">
              <a href="/" className="language-link">
                🇷🇺 Русский
              </a>
              <a href="/en" className="language-link">
                🇺🇸 English
              </a>
              <a href="/es-MX" className="language-link">
                🇲🇽 Español
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
