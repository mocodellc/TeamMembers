import type {
  TeamGroup,
  TeamGroupUpsertRequest,
  TeamMember,
  TeamMemberUpsertRequest,
} from '../types/teamDirectory'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiRequestError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...init,
    })

    if (!response.ok) {
      const maybeProblem = (await response.json().catch(() => null)) as { detail?: string } | null
      const detail = maybeProblem?.detail ?? `Request failed with status ${response.status}`
      throw new ApiRequestError(response.status, detail)
    }

    if (response.status === 204) {
      return null as T
    }

    return (await response.json()) as T
  } catch (error: unknown) {
    if (error instanceof ApiRequestError) {
      throw error
    }

    const message = error instanceof Error ? error.message : 'Unknown API request error'
    throw new Error(message)
  }
}

export async function getMembers(includeDeleted: boolean): Promise<readonly TeamMember[]> {
  const query = includeDeleted ? '?includeDeleted=true' : ''
  return requestJson<readonly TeamMember[]>(`/TeamMembers${query}`)
}

export async function createMember(request: TeamMemberUpsertRequest): Promise<TeamMember> {
  return requestJson<TeamMember>('/TeamMembers', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function updateMember(teamMemberId: number, request: TeamMemberUpsertRequest): Promise<TeamMember> {
  return requestJson<TeamMember>(`/TeamMembers/${teamMemberId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export async function deleteMember(teamMemberId: number): Promise<TeamMember> {
  return requestJson<TeamMember>(`/TeamMembers/${teamMemberId}`, {
    method: 'DELETE',
  })
}

export async function undeleteMember(teamMemberId: number): Promise<TeamMember> {
  return requestJson<TeamMember>(`/TeamMembers/${teamMemberId}/undelete`, {
    method: 'POST',
  })
}

export async function getGroups(): Promise<readonly TeamGroup[]> {
  return requestJson<readonly TeamGroup[]>('/TeamGroups')
}

export async function createGroup(request: TeamGroupUpsertRequest): Promise<TeamGroup> {
  return requestJson<TeamGroup>('/TeamGroups', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function updateGroup(teamGroupId: number, request: TeamGroupUpsertRequest): Promise<TeamGroup> {
  return requestJson<TeamGroup>(`/TeamGroups/${teamGroupId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export async function deleteGroup(teamGroupId: number): Promise<void> {
  await requestJson<void>(`/TeamGroups/${teamGroupId}`, {
    method: 'DELETE',
  })
}
