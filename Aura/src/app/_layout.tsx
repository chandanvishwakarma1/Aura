import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import '../../global.css'
import { ThemeProvider as AppThemeProvider, useTheme } from "@/lib/ThemeContext";
import { useFonts } from "expo-font";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppState, AppStateStatus, Platform, StatusBar, View } from "react-native";
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from "react";
import { focusManager, noop, onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { LogBox } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { queryClient } from '@/utils/queryClient'
import * as Notifications from 'expo-notifications'
import registerForPushNotificationsAsync from "@/utils/notifications";



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
    const currentTheme = isDark ? AuraDarkTheme : AuraLightTheme

    return (
      <ThemeProvider value={isDark ? AuraDarkTheme : AuraLightTheme}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: currentTheme.colors.background } }}>
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

// Optional: Filter the warning completely out of your Expo mobile screen developer logbox
LogBox.ignoreLogs([
  '[Reanimated] Writing to `value` during component render',
]);
export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments();
  const insets = useSafeAreaInsets()
  const [expoPushToken, setExpoPushToken] = useState('')
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([])
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined)
  const [isAppReady, setIsAppReady] = useState(false)
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

  const { checkAuth, token, user, isCheckingAuth, setUser } = useAuthStore();
  useEffect(() => {
    let isMounted = true

    const prepareApp = async () => {
      try {
        await checkAuth()

        const currentToken = useAuthStore.getState().token
        const currentUser = useAuthStore.getState().user
        // console.log("currentUser: ", JSON.stringify(currentUser, null,2))
        const userId = currentUser?._id

        if (currentToken && currentUser?._id) {
          const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/${currentUser._id}`, {
            headers: { 'Authorization': 'Bearer ' + currentToken }
          })
          if (res.ok) {
            const resData = await res.json()
            if (resData.user && isMounted) {
              setUser({
                ...resData.user,
                _id: resData.user._id
              })
              queryClient.setQueryData(['userProfile', userId], resData.user)
            }
          }
        }
      } catch (error) {
        console.warn('App initialization error: ', error)
      } finally {
        if (isMounted) {
          setIsAppReady(true)
        }
      }
    }
    prepareApp()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isAppReady || isCheckingAuth || !user || !token) return
    const isSignedIn = user && token
    if (!isSignedIn) return;
    if (user?.notificationEnabled !== true) return

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
  }, [user?.notificationEnabled, user, token, isCheckingAuth, isAppReady])

  useEffect(() => {
    if (!isAppReady || isCheckingAuth || !fontsLoaded) return

    if (fontsErr) console.log('Error loading in fonts', fontsErr)
    const inAuthScreen = segments[0] === '(auth)'
    const isSignedIn = user && token



    if (!inAuthScreen && !isSignedIn) router.replace('/(auth)')
    else if (inAuthScreen && isSignedIn) router.replace('/(tabs)')

    SplashScreen.hideAsync().catch(console.warn)
  }, [user, token, router, segments, isCheckingAuth, fontsLoaded, fontsErr, isAppReady])

  if (!isAppReady || !fontsLoaded) {
    return <View />
  }
  if (isCheckingAuth || !fontsLoaded) {
    return <View />
  }

 

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppStateTracker />
        <SafeAreaProvider style={{ paddingTop: insets.top }}>
          <AppThemeProvider>
            <NavigationContent />
          </AppThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
