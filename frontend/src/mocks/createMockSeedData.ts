import { faker } from '@faker-js/faker'
import type { TeamGroup, TeamMember } from '../types/teamDirectory'

interface TeamDirectoryMockData {
  readonly groups: readonly TeamGroup[]
  readonly members: readonly TeamMember[]
}

export function createMockSeedData(): TeamDirectoryMockData {
  const nowIso = new Date().toISOString()

  const groups: readonly TeamGroup[] = [
    {
      teamGroupId: 1,
      name: 'Engineering',
      description: 'Product engineering and platform delivery',
      createdDate: nowIso,
    },
    {
      teamGroupId: 2,
      name: 'Design',
      description: 'UX and product design organization',
      createdDate: nowIso,
    },
    {
      teamGroupId: 3,
      name: 'Operations',
      description: 'Support and internal operations',
      createdDate: nowIso,
    },
    {
      teamGroupId: 4,
      name: 'Leadership',
      description: 'People and strategy leadership',
      createdDate: nowIso,
    },
  ]

  const members = Array.from({ length: 10 }, (_, index) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    const assignedGroups = faker.helpers.arrayElements(groups, {
      min: 1,
      max: 2,
    })

    return {
      teamMemberId: index + 1,
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      jobTitle: faker.person.jobTitle(),
      department: faker.commerce.department(),
      country: faker.location.country(),
      createdDate: faker.date.recent({ days: 30 }).toISOString(),
      lastEditDate: null,
      deletedDate: null,
      groups: assignedGroups.map((group) => ({
        teamGroupId: group.teamGroupId,
        name: group.name,
      })),
    } satisfies TeamMember
  })

  return {
    groups,
    members,
  }
}
