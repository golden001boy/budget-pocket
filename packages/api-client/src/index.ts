export { createApiClient, ApiClientError } from './client';
export { createTransactionsClient } from './transactions';
export { createBudgetsClient } from './budgets';
export { createPortfolioClient } from './portfolio';
export { createPricesClient } from './prices';
export { createAnalysisClient } from './analysis';
export { createAlertsClient } from './alerts';
export type { CryptoPriceData, BRVMQuote } from './prices';

import { createApiClient } from './client';
import { createTransactionsClient } from './transactions';
import { createBudgetsClient } from './budgets';
import { createPortfolioClient } from './portfolio';
import { createPricesClient } from './prices';
import { createAnalysisClient } from './analysis';
import { createAlertsClient } from './alerts';

export function createBudgetPocketClient(baseUrl: string, getToken?: () => string | null) {
  const client = createApiClient(baseUrl, getToken);
  return {
    transactions: createTransactionsClient(client),
    budgets: createBudgetsClient(client),
    portfolio: createPortfolioClient(client),
    prices: createPricesClient(client),
    analysis: createAnalysisClient(client),
    alerts: createAlertsClient(client),
  };
}
