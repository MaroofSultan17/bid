import { UserRepository } from './user.repository';
import { UserIndexRequest, UserRow, UserWorkloadResponse } from './user.types';
import { AppError } from '../../core/types';

export class UserService {
    constructor(private userRepository: UserRepository) {}

    async getUsers(dto: UserIndexRequest): Promise<UserRow[]> {
        return this.userRepository.findAll(dto.page, dto.limit);
    }

    async getWorkload(id: string): Promise<UserWorkloadResponse> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new AppError('User not found', 404, 'ERR_NOT_FOUND');
        }

        const remainingCapacityHours =
            Number(user.maxCapacityHours) - Number(user.currentWorkloadHours);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            hourlyRate: Number(user.hourlyRate),
            currentWorkloadHours: Number(user.currentWorkloadHours),
            maxCapacityHours: Number(user.maxCapacityHours),
            remainingCapacityHours,
        };
    }
}
