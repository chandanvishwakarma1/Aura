import { View, Text, useWindowDimensions, Pressable, ScrollView, ActivityIndicator, Alert, Keyboard } from 'react-native'
import { useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Info, X } from 'lucide-react-native'
import { Image } from 'expo-image'
import { LineChart } from 'react-native-gifted-charts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import FollowSheet, { FollowSheetRef } from '@/components/FollowSheet'

interface Profile {
  winRate: number,
  followCount: number,
  _id: string,
  profileImage: string,
  shortIntro: string,
  name: string,
  description: string,
  type: string,
  instrumentScope: string | string[],
  active: boolean,
}
type ChartData = {
  value: number
}
type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
const ProfileDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { width } = useWindowDimensions()
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M')
  const { token } = useAuthStore()
  const router = useRouter()
  const bottomSheetRef = useRef<FollowSheetRef>(null)

  const handleOpenPress = () => bottomSheetRef.current?.open()




  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      if (!res.ok) throw new Error('Failed to fetch profile details')
      return res.json()
    },
    enabled: !!id && !!token,
  })
  const { data: returnsData, isPending: isReturnsLoading } = useQuery({
    queryKey: ['profileReturns', id, selectedRange],
    queryFn: async () => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/${id}/returns?range=${selectedRange}`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      if (!res.ok) throw new Error('Failed to fetch profile details')
      return res.json()
    },
    enabled: !!id && !!token,
  })


  if (isProfileLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size={'large'} color={'#000'} />
      </View>
    )
  }
  const { name, profileImage, shortIntro, followCount, winRate, description, instrumentScope } = profile?.profile || {}
  const chartPoints = returnsData?.data || []
  const latestReturns = chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].value : 0
  const isPositive = latestReturns >= 0

  return (
    <View className='flex-1 '>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className='flex-row gap-3 items-center mt-4 mx-6'>
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
            className='p-2 -ml-2'
          >
            <ArrowLeft />
          </Pressable>
          {/* <View></View> */}
          <Text className='flex-1 text-center text-3xl  font-aura-bold'>Profile</Text>
          <View className='w-6' />
        </View>

        <View className='gap-3'>
          <View className='flex-row gap-3 items-center mt-9 mx-6'>
            <View className='w-20 h-20 rounded-full overflow-hidden shrink-0'>
              <Image
                source={profileImage ? { uri: profileImage as string } : undefined}
                style={{ width: '100%', height: '100%', borderRadius: 100 }} />
            </View>
            <View>
              <Text className='text-3xl font-semibold'>{name}</Text>
              <Text className='mt-1 text-base'>{shortIntro}</Text>
            </View>
          </View>
          <View className='w-full mx-6'>
            <Text className='leading-relaxed text-base  text-gray-600'>{description}</Text>
          </View>

          <View className='flex-row gap-2 mt-3 mx-6'>
            <View className='flex-1 py-4 px-2 items-center justify-center bg-gray-100 rounded-2xl'>
              <Text className='text-sm'>{selectedRange} Return</Text>
              {latestReturns > 0 ?
                <Text className='font-aura-bold'>{latestReturns > 0 ? '+' : ''}{latestReturns}%</Text>
                : <Text className='font-aura-bold'>-</Text>
              }
            </View>
            <View className='flex-1 py-4 px-2 items-center justify-center bg-gray-100 rounded-lg'>
              <Text className='text-sm'>Win Rate</Text>
              {winRate ? <Text className='font-aura-bold'>{winRate.toFixed(2)}%</Text> : <Text className='font-aura-bold'>-</Text>}
            </View>
            <View className='flex-1 py-4 px-2 items-center justify-center bg-gray-100 rounded-lg'>
              <Text className='text-sm'>Followers</Text>
              <Text className='font-aura-bold'>{followCount}</Text>
            </View>
          </View>

          <View className='mt-9'>
            <Text className='text-3xl font-aura-bold mx-6'>{isPositive ? '+' : ''}{latestReturns}%</Text>
            <Text className='text-gray-400 text-xs mt-1 mx-6'>Cumulative Return ({selectedRange})</Text>
            <View className='h-52 justify-center mt-4'>
              {isReturnsLoading ? (
                <ActivityIndicator size={'small'} color={'#000'} />
              ) : chartPoints.length > 0 ? (
                <LineChart
                  data={chartPoints}
                  height={160}
                  width={width}
                  adjustToWidth
                  initialSpacing={0}
                  endSpacing={0}
                  thickness={3}
                  color={isPositive ? '#4671ED' : '#ef4444'}
                  hideRules
                  hideDataPoints
                  areaChart
                  curved
                  startFillColor='rgba(22,163,74,0.75)'
                  // endFillColor='rgba(5,7,14,0)'
                  startOpacity={0.6}
                  endOpacity={0}
                  isAnimated
                  animationDuration={800}
                  animateOnDataChange
                  yAxisLabelWidth={0}
                  yAxisThickness={0}
                  hideYAxisText
                  maxValue={Math.max(...chartPoints.map((d: ChartData) => d.value), 0) * 1.05}
                  mostNegativeValue={Math.min(...chartPoints.map((d: ChartData) => d.value), 0) * 1.05}
                  disableScroll
                  pointerConfig={{
                    pointerStripHeight: 180,
                    pointerStripWidth: 1,
                    pointerStripUptoDataPoint: true,
                    pointerColor: '#fff',
                    pointerStripColor: '#fff',
                    activatePointersOnLongPress: false,
                    pointerVanishDelay: 0,
                    pointerLabelComponent: (items: ChartData[]) => {
                      // Update the "Return" stat card live without rendering a tooltip
                      console.log(items)
                    },
                  }}
                />
              ) : (
                <Text className='text-center text-gray-400'>No chart data available for this range</Text>
              )}
            </View>
            {/* <View className='flex-row justify-between bg-gray-100 p-1 rounded-xl mt-4'>
              {(['1W','1M','3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((r)=>(
                <Pressable
                  key={r}
                  onPress={()=>setSelectedRange(r)}
                  className={`py-2 px-4 rounded-lg ${selectedRange === r ? 'bg-white shadow-sm' : ''}`}>
                  <Text className={`text-xs font-aura-bold ${selectedRange === r ? 'text-black' : 'text-gray-400'}`}>{r}</Text>
                </Pressable>
              ))}
            </View> */}
          </View>
          <View className='mt-6 mx-6 bg-blue-60/60 p-3 rounded-3xl border border-blue-100'>
            <View className='flex-row items-center gap-1 mb-3'>
              <Info size={16} />
              <Text className='text-base font-bold'>How it Works</Text>
            </View>
            <Text className='text-gray-700 leading-6 text-sm'>{description}</Text>
          </View>
          <View className='mt-6 mx-6 bg-blue-60/60 p-3 rounded-3xl border border-blue-100'>
            <View className='flex-row items-center gap-1 mb-3'>
              <Info size={16} />
              <Text className='text-base font-bold'>Instrument Scope</Text>
            </View>

            {instrumentScope === 'all' ? (
              <View className=''>
                <Text className='text-xs font-semibold bg-gray-100 px-3 py-3 rounded-xl '>All Instrument</Text>
              </View>
            )
              : Array.isArray(instrumentScope) && instrumentScope.length > 0 ? (
                <View className='flex-row flex-wrap gap-3 '>
                  {instrumentScope.map((i: string) => (
                    <View key={i} className='bg-gray-100 px-3 py-3 rounded-xl'>
                      <Text className='text-xs font-semibold'>{i}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className='text-gray-400 text-sm'>No instrument listed</Text>
              )}
          </View>
        </View>

      </ScrollView>
      <View className='absolute bottom-0 left-0 right-0 p-6 '>
        <Pressable className='bg-black py-4 rounded-2xl items-center' onPress={handleOpenPress}>
          <Text className='text-center  text-white font-bold text-base'>Start Copying Profile</Text>
        </Pressable>
      </View>

      <FollowSheet ref={bottomSheetRef} name={name} profileId={id} />



    </View>
  )
}

export default ProfileDetail