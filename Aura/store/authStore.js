import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

//normalize if id to _id
const normalizeUser = (user) => {
    if (!user) return null
    return { ...user, _id: user._id || user.id }
}



export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    hasAccount: false,
    // Local marker that the user has completed the pre-auth onboarding intro.
    // Distinct from backend `user.hasOnboarded`, which only exists after sign-up.
    hasSeenOnboarding: false,
    isCheckingAuth: true,
    setUser: (updatedUser) => {
        set({ user: updatedUser })
        if (updatedUser) AsyncStorage.setItem("user", JSON.stringify(updatedUser)).catch(e => console.log("Error persisting user", e))
    },

    completeOnboarding: () => {
        set({ hasSeenOnboarding: true })
        AsyncStorage.setItem("hasSeenOnboarding", "true").catch(e => console.log("Error persisting onboarding flag", e))
    },

    register: async (otp, username, email, password, fullName, onboarding = {}) => {
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
                    password,
                    experience: onboarding.experience,
                    riskAppetite: onboarding.riskAppetite,
                    capital: onboarding.capital,
                    goal: onboarding.goal,
                    profileIds: onboarding.profileIds,
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Something went wrong')

            await AsyncStorage.setItem("user", JSON.stringify(normalizeUser(data.user)))
            await AsyncStorage.setItem("hasAccount", "true")
            await SecureStore.setItemAsync("token", data.token)

            set({
                token: data.token,
                user: normalizeUser(data.user),
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

            await AsyncStorage.setItem("user", JSON.stringify(normalizeUser(data.user)))
            await AsyncStorage.setItem("hasAccount", "true")
            await SecureStore.setItemAsync("token", data.token)

            set ({ token: data.token, user: normalizeUser(data.user), isLoading: false })

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
            const hasAccount = await AsyncStorage.getItem("hasAccount")
            const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding")
            const user = userString ? normalizeUser(JSON.parse(userString)) : null

            set({ 
                token, 
                user, 
                hasAccount: hasAccount === 'true',
                hasSeenOnboarding: hasSeenOnboarding === 'true'
            })
        } catch(error) {
            console.log("Auth check failed: ", error)
        } finally {
            set({ isCheckingAuth: false })
        }
    }
}))