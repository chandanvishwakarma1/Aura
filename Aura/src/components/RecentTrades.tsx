import { View, Text, Pressable, ActivityIndicator, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { formatTime } from '../utils/format'
import { Image } from 'expo-image'
import { Href, useRouter } from 'expo-router'
import { getNextRun } from '@/utils/getNextRun'
import { useTheme } from '@/lib/ThemeContext'

const fetchTrades = async (token: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/recentTrades`, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
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
const RecentTrades = () => {
    const { token } = useAuthStore()
    const router = useRouter()
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const { data, isPending, error } = useQuery({
        queryKey: ['home', 'trades'],
        queryFn: () => fetchTrades(token),
        enabled: !!token
    })
    if (error) {
        console.log("Error in recentTrades: ", error)
    }


    if (isPending) {
        return (
            <View className='mt-3 gap-3'>
                <Shimmer className='w-full h-28 rounded-3xl bg-aura-surface-elevated dark:bg-aura-surface-elevated-dark' />
                <Shimmer className='w-full h-28 rounded-3xl bg-aura-surface-elevated dark:bg-aura-surface-elevated-dark' />
            </View>
        )
    }
    const trades = data?.trades || []
    if (trades.length === 0) {
        return (
            <View>
                <Text className='text-xl font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>Recent Trades</Text>
                <Text className='text-base text-aura-text-secondary dark:text-aura-text-secondary-dark font-semibold mt-3'>Your recent trades will appear here.</Text>
            </View>
        )
    }
    const handleOnPress = (id: string, status: string) => {
        const path = status === 'open' ? `/(position)/${id}` : `/(trade)/${id}`
        // console.log(path, status, id)
        router.navigate(path as Href)
    }
    return (
        <View className='gap-4 mt-3'>
            <View className='flex-row items-center justify-between'>
                <Text className='text-xl font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>Recent Trades</Text>
                {<Pressable
                    onPress={() => router.navigate('/(trade)/Trade')}
                    className=' rounded-xl py-1 px-3'
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
                </Pressable>}
            </View>
            {trades && trades.length > 0 && (
                trades.map((item: any) => {
                    const totalValue = (item?.price || 0) * (item?.quantity || 0)
                    const url = item?.profileId?.profileImage
                    const name = item?.symbol
                    const isSkipped = item?.status === 'skipped'
                    // console.log(item.status)
                    const id = item.status === 'open' ? item.positionId : item._id


                    return (
                        <Pressable
                            className={`flex-row items-center  bg-aura-surface dark:bg-aura-surface-dark gap-3 rounded-3xl p-6 ${isSkipped ? 'opacity-70 border border-dashed border-aura-border-dark dark:border-aura-border' : ''}`}
                            key={item._id}
                            onPress={() => handleOnPress(id, item.status)}
                        >
                            <View className='w-14 h-14 rounded-full overflow-hidden shrink-0'>
                                <Image
                                    source={url ? { uri: url } : undefined}
                                    style={{ width: '100%', height: '100%', borderRadius: 100 }} contentFit='cover'
                                />
                            </View>
                            <View className='flex-1 ml-3 pr-2 gap-y-0.6'>
                                <Text numberOfLines={1} className='text-base font-bold tracking-tight text-aura-text-primary dark:text-aura-text-primary-dark'>{name}</Text>
                                <Text className='text-xs text-aura-text-secondary dark:text-aura-text-secondary-dark font-semibold' numberOfLines={1}>
                                    {item.side === 'Buy' ? 'Bought' : 'Sold'}
                                    {' '}{(item.quantity).toLocaleString('en-IN')} shares of
                                    <Text className='text-base font-bold text-aura-text-secondary dark:text-aura-text-secondary-dark'> {item.symbol}</Text>
                                </Text>
                            </View>
                            <View className='shrink-0 gap-y-1 items-end'>
                                <Text className='text-sm font-bold text-aura-text-secondary dark:text-aura-text-secondary-dark uppercase tracking-wider'>{formatTime(item.createdAt)}</Text>
                                <Text className='text-sm font-extrabold text-aura-text-primary dark:text-aura-text-primary-dark'>₹{totalValue ? totalValue.toLocaleString('en-IN') : '0'}</Text>
                            </View>
                        </Pressable>
                    )
                })
            )}
        </View>
    )
}
// {
//       "_id": "6a7571dc3f38d8130ddab818",
//       "followId": "6a74795b50f01596cf9f4984",
//       "profileId": "6a6f1843a7d224731f52f8a0",
//       "symbol": "CREDITACC",
//       "side": "Buy",
//       "quantity": 163,
//       "price": 1529,
//       "status": "skipped",
//       "rejectionReason": "SLIPPAGE_EXCEEDED",
//       "exitPrice": null,
//       "triggerRefId": "6a751f47cce45b60d3df5ddf",
//       "createdAt": "2026-08-07T05:49:16.469Z",
//       "updatedAt": "2026-08-07T05:49:16.469Z",
//       "__v": 0
//     },
export default RecentTrades