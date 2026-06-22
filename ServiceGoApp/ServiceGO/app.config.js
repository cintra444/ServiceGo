const appJson = require("./app.json");

module.exports = ({ config }) => ({
  ...config,
  ...appJson,
  extra: {
    ...(appJson.expo?.extra || {}),
    eas: {
      projectId: "@cintra/ServiceGO",
    },
    API_URL:
      process.env.EXPO_PUBLIC_API_URL ||
      "https://servicego-backend-production.up.railway.app",
  },
});
