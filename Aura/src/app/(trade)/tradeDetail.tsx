import { View, Text, Pressable, useWindowDimensions, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight } from 'lucide-react-native'
import { LineChart } from 'react-native-gifted-charts'
import { Image } from 'expo-image'
import formatFollowers from '@/utils/format'

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
const TradeSkeleton = ({ router, width, isSkipped }: { router: any, width: number, isSkipped: boolean }) => (
    <View className='flex-1 mx-6 mt-4'>
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
                    key={'trade-title-skeleton'}
                    className='w-32 h-6 bg-gray-200 animate-pulse rounded-md' />
            </View>
            <View className='w-9' />
        </View>

        {isSkipped ? (
            <View>
                <View className='w-full h-36 bg-gray-200 animate-pulse rounded-3xl mt-6' />
            </View>
        ) : (
            <View className='mt-6'>
                <View className='w-24 h-9 bg-gray-200 animate-pulse rounded-md' />
                <View className='flex-row  items-center mt-1'>
                    <View className='w-32 h-6 bg-gray-200 rounded-md animate-pulse' />
                </View>
                <View className='bg-gray-100 mt-6 rounded-3xl h-40 items-center justify-center'>
                    <View className='w-full h-40 bg-gray-200 animate-pulse rounded-3xl' />
                </View>
            </View>
        )}


        {!isSkipped && (
            <View className='mt-6'>
                <Text className='text-xl font-semibold'>Your paper position</Text>
                <View className='w-full h-40 bg-gray-200 animate-pulse rounded-3xl mt-3' />
            </View>
        )}

        <View className='mt-6'>
            <Text className='text-xl font-semibold'>Copy Source</Text>
            <View className='w-full h-24 bg-gray-200 animate-pulse rounded-3xl mt-3 ' />
        </View>
    </View>
)
const tradeDetail = () => {
    const { id: paramsId, status } = useLocalSearchParams()
    const id = typeof paramsId === 'string' ? paramsId : ''
    const { token } = useAuthStore()
    const { width } = useWindowDimensions()
    const router = useRouter()
    const { data, isPending, error } = useQuery({
        queryKey: ['home', 'trade', id],
        queryFn: () => fetchTrade(token, id),
        enabled: !!token && !!id
    })
    if (error) {
        console.log('Error in tradeDetail: ', error)
    }
    const trade = data?.trade || {}
    const isSkipped = isPending ? status === 'skipped' : trade.status === 'skipped'

    if (isPending) {
        return <TradeSkeleton router={router} width={width} isSkipped={isSkipped} />
    }

    const totalValue = (trade?.quantity || 0) * (trade?.currentPrice || 0)
    const unrealizedPnl = parseFloat(trade?.unrealizedPnl) || 0
    const isPositive = unrealizedPnl > 0
    const colorClass = unrealizedPnl === 0 ? 'text-gray-900' : isPositive ? 'text-green-600' : 'text-red-600'
    const chartPoints = data?.returns || []
    const isReturnsPending = data?.isPending || false
    const profileImage = trade?.profile?.profileImage
    const profileName = trade?.profile?.name
    const followCount = trade?.profile?.followCount

    // console.log(trade)

    console.log(JSON.stringify(trade, null, 2))
    const revenue = (trade.quantity || 0) * (trade.exitPrice || 0)
    const cost = (trade.quantity || 0) * (trade.price || 0)
    const profit = revenue - cost
    // console.log(formatFollowers(followCount))
    return (
        <View className='flex-1 mx-6 mt-4'>
            <View className='flex-row items-center '>
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    className='p-2 -ml-2'
                >
                    <ArrowLeft />
                </Pressable>
                <View className='flex-1 justify-center items-center'>
                    <Text className='font-semibold text-xl'>{trade.symbol}</Text>
                </View>
                <View className='w-9' />
            </View>

            <View className='mt-6'>
                {isSkipped ? (
                    <View className='bg-red-100 rounded-3xl p-6'>
                        {/* <Text className='font-semibold text-gray-600'>Profit</Text> */}
                        <Text className='text-3xl font-aura-bold text-red-600 mt-1'>Trade Skipped</Text>
                        <Text className='mt-3 text-base'>This trade was aborted automatically due to market slippage</Text>
                    </View>
                ) : (
                    <View>
                        <Text className='font-semibold text-gray-600'>Profit</Text>
                        <Text className='text-3xl font-aura-bold mt-1'>₹ {profit.toFixed(2)}</Text>
                    </View>
                )}
            </View>

            {!isSkipped && (
                <View className='mt-6'>
                    <Text className='text-xl font-semibold'>Your paper position</Text>
                    <View className='flex-row items-center justify-between bg-gray-100 p-6 rounded-3xl mt-3'>
                        <View className='gap-4'>
                            <View>
                                <Text className='text-sm font-semibold text-gray-600'>Shares Owned</Text>
                                <Text className='font-aura-bold'>{trade.quantity}</Text>
                            </View>
                            <View>
                                <Text className='text-sm font-semibold text-gray-600'>Current Value</Text>
                                <Text className='font-aura-bold'>₹{totalValue.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View className='gap-4 '>
                            <View className='flex-1 items-end'>
                                <Text className='text-sm font-semibold text-gray-600'>Avg Cost</Text>
                                <Text className='font-aura-bold'>{trade.avgPrice}</Text>
                            </View>
                            <View className='flex-1 items-end'>
                                <Text className='text-sm font-semibold text-gray-600'>Total P&L</Text>
                                <Text className={` font-aura-bold ${colorClass}`}>{trade.unrealizedPnl}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}


            <View className='mt-6'>
                <Text className='text-xl font-semibold'>Copy Source</Text>
                <View className='flex-row items-center mt-3 gap-3 bg-gray-100 rounded-3xl p-6'>
                    <View className='w-14 h-14'>
                        <Image
                            source={profileImage ? { uri: profileImage as string } : undefined}
                            style={{ width: '100%', height: '100%', borderRadius: 100 }}
                        />
                    </View>
                    <View>
                        <Text className='text-base font-semibold '>{profileName}</Text>
                        <Text className='text-sm font-semibold text-gray-600'>{formatFollowers(followCount)} {followCount <= 1 ? 'follower' : 'followers'}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
//  LOG  {
//   "_id": "6a7aac597f3c84e12bb616ff",
//   "followId": "6a796787d7901b920e6632d1",
//   "profileId": {
//     "_id": "6a6f1843a7d224731f52f89f",
//     "profileImage": "https://api.dicebear.com/10.x/glass/png?&animationVariant=fast:1&seed=6a6f1843a7d224731f52f89f",
//     "name": "The Insider"
//   },
//   "symbol": "DIVISLAB",
//   "side": "Buy",
//   "quantity": 29,
//   "price": 8373,
//   "status": "skipped",
//   "rejectionReason": "SLIPPAGE_EXCEEDED",
//   "exitPrice": null,
//   "triggerRefId": "6a7a14b36edb0baaadd23792",
//   "createdAt": "2026-08-11T05:00:09.503Z",
//   "updatedAt": "2026-08-11T05:00:09.503Z",
//   "__v": 0
// }
export default tradeDetail