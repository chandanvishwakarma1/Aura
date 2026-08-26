import { View, Text, Dimensions, FlatList, StyleSheet } from 'react-native'
import React, { useRef, useState } from 'react'

type ScreenItem = {
    id: number
    icon: string
    title: string
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const Index = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const flatListRef = useRef<FlatList<ScreenItem> | null>(null)
    const screens: ScreenItem[] = [
        {
            id: 1,
            icon: '',
            title: 'Pick a profile you believe in'
        },
        {
            id: 2,
            icon: '',
            title: 'Trades land in your paper portfolio automatically'
        },
        {
            id: 3,
            icon: '',
            title: 'Start risk‑free with virtual ₹. No real money, ever.'
        }
    ]

    const handleScroll = (event: any) => {
        const scrollOffset = event.nativeEvent.contentOffset.x
        const currentIndex = Math.round(scrollOffset / SCREEN_WIDTH)
        setActiveIndex(currentIndex)
    }

    const renderItem = ({ item }: { item: ScreenItem }) => (
        <View>
            <Text>{item.icon}</Text>
            <Text>{item.title}</Text>
        </View>
    )

    return (
        <View>
            <FlatList
                ref={flatListRef}
                data={screens}
                keyExtractor={(item: ScreenItem) => item.id.toString()}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
            />

            <View style={styles.pagination}>
                {screens.map((screen, index) =>
                    React.createElement(View, {
                        key: screen.id,
                        style: [styles.dot, index === activeIndex && styles.dotActive]
                    })
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 4
    },
    dotActive: {
        width: 20,
        backgroundColor: '#111827'
    }
})


export default Index