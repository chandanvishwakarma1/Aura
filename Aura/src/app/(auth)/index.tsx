import { useWindowDimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, TouchableWithoutFeedback, Keyboard, Pressable, NativeSyntheticEvent } from 'react-native'
import React, { useState } from 'react'
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import Aura from '@/components/Aura';
import Apple from '@/components/Apple';
import Google from '../../../assets/Google.svg'
import SegmentedControl, { NativeSegmentedControlIOSChangeEvent } from '@react-native-segmented-control/segmented-control'
import { useTheme } from '@/lib/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import { extractOnboardingParams, onboardingParamsToRoute } from '@/utils/onboarding';

type FocusedFeild = 'loginText' | 'loginPass' | 'signUpEmail' | 'signUpPass' | null
const Index = () => {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  // const [isEmailFocused, setIsEmailFocused] = useState(false)
  const routeParams = useLocalSearchParams<Record<string, string>>()
  const isRegisterMode = (Array.isArray(routeParams.mode) ? routeParams.mode[0] : routeParams.mode) === 'register'
  const [selectedIndex, setSelectIndex] = useState(isRegisterMode ? 1 : 0)
  // const [isPassFocused, setIsPassFocused] = useState(false)
  const [signUpPass, setSignUpPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<String[] | null>(null)

  const [focusedFeild, setFocusedFeild] = useState<FocusedFeild>(null)

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const { isLoading, logIn } = useAuthStore();

  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  const primary = isDark ? Colors.dark.primary : Colors.light.primary
  const textPrimary = isDark ? Colors.dark.textPrimary : Colors.light.textPrimary
  const border = isDark ? Colors.dark.border : Colors.light.border
  const borderFocus = isDark ? Colors.dark.borderFocus : Colors.light.borderFocus
  const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary
  
    const buttonSecondary = isDark ? Colors.dark.buttonSecondary : Colors.light.buttonSecondary

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
        params: {
          email: email.trim(),
          password: signUpPass.trim(),
          ...onboardingParamsToRoute(extractOnboardingParams(routeParams)),
        }
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

  const handleTabChange = (index: number) => {
    Keyboard.dismiss()
    setFocusedFeild(null)
    setErrors(null)
    setSelectIndex(index)

  }

  const isLoginFilled = text.length > 0 && password.length > 0
  const isRegisterFilled = email.length > 0 && signUpPass.length > 0;
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setFocusedFeild(null); }}>
        <View className='flex-1 mx-6 justify-center'>

          {/* Logo */}
          <View className={`flex-row  gap-3 items-center mb-6 `}>
            <Aura />
          </View>
          {
            selectedIndex === 0 ? (
              <View className='mb-6 gap-3'>
                <Text className='text-4xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Welocome Back!</Text>
              </View>
            ) : (
              <View className='mb-6 gap-3'>
                <Text className='text-4xl font-bold text-aura-text-primary dark:text-aura-text-primary-dark'>Get Started!</Text>
              </View>
            )
          }

          <View className='mb-9'>
            <SegmentedControl
              values={['Login', 'Sign Up']}
              selectedIndex={selectedIndex}
              onChange={e => handleTabChange(e.nativeEvent.selectedSegmentIndex)}
              backgroundColor={isDark ? Colors.dark.surface : Colors.light.surface}
              tintColor={isDark ? Colors.dark.background : Colors.light.background}
              appearance={isDark ? 'dark' : 'light'}
              fontStyle={{ color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary, fontFamily: 'Aura-Medium' }}
              activeFontStyle={{ color: isDark ? Colors.dark.textPrimary : Colors.light.textPrimary, fontFamily: 'Aura-Bold' }}
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
                <View className={`border-2  rounded-3xl  px-3 justify-center h-14 `}

                  style={{ borderColor: focusedFeild === 'loginText' ? borderFocus : border }}
                >
                  <TextInput
                    focusable
                    className='w-full text-base text-aura-text-primary dark:text-aura-text-primary-dark'
                    placeholder='Username or Email'
                    placeholderTextColor={textSecondary}
                    value={text}
                    onChangeText={v => handleChangeInput(v, setText)}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    onFocus={() => setFocusedFeild('loginText')}
                    onBlur={() => setFocusedFeild(null)}
                  />
                </View>

                <View className={`border-2  rounded-3xl px-3 justify-center h-14 flex-row items-center `}
                  style={{ borderColor: focusedFeild === 'loginPass' ? borderFocus : border }}
                >
                  <TextInput
                    className='flex-1 text-base text-aura-text-primary dark:text-aura-text-primary-dark'
                    placeholder='Password'
                    placeholderTextColor={textSecondary}
                    value={password}
                    onChangeText={v => handleChangeInput(v, setPassword)}
                    secureTextEntry={!showPass}
                    keyboardType='default'

                    autoCapitalize='none'
                    onFocus={() => setFocusedFeild('loginPass')}
                    onBlur={() => setFocusedFeild(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    {
                      showPass ? <Eye color={primary} /> : <EyeOff color={primary} />
                    }
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  disabled={isLoading}
                  className={`items-center justify-center h-14 rounded-full pr-3`}
                  style={{ backgroundColor: isLoginFilled ? primary : isLoading ? primary : buttonSecondary }}
                  onPress={() => handleLogin(text, password)}>
                  {
                    isLoading ? (
                      <ActivityIndicator size='small' color={textPrimary} />
                    ) : (
                      <Text className='text-lg font-bold text-aura-text-primary-dark dark:text-aura-text-primary-dark'>Log In</Text>
                    )
                  }
                </TouchableOpacity>
                <View className='flex-row mt-1'>
                  <Text className='text-aura-text-primary dark:text-aura-text-primary-dark'>Dont have an account? </Text>
                  <Pressable onPress={() => setSelectIndex(1)}>
                    <Text className='text-aura-primary font-semibold'>Sign Up</Text>
                  </Pressable>
                </View>
                <View className='w-full'>
                  <View className='flex-row w-full items-center my-4'>
                    <View className='flex-1 h-[1px] bg-aura-surface dark:bg-aura-surface-elevated-dark'></View>
                    <Text className='mx-4 text-aura-text-secondary dark:text-aura-text-secondary-dark font-normal'>Or login with</Text>
                    <View className='flex-1  h-[1px] bg-aura-surface dark:bg-aura-surface-elevated-dark'></View>
                  </View>

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
                  <View className={`border-2  rounded-3xl  px-3 justify-center h-14`}

                    style={{ borderColor: focusedFeild === 'signUpEmail' ? borderFocus : border }}
                  >
                    <TextInput
                    className='text-aura-text-primary dark:text-aura-text-primary-dark'
                      placeholder='Email'
                      placeholderTextColor={textSecondary}
                      value={email}
                      onChangeText={v => handleChangeInput(v, setEmail)}
                      autoCapitalize='none'
                      keyboardType='email-address'
                      onFocus={() => setFocusedFeild('signUpEmail')}
                      onBlur={() => setFocusedFeild(null)}
                    />

                  </View>
                  <View className={`border-2 flex-row  rounded-3xl  px-3 items-center justify-center h-14 `}

                    style={{ borderColor: focusedFeild === 'signUpPass' ? borderFocus : border }}
                  >
                    <TextInput
                      className='flex-1 text-base text-aura-text-primary dark:text-aura-text-primary-dark'
                      placeholder='Password'
                      placeholderTextColor={textSecondary}
                      value={signUpPass}
                      onChangeText={v => handleChangeInput(v, setSignUpPass)}
                      secureTextEntry={!showPass}
                      keyboardType='default'
                      autoCapitalize='none'
                      onFocus={() => setFocusedFeild('signUpPass')}
                      onBlur={() => setFocusedFeild(null)}
                    />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      {
                        showPass ? <Eye color={primary} /> : <EyeOff color={primary} />
                      }
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    disabled={isLoading}
                    className={`items-center justify-center h-14 rounded-full pr-3`}
                    onPress={() => handleRegister(username, email, password)}
                    style={{ backgroundColor: isRegisterFilled ? primary : isLoading ? primary : buttonSecondary }}
                  >
                    {
                      isLoading || loading ? (
                        <ActivityIndicator size='small' color={textPrimary} />
                      ) : (
                        <Text className='text-lg font-bold text-white'>Sign Up</Text>
                      )
                    }
                  </TouchableOpacity>
                  <View className='flex-row mt-1'>
                    <Text className='text-aura-text-primary dark:text-aura-text-primary-dark'>Already have an account? </Text>
                    <Pressable onPress={() => setSelectIndex(0)}>
                      <Text className='text-aura-primary font-semibold '>Login</Text>
                    </Pressable>
                  </View>
                  <View className='w-full'>
                    <View className='flex-row w-full items-center my-4'>
                      <View className='flex-1 h-[1px] bg-aura-surface dark:bg-aura-surface-elevated-dark'></View>
                      <Text className='mx-4 text-aura-text-secondary dark:text-aura-text-secondary-dark '>Or</Text>
                      <View className='flex-1  h-[1px] bg-aura-surface dark:bg-aura-surface-elevated-dark'></View>
                    </View>
                  </View>
                </View>
              </View>
            )
          }
          <View className='flex-row w-full items-center justify-center gap-3'>
            <Pressable className='flex-1 items-center justify-center py-4 bg-aura-surface dark:bg-aura-surface-dark rounded-xl'>
              <Google width={24} height={24} />
            </Pressable>
            <Pressable className='flex-1 items-center justify-center py-4 bg-aura-surface dark:bg-aura-surface-dark rounded-xl'>
              <Apple />
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView >
  )
}

export default Index

const styles = StyleSheet.create({})