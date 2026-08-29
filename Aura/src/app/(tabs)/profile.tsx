import { View, Text, ScrollView, RefreshControl, Pressable, Alert, Switch } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { Image } from 'expo-image'
import { BadgeInfo, BellRing, LogOut, SunMoon, WalletMinimal } from 'lucide-react-native'
import { ApiError } from '@/utils/apiError'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/utils/queryClient'
import * as Notifications from 'expo-notifications'
import registerForPushNotificationsAsync from '@/utils/notifications'
import {Host} from '@expo/ui'
import MenuView from '@expo/ui/community/menu'
import { ThemeMode, useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'
import AuraSwitch from '@/components/Switch'


const fetchUpatedUser = async (token: string, id: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/${id}`, {
    method: "GET",
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!res.ok) throw new ApiError(`[Profile.tsx] Failed to fetch user`)
  const resData = await res.json()
  return resData.user
}

const Profile = () => {
  const { user: storedUser, token, setUser, logOut } = useAuthStore()
  const { data: updatedUser, refetch, isRefetching, error, isLoading } = useQuery({
    queryKey: ['userProfile', storedUser?._id],
    queryFn: () => fetchUpatedUser(token, storedUser?._id),
    enabled: !!storedUser?._id
  })

  // console.log(JSON.stringify(storedUser, null, 2))

  if (error) {
    console.log(`Error: ${error.message}`)
  }

  useEffect(() => {
    if (updatedUser) {
      setUser({
        ...updatedUser,
        _id: updatedUser._id
      })
    }
  }, [updatedUser, setUser])

  const user = storedUser
  // console.log(JSON.stringify(user,null,2))


  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  const { themeMode, updateTheme, activeTheme } = useTheme()

  // Hydrate the toggle from the persisted server-side preference once loaded.
  useEffect(() => {
    if (updatedUser && typeof updatedUser.notificationEnabled === 'boolean') {
      setIsNotificationEnabled(updatedUser.notificationEnabled)
    }
  }, [updatedUser])

  // Persist the preference to the backend and (re)register the device on enable.
  const handleNotificationToggle = async (value: boolean) => {
    // Optimistic flip so the switch responds immediately.
    setIsNotificationEnabled(value)

    try {
      // Persist to backend. When disabled this also clears the device token server-side.
      const prefRes = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/notificationPref`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ enabled: value })
      })
      if (!prefRes.ok) throw new Error('Failed to update preference')
      console.log("Notification status: ", value)
      const userId = user?._id
      if (user && userId) {
        setUser({
          ...user,
          notificationEnabled: value,
          _id: user._id
        })
        queryClient.setQueryData(['userProfile', userId], (old: any) => ({
          ...old,
          notificationEnabled: value
        }))
      }

      if (value) {
        // Enabling: request OS permission and (re)register the device token.
        const { status } = await Notifications.requestPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert(
            'Notifications disabled',
            'Notifications are blocked in your device settings. Enable them in Settings to receive trade alerts.'
          )
          setIsNotificationEnabled(false)
          return
        }
        if (token) {
          await registerForPushNotificationsAsync(token)
        }
      }
    } catch (error) {
      console.log('Failed to update notification preference: ', error)
      // Revert on failure.
      setIsNotificationEnabled(!value)
    }
  }

  const isDark = activeTheme === 'dark'

  const handleOnPress = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK", onPress: () => {
            queryClient.clear()
            logOut()
          }
        }
      ]
    )

  }

  const handleMenuPress = ({ nativeEvent }: { nativeEvent: { event: string } }) => {
    updateTheme(nativeEvent.event as ThemeMode)
  }

  useEffect(() => {
    console.log("activeThemee: ", activeTheme)
  }, [activeTheme])
  return (
    <ScrollView
      className='flex-1 mx-6 mt-6'
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[isDark ? Colors.light.primary : Colors.dark.primary]} //android
          tintColor={isDark ? Colors.light.primary : Colors.dark.primary} //ios
        />
      }>
      <View className='mt-4'>
        <Text className='text-3xl font-bold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Account</Text>
      </View>

      <View className='flex-row gap-3 items-center mt-9'>
        <View className='h-16 w-16 rounded-full shrink-0 overflow-hidden'>
          <Image source={{ uri: user?.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 100, alignSelf: 'center' }} contentFit='cover' />
        </View>
        <View className=''>
          <Text className='text-xl font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>{user?.fullName}</Text>
          <Text className='text-base  text-aura-text-muted '>@{user?.username}</Text>
        </View>
      </View>


      <View className='p-6 bg-aura-surface rounded-3xl mt-9 gap-3 dark:bg-aura-surface-dark'>
        <View className='flex-row gap-3 items-center'>
          <WalletMinimal size={20} color={isDark ? Colors.dark.textMuted : Colors.light.textMuted} />
          <Text className=' text-base font-semibold text-aura-text-muted'>Paper balance</Text>
        </View>
        <Text className='text-4xl font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>₹{user?.availableCapital?.toLocaleString('en-IN')}</Text>
      </View>

      <View className='flex-row justify-between items-center mt-6  rounded-3xl px-6 py-6 bg-aura-surface dark:bg-aura-surface-dark'>
        <View className='flex-row gap-3 items-center'>
          <BellRing size={20} color={isDark ? Colors.dark.textMuted : Colors.light.textMuted} />
          <Text className='text-aura-text-primary dark:text-aura-text-primary-dark'>Enable notifications</Text>
        </View>
        <View className=''>
          <AuraSwitch
            value={isNotificationEnabled}
            onValueChange={handleNotificationToggle}

          />
        </View>
      </View>

      <View className='flex-row justify-between items-center mt-6  rounded-3xl px-6 py-6 bg-aura-surface dark:bg-aura-surface-dark'>
        <View className='flex-row gap-3 items-center'>
          <SunMoon size={20} color={isDark ? Colors.dark.textMuted : Colors.light.textMuted} />
          <Text className='text-aura-text-primary dark:text-aura-text-primary-dark'>Toggle Theme</Text>
        </View>
        <Host seedColor={Colors.light.primary}>

        <MenuView
          title='Choose theme'
          colorScheme={isDark ? 'dark' : 'light'}
          onPressAction={handleMenuPress}
          actions={[
            { id: 'system', title: 'System', state: themeMode === 'system' ? 'on' : 'off' },
            { id: 'light', title: 'Light', state: themeMode === 'light' ? 'on' : 'off' },
            { id: 'dark', title: 'Dark', state: themeMode === 'dark' ? 'on' : 'off' }
          ]}
        >
          <Text className='text-aura-text-muted font-semibold text-sm'>{themeMode === 'system' ? `System (${activeTheme})` : `${themeMode.charAt(0).toUpperCase()}${themeMode.slice(1)}`}</Text>

        </MenuView>
        </Host>
      </View>
      <View className='flex-row justify-between items-center mt-6 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl px-6 py-6'>
        <View className='flex-row gap-3 items-center'>
          <BadgeInfo size={20} color={isDark ? Colors.dark.textMuted : Colors.light.textMuted} />
          <Text className='text-aura-text-primary dark:text-aura-text-primary-dark'>About Us</Text>

        </View>
      </View>
      <View className='flex-row justify-between items-center  mt-6 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl px-6 py-6'>
        <View className='flex-row gap-3 items-center'>
          <BadgeInfo size={20} color={isDark ? Colors.dark.textMuted : Colors.light.textMuted} />
          <Text className='text-aura-text-primary dark:text-aura-text-primary-dark'>Support</Text>
        </View>
      </View>
      <Text className='mt-6 text-xl font-semibold'>Danger Zone</Text>
      <Pressable
        className='flex-row justify-between items-center mb-6 mt-3 bg-red-600 rounded-3xl px-6 py-6'
        onPress={handleOnPress}
      >
        <View className='flex-row gap-3 items-center'>
          <LogOut size={20} color={'white'} strokeWidth={3} />
          <Text className='text-base text-white font-semibold'>Log Out</Text>
        </View>
      </Pressable>
    </ScrollView>
  )
}

export default Profile