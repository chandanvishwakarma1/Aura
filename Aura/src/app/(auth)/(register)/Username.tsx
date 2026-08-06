import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { useAuthStore } from '../../../../store/authStore';
import { useLocalSearchParams, useRouter } from 'expo-router';

const Username = () => {
    const [username, setUsername] = useState('');
    const [isUsernameFocused, setIsUsernameFocused] = useState(false)
    const [loading, setLoading] = useState(false);
    const [isAvailable, setIsAvailble] = useState<boolean | null>(null);
    const [errors, setErrors] = useState<[] | null>(null)

    useEffect(() => {
        if (!username.trim()) {
            setIsAvailble(null)
            setLoading(false)
            return;
        }

        setLoading(true)
        setIsAvailble(null)

        const debounce = setTimeout(() => {
            checkUsername(username)
        }, 600)

        return () => clearTimeout(debounce)
    }, [username])
    const router = useRouter();
    const params = useLocalSearchParams();
    const { password } = params;
    const email = Array.isArray(params.email) ? params.email[0] : params.email;
    const checkUsername = async (currentUsername: string) => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/checkUsername`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: currentUsername })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || "Something went wrong.")

            if (data.success) {
                setIsAvailble(true)
                setErrors(null)
            }
            else { setIsAvailble(false); setErrors(data.message) }
        } catch (error: any) {
            console.log(error)
            setErrors(error.message)
            setIsAvailble(false)
        } finally {
            setLoading(false)
        }
    }
    const handleNext = (userName: string) => {

        router.navigate({
            pathname: '/(auth)/(register)/Fullname',
            params: {
                email,
                password,
                username: userName.trim().toLowerCase()
            }
        })
    }
    const handleChangeInput = (value: string, setter: (v: string) => void) => {
        setter(value)
        if (errors) {
            setErrors(null)
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
                        <Text className='font-semibold text-xl'>Username</Text>
                    </View>
                    <View className='flex-1 justify-start mt-9 gap-3'>
                        <View className='mb-2 gap-2'>
                            <Text className='text-3xl font-bold text-gray-900'>Choose a username</Text>
                            <Text className='text-base text-gray-600'>This is how you will appear when flaggings fake listings or leaving employer reviews.</Text>
                        </View>
                        {
                            errors &&
                            <Text className='text-red-400'>{errors}</Text>

                        }
                        <View className={`border-2 flex-row items-center rounded-xl  px-3 justify-center h-14 ${isUsernameFocused ? 'border-black' : 'border-gray-300'}`}>
                            <TextInput
                                className='flex-1'
                                placeholder='Username'
                                value={username}
                                onChangeText={v => handleChangeInput(v, setUsername)}
                                autoCapitalize='none'
                                onFocus={() => setIsUsernameFocused(true)}
                                onBlur={() => setIsUsernameFocused(false)} />
                            {
                                loading && (
                                    <ActivityIndicator size='small' color='black' />
                                )}
                            {
                                !loading && isAvailable === true && (
                                    <Check color={"green"} size={20} />
                                )
                            }
                            {
                                !loading && isAvailable === false && (
                                    <X color={"red"} size={20} />
                                )
                            }
                        </View>
                        <TouchableOpacity className={`items-center justify-center h-14 rounded-xl pr-3 ${isAvailable === true ? 'bg-blue-400' : 'bg-gray-300'} `} onPress={() => handleNext(username)} disabled={loading} >


                            <Text className='text-lg font-bold text-white'>Next</Text>


                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView >
    )
}

export default Username

const styles = StyleSheet.create({})