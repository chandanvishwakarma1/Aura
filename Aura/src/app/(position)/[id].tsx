import { View, Text, Pressable, useWindowDimensions, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownRight, ArrowLeft, ArrowUpRight } from 'lucide-react-native'
import { LineChart } from 'react-native-gifted-charts'
import { Image } from 'expo-image'
import formatFollowers from '@/utils/format'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'


const fetchPosition = async (token: string, id: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/position/${id}`, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    const resData = await res.json()
    return resData
}
const fetchTrade = async (token: string, id: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/trade/${id}`, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    const resData = await res.json()
    return resData
}
const PositionSkeleton = ({ router, width }: { router: any, width: number }) => (
    <View className='flex-1 mx-6 mt-9'>
        <View className='flex-row items-center '>
            <Pressable
                onPress={() => router.back()}
                hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
                className='p-2 -ml-2'
            >
                <ArrowLeft />
            </Pressable>
            <View className='flex-1 justify-center items-center'>
                <View
                    key={'position-title-skeleton'}
                    className='w-32 h-6 bg-gray-200 animate-pulse rounded-md' />
            </View>
            <View className='w-9' />
        </View>

        <View className='mt-6'>
            <View className='w-24 h-9 bg-gray-200 animate-pulse rounded-md' />
            <View className='flex-row justify-between items-end'>
                <View className='flex-row  items-center mt-1'>
                    <View className='w-32 h-6 bg-gray-200 rounded-md animate-pulse' />
                </View>
                <View className=''>
                    <View className='w-16 h-6 rounded-md animate-pulse bg-gray-200' />
                </View>
            </View>
        </View>

        <View className='mt-6'>
            <Text className='text-xl font-semibold'>Your paper position</Text>
            <View className='w-full h-36 bg-gray-200 animate-pulse rounded-3xl mt-3' />
        </View>
        <View className='w-56 h-20 rounded-3xl bg-gray-200 mt-3 animate-pulse' />

        <View className='mt-6'>
            <Text className='text-xl font-semibold'>Copy Source</Text>
            <View className='w-full h-24 bg-gray-200 animate-pulse rounded-3xl mt-3 ' />
        </View>
    </View>
)
const PositionDetail = () => {
    const { id: paramsId } = useLocalSearchParams()
    const id = typeof paramsId === 'string' ? paramsId : ''
    const { token } = useAuthStore()
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const { width } = useWindowDimensions()
    const router = useRouter()
    const { data, isPending, error: posErr } = useQuery({
        queryKey: ['home', 'position', id],
        queryFn: () => fetchPosition(token, id),
        enabled: !!token && !!id,
        refetchOnWindowFocus: true,
        gcTime: 1000 * 60 * 10, //10 min
        staleTime: 1000 * 15 //15 sec
    })
    useEffect(() => {
        if (posErr) console.log('Error in PositionDetail: ', posErr)
    }, [posErr])


    // const isPending =false

    if (isPending) {
        return <PositionSkeleton router={router} width={width} />
    }

    const position = data?.position || {}
    const profile = position?.profile || {}

    const quantity = position.quantity || 0
    const avgPrice = position.avgPrice || 0
    const totalCost = quantity * avgPrice
    const currentPrice = Number(position.currentPrice) || avgPrice
    const totalValue = (quantity) * (currentPrice)

    const rawPnl = position.unrealizedPnl ?? 0
    const unrealizedPnl = parseFloat(rawPnl) || 0
    const totalReturn = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0


    const todaysChangePercent = parseFloat(position.todaysChangePercent) || 0
    const isTodayPositive = todaysChangePercent >= 0

    const isOverallPositive = unrealizedPnl >= 0
    const absPnl = Math.abs(unrealizedPnl)

    const openDate = new Date(position.createdAt)
    // console.log(openDate)


    const profileImage = profile?.profileImage
    const profileName = profile?.name || 'Unknown Profile'
    const followCount = profile?.followCount || 0

    const formatter = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
    // console.log(isTodayPositive)
    // console.log(JSON.stringify(position, null, 2))
    // console.log(formatFollowers(followCount))
    return (
        <View className='flex-1 mx-6 mt-9'>

            <View className='flex-row items-center '>
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
                    <Text className='text-xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>{position.symbol}</Text>
                </View>
            </View>
            <View className='flex-row justify-between items-end'>

                <View className='mt-6'>
                    <Text className='text-3xl font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>₹ {currentPrice.toFixed(2)}</Text>
                    <View className='flex-row  items-center mt-1'>
                        {isTodayPositive === true && (
                            <ArrowUpRight color={isDark ? Colors.dark.positive : Colors.light.positive} strokeWidth={3} />
                        )}
                        {isTodayPositive === false && (
                            <ArrowDownRight color={isDark ? Colors.dark.negative : Colors.light.negative} strokeWidth={3} />
                        )}
                        <Text className={`font-semibold text-sm ${isTodayPositive ? 'text-aura-positive' : 'text-aura-negative'}`}>{isTodayPositive ? '+' : ''}{todaysChangePercent.toFixed(2)}% (today)</Text>
                    </View>
                </View>
                <View className='py-1 px-3 bg-aura-surface dark:bg-aura-surface-dark rounded-lg'>
                    <Text className='font-aura-bold text-aura-positive'>Open</Text>
                </View>
            </View>

            <View className='mt-6'>
                <Text className='text-xl font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>Your paper position</Text>
                <View className='flex-row items-center justify-between bg-aura-surface dark:bg-aura-surface-dark p-6 rounded-3xl mt-3'>
                    <View className='gap-4'>
                        <View>
                            <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Shares Owned</Text>
                            <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>{Number(quantity).toLocaleString('en-IN')}</Text>
                        </View>
                        <View>
                            <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark '>Current Value</Text>
                            <Text className='font-aura-bold  text-aura-text-primary dark:text-aura-text-primary-dark'>₹{Number(totalValue.toFixed(2)).toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                    <View className='gap-4 '>
                        <View className='flex-1 items-end'>
                            <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Avg Cost</Text>
                            <Text className='font-aura-bold  text-aura-text-primary dark:text-aura-text-primary-dark'>{Number(avgPrice.toFixed(2)).toLocaleString('en-IN')}</Text>
                        </View>
                        <View className='flex-1 items-end'>
                            <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Total P&L</Text>
                            <Text className={` font-aura-bold ${isOverallPositive ? 'text-aura-positive' : 'text-aura-negative'}`}>{isOverallPositive ? '+' : '-'}₹{Number(absPnl.toFixed(2)).toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* <Text className='mt-6 text-xl font-semibold'>TimeFrame</Text> */}
            <View className='p-6 mt-3 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl self-start'>
                <Text className='text-xs text-aura-text-secondary dark:text-aura-text-secondary-dark font-semibold'>Opened At</Text>
                <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>
                    {openDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    })}
                </Text>
            </View>

            <View className='mt-6'>
                <Text className='text-xl font-semibold  text-aura-text-primary dark:text-aura-text-primary-dark'>Copy Source</Text>
                <View className='flex-row items-center mt-3 gap-3 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl p-6'>
                    <View className='w-14 h-14'>
                        {profileImage && <Image
                            source={profileImage ? { uri: profileImage as string } : undefined}
                            style={{ width: '100%', height: '100%', borderRadius: 100 }}
                        />}
                    </View>
                    <View>
                        <Text className='text-base font-semibold  text-aura-text-primary dark:text-aura-text-primary-dark'>{profileName}</Text>
                        {/* <Text className='text-sm font-semibold text-gray-600'>{formatFollowers(followCount)} {followCount === 1 ? 'follower' : 'followers'}</Text> */}
                        <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>
                            {'Bought'} {position.quantity} shares of {position.symbol}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
// LOG  {
//   "_id": "6a756bf43f38d8130ddab671",
//   "symbol": "APOLLOPIPE",
//   "quantity": 477,
//   "avgPrice": 523.2,
//   "currentPrice": 523.2,
//   "createdAt": "2026-08-07T05:24:04.758Z",
//   "updatedAt": "2026-08-07T05:24:04.758Z",
//   "follow": {
//     "_id": "6a74795b50f01596cf9f4984",
//     "profileId": "6a74795b50f01596cf9f4984"
//   },
//   "profile": {
//     "_id": "6a6f1843a7d224731f52f8a0",
//     "name": "The Whale",
//     "profileImage": "https://api.dicebear.com/10.x/glass/png?&animationVariant=fast:1&seed=6a6f1843a7d224731f52f8a0",
//     "unrealizedPnl": "-7226.55",
//     "followCount": 2
//   }
// }
export default PositionDetail