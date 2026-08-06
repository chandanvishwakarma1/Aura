export class ApiError extends Error{
    constructor(message: string, public statusCode?: number){
        super(message)
        this.name = 'ApiError'
    }
}

export const getSanetizedErrorMessage = (err: unknown): string => {
    if(err instanceof ApiError){
        return err.message
    }
    return 'Unable to complete your request right now. Please try again later.'
}