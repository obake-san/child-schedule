/**
 * 本番環境用 CSP 設定
 * 
 * 使用方法：
 * 1. バックエンド（Node.js/Express等）で以下を設定
 * 2. または、Netlify/Vercel などのホスティングサービスのヘッダー設定で以下を使用
 * 
 * Netlify: netlify.toml の [[headers]] セクション
 * Vercel: vercel.json の headers 配列
 * Cloudflare: Page Rules で "Security Headers" を設定
 */

// ===== Express.js での設定例 =====
/*
const express = require('express');
const helmet = require('helmet');
const app = express();

// 本番環境用の厳格な CSP
const productionCSP = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // React DevTools や Firebase に必須（開発用）
      "https://www.gstatic.com",
      "https://firebase.googleapis.com",
      "https://www.googletagmanager.com",
      "https://*.firebaseio.com"
    ],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "data:"],
    connectSrc: [
      "'self'",
      "https://firebase.google.com",
      "https://*.firebaseio.com",
      "https://*.googleapis.com",
      "wss:"
    ],
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: []
  }
};

// セキュリティヘッダー適用
app.use(helmet.contentSecurityPolicy(productionCSP));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
*/

// ===== Netlify netlify.toml 設定 =====
/*
[[headers]]
  for = "/*"
  
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://firebase.googleapis.com https://www.googletagmanager.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firebase.google.com https://*.firebaseio.com https://*.googleapis.com wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
*/

// ===== Vercel vercel.json 設定 =====
/*
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://firebase.googleapis.com https://www.googletagmanager.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firebase.google.com https://*.firebaseio.com https://*.googleapis.com wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
*/

// ===== Cloudflare Workers スクリプト例 =====
/*
export default {
  async fetch(request) {
    const response = await env.ASSETS.fetch(request);
    
    const headers = new Headers(response.headers);
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://firebase.googleapis.com https://www.googletagmanager.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firebase.google.com https://*.firebaseio.com https://*.googleapis.com wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    );
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
*/

export const productionCSPConfig = {
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://www.gstatic.com",
    "https://firebase.googleapis.com",
    "https://www.googletagmanager.com",
    "https://*.firebaseio.com"
  ],
  "connect-src": [
    "'self'",
    "https://firebase.google.com",
    "https://*.firebaseio.com",
    "https://*.googleapis.com",
    "wss:"
  ]
};
