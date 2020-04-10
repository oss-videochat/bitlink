export interface APIResponse {
    success: boolean,
    error: string | null,
    data?: any,
    status: number
}

export interface APIResponseCallback { (response: APIResponse): void}
