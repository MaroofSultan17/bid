export interface UserGetResponseDTO {
    id: string;
    name: string;
    email: string;
    hourlyRate: number;
    currentWorkloadHours: number;
    maxCapacityHours: number;
    remainingCapacityHours?: number;
}
