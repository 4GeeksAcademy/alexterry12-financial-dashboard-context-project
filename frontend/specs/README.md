# Frontend specs

These files are specs only. Do not build React components or API calls from this folder without a separate task.

## 1. Date range filter

### Endpoints

- `GET /api/metrics/facets`
- `GET /api/metrics`

### Types

- Request: `DateRangeFilter` from `param-types.ts` (`start_date`, `end_date` only).
- Response: `FacetsResponse` from `api-types.ts` for `GET /api/metrics/facets`.
- Response: `FinancialMovement[]` — already defined in `frontend/src/lib/financial-types.ts`. Reuse it; do not redefine it.

After filtering, the existing KPI cards and both charts recalculate from the filtered list using `computeKPIs` and `computeMonthlyData` (`frontend/src/lib/financial-utils.ts`), the same way `App.tsx` does today. No new endpoint is needed for the cards or charts.

### Parameters

`GET /api/metrics/facets` has no query parameters.

`GET /api/metrics`:

| Parameter | Type | Required | Default | Valid values or range |
|---|---|---|---|---|
| `start_date` | `string` (`format: date`) or `null` | optional | none | YYYY-MM-DD |
| `end_date` | `string` (`format: date`) or `null` | optional | none | YYYY-MM-DD |
| `category` | `string` enum or `null` | optional | none | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `operation_type` | `string` enum or `null` | optional | none | `income`, `outcome` |

### Edge cases

- One date filled. What happens: send only that field; the other side stays open. What the UI must show: the filled input, the blank input, and the valid range `min_date` to `max_date`.
- `start_date` after `end_date`. What happens: do not send the request. What the UI must show: "Start date must be on or before the end date."

### Components

- `MetricsDateFilter`

## 2. Anomaly alerts

### Endpoints

- `GET /api/metrics/alerts`

### Types

- Request: `AlertsParams` from `param-types.ts` (includes `DateRangeFilter`).
- Response: `AlertsResponse` from `api-types.ts`, an array of `AlertEntry`.

### Parameters

| Parameter | Type | Required | Default | Valid values or range |
|---|---|---|---|---|
| `threshold` | `number` | optional | `0.3` | API minimum `0`, no maximum. The UI accepts only 0.01–1.0. |
| `group_by` | `string` enum | optional | `month` | `day`, `week`, `month` |
| `start_date` | `string` (`format: date`) or `null` | optional | none | YYYY-MM-DD |
| `end_date` | `string` (`format: date`) or `null` | optional | none | YYYY-MM-DD |
| `business_type` | `string` enum or `null` | optional | none | `B2B`, `B2C` |

Send the Feature 1 `start_date` and `end_date` when they are filled. Omit `group_by` so the API default `month` applies.

### Edge cases

- The response array is empty. What happens: the table stays mounted with its headers. What the UI must show: "No spending anomalies above the current threshold."
- Typed threshold is outside 0.01–1.0. What happens: do not change the last valid `threshold`, and do not send a new request. What the UI must show: "Threshold must be between 0.01 and 1.0."

### Components

- `AlertsThresholdField`
- `AlertsTable`

## 3. B2B vs B2C

### Endpoints

- `GET /api/metrics/facets`
- `GET /api/metrics/categories/top`

### Types

- Request: `DateRangeFilter` and `TopCategoriesParams` from `param-types.ts`. `business_type` is `BusinessType` and `operation_type` is `OperationType` from `api-types.ts`.
- Response: `FacetsResponse` and `TopCategoriesResponse` from `api-types.ts`. Each row is a `CategoryEntry`.

### Parameters

`GET /api/metrics/facets` has no query parameters.

`GET /api/metrics/categories/top` (one request per `business_type`):

| Parameter | Type | Required | Default | Valid values or range |
|---|---|---|---|---|
| `operation_type` | `string` enum | optional | `outcome` | `income`, `outcome`. This feature sends `income`. |
| `limit` | `integer` | optional | `5` | 1–20. This feature sends `5`. |
| `start_date` | `string` (`format: date`) or `null` | optional | none | YYYY-MM-DD |
| `end_date` | `string` (`format: date`) or `null` | optional | none | YYYY-MM-DD |
| `business_type` | `string` enum or `null` | optional | none | `B2B`, `B2C`. One call uses `B2B`, the other uses `B2C`. |

### Edge cases

- A panel's `TopCategoriesResponse` is empty. What happens: that panel has no rows. What the UI must show: "No income categories for this period."
- Both panel sums of `total_amount` are `0`. What happens: the chart has nothing to plot. What the UI must show: "No income data for this period."

### Components

- `MetricsDateFilter` at the top of the page. Its range is what both panels use.
- `BusinessTypeCategories`
- `BusinessTypeCategoryPanel`
- `BusinessTypeIncomeChart`

## PM wording vs API

| PM said | API actually | Decision in this spec |
|---|---|---|
| earliest/latest | `min_date` / `max_date` | Show `FacetsResponse.min_date` to `FacetsResponse.max_date` as the valid range. |
| rolling 3 periods | API averages ALL previous periods | Show `baseline_average` as returned. Do not recompute a 3-period window. |
| percentage increase | `increase_ratio` shown as % | `increase_ratio` is a ratio (`0.3` = 30%). The UI shows it as a percentage. |
| threshold 0.01–1.0 | API allows >= 0, UI enforces 0.01–1.0 | `threshold` default is `0.3`, minimum `0`, no maximum. The UI rejects values outside 0.01–1.0 and keeps the last valid value. |
| alerts URL missing dates | send `start_date` / `end_date` | `GET /api/metrics/alerts` includes the filled Feature 1 dates. An omitted side stays open. |
| one top-categories call | two calls, one per `business_type` | Send two `GET /api/metrics/categories/top` requests, `business_type` `B2B` and `business_type` `B2C`. |
| percentage of group total | UI calculates it | `total_amount` is the only amount field. Percentage is `total_amount / sum of total_amount` in that panel. |
| categories per group | facets has one shared list | `FacetsResponse.categories` is one list for the dataset. Panel rows come from that panel's `TopCategoriesResponse`. |
