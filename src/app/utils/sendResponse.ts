import { Response } from 'express';

type TMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPage?: number;
};

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: TMeta;
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message || 'Operation successful',
    meta: data.meta,
    data: data.data,
  });
};

export default sendResponse;
