import { DashboardStatsResponseDTO } from '../../types/dto/dashboard.dto';

export class DashboardService {
    constructor(
        private publicApiBaseUrl: string,
        private token: string
    ) {}

    async getStats(): Promise<DashboardStatsResponseDTO> {
        const url = new URL(`${this.publicApiBaseUrl}/dashboard/stats`);

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
                    return result.json();
                }
                return result.json().then((errorData) => {
                    throw new Error(errorData.message);
                });
            })
            .catch((error) => {
                throw new Error(error);
            });

        return json.then((res) => res.data);
    }
}
