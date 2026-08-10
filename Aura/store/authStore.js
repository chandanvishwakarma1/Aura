import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'


export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,
    setUser: (updatedUser) => set({ user: updatedUser}),

    register: async (otp, username, email, password, fullName) => {
        set({ isLoading: true })
        try {
            console.log(process.env.EXPO_PUBLIC_BACKEND_URL)
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userOtp: otp,
                    username,
                    fullName,
                    email,
                    password
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Something went wrong')

            await AsyncStorage.setItem("user", JSON.stringify(data.user))
            await SecureStore.setItemAsync("token", data.token)

            set({
                token: data.token,
                user: data.user,
                isLoading: false
            })

            return ({ success: true })
        } catch (error) {
            set({isLoading: false})
            return ({ success: false, message: error.message})
        }
    },

    logIn: async ( userText, password )=> {
        set({ isLoading: true })

        const isEmail = userText.includes("@")
        const username = isEmail ? "" : userText
        const email = isEmail ? userText : ""

        try {
            console.log(process.env.EXPO_PUBLIC_BACKEND_URL)
            const reponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            })
            const data = await reponse.json()
            if(!reponse.ok) throw new Error( data.message || 'Something went wrong')

            await AsyncStorage.setItem("user", JSON.stringify(data.user))
            await SecureStore.setItemAsync("token", data.token)

            set ({ token: data.token, user: data.user, isLoading: false })

            return ({ success: true, message: "Logged in successfully" })
        } catch (error) {
            set({ isLoading:false})
            return ({ success: false, message: error.message})
        }
    },
    logOut: async()=> {
        try {
            await AsyncStorage.removeItem("user")
            await SecureStore.deleteItemAsync("token")

            set({ user: null, token: null })
        } catch (error) {
            console.log("Error logging out", error)
        }
    },
    checkAuth: async()=> {
        try {
            const token = await SecureStore.getItemAsync("token")
            const userString = await AsyncStorage.getItem("user")
            const user = userString ? JSON.parse(userString) : null

            set({ token, user})
        } catch(error) {
            console.log("Auth check failed: ", error)
        } finally {
            set({ isCheckingAuth: false })
        }
    }
}))