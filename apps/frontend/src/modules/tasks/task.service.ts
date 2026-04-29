import {
    TaskGetResponseDTO,
    TaskCreateRequestDTO,
    TaskStatusUpdateRequestDTO,
} from '../../types/dto/task.dto';

export class TaskService {
    constructor(
        private publicApiBaseUrl: string,
        private token: string
    ) {}

    async getTasks(status?: string): Promise<TaskGetResponseDTO[]> {
        const url = new URL(`${this.publicApiBaseUrl}/tasks`);
        if (status) {
            url.searchParams.append('status', status);
        }

        const json = fetch(url.toString(), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((result) => {
                if (result.ok) {
                    return result.json().then((res: ApiResponse<TaskGetResponseDTO[]>) => res.data);
                }
                return result.json().then((errorData) => {
                    throw new Error(errorData.message);
                });
            })
            .catch((error) => {
                throw new Error(error);
            });

        return json;
    }

    async getTask(id: string): Promise<TaskGetResponseDTO> {
        const url = new URL(`${this.publicApiBaseUrl}/tasks/${id}`);

        const json = fetch(url.toString(), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((result) => {
                if (result.ok) {
                    return result.json().then((res: ApiResponse<TaskGetResponseDTO>) => res.data);
                }
                return result.json().then((errorData) => {
                    throw new Error(errorData.message);
                });
            })
            .catch((error) => {
                throw new Error(error);
            });

        return json;
    }

    async createTask(dto: TaskCreateRequestDTO): Promise<TaskGetResponseDTO> {
        const url = new URL(`${this.publicApiBaseUrl}/tasks`);

        const json = fetch(url.toString(), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dto),
        })
            .then((result) => {
                if (result.ok) {
                    return result.json().then((res: ApiResponse<TaskGetResponseDTO>) => res.data);
                }
                return result.json().then((errorData) => {
                    throw new Error(errorData.message);
                });
            })
            .catch((error) => {
                throw new Error(error);
            });

        return json;
    }

    async advanceStatus(id: string, dto: TaskStatusUpdateRequestDTO): Promise<TaskGetResponseDTO> {
        const url = new URL(`${this.publicApiBaseUrl}/tasks/${id}/status`);

        const json = fetch(url.toString(), {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dto),
        })
            .then((result) => {
                if (result.ok) {
                    return result.json().then((res: ApiResponse<TaskGetResponseDTO>) => res.data);
                }
                return result.json().then((errorData) => {
                    throw new Error(errorData.message);
                });
            })
            .catch((error) => {
                throw new Error(error);
            });

        return json;
    }

    async assignTask(id: string): Promise<any> {
        const url = new URL(`${this.publicApiBaseUrl}/tasks/${id}/assign`);

        const json = fetch(url.toString(), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((result) => {
                if (result.ok) {
                    return result.json().then((res: ApiResponse<any>) => res.data);
                }
                return result.json().then((errorData) => {
                    throw new Error(errorData.message);
                });
            })
            .catch((error) => {
                throw new Error(error);
            });

        return json;
    }
}
