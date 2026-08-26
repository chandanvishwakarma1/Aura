import { View, Text, useWindowDimensions, Pressable, ScrollView, ActivityIndicator, Alert, Keyboard, RefreshControl } from 'react-native'
import { useMemo, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Info, X } from 'lucide-react-native'
import { Image } from 'expo-image'
import { LineChart } from 'react-native-gifted-charts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../../store/authStore'
import FollowSheet, { FollowSheetRef } from '@/components/FollowSheet'
import { queryClient } from '@/utils/queryClient'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

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


const fetchProfile = async (id: string, token: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/${id}`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!res.ok) throw new Error(`[${res.status}] Failed to fetch profile details`)
  return res.json()
}

const fetchProfileReturns = async (id: string, token: string, selectedRange: TimeRange) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/${id}/returns?range=${selectedRange}`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!res.ok) throw new Error(`[${res.status}] Failed to fetch profile details`)
  return res.json()
}

const ProfileDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  const { width } = useWindowDimensions()
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M')
  const [activeValue, setActiveValue] = useState<number | null>(null)
  const [isPointerActive, setIsPointerActive] = useState(false)
  const { token } = useAuthStore()
  const router = useRouter()
  const bottomSheetRef = useRef<FollowSheetRef>(null)

  const handleOpenPress = () => bottomSheetRef.current?.open()


  const { data: profileData, isLoading: isProfileLoading, isError: isProfileErr, error: profileErr, isRefetching: isProfileRefetching, refetch: profileRefetch } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => fetchProfile(id, token!),
    enabled: !!id && !!token,
  })

  const { data: returnsData, isPending: isReturnsLoading, isRefetching: isProfileReturnsRefetching, error: profileReturnsErr, refetch: profileReturnsRefetch } = useQuery({
    queryKey: ['profileReturns', id, selectedRange],
    queryFn: () => fetchProfileReturns(id, token!, selectedRange),
    enabled: !!id && !!token,
  })


  const profile = profileData?.profile
  const chartPoints = useMemo(() => returnsData?.data ?? [], [returnsData])

  const latestReturns = useMemo(() => {
    if (chartPoints.length === 0) return 0
    const lastPoint = chartPoints[chartPoints.length - 1]
    return typeof lastPoint?.value === 'number' ? lastPoint.value : 0
  }, [chartPoints])

  const isPositive = latestReturns >= 0

  const { maxValue, minValue } = useMemo(() => {
    if (chartPoints.length === 0) return { maxValue: 10, minValue: 0 }
    const values = chartPoints.map((d: ChartData) => d.value)
    const max = Math.max(...values, 0)
    const min = Math.min(...values, 0)

    const absMax = Math.max(Math.abs(max), Math.abs(min)) || 1
    const ceiling = Math.ceil(absMax * 1.2 * 10) / 10
    return {
      maxValue: ceiling,
      minValue: -ceiling,

    }
  }, [chartPoints])

  const isAnyQueryRefetching = isProfileRefetching || isProfileReturnsRefetching
  const handleRefetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['profile', id] }),
      queryClient.invalidateQueries({ queryKey: ['profileReturns', id, selectedRange] })
    ])
  }

  const handlePointerLabel = (item: ChartData) => {
    setActiveValue(item.value)
    setIsPointerActive(true)
    return null
  }

  if (isProfileLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size={'large'} color={'#000'} />
      </View>
    )
  }



  const { name, profileImage, shortIntro, followCount, winRate, description, instrumentScope } = profile || {}
  // console.log(latestReturns)

  return (
    <View className='flex-1 '>
      <ScrollView
        className='flex-1' showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isAnyQueryRefetching}
            onRefresh={handleRefetch}
            colors={[isDark ? Colors.light.primary : Colors.dark.primary]} //android
            tintColor={isDark ? Colors.light.primary : Colors.dark.primary} //ios
          />
        }
      >
        <View className='flex-row gap-3 items-center mt-4 mx-6'>
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
            className='p-2 -ml-2 rounded-full'
          >
            {({ pressed }) => (
              <View className={`rounded-full p-1 ${pressed ? 'bg-aura-surface dark:bg-aura-surface-dark' : 'bg-transparent'}`}>
                <ArrowLeft color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} />
              </View>
            )}
          </Pressable>
          {/* <View></View> */}
          <View className='absolute inset-0 items-center justify-center pointer-events-none'>
            <Text className='text-xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Profile</Text>
          </View>
        </View>

        <View className='gap-3'>
          <View className='flex-row gap-3 items-center mt-9 mx-6'>
            <View className='w-20 h-20 rounded-full overflow-hidden shrink-0'>
              <Image
                source={profileImage ? { uri: profileImage } : undefined}
                style={{ width: '100%', height: '100%', borderRadius: 100 }} />
            </View>
            <View>
              <Text className='text-3xl font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>{name}</Text>
              <Text className='mt-1 text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>{shortIntro}</Text>
            </View>
          </View>
          <View className='w-full mx-6'>
            <Text className='leading-relaxed text-base  text-aura-text-secondary dark:text-aura-text-secondary-dark'>{description}</Text>
          </View>

          <View className='flex-row gap-2 mt-3 mx-6'>
            <View className='flex-1 py-4 px-2 items-center justify-center bg-aura-surface dark:bg-aura-surface-dark rounded-2xl'>
              <Text className='text-sm text-aura-text-secondary dark:text-aura-text-secondary-dark'>{selectedRange} Return</Text>
              {latestReturns ?
                <Text className={`font-aura-bold  ${latestReturns > 0 ? 'text-aura-positive' : latestReturns === 0 ? 'text-aura-text-primary dark:text-aura-text-primary-dark' : 'text-aura-negative'}`}>{latestReturns > 0 ? '+' : ''}{latestReturns.toFixed(2)}%</Text>
                : <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>-</Text>
              }
              {/* <Text>{latestReturns > 0 ? '+' : ''}{latestReturns.toFixed(2)}%</Text> */}
            </View>
            <View className='flex-1 py-4 px-2 items-center justify-center bg-aura-surface dark:bg-aura-surface-dark rounded-2xl'>
              <Text className='text-sm text-aura-text-secondary dark:text-aura-text-secondary-dark'>Win Rate</Text>
              <Text className='font-bold text-base text-aura-text-primary dark:text-aura-text-primary-dark'>
                {typeof winRate === 'number' ? `${winRate.toFixed(2)}%` : '-'}
              </Text>
            </View>
            <View className='flex-1 py-4 px-2 items-center justify-center bg-aura-surface dark:bg-aura-surface-dark rounded-2xl'>
              <Text className='text-sm text-aura-text-secondary dark:text-aura-text-secondary-dark'>Followers</Text>
              <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>{followCount ?? 0}</Text>
            </View>
          </View>

          <View className='mt-9'>
            <Text className='text-3xl font-aura-bold mx-6 text-aura-text-primary dark:text-aura-text-primary-dark'>
              {((isPointerActive ? activeValue ?? latestReturns : latestReturns) >= 0 ? '+' : '')}
              {(isPointerActive ? activeValue ?? latestReturns : latestReturns).toFixed(2)}%
            </Text>
            <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark text-xs mt-1 mx-6'>Cumulative Return ({selectedRange})</Text>

            <View className='h-[160px] justify-center mt-4 items-center' style={{}}>
              {isReturnsLoading ? (
                <ActivityIndicator size={'small'} color={isDark ? Colors.light.primary : Colors.dark.primary} />
              ) : chartPoints.length > 0 ? (
                <LineChart
                  key={selectedRange}
                  data={chartPoints}
                  height={110}
                  width={width}
                  adjustToWidth
                  initialSpacing={0}
                  endSpacing={0}
                  thickness={3}
                  color={isPositive ? '#22c66e' : '#ef4444'}
                  hideRules
                  hideAxesAndRules
                  hideDataPoints
                  areaChart
                  curved
                  startFillColor={isPositive ? 'rgba(34,198,110,0.75)' : 'rgba(239,68,68,0.75)'}
                  endFillColor={isPositive ? 'rgba(5, 177, 105, 0)' : 'rgba(207, 32, 47, 0)'}
                  startOpacity={0.9}
                  endOpacity={0}
                  isAnimated
                  animationDuration={900}
                  animateOnDataChange
                  yAxisLabelWidth={0}
                  yAxisThickness={0}
                  hideYAxisText
                  maxValue={maxValue}
                  mostNegativeValue={minValue}

                  disableScroll={true}
                  focusEnabled={false}

                  pointerConfig={{
                    activatePointersOnLongPress: false,
                    pointerVanishDelay: 0,
                    pointerStripColor: '#fff',
                    pointerStripHeight: 220,
                    pointerStripWidth: 1,
                    pointerStripUptoDataPoint: true,
                    pointerColor: '#fff',

                    pointerLabelComponent: (item: any) => {
                      setActiveValue(item[0].value)
                      setIsPointerActive(true)
                    }

                  }}
                />
              ) : (
                <Text className='text-center text-aura-text-secondary dark:text-aura-text-secondary-dark'>No chart data available for this range</Text>
              )}
            </View>
            <View className='flex-row justify-between mx-6 bg-aura-surface dark:bg-aura-surface-dark p-1 rounded-xl mt-4'>
              {(['1W', '1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((r) => {
                const isActive = selectedRange === r
                return (
                  <Pressable
                    key={r}
                    onPress={() => {
                      setSelectedRange(r)
                      setActiveValue(null)
                      setIsPointerActive(false)
                    }}
                    className={`flex-1 items-center justify-center py-2  rounded-lg `}
                    style={{
                      shadowColor: selectedRange === r ? '#fff' : 'transparent',
                      backgroundColor: selectedRange === r ? 'white' : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: selectedRange === r ? 0.2 : 0,
                      shadowRadius: 3,
                      elevation: selectedRange === r ? 2 : 0
                    }}
                    hitSlop={4}
                  >
                    <Text className={`text-xs font-bold ${isActive ? 'text-aura-text-primary-dark dark:text-aura-text-primary' : 'text-aura-text-secondary dark:text-aura-text-secondary-dark'}`}>{r}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
          <View className='mt-6 mx-6 bg-aura-surface dark:bg-aura-surface-dark p-3 rounded-3xl border border-aura-border '>
            <View className='flex-row items-center gap-1 mb-3'>
              <Info size={16} color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary}/>
              <Text className='text-base font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>How it Works</Text>
            </View>
            <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark leading-6 text-sm '>{description}</Text>
          </View>
          <View className='mt-6 mx-6 bg-aura-surface dark:bg-aura-surface-dark p-3 rounded-3xl border border-aura-border '>
            <View className='flex-row items-center gap-1 mb-3'>
              <Info size={16} color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
              <Text className='text-base font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Instrument Scope</Text>
            </View>

            {instrumentScope === 'all' ? (
              <View className=''>
                <Text className='text-xs font-semibold bg-aura-surface-elevated dark:bg-aura-surface-elevated-dark px-3 py-3 rounded-xl text-aura-text-secondary dark:text-aura-text-secondary-dark'>All Instrument</Text>
              </View>
            )
              : Array.isArray(instrumentScope) && instrumentScope.length > 0 ? (
                <View className='flex-row flex-wrap gap-3 '>
                  {instrumentScope.map((i: string) => (
                    <View key={i} className='bg-aura-surface-elevated dark:bg-aura-surface-elevated-dark px-3 py-3 rounded-xl'>
                      <Text className='text-xs font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>{i}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark text-sm'>No instrument listed</Text>
              )}
          </View>
        </View>

      </ScrollView>
      <View className='absolute bottom-0 left-0 right-0 p-6 '>
        <Pressable className=' py-4 rounded-2xl items-center' style={{backgroundColor: (isDark ? Colors.dark.primary : Colors.light.primary)}} onPress={handleOpenPress}>
          <Text className='text-center  text-white font-bold text-base'>Start Copying Profile</Text>
        </Pressable>
      </View>

      {id && <FollowSheet ref={bottomSheetRef} name={name} profileId={id} />}



    </View>
  )
}

export default ProfileDetail