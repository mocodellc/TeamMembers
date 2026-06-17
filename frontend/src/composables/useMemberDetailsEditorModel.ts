import { computed, ref, watch } from "vue";
import type { Ref } from "vue";
import type { TeamMemberDraft } from "../types/teamDirectory";

const cloneDraft = (value: TeamMemberDraft): TeamMemberDraft => {
  return {
    firstName: value.firstName,
    lastName: value.lastName,
    email: value.email,
    jobTitle: value.jobTitle,
    department: value.department,
    country: value.country,
    groupIds: [...value.groupIds],
  };
};

export const useMemberDetailsEditorModel = (
  modelValue: Ref<TeamMemberDraft>,
  onSaveRequested: (value: TeamMemberDraft) => void,
) => {
  const localDraft = ref<TeamMemberDraft>(cloneDraft(modelValue.value));

  watch(
    modelValue,
    (value) => {
      localDraft.value = cloneDraft(value);
    },
    { deep: true },
  );

  const isFormValid = computed(() => {
    const { firstName, lastName, email, jobTitle, department, country } =
      localDraft.value;
    return [firstName, lastName, email, jobTitle, department, country].every(
      (value) => value.trim().length > 0,
    );
  });

  const toggleGroup = (teamGroupId: number): void => {
    const selected = new Set(localDraft.value.groupIds);
    if (selected.has(teamGroupId)) {
      selected.delete(teamGroupId);
    } else {
      selected.add(teamGroupId);
    }
    localDraft.value.groupIds = Array.from(selected);
  };

  const onSave = (): void => {
    onSaveRequested({
      ...localDraft.value,
      groupIds: [...localDraft.value.groupIds],
    });
  };

  const formatInfoDate = (value: string | null | undefined): string => {
    if (value == null) {
      return "-";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

  return {
    localDraft,
    isFormValid,
    toggleGroup,
    onSave,
    formatInfoDate,
  };
};
