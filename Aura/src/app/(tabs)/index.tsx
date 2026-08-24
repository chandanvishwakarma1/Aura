import { Animated, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/utils/apiError'
import { useEffect, useRef } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native'
import { queryClient } from '@/utils/queryClient'
import { useRouter } from 'expo-router'
import ProfileCard from '@/components/ProfileCard'
import RecentTrades from '@/components/RecentTrades'
import Arrow from '@/assets/Arrow.svg'

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
  if (!res.ok) throw new ApiError('Failed to fetch profiles')
  const resData = await res.json()
  return resData
}

const Shimmer = ({ className }: { className: string }) => {
  const opacity = useRef(new Animated.Value(0.4)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])
  return <Animated.View style={{ opacity }} className={className} />
}

const HomeSkeleton = () => (
  <View className=''>
    <Shimmer className='w-full h-[144px] bg-gray-200 rounded-3xl mt-6' />
  </View>
)

const ProfileSkeleton = () => (
  <View className='mt-3 gap-3 flex-row'>
    <Shimmer className='w-[56%] h-56 bg-gray-200 rounded-3xl' />
    <Shimmer className='w-[100%] h-56 bg-gray-200 rounded-3xl' />
  </View>
)

const Index = () => {
  const { token } = useAuthStore()
  const router = useRouter()

  const { data: portfolioData, error: portfolioErr, isRefetching: isPortfolioRefetching } = useQuery({
    queryKey: ['index', 'portfolio'],
    queryFn: () => fetchPortfolio(token),
    enabled: !!token,
  })

  const { data: homeData, isPending: isHomePending, error: homeErr, isRefetching: isHomeRefetch } = useQuery({
    queryKey: ['index', 'home'],
    queryFn: () => fetchHome(token),
    enabled: !!token,
  })

  const { data: profileData, isPending: isProfilePending, error: profileErr, isRefetching: isProfileRefetch } = useQuery({
    queryKey: ['index', 'profiles'],
    queryFn: () => fetchProfiles(token),
    enabled: !!token,
  })

  useEffect(() => {
    if (portfolioErr) console.log("Error in portfolio: ", portfolioErr)
    if (homeErr) console.log("Error in home: ", homeErr)
    if (profileErr) console.log("Error in profiles: ", profileErr)
  }, [portfolioErr, homeErr, profileErr])

  const isAnyQueryRefetching = isHomeRefetch || isPortfolioRefetching || isProfileRefetch
  const totalEquity = portfolioData?.totalEquity || 0
  const todayPercentChange = homeData?.todayPercentChange
  const todayAmountChange = homeData?.todayAmountChange

  const handleRefetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['index', 'portfolio'] }),
      queryClient.invalidateQueries({ queryKey: ['index', 'home'] }),
      queryClient.invalidateQueries({ queryKey: ['index', 'profiles'] })
    ])
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

      {isHomePending ? (
        <HomeSkeleton />
      ) : (
        <View className='mt-6 bg-gray-100 rounded-3xl p-6'>
          <Text className='text-sm font-bold text-gray-400 uppercase'>Total Portfolio Equity</Text>

          <View className='mt-9'>
            {homeData && typeof todayAmountChange === 'number' && (
              <View className='flex-row items-center gap-1 mt-1'>
                {todayAmountChange > 0 && (
                  <ArrowUpRight size={16} color={'green'} strokeWidth={3} />
                )}
                {todayAmountChange < 0 && (
                  <ArrowDownRight size={16} color={'red'} strokeWidth={3} />
                )}
                <View className='flex-row flex-1 justify-between'>
                  <Text
                    className={`text-sm font-semibold ${todayAmountChange > 0 ? 'text-green-600' : todayAmountChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {todayAmountChange > 0 ? '+' : ''} ₹{todayAmountChange === 0 ? '0.00' : todayAmountChange.toFixed(2)} (today)
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className='flex-row justify-between gap-3 items-end'>
            <Text className='text-3xl font-aura-bold'>
              ₹ {totalEquity ? Number(totalEquity).toLocaleString('en-IN') : '0'}
            </Text>
            {typeof todayPercentChange === 'number' && (
              <View
                className={`px-3 py-1 ${todayPercentChange > 0 ? 'bg-green-100' : todayPercentChange < 0 ? 'bg-red-100' : 'bg-gray-200'} rounded-xl`}>
                <Text
                  className={`font-bold ${todayPercentChange > 0 ? 'text-green-600' : todayPercentChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {todayPercentChange > 0 ? '+' : ''}{todayPercentChange}%
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className='flex-row justify-between items-center mt-6'>
        <Text className='text-xl font-semibold'>Top Profiles</Text>
        <Pressable
          onPress={() => router.navigate('/(tabs)/discover')}
          className=' rounded-xl py-1 px-3 active:bg-gray-100'
        >
          <Text className=' font-semibold text-[#476eda]'>See all</Text>
        </Pressable>
      </View>

      {isProfilePending ? (
        <ProfileSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16 }}
          className='mt-3'
        >
          {profileData && profileData?.length > 0 && (
            profileData.map((item: any) => {
              return (
                <ProfileCard item={item} key={item._id || item.name} />
              )
            })
          )}
        </ScrollView>
      )}
  
      {portfolioData?.follows.length == 0
        ? (
          <View className='flex-1  items-center justify-center mt-24'>
            <Text className='text-base font-semibold text-gray-600'>Follow profiles to start copying trades.</Text>
            <View className='mt-9'>
              <Arrow width={120} height={120}  />
            </View>
          </View>
        ) :  (
        <View className='mt-6'>
          <RecentTrades />
        </View>)}
    </ScrollView>
  )
}

export default Index