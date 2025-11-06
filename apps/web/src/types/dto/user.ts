export interface GetCurrentUserResponse {
  data: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
