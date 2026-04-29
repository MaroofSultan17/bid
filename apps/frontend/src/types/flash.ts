export interface FlashMessageInterface {
    type: 'success' | 'info' | 'error' | 'warning';
    message: string;
    timestamp: number;
}
