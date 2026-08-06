import { DefaultTheme, SplashScreen, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import '../../global.css'
import { useFonts } from "expo-font";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppState, AppStateStatus, Platform, StatusBar, View } from "react-native";
import { useAuthStore } from '../../store/authStore'
import { useEffect } from "react";
import { focusManager, onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { GestureHandlerRootView } from 'react-native-gesture-handler'


SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient()

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})

const AppStateTracker = () => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active')
      }
    })
    return () => subscription.remove()
  }, [])
  return null
}
const myTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff'
  }
}

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments();
  const insets = useSafeAreaInsets()
  const [fontsLoaded, fontsErr] = useFonts({
    'Aura-Bold': require('@/assets/fonts/Coinbase_Sans-Bold.ttf'),
    'Aura-Bold-Italic': require('@/assets/fonts/Coinbase_Sans-Bold_Italic.ttf'),
    'Aura-ExtraLight': require('@/assets/fonts/Coinbase_Sans-Extra_Light.ttf'),
    'Aura-ExtraLight-Italic': require('@/assets/fonts/Coinbase_Sans-Extra_Light_Italic.ttf'),
    'Aura-Light': require('@/assets/fonts/Coinbase_Sans-Light.ttf'),
    'Aura-Light-Italic': require('@/assets/fonts/Coinbase_Sans-Light_Italic.ttf'),
    'Aura-Medium': require('@/assets/fonts/Coinbase_Sans-Medium.ttf'),
    'Aura-Medium-Italic': require('@/assets/fonts/Coinbase_Sans-Medium_Italic.ttf'),
    'Aura-Regular': require('@/assets/fonts/Coinbase_Sans-Regular.ttf'),
    'Aura-Regular-Italic': require('@/assets/fonts/Coinbase_Sans-Regular_Italic.ttf'),
  })

  const { checkAuth, token, user, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isCheckingAuth || !fontsLoaded) return;

    if (fontsErr) console.log('Error loading in fonts', fontsErr)
    const inAuthScreen = segments[0] === '(auth)'
    const isSignedIn = user && token

    if (!inAuthScreen && !isSignedIn) router.replace('/(auth)')
    else if (inAuthScreen && isSignedIn) router.replace('/(tabs)')

    SplashScreen.hideAsync()
  }, [user, token, router, segments, isCheckingAuth, fontsLoaded, fontsErr])

  if (isCheckingAuth || !fontsLoaded) {
    return <View />
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <QueryClientProvider client={queryClient}>
      <AppStateTracker />
      <ThemeProvider value={myTheme}>
        <SafeAreaProvider style={{ paddingTop: insets.top }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
