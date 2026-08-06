import { View, Text, Switch } from 'react-native'
import React, { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { Image } from 'expo-image'
import { BadgeInfo, BellRing, SunMoon, WalletMinimal } from 'lucide-react-native'

const Profile = () => {
  const { user } = useAuthStore()
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isDark, setIsDark] = useState(false)
  const toggleSwitch = () => setIsNotificationEnabled(previousState => !previousState)
  const toggleDark = () => setIsDark(previousState => !previousState)
  // console.log(user)
  return (
    <View className='flex-1 mx-6'>
      <View className='mt-4'>

        <Text className='text-3xl font-bold'>Account</Text>
      </View>

      <View className='flex-row gap-3 items-center mt-9'>
        <View className='h-16 w-16 rounded-full shrink-0 overflow-hidden'>
          <Image source={{ uri: user?.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 100, alignSelf: 'center' }} contentFit='cover' />
        </View>
        <View className=''>
          <Text className='text-xl font-semibold'>{user?.fullName}</Text>
          <Text className='text-base text-gray-400'>@{user?.username}</Text>
        </View>
      </View>

      <View className='p-6 bg-gray-100 rounded-3xl mt-9 gap-3'>
        <View className='flex-row gap-3 items-center'>
          <WalletMinimal size={20} />
          <Text className='text-gray-600 text-base font-semibold'>Paper balance</Text>
        </View>
        <Text className='text-4xl font-aura-bold'>₹ {user?.availableCapital.toLocaleString('en-IN')}</Text>
      </View>

      <View className='flex-row justify-between items-center mt-6 bg-gray-100 rounded-3xl px-6 py-3'>
        <View className='flex-row gap-3 items-center'>
          <BellRing size={20} />
          <Text>Enable notifications</Text>
        </View>
        <Switch
          value={isNotificationEnabled}
          onValueChange={toggleSwitch}
          trackColor={{ false: '#E2E4EB', true: '#4A629B' }}
          thumbColor={isNotificationEnabled ? '#fff' : '#6F727B'}
        />
      </View>

      <View className='flex-row justify-between items-center mt-6 bg-gray-100 rounded-3xl px-6 py-3'>
        <View className='flex-row gap-3 items-center'>
          <SunMoon size={20} />
          <Text>Toggle Dark/Light Mode</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleDark}
          trackColor={{ false: '#E2E4EB', true: '#4A629B' }}
          thumbColor={isDark ? '#fff' : '#6F727B'}
        />
      </View>
      <View className='flex-row justify-between items-center mt-6 bg-gray-100 rounded-3xl px-6 py-6'>
        <View className='flex-row gap-3 items-center'>
          <BadgeInfo size={20} />
          <Text>About Us</Text>

        </View>
      </View>
      <View className='flex-row justify-between items-center mt-6 bg-gray-100 rounded-3xl px-6 py-6'>
        <View className='flex-row gap-3 items-center'>
          <BadgeInfo size={20} />
          <Text>Support</Text>
        </View>
      </View>
    </View>
  )
}

export default Profile