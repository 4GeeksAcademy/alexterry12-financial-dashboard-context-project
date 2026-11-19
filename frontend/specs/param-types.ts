import type { BusinessType, OperationType } from './api-types'

/**
 * Shared date query for GET /api/metrics, GET /api/metrics/alerts, and GET /api/metrics/categories/top.
 */
export interface DateRangeFilter {
  /**
   * Include movements on or after this date.
   * Optional. Format: YYYY-MM-DD.
   * No default. Omitted means no start bound.
   */
  start_date?: string
  /**
   * Include movements on or before this date.
   * Optional. Format: YYYY-MM-DD.
   * No default. Omitted means no end bound.
   */
  end_date?: string
}

/** GET /api/metrics/alerts query parameters. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum increase_ratio for a period to be returned.
   * Optional. Type: number.
   * API allows >= 0 with no max; default 0.3. The UI must restrict input to 0.01–1.0 (PM requirement).
   */
  threshold?: number
  /**
   * How periods are bucketed.
   * Optional. Valid values: "day" | "week" | "month".
   * Default: "month".
   */
  group_by?: 'day' | 'week' | 'month'
  /**
   * Limit alerts to one business line.
   * Optional. Valid values: "B2B" | "B2C".
   * No default. Omitted includes both lines in one response.
   */
  business_type?: BusinessType
}

/** GET /api/metrics/categories/top query parameters. */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Which movement direction to rank.
   * Optional. Valid values: "income" | "outcome".
   * Default: "outcome".
   */
  operation_type?: OperationType
  /**
   * Maximum number of categories to return.
   * Optional. Type: integer.
   * Range: 1–20. Default: 5.
   */
  limit?: number
  /**
   * Limit the ranking to one business line.
   * Optional. Valid values: "B2B" | "B2C".
   * No default.
   * B2B and B2C need two separate requests.
   */
  business_type?: BusinessType
}
