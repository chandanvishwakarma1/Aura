import { useWindowDimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, TouchableWithoutFeedback, Keyboard, Pressable, NativeSyntheticEvent } from 'react-native'
import React, { useState } from 'react'
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import Logo from '../../../assets/Logo.svg';
import Apple from '../../../assets/Apple.svg';
import Google from '../../../assets/Google.svg'
import SegmentedControl, { NativeSegmentedControlIOSChangeEvent } from '@react-native-segmented-control/segmented-control'


const Index = () => {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [selectedIndex, setSelectIndex] = useState(0)
  const [isPassFocused, setIsPassFocused] = useState(false)
  const [signUpPass, setSignUpPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<String[] | null>(null)

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const { isLoading, logIn } = useAuthStore();

  const router = useRouter()

  const { width } = useWindowDimensions();
  const dynamicPaddingX = width * 0.16

  const handleLogin = async (userText: string, password: string) => {
    if (!userText.trim() || !password.trim()) {
      Alert.alert("Error", "Pleaase fill in all fields.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (userText.includes('@') && !emailRegex.test(userText)) {
      setErrors(['Please enter an valid email'])
      return;
    }
    if (password.length < 10) {
      setErrors(['Password must be atleast 10 characters long.']);
      return;
    }


    const result = await logIn(userText.trim(), password.trim())
    if (!result.success) { Alert.alert("Login Failed", result.message || "Something went wrong. Please try again later."); console.log(result.success, result.message) }
  }

  const handleRegister = async (username: string, email: string, password: string) => {
    if (!email.trim() || !signUpPass.trim()) {
      Alert.alert("Error", "Please fill in all fields.")
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      setErrors(['Please enter an valid email'])
      return;
    }
    if (signUpPass.length < 10) {
      setErrors(['Password must be atleast 10 characters long.']);
      return;
    }
    if (!/\d/.test(signUpPass)) { setErrors(['Password must contain atleast one number.']); return; };

    if (!/[A-Z]/.test(signUpPass)) { setErrors(['Password must contain atleast one Uppercase letter.']); return };

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(signUpPass)) { setErrors(['Password must contain atleast one Special character.']); return };
    if (!email.trim().includes('@')) {
      Alert.alert("Error", "Please enter an valid email")
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/checkUser`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again later.")

      setLoading(false)
      router.navigate({
        pathname: '/(auth)/(register)/Username',
        params: { email: email.trim(), password: signUpPass.trim() }
      })

    } catch (error: any) {
      setLoading(false)
      console.log("Error checking user", error.message)
      Alert.alert("Error", error.message || "Something went wrong. Please try again later.")
      return;
    }

  }

  const handleChangeInput = (value: string, setter: (v: string) => void) => {
    setter(value)
    if (errors) {
      setErrors(null)
    }

  }

  const isLoginFilled = text.length > 0 && password.length > 0
  const isRegisterFilled = email.length > 0 && signUpPass.length > 0;
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className='flex-1 mx-6  justify-center'>

          {/* Logo */}
          <View className={`flex-row  gap-3 items-center ${selectedIndex === 0 ? 'mb-12' : 'mb-6'}`}>
            <Logo height={'26'} width={'26'} />
            <Text className='text-3xl font-bold'>Aura</Text>
          </View>
          {
            selectedIndex === 0 ? (
              <View className='mb-6 gap-3'>
                <Text className='text-4xl font-bold '>Welocome Back!</Text>
                <Text className='text-base text-gray-600'>Log in to verify your next opportunity safely.</Text>
              </View>
            ) : (
              <View className='mb-6 gap-3'>
                <Text className='text-4xl font-bold '>Stay safe on your job hunt!</Text>
                <Text className='text-base text-gray-600'>Sign up now to start verifying job offers today.</Text>
              </View>
            )
          }

          <View className='mb-9'>
            <SegmentedControl
              values={['Login', 'Sign Up']}
              selectedIndex={selectedIndex}
              onChange={e => setSelectIndex(e.nativeEvent.selectedSegmentIndex)}
              backgroundColor='#e0e0e0'
              tintColor='#eeeeee'
              appearance='dark'
              fontStyle={{ color: "black" }}
              style={{ height: 40 }}
            />
          </View>

          {
            selectedIndex === 0 ? (
              <View className='w-full gap-3'>
                {
                  errors && (
                    <View>
                      <Text>{errors.map((error, index) => <Text className='text-red-400' key={index}>{error}</Text>)}</Text>
                    </View>
                  )
                }
                <View className={`border-2  rounded-xl  px-3 justify-center h-14 ${isEmailFocused ? 'border-black' : 'border-gray-300'}`}>
                  <TextInput
                    focusable
                    className='w-full text-base'
                    placeholder='Username or Email'
                    value={text}
                    onChangeText={v => handleChangeInput(v, setText)}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                  />
                </View>

                <View className={`border-2  rounded-xl px-3 justify-center h-14 flex-row items-center ${isPassFocused ? 'border-black' : 'border-gray-300'}`}>
                  <TextInput
                    className='flex-1 text-base'
                    placeholder='Password'
                    value={password}
                    onChangeText={v => handleChangeInput(v, setPassword)}
                    secureTextEntry={!showPass}
                    keyboardType='default'

                    autoCapitalize='none'
                    onFocus={() => setIsPassFocused(true)}
                    onBlur={() => setIsPassFocused(false)}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    {
                      showPass ? <Eye /> : <EyeOff />
                    }
                  </TouchableOpacity>
                </View>

                <TouchableOpacity disabled={isLoading} className={`items-center justify-center h-14 rounded-xl pr-3 ${isLoading ? 'bg-gray-300' : 'bg-blue-400'} ${isLoginFilled ? 'bg-blue-400' : 'bg-gray-300'}`} onPress={() => handleLogin(text, password)}>
                  {
                    isLoading ? (
                      <ActivityIndicator size='small' color='white' />
                    ) : (
                      <Text className='text-lg font-bold text-white'>Log In</Text>
                    )
                  }
                </TouchableOpacity>
                <View className='flex-row mt-1'>
                  <Text>Dont have an account? </Text>
                  <Pressable onPress={() => setSelectIndex(1)}>
                    <Text className='text-blue-400 font-semibold'>Sign Up</Text>
                  </Pressable>
                </View>
                <View className='w-full'>
                  <View className='flex-row w-full items-center my-4'>
                    <View className='flex-1 h-[1px] bg-gray-300'></View>
                    <Text className='mx-4 text-gray-400 font-normal'>Or login with</Text>
                    <View className='flex-1  h-[1px] bg-gray-300'></View>
                  </View>
                  <View className='flex-row w-full items-center justify-center gap-3'>
                    <Pressable className='flex-1 items-center justify-center py-4 bg-gray-300 rounded-xl'>
                      <Google width={24} height={24} />
                    </Pressable>
                    <Pressable className='flex-1 items-center justify-center py-4 bg-gray-300 rounded-xl'>
                      <Apple width={24} height={24} />
                    </Pressable>
                  </View>
                </View>
                <View className='flex-row flex-wrap items-center mt-24'>
                  <Text>By signing up, you agree to the </Text>
                  <Pressable><Text className='text-blue-400 font-semibold'>Terms of Service</Text></Pressable>
                  <Text>and </Text>
                  <Pressable><Text className='text-blue-400 font-semibold'> Data Processing Agreement</Text></Pressable>
                </View>
              </View>

            ) : (
              <View>
                <View className='w-full gap-3'>
                  {
                    errors && (
                      <View>
                        <Text>{errors.map((error, index) => <Text className='text-red-400' key={index}>{error}</Text>)}</Text>
                      </View>
                    )
                  }
                  <View className={`border-2  rounded-xl  px-3 justify-center h-14 ${isEmailFocused ? 'border-black' : 'border-gray-300'}`}>
                    <TextInput
                      placeholder='Email'
                      value={email}
                      onChangeText={v => handleChangeInput(v, setEmail)}
                      autoCapitalize='none'
                      keyboardType='email-address'
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                    />

                  </View>
                  <View className={`border-2 flex-row  rounded-xl  px-3 items-center justify-center h-14 ${isPassFocused ? 'border-black' : 'border-gray-300'}`}>
                    <TextInput
                      className='flex-1 text-base'
                      placeholder='Password'
                      value={signUpPass}
                      onChangeText={v => handleChangeInput(v, setSignUpPass)}
                      secureTextEntry={!showPass}
                      keyboardType='default'
                      autoCapitalize='none'
                      onFocus={() => setIsPassFocused(true)}
                      onBlur={() => setIsPassFocused(false)}
                    />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      {
                        showPass ? <Eye color={'#4b5563'} /> : <EyeOff color={'#4b5563'} />
                      }
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity disabled={isLoading} className={`items-center justify-center h-14 rounded-xl pr-3 ${isLoading ? 'bg-gray-300' : 'bg-blue-400'} ${loading ? 'bg-gray-300' : 'bg-blue-400'} ${isRegisterFilled ? 'bg-blue-400' : 'bg-gray-300'}`} onPress={() => handleRegister(username, email, password)}>
                    {
                      isLoading || loading ? (
                        <ActivityIndicator size='small' color='white' />
                      ) : (
                        <Text className='text-lg font-bold text-white'>Sign Up</Text>
                      )
                    }
                  </TouchableOpacity>
                  <View className='flex-row mt-1'>
                    <Text>Already have an account? </Text>
                    <Pressable onPress={() => setSelectIndex(0)}>
                      <Text className='text-blue-400 font-semibold'>Login</Text>
                    </Pressable>
                  </View>
                  <View className='w-full'>
                    <View className='flex-row w-full items-center my-4'>
                      <View className='flex-1 h-[1px] bg-gray-300'></View>
                      <Text className='mx-4 text-gray-400 font-normal'>Or</Text>
                      <View className='flex-1  h-[1px] bg-gray-300'></View>
                    </View>
                    <View className='flex-row w-full items-center justify-center gap-3'>
                      <Pressable className='flex-1 items-center justify-center py-4 bg-gray-300 rounded-xl'>
                        <Google width={24} height={24} />
                      </Pressable>
                      <Pressable className='flex-1 items-center justify-center py-4 bg-gray-300 rounded-xl'>
                        <Apple width={24} height={24} />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <View className='flex-row flex-wrap items-center mt-24'>
                  <Text>By signing up, you agree to the </Text>
                  <Pressable><Text className='text-blue-400 font-semibold'>Terms of Service</Text></Pressable>
                  <Text>and </Text>
                  <Pressable><Text className='text-blue-400 font-semibold'> Data Processing Agreement</Text></Pressable>
                </View>
              </View>
            )
          }
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView >
  )
}

export default Index

const styles = StyleSheet.create({})