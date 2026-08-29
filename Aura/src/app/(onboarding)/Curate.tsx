import { View, Text, Pressable } from 'react-native'
import React, { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react-native'
import { useTheme } from '@/lib/ThemeContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import ProfileCard from '@/components/ProfileCard'
import { ApiError } from '@/utils/apiError'
import { useQuery } from '@tanstack/react-query'
import Shimmer from '@/components/Shimmer'

const fetchProfiles = async () => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/`, {
        method: "GET",
    })
    if (!res.ok) throw new ApiError('Failed to fetch profiles')
    const resData = await res.json()
    return resData
}


const ProfileSkeleton = () => (
    <View className='mt-3 gap-3 flex-row'>
        <Shimmer className='w-[56%] h-56 bg-aura-surface-elevated dark:bg-aura-surface-elevated-dark rounded-3xl' />
        <Shimmer className='w-[100%] h-56 bg-aura-surface-elevated dark:bg-aura-surface-elevated-dark rounded-3xl' />
    </View>
)

type RiskAppetite = 'conservative' | 'balanced' | 'growth' | 'aggressive'

interface ProfileItem {
    _id: string,
    name: string,
    profileImage: string,
    followCount: number,
    type: string,
    shortIntro?: string,
    description?: string,
    winRate?: number
}

const Curate = () => {
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const router = useRouter()

    const params = useLocalSearchParams()

    const { data: profileData, isPending: isProfilePending } = useQuery({
        queryKey: ['onboarding', 'profiles'],
        queryFn: () => fetchProfiles(),
    })

    const primary = isDark ? Colors.dark.primary : Colors.light.primary
    const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary

    const RISK_PROFILE_MAP: Record<RiskAppetite, { primary: string; secondary: string }> = {
        conservative: {
            primary: 'insider_mirror',
            secondary: 'sma_crossover'
        },
        balanced: {
            primary: 'sma_crossover',
            secondary: 'insider_mirror'
        },
        growth: {
            primary: 'bulk_mirror',
            secondary: 'breakout'
        },
        aggressive: {
            primary: 'breakout',
            secondary: 'bulk_mirror'
        }
    }

    const { riskAppetite } = useLocalSearchParams<{ riskAppetite?: string }>()
    const selectedRiskAppetite = riskAppetite && riskAppetite in RISK_PROFILE_MAP ? riskAppetite as RiskAppetite : 'balanced'

    // Show only the profiles that best match the user's risk appetite.
    const rawProfiles: ProfileItem[] = Array.isArray(profileData) ? profileData : profileData?.data ?? []
    const recommendedProfiles = useMemo(() => {
        const { primary: primaryType, secondary: secondaryType } = RISK_PROFILE_MAP[selectedRiskAppetite]
        const matched = rawProfiles.filter(p => p.type === primaryType || p.type === secondaryType)
        return matched.length > 0 ? matched : rawProfiles
    }, [rawProfiles, selectedRiskAppetite])

    return (
        <View className='flex-1 mx-6'>
            <View className='flex-row items-center justify-between  mt-9 min-h-[48px]'>
                <Pressable
                    onPress={() => router.back()} className='p-3 rounded-full active:bg-aura-surface dark:active:bg-aura-surface-dark'>
                    <ArrowLeft color={textSecondary} />
                </Pressable>

            </View>
            <View className='mt-3 gap-3'>
                <Text className='text-3xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Strategies we think suit you</Text>
                <Text className='text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>These are matched to your {selectedRiskAppetite} appetite. You can follow profiles inside the app whenever you're ready.</Text>
            </View>

            <View className='mt-6'>
                {isProfilePending ? (
                    <ProfileSkeleton />
                ) : (
                    <View
                        style={{ flexDirection: 'row', flexWrap: 'wrap' }}
                        className='gap-y-4 justify-between'
                    >
                        {recommendedProfiles.map((item: ProfileItem) => (
                            <View
                                key={item._id || item.name}
                                className='rounded-3xl'
                                style={{ width: '48%' }}
                            >
                                <View pointerEvents='none'>
                                    <ProfileCard item={item} fromOnboarding={true} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <Pressable
                className='rounded-full mt-6 py-4'
                style={{ backgroundColor: primary }}
                onPress={() => router.push({
                    pathname: '/Consent',
                    params: {
                        ...params,
                        profileIds: JSON.stringify(recommendedProfiles.map(p => p._id))
                    }
                })}
            >
                <Text className='text-center text-aura-text-primary-dark dark:text-aura-text-primary-dark font-semibold text-xl'>Continue</Text>
            </Pressable>
        </View>
    )
}

export default Curate