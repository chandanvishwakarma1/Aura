import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, FlatList, ActivityIndicator, RefreshControl, useWindowDimensions, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Dot, Search, Trophy, UserCheck } from 'lucide-react-native'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import Follow from '@/components/Follow'
import { Image } from 'expo-image'
import { LineChart } from 'react-native-gifted-charts'
import generateMockChartData from '../../../genData.js'
import { useRoute, useRouter } from 'expo-router'


interface Profile {
  winRate: number,
  followCount: number,
  _id: string,
  profileImage: string,
  shortIntro: string,
  name: string,
  description: string,
  type: string,
  instrumentScope: string,
  active: boolean,
}
interface ChartData {
  date:string,
  value:number
}

const fetchProfiles = async (token: string | null): Promise<Profile[]> => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profiles')
  // console.log(JSON.stringify(data, null, 2))
  return data
}

const fetchReturns = async (profileId: string, token: string | null): Promise<ChartData[]> => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/${profileId}/returns`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!response.ok) throw new Error('Failed to load chart data')
  const json = await response.json()
  return json.data
}

const ProfileItem = ({ item }: { item: Profile }) => {
  const router = useRouter()

  const { data: chartData = [] } = useQuery({
    queryKey: ['profileReturns', 'item._id', '1M'],
    queryFn: ()=> fetchReturns(item._id, useAuthStore().token),
    enabled: !!item._id,
    staleTime: 1000*60*15
  })

  const latestReturns = chartData.length>0? chartData[chartData.length -1].value : 0
  const isPositive = latestReturns >= 0

  const chartWidth = 74
  const computedSpacing = chartWidth / (chartData.length - 1)

  const handlePress = () => {
    router.navigate({ pathname: '/(profile)/profileDetail', params: { id: item._id} })
  }
  return (
    <Pressable
      onPress={handlePress}
      style={{ borderStyle: 'solid' }}
      className='flex-row w-full bg-gray-100 rounded-3xl py-6 px-4'>
      <View className='flex-1 justify-center pr-4'>

        <View className='flex-row items-center gap-3 overflow-hidden'>
          <View className='w-14 h-14 rounded-full overflow-hidden shrink-0'>
            <Image
              source={item.profileImage ? { uri: item?.profileImage } : undefined}
              style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 100 }}
              contentFit='cover'
            />
          </View>

          <View className='flex-1 justify-center gap-1 overflow-hidden'>
            <Text className='text-lg font-aura-bold '>{item.name}</Text>
            <Text numberOfLines={1} className='text-sm text-gray-600 font-aura-regular'>{item.shortIntro}</Text>
          </View>
        </View>

        <View className='flex-row items-start mt-4 pl-4' >
          <View className=' flex-row items-center justify-center gap-2'>
            <UserCheck color={'#9ca3af'} size={19} />
            <Text className='font-semibold text-base'>{item.followCount ? item.followCount : 0}</Text>
          </View>
          <View className='items-center justify-center'>
            <Dot className='text-gray-400' color={'#9ca3af'} />
          </View>
          <View className='flex-row items-center justify-center gap-2'>
            <Trophy color={'#9ca3af'} size={17} />
            <Text className='font-semibold text-base'>{item.winRate ? item.winRate.toFixed(2) : 0}%</Text>
          </View>
        </View>
      </View>

      <View className='justify-between items-center gap-3 '><View className={`flex-row p-1 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
        <Text className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{latestReturns}% </Text>
        <Text className={`text-sm  ${isPositive ? 'text-green-600' : 'text-red-600'}`}>(30d)</Text>
      </View>
          {chartData.length > 0 && (

          <LineChart

            data={chartData}
            mostNegativeValue={Math.min(...chartData.map(d => d.value), 0)}
            maxValue={Math.max(...chartData.map(d => d.value), 0)}
            yAxisLabelWidth={0}
            height={24}
            width={84}
            yAxisExtraHeight={0}
            xAxisIndicesHeight={0}
            xAxisTextNumberOfLines={0}
            xAxisLabelsHeight={0}
            yAxisOffset={0}
            xAxisThickness={0}
            yAxisThickness={0}
            overflowBottom={0}
            overflowTop={0}
            // spacing={computedSpacing}
            adjustToWidth={true}
            areaChart
            hideAxesAndRules
            hideDataPoints
            hideRules
            hideYAxisText
            initialSpacing={0}
            endSpacing={0}
            thickness={3}
            color={isPositive ? '#4671ED' : '#ef4444'}
            startFillColor='rgba(33,103,255,0.35)'
            endFillColor='rgba(4,7,14,0)'
            startOpacity={0.4}
            endOpacity={0}
            isAnimated
            curved
          />
        )}
        </View>
    </Pressable>
  )
}
const Discover = () => {
  const { token } = useAuthStore()
  const [isFocused, setIsFocused] = useState(false)
  const { width } = useWindowDimensions()



  const { data: profiles = [], isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ['profiles', token],
    queryFn: () => fetchProfiles(token),
    enabled: !!token
  })


  if (isPending) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size={'large'} />
      </View>
    )
  }

  if (error) {
    return (
      <View className='flex-1 justify-center items-center p-4'>
        <Text className='text-red-600'>Error: {error.message}</Text>
      </View>
    )
  }

  // console.log(JSON.stringify(chartData, null ,2))

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View className='flex-1 mx-6'>
        <View>
          <View className='mt-4'>
            <Text className='text-3xl font-bold'>Explore Strategies</Text>
            {/* <Text>Teslt text44230</Text> */}
          </View>
          <View className={`flex-row border bg-gray-100 rounded-full items-center px-3 mt-3 gap-1 ${isFocused ? ' border-black' : 'border-gray-300'}`}>
            <Search />
            <TextInput
              focusable
              placeholder='Search trades, ticker, strategies....'
              className='flex-1  text-base'
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
        </View>

        <FlatList
          data={profiles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ProfileItem item={item} />}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text>No Profiles Yet.</Text>}
          ItemSeparatorComponent={() => <View className='h-4' />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={'#000'}
              colors={['#000']}
            />
          }
        />
      </View>
    </KeyboardAvoidingView >
  )
}

export default Discover