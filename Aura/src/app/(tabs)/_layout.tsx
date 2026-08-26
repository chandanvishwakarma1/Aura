import { Colors } from '@/constants/Colors'
import { useTheme } from '@/lib/ThemeContext'
import { NativeTabs } from 'expo-router/unstable-native-tabs'

const TabLayout = () => {
  const {activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  return (
    <NativeTabs
      backgroundColor={isDark ? Colors.dark.background : Colors.light.background}
      rippleColor={'transparent'}
      // badgeBackgroundColor={'#e0e0e0'}
      iconColor={{
        default: isDark ? Colors.dark.textPrimary : Colors.light.textPrimary,
        selected: isDark ? Colors.dark.primary : Colors.light.primary,
      }}
      tintColor={isDark ? Colors.dark.primary : Colors.light.primary}
      indicatorColor={isDark ? Colors.dark.surface : Colors.light.surface}
    >
      <NativeTabs.Trigger name='index'>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md='home' sf='house.fill' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='discover'>
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md='explore' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='portfolio'>
        <NativeTabs.Trigger.Label>Portfolio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md='pie_chart' />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name='profile'>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md='person'/>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

export default TabLayout