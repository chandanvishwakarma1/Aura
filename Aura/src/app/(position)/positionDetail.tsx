import { View, Text, Pressable, useWindowDimensions, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight } from 'lucide-react-native'
import { LineChart } from 'react-native-gifted-charts'
import { Image } from 'expo-image'
import formatFollowers from '@/utils/format'


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
const positionDetail = () => {
    const { id: paramsId } = useLocalSearchParams()
    const id = typeof paramsId === 'string' ? paramsId : ''
    const { token } = useAuthStore()
    const { width } = useWindowDimensions()
    const router = useRouter()
    const { data, isPending, error: posErr } = useQuery({
        queryKey: ['home', 'position', id],
        queryFn: () => fetchPosition(token, id),
        enabled: !!token && !!id
    })
    useEffect(() => {
        if (posErr) console.log('Error in positionDetail: ', posErr)
    }, [posErr])


    const PositionSkeleton = ({ router, width }: { router: any, width: number }) => (
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
                        key={'position-title-skeleton'}
                        className='w-32 h-6 bg-gray-200 animate-pulse rounded-md' />
                </View>
                <View className='w-9' />
            </View>

            <View className='mt-6'>
                <View className='w-24 h-9 bg-gray-200 animate-pulse rounded-md' />
                <View className='flex-row  items-center mt-1'>
                    <View className='w-32 h-6 bg-gray-200 rounded-md animate-pulse' />
                </View>
                <View className='bg-gray-100 mt-6 rounded-3xl h-40 items-center justify-center'>
                    <View className='w-full h-40 bg-gray-200 animate-pulse rounded-3xl' />
                </View>
            </View>

            <View className='mt-6'>
                <Text className='text-xl font-semibold'>Your paper position</Text>
                <View className='w-full h-40 bg-gray-200 animate-pulse rounded-3xl mt-3' />
            </View>

            <View className='mt-6'>
                <Text className='text-xl font-semibold'>Copy Source</Text>
                <View className='w-full h-24 bg-gray-200 animate-pulse rounded-3xl mt-3 ' />
            </View>
        </View>
    )

    if (isPending) {
        return <PositionSkeleton router={router} width={width} />
    }

    const profile = data?.profile || {}
    const position = data?.position || {}
    const totalValue = (position?.quantity || 0) * (position?.currentPrice || 0)
    const unrealizedPnl = parseFloat(position?.unrealizedPnl) || 0
    const isPositive = unrealizedPnl > 0
    const colorClass = unrealizedPnl === 0 ? 'text-gray-900' : isPositive ? 'text-green-600' : 'text-red-600'
    const chartPoints = data?.returns || []
    const isReturnsPending = data?.isPending || false
    const profileImage = position?.profile?.profileImage
    const profileName = position?.profile?.name
    const followCount = position?.profile?.followCount

    // console.log(JSON.stringify(position, null,2))
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
                    <Text className='font-semibold text-xl'>{position.symbol}</Text>
                </View>
                <View className='w-9' />
            </View>

            <View className='mt-6'>
                <Text className='text-3xl font-aura-bold'>₹ {position.currentPrice}</Text>
                <View className='flex-row  items-center mt-1'>
                    <ArrowUpRight color={'green'} strokeWidth={3} />
                    <Text className='font-semibold text-sm text-green-600'>+32% (today)</Text>
                </View>
                <View className='bg-gray-100 mt-6 rounded-3xl h-40 items-center justify-center'>
                    {isReturnsPending ? (
                        <ActivityIndicator size={'small'} color={'#000'} />
                    ) : chartPoints.length > 0 ? (
                        <LineChart
                            // data={returnsData.data}
                            height={160}
                            width={width}
                            adjustToWidth
                            initialSpacing={0}
                            endSpacing={0}
                            thickness={3}
                            // color={isPositive ? '#4671ED' : '#ef4444'}
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
                            // maxValue={Math.max(...chartPoints.map((d: ChartData) => d.value), 0) * 1.05}
                            // mostNegativeValue={Math.min(...chartPoints.map((d: ChartData) => d.value), 0) * 1.05}
                            disableScroll
                            pointerConfig={{
                                pointerStripHeight: 180,
                                pointerStripWidth: 1,
                                pointerStripUptoDataPoint: true,
                                pointerColor: '#fff',
                                pointerStripColor: '#fff',
                                activatePointersOnLongPress: false,
                                pointerVanishDelay: 0,
                                // pointerLabelComponent: (items: ChartData[]) => {
                                //   // Update the "Return" stat card live without rendering a tooltip
                                //   // console.log(items)
                                // },
                            }}
                        />
                    ) : (
                        <Text className='text-center text-gray-400'>No chart data available for this range</Text>
                    )}
                </View>
            </View>

            <View className='mt-6'>
                <Text className='text-xl font-semibold'>Your paper position</Text>
                <View className='flex-row items-center justify-between bg-gray-100 p-6 rounded-3xl mt-3'>
                    <View className='gap-4'>
                        <View>
                            <Text className='text-sm font-semibold text-gray-600'>Shares Owned</Text>
                            <Text className='font-aura-bold'>{position.quantity}</Text>
                        </View>
                        <View>
                            <Text className='text-sm font-semibold text-gray-600'>Current Value</Text>
                            <Text className='font-aura-bold'>₹{totalValue.toFixed(2)}</Text>
                        </View>
                    </View>
                    <View className='gap-4 '>
                        <View className='flex-1 items-end'>
                            <Text className='text-sm font-semibold text-gray-600'>Avg Cost</Text>
                            <Text className='font-aura-bold'>{position.avgPrice}</Text>
                        </View>
                        <View className='flex-1 items-end'>
                            <Text className='text-sm font-semibold text-gray-600'>Total P&L</Text>
                            <Text className={` font-aura-bold ${colorClass}`}>{position.unrealizedPnl}</Text>
                        </View>
                    </View>
                </View>
            </View>

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
export default positionDetail