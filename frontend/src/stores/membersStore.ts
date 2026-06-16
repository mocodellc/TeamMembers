import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createMember,
  deleteMember,
  getMembers,
  undeleteMember,
  updateMember,
} from '../api/teamDirectoryApi'
import type { TeamMember, TeamMemberUpsertRequest } from '../types/teamDirectory'

export const useMembersStore = defineStore('members', () => {
  const members = ref<readonly TeamMember[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const includeDeleted = ref(false)

  async function loadMembers(nextIncludeDeleted = includeDeleted.value): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''
    includeDeleted.value = nextIncludeDeleted

    try {
      members.value = await getMembers(nextIncludeDeleted)
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to load team members.'
    } finally {
      isLoading.value = false
    }
  }

  async function createMemberAndReload(request: TeamMemberUpsertRequest): Promise<boolean> {
    try {
      await createMember(request)
      successMessage.value = 'Team member created.'
      await loadMembers()
      return true
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to create team member.'
      return false
    }
  }

  async function updateMemberAndReload(teamMemberId: number, request: TeamMemberUpsertRequest): Promise<boolean> {
    try {
      await updateMember(teamMemberId, request)
      successMessage.value = 'Team member updated.'
      await loadMembers()
      return true
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to update team member.'
      return false
    }
  }

  async function deleteMemberAndReload(teamMemberId: number): Promise<void> {
    try {
      await deleteMember(teamMemberId)
      successMessage.value = 'Team member soft deleted.'
      await loadMembers()
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to delete team member.'
    }
  }

  async function undeleteMemberAndReload(teamMemberId: number): Promise<void> {
    try {
      await undeleteMember(teamMemberId)
      successMessage.value = 'Team member restored.'
      await loadMembers()
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to undelete team member.'
    }
  }

  function clearMessages(): void {
    errorMessage.value = ''
    successMessage.value = ''
  }

  return {
    members,
    isLoading,
    errorMessage,
    successMessage,
    includeDeleted,
    loadMembers,
    createMemberAndReload,
    updateMemberAndReload,
    deleteMemberAndReload,
    undeleteMemberAndReload,
    clearMessages,
  }
})
