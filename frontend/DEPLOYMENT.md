# Frontend Deployment Configuration

## Environment Variables

When deploying the frontend application, you need to set the following environment variable:

### `NEXT_PUBLIC_API_URL`

This should be the full URL to your backend API, including the protocol (`http://` or `https://`).

**Examples:**

- Local development: `http://localhost:8080/api/v1`
- Production with IP: `http://209.46.121.198:8080/api/v1`
- Production with domain: `https://api.yourapp.com/api/v1`

## Vercel Deployment

When deploying to Vercel:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the `NEXT_PUBLIC_API_URL` variable with your backend API URL
4. Make sure to include the protocol (`http://` or `https://`)

**Important:** The URL must include:

- Protocol (`http://` or `https://`)
- Host (IP address or domain)
- Port (if not using default 80/443)
- API path (`/api/v1`)

## Common Issues

### API calls going to wrong URL

If you see the frontend URL prepended to the API URL (e.g., `https://form-builder-frontend-khaki.vercel.app/209.46.121.198:8080/api/v1/forms`), this means the environment variable is missing the protocol.

**Solution:** Update `NEXT_PUBLIC_API_URL` to include `http://` or `https://` at the beginning.

### CORS errors

If you get CORS errors, ensure your backend is configured to allow requests from your frontend domain.

