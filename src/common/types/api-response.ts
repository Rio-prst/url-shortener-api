export class ApiResponse {
  constructor(
    public message: string,
    public data?: unknown,
    public meta?: Record<string, unknown>,
  ) {}
}
