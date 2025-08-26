export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type CreateAccessCodeRequest = {
  phoneNumber: string;
};

export type VerifyAccessCodeRequest = {
  phoneNumber: string;
  accessCode: string;
};

