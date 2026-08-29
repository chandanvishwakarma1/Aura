const IS_DEV = process.env.APP_VARIANT === 'development'
const IS_PRE = process.env.APP_VARIANT === 'preview'
module.exports = {
  expo: {
    name: IS_DEV ? "Aura (Dev)" : IS_PRE ? "Aura (Pre)" : "Aura",
    slug: "Aura",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/adaptive-icon.png",
    scheme: "aura",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/images/adaptive-icon.png",
      // bundleIdentifier: IS_DEV ? "com.chandan1v.Aura.dev" : IS_PRE ? "com.chandan1v.Aura.pre" : "com.chandan1v.Aura",
      bundleIdentifier: "com.chandan1v.Aura",
    },
    android: {
      adaptiveIcon: {
        // backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/adaptive-icon.png",
        monochromeImage: "./assets/images/adaptive-icon.png"
      },
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: "pan",
      // package: IS_DEV ? "com.chandan1v.Aura.dev" : IS_PRE ? "com.chandan1v.Aura.pre" : "com.chandan1v.Aura",
      package: "com.chandan1v.Aura",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON_BASE64 ?? "./google-services.json"
    },
    web: {
      output: "static",
      bundler: "metro",
      favicon: "./assets/images/adaptive-icon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon-dark.png",
          imageWidth: 76,
          backgroundColor: "#0052FF",
          android: {
            dark: {
              image: "./assets/images/splash-icon-light.png",
              imageWidth: 76
            }
          }
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/splash-icon-light.png",
          color: "#fff"
        }
      ],
      "expo-secure-store",
      "expo-image",
      "expo-web-browser",
      "expo-font",
      "expo-status-bar"
    ],
    "updates": {
      "url": "https://u.expo.dev/0400b78b-ba53-43c6-9c22-6915678807f8",
      enabled: IS_DEV ? false : true,
      checkOnLaunch: IS_DEV ? "NEVER" : "ALWAYS"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "0400b78b-ba53-43c6-9c22-6915678807f8"
      }
    },
    owner: "chandan1v"
  }
};