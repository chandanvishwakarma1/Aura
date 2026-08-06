import { Stack } from 'expo-router'
import { NativeTabs } from 'expo-router/build/native-tabs'

const TabLayout = () => {
  return (
    <NativeTabs
      backgroundColor={'white'}
      rippleColor={'#e0e0e0'}
      badgeBackgroundColor={'#e0e0e0'}
      tintColor={'black'}
      indicatorColor={'#e0e0e0'}
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