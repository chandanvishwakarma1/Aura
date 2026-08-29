import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import { ArrowLeft, Bean, Flower, Sprout, TreePalm } from 'lucide-react-native'
import { useTheme } from '@/lib/ThemeContext'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'

type OptionItem = {
  id: number,
  value:string,
  title: string,
  desc: string,
  icon: React.ComponentType<{ color: string; size?: number }>
}

const Experience = () => {
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(0)

  const primary = isDark ? Colors.dark.primary : Colors.light.primary
  const textPrimary = isDark ? Colors.dark.primary : Colors.light.primary
  const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary

  const options: OptionItem[] = [
    {
      id: 1,
      value: 'new',
      title: 'New to investing',
      desc: 'Getting started, learning the basics.',
      icon: Bean
    },
    {
      id: 2,
      value: 'some',
      title: 'Some experience',
      desc: "I've traded a little on my own.",
      icon: Sprout
    },
    {
      id: 3,
      value: 'experienced',
      title: 'Experienced',
      desc: 'Regularly active, know the markets.',
      icon: Flower
    },
    {
      id: 4,
      value: 'professional',
      title: 'Professional',
      desc: 'Trading is (or was) my job.',
      icon: TreePalm
    }
  ]

  const handlePress = (id:number, value:string) => {
    setIsSelected(id)
    router.push({pathname: '/Risk', params: {experience: value}})
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
        <Text className='text-3xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>How would you describe yourself?</Text>
        <Text className='text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>This helps us show you the right strategies.</Text>
      </View>

      <View className='mt-6'>
        {options.map((item, index) => {
          const Icon = item.icon
          const { title } = item
          return (
            <Pressable
              key={item.id}
              className={`flex-row gap-3 p-6  mt-6 rounded-3xl border-2 ${isSelected === item.id ? 'border-aura-primary' : 'border-aura-border dark:border-aura-border-dark '}`}
              onPress={()=>handlePress(item.id, item.value)}
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

export default Experience