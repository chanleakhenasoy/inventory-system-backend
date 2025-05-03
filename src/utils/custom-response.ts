export class CustomResponse {
    statusCode: number;
    message: string;
    data: any | null;
    redirectUrl: string | null;
  
    constructor(
      statusCode: number,
      message: string,
      data: any | null = null,
      error: string | null = null,
      redirectUrl: string | null = null
    ) {
      this.statusCode = statusCode;
      this.message = message;
      this.data = data;
      this.redirectUrl = redirectUrl;
    }
  }
  