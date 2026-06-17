import { faker } from "@faker-js/faker";
import { computed, onMounted, ref, watch } from "vue";
import type { ComputedRef, Ref } from "vue";
import { useGroupsStore } from "../stores/groupsStore";
import { useMembersStore } from "../stores/membersStore";
import type {
  TeamGroup,
  TeamMember,
  TeamMemberDraft,
  TeamMemberUpsertRequest,
} from "../types/teamDirectory";

type AuditInfo = {
  createdDate: string | null;
  lastEditDate: string | null;
  deletedDate: string | null;
};

type MembersViewModel = {
  membersStore: ReturnType<typeof useMembersStore>;
  groupsStore: ReturnType<typeof useGroupsStore>;
  activeEditMemberId: Ref<number | "new" | null>;
  isSaving: Ref<boolean>;
  activeDraft: Ref<TeamMemberDraft>;
  activeAuditInfo: Ref<AuditInfo | null>;
  hasRows: ComputedRef<boolean>;
  isEditorOpen: ComputedRef<boolean>;
  beginCreate: () => void;
  beginEdit: (member: TeamMember) => void;
  cancelEdit: () => void;
  saveDraft: (draft: TeamMemberDraft) => Promise<void>;
  deleteOrUndelete: (member: TeamMember) => Promise<void>;
};

type GroupsViewModel = {
  groupsStore: ReturnType<typeof useGroupsStore>;
  draftName: Ref<string>;
  draftDescription: Ref<string>;
  editGroupId: Ref<number | null>;
  saveGroup: () => Promise<void>;
  startEdit: (group: TeamGroup) => void;
  resetForm: () => void;
  removeGroup: (teamGroupId: number) => Promise<void>;
  formatDate: (value: string) => string;
};

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

export function useMembersViewModel(): MembersViewModel {
  const membersStore = useMembersStore();
  const groupsStore = useGroupsStore();

  const activeEditMemberId = ref<number | "new" | null>(null);
  const isSaving = ref(false);
  const activeDraft = ref<TeamMemberDraft>(createEmptyDraft());
  const activeAuditInfo = ref<AuditInfo | null>(null);

  const hasRows = computed(() => membersStore.members.length > 0);
  const isEditorOpen = computed(() => activeEditMemberId.value !== null);

  onMounted(async () => {
    await Promise.all([
      groupsStore.loadGroups(),
      membersStore.loadMembers(false),
    ]);
  });

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

  return {
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
  };
}

export function useGroupsViewModel(): GroupsViewModel {
  const groupsStore = useGroupsStore();

  const draftName = ref("");
  const draftDescription = ref("");
  const editGroupId = ref<number | null>(null);

  onMounted(async () => {
    await groupsStore.loadGroups();
  });

  async function saveGroup(): Promise<void> {
    const payload = {
      name: draftName.value.trim(),
      description: draftDescription.value.trim(),
    };

    if (!payload.name || !payload.description) {
      groupsStore.errorMessage = "Name and description are required.";
      return;
    }

    let success = false;
    if (editGroupId.value === null) {
      success = await groupsStore.createGroupAndReload(payload);
    } else {
      success = await groupsStore.updateGroupAndReload(
        editGroupId.value,
        payload,
      );
    }

    if (success) {
      resetForm();
    }
  }

  function startEdit(group: TeamGroup): void {
    groupsStore.clearMessages();
    editGroupId.value = group.teamGroupId;
    draftName.value = group.name;
    draftDescription.value = group.description;
  }

  function resetForm(): void {
    editGroupId.value = null;
    draftName.value = "";
    draftDescription.value = "";
  }

  async function removeGroup(teamGroupId: number): Promise<void> {
    await groupsStore.deleteGroupAndReload(teamGroupId);
    if (editGroupId.value === teamGroupId) {
      resetForm();
    }
  }

  function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  }

  return {
    groupsStore,
    draftName,
    draftDescription,
    editGroupId,
    saveGroup,
    startEdit,
    resetForm,
    removeGroup,
    formatDate,
  };
}
