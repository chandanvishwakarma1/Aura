import { View, Text, ActivityIndicator, ScrollView, RefreshControl, useWindowDimensions, Pressable } from 'react-native'
import React, { act, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/utils/apiError'
import { Image } from 'expo-image'
import { LineChart } from 'react-native-gifted-charts'
import { queryClient } from '@/utils/queryClient'
import { Href, useRouter } from 'expo-router'
import Arrow from '@/assets/Arrow'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

interface Position {
  _id: string
  symbol: string
  entryPrice: number
  profileImage: string
  currentPrice: number
  avgPrice: number
  unrealizedPnl: number
}
interface ChartData {
  date: string
  value: number
}

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
interface Profile {
  profileId: string
  profileImage: string
  name: string
  capitalAllocated: string
  pnl: string
  currentValue: string
}

const fetchPortfolio = async (token: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/portfolio`, {
    method: "GET",
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!res.ok) throw new ApiError('Failed to fetch portfolio')
  return await res.json()
}

const fetchReturns = async (token: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/returns`, {
    method: "GET",
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!res.ok) throw new ApiError('Failed to fetch portfolio')
  return await res.json()
}

const Portfolio = () => {
  const { token } = useAuthStore()
  const router = useRouter()
  const { activeTheme } = useTheme()
  const [isPointerActive, setIsPointerActive] = useState(false)
  const [activeValue, setActiveValue] = useState<number | null>(null)
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M')

  const { data: portfolioData, error: portfolioErr, isRefetching } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => fetchPortfolio(token),
    enabled: !!token,
  })

  const isDark = activeTheme === 'dark'

  const { width } = useWindowDimensions()

  const { data: returnsData, isLoading, isPending: isReturnsPending, error: returnsErr } = useQuery({
    queryKey: ['portfolio', 'returns'],
    queryFn: () => fetchReturns(token),
    enabled: !!token,
  })

  useEffect(() => {
    if (returnsErr) console.log("Error in returns: ", returnsErr)
    if (portfolioErr) console.log("Error in portfolio: ", portfolioErr)
  }, [portfolioErr, returnsErr])

  const totalReturnPercent = portfolioData?.totalReturnPercent || 0
  const totalEquity = portfolioData?.totalEquity || 0
  const positions = useMemo(()=>{
    const rawPositions = portfolioData?.flattenedPositions || []
    return rawPositions.slice(0,20)

  }, [portfolioData?.flattenedPositions])
  const profiles = portfolioData?.profiles || []

  const isPositiveOverall = totalReturnPercent >= 0

  const getProfileHead = (c: number) => {
    if (c <= 1) return "Profile you followed"
    return `Profiles you follow`
  }

  const handleRefetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'returns'] })
    ])
  }

  const chartPoints = useMemo(() => returnsData?.data ?? [], [returnsData])

  const latestReturns = useMemo(() => {
    if (chartPoints.length === 0) return 0
    const lastPoint = chartPoints[chartPoints.length - 1]
    return typeof lastPoint?.value === 'number' ? lastPoint.value : 0
  }, [chartPoints])

  const isPositive = latestReturns >= 0

  // Tightened max and min bounds so chart expands vertically to fill available space
  const { maxValue, minValue } = useMemo(() => {
    if (chartPoints.length === 0) return { maxValue: 10, minValue: 0 }
    const values = chartPoints.map((d: ChartData) => d.value)
    const max = Math.max(...values, 0)
    const min = Math.min(...values, 0)

    // Reduced ceiling padding multiplier from 1.2 to 1.02 for minimal vertical whitespace
    const range = Math.abs(max - min) || 1
    const buffer = range * 0.05

    return {
      maxValue: max + buffer,
      minValue: min - buffer,
    }
  }, [chartPoints])

  const handleOnPress = (id: string) => {
    router.navigate(`/(position)/${id}` as Href)
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  // console.log(chartPoints)

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size={'large'} color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
      </View>
    )
  }

  return (
    <ScrollView
      className='flex-1 mx-6'
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefetch}
          colors={[isDark ? Colors.light.primary : Colors.dark.primary]}
          tintColor={isDark ? Colors.light.primary : Colors.dark.primary}
        />
      }
    >
      <View className='mt-4'>
        <Text className='text-3xl font-bold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Portfolio</Text>
      </View>

      <View className='mt-6 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl p-6 gap-y-6'>
        <Text className='text-sm font-bold text-aura-text-muted uppercase'>Total Portfolio Equity</Text>
        <View className='flex-row justify-between mt-3 gap-3 items-end'>
          <Text className='text-3xl font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>₹ {totalEquity ? Number(totalEquity).toLocaleString('en-IN') : '0'}</Text>
          <View className={`flex-row items-center px-1 py-1 rounded-3xl ${totalReturnPercent > 0 ? 'bg-aura-positive/10' : totalReturnPercent == 0 ? 'bg-aura-surface dark:bg-aura-surface-dark' : 'bg-aura-negative/10'}`}>
            <Text className={`font-bold text-sm ${totalReturnPercent > 0 ? 'text-aura-positive' : totalReturnPercent == 0 ? 'text-aura-text-primary dark:text-aura-text-primary-dark' : 'text-aura-negative'}`}>
              {isPositiveOverall ? '+' : '-'}{totalReturnPercent}% {returnsData?.range ? ` (${returnsData?.range}) ` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* CHART CONTAINER */}
      {chartPoints.length == 0 ? null : (<View>
        <View className='bg-aura-surface dark:bg-aura-surface-dark mt-6 rounded-3xl pt-5 pb-2 items-start justify-center overflow-hidden'>
          <Text className={`font-bold text-3xl mb-1 mx-6 ${latestReturns > 0 ? 'text-aura-positive' : latestReturns === 0 ? 'text-aura-text-primary dark:text-aura-text-primary-dark' : 'text-aura-negative'}`}>
            {((isPointerActive ? activeValue ?? latestReturns : latestReturns) >= 0 ? '+' : '')}
            {Number(isPointerActive ? activeValue ?? latestReturns : latestReturns).toFixed(2)}
          </Text>
          <Text className='text-aura-text-muted text-xs mt-1 mx-6'>Cumulative Return ({selectedRange || 'All'})</Text>

          <View className='w-full items-center justify-center overflow-hidden'>
            {isReturnsPending ? (
              <ActivityIndicator size={'small'} color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
            ) : chartPoints.length > 0 ? (
              <LineChart
                key={selectedRange}
                data={chartPoints}
                height={100}
                width={width - 48} // Match screen width minus ScrollView horizontal margins (24px * 2)
                adjustToWidth
                initialSpacing={0}
                endSpacing={0}
                thickness={3}
                color={isPositive ? Colors.dark.positive : Colors.light.negative}
                hideRules
                hideDataPoints
                areaChart
                curved
                startFillColor={isPositive ? 'rgba(34,198,110,0.75)' : 'rgba(239,68,68,0.75)'}
                endFillColor={isPositive ? 'rgba(5, 177, 105, 0)' : 'rgba(207, 32, 47, 0)'}
                startOpacity={0.6}
                endOpacity={0}
                isAnimated={false}
                animationDuration={800}
                animateOnDataChange
                hideAxesAndRules
                yAxisLabelWidth={0}
                yAxisThickness={0}
                xAxisThickness={0}
                hideYAxisText
                maxValue={maxValue}
                mostNegativeValue={minValue}
                disableScroll
                pointerConfig={{
                  pointerStripHeight: 100,
                  pointerStripWidth: 1,
                  // pointerStripUptoDataPoint: true,
                  persistPointer: true,
                  pointerColor: '#fff',
                  pointerStripColor: '#fff',
                  activatePointersOnLongPress: false,
                  pointerEvents: 'auto',
                  pointerVanishDelay: 0,
                  pointerLabelComponent: (items: any[]) => {
                    // if (items && items.length > 0) {
                    //   const activeItem = items[0]

                    //   if (activeItem && typeof activeItem === 'object' && 'value' in activeItem && typeof activeItem.value === 'number') {

                    //     setActiveValue(Number(activeItem?.value))
                    //     setIsPointerActive(true)
                    //   }
                    // }
                    return null
                  },
                  onPointerLeave: () => {
                    setIsPointerActive(false)
                  }
                }}
              />
            ) : (
              <Text className='text-center text-aura-text-secondary dark:text-aura-text-secondary-dark py-6'>No chart data available for this range</Text>
            )}
          </View>
        </View>
        <View className='flex-row justify-between bg-aura-surface dark:bg-aura-surface-dark p-1 rounded-xl mt-4'>
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
                className={`flex-1 items-center justify-center py-2 rounded-lg`}
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
      </View>)}


      {/* PROFILES */}
      <View className='mt-6'>
        {profiles?.length == 0 ? null : <Text className='font-semibold text-xl text-aura-text-primary dark:text-aura-text-primary-dark'>{getProfileHead(profiles.length)}</Text>}
        <View className='flex-row mt-6 flex-wrap justify-between gap-y-4'>
          {profiles && profiles.length > 0 ? (
            profiles.map((item: Profile, index: number) => {
              const { name, profileImage } = item
              return (
                <Pressable
                  key={index}
                  onPress={() => router.navigate(`/(profile)/${item.profileId}/Metrics`)}
                  className='bg-aura-surface dark:bg-aura-surface-dark rounded-3xl p-6 gap-y-4' style={{ width: '48%' }}
                >
                  <View className='w-12 h-12'>
                    <Image
                      source={profileImage ? { uri: profileImage } : undefined}
                      style={{ width: '100%', height: '100%', borderRadius: 100 }}
                      contentFit='cover'
                    />
                  </View>
                  <Text className='font-semibold text-base text-aura-text-primary dark:text-aura-text-primary-dark' numberOfLines={1}>{name}</Text>
                </Pressable>
              )
            })
          ) : profiles.length == 0
            ? (
              <View className='flex-1  items-center justify-center mt-24'>
                <Text className='text-base font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Follow profiles to start copying trades.</Text>
                <View className='mt-9'>
                  <Arrow width={120} height={120} color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} />
                </View>
              </View>

            ) : (
              <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark'>No Profiles</Text>
            )}
        </View>
      </View>

      {/* ACTIVE POSITIONS */}
      <View className='mt-6 mb-10'>
        {portfolioData?.follows?.length == 0 ? null : (<View className='flex-row justify-between items-center'>
          <Text className='text-xl font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>Active Positions</Text>
          {positions.length == 0 ? null : (<Pressable
            onPress={() => router.navigate({ pathname: '/(trade)/Trade', params: { initialStatus: 'open' } })}
            className='rounded-xl py-1 px-3 '
            style={({ pressed }) => [
              pressed && {
                backgroundColor: 'var(--aura-surface)',
              }
            ]}
          >
            {({ pressed }) => (
              <View className={`rounded-xl py-1 px-3 ${pressed ? 'bg-aura-surface dark:bg-aura-surface-dark' : 'bg-transparent'}`}>
                <Text className='font-semibold text-aura-primary'>See all</Text>
              </View>
            )}
          </Pressable>)}
        </View>)}

        {positions && positions.length > 0 ? (
          positions.map((item: Position, index: number) => {
            const rawAvgPrice = Number(item?.avgPrice) || 0
            const rawCurrentPrice = Number(item?.currentPrice) || 0
            const rawUnrealizedPnl = Number(item?.unrealizedPnl) || 0

            const avgPrice = formatter.format(rawAvgPrice)
            const currentPrice = formatter.format(rawCurrentPrice)
            const unrealizedPnl = formatter.format(Math.abs(rawUnrealizedPnl))
            return (
              <Pressable
                key={index}
                className='flex-1 flex-row gap-3 gap-y-4 mt-3 items-center bg-aura-surface dark:bg-aura-surface-dark rounded-3xl p-6'
                onPress={() => handleOnPress(item._id)}
              >
                <View className='w-14 h-14'>
                  <Image
                    source={positions.length > 0 ? { uri: item.profileImage } : undefined}
                    style={{ width: '100%', height: '100%', borderRadius: 100 }}
                    contentFit='cover'
                  />
                </View>
                <View className='flex-1 flex-row justify-between'>
                  <View>
                    <Text className='font-semibold text-base text-aura-text-primary dark:text-aura-text-primary-dark'>{item.symbol}</Text>
                    <Text className='text-sm text-aura-text-secondary dark:text-aura-text-secondary-dark'>₹{avgPrice}</Text>
                  </View>
                  <View className='items-end'>
                    <Text className='font-semibold text-base text-end text-aura-text-primary dark:text-aura-text-primary-dark'>₹{currentPrice}</Text>
                    <Text className={`${rawUnrealizedPnl > 0 ? 'text-aura-positive' : 'text-aura-negative'} text-sm font-semibold`}>
                      {rawUnrealizedPnl > 0 ? '+' : '-'}{unrealizedPnl}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )
          })
        ) : positions.length == 0 ? (
          <Text className='mt-3 text-base font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Your open positions will appear here.</Text>
        ) : (
          <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark mt-2'>No Positions</Text>
        )}
      </View>
    </ScrollView>
  )
}

export default Portfolio