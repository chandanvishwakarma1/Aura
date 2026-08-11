import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useAuthStore } from '../../../store/authStore'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { ApiError } from '@/utils/apiError'
import { LineChart } from 'react-native-gifted-charts'
import { useEffect } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native'
import { Image } from 'expo-image'
import formatFollowers from '@/utils/format'
import { queryClient } from '../_layout'
import { useRouter } from 'expo-router'
import ProfileCard from '@/components/ProfileCard'
import RecentTrades from '@/components/RecentTrades'
type ChartData = {
  value: number
}
type Home = {
  todayAmountChange: number,
  todayPercentChange: number,
  activeCopies: number,
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
  if (!res.ok) throw new ApiError('Failed to fetch retunes')
  const resData = await res.json()
  return resData
}

const fetchHome = async (token: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/home`, {
    method: "GET",
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!res.ok) throw new ApiError('Failed to fetch home')
  const resData = await res.json()
  return resData
}

const fetchProfiles = async (token: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/`, {
    method: "GET",
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  if (!res.ok) throw new ApiError('Failed to fetch home')
  const resData = await res.json()
  return resData
}


const Index = () => {
  const { logOut, user, token } = useAuthStore();
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = screenWidth * 0.48
  const router = useRouter()
  const { data: portfolioData, isPending: isPortfolioPending, error: portfolioErr, refetch: portfolioRefetch, isRefetching: isPortfolioRefetching } = useQuery({
    queryKey: ['index', 'portfolio'],
    queryFn: () => fetchPortfolio(token),
    enabled: !!token,
  })

  const { data: returnsData, isLoading, isPending: isReturnsPending, error: returnsErr, refetch: retunsRefetch, isRefetching: isRetunsRefetch } = useQuery({
    queryKey: ['index', 'returns'],
    queryFn: () => fetchReturns(token),
    enabled: !!token,
  })



  const { data: homeData, isLoading: isHomeLoading, isPending: isHomePending, error: homeErr, refetch: homeRefetch, isRefetching: isHomeRefetch } = useQuery({
    queryKey: ['index', 'home'],
    queryFn: () => fetchHome(token),
    enabled: !!token,
  })
  const { data: profileData, isLoading: isProfileLoading, isPending: isProfilePending, error: profileErr, refetch: ProfileRefetch, isRefetching: isProfileRefetch } = useQuery({
    queryKey: ['index', 'profiles'],
    queryFn: () => fetchProfiles(token),
    enabled: !!token,
  })

  useEffect(() => {
    if (returnsErr) console.log("Error in returns: ", returnsErr)
    if (portfolioErr) console.log("Error in portfolio: ", portfolioErr)
    if (homeErr) console.log("Error in home: ", homeErr)
  }, [portfolioErr, returnsErr, homeErr])

  const isAnyQueryRefetching = isHomeRefetch || isRetunsRefetch || isPortfolioRefetching || isProfileRefetch
  const totalReturnPercent = portfolioData?.totalReturnPercent || 0
  const totalEquity = portfolioData?.totalEquity || 0
  // const positions = data?.flattenedPositions || []
  // const profiles = data?.profiles || []
  // console.log(JSON.stringify(portfolioData, null, 2))

  const isPositiveOverall = totalReturnPercent >= 0


  const handleRefetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['index', 'portfolio'] }),
      queryClient.invalidateQueries({ queryKey: ['index', 'returns'] }),
      queryClient.invalidateQueries({ queryKey: ['index', 'home'] }),
      queryClient.invalidateQueries({ queryKey: ['index', 'profiles'] })
    ])
  }
  // console.log(JSON.stringify(profileData, null, 2))
  const handlePress = (id: string) => {
    router.navigate({
      pathname: ('/(profile)/profileDetail'),
      params: { id }
    })
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className='flex-1 mx-6'
      refreshControl={
        <RefreshControl
          refreshing={isAnyQueryRefetching}
          onRefresh={handleRefetch}
          colors={['#4A629B']} //android
          tintColor={'#4A629B'} //ios
        />
      }
    >
      <View className='mt-4'>
        <Text className='text-3xl font-bold'>Aura</Text>
      </View>

      <View className='mt-6 bg-gray-100 rounded-3xl p-6'>
        <Text className='text-sm font-bold text-gray-400 uppercase'>Total Portfolio Equity</Text>

        <View className='mt-9'>
          {homeData && typeof homeData?.todayAmountChange === 'number' && (
            <View className='flex-row items-center gap-1 mt-1'>
              {homeData.todayAmountChange > 0 ? (
                <ArrowUpRight size={16} color={'green'} strokeWidth={3} />
              ) : (
                <ArrowDownRight size={16} color={'red'} strokeWidth={3} />
              )}
              <View className='flex-row flex-1 justify-between'>

                <Text className={`text-sm font-semibold ${homeData.todayAmountChange > 0 ? 'text-green-600' : 'text-red-600'}`}>{homeData.todayAmountChange > 0 ? '+' : ''} ₹{homeData.todayAmountChange} (today)</Text>
              </View>
            </View>
          )}
        </View>
        <View className='flex-row justify-between  gap-3 items-end'>
          <Text className='text-3xl font-aura-bold'>₹ {totalEquity ? Number(totalEquity).toLocaleString('en-IN') : '0'}</Text>
          {homeData?.todayPercentageChange && (<View className='bg-green-100 rounded-xl px-3 py-1 align-baseline'>
            <Text className='font-bold text-green-600'>
              {isPositiveOverall ? (
                <Text>+</Text>
              ) : (
                <Text>-</Text>
              )
              }{homeData.todayPercentChange}%</Text>
          </View>)}
        </View>
      </View>
      <View className='flex-row justify-between items-center'>
        <Text className='text-xl font-semibold mt-6 '>Top Profiles</Text>
        <Pressable className='' onPress={()=> router.navigate('/(tabs)/discover')}>
          <Text className='text-lg font-semibold mt-6 text-[#47BEDA]'>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
        className='mt-3'
      >
        {profileData && profileData.length > 0 && (
          profileData.map((item: any) => {
            return (
              <ProfileCard item={item} key={item._id || item.name} />
            )
          })
        )}
      </ScrollView>
      <View className='mt-6'>
        <Text className='text-xl font-semibold'>Recent Trades</Text>
        <RecentTrades />
      </View>
    </ScrollView>
  )
}

export default Index

const styles = StyleSheet.create({})