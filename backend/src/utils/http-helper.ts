export interface httpResponse {
  statusCode: number,
  body: any,
};

export const ok = async (data: any): Promise<httpResponse> => {
  return {
    statusCode: 200,
    body: data,
  }
};

export const created = async (data: any): Promise<httpResponse> => {
  return {
    statusCode: 201,
    body: data,
  }
};

export const noContent = async (): Promise<httpResponse> => {
  return {
    statusCode: 204,
    body: null,
  }
};

export const badRequest = async (message: string): Promise<httpResponse> => {
  return {
    statusCode: 400,
    body: { message },
  }
};

export const notFound = async (message: string): Promise<httpResponse> => {
  return {
    statusCode: 404,
    body: { message },
  }
};

export const internalServerError = (message: string): httpResponse => {
  return {
    statusCode: 500,
    body: { erro: message },
  }
};