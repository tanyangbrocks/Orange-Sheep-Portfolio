import { experiences } from '#velite'

export type ExperienceEntry = (typeof experiences)[number]

export function getExperiences(): ExperienceEntry[] {
  return [...experiences].sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
}
