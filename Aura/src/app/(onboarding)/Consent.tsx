import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, Bean, Compass, Flower, GraduationCap, Sprout, TreePalm, TrendingUp } from 'lucide-react-native'
import { useTheme } from '@/lib/ThemeContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import AuraSwitch from '@/components/Switch'
import registerForPushNotificationsAsync from '@/utils/notifications'
import { useAuthStore } from '../../../store/authStore'

type OptionItem = {
    id: number,
    title: string,
    value: string,
    desc: string,
    icon: React.ComponentType<{ color: string; size?: number }>
}

const Experience = () => {
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const params = useLocalSearchParams()
    const router = useRouter()
    const completeOnboarding = useAuthStore((s) => s.completeOnboarding)
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true)
    const [isSelected, setIsSelected] = useState(0)

    const primary = isDark ? Colors.dark.primary : Colors.light.primary
    const textPrimary = isDark ? Colors.dark.primary : Colors.light.primary
    const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary
        const buttonSecondary = isDark ? Colors.dark.buttonSecondary : Colors.light.buttonSecondary


    const options: OptionItem[] = [
        {
            id: 1,
            value: 'learn_trading',
            title: 'Learn to Trade',
            desc: 'Getting started, learning the basics.',
            icon: GraduationCap
        },
        {
            id: 2,
            value: 'improve_trading',
            title: 'Improve your trading',
            desc: "I've traded a little on my own.",
            icon: TrendingUp
        },
        {
            id: 3,
            value: 'just_exploring',
            title: 'Just exploring',
            desc: 'Just checking out new apps.',
            icon: Compass
        }
    ]

    const handlePress = (id:number, value:string) => {
    setIsSelected(id)
    // router.push({pathname: '/Risk', params: {experience: value}})
  }    
  const selectedOption = options.find((item)=>item.id === isSelected)
  const selectedValue = selectedOption ? selectedOption.value : ''

  const handleStartTrading = () => {
    // Mark the pre-auth onboarding intro as done so the auth guard doesn't
    // bounce the user back into onboarding when they land on (auth).
    completeOnboarding()
    router.push({ pathname: '/(auth)', params: { ...params, goal:selectedValue, mode:'register'  } })
  }
    return (
        <View className='flex-1 mx-6'>
            <View className='flex-row items-center justify-between  mt-9 min-h-[48px]'>
                <Pressable
                    onPress={() => router.back()} className='p-3 rounded-full active:bg-aura-surface dark:active:bg-aura-surface-dark'>
                    <ArrowLeft color={textSecondary} />
                </Pressable>

            </View>
            <View className='mt-3 gap-3'>
                <Text className='text-3xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>One last thing. What's your goal?</Text>
                <Text className='text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>Tell us about goals and consent.</Text>
            </View>

            <View className='mt-6'>
                {options.map((item, index) => {
                    const Icon = item.icon
                    const { title } = item
                    return (
                        <Pressable
                            key={item.id}
                            className={`flex-row gap-3 p-6  mt-6 rounded-3xl border-2 ${isSelected === item.id ? 'border-aura-primary' : 'border-aura-border dark:border-aura-border-dark '}`}
                            onPress={() => handlePress(item.id, item.value)}
                        >
                            <View>
                                <Icon color={primary} size={20} />
                            </View>
                            <Text className='text-base font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>{title}</Text>
                        </Pressable>
                    )
                })}
            </View>

            <Pressable className=' mt-9'>
                <Text className='text-aura-primary underline dark:text-aura-primary' style={{ textDecorationLine: 'underline' }}>I understand Aura uses paper (virtual) money, past performance is not a guarantee, and markets can lose value.</Text>
            </Pressable>
            <Pressable
                className='rounded-full mt-6 py-4' style={{ backgroundColor: selectedValue ? primary : buttonSecondary }}
                disabled={!selectedValue}
                onPress={handleStartTrading}
            >
                <Text className='text-center text-aura-text-primary-dark dark:text-aura-text-primary-dark font-semibold text-xl'>Start Trading</Text>
            </Pressable>
        </View>
    )
}

export default Experience