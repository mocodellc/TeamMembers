import { faker } from "@faker-js/faker";
import { computed, onMounted, ref, watch } from "vue";
import type { ComputedRef, Ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
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

const createEmptyDraft = (): TeamMemberDraft => {
  return {
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    department: "",
    country: "",
    groupIds: [],
  };
};

const createDraftFromMember = (member: TeamMember): TeamMemberDraft => {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    jobTitle: member.jobTitle,
    department: member.department,
    country: member.country,
    groupIds: member.groups.map((group) => group.teamGroupId),
  };
};

export const useMembersViewModel = (): MembersViewModel => {
  const membersStore = useMembersStore();
  const groupsStore = useGroupsStore();

  const activeEditMemberId = ref<number | "new" | null>(null);
  const isSaving = ref(false);
  const activeDraft = ref<TeamMemberDraft>(createEmptyDraft());
  const activeAuditInfo = ref<AuditInfo | null>(null);

  const hasRows = computed(() => membersStore.members.length > 0);
  const isEditorOpen = computed(() => activeEditMemberId.value !== null);

  const canMutateRow = (member: TeamMember): boolean => {
    if (!isEditorOpen.value) {
      return true;
    }

    return activeEditMemberId.value === member.teamMemberId;
  };

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

  onBeforeRouteLeave(() => {
    if (activeEditMemberId.value === null) {
      return true;
    }

    const shouldLeave = window.confirm(
      "You have an open member editor. Leave this page and discard unsaved changes?",
    );

    if (!shouldLeave) {
      return false;
    }

    cancelEdit();
    return true;
  });

  const beginCreate = (): void => {
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
  };

  const beginEdit = (member: TeamMember): void => {
    if (!canMutateRow(member)) {
      return;
    }

    membersStore.clearMessages();
    activeEditMemberId.value = member.teamMemberId;
    activeDraft.value = createDraftFromMember(member);
    activeAuditInfo.value = {
      createdDate: member.createdDate,
      lastEditDate: member.lastEditDate,
      deletedDate: member.deletedDate,
    };
  };

  const cancelEdit = (): void => {
    activeEditMemberId.value = null;
    activeDraft.value = createEmptyDraft();
    activeAuditInfo.value = null;
  };

  const saveDraft = async (draft: TeamMemberDraft): Promise<void> => {
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
  };

  const deleteOrUndelete = async (member: TeamMember): Promise<void> => {
    if (!canMutateRow(member)) {
      return;
    }

    if (activeEditMemberId.value === member.teamMemberId) {
      cancelEdit();
    }

    if (member.deletedDate === null) {
      await membersStore.deleteMemberAndReload(member.teamMemberId);
      return;
    }

    await membersStore.undeleteMemberAndReload(member.teamMemberId);
  };

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
};

export const useGroupsViewModel = (): GroupsViewModel => {
  const groupsStore = useGroupsStore();

  const draftName = ref("");
  const draftDescription = ref("");
  const editGroupId = ref<number | null>(null);

  onMounted(async () => {
    await groupsStore.loadGroups();
  });

  onBeforeRouteLeave(() => {
    const hasUnsavedDraft =
      editGroupId.value !== null ||
      draftName.value.trim().length > 0 ||
      draftDescription.value.trim().length > 0;

    if (!hasUnsavedDraft) {
      return true;
    }

    const shouldLeave = window.confirm(
      "You have an open group editor. Leave this page and discard unsaved changes?",
    );

    if (!shouldLeave) {
      return false;
    }

    resetForm();
    return true;
  });

  const saveGroup = async (): Promise<void> => {
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
  };

  const startEdit = (group: TeamGroup): void => {
    groupsStore.clearMessages();
    editGroupId.value = group.teamGroupId;
    draftName.value = group.name;
    draftDescription.value = group.description;
  };

  const resetForm = (): void => {
    editGroupId.value = null;
    draftName.value = "";
    draftDescription.value = "";
  };

  const removeGroup = async (teamGroupId: number): Promise<void> => {
    await groupsStore.deleteGroupAndReload(teamGroupId);
    if (editGroupId.value === teamGroupId) {
      resetForm();
    }
  };

  const formatDate = (value: string): string => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

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
};
