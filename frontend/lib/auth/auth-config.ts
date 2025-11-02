/**
 * Authentication configuration settings
 */
export const AUTH_CONFIG = {
  JWT: {
    SECRET: process.env.JWT_SECRET || "your-secret-jwt-key-equators-tech-needs-to-be-at-least-32-chars",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  COOKIES: {
    SESSION_TOKEN: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    CALLBACK_URL: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  PAGES: {
    SIGN_IN: "/auth/login",
    SIGN_OUT: "/auth/logout",
    ERROR: "/auth/error",
    NEW_USER: "/auth/register",
  },
  PROVIDERS: {
    GITHUB: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    GOOGLE: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  ELECTRON: {
    PROTOCOLS: ["equatorschatbot", "equatorsbrowser", "equatorsaiplayground"],
    // Protocol for Electron app deep linking
    REDIRECT_PROTOCOL: "equators://auth/callback",
    // Buffer time in seconds to refresh token before expiry
    TOKEN_EXPIRY_BUFFER: 300, // 5 minutes
  },
};

// Threshold time in milliseconds before token expiry when refresh should be attempted
export const TOKEN_REFRESH_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
