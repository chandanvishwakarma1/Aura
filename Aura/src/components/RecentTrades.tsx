import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { formatTime } from '../utils/format'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

const fetchTrades = async (token: string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/trades`, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    const resData = await res.json()
    return resData
}
const RecentTrades = () => {
    const { token } = useAuthStore()
    const router = useRouter()
    const { data, isPending, error } = useQuery({
        queryKey: ['home', 'trades'],
        queryFn: () => fetchTrades(token),
        enabled: !!token
    })
    if (error) {
        console.log("Error in recentTrades: ", error)
    }
    const trades = data?.trades || []
    const handleOnPress = (id:string,status:string) => {
        router.navigate({
            pathname: ('/(trade)/tradeDetail'),
            params: { id: id, status: status}
        })
    }
    return (
        <View className='gap-4 mt-6'>
            {/* <Text>{data[0]}</Text> */}
            {trades && trades.length > 0 && (
                trades.map((item: any) => {
                    const totalValue = (item?.price || 0) *( item?.quantity || 0)
                    const url = item?.profileId?.profileImage
                    const name = item?.profileId?.name
                    const isSkipped = item?.status === 'skipped'
                    return (
                        <Pressable 
                        className={`flex-row items-center  bg-zinc-100 gap-3 rounded-3xl p-6 ${isSkipped ? 'opacity-70 border border-dashed' : ''}`} 
                        key={item._id}
                        onPress={()=>handleOnPress(item._id, item.staus)}
                        >
                            <View className='w-14 h-14 rounded-full overflow-hidden shrink-0'>
                                <Image
                                    source={url ? { uri: url } : undefined}
                                    style={{ width: '100%', height: '100%', borderRadius: 100 }} contentFit='cover'
                                />
                            </View>
                            <View className='flex-1 ml-3 pr-2 gap-y-0.6'>
                                <Text numberOfLines={1} className='text-base font-bold tracking-tight'>{name}</Text>
                                <Text className='text-xs text-gray-600 font-semibold' numberOfLines={1}>
                                    {item.side === 'Buy' ? 'Bought' : 'Sold'} 
                                    {' '}{item.quantity} shares of 
                                    <Text className='text-base font-bold text-black'> {item.symbol}</Text>
                                    </Text>
                            </View>
                            <View className='shrink-0 gap-y-1 items-end'>
                                <Text className='text-sm font-bold text-gray-600 uppercase tracking-wider'>{formatTime(item.createdAt)}</Text>
                                <Text className='text-sm font-extrabold'>₹{totalValue? totalValue.toLocaleString('en-IN'):'0'}</Text>
                            </View>
                        </Pressable>
                    )
                })
            )}
        </View>
    )
}
// {
//       "_id": "6a7571dc3f38d8130ddab818",
//       "followId": "6a74795b50f01596cf9f4984",
//       "profileId": "6a6f1843a7d224731f52f8a0",
//       "symbol": "CREDITACC",
//       "side": "Buy",
//       "quantity": 163,
//       "price": 1529,
//       "status": "skipped",
//       "rejectionReason": "SLIPPAGE_EXCEEDED",
//       "exitPrice": null,
//       "triggerRefId": "6a751f47cce45b60d3df5ddf",
//       "createdAt": "2026-08-07T05:49:16.469Z",
//       "updatedAt": "2026-08-07T05:49:16.469Z",
//       "__v": 0
//     },
export default RecentTrades