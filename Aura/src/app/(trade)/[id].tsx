import { View, Text, Pressable, useWindowDimensions, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '../../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight } from 'lucide-react-native'
import { LineChart } from 'react-native-gifted-charts'
import { Image } from 'expo-image'
import formatFollowers from '@/utils/format'
import { useTheme } from '@/lib/ThemeContext'
import { Colors } from '@/constants/Colors'

const fetchTrade = async (token: string, id: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/trade/${id}`, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    const resData = await res.json()
    return resData
}
const TradeSkeleton = ({ router, width, isSkipped }: { router: any, width: number, isSkipped: boolean }) => (
    <View className='flex-1 mx-6 mt-9 '>
        <View className='flex-row items-center '>
            <Pressable
                onPress={() => router.back()}
                hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
                className='p-2 -ml-2'
            >
                <ArrowLeft />
            </Pressable>
            <View className='flex-1 justify-center items-center'>
                <View
                    key={'trade-title-skeleton'}
                    className='w-32 h-6 bg-gray-200 animate-pulse rounded-md' />
            </View>
            <View className='w-9' />
        </View>

        {isSkipped ? (
            <View>
                <View className='w-full h-36 bg-gray-200 animate-pulse rounded-3xl mt-6' />
            </View>
        ) : (
            <View className='flex-row items-end justify-between mt-6'>
                <View>
                    <View className='w-24 h-6 bg-gray-200 animate-pulse rounded-md' />
                    <View className='flex-row  items-center mt-1'>
                        <View className='w-32 h-6 bg-gray-200 rounded-md animate-pulse' />
                    </View>
                </View>
                <View>
                    <View className='w-14 h-6 bg-gray-200 animate-pulse rounded-md' />
                </View>
            </View>
        )}


        {!isSkipped && (
            <View className='mt-6'>
                {/* <Text className='text-xl font-semibold'>Your paper position</Text> */}
                <View className='w-full h-36 bg-gray-200 animate-pulse rounded-3xl mt-3' />
            </View>
        )}

        <View className='w-56 h-20 rounded-3xl bg-gray-200 mt-3 animate-pulse' />
        {isSkipped ? null : <View className='w-56 h-20 rounded-3xl bg-gray-200 mt-3 animate-pulse' />}

        <View className='mt-6'>
            <Text className='text-xl font-semibold'>Copy Source</Text>
            <View className='w-full h-24 bg-gray-200 animate-pulse rounded-3xl mt-3 ' />
        </View>
    </View>
)
const getReason = (reason: string) => {
    switch (reason) {
        case 'SLIPPAGE_EXCEEDED':
            return 'Price moved too quickly before execution.'
        case 'INSUFFICIENT_FUNDS':
            return 'Your wallet balance was less to execute this trade.'
        default:
            return reason ? reason.replace(/_/g, ' ') : 'The trade execution skipped.'
    }
}
const TradeDetail = () => {
    const { id: paramsId, status } = useLocalSearchParams()
    const id = typeof paramsId === 'string' ? paramsId : ''
    const { token } = useAuthStore()
    const { width } = useWindowDimensions()
    const { activeTheme } = useTheme()
    const isDark = activeTheme === 'dark'
    const router = useRouter()
    const { data, isPending, error } = useQuery({
        queryKey: ['home', 'trade', id],
        queryFn: () => fetchTrade(token, id),
        enabled: !!token && !!id
    })
    if (error) {
        console.log('Error in tradeDetail: ', error)
    }
    const trade = data?.trade || {}
    // const isPending = false
    const isSkipped = isPending ? status === 'skipped' : trade.status === 'skipped'
    const rejectionReason = getReason(trade.rejectionReason)
    if (isPending) {
        return <TradeSkeleton router={router} width={width} isSkipped={isSkipped} />
    }

    const quantity = trade.quantity || 0
    const avgPrice = trade.price || 0
    const exitPrice = trade.exitPrice || 0
    const isTradeOpen = trade.status === 'open'
    const currentPrice = (trade.currentPrice || avgPrice)
    const cost = quantity * avgPrice
    const totalValue = isTradeOpen ? (quantity * currentPrice) : (quantity * exitPrice)

    const unrealizedPnl = parseFloat(trade?.unrealizedPnl) || 0
    // const absPnl = Math.abs(unrealizedPnl) 

    const Pnl = isTradeOpen && trade.unrealizedPnl !== undefined
        ? parseFloat(trade.unrealizedPnl)
        : (quantity * exitPrice) - cost

    const tradeStatus = trade.status || 'open'
    const displayStatus = tradeStatus.charAt(0).toUpperCase() + tradeStatus.slice(1)

    const isPositive = unrealizedPnl >= 0
    const colorClass = isSkipped ? 'text-aura-text-primary dark:text-aura-text-primary-dark' : Pnl === 0 ? 'text-aura-text-primary dark:text-aura-text-primary-dark' : Pnl > 0 ? 'text-aura-positive' : 'text-aura-negative'
    const chartPoints = data?.returns || []
    const isReturnsPending = data?.isPending || false
    const profileImage = trade?.profile?.profileImage
    const profileName = trade?.profile?.name
    const followCount = trade?.profile?.followCount

    const openDate = new Date(trade.createdAt)
    const closedDate = new Date(trade?.closedAt || trade?.updatedAt)

    // console.log(trade)

    // console.log(JSON.stringify(trade, null, 2))
    const absPnl = Math.abs(Number(Pnl))
    // console.log(absPnl)
    // console.log(formatFollowers(followCount))
    return (
        <View className='flex-1 mx-6 mt-9'>
            <View className='flex-row items-center '>
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    className='p-2 -ml-2 rounded-full active:bg-aura-surface dark:active:bg-aura-surface-dark'
                >
                    <ArrowLeft color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} />
                </Pressable>
                <View className='flex-1 justify-center items-center'>
                    <Text className='font-semibold text-xl text-aura-text-primary dark:text-aura-text-primary-dark'>{trade.symbol || 'Trade Details'}</Text>
                </View>
                <View className='w-9' />
            </View>

            <View className='mt-6'>
                <View className='flex-row items-end justify-between'>
                    <View>
                        <Text className='font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>{isSkipped ? 'Order' : 'P&L'}</Text>
                        <Text className={`text-3xl font-aura-bold mt-1 ${colorClass}`}>
                            {isSkipped ? 'Not Executed' : Pnl >= 0 ? '+' : '-'} {isSkipped ? '' : `₹${absPnl.toFixed(2)}`}
                        </Text>
                    </View>
                    <View className={`py-1 px-3 rounded-xl ${isSkipped ? 'bg-aura-surface dark:bg-aura-surface-dark' : isTradeOpen ? 'bg-aura-positive/10' : 'bg-aura-negative/10'}`}>
                        <Text className={`font-aura-bold ${isSkipped ? 'text-aura-text-secondary dark:text-aura-text-secondary-dark' : isTradeOpen ? 'text-aura-positive' : 'text-aura-negative'}`}>{displayStatus}</Text>
                    </View>
                </View>

            </View>

            {!isSkipped ? (
                <View className='mt-3'>
                    {/* <Text className='text-xl font-semibold'>Your paper position</Text> */}
                    <View className='flex-row items-center justify-between bg-aura-surface dark:bg-aura-surface-dark p-6 rounded-3xl mt-3'>
                        <View className='gap-4'>
                            <View>
                                <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Shares Owned</Text>
                                <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>{trade.quantity}</Text>
                            </View>
                            <View>
                                <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Total Value</Text>
                                <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>₹{totalValue.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View className='gap-4 '>
                            <View className='flex-1 items-end'>
                                <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>Avg Cost</Text>
                                <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>₹{avgPrice.toFixed(2)}</Text>
                            </View>
                            <View className='flex-1 items-end'>
                                <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>
                                    {isTradeOpen ? 'Current Price' : 'Exit Price'}
                                </Text>
                                <Text className={` font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark`}>
                                    ₹{(isTradeOpen ? (currentPrice).toFixed(2) : isSkipped ? 'N/A' : (exitPrice).toFixed(2))}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            ) : (
                <View className='mt-6 p-6 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl'>
                    <Text className='text-sm text-aura-text-secondary dark:text-aura-text-secondary-dark font-semibold'>Rejection reason</Text>
                    <Text className='text-base mt-3 font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>{rejectionReason}</Text>
                </View>
            )}


            <View className='flex-row mt-3 gap-3 flex-wrap'>
                <View className='p-6 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl'>
                    <Text className='text-xs text-aura-text-secondary dark:text-aura-text-secondary-dark font-semibold'>Opened At</Text>
                    <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>
                        {openDate?.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                        })}
                    </Text>
                </View>
                {tradeStatus === 'closed' && (
                    <View className='p-6 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl'>
                        <Text className='text-xs text-aura-text-secondary dark:text-aura-text-secondary-dark font-semibold'>Closed At</Text>
                        <Text className='font-aura-bold text-aura-text-primary dark:text-aura-text-primary-dark'>
                            {closedDate?.toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric'
                            })}
                        </Text>
                    </View>
                )}
            </View>

            <View className='mt-6'>
                <Text className='text-xl font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>Copy Source</Text>
                <View className='flex-row items-center mt-3 gap-3 bg-aura-surface dark:bg-aura-surface-dark rounded-3xl p-6'>
                    <View className='w-14 h-14'>
                        <Image
                            source={profileImage ? { uri: profileImage as string } : undefined}
                            style={{ width: '100%', height: '100%', borderRadius: 100 }}
                        />
                    </View>
                    <View>
                        <Text className='text-base font-semibold text-aura-text-primary dark:text-aura-text-primary-dark'>{profileName || 'Unkown Profile'}</Text>
                        <Text className='text-sm font-semibold text-aura-text-secondary dark:text-aura-text-secondary-dark'>
                            {isSkipped ? 'Tried to ' : ''}{trade.side === 'Buy' ? isSkipped ? 'buy' : 'Bought' : isSkipped ? 'sell' : 'Sold'} {trade.quantity} shares of {trade.symbol}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
//  LOG  {
//   "_id": "6a7aac597f3c84e12bb616ff",
//   "followId": "6a796787d7901b920e6632d1",
//   "profileId": {
//     "_id": "6a6f1843a7d224731f52f89f",
//     "profileImage": "https://api.dicebear.com/10.x/glass/png?&animationVariant=fast:1&seed=6a6f1843a7d224731f52f89f",
//     "name": "The Insider"
//   },
//   "symbol": "DIVISLAB",
//   "side": "Buy",
//   "quantity": 29,
//   "price": 8373,
//   "status": "skipped",
//   "rejectionReason": "SLIPPAGE_EXCEEDED",
//   "exitPrice": null,
//   "triggerRefId": "6a7a14b36edb0baaadd23792",
//   "createdAt": "2026-08-11T05:00:09.503Z",
//   "updatedAt": "2026-08-11T05:00:09.503Z",
//   "__v": 0
// }
export default TradeDetail