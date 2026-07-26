import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useAuthStore } from '../../../store/authStore'

const Index = () => {
  const { logOut, user } = useAuthStore();
  return (
    <TouchableOpacity className='flex-1 items-center justify-center' onPress={logOut}>
      <Text>{user?.username}</Text>
      <Text>lougout</Text>
    </TouchableOpacity>
  )
}

export default Index

const styles = StyleSheet.create({})