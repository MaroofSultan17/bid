import { UserGetResponseDTO } from '../../types/dto/user.dto';
import { ApiResponse } from '../../core/types';

export class UserService {
    constructor(
        private publicApiBaseUrl: string,
        private token: string
    ) {}

    async getUsers(): Promise<UserGetResponseDTO[]> {
        const url = new URL(`${this.publicApiBaseUrl}/users`);

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
                    return result.json().then((res: ApiResponse<UserGetResponseDTO[]>) => res.data);
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

    async getWorkload(id: string): Promise<UserGetResponseDTO> {
        const url = new URL(`${this.publicApiBaseUrl}/users/${id}/workload`);

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
                    return result.json().then((res: ApiResponse<UserGetResponseDTO>) => res.data);
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
