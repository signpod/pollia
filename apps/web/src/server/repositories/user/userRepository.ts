import prisma from "@/database/utils/prisma/client";

/**
 * User Repository
 * User 도메인의 데이터 접근 계층
 */
export class UserRepository {
  /**
   * User ID로 User 조회
   * @param userId - User ID
   * @returns User 또는 null
   */
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * User ID로 User 존재 여부 확인
   * @param userId - User ID
   * @returns User 또는 null
   */
  async findFirst(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId },
    });
  }

  /**
   * User 생성
   * @param data - 생성할 User 데이터
   * @returns 생성된 User
   */
  async create(data: { id: string; email: string; name: string }) {
    return prisma.user.create({
      data,
    });
  }
}

export const userRepository = new UserRepository();

