import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { useAuthStore } from '../../../../store/authStore';
import { useLocalSearchParams, useRouter } from 'expo-router';

const Username = () => {
    const [fullname, setfullname] = useState('');
    const [isFocused, setIsFocused] = useState(false)
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false)
    const isFilled = fullname.length > 0

   
    const router = useRouter();
    const params = useLocalSearchParams();
    const {username,password} = params
    const email = Array.isArray(params.email) ? params.email[0] : params.email;
    
    const handleNext = async (userEmail: string, userFullName: string) => {
        if(!userFullName) {
            Alert.alert("Error", "Please fill in detail first.")
            return;
        }
        if(userFullName.length < 2) {
            Alert.alert("Error", "Please enter a valid name.")
        return;}
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
                email,password, 
                fullName: userFullName.trim()}
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
            <View className='flex-1 mx-6 '>
                <View className='flex-row py-4 items-center gap-4'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft />
                    </TouchableOpacity>
                    <Text className='font-semibold text-xl'>Name</Text>
                </View>
                <View className='flex-1 justify-start mt-9 gap-3'>
                    <View className='mb-2 gap-2'>
                        <Text className='text-3xl font-bold text-gray-900'>What's your name?</Text>
                    
                    </View>
                    <View className={`border-2 flex-row items-center rounded-xl  px-3 justify-center h-14 ${isFocused ? 'border-black' : 'border-gray-300'}`}>
                        <TextInput
                            className='flex-1'
                            placeholder='First and Last name'
                            value={fullname}
                            onChangeText={setfullname}
                            autoCapitalize='words'
                            autoComplete='name'
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)} />
                    </View>
                    <TouchableOpacity className={`items-center justify-center h-14 rounded-xl pr-3 ${otpLoading ? 'bg-gray-300' : 'bg-blue-400'} ${isFilled ? 'bg-blue-400' : 'bg-gray-300'} `} onPress={() => handleNext(email ,fullname.trim())} disabled={otpLoading} >
                        {
                            otpLoading ? (
                                <ActivityIndicator size={'small'} color={'white'} />
                            ) : (

                                <Text className='text-lg font-bold text-white'>Next</Text>
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