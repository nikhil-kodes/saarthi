export type Locale = 'en' | 'hi';
export declare const SUPPORTED_LOCALES: Locale[];
export declare const DEFAULT_LOCALE: Locale;
export type UserRole = 'owner' | 'team_member' | 'ca_partner' | 'supplier' | 'influencer' | 'lender' | 'admin';
export interface BusinessMembership {
    id: string;
    userId: string;
    businessId: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}
export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export declare const QUEUE_NAMES: readonly ["compliance", "notifications", "ai", "ocr", "rag", "marketplace", "payments", "regulatory"];
export type QueueName = (typeof QUEUE_NAMES)[number];
export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    service: string;
    version: string;
    timestamp: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
//# sourceMappingURL=index.d.ts.map