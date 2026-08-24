import { Stack } from 'expo-router'

const PositionLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name='[id]' />
    </Stack>
  )
}

export default PositionLayout