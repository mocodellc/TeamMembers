<script setup lang="ts">
import { toRef } from "vue";
import { useMemberDetailsEditorModel } from "../composables/useMemberDetailsEditorModel";
import type { TeamGroup, TeamMemberDraft } from "../types/teamDirectory";

interface MemberDetailsEditorProps {
  modelValue: TeamMemberDraft;
  groups: readonly TeamGroup[];
  isSaving: boolean;
  title: string;
  auditInfo?: {
    createdDate: string | null;
    lastEditDate: string | null;
    deletedDate: string | null;
  } | null;
}

const props = defineProps<MemberDetailsEditorProps>();

const emit = defineEmits<{
  (event: "save", value: TeamMemberDraft): void;
  (event: "cancel"): void;
}>();

const { localDraft, isFormValid, toggleGroup, onSave, formatInfoDate } =
  useMemberDetailsEditorModel(toRef(props, "modelValue"), (value) => {
    emit("save", value);
  });
</script>

<template>
  <section
    class="animate-slideDown rounded-xl border border-slate-700 bg-slate-900/70 p-4"
  >
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-heading text-lg text-cyan-200">{{ title }}</h3>
      <p class="text-xs text-slate-400">All fields are required.</p>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <label
        class="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400"
      >
        First Name
        <input
          v-model="localDraft.firstName"
          type="text"
          class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
        />
      </label>
      <label
        class="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400"
      >
        Last Name
        <input
          v-model="localDraft.lastName"
          type="text"
          class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
        />
      </label>
      <label
        class="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400"
      >
        Email
        <input
          v-model="localDraft.email"
          type="email"
          class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
        />
      </label>
      <label
        class="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400"
      >
        Job Title
        <input
          v-model="localDraft.jobTitle"
          type="text"
          class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
        />
      </label>
      <label
        class="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400"
      >
        Department
        <input
          v-model="localDraft.department"
          type="text"
          class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
        />
      </label>
      <label
        class="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400"
      >
        Country
        <input
          v-model="localDraft.country"
          type="text"
          class="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-400 transition focus:ring-2"
        />
      </label>
    </div>

    <div
      class="mt-4 grid gap-3 rounded-md border border-slate-800 bg-slate-950/50 p-3 md:grid-cols-3"
    >
      <div class="text-xs">
        <p class="uppercase tracking-wide text-slate-400">Created</p>
        <p class="mt-1 text-sm text-slate-200">
          {{ formatInfoDate(props.auditInfo?.createdDate) }}
        </p>
      </div>
      <div class="text-xs">
        <p class="uppercase tracking-wide text-slate-400">Last Edit</p>
        <p class="mt-1 text-sm text-slate-200">
          {{ formatInfoDate(props.auditInfo?.lastEditDate) }}
        </p>
      </div>
      <div class="text-xs">
        <p class="uppercase tracking-wide text-slate-400">Deleted</p>
        <p class="mt-1 text-sm text-slate-200">
          {{ formatInfoDate(props.auditInfo?.deletedDate) }}
        </p>
      </div>
    </div>

    <fieldset class="mt-4">
      <legend class="mb-2 text-xs uppercase tracking-wide text-slate-400">
        Groups
      </legend>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="group in props.groups"
          :key="group.teamGroupId"
          class="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-200"
        >
          <input
            :checked="localDraft.groupIds.includes(group.teamGroupId)"
            type="checkbox"
            class="h-4 w-4 accent-cyan-400"
            @change="toggleGroup(group.teamGroupId)"
          />
          <span>{{ group.name }}</span>
        </label>
      </div>
    </fieldset>

    <div class="mt-5 flex justify-end gap-2">
      <button
        type="button"
        class="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="button"
        :disabled="!isFormValid || props.isSaving"
        class="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        @click="onSave"
      >
        Save
      </button>
    </div>
  </section>
</template>
