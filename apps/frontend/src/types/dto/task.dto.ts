export interface TaskGetResponseTaskDTO {
    id: string;
    title: string;
    description: string | null;
    complexity: number;
    status: string;
    createdBy: string;
    assignedTo: string | null;
    deadline: string | null;
    bidCount?: number;
    lowestBid?: number | null;
}

export interface TaskGetResponseDTO {
    tasks: TaskGetResponseTaskDTO[];
    pagination: Pagination;
}

export interface TaskCreateRequestDTO {
    title: string;
    complexity: number;
    created_by: string;
}

export interface TaskStatusUpdateRequestDTO {
    status: string;
    updated_by: string;
}
