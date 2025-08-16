export type GlobOrder =
    | 'alphabetical_asc'
    | 'alphabetical_desc'
    | 'last_updated_asc'
    | 'last_updated_desc'
    | 'none'

export type GlobSampleMode = 'first_n' | 'random' | 'none'

export interface GlobIncludePayload {
    pattern: string
    orderBy?: GlobOrder
    sampleMode?: GlobSampleMode
    sampleCount?: number
    normalize?: boolean
}