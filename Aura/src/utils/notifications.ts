import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldSetBadge: false,
    })
})

const registerForPushNotificationsAsync = async (authToken:string) => {
    let token

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('myNotificationsChannel', {
            name: 'A channel is need for permission prompt to appear.',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C'
        })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!')
        return;
    }

    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
        if (!projectId) {
            // No EAS project configured. Abort cleanly instead of uploading a
            // debug/error string as a device token to the backend.
            console.log('[notifications] No EAS project id configured; skipping push token registration.')
            return undefined
        }
        token = (
            await Notifications.getExpoPushTokenAsync({ projectId })
        ).data
        console.log("push token: ", token)

        await sendToken(token, authToken)
    } catch (error) {
        console.log('Failed to obtain Expo push token: ', error)
        return undefined
    }
    return token
} 

export default registerForPushNotificationsAsync


const sendToken = async(token:string, authToken:string) => {
    try {
        const res= await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/deviceToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({deviceToken: token})
        })
        const data = await res.json()
        console.log('Device token successfully registered.', data)
    } catch (error) {
        console.log('Failed to register device token: ', error)
    }
}