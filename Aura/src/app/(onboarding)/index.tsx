import { View, Text, Dimensions, FlatList, StyleSheet, Pressable } from 'react-native'
import React, { useRef, useState } from 'react'
import Aura from '@/components/Aura'
import Portfolio from '@/components/Portfolio'
import Rupee from '@/components/Rupee'
import LogoGlow from '@/assets/LogoGlow.png'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'
import { Image } from 'expo-image'
import { ArrowLeft, ArrowRight } from 'lucide-react-native'
import Animated, { interpolate, type SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useRouter } from 'expo-router'

type ScreenItem = {
    id: number
    icon: React.ComponentType<{ width?: number; height?: number; fill?: string; stroke?: string; strokeWidth?: number }>
    title: string
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CAROUSAL_ITEM_WDITH = SCREEN_WIDTH

const Dots = ({ index, scrollX, isDark }: { index: number; scrollX: SharedValue<number>; isDark: boolean }) => {
    const animatedStyle = useAnimatedStyle(() => {

        const width = interpolate(
            scrollX.value,
            [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
            [8, 20, 8],
            'clamp'
        )

        const opacity = interpolate(
            scrollX.value,
            [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
            [0.4, 1, 0.4],
            'clamp'
        )

        return {
            width,
            opacity,
            backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary
        }
    })

    return <Animated.View style={[styles.dot, animatedStyle]} />
}

const Index = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const router = useRouter()
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const flatListRef = useRef<Animated.FlatList<ScreenItem> | null>(null)
    const scrollX = useSharedValue(0)
    const screens: ScreenItem[] = [
        {
            id: 1,
            icon: Aura,
            title: 'Pick a profile you believe in'
        },
        {
            id: 2,
            icon: Portfolio,
            title: 'Trades land in your paper portfolio automatically'
        },
        {
            id: 3,
            icon: Rupee,
            title: 'Start risk‑free with virtual ₹. No real money, ever.'
        }
    ]

    const handleScroll = (event: any) => {
        const scrollOffset = event.nativeEvent.contentOffset.x
        const currentIndex = Math.round(scrollOffset / CAROUSAL_ITEM_WDITH)
        setActiveIndex(currentIndex)
    }

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x
        }
    })

    const renderItem = ({ item }: { item: ScreenItem }) => {
        const Icon = item.icon
        return (
            <View className='mb-6 items-center justify-center px-6' style={{ width: CAROUSAL_ITEM_WDITH }}>
                <View className='relative  items-center justify-center' style={{ width: 260, height: 260 }}>
                    <Image
                        source={LogoGlow}
                        style={{ width: 230, height: 230, position: 'absolute' }}
                        contentFit='contain'
                    />
                    <Icon />
                </View>
                <View className='w-full px-2'>
                    <Text className='text-3xl font-bold text-center text-aura-text-primary dark:text-aura-text-primary-dark'>{item.title}</Text>
                </View>
            </View>
        )
    }

    const scrollTo = (index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true })
        setActiveIndex(index)
    }

    const handleSkip = () => {
        scrollTo(screens.length - 1)
    }
    const handleContinue = () => {
        if (activeIndex < screens.length - 1) {
            scrollTo(activeIndex + 1)
        } else {
            router.push('/Experience')
        }
    }

    const handleBack = () => {
        if (activeIndex > 0) {
            scrollTo(activeIndex - 1)
        }
    }

    return (
        <View className='flex-1'>
            <View className='flex-row items-center justify-between mx-6 mt-9 min-h-[48px]'>
                <Pressable
                    className='active:bg-aura-surface dark:active:bg-aura-surface-dark self-start p-3 rounded-full z-10'
                    onPress={handleBack}
                >
                    <ArrowLeft color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} />
                </Pressable>

                <View
                    pointerEvents='none'
                    style={[styles.pagination, { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }]}>
                    {screens.map((screen, index) =>
                        <Dots key={screen.id} index={index} scrollX={scrollX} isDark={isDark} />
                    )}
                </View>

                <Pressable className='py-3 px-6 text-center bg-aura-surface dark:bg-aura-surface-dark rounded-full z-10  active:opacity-40' onPress={handleSkip}>
                    <Text className='text-base font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Skip</Text>
                </Pressable>

            </View>
            <Animated.FlatList
                ref={flatListRef}
                data={screens}
                keyExtractor={(item: ScreenItem) => item.id.toString()}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            <Pressable
                className='flex-row items-center justify-center gap-1 mb-6 mx-6 py-4 rounded-full active:opacity-40' onPress={handleContinue} style={{ backgroundColor: Colors.dark.primary }}>
                <Text className='text-lg text-center font-semibold text-aura-text-primary-dark dark:text-aura-text-primary-dark'>
                    {activeIndex === screens.length - 1 ? 'Get Started' : 'Continue'}
                </Text>
                {activeIndex !== screens.length - 1 && (<ArrowRight size={20} color={isDark ? Colors.dark.textPrimary : Colors.dark.textPrimary} />)}
            </Pressable>


        </View>
    )
}

const styles = StyleSheet.create({
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop: 16,
        // marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 4,
    }
})


export default Index