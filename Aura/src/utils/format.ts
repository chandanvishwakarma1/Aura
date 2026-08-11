const formatFollowers = (count: number) => {
    if(!count || isNaN(count)) return '0'

    if(count >= 1000000) return (count/1000000).toFixed(count % 1000000 === 0 ? 0 : 1) + 'M'

    if(count >= 1000) return (count/1000).toFixed(count % 1000 === 0 ? 0 : 1) + 'k'

    return count.toString()
}

export const formatTime = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInMs = now.getTime() - past.getTime()

    const diffInMins = Math.floor(diffInMs / (1000*60))
    const diffInHours = Math.floor(diffInMs/ (1000*60*60))
    const diffInDays = Math.floor(diffInMs/(1000*60*60*24))

    if(diffInMins < 60) return `${diffInMins}m ago`
    if(diffInHours < 24) return `${diffInHours}m ago`
    return `${diffInDays}d ago`
}
export default formatFollowers