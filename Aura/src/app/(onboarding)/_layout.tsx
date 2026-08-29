import { Stack } from 'expo-router'

const OnboardingLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
        <Stack.Screen name='Experience' />
        <Stack.Screen name='Risk' />
        <Stack.Screen name='Capital' />
        <Stack.Screen name='Curate' />
        <Stack.Screen name='Consent' />
    </Stack>
  )
}

export default OnboardingLayout