import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const GroupLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name='index' />
        <Stack.Screen name='Metrics' />
    </Stack>
  )
}

export default GroupLayout