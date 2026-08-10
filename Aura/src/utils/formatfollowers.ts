const formatFollowers = (count: number) => {
    if(!count || isNaN(count)) return '0'

    if(count >= 1000000) return (count/1000000).toFixed(count % 1000000 === 0 ? 0 : 1) + 'M'

    if(count >= 1000) return (count/1000).toFixed(count % 1000 === 0 ? 0 : 1) + 'k'

    return count.toString()
}
export default formatFollowers