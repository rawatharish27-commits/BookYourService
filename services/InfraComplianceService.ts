
class InfraComplianceService {
  checkRateLimit(identifier: string): boolean {
    return true;
  }
}

export const infra = new InfraComplianceService();
