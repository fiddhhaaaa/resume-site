// How long we keep things. The privacy page reads these numbers, so the
// text always matches what the site really does. Your client should confirm them.
export const RETENTION = {
  filesAfterDeliveryDays: 90, // customer resume and finished resume files
  unpaidOrderDays: 7, // orders that were never paid
  unclaimedReportDays: 7, // a check nobody asked to be emailed
  emailedReportDays: 30, // a report that was emailed
} as const;