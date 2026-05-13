export class AgentPermitError extends Error {
  constructor(message: string, readonly exitCode: 1 | 2 = 2) {
    super(message);
    this.name = 'AgentPermitError';
  }
}
