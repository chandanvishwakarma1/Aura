import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { useAuthStore } from '../../../../store/authStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { extractOnboardingParams, onboardingParamsToRoute } from '@/utils/onboarding';
import { useTheme } from '@/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

const Username = () => {
    const [fullname, setfullname] = useState('');
    const [isFocused, setIsFocused] = useState(false)
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false)
    const isFilled = fullname.length > 0


    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'

    const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary
    const primary = isDark ? Colors.dark.primary : Colors.light.primary
    const border = isDark ? Colors.dark.border : Colors.light.border
    const borderFocus = isDark ? Colors.dark.borderFocus : Colors.light.borderFocus
    const buttonSecondary = isDark ? Colors.dark.buttonSecondary : Colors.light.buttonSecondary


    const router = useRouter();
    const params = useLocalSearchParams();
    const { username, password } = params
    const email = Array.isArray(params.email) ? params.email[0] : params.email;

    const handleNext = async (userEmail: string, userFullName: string) => {
        if (!userFullName) {
            Alert.alert("Error", "Please fill in detail first.")
            return;
        }
        if (userFullName.length < 2) {
            Alert.alert("Error", "Please enter a valid name.")
            return;
        }
        setOtpLoading(true)
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/requestOtp`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail,
                    purpose: 'verify_email'
                })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Something went wrong')

            if (data.success) console.log(data.message)
            setOtpLoading(false)
            router.navigate({
                pathname: '/(auth)/(register)/Verify',
                params: {
                    username,
                    email, password,
                    fullName: userFullName.trim(),
                    ...onboardingParamsToRoute(extractOnboardingParams(params))
                } as Record<string, string>
            })
        } catch (error: any) {
            console.log("Error requesting otp: ", error)
            setOtpLoading(false)
            Alert.alert("Error", `${error?.message || "Something went wrong"}. Please try again later.`)
            return;
        }
    }



    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className='flex-1 mx-6 mt-6'>
                    <View className='flex-row py-4 items-center gap-4'>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ArrowLeft color={textSecondary} />
                        </TouchableOpacity>
                        <View className='absolute inset-0 items-center justify-center pointer-events-none'>
                            <Text className='text-xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Name</Text>
                        </View>
                    </View>
                    <View className='flex-1 justify-start mt-9 gap-3'>
                        <View className='mb-2 gap-2'>
                            <Text className='text-3xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>What's your name?</Text>

                        </View>
                        <View
                            className={`border-2 flex-row items-center rounded-3xl  px-3 justify-center h-14'}`}
                            style={{ borderColor: isFocused ? borderFocus : border }}
                        >
                            <TextInput
                                className='flex-1 text-aura-text-primary dark:text-aura-text-primary-dark'
                                placeholderTextColor={textSecondary}
                                placeholder='First and Last name'
                                value={fullname}
                                onChangeText={setfullname}
                                autoCapitalize='words'
                                autoComplete='name'
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)} />
                        </View>
                        <TouchableOpacity
                            className={`items-center justify-center h-14 rounded-full pr-3 `}
                            style={{ backgroundColor: otpLoading ? primary : isFilled ? primary : textSecondary }}
                            onPress={() => handleNext(email, fullname.trim())}
                            disabled={otpLoading}
                        >
                            {
                                otpLoading ? (
                                    <ActivityIndicator size={'small'} color={'white'} />
                                ) : (

                                    <Text className='text-lg font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Next</Text>
                                )}

                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView >
    )
}

export default Username

const styles = StyleSheet.create({})