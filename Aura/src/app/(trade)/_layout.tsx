import { Stack } from 'expo-router'

const TradeLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name='[id]' />
        <Stack.Screen name='Trade' />
    </Stack>
  )
}

export default TradeLayout