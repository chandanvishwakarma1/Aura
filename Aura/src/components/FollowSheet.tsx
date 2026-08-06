import { View, Text, BackHandler, Pressable, ActivityIndicator, Alert, TextInput, Platform } from 'react-native'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet'
import { Info, X } from 'lucide-react-native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import Slider from '@react-native-assets/slider'
import { ApiError, getSanetizedErrorMessage } from '@/utils/apiError'

export interface FollowSheetRef {
    open: () => void,
    close: () => void
}
interface FollowSheetProps {
    name: string,
    profileId: string
}
const FollowSheet = forwardRef<FollowSheetRef, FollowSheetProps>(({ name, profileId }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null)
    const { token } = useAuthStore()
    const snapPoints = useMemo(() => ['76%', '90%'], [])
    const [isOpen, setIsOpen] = useState(false)
    const [capitalAllocated, setCapitalAllocated] = useState(2500000)
    const [riskPercent, setRiskPercent] = useState('10')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [slippagePercent, setSlippagePercent] = useState('1')
    const riskPresets = ['5', '10', '20'];
    const slippagePresets = ['0.5', '1', '2'];
    const capitalPresets = [0.25, 0.5, 0.75, 1]; // Percentages of max budget
    const MAX_CAPITAL = 10000000;
    const MIN_CAPITAL = 100000;


    const handleTextChanges = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '')
        const numeric = cleaned === '' ? 0 : parseInt(cleaned, 10)

        if (numeric <= MAX_CAPITAL) {
            setCapitalAllocated(numeric)
        } else {
            setCapitalAllocated(MAX_CAPITAL)
        }
    }

    const formatCurrency = (val: number) => {
        if (!val) return ''
        return val.toLocaleString('en-IN')
    }

    useImperativeHandle(ref, () => ({
        open: () => bottomSheetRef.current?.expand(),
        close: () => bottomSheetRef.current?.close()
    }))
    const handleClosePress = () => {
        bottomSheetRef.current?.close()
    }


    const queryClient = useQueryClient()
    const followMutation = useMutation(
        {
            mutationFn: async () => {
                setErrorMessage(null)

                if (!token) throw new ApiError('Please sign in again to follow profiles.')
                const parsedrisk = parseFloat(riskPercent)
                const parsedSlippage = parseFloat(slippagePercent)

                if(capitalAllocated < MIN_CAPITAL) {
                    throw new ApiError(`Minimum capital allocation is ₹${formatCurrency(MIN_CAPITAL)}`)
                }
                if(isNaN(parsedrisk) || parsedrisk <= 0){
                    throw new ApiError('Please enter  a valid risk percentage.')
                }
                if(isNaN(parsedSlippage) || parsedSlippage <= 0){
                    throw new ApiError('Please enter a valid slippage percentage.')
                }


                const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/profile/follow/${profileId}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        profileId: profileId,
                        capitalAllocated: Number(capitalAllocated),
                        risk: parsedrisk / 100,
                        slippage: parsedSlippage / 100
                    })
                })
                const data = await res.json()
                if (!res.ok) throw new ApiError(data.message || 'Failed to follow profile', res.status)
                return data
            },
            onSuccess: () => {
                Alert.alert('Success', 'You are now copying this profile')
                queryClient.invalidateQueries({ queryKey: ['profile', profileId] })
                bottomSheetRef.current?.close()
            },
            onError: (err: Error) => {
                console.error('[Follow Mutation Error]: ', err)
                const userSafeMessages = getSanetizedErrorMessage(err)
                setErrorMessage(userSafeMessages)
            }
        }
    )

    const handleSheetChanges = (index: number) => {
        setIsOpen(index >= 0)
        if (index === -1) {
            setErrorMessage(null)
        }
    }

    // Intercept physical back button press
    useEffect(() => {
        const onBackPress = () => {
            if (isOpen) {
                bottomSheetRef.current?.close()
                return true // Stop event propagation (prevents closing the screen)
            }
            return false // Allow default back navigation
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () => backHandler.remove()
    }, [isOpen])

    const renderBackDrop = useCallback(
        (props: BottomSheetBackdropProps) => {
            return <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.6}
            />
        },
        []
    )
    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            android_keyboardInputMode='adjustResize'
            keyboardBehavior="fillParent"
            keyboardBlurBehavior="restore"
            activeOffsetY={[-1, 1]}
            failOffsetX={[-6, 6]}
            onChange={handleSheetChanges}
            backdropComponent={renderBackDrop}

        >
            <BottomSheetScrollView
            style={{flex:1}}
            contentContainerStyle={{paddingHorizontal: 24, paddingTop:24, paddingBottom: 140}}
            >
                <View className='flex-row justify-between'>
                    <Text className='text-xl font-aura-bold'>{name}</Text>
                    <Pressable onPress={handleClosePress} hitSlop={{ top: 20, bottom: 20, right: 20, left: 20 }}>
                        <X />
                    </Pressable>
                </View>
                {errorMessage && (
                    <View className='flex-row  items-center bg-red-50 border border-red-300 rounded-xl p-3 mt-6'>
                        <Info size={16} color={'#DC6262'} />
                        <Text className='text-red-600 text-xs font-semibold ml-2 flex-1'>{errorMessage}</Text>
                    </View>
                )}
                <View className='mt-6'>
                    <View className='flex-row items-center justify-between'>
                    <Text className='text-xs font-bold text-gray-400 uppercase'>Capital to Allocate </Text>
                    <Text className='text-xs font-semibold text-gray-600'>₹{formatCurrency(capitalAllocated)}</Text>
                    </View>


                    <View className='flex-row gap-6 mt-2 justify-between items-center'>
                        <View className="flex-row items-center justify-center border  border-gray-200 bg-gray-50 rounded-2xl px-4 py-1 "
                            style={{ minWidth: 142 }}
                        >
                            <Text className="text-xl font-bold text-gray-900 mr-1">₹</Text>
                            <BottomSheetTextInput
                                keyboardType="numeric"
                                value={capitalAllocated === 0 ? '' : String(capitalAllocated)}
                                onChangeText={handleTextChanges}
                                placeholder="0"
                                numberOfLines={1}
                                className="text-lg font-bold text-gray-900 flex-1 items-center justify-center"
                            />
                        </View>

                        <View className='flex-1'>

                            <Slider
                                style={{ width: '90%', height: 40 }}
                                minimumValue={MIN_CAPITAL}
                                maximumValue={MAX_CAPITAL}
                                thumbSize={22}
                                step={1000}
                                value={Math.max(MIN_CAPITAL,capitalAllocated)}
                                onValueChange={(val) => setCapitalAllocated(val)}
                                minimumTrackTintColor="#4671ED"
                                maximumTrackTintColor="#E5E7EB"
                                thumbStyle={{
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    ...Platform.select({
                                        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3 },
                                        android: { elevation: 3 }
                                    })
                                }}
                            />
                        </View>
                    </View>
                    <View className='flex-row space-x-2 mt-6 mb-6 justify-between'>
                        {capitalPresets.map((pct) => {

                            const isSelected = Number(capitalAllocated) === (MAX_CAPITAL * pct);
                            return (

                                <Pressable
                                    key={pct}
                                    onPress={() => setCapitalAllocated(MAX_CAPITAL * pct)}
                                    className={` px-6 py-3 rounded-full ${isSelected
                                        ? 'bg-black '
                                        : 'bg-gray-100 '
                                        }`}
                                >
                                    <Text className={`text-base font-bold ${isSelected ? 'text-white' : 'text-black'}`}>{pct === 1 ? 'MAX' : `${pct * 100}%`}</Text>
                                </Pressable>
                            )
                        })}
                    </View>

                    {/* <Text className='mb-4 text-gray-400 mt-1 text-xs font-semibold'>Max value = 1000000</Text> */}

                    <View className='mt-4'>
                        <Text className='text-xs font-bold text-gray-400 uppercase'>Risk (0.1 = 10% of capital allocated)</Text>
                    </View>
                    <View className='flex-row gap-4 items-center mt-2 mb-6'>
                        <View className="flex-row items-center justify-center border  border-gray-200 bg-gray-50 rounded-2xl px-4 py-1 "
                            style={{ minWidth: 90 }}
                        >
                            <BottomSheetTextInput
                                keyboardType="decimal-pad"
                                value={riskPercent}
                                onChangeText={setRiskPercent}
                                textAlignVertical='center'
                                placeholder="0"
                                numberOfLines={1}
                                className="text-lg font-bold text-gray-900  items-center  justify-center"
                            />
                            <Text className="text-xl font-bold text-gray-900 mr-1">%</Text>
                        </View>
                        <View className='flex-row gap-1'>
                            {riskPresets.map((preset) => {
                                const isSelected = riskPercent === preset
                                return (
                                    <Pressable
                                        key={preset}
                                        onPress={() => setRiskPercent(preset)}
                                        className={`px-6 py-3 rounded-full ${isSelected ? 'bg-black' : 'bg-gray-100'}`}
                                    >
                                        <Text className={`text-base font-bold ${isSelected ? 'text-white' : 'text-black'}`}>{preset}%</Text>
                                    </Pressable>
                                )
                            })}
                        </View>
                    </View>
                    <Text className='text-xs font-bold text-gray-400 e mt-4'>Max Slippage Tolerance (e.g., 0.01 = ±1% Tolerance)</Text>
                    <View className='flex-row gap-4 items-center mt-2 mb-6'>
                        <View className="flex-row items-center justify-center border  border-gray-200 bg-gray-50 rounded-2xl px-4 py-1 "
                            style={{ minWidth: 90 }}
                        >
                            <BottomSheetTextInput
                                keyboardType="decimal-pad"
                                value={slippagePercent}
                                textAlignVertical='center'
                                onChangeText={setSlippagePercent}
                                placeholder="0"
                                numberOfLines={1}
                                className="text-lg font-bold text-gray-900  items-center justify-center"
                            />
                            <Text className="text-xl font-bold text-gray-900 mr-1">%</Text>
                        </View>
                        <View className='flex-row gap-1'>
                            {slippagePresets.map((preset) => {
                                const isSelected = slippagePercent === preset
                                return (
                                    <Pressable
                                        key={preset}
                                        onPress={() => setSlippagePercent(preset)}
                                        className={`px-6 py-3 rounded-full ${isSelected ? 'bg-black' : 'bg-gray-100'}`}
                                    >
                                        <Text className={`text-base font-bold ${isSelected ? 'text-white' : 'text-black'}`}>{preset}%</Text>
                                    </Pressable>
                                )
                            })}
                        </View>
                    </View>

                    <Pressable
                        onPress={() => followMutation.mutate()}
                        disabled={followMutation.isPending}
                        className='bg-black py-4 rounded-xl items-center'
                    >
                        {followMutation.isPending ? (
                            <ActivityIndicator color={'#fff'} />
                        ) : (
                            <Text className='text-white font-bold text-base'>Confirm and Start Copying</Text>
                        )}
                    </Pressable>
                </View>

            </BottomSheetScrollView>
        </BottomSheet>
    )
})

FollowSheet.displayName = 'FollowSheet'

export default FollowSheet