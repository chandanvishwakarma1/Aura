import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme as useNativeColorScheme } from "nativewind"
import { useColorScheme as useRNColorScheme } from "react-native"

const THEME_KEY = '@app_theme_preference'

export type ThemeMode = 'system' | 'light' | 'dark'

type ThemeContextValue = {
    themeMode: ThemeMode,
    activeTheme: 'light' | 'dark',
    updateTheme: (mode: ThemeMode) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue>({
    themeMode: 'system',
    activeTheme: 'light',
    updateTheme: async () => { },
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useRNColorScheme()
    const { setColorScheme } = useNativeColorScheme()
    const [themeMode, setThemeMode] = useState<ThemeMode>('system')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        ; (async () => {
            try {
                const saved = (await AsyncStorage.getItem(THEME_KEY)) as ThemeMode | null
                if (saved) setThemeMode(saved)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const activeTheme: 'light' | 'dark' =
        themeMode === 'system'
            ? (systemColorScheme === 'dark' ? 'dark' : 'light')
            : (themeMode === 'dark' ? 'dark' : 'light')

    useEffect(() => {
        setColorScheme(themeMode === 'system' ? 'system' : activeTheme)
    }, [activeTheme, themeMode, setColorScheme])
    
    const updateTheme = async (mode: ThemeMode): Promise<void> => {
        setThemeMode(mode)

        try {
            if (mode === 'system') {
                await AsyncStorage.removeItem(THEME_KEY)
            } else {
                await AsyncStorage.setItem(THEME_KEY, mode)
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) {
        return null
    }

    return React.createElement(
        ThemeContext.Provider,
        {
            value: {
                themeMode,
                activeTheme,
                updateTheme,
            }
        },
        children
    )
}

export const useTheme = () => useContext(ThemeContext)