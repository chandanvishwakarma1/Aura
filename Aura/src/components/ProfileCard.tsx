import { View, Text, Pressable, useWindowDimensions, ActivityIndicator, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { ApiError } from '@/utils/apiError'
import { useAuthStore } from '../../store/authStore'
import formatFollowers from '../utils/format'
import { Image } from 'expo-image'
import { Href, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

interface ProfileItem {
    _id: string,
    name: string,
    profileImage: string,
    followCount: number
}
interface Profile {
    item: ProfileItem,
    fromOnboarding?: boolean
}
const fetchProfilesReturns = async (token: string, id: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/${id}/returns`, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    if (!res.ok) throw new ApiError('Failed to fetch profile returns')
    const resData = await res.json()
    return resData.data
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

const ProfileCard = ({ item, fromOnboarding }: Profile) => {
    const { token } = useAuthStore()
    const router = useRouter()
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const id = item._id

    const { width: screenWidth } = useWindowDimensions()
    const cardWidth = screenWidth * 0.48
    const { data: profileReturnsData = [], error: profileReturnsErr, isPending } = useQuery({
        queryKey: ['index', 'profileCard', id],
        queryFn: () => fetchProfilesReturns(token, id),
        enabled: !!token && !!id,
        staleTime: 1000 * 60 * 15
    })

    const handlePress = () => {
        const id = item._id
        // const params = 
        router.navigate(`/(profile)/${id}` as Href)
    }
    const latestReturns = profileReturnsData.length > 0 ? profileReturnsData[profileReturnsData.length - 1].value : 0
    if (latestReturns < 0 && !fromOnboarding) {
        return null
    }
    const isPositive = latestReturns >= 0

    const CustomView = fromOnboarding ? View : Pressable
    const CustomViewProps = fromOnboarding ? {} : {onPress : handlePress}

    return (
        <CustomView
            key={item._id}
            {...CustomViewProps}
            className={`justify-between bg-aura-surface dark:bg-aura-surface-dark rounded-3xl active:opacity-70 ${fromOnboarding ? 'p-6 gap-3' : 'p-6 min-w-[160px] gap-6'}`}
            style={!fromOnboarding ? { width: cardWidth } : undefined}
        >
            <View className='flex-row justify-between'>
                <View className='w-14 h-14'>
                    <Image source={item.profileImage ? { uri: item.profileImage } : undefined} style={{ width: '100%', height: '100%', borderRadius: 100 }} contentFit='cover' />
                </View>
            </View>
            <View>
                <View>
                    <Text className='font-semibold text-base text-aura-text-primary dark:text-aura-text-primary-dark' numberOfLines={1}>{item.name}</Text>
                    <Text className='text-sm text-aura-text-secondary dark:text-aura-text-secondary-dark'>{formatFollowers(item.followCount)} {item.followCount <= 1 ? 'follower' : 'followers'}</Text>
                </View>
                {isPending ? (
                    <View className='h-[34px] justify-center mt-2'>
                        <Shimmer className='w-full h-9  rounded-xl bg-aura-surface-elevated dark:bg-aura-surface-elevated-dark' />
                    </View>
                ) : (
                    <View className='flex-row items-end mt-3'>
                        <View className='-ml-1'>
                            {latestReturns > 0 && (
                                <ArrowUpRight size={fromOnboarding ? 24 : 30} color={isDark ? Colors.dark.positive : Colors.light.positive} />
                            )}
                            {latestReturns < 0 && (
                                <ArrowDownRight size={fromOnboarding ? 24 : 30} color={isDark ? Colors.dark.negative : Colors.light.negative} />
                            )}
                        </View>
                        <Text className={`${fromOnboarding ? 'text-lg' : 'text-xl'}  font-bold ${latestReturns > 0 ? 'text-aura-positive' : latestReturns < 0 ? 'text-aura-negative' : 'text-aura-text-secondary dark:text-aura-text-secondary-dark'}`}>{latestReturns > 0 ? '+' : ''}{latestReturns}% </Text>
                        <Text className={`${fromOnboarding ? 'text-xs' : 'text-xs'}   pb-1 font-semibold ${latestReturns > 0 ? 'text-aura-positive' : latestReturns < 0 ? 'text-aura-negative' : 'text-aura-text-secondary dark:text-aura-text-secondary-dark'}`}>(30d)</Text>
                    </View>
                )}
            </View>
        </CustomView>
    )
}

export default ProfileCard