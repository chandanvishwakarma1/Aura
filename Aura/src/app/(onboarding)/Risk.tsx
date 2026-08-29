import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import { ArrowLeft, Shield, Scale, TrendingUp, Zap } from 'lucide-react-native'
import { useTheme } from '@/lib/ThemeContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'

type OptionItem = {
  id: number,
  value: string,
  title: string,
  desc: string,
  icon: React.ComponentType<{ color: string; size?: number }>
}

const Risk = () => {
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(0)
  const params = useLocalSearchParams()

  const primary = isDark ? Colors.dark.primary : Colors.light.primary
  const textPrimary = isDark ? Colors.dark.primary : Colors.light.primary
  const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary

  const options: OptionItem[] = [
    {
      id: 1,
      title: 'Conservative',
      value: 'conservative',
      desc: 'Low volatility · small, steady moves.',
      icon: Shield
    },
    {
      id: 2,
      title: 'Balanced',
      value: 'balanced',
      desc: "Moderate ups and downs.",
      icon: Scale
    },
    {
      id: 3,
      title: 'Growth',
      value: 'growth',
      desc: 'Higher swings, higher growth potential.',
      icon: TrendingUp
    },
    {
      id: 4,
      title: 'Aggressive',
      value: 'aggressive',
      desc: 'Big moves · only for comfortable risk‑takers.',
      icon: Zap
    }
  ]

  const handlePress = (id: number, value: string) => {
    setIsSelected(id)
    router.push({ pathname: '/Capital', params: { ...params, riskAppetite: value } })
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
        <Text className='text-3xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>What's your comfort with ups and downs?</Text>
        <Text className='text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>This matches you with strategies that fit how you'd want to see your balance move.</Text>
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
    </View>
  )
}

export default Risk