import { CronExpressionParser } from 'cron-parser'
const crons: Record<string, string | string[]> = {
    'The Whale': [
        '0 18 * * *',
        '6 9 * * 1-5',
        '26 14 * * 1-5',
        '*/15 18-20 * * 1-5'
    ],
    'The Technician': '45 9 * * 1-5',
    'The Insider': [
        '30 17 * * *',
        '*/10 3-10 * * 1-5'
    ],
    'The Momentum Chaser': '45 9 * * 1-5'
}
export const getNextRun = (engine:string) => {
    const cronRules = crons[engine]
    const cronList = Array.isArray(cronRules) ? cronRules : [cronRules]
    const now = new Date()
    let nextRunDate : Date | null = null

    for (const cron of cronList) {
        try {
            const interval = CronExpressionParser.parse(cron, {
                currentDate: now,
                tz: 'UTC'
            })
            const nextDate = interval.next().toDate()

            if (!nextRunDate || nextDate < nextRunDate) {
                nextRunDate = nextDate
            }
        } catch (error) {
            console.log(`Error parsing cron for ${engine}: `, cron, error)
        }

    }
    return nextRunDate
}