import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'

//normalize if id to _id
const normalizeUser = (user) => {
    if (!user) return null
    return { ...user, _id: user._id || user.id }
}



export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    hasAccount: false,
    tempGoogleUser: null,
    // Local marker that the user has completed the pre-auth onboarding intro.
    // Distinct from backend `user.hasOnboarded`, which only exists after sign-up.
    hasSeenOnboarding: false,
    isCheckingAuth: true,
    setUser: (updatedUser) => {
        const normalizedUser = normalizeUser(updatedUser)
        set({ user: normalizedUser })
        if (updatedUser) AsyncStorage.setItem("user", JSON.stringify(normalizedUser)).catch(e => console.log("Error persisting user", e))
    },

    completeOnboarding: () => {
        set({ hasSeenOnboarding: true })
        AsyncStorage.setItem("hasSeenOnboarding", "true").catch(e => console.log("Error persisting onboarding flag", e))
    },

    setTempGoogleUser: (googleData) => {
        set({ tempGoogleUser: googleData })
    },

    register: async (otp, username, email, password, fullName, onboarding = {}) => {
        set({ isLoading: true })
        try {

            const tempGoogle = get().tempGoogleUser

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
                    googleId: tempGoogle?.googleId || null,
                    experience: onboarding.experience,
                    riskAppetite: onboarding.riskAppetite,
                    capital: onboarding.capital,
                    goal: onboarding.goal,
                    profileIds: onboarding.profileIds,
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Something went wrong')

            const normalizedUser = normalizeUser(data.user)
            await AsyncStorage.setItem("user", JSON.stringify(normalizedUser))
            await AsyncStorage.setItem("hasAccount", "true")
            await SecureStore.setItemAsync("token", data.token)

            set({
                token: data.token,
                user: normalizedUser,
                tempGoogleUser: null,
                hasAccount: true,
                isLoading: false
            })

            return ({ success: true })
        } catch (error) {
            set({ isLoading: false })
            return ({ success: false, message: error.message })
        }
    },

    logIn: async (userText, password) => {
        set({ isLoading: true })

        const isEmail = userText.includes("@")
        const username = isEmail ? "" : userText
        const email = isEmail ? userText : ""

        try {
            console.log(process.env.EXPO_PUBLIC_BACKEND_URL)
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/login`, {
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
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Something went wrong')

            const normalizedUser = normalizeUser(data.user)
            await AsyncStorage.setItem("user", JSON.stringify(normalizedUser))
            await AsyncStorage.setItem("hasAccount", "true")
            await SecureStore.setItemAsync("token", data.token)

            set({ token: data.token, user: normalizedUser, hasAccount: true, isLoading: false })

            return ({ success: true, message: "Logged in successfully" })
        } catch (error) {
            set({ isLoading: false })
            return ({ success: false, message: error.message })
        }
    },
    googleSignin: async () => {
        set({ isLoading: true })
        try {
            await GoogleSignin.hasPlayServices()

            const response = await GoogleSignin.signIn()
            const idToken = response?.data?.idToken

            if (!idToken) throw new Error("Failed to fetch secure Google id token")

            const backendResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/google`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken })
            })

            const data = await backendResponse.json()
            if (!backendResponse.ok) throw new Error(data.message || "Backend Google auth failed")

            if (data.isNewUser) {
                set({
                    tempGoogleUser: data.googleData,
                    isLoading: false
                })

                return {
                    success: true,
                    isNewUser: true,
                    googleData: data.googleData
                }
            }

            const normalizedUser = normalizeUser(data.user)
            await AsyncStorage.setItem("user", JSON.stringify(normalizedUser))
            await AsyncStorage.setItem("hasAccount", "true")
            await SecureStore.setItemAsync("token", data.token)

            set({
                token: data.token,
                user: normalizedUser,
                hasAccount: true,
                isLoading: false
            })

            return { success: true, isNewUser: false, message: "Google auth login successfull" }
        } catch (error) {
            set({ isLoading: false })
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow')
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in operation is already in progress')
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Google play service not available')
            } else {
                console.log('Something went wrong: ', error)
            }
            return { success: false, message: error.message }
        }
    },
    logOut: async () => {
        try {

            const isGoogleSignin = await GoogleSignin.isGoogleSignin()
            if (isGoogleSignin) {
                await GoogleSignin.signOut()
            }

            await AsyncStorage.removeItem("user")
            await SecureStore.deleteItemAsync("token")

            set({ user: null, token: null, tempGoogleUser: null })
        } catch (error) {
            console.log("Error logging out", error)
        }
    },
    checkAuth: async () => {
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
        } catch (error) {
            console.log("Auth check failed: ", error)
        } finally {
            set({ isCheckingAuth: false })
        }
    }
}))