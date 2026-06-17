<script setup lang="ts">
import MemberDetailsEditor from "../components/MemberDetailsEditor.vue";
import { useMembersViewModel } from "../composables/useTeamDirectoryViewModel";

const {
  membersStore,
  groupsStore,
  activeEditMemberId,
  isSaving,
  activeDraft,
  activeAuditInfo,
  hasRows,
  isEditorOpen,
  beginCreate,
  beginEdit,
  cancelEdit,
  saveDraft,
  deleteOrUndelete,
} = useMembersViewModel();
</script>

<template>
  <section
    class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl shadow-slate-950/40 md:p-6"
  >
    <div
      class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <h2 class="font-heading text-2xl text-white">
        Members
        <span
          class="ml-2 rounded-full border border-slate-700 bg-slate-800 px-2 py-1 align-middle text-xs font-medium text-slate-300"
        >
          {{ membersStore.members.length }}
        </span>
      </h2>
      <div class="flex flex-wrap items-center gap-3">
        <label
          class="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200"
          :class="isEditorOpen ? 'cursor-not-allowed opacity-60' : ''"
        >
          <input
            v-model="membersStore.includeDeleted"
            type="checkbox"
            class="h-4 w-4 accent-cyan-400"
            :disabled="isEditorOpen"
          />
          <span>Show deleted</span>
        </label>
        <button
          type="button"
          class="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isEditorOpen"
          @click="beginCreate"
        >
          Create New Member
        </button>
      </div>
    </div>

    <p
      v-if="membersStore.errorMessage"
      class="mb-3 rounded-md border border-rose-400/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
    >
      {{ membersStore.errorMessage }}
    </p>
    <p
      v-if="membersStore.successMessage"
      class="mb-3 rounded-md border border-emerald-400/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200"
    >
      {{ membersStore.successMessage }}
    </p>

    <div v-if="activeEditMemberId === 'new'" class="mb-4">
      <MemberDetailsEditor
        :model-value="activeDraft"
        :audit-info="activeAuditInfo"
        :groups="groupsStore.groups"
        :is-saving="isSaving"
        title="Create Team Member"
        @save="saveDraft"
        @cancel="cancelEdit"
      />
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead class="bg-slate-950/70 text-slate-300">
          <tr>
            <th class="px-3 py-3 font-medium">Name</th>
            <th class="px-3 py-3 font-medium">Email</th>
            <th class="px-3 py-3 font-medium">Role</th>
            <th class="px-3 py-3 font-medium">Department</th>
            <th class="px-3 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody
          v-for="member in membersStore.members"
          :key="member.teamMemberId"
          class="divide-y divide-slate-800 bg-slate-900/40"
        >
          <tr
            :class="
              member.deletedDate
                ? 'bg-rose-950/20 text-slate-400'
                : 'text-slate-100'
            "
          >
            <td class="px-3 py-3">
              {{ member.firstName }} {{ member.lastName }}
            </td>
            <td class="px-3 py-3">{{ member.email }}</td>
            <td class="px-3 py-3">{{ member.jobTitle }}</td>
            <td class="px-3 py-3">{{ member.department }}</td>
            <td class="px-3 py-3">
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="rounded border border-slate-600 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="isEditorOpen"
                  @click="beginEdit(member)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="rounded border border-slate-600 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="isEditorOpen"
                  @click="deleteOrUndelete(member)"
                >
                  {{ member.deletedDate ? "Undelete" : "Delete" }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="activeEditMemberId === member.teamMemberId">
            <td colspan="5" class="p-3">
              <MemberDetailsEditor
                :model-value="activeDraft"
                :audit-info="activeAuditInfo"
                :groups="groupsStore.groups"
                :is-saving="isSaving"
                title="Edit Team Member"
                @save="saveDraft"
                @cancel="cancelEdit"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="membersStore.isLoading"
      class="mt-3 rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300"
    >
      Loading members...
    </div>
    <div
      v-else-if="!hasRows"
      class="mt-3 rounded-md border border-dashed border-slate-700 bg-slate-950/40 px-3 py-4 text-sm text-slate-400"
    >
      No members found.
    </div>
  </section>
</template>
