import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState } from 'react'
import { useLoaderData, useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { OtpInput } from 'react-native-otp-entry'
import { useAuthStore } from '../../../../store/authStore'

const Verify = () => {
    const router = useRouter()
    const params = useLocalSearchParams();
    const { isLoading, register } = useAuthStore();
    const [otpCode, setOtpCode] = useState('')
    const getStringParam = (param: string | string[] | undefined): string => {
        if(!param) return '';

        return Array.isArray(param) ? param[0] : param
    }

    const username = getStringParam(params.username)
    const email = getStringParam(params.email)
    const password = getStringParam(params.password)
    const fullName = getStringParam(params.fullName)

    const handleNext = async (otp: string) => {
        console.log("store: ", otp,username, email,password,fullName)
        if (!otp) {
            Alert.alert("Error", "Please fill in detail first.")
            return;
        }
        const result = await register(otp, username, email, password, fullName)
        if(!result.success) Alert.alert("Error", result.message || "Something went wrong. Please try again later.")
    }
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className='flex-1 mx-6'>
                    <View className='flex-row py-4 items-center gap-4'>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ArrowLeft />
                        </TouchableOpacity>
                        <Text className='font-semibold text-xl'>Create account</Text>
                    </View>
                    <View className='flex-1 justify-normal mt-9 gap-3'>
                        <View className='gap-3 mb-6'>
                            <Text className='text-3xl font-bold'>One last step to verify your email.</Text>
                            <Text className='text-base text-gray-600'>Enter 6 digit code sent your email {email}</Text>
                        </View>

                        <View className='gap-6'>
                            <OtpInput
                                numberOfDigits={6}
                                focusColor={'#60a5fa'}
                                autoFocus={true}
                                hideStick={false}
                                placeholder='------'
                                blurOnFilled={true}
                                disabled={false}
                                type='numeric'
                                secureTextEntry={false}
                                onTextChange={(text)=> setOtpCode(text)}
                                focusStickBlinkingDuration={600}
                                onFilled={(text) => {setOtpCode(text); handleNext(text)}}
                                theme={{
                                    containerStyle: {
                                        width: '100%',
                                        marginHorizontal: 3,
                                        alignContent: 'flex-end'
                                    },
                                    pinCodeContainerStyle: {
                                        marginRight: 10,
                                    }
                                }}
                            />
                            <TouchableOpacity 
                            disabled={isLoading || otpCode.length < 6} 
                            className={`items-center justify-center h-14 rounded-xl pr-3 ${otpCode.length === 6  ? 'bg-blue-400' : 'bg-gray-300'} ${isLoading ? 'bg-gray-300' : 'bg-blue-400'}`} onPress={()=>handleNext(otpCode)}  >
                                {
                                    isLoading ? (
                                        <ActivityIndicator size={'small'} color={'white'} />
                                    ) : (
                                        <Text className='text-lg font-bold text-white'>Next</Text>
                                    )
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

export default Verify

const styles = StyleSheet.create({})