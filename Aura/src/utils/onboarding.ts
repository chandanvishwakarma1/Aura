// Helper to carry onboarding answers (experience, risk appetite, capital, goal,
// recommended profile ids) through the register flow so they reach the register API.

export const ONBOARDING_KEYS = ['experience', 'riskAppetite', 'capital', 'goal', 'profileIds'] as const
export type OnboardingValues = {
    experience?: string
    riskAppetite?: 'conservative' | 'balanced' | 'growth' | 'aggressive'
    capital?: string
    goal?: string
    profileIds: string[]
}

type RouteParams = Record<string, string | string[] | undefined>

const getParam = (params: RouteParams, key: string): string | undefined => {
    const value = params[key]
    return Array.isArray(value) ? value[0] : value
}

// Decode onboarding values from a set of route params.
export const extractOnboardingParams = (params: RouteParams): OnboardingValues => {
    const rawProfileIds = getParam(params, 'profileIds')

    let profileIds: string[] = []
    if (rawProfileIds) {
        try {
            const parsed = JSON.parse(rawProfileIds)
            profileIds = Array.isArray(parsed) ? parsed.map(String) : [String(parsed)]
        } catch {
            // Not valid JSON → comma-separated list or single id
            profileIds = rawProfileIds.split(',').map(s => s.trim()).filter(Boolean)
        }
    }

    const riskAppetite = getParam(params, 'riskAppetite') as OnboardingValues['riskAppetite']
    return {
        experience: getParam(params, 'experience'),
        riskAppetite: riskAppetite && ['conservative', 'balanced', 'growth', 'aggressive'].includes(riskAppetite)
            ? riskAppetite : undefined,
        capital: getParam(params, 'capital'),
        goal: getParam(params, 'goal'),
        profileIds,
    }
}

// Encode onboarding values back into route params (for forwarding between screens).
export const onboardingParamsToRoute = (values: OnboardingValues): Record<string, string> => {
    const out: Record<string, string> = {}
    if (values.experience) out.experience = values.experience
    if (values.riskAppetite) out.riskAppetite = values.riskAppetite
    if (values.capital) out.capital = values.capital
    if (values.goal) out.goal = values.goal
    if (values.profileIds.length) out.profileIds = JSON.stringify(values.profileIds)
    return out
}

