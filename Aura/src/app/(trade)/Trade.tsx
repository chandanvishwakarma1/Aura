import { View, Text, Pressable, FlatList, RefreshControl, ActivityIndicator, Animated, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ListFilter, Search, X } from 'lucide-react-native'
import { Href, useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../../store/authStore'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { formatTime } from '@/utils/format'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { MenuView } from '@expo/ui/community/menu'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

interface Trade {
    _id: string,
    symbol: string,
    side: 'Buy' | 'Sell',
    quantity: number,
    price: number,
    status: 'open' | 'closed' | 'skipped',
    profileId: {
        _id: string,
        profileImage: string,
        name: string
    },
    pnlAtClose?: number,
    exitPrice?: number,
    positionId?: string,
    rejectionReason?: string,
    createdAt: string
}
type FilterStatus = 'all' | 'open' | 'closed' | 'skipped'
const fetchTrades = async (token: string, pageParam = 1, pageSize = 10, status?: string, symbol?: string, profile?: string,) => {
    const statusParam = status && status != 'all' ? `&status=${status}` : ''
    const symbolParam = symbol && symbol.trim() !== '' ? `&symbol=${encodeURIComponent(symbol.trim())}` : ''
    const profileParam = profile && profile.trim() !== '' ? `&profile=${encodeURIComponent(profile.trim())}` : ''

    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/trades?page=${pageParam}&limit=${pageSize}${statusParam}${symbolParam}${profileParam}`, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    const resData = await res.json()
    return resData
}

const renderTradeItem = ({ item }: { item: Trade }) => {
    const router = useRouter()
    
    const symbol = item.symbol
    const profileImage = item?.profileId?.profileImage
    const name = item?.symbol
    const isSkipped = item?.status === 'skipped'
    const totalValue = (item?.price || 0) * (item?.quantity || 0)

    const handleTradePress = () => {
        const status = item?.status
        const id = status === 'open' ? item.positionId : item._id
        const path = status === 'open' ? `/(position)/${id}` : `/(trade)/${id}`
        router.navigate(path as Href)
    }
    return (
        <Pressable
            className={`flex-row items-center  bg-aura-surface dark:bg-aura-surface-dark gap-3 rounded-3xl p-6 ${isSkipped ? 'opacity-70 border border-dashed dark:border-aura-bg' : ''}`}
            onPress={() => handleTradePress()}
        >
            <View className='w-14 h-14 rounded-full shrink-0'>
                <Image source={item ? { uri: profileImage } : undefined} style={{ width: '100%', height: '100%', borderRadius: 100 }} />
            </View>
            <View className='flex-1 ml-3 pr-2 gap-y-0.6'>
                <Text numberOfLines={1} className='text-base font-bold tracking-tight text-aura-text-primary dark:text-aura-text-primary-dark'>{name}</Text>
                <Text className='text-xs text-aura-text-secondary dark:text-aura-text-secondary-dark font-semibold' numberOfLines={1}>
                    {item.side === 'Buy' ? 'Bought' : 'Sold'}
                    {' '}{item.quantity} shares of
                    <Text className='text-base font-bold text-aura-text-secondary dark:text-aura-text-secondary-dark'> {item.symbol}</Text>
                </Text>
            </View>
            <View className='shrink-0 gap-y-1 items-end'>
                <Text className='text-sm font-bold text-aura-text-secondary dark:text-aura-text-secondary-dark uppercase tracking-wider'>{formatTime(item.createdAt)}</Text>
                <Text className='text-sm font-extrabold text-aura-text-primary dark:text-aura-text-primary-dark'>₹{totalValue ? totalValue.toLocaleString('en-IN') : '0'}</Text>
            </View>
        </Pressable>
    )
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
const TradeSkeleton = () => (
    <View key={'trade-detail'}>
        <Shimmer className='bg-aura-surface-elevated dark:bg-aura-surface-elevated-dark w-full h-28 rounded-3xl ' />
    </View>
)
const FILTER_OPTIONS: { label: string, value: FilterStatus }[] = [
    { label: 'ALL', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' },
    { label: 'Skipped', value: 'skipped' }
]
const Trade = () => {
    const router = useRouter()
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const params = useLocalSearchParams<{ initialStatus?: FilterStatus }>()
    const { token } = useAuthStore()
    const [activeFilter, setActiveFilter] = useState<FilterStatus>(params.initialStatus || 'all')
    const [symbol, setSymbol] = useState('')
    const [profile, setProfile] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const { profileName } = useLocalSearchParams<{ profileName: string }>()

    useEffect(() => {
        const handler = setTimeout(() => {
            setSymbol(searchQuery)
            // setProfile(searchQuery)
        }, 400)

        return () => clearTimeout(handler)
    }, [searchQuery])

    useEffect(() => {
        if (profileName) {
            const resolveName = Array.isArray(profileName) ? profileName[0] : profileName
            setProfile(resolveName)
        }
    }, [profileName])
    // console.log("filter: ", profileName)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchNextPageError,
        isFetchingNextPage,
        isPending,
        refetch,
        isRefetching,
        error
    } = useInfiniteQuery({
        queryKey: ['trades', 'infinite', activeFilter, symbol, profile],
        queryFn: ({ pageParam = 1 }) => fetchTrades(token!, pageParam, 10, activeFilter, symbol, profile),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (allPages.length < (lastPage?.totalPages || 0)) {
                return allPages.length + 1
            }
            return undefined
        },
        enabled: !!token
    })
    const trades = data?.pages.flatMap((page) => page.trades) ?? []
    // const isPending = true
    // console.log(JSON.stringify(trades, null, 2))

    if (error) {
        console.log("Error in recentTrades: ", error)
    }

    // const allOpenTrades = trades.filter(trade => trade.status === 'closed')
    // console.log(allOpenTrades)


    const selectedIndex = FILTER_OPTIONS.findIndex((opt) => opt.value === activeFilter)
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            className='mx-6 mt-4'
        >
            <View className='realtive mb-3 flex-row items-center justify-between'>
                <Pressable onPress={() => router.back()} className='z-10 ' style={({ pressed }) => [
                    pressed && {
                        backgroundColor: 'var(--aura-surface)',
                    }
                ]}
                >
                    {({ pressed }) => (
                        <View className={`rounded-full p-1 ${pressed ? 'bg-aura-surface dark:bg-aura-surface-dark' : 'bg-transparent'}`}>
                            <ArrowLeft color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} />
                        </View>
                    )}
                </Pressable>
                <View className='absolute inset-0 items-center justify-center pointer-events-none'>
                    <Text className='text-xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Trade</Text>
                </View>
            </View>

            <View className={`flex-row border bg-aura-surface dark:bg-aura-surface-dark rounded-full items-center px-3 py-1 mt-3 gap-1 ${isFocused ? 'border-aura-primary dark:border-aura-primary' : 'border-gray-300'}`}>
                <Search color={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary} />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder='Search tickers...'
                    placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
                    className='flex-1 text-base py-2 text-aura-text-primary dark:text-aura-text-primary-dark'
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCorrect={false}
                    autoCapitalize='none'
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                        <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark text-lg px-1'>✕</Text>
                    </Pressable>
                )}
            </View>

            <View className='flex-row items-center mt-3 gap-3'>
                <View className=' flex-1'>
                    <SegmentedControl
                        values={['ALL', 'Open', 'Closed', 'Skipped']}
                        selectedIndex={selectedIndex}
                        onChange={e => {
                            const index = e.nativeEvent.selectedSegmentIndex
                            setActiveFilter(FILTER_OPTIONS[index].value)
                        }}
                        backgroundColor={isDark ? Colors.dark.surface : Colors.light.surface}
                        tintColor={isDark ? Colors.dark.background : Colors.light.background}
                        appearance={isDark ? 'dark' : 'light'}
                        fontStyle={{ color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary, fontFamily: 'Aura-Medium' }}
                        activeFontStyle={{ color: isDark ? Colors.dark.textPrimary : Colors.light.textPrimary, fontFamily: 'Aura-Bold'}}
                        style={{ height: 40 }}
                    />
                </View>
                {/* <Pressable className='rounded-md active:bg-gray-100 p-1'> */}
                <MenuView
                    actions={[
                        { id: 'The Insider', title: 'The Insider', state: profile === 'The Insider' ? 'on' : 'off' },
                        { id: 'The Whale', title: 'The Whale', state: profile === 'The Whale' ? 'on' : 'off' },
                        { id: 'The Technician', title: 'The Technician', state: profile === 'The Technician' ? 'on' : 'off' },
                        { id: 'The Momentum chaser', title: 'The Momentum chaser', state: profile === 'The Momentum chaser' ? 'on' : 'off' }
                    ]}
                    onPressAction={({ nativeEvent }) => setProfile(nativeEvent.event)}
                >
                    <View className='rounded-xl p-2 bg-aura-surface dark:bg-aura-surface-dark active:bg-aura-bg-alt dark:active:bg-aura-bg-alt-dark'>
                        <ListFilter color={profile ? (isDark ? Colors.dark.primary : Colors.light.primary) : (isDark ? Colors.dark.textSecondary : Colors.light.textSecondary)} />
                    </View>
                </MenuView>
                {/* </Pressable> */}

            </View>
            {profile && (
                <Pressable
                    className='flex-row bg-aura-surface dark:bg-aura-surface-dark px-3 mt-3 py-1 rounded-xl  items-center gap-1 self-start '
                    onPress={() => setProfile('')}
                >
                    <Text className='text-base font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>{profile}</Text>
                    <X size={20} color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} />
                </Pressable>
            )}

            <FlatList
                data={isPending ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : trades}
                keyExtractor={(item, index) => index.toString()}
                renderItem={isPending ? () => <TradeSkeleton /> : renderTradeItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[isDark ? Colors.light.primary : Colors.dark.primary]} tintColor={isDark ? Colors.light.primary : Colors.dark.primary} />
                }
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
                }}
                onEndReachedThreshold={0.3}
                contentContainerClassName='gap-3 mt-6 pb-8'
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View className='py-4 items-center justify-center'>
                            <ActivityIndicator color={isDark ? Colors.light.primary : Colors.dark.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !isPending && trades.length === 0 ? (
                        <View className=' items-center justify-center'>
                            <Text className='text-aura-text-secondary dark:text-aura-text-secondary-dark'>No Trades Yet.</Text>
                        </View>
                    ) : null
                }
            />
        </KeyboardAvoidingView>
    )
}

export default Trade