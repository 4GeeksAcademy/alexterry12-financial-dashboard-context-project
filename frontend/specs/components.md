# Dashboard feature components

File names match `frontend/src/components/dashboard/`: PascalCase component, kebab-case file. Prop types are the names exported from `frontend/specs/api-types.ts` and `frontend/specs/param-types.ts`.

Shared request rule for dates: a `DateRangeFilter` sends only the sides that are filled in. One filled date leaves the other side open. Both empty sends neither `start_date` nor `end_date`. If `start_date` is after `end_date`, show an inline error and do not send the request.

## Feature 1 — Date range filter

### MetricsDateFilter

- Name: `MetricsDateFilter`
- File: `frontend/src/components/dashboard/metrics-date-filter.tsx`

Props:

| Prop | Type | Required |
|---|---|---|
| `range` | `DateRangeFilter` | required |
| `facets` | `FacetsResponse` | optional |
| `loading` | `boolean` | optional |
| `error` | `string` | optional |
| `onRangeChange` | `(range: DateRangeFilter) => void` | required |

`onRangeChange` is called only with a range that is allowed to be sent.

States:

- Loading: render `Skeleton` in place of both date inputs and the range hint. Do not call `onRangeChange`.
- Error: keep the inputs, and show the `error` string inline. This is a failed facets or metrics load, not the date-order error.
- Empty: both `start_date` and `end_date` are absent. Show the inputs blank. Show the valid range as `facets.min_date` to `facets.max_date`. Call `onRangeChange` with a `DateRangeFilter` that omits both fields.
- Normal: show both inputs and the valid range `facets.min_date` to `facets.max_date` from `FacetsResponse`. If only one of `start_date` or `end_date` is filled, call `onRangeChange` with only that field set. If `start_date` is after `end_date`, show an inline error, "Start date must be on or before the end date.", and do not call `onRangeChange`.

## Feature 2 — Anomaly alerts table

The request is an `AlertsParams`. Its `start_date` and `end_date` are the Feature 1 `DateRangeFilter` (same one-sided rule). A Feature 1 date-order error blocks this request too. `group_by` is omitted, so the API default `"month"` applies.

### AlertsThresholdField

- Name: `AlertsThresholdField`
- File: `frontend/src/components/dashboard/alerts-threshold-field.tsx`

Props:

| Prop | Type | Required |
|---|---|---|
| `threshold` | `AlertsParams['threshold']` | required |
| `onThresholdChange` | `(threshold: AlertsParams['threshold']) => void` | required |

`threshold` is the last valid value. The initial value is `0.3`.

States:

- Loading: not used. The field stays editable while the table loads.
- Error: when the typed value is outside 0.01–1.0, show an inline error, "Threshold must be between 0.01 and 1.0.", and do not call `onThresholdChange`. The prop stays at the last valid value.
- Empty: not used. A blank input is outside 0.01–1.0, so it uses the error state and keeps the last valid value.
- Normal: show the last valid `threshold`. A value inside 0.01–1.0 calls `onThresholdChange` with that number.

### AlertsTable

- Name: `AlertsTable`
- File: `frontend/src/components/dashboard/alerts-table.tsx`

Props:

| Prop | Type | Required |
|---|---|---|
| `alerts` | `AlertsResponse` | required |
| `loading` | `boolean` | optional |
| `error` | `string` | optional |

The table shell always stays mounted. Columns are `period`, `outcome_total`, `baseline_average`, and `increase_ratio`.

States:

- Loading: render `Skeleton` rows inside the table body. Column headers stay.
- Error: headers stay, and the body shows the `error` string.
- Empty: `alerts` is an empty `AlertsResponse`. Headers stay. The body shows "No spending anomalies above the current threshold."
- Normal: one row per `AlertEntry`. Show `period`, `outcome_total`, and `baseline_average` as returned. `baseline_average` is the API value (the average of all previous periods), not a 3-period window. Show `increase_ratio` as a percentage (`0.3` renders as `30%`).

## Feature 3 — B2B vs B2C page

The page reuses `MetricsDateFilter` at the top. That filter's `DateRangeFilter` is the range both panels use. Each panel sends its own `GET /api/metrics/categories/top`. The query is a `TopCategoriesParams`: `operation_type` `"income"`, `limit` `5`, that panel's `business_type`, and only the filled dates from that `DateRangeFilter`. A date-order error in `MetricsDateFilter` means neither panel sends.

### BusinessTypeCategories

- Name: `BusinessTypeCategories`
- File: `frontend/src/components/dashboard/business-type-categories.tsx`

Props:

| Prop | Type | Required |
|---|---|---|
| `range` | `DateRangeFilter` | required |
| `facets` | `FacetsResponse` | optional |
| `loading` | `boolean` | optional |
| `error` | `string` | optional |

This renders `MetricsDateFilter` at the top. Its range is the `DateRangeFilter` passed to both panels. Below the filter it renders two `BusinessTypeCategoryPanel` components, one with `business_type` `"B2B"` and one with `business_type` `"B2C"`, then `BusinessTypeIncomeChart` below both panels. `facets.categories` is the dataset-wide category list from `FacetsResponse`. It is not a per-group list. Panel rows come from each panel's own `TopCategoriesResponse`.

States:

- Loading: render `Skeleton` for the page heading and both panel slots.
- Error: show the `error` string for the failed facets load. Panels still render with `range`.
- Empty: `facets` is present and `facets.categories` is empty. Show the valid range from `facets.min_date` to `facets.max_date`, and still render both panels.
- Normal: show `facets.min_date` to `facets.max_date` and both panels.

### BusinessTypeCategoryPanel

- Name: `BusinessTypeCategoryPanel`
- File: `frontend/src/components/dashboard/business-type-category-panel.tsx`

Props:

| Prop | Type | Required |
|---|---|---|
| `business_type` | `BusinessType` | required |
| `range` | `DateRangeFilter` | required |
| `entries` | `TopCategoriesResponse` | required |
| `loading` | `boolean` | optional |
| `error` | `string` | optional |

The parent makes one request per panel. `entries` is that response. Percentage for a `CategoryEntry` is `total_amount / sum of total_amount` for the `entries` in this panel only. The API does not return that percentage.

States:

- Loading: render `Skeleton` inside the panel. The panel heading shows `business_type`.
- Error: show the `error` string inside the panel. The other panel is unchanged.
- Empty: `entries` is an empty `TopCategoriesResponse`. Show "No income categories for this period."
- Normal: show only the returned rows. Fewer than 5 rows shows those rows and does not pad. Each row shows `category`, `total_amount`, and the panel percentage. Do not divide when the panel sum of `total_amount` is `0`.

### BusinessTypeIncomeChart

- Name: `BusinessTypeIncomeChart`
- File: `frontend/src/components/dashboard/business-type-income-chart.tsx`

Shown below both panels. One bar for B2B and one for B2C. Each bar is the sum of `total_amount` in that panel's entries. This equals total income, because income movements only have the categories `"sales"` or `"others"` (`backend/app/routes.py` line 79), so `limit` 5 always includes every income category.

Props:

| Prop | Type | Required |
|---|---|---|
| `b2b` | `TopCategoriesResponse` | required |
| `b2c` | `TopCategoriesResponse` | required |
| `loading` | `boolean` | optional |
| `error` | `string` | optional |

States:

- Loading: render `Skeleton`.
- Error: show the `error` string.
- Empty: both sums are `0`. Show "No income data for this period."
- Normal: two bars, one for B2B (`b2b`) and one for B2C (`b2c`).
