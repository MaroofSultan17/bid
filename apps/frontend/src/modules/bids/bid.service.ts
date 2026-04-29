import { BidGetResponseDTO, BidCreateRequestDTO } from '../../types/dto/bid.dto';

export class BidService {
    constructor(
        private publicApiBaseUrl: string,
        private token: string
    ) {}

    async createBid(taskId: string, dto: BidCreateRequestDTO): Promise<BidGetResponseDTO> {
        const url = new URL(`${this.publicApiBaseUrl}/bids/task/${taskId}`);

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

    async getBidsForTask(taskId: string): Promise<BidGetResponseDTO[]> {
        const url = new URL(`${this.publicApiBaseUrl}/bids/task/${taskId}`);

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
