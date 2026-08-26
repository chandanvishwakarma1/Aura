import { View, Text, Pressable, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import React, { useMemo } from 'react'
import { Href, useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Info } from 'lucide-react-native'
import { Image } from 'expo-image'
import { useAuthStore } from '../../../../store/authStore'
import { queryClient } from '@/utils/queryClient'
import { useQuery } from '@tanstack/react-query'
import { getNextRun } from '@/utils/getNextRun'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

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
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const { token } = useAuthStore()

    const { data: profileData, isLoading: isProfileLoading, isError: isProfileErr, error: profileErr, isRefetching: isProfileRefetching, refetch: profileRefetch } = useQuery({
        queryKey: ['profile', 'metrics', id],
        queryFn: () => fetchFollow(id, token!),
        enabled: !!id && !!token,
    })

    const follow: Follow = profileData?.follow
    const positions = useMemo(() => {
        const rawPositions: Position[] = profileData?.positions || []
        return rawPositions.slice(0, 20)

    }, [profileData?.positions])
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
                    colors={[isDark ? Colors.light.primary : Colors.dark.primary]} //android
                    tintColor={isDark ? Colors.light.primary : Colors.dark.primary} //ios
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

            <View>
                <View className='flex-row gap-3 items-center mt-9 flex-wrap'>
                    <View className='w-20 h-20 rounded-full overflow-hidden shrink-0'>
                        <Image
                            source={profileImage ? { uri: profileImage } : undefined}
                            style={{ width: '100%', height: '100%', borderRadius: 100 }} />
                    </View>
                    <View className='flex-1 min-w-0 shrink'>
                        <Text className='text-3xl font-semibold text-wrap text-aura-text-primary dark:text-aura-text-primary-dark'>{profileName}</Text>
                        <Text className='mt-1 text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>{shortIntro}</Text>
                    </View>
                </View>

                <View className='w-full mt-3'>
                    <Text className='text-base  text-aura-text-secondary dark:text-aura-text-secondary-dark'>{description}</Text>
                </View>

                <View className='bg-aura-surface dark:bg-aura-surface-dark rounded-3xl mt-6 p-6 gap-3'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Capital Allocated</Text>
                        <Text className='font-aura-bold text-lg text-aura-text-primary dark:text-aura-text-primary-dark'>₹{capitalAllocated ?? 0.00}</Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Current Value</Text>
                        <Text className='font-aura-bold text-lg  text-aura-text-primary dark:text-aura-text-primary-dark'>₹{currentValue ?? 0.00}</Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Realized Pnl</Text>
                        <Text className={`font-aura-bold text-lg 
                            ${rawRealizedPnl > 0 ? 'text-aura-positive' : rawRealizedPnl == 0 ? ' text-aura-text-primary dark:text-aura-text-primary-dark' : 'text-aura-negative'}`}
                        >
                            {rawRealizedPnl > 0 ? '+' : rawRealizedPnl == 0 ? '' : '-'}₹{realizedPnl ?? 0.00}
                        </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Unrealized Pnl</Text>
                        <Text className={`font-aura-bold text-lg 
                            ${rawUnrealizedPnl > 0 ? 'text-aura-positive' : rawUnrealizedPnl == 0 ? ' text-aura-text-primary dark:text-aura-text-primary-dark' : 'text-aura-negative'}`}
                        >
                            {rawUnrealizedPnl > 0 ? '+' : rawUnrealizedPnl == 0 ? '' : '-'}₹{unrealizedPnl ?? 0.00}
                        </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>total Pnl</Text>
                        <Text className={`font-aura-bold text-lg 
                            ${rawTotalPnl > 0 ? 'text-aura-positive' : rawTotalPnl == 0 ? 'text-aura-text-primary dark:text-aura-text-primary-dark' : 'text-aura-negative'}`}
                        >
                            {rawTotalPnl > 0 ? '+' : rawTotalPnl == 0 ? '' : '-'}₹{totalPnl ?? 0.00}
                        </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Return Percent</Text>
                        <Text className={`font-aura-bold text-lg 
                            ${rawReturnPercent > 0 ? 'text-aura-positive' : rawReturnPercent == 0 ? 'text-aura-text-primary dark:text-aura-text-primary-dark' : 'text-aura-negative'}`}
                        >
                            {rawReturnPercent > 0 ? '+' : rawReturnPercent == 0 ? '' : '-'}{returnPercent ?? 0.00}%
                        </Text>
                    </View>
                </View>
                <View className='mt-3'>
                    <Text className=' font-semibold text-lg  text-aura-text-primary dark:text-aura-text-primary-dark'>Schedule</Text>
                    <View className='bg-aura-surface dark:bg-aura-surface-dark rounded-3xl p-6 mt-3 self-start'>
                        <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark font-semibold text-sm'>
                            Next run
                        </Text>
                        <Text className='text-aura-text-primary dark:text-aura-text-primary-dark font-semibold text-base'>
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
                        <Text className='font-semibold text-lg text-aura-text-primary dark:text-aura-text-primary-dark'>Current Open positions ({positions.length || 0})</Text>
                        {positions.length == 0 ? null : (<Pressable
                            onPress={() => router.navigate({ pathname: '/(trade)/Trade', params: { profileName } })}
                            className=' rounded-xl py-1 px-3 '
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
                                    className='flex-1 flex-row gap-3 gap-y-4 mt-3 items-center bg-aura-surface dark:bg-aura-surface-dark rounded-3xl p-6'
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
                                            <Text className='font-semibold text-base text-aura-text-primary dark:text-aura-text-primary-dark'>{item.symbol}</Text>
                                            <Text className='text-sm text-aura-text-secondary dark:text-aura-text-secondary-dark'>₹{avgPrice}</Text>
                                        </View>
                                        <View className='items-end'>
                                            <Text className='font-semibold text-base text-end text-aura-text-primary dark:text-aura-text-primary-dark'>₹{currentPrice}</Text>
                                            <Text className={`${rawUnrealizedPnl > 0 ? 'text-aura-positive' : 'text-aura-negative'} text-sm font-semibold`}>{rawUnrealizedPnl > 0 ? '+' : ''}{unrealizedPnl}</Text>

                                        </View>
                                    </View>
                                </Pressable>
                            )
                        })
                    ) : positions.length == 0 ? (
                        <View className='p-6 flex-row items-start  bg-aura-surface dark:bg-aura-surface-dark rounded-3xl mt-3 gap-3'>
                            <Info size={16} color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
                            <Text className='font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>You might need to wait for few days to start recieving trades.</Text>
                        </View>
                    ) : (
                        <Text className='mt-3 text-aura-text-secondary dark:text-aura-text-secondary-dark'>No Positions</Text>
                    )}
                </View>
            </View>
        </ScrollView >
    )
}

export default Metrics