/** Movement direction. Valid values: "income" | "outcome". No default. */
export type OperationType = 'income' | 'outcome'

/** Business line. Valid values: "B2B" | "B2C". No default. */
export type BusinessType = 'B2B' | 'B2C'

/**
 * Movement category.
 * Valid values: "suppliers" | "sales" | "operational" | "administrative" | "others".
 * No default.
 */
export type Category =
  | 'suppliers'
  | 'sales'
  | 'operational'
  | 'administrative'
  | 'others'

/** GET /api/metrics/facets response. */
export interface FacetsResponse {
  /**
   * Operation types present in the dataset.
   * Valid values: "income" | "outcome".
   * No default.
   */
  operation_types: OperationType[]
  /**
   * Business lines present in the dataset.
   * Valid values: "B2B" | "B2C".
   * No default.
   */
  business_types: BusinessType[]
  /**
   * Categories present in the dataset. One list for the whole dataset, not one list per business line.
   * Valid values: "suppliers" | "sales" | "operational" | "administrative" | "others".
   * No default.
   */
  categories: Category[]
  /**
   * Earliest movement date in the dataset.
   * Format: YYYY-MM-DD.
   * No default.
   */
  min_date: string
  /**
   * Latest movement date in the dataset.
   * Format: YYYY-MM-DD.
   * No default.
   */
  max_date: string
}

/** One row from GET /api/metrics/alerts. */
export interface AlertEntry {
  /**
   * Period label for this alert.
   * Type: string. No format and no allowed-value list in the API.
   * No default.
   */
  period: string
  /**
   * Recorded outcome total for this period.
   * Type: number.
   * No default.
   */
  outcome_total: number
  /**
   * Average outcome of every period before this one.
   * Type: number.
   * No default.
   * The API averages ALL previous periods (backend/app/routes.py line 231), not the previous 3 the PM described.
   */
  baseline_average: number
  /**
   * Increase of outcome_total over baseline_average.
   * Type: number. A ratio, where 0.3 means 30%. The UI shows it as a percentage.
   * No default.
   */
  increase_ratio: number
}

/** GET /api/metrics/alerts response. */
export type AlertsResponse = AlertEntry[]

/** One row from GET /api/metrics/categories/top. */
export interface CategoryEntry {
  /**
   * Category name for this row.
   * Valid values: "suppliers" | "sales" | "operational" | "administrative" | "others".
   * No default.
   */
  category: Category
  /**
   * Operation type this total was summed for.
   * Valid values: "income" | "outcome".
   * No default.
   */
  operation_type: OperationType
  /**
   * Summed amount for this category.
   * Type: number.
   * No default.
   * The UI must calculate "percentage of group total" itself; the API does not return it.
   */
  total_amount: number
}

/** GET /api/metrics/categories/top response. */
export type TopCategoriesResponse = CategoryEntry[]
