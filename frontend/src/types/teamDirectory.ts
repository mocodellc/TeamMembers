export interface TeamGroupSummary {
  readonly teamGroupId: number
  readonly name: string
}

export interface TeamGroup {
  readonly teamGroupId: number
  readonly name: string
  readonly description: string
  readonly createdDate: string
}

export interface TeamMember {
  readonly teamMemberId: number
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  readonly jobTitle: string
  readonly department: string
  readonly country: string
  readonly createdDate: string
  readonly lastEditDate: string | null
  readonly deletedDate: string | null
  readonly groups: readonly TeamGroupSummary[]
}

export interface TeamMemberUpsertRequest {
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  readonly jobTitle: string
  readonly department: string
  readonly country: string
  readonly groupIds: readonly number[]
}

export interface TeamGroupUpsertRequest {
  readonly name: string
  readonly description: string
}

export interface TeamMemberDraft {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  department: string
  country: string
  groupIds: number[]
}
