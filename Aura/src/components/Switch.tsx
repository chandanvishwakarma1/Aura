// import React, { useEffect, useRef } from 'react'
// import { Animated, Easing, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'
// import { useTheme } from '@/lib/ThemeContext'
// import { Colors } from '@/constants/Colors'

// interface AuraSwitchProps {
//     value: boolean
//     onValueChange: (value: boolean) => void
//     disabled?: boolean
//     size?: 'sm' | 'md' | 'lg'
//     style?: StyleProp<ViewStyle>
//     testID?: string
//     accessibilityLabel?: string
//     accessibilityHint?: string
// }

// const SIZES = {
//     sm: { width: 36, height: 22, thumb: 18, padding: 2 },
//     md: { width: 44, height: 28, thumb: 24, padding: 3 },
//     lg: { width: 52, height: 32, thumb: 26, padding: 3 },
// } as const

// const AuraSwitch = ({
//     value,
//     onValueChange,
//     disabled = false,
//     size = 'md',
//     style,
//     testID,
//     accessibilityLabel,
//     accessibilityHint,
// }: AuraSwitchProps) => {
//     const { activeTheme } = useTheme()
//     const isDark = activeTheme === 'dark'
//     const tokens = isDark ? Colors.dark : Colors.light

//     const { width, height, thumb, padding } = SIZES[size]
//     const thumbTravel = width - thumb - padding * 2

//     const progress = useRef(new Animated.Value(value ? 1 : 0)).current

//     useEffect(() => {
//         Animated.timing(progress, {
//             toValue: value ? 1 : 0,
//             duration: 200,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//         }).start()
//     }, [value, progress])

//     const trackColor = progress.interpolate({
//         inputRange: [0, 1],
//         outputRange: [tokens.border, tokens.primary],
//     })

//     const translateX = progress.interpolate({
//         inputRange: [0, 1],
//         outputRange: [padding, padding + thumbTravel],
//     })

//     const handlePress = () => {
//         if (!disabled) onValueChange(!value)
//     }

//     return (
//         <Pressable
//             onPress={handlePress}
//             disabled={disabled}
//             testID={testID}
//             accessibilityRole="switch"
//             accessibilityState={{ checked: value, disabled }}
//             accessibilityLabel={accessibilityLabel}
//             accessibilityHint={accessibilityHint}
//             hitSlop={6}
//             style={[
//                 styles.track,
//                 { width, height, borderRadius: height / 2, opacity: disabled ? 0.5 : 1 },
//                 style,
//             ]}
//         >
//             <Animated.View
//                 style={[StyleSheet.absoluteFill, { borderRadius: height / 2, backgroundColor: trackColor }]}
//             />
//             <Animated.View
//                 style={[
//                     styles.thumb,
//                     {
//                         width: thumb,
//                         height: thumb,
//                         borderRadius: thumb / 2,
//                         top: (height - thumb) / 2,
//                         transform: [{ translateX }],
//                     },
//                 ]}
//             />
//         </Pressable>
//     )
// }

// const styles = StyleSheet.create({
//     track: {
//         justifyContent: 'center',
//     },
//     thumb: {
//         left: 0,
//         backgroundColor: '#FFFFFF',
//         // Subtle elevation so the thumb reads as a knob on both platforms
//         shadowColor: '#0A0B0D',
//         shadowOpacity: 0.2,
//         shadowRadius: 3,
//         shadowOffset: { width: 0, height: 1 },
//         elevation: 3,
//     },
// })

// export default AuraSwitch
import React, { useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

interface AuraSwitchProps {
    value: boolean
    onValueChange: (value: boolean) => void
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    style?: StyleProp<ViewStyle>
    testID?: string
    accessibilityLabel?: string
    accessibilityHint?: string
}

const SIZES = {
    sm: { width: 36, height: 22, thumb: 18, padding: 2 },
    md: { width: 44, height: 28, thumb: 24, padding: 3 },
    lg: { width: 52, height: 32, thumb: 26, padding: 3 },
} as const

const AuraSwitch = ({
    value,
    onValueChange,
    disabled = false,
    size = 'md',
    style,
    testID,
    accessibilityLabel,
    accessibilityHint,
}: AuraSwitchProps) => {
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const tokens = isDark ? Colors.dark : Colors.light

    const { width, height, thumb, padding } = SIZES[size]
    const thumbTravel = width - thumb - padding * 2

    const progress = useRef(new Animated.Value(value ? 1 : 0)).current

    useEffect(() => {
        Animated.timing(progress, {
            toValue: value ? 1 : 0,
            duration: 200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start()
    }, [value, progress])

    const trackColor = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [tokens.border, tokens.primary],
    })

    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [padding, padding + thumbTravel],
    })

    const handlePress = () => {
        if (!disabled) onValueChange(!value)
    }

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            testID={testID}
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled }}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            hitSlop={6}
            style={[
                styles.track,
                { width, height, borderRadius: height / 2, opacity: disabled ? 0.5 : 1 },
                style,
            ]}
        >
            <Animated.View
            className={'p-3'}
                style={[StyleSheet.absoluteFill, { borderRadius: height / 2, backgroundColor: trackColor }]}
            />
            <Animated.View
                style={[
                    styles.thumb,
                    {
                        width: thumb,
                        height: thumb,
                        borderRadius: thumb / 2,
                        top: (height - thumb) / 2,
                        transform: [{ translateX }],
                    },
                ]}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    thumb: {
        left: 0,
        backgroundColor: '#FFFFFF',
        // Subtle elevation so the thumb reads as a knob on both platforms
        shadowColor: '#0A0B0D',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 3,
    },
})

export default AuraSwitch
