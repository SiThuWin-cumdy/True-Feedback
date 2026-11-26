import { createHash } from 'node:crypto'

const INLINE_SCRIPT = /<script>([\s\S]*?)<\/script>/g

const originOf = (url) => (/^https?:\/\//.test(url) ? new URL(url).origin : '')

// Adds a Content-Security-Policy to the built index.html. The session token is
// in localStorage, so this limits what an injected script could run and where
// it could send the token. Build only: the dev server relies on inline scripts.
export const cspPlugin = ({ apiBaseUrl }) => ({
  name: 'csp',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) => {
      const scriptHashes = [...html.matchAll(INLINE_SCRIPT)].map(
        ([, code]) => `'sha256-${createHash('sha256').update(code).digest('base64')}'`
      )
      const policy = [
        "default-src 'self'",
        ["script-src 'self'", ...scriptHashes].join(' '),
        // react-hot-toast injects <style> elements.
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        'font-src https://fonts.gstatic.com',
        "img-src 'self' data:",
        `connect-src 'self' ${originOf(apiBaseUrl)}`.trim(),
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')

      const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}" />`
      // Must come before the scripts it governs, after the charset.
      return html.replace(/(<meta charset[^>]*>)/i, `$1\n    ${meta}`)
    },
  },
})
