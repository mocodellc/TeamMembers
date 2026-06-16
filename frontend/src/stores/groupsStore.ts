import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createGroup, deleteGroup, getGroups, updateGroup } from '../api/teamDirectoryApi'
import type { TeamGroup, TeamGroupUpsertRequest } from '../types/teamDirectory'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<readonly TeamGroup[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  async function loadGroups(): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''

    try {
      groups.value = await getGroups()
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to load groups.'
    } finally {
      isLoading.value = false
    }
  }

  async function createGroupAndReload(request: TeamGroupUpsertRequest): Promise<boolean> {
    try {
      await createGroup(request)
      successMessage.value = 'Group created.'
      await loadGroups()
      return true
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to create group.'
      return false
    }
  }

  async function updateGroupAndReload(teamGroupId: number, request: TeamGroupUpsertRequest): Promise<boolean> {
    try {
      await updateGroup(teamGroupId, request)
      successMessage.value = 'Group updated.'
      await loadGroups()
      return true
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to update group.'
      return false
    }
  }

  async function deleteGroupAndReload(teamGroupId: number): Promise<void> {
    try {
      await deleteGroup(teamGroupId)
      successMessage.value = 'Group deleted.'
      await loadGroups()
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to delete group.'
    }
  }

  function clearMessages(): void {
    errorMessage.value = ''
    successMessage.value = ''
  }

  return {
    groups,
    isLoading,
    errorMessage,
    successMessage,
    loadGroups,
    createGroupAndReload,
    updateGroupAndReload,
    deleteGroupAndReload,
    clearMessages,
  }
})
