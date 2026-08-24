import { View, Text, Pressable, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import React from 'react'
import { Href, useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Info } from 'lucide-react-native'
import { Image } from 'expo-image'
import { useAuthStore } from '../../../../store/authStore'
import { queryClient } from '@/utils/queryClient'
import { useQuery } from '@tanstack/react-query'
import { getNextRun } from '@/utils/getNextRun'

interface Position {
    _id: string,
    followId: string,
    currentPrice: number,
    symbol: string,
    quantity: number,
    avgPrice: number,
    unrealizedPnl: number
}
interface Follow {
    followId: string,
    profileId: string,
    profileName: string,
    profileImage: string,
    shortIntro: string,
    description: string,
    capitalAllocated: number,
    currentValue: number,
    realizedPnl: number,
    unrealizedPnl: number,
    totalPnl: number,
    returnPercent: number,
    positions: Position[]
}

const fetchFollow = async (id: string, token: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/follow/profile/${id}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    if (!res.ok) throw new Error(`[${res.status}] Failed to fetch profile details`)
    return res.json()
}

const Metrics = () => {
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()
    const { token } = useAuthStore()

    const { data: profileData, isLoading: isProfileLoading, isError: isProfileErr, error: profileErr, isRefetching: isProfileRefetching, refetch: profileRefetch } = useQuery({
        queryKey: ['profile', 'metrics', id],
        queryFn: () => fetchFollow(id, token!),
        enabled: !!id && !!token,
    })

    const follow: Follow = profileData?.follow
    const positions: Position[] = profileData?.positions || []
    const handleRefetch = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['profile', 'metrics', id] })
        ])
    }
    if (isProfileLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-white'>
                <ActivityIndicator size={'large'} color={'#000'} />
            </View>
        )
    }
    const { profileName, profileImage, shortIntro, description } = follow || {}

    const rawCapitalAllocated = Number(follow?.capitalAllocated) || 0
    const rawCurrentValue = Number(follow?.currentValue) || 0
    const rawRealizedPnl = Number(follow?.realizedPnl) || 0
    const rawUnrealizedPnl = Number(follow?.unrealizedPnl) || 0
    const rawTotalPnl = Number(follow?.totalPnl) || 0
    const rawReturnPercent = Number(follow?.returnPercent) || 0

    const formatter = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

    const capitalAllocated = formatter.format(Math.abs(rawCapitalAllocated))
    const currentValue = formatter.format(Math.abs(rawCurrentValue))
    const realizedPnl = formatter.format(Math.abs(rawRealizedPnl))
    const unrealizedPnl = formatter.format(Math.abs(rawUnrealizedPnl))
    const totalPnl = formatter.format(Math.abs(rawTotalPnl))
    const returnPercent = formatter.format(Math.abs(rawReturnPercent))

    const handleOnPress = (id: string) => {
        router.navigate(`/(position)/${id}` as Href)
    }
    const nextRun = getNextRun(profileName)
    // console.log(nextRun, profileName)
    // const 
    if (profileErr) {
        return (
            <View>
                <Text>{profileErr?.message || 'Failed to load profile'}</Text>
                <Pressable onPress={handleRefetch} >
                    <Text>Retry</Text>
                </Pressable>
            </View>)
    }
    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={isProfileRefetching}
                    onRefresh={handleRefetch}
                    colors={['#4A629B']} //android
                    tintColor={'#4A629B'} //ios
                />
            }
            contentContainerStyle={{ paddingBottom: 46 }}
            showsVerticalScrollIndicator={false}
            className='flex-1 mx-6'
        >
            <View className='flex-row gap-3 items-center mt-4 '>
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    className='p-2 -ml-2 rounded-full active:bg-gray-100'
                >
                    <ArrowLeft />
                </Pressable>
                {/* <View></View> */}
                <Text className='flex-1 text-center text-xl  font-aura-bold'>Profile</Text>
                <View className='w-6' />
            </View>

            <View>
                <View className='flex-row gap-3 items-center mt-9 flex-wrap'>
                    <View className='w-20 h-20 rounded-full overflow-hidden shrink-0'>
                        <Image
                            source={profileImage ? { uri: profileImage } : undefined}
                            style={{ width: '100%', height: '100%', borderRadius: 100 }} />
                    </View>
                    <View className='flex-1 min-w-0 shrink'>
                        <Text className='text-3xl font-semibold text-wrap'>{profileName}</Text>
                        <Text className='mt-1 text-base'>{shortIntro}</Text>
                    </View>
                </View>

                <View className='w-full mt-3'>
                    <Text className='text-base  text-gray-600'>{description}</Text>
                </View>

                <View className='bg-gray-100 rounded-3xl mt-6 p-6 gap-3'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-gray-600'>Capital Allocated</Text>
                        <Text className='font-aura-bold text-lg'>₹{capitalAllocated ?? 0.00}</Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-gray-600'>Current Value</Text>
                        <Text className='font-aura-bold text-lg'>₹{currentValue ?? 0.00}</Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-gray-600'>Realized Pnl</Text>
                        <Text className={`font-aura-bold text-lg 
                            ${rawRealizedPnl > 0 ? 'text-green-600' : rawRealizedPnl == 0 ? 'text-gray-900' : 'text-red-600'}`}
                        >
                            {rawRealizedPnl > 0 ? '+' : rawRealizedPnl == 0 ? '' : '-'}₹{realizedPnl ?? 0.00}
                        </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-gray-600'>Unrealized Pnl</Text>
                        <Text className={`font-aura-bold text-lg 
                            ${rawUnrealizedPnl > 0 ? 'text-green-600' : rawUnrealizedPnl == 0 ? 'text-gray-900' : 'text-red-600'}`}
                        >
                            {rawUnrealizedPnl > 0 ? '+' : rawUnrealizedPnl == 0 ? '' : '-'}₹{unrealizedPnl ?? 0.00}
                        </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-gray-600'>total Pnl</Text>
                        <Text className={`font-aura-bold text-lg 
                            ${rawTotalPnl > 0 ? 'text-green-600' : rawTotalPnl == 0 ? 'text-gray-900' : 'text-red-600'}`}
                        >
                            {rawTotalPnl > 0 ? '+' : rawTotalPnl == 0 ? '' : '-'}₹{totalPnl ?? 0.00}
                        </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-gray-600'>Return Percent</Text>
                        <Text className={`font-aura-bold text-lg 
                            ${rawReturnPercent > 0 ? 'text-green-600' : rawReturnPercent == 0 ? 'text-gray-900' : 'text-red-600'}`}
                        >
                            {rawReturnPercent > 0 ? '+' : rawReturnPercent == 0 ? '' : '-'}{returnPercent ?? 0.00}%
                        </Text>
                    </View>
                </View>
                <View className='mt-3'>
                    <Text className=' font-semibold text-lg'>Schedule</Text>
                    <View className='bg-gray-100 rounded-3xl p-6 mt-3 self-start'>
                        <Text className='text-gray-600 font-semibold text-sm'>
                            Next run
                        </Text>
                        <Text className='text-gray-600 font-semibold text-base'>
                            {nextRun?.toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>

                <View>
                    <View className='flex-row items-center justify-between mt-6'>
                        <Text className='font-semibold text-lg'>Current Open positions ({positions.length || 0})</Text>
                        {positions.length == 0 ? null : (<Pressable
                            onPress={() => router.navigate({
                                pathname: '/(trade)/Trade',
                                params: { profileName }
                            })}
                            className='rounded-lg py-1 px-3 active:bg-gray-100'
                        >
                            <Text className='font-semibold  text-[#476eda]'>See all</Text>
                        </Pressable>)}

                    </View>
                    {positions && positions.length > 0 ? (
                        positions.slice(0.20).map((item: Position, index: number) => {

                            const rawAvgPrice = Number(item?.avgPrice) || 0
                            const rawCurrentPrice = Number(item?.currentPrice) || 0
                            const rawUnrealizedPnl = Number(item?.unrealizedPnl) || 0

                            const avgPrice = formatter.format(rawAvgPrice)
                            const currentPrice = formatter.format(rawCurrentPrice)
                            const unrealizedPnl = formatter.format(Math.abs(rawUnrealizedPnl))
                            return (
                                <Pressable
                                    key={index}
                                    className='flex-1 flex-row gap-3 gap-y-4 mt-3 items-center bg-gray-100 rounded-3xl p-6'
                                    onPress={() => handleOnPress(item._id)}
                                >
                                    <View className='w-14 h-14'>
                                        <Image
                                            source={positions.length > 0 ? { uri: profileImage } : undefined}
                                            style={{ width: '100%', height: '100%', borderRadius: 100 }}
                                            contentFit='cover'
                                        />
                                    </View>
                                    <View className='flex-1 flex-row  justify-between'>
                                        <View>
                                            <Text className='font-semibold text-base'>{item.symbol}</Text>
                                            <Text className='text-sm text-gray-600'>₹{avgPrice}</Text>
                                        </View>
                                        <View className='items-end'>
                                            <Text className='font-semibold text-base text-end'>₹{currentPrice}</Text>
                                            <Text className={`${rawUnrealizedPnl > 0 ? 'text-green-600' : 'text-red-600'} text-sm font-semibold`}>{rawUnrealizedPnl > 0 ? '+' : ''}{unrealizedPnl}</Text>

                                        </View>
                                    </View>
                                </Pressable>
                            )
                        })
                    ) : positions.length == 0 ? (
                        <View className='p-6 flex-row items-start  bg-gray-100 rounded-3xl mt-3 gap-3'>
                            <Info size={16} color={'#4b5563'} />
                            <Text className='font-semibold text-gray-600'>You might need to wait for few days to start recieving trades.</Text>
                        </View>
                    ) : (
                        <Text className='mt-3 '>No Positions</Text>
                    )}
                </View>
            </View>
        </ScrollView >
    )
}

export default Metrics