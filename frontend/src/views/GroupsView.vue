<script setup lang="ts">
import { useGroupsViewModel } from "../composables/useTeamDirectoryViewModel";

const {
  groupsStore,
  draftName,
  draftDescription,
  editGroupId,
  saveGroup,
  startEdit,
  resetForm,
  removeGroup,
  formatDate,
} = useGroupsViewModel();
</script>

<template>
  <section
    class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl shadow-slate-950/40 md:p-6"
  >
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-heading text-2xl text-white">Groups</h2>
    </div>

    <p
      v-if="groupsStore.errorMessage"
      class="mb-3 rounded-md border border-rose-400/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
    >
      {{ groupsStore.errorMessage }}
    </p>
    <p
      v-if="groupsStore.successMessage"
      class="mb-3 rounded-md border border-emerald-400/50 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200"
    >
      {{ groupsStore.successMessage }}
    </p>

    <div class="mb-4 rounded-xl border border-slate-700 bg-slate-950/50 p-4">
      <h3
        class="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-200"
      >
        {{ editGroupId === null ? "Create Group" : "Edit Group" }}
      </h3>
      <div class="grid gap-3 md:grid-cols-2">
        <label
          class="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400"
        >
          Name
          <input
            v-model="draftName"
            type="text"
            class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
          />
        </label>
        <label
          class="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400"
        >
          Description
          <input
            v-model="draftDescription"
            type="text"
            class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
          />
        </label>
      </div>
      <div class="mt-3 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400"
          @click="resetForm"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          @click="saveGroup"
        >
          Save
        </button>
      </div>
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead class="bg-slate-950/70 text-slate-300">
          <tr>
            <th class="px-3 py-3 font-medium">Name</th>
            <th class="px-3 py-3 font-medium">Description</th>
            <th class="px-3 py-3 font-medium">Created</th>
            <th class="px-3 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 bg-slate-900/40 text-slate-100">
          <tr v-for="group in groupsStore.groups" :key="group.teamGroupId">
            <td class="px-3 py-3">{{ group.name }}</td>
            <td class="px-3 py-3">{{ group.description }}</td>
            <td class="px-3 py-3">{{ formatDate(group.createdDate) }}</td>
            <td class="px-3 py-3">
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="rounded border border-slate-600 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                  @click="startEdit(group)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="rounded border border-slate-600 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-rose-400 hover:text-rose-200"
                  @click="removeGroup(group.teamGroupId)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="groupsStore.isLoading"
      class="mt-3 rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300"
    >
      Loading groups...
    </div>
    <div
      v-else-if="groupsStore.groups.length === 0"
      class="mt-3 rounded-md border border-dashed border-slate-700 bg-slate-950/40 px-3 py-4 text-sm text-slate-400"
    >
      No groups found.
    </div>
  </section>
</template>
