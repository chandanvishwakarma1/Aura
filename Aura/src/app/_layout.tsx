import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import '../../global.css'
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar, View } from "react-native";
import { useAuthStore } from '../../store/authStore'
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments();
  const insets = useSafeAreaInsets()

  const { checkAuth, token, user, isCheckingAuth }  = useAuthStore();

  useEffect(()=> {
    checkAuth()
  },[])

  useEffect(()=>{
    if( isCheckingAuth ) return;
    const inAuthScreen = segments[0] === '(auth)'
    const isSignedIn = user&&token

    if(!inAuthScreen && !isSignedIn) router.replace('/(auth)')
    else if(inAuthScreen && isSignedIn) router.replace('/(tabs)')

    SplashScreen.hideAsync()
  }, [user,token,router, segments, isCheckingAuth])

  if(isCheckingAuth){
    return <View />
  }
  
  return (
    <SafeAreaProvider style={{ paddingTop: insets.top }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar barStyle={'light-content'} />
    </SafeAreaProvider>
  );
}
