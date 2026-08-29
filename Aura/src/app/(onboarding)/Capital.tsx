import { View, Text, Pressable, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { ArrowLeft, Bean, Flower, Sprout, TreePalm } from 'lucide-react-native'
import { useTheme } from '@/lib/ThemeContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'

type OptionItem = {
    id: number,
    title: string,
    value: string
    //   desc: string,
    //   icon: React.ComponentType<{ color: string; size?: number }>
}

const Capital = () => {
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const router = useRouter()
    const [isSelected, setIsSelected] = useState(0)
    const [capital, setCapital] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const isFilled = capital.length > 0
    const params = useLocalSearchParams()

    const primary = isDark ? Colors.dark.primary : Colors.light.primary
    const textPrimary = isDark ? Colors.dark.primary : Colors.light.primary
    const buttonSecondary = isDark ? Colors.dark.buttonSecondary : Colors.light.buttonSecondary
    const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary

    const options: OptionItem[] = [
        {
            id: 1,
            title: '5L',
            value: "500000",
            //   desc: 'Low volatility · small, steady moves.',
            //   icon: Bean
        },
        {
            id: 2,
            title: '10L',
            value: "1000000",
            //   desc: "Moderate ups and downs.",
            //   icon: Sprout
        },
        {
            id: 3,
            title: '25L',
            value: "2500000",
            //   desc: 'Higher swings, higher growth potential.',
            //   icon: Flower
        },
        {
            id: 4,
            title: '1Cr',
            value: "10000000",
            //   desc: 'Big moves · only for comfortable risk‑takers.',
            //   icon: TreePalm
        }
    ]

    const handleChange = (text: string) => {
        const cleanNumber = text.replace(/,/g, '')

        if (!isNaN(Number(cleanNumber)) || cleanNumber === '') {
            setCapital(cleanNumber)

            const matchedOption = options.find(option => option.value === cleanNumber)

            if (matchedOption) {
                setIsSelected(matchedOption.id)
            } else {
                setIsSelected(0)
            }
        }

    }

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View className='flex-1 mx-6'>
                <View className='flex-row items-center justify-between  mt-9 min-h-[48px]'>
                    <Pressable
                        onPress={() => router.back()} className='p-3 rounded-full active:bg-aura-surface dark:active:bg-aura-surface-dark'>
                        <ArrowLeft color={textSecondary} />
                    </Pressable>

                </View>
                <View className='mt-3 gap-3'>
                    <Text className='text-3xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Let's set your starting paper balance</Text>
                    <Text className='text-base text-aura-text-secondary dark:text-aura-text-secondary-dark'>This is virtual money you'll manage. You cannot change it. Aura will allocate part of this to each profile you follow.</Text>
                </View>

                <Pressable
                    className={`flex-row mt-6 items-center py-4 px-4 rounded-xl border-2  bg-aura-surface  text-aura-text-primary dark:bg-aura-surface-dark dark:text-aura-text-primary-dark ${isFocused ? 'border-2 border-aura-primary' : 'border-aura-border dark:border-aura-border-dark'}`}
                    onPress={() => setIsFocused(true)}
                >
                    <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>₹</Text>
                    <TextInput
                        value={capital ? Number(capital).toLocaleString('en-IN') : ''}
                        onChangeText={handleChange}
                        keyboardType='numeric'
                        placeholder='Enter amount'
                        className={`font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark flex-1 `}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </Pressable>

                <View className='flex-row gap-3 flex-wrap mt-6'>
                    {options.map((item, index) => {
                        //   const Icon = item.icon
                        const { title } = item
                        return (
                            <Pressable
                                key={item.id}
                                className={` gap-3 px-6 py-4 self-start rounded-3xl border-2 ${isSelected === item.id ? 'border-aura-primary' : 'border-aura-border dark:border-aura-border-dark '}`}
                                onPress={() => {
                                    setIsSelected(item.id)
                                    setCapital(item.value)
                                    router.push({ pathname: '/Curate', params: { ...params, capital: item.value } })
                                    // console.log(capital)
                                }}
                            >
                                {/* <View>
                <Icon color={primary} size={20} />
              </View> */}
                                <Text className='text-base font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>₹{title}</Text>
                            </Pressable>
                        )
                    })}
                </View>

                <Pressable
                    className='rounded-full mt-6 py-4' style={{ backgroundColor: isFilled ? primary : buttonSecondary }}
                    disabled={!isFilled}
                    onPress={() => router.push({ pathname: '/Curate', params: { capital: capital } })}
                >
                    <Text className='text-center text-aura-text-primary-dark dark:text-aura-text-primary-dark font-semibold text-xl'>Next</Text>
                </Pressable>
            </View>
        </TouchableWithoutFeedback>
    )
}
export default Capital