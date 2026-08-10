import { View, Text, ActivityIndicator, FlatList, ScrollView, RefreshControl, useWindowDimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { ApiError } from '@/utils/apiError'
import { Image } from 'expo-image'
import { LineChart } from 'react-native-gifted-charts'
import { queryClient } from '../_layout'

interface Position {
  _id: string,
  symbol: string,
  entryPrice: number,
  profileImage: string,
  currentPrice: number,
  avgPrice:number,
  unrealizedPnl: number,
}
interface ChartData {
  date:string,
  value:number
}

interface Profile {
  profileId: string,
  profileImage: string,
  name: string,
  capitalAllocated: string,
  pnl: string,
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
  const resData = await res.json()
  return resData
}
const fetchReturns = async (token: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/returns`, {
    method: "GET",
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!res.ok) throw new ApiError('Failed to fetch portfolio')
  const resData = await res.json()
  return resData
}


const Portfolio = () => {
  const { token, user } = useAuthStore()

  const { data: portfolioData, isPending: isPortfolioPending, error: portfolioErr, refetch: portfolioRefetch, isRefetching } = useQuery({
    queryKey: ['index', 'portfolio'],
    queryFn: () => fetchPortfolio(token),
    enabled: !!token,
  })
  const { width } = useWindowDimensions()
  const { data: returnsData, isLoading, isPending: isReturnsPending, error: returnsErr, refetch: retunsRefetch, isRefetching: isRetunsRefetch } = useQuery({
    queryKey: ['index', 'returns'],
    queryFn: () => fetchReturns(token),
    enabled: !!token,
  })
  useEffect(() => {
    if (returnsErr) console.log("Error in returns: ", returnsErr)
    if (portfolioErr) console.log("Error in portfolio: ", portfolioErr)
  }, [portfolioErr, returnsErr])


  // console.log(returnsData)
  if (portfolioErr) {
    console.log(`Error: ${portfolioErr.message}`)
  }
  const totalReturnPercent = portfolioData?.totalReturnPercent || 0
  const totalEquity = portfolioData?.totalEquity || 0
  const positions = portfolioData?.flattenedPositions || []
  const profiles = portfolioData?.profiles || []

  const isPositiveOverall = totalReturnPercent >= 0

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size={'large'} color={'#000'} />
      </View>
    )
  }

  const getProfileHead = (c: number) => {
    if (c <= 1) return "Profile you followed"
    return `Profiles you follow`
  }
  const handleRefetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['index', 'portfolio'] }),
      queryClient.invalidateQueries({ queryKey: ['index', 'returns'] })
    ])
  }
const chartPoints = returnsData?.data || []
  const latestReturns = chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].value : 0
  const isPositive = latestReturns >= 0
  
  return (
    <ScrollView
      className='flex-1 mx-6'
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefetch}
          colors={['#4A629B']} //android
          tintColor={'#4A629B'} //ios
        />
      }
    >
      <View className='mt-4'>
        <Text className='text-3xl font-bold'>Portfolio</Text>
      </View>

      <View className='mt-6 bg-gray-100 rounded-3xl p-6 gap-y-6'>
        <Text className='text-sm font-bold text-gray-400 uppercase'>Total Portfolio Equity</Text>
        <View className='flex-row justify-between mt-3 gap-3 items-end'>
          <Text className='text-3xl font-aura-bold'>₹ {totalEquity? Number(totalEquity).toLocaleString('en-IN') : '0'}</Text>
          <View className={`flex-row items-center px-3 py-1 rounded-xl ${isPositiveOverall ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`font-bold text-sm ${isPositiveOverall ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveOverall ? (
                <Text>+</Text>
              ) : (
                <Text>-</Text>
              )
              }{totalReturnPercent}% {returnsData?.range ?` (${returnsData?.range}) `: ''}</Text>
              <Text className='font-bold text-green-600 text-xs align-baseline items-end justify-end'></Text>
          </View>
        </View>
      </View>
      <View className='bg-gray-100 mt-6 rounded-3xl h-40 items-center justify-center'>
        {isReturnsPending ? (
          <ActivityIndicator size={'small'} color={'#000'} />
        ) : chartPoints.length > 0 ? (
          <LineChart
            data={returnsData.data}
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
            hideAxesAndRules
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
                // console.log(items)
              },
            }}
          />
        ) : (
          <Text className='text-center text-gray-400'>No chart data available for this range</Text>
        )}
      </View>
      <View className='mt-6'>
        <Text className='font-semibold text-xl'>{getProfileHead(profiles.length)}</Text>
        <View className='flex-row mt-6 flex-wrap justify-between gap-y-4'>
          {profiles && profiles.length > 0 ? (
            profiles.map((item: Profile) => {
              const { name, profileImage, currentValue } = item
              return (
                <View key={item.name} className='bg-gray-100 rounded-3xl p-6 gap-y-4' style={{ width: '48%' }}>
                  <View className='w-12 h-12 g'>
                    <Image
                      source={profileImage ? { uri: profileImage } : undefined}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 100 }}
                    />
                  </View>
                  <Text className='font-semibold text-base ' numberOfLines={1}>{name}</Text>
                  {/* <View>
                    <Text>₹ {currentValue}</Text>
                    <Text>

                    </Text>
                  </View> */}
                </View>
              )
            })
          ) : (
            <Text>No Profiles</Text>
          )}
        </View>
      </View>
      <View className='mt-6'>
        <Text className='text-xl font-semibold'>Acitve Positions</Text>

        {positions && positions.length > 0 ? (
          positions.map((item: Position) => {
            return (
              <View key={item.symbol} className='flex-1 flex-row gap-3 gap-y-4 mt-3 items-center bg-gray-100 rounded-3xl p-4'>
                <View className='w-14 h-14'>
                  <Image
                    source={positions.length > 0 ? { uri: item.profileImage } : undefined}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 100 }}
                  />
                </View>
                <View className='flex-1 flex-row  justify-between'>
                  <View>
                    <Text className='font-semibold text-base'>{item.symbol}</Text>
                    <Text className='text-sm text-gray-600'>₹ {item.avgPrice}</Text>
                  </View>
                  <View className='items-end'>
                    <Text className='font-semibold text-base text-end'>₹ {item.currentPrice}</Text>
                    <Text className={`${item.unrealizedPnl > 0 ? 'text-green-600' : 'text-red-600'} text-sm font-semibold`}>{item.unrealizedPnl > 0 ? '+' : ''}{item.unrealizedPnl}</Text>

                  </View>
                </View>
              </View>
            )
          })
        ) : (
          <Text>No Positions</Text>
        )}
      </View>
    </ScrollView>
  )
}

export default Portfolio