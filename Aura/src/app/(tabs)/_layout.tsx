import { Stack } from 'expo-router'
import { NativeTabs } from 'expo-router/build/native-tabs'

const TabLayout = () => {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name='index'>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

export default TabLayout