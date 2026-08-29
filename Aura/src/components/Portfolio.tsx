import { View, Text } from 'react-native'
import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

const Aura = () => {
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'

    return (
        <View className='relative w-full h-full '>
            <View style={{ position: 'absolute' , bottom: 150, right: 30}}>
                <Svg
                    width={75}
                    height={75}
                    viewBox='-2 -2 80 80'
                    fill={'none'}
                    preserveAspectRatio='xMidYMid meet' >
                    <Path d="M27.2222 11.6667V27.2222M27.2222 50.5556V58.3334M58.3334 3.88892V11.6667M58.3334 42.7778V54.4445M3.88892 3.88892V66.1111C3.88892 68.1739 4.70836 70.1522 6.16697 71.6109C7.62559 73.0695 9.6039 73.8889 11.6667 73.8889H73.8889M23.3334 27.2222H31.1111C33.2589 27.2222 35 28.9634 35 31.1111V46.6667C35 48.8145 33.2589 50.5556 31.1111 50.5556H23.3334C21.1856 50.5556 19.4445 48.8145 19.4445 46.6667V31.1111C19.4445 28.9634 21.1856 27.2222 23.3334 27.2222ZM54.4445 11.6667H62.2222C64.37 11.6667 66.1111 13.4078 66.1111 15.5556V38.8889C66.1111 41.0367 64.37 42.7778 62.2222 42.7778H54.4445C52.2967 42.7778 50.5556 41.0367 50.5556 38.8889V15.5556C50.5556 13.4078 52.2967 11.6667 54.4445 11.6667Z"

                        stroke={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary}
                        strokeWidth={9}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </Svg>
            </View>
            <View style={{position:'absolute', bottom: 50, left:30}}>
                <Svg
                    width={105}
                    height={105}
                    viewBox='-2 -962 964 962'
                    fill={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary}
                    preserveAspectRatio='xMidYMid meet' >
                    <Path d="M520-520h278q-15-110-91.5-186.5T520-798v278Zm-80 358v-636q-121 15-200.5 105.5T160-480q0 122 79.5 212.5T440-162Zm80 0q110-14 187-91t91-187H520v278Zm-40-318Zm0 400q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Z"

                        stroke={isDark ? Colors.dark.textPrimary : Colors.light.textPrimary}
                        strokeWidth={3}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </Svg>
            </View>
        </View>
    )
}

export default Aura