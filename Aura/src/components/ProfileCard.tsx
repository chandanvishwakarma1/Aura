import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native'
import React from 'react'
import { ApiError } from '@/utils/apiError'
import { useAuthStore } from '../../store/authStore'
import formatFollowers from '../utils/format'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native'

interface ProfileItem {
    _id: string,
    name: string,
    profileImage: string,
    followCount: number
}
interface Profile {
    item: ProfileItem
}
const fetchProfilesReturns = async (token: string, id: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/${id}/returns`, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    if (!res.ok) throw new ApiError('Failed to fetch home')
    const resData = await res.json()
    return resData
}

const ProfileCard = ({ item }: Profile) => {
    const { token } = useAuthStore()
    const router = useRouter()
    const id = item._id

    const { width: screenWidth } = useWindowDimensions()
    const cardWidth = screenWidth * 0.48
    const { data: profileReturnsData = [], isLoading: isProfileReturnsLoading, isPending: isProfileReturnsPending, error: profileReturnsErr, refetch: profileRetunsRefetch, isRefetching: isProfileRetunsRefetch } = useQuery({
        queryKey: ['index', 'profileCard', id],
        queryFn: () => fetchProfilesReturns(token, id),
        enabled: !!token && !!id,
    })
    if (profileReturnsErr) console.log('Error in ProfileCard: ', profileReturnsErr)
    const handlePress = (id: string) => {
        router.navigate({
            pathname: ('/(profile)/profileDetail'),
            params: { id }
        })
    }
    const latestReturns = profileReturnsData.length > 0 ? profileReturnsData[profileReturnsData.length - 1].value : 0
    const isPositive = latestReturns >= 0

    return (
        <Pressable
            key={item._id}
            className='justify-between bg-gray-100 rounded-3xl p-6 min-w-[160px] active:opacity-70 gap-6'
            style={{ width: cardWidth }}
            onPress={() => handlePress(item._id)}
        >
            <View className='flex-row justify-between'>
                <View className='w-14 h-14'>
                    <Image source={item.profileImage ? { uri: item.profileImage } : undefined} style={{ width: '100%', height: '100%', borderRadius: 100 }} contentFit='cover' />
                </View>
            </View>
            <View>
                <View>
                    <Text className='font-semibold text-base' numberOfLines={1}>{item.name}</Text>
                    <Text className='text-sm  text-gray-600'>{formatFollowers(item.followCount)} {item.followCount <= 1 ? 'follower' : 'followers'}</Text>
                </View>
                <View className={`flex-row items-end mt-3  `}>
                    <View className='-ml-1'>
                        {isPositive ? <ArrowUpRight size={34} /> : <ArrowDownRight />}
                    </View>
                    <Text className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{latestReturns}% </Text>
                    <Text className={`text-sm self-end  ${isPositive ? 'text-green-600' : 'text-red-600'}`}>(30d)</Text>
                </View>
            </View>
        </Pressable>
    )
}

export default ProfileCard