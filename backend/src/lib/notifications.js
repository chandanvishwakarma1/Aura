const sendNotification = async(expoPushToken, title, body, data = {}) => {
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
        console.log(`Invalid or missing expo push token: ${expoPushToken}`)
        return;
    }

    // Expo's hosted push API requires the project access token (set EXPO_ACCESS_TOKEN in backend/.env)
    const accessToken = process.env.EXPO_ACCESS_TOKEN

    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data
    }

    try {
        const res = await fetch('https://expo.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
                ...(accessToken ? { 'expo-access-token': accessToken } : {})
            },
            body: JSON.stringify(message)
        })
        const result = await res.json()
        console.log('Push notification send successfully: ', result)
        return result
    } catch (error) {
        console.log("Error sending push notification via Expo: ", error)
    }
}

export default sendNotification