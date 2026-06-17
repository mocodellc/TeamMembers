<script setup lang="ts">
import { faker } from "@faker-js/faker";
import { computed, onMounted, ref, watch } from "vue";
import MemberDetailsEditor from "../components/MemberDetailsEditor.vue";
import { useGroupsStore } from "../stores/groupsStore";
import { useMembersStore } from "../stores/membersStore";
import type {
  TeamMember,
  TeamMemberDraft,
  TeamMemberUpsertRequest,
} from "../types/teamDirectory";

const membersStore = useMembersStore();
const groupsStore = useGroupsStore();

const activeEditMemberId = ref<number | "new" | null>(null);
const isSaving = ref(false);
const activeDraft = ref<TeamMemberDraft>(createEmptyDraft());
const activeAuditInfo = ref<{
  createdDate: string | null;
  lastEditDate: string | null;
  deletedDate: string | null;
} | null>(null);

const hasRows = computed(() => membersStore.members.length > 0);

onMounted(async () => {
  await Promise.all([
    groupsStore.loadGroups(),
    membersStore.loadMembers(false),
  ]);
});

function createEmptyDraft(): TeamMemberDraft {
  return {
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    department: "",
    country: "",
    groupIds: [],
  };
}

function createDraftFromMember(member: TeamMember): TeamMemberDraft {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    jobTitle: member.jobTitle,
    department: member.department,
    country: member.country,
    groupIds: member.groups.map((group) => group.teamGroupId),
  };
}

watch(
  () => membersStore.includeDeleted,
  (includeDeleted) => {
    void membersStore.loadMembers(includeDeleted);
  },
);

function beginCreate(): void {
  membersStore.clearMessages();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  activeDraft.value = {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    jobTitle: faker.person.jobTitle(),
    department: faker.commerce.department(),
    country: faker.location.country(),
    groupIds: [],
  };
  activeAuditInfo.value = null;
  activeEditMemberId.value = "new";
}

function beginEdit(member: TeamMember): void {
  membersStore.clearMessages();
  activeEditMemberId.value = member.teamMemberId;
  activeDraft.value = createDraftFromMember(member);
  activeAuditInfo.value = {
    createdDate: member.createdDate,
    lastEditDate: member.lastEditDate,
    deletedDate: member.deletedDate,
  };
}

function cancelEdit(): void {
  activeEditMemberId.value = null;
  activeDraft.value = createEmptyDraft();
  activeAuditInfo.value = null;
}

async function saveDraft(draft: TeamMemberDraft): Promise<void> {
  isSaving.value = true;

  const request: TeamMemberUpsertRequest = {
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    email: draft.email.trim(),
    jobTitle: draft.jobTitle.trim(),
    department: draft.department.trim(),
    country: draft.country.trim(),
    groupIds: [...draft.groupIds],
  };

  let success = false;
  if (activeEditMemberId.value === "new") {
    success = await membersStore.createMemberAndReload(request);
  } else if (typeof activeEditMemberId.value === "number") {
    success = await membersStore.updateMemberAndReload(
      activeEditMemberId.value,
      request,
    );
  }

  if (success) {
    cancelEdit();
  }

  isSaving.value = false;
}

async function deleteOrUndelete(member: TeamMember): Promise<void> {
  if (activeEditMemberId.value === member.teamMemberId) {
    cancelEdit();
  }

  if (member.deletedDate === null) {
    await membersStore.deleteMemberAndReload(member.teamMemberId);
    return;
  }

  await membersStore.undeleteMemberAndReload(member.teamMemberId);
}
</script>

<template>
  <section
    class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl shadow-slate-950/40 md:p-6"
  >
    <div
      class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <h2 class="font-heading text-2xl text-white">Members</h2>
      <div class="flex flex-wrap items-center gap-3">
        <label
          class="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200"
        >
          <input
            v-model="membersStore.includeDeleted"
            type="checkbox"
            class="h-4 w-4 accent-cyan-400"
          />
          <span>Show deleted</span>
        </label>
        <button
          type="button"
          class="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
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
                  class="rounded border border-slate-600 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                  @click="beginEdit(member)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="rounded border border-slate-600 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-rose-400 hover:text-rose-200"
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
