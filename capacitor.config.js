// ── capacitor.config.js ──────────────────────────────────────────────────────
const config = {
  appId: 'com.neosepsis.ai',
  appName: 'NeoSepsis AI',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'neosepsis',
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0f1e',
      showSpinner: false,
    }
  }
};

module.exports = config;

// ── postcss.config.js ────────────────────────────────────────────────────────
// (save as postcss.config.js separately)
/*
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
*/
