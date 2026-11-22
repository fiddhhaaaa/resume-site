// All score limits live here, so they are easy to review and change.
export const CAP = {
  unreadable: 20, // the file has no text software can read
  cannotContact: 69, // no email or no valid phone number
  majorGap: 79, // something essential is missing, so the score stays below 80
} as const;