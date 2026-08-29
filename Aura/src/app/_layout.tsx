import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import '../../global.css'
import { ThemeProvider as AppThemeProvider, useTheme } from "@/lib/ThemeContext";
import { useFonts } from "expo-font";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppState, AppStateStatus, Platform, StatusBar, Text, View } from "react-native";
import { useAuthStore } from '../../store/authStore'
import { useEffect, useMemo, useState } from "react";
import { focusManager, noop, onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { LogBox } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { queryClient } from '@/utils/queryClient'
import * as Notifications from 'expo-notifications'
import registerForPushNotificationsAsync from "@/utils/notifications";
import { Image } from "expo-image";
import Aura from '@/assets/images/adaptive-icon-light.png'
import * as Updates from 'expo-updates'



SplashScreen.preventAutoHideAsync();


onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldSetBadge: false,
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
function NavigationContent() {
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  const currentTheme = useMemo(()=>(isDark ? AuraDarkTheme : AuraLightTheme), [isDark])

  return (
    <ThemeProvider value={currentTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: currentTheme.colors.background } }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(profile)" />
        <Stack.Screen name="(position)" />
        <Stack.Screen name="(trade)" />
      </Stack>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#0A0B0D' : '#fff'} />
    </ThemeProvider>
  )
}
const AuraLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#EEF0F3',
    text: '#0A0B0D',
    border: '#DEE1E6',
    primary: '#0052FF'
  }
}
const AuraDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0A0B0D',
    card: '#16181C',
    text: '#FFFFFF',
    border: '#32353D',
    primary: '#0052FF'
  }
}
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: true,
});

LogBox.ignoreLogs([
  '[Reanimated] Writing to `value` during component render',
]);

function CustomSplashScreen(){
  const insets=useSafeAreaInsets()

  return (
      <View style={{ backgroundColor: '#0052FF' }} className="flex-1 justify-center items-center">
        <Image
          source={Aura}
          style={{ width: 76, height: 76 }}
          contentFit="contain"
        />
        <View style={{ bottom: insets.bottom + 40 }}
          className="absolute left-0 right-0 items-center justify-center"
        >
          <Text style={{ fontFamily: 'Aura-Bold' }}
            className="text-white text-xl tracking-tighter lowercase"
          >Aura</Text>
        </View>
      </View>
    )
}
export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments();
  const [expoPushToken, setExpoPushToken] = useState('')
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([])
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined)
  const [isAppReady, setIsAppReady] = useState(false)
  const [showCustomSplash, setShowCustomSplash] = useState(true)
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

  const { checkAuth, token, user, isCheckingAuth, setUser, hasAccount, hasSeenOnboarding } = useAuthStore();

  //Ota
  useEffect(()=>{
    async function checkForUpdates() {
      if (__DEV__) return;

      try {
        const update = await Updates.checkForUpdateAsync()
        if(update.isAvailable){
          await Updates.fetchUpdateAsync()
          await Updates.reloadAsync()
        }
      } catch (error) {
        console.log('Error fetching update: ', error)
      }
    }

    checkForUpdates()
  }, [])

  //initial auth & background profile fetch (non-blocking)
  useEffect(() => {
    let isMounted = true
    checkAuth().finally(() => {
      if (isMounted) setIsAppReady(true)
    })
    return () => { isMounted = false }
  }, [checkAuth])

  // Refresh the profile from the server once the session is ready, without
  // blocking app boot. setUser persists the freshest user to storage.
  const userId = user?._id
  useEffect(() => {
    if (!token || !userId) return

    let isMounted = true
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/${userId}`, {
      headers: { 'Authorization': 'Bearer ' + token },
      signal: controller.signal,
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((resData) => {
        clearTimeout(timeoutId)
        if (resData?.user && isMounted) {
          setUser({ ...resData.user, _id: resData.user._id })
          queryClient.setQueryData(['userProfile', userId], resData.user)
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        if (error?.name !== 'AbortError') console.warn('Profile refresh error: ', error)
      })

    return () => { isMounted = false; controller.abort() }
  }, [token, userId, setUser])

  useEffect(() => {
    if (!isAppReady || isCheckingAuth || user?.notificationEnabled !== true || !token) return

    let isMounted = true

    const setupNotifications = async () => {
      const pushToken = await registerForPushNotificationsAsync(token)
      if (pushToken && isMounted) {
        setExpoPushToken(pushToken)
      }
      if (Platform.OS === 'android') {
        const channels = await Notifications.getNotificationChannelsAsync()
        if (isMounted) {
          setChannels(channels ?? [])
        }
      }
    }
    setupNotifications()

    const notificationListner = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification)
    })

    const responseListner = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped: ', response)
      const data = response.notification.request.content.data
      if (data?.tradeId) router.push(`/(trade)/${data?.tradeId}`)
    })

    return () => {
      isMounted = false
      notificationListner.remove()
      responseListner.remove()
    }
  }, [token, user?.notificationEnabled, isCheckingAuth, isAppReady, router])

  useEffect(() => {
    if (!isAppReady || isCheckingAuth || (!fontsLoaded && !fontsErr)) return

    if (fontsErr) console.warn('Error loading fonts: ', fontsErr)

    const inAuthScreen = segments[0] === '(auth)'
    const inOnboardingScreen = segments[0] === '(onboarding)'
    const isSignedIn = !!user && !!token

    if (isSignedIn) {
      // Signed-in -> main tabs, never auth/onboarding
      if (inAuthScreen || inOnboardingScreen) router.replace('/(tabs)')
    } else if (hasAccount || hasSeenOnboarding) {
      // Returning/logged-out user, or a new user who finished the onboarding intro
      // -> login/register
      if (!inAuthScreen) router.replace('/(auth)')
    } else {
      // Brand-new user who hasn't seen onboarding yet -> onboarding intro, then register
      if (!inOnboardingScreen) router.replace('/(onboarding)')
    }

    SplashScreen.hideAsync().then(() => {
      setTimeout(() => {
        setShowCustomSplash(false)
      }, 600)
    }).catch(console.warn)
  }, [user, token, router, segments, isCheckingAuth, fontsLoaded, fontsErr, isAppReady, hasAccount, hasSeenOnboarding])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppStateTracker />
        <SafeAreaProvider>
          <AppThemeProvider>
            {
              showCustomSplash || (!fontsLoaded && !fontsErr) || !isAppReady || isCheckingAuth ? (
                <CustomSplashScreen />
              ) : (
                <NavigationContent />
              )
            }
          </AppThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
