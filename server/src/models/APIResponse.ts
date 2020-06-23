export interface APIResponse<T = any> {
    success: boolean,
    error: string | null,
    data?: T | any,
    status: number
}

export interface APIResponseCallback { (response: APIResponse): void}
