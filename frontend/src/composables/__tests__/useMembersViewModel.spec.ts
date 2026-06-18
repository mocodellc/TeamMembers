import { createPinia, setActivePinia } from "pinia";
import { createApp, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMembersViewModel } from "../useTeamDirectoryViewModel";
import type { TeamMember } from "../../types/teamDirectory";

// ── module mocks ──────────────────────────────────────────────────────────────

vi.mock("vue-router", () => ({
  onBeforeRouteLeave: vi.fn(),
}));

vi.mock("@faker-js/faker", () => ({
  faker: {
    person: {
      firstName: vi.fn().mockReturnValue("Jane"),
      lastName: vi.fn().mockReturnValue("Doe"),
      jobTitle: vi.fn().mockReturnValue("Engineer"),
    },
    internet: {
      email: vi.fn().mockReturnValue("jane.doe@example.com"),
    },
    commerce: {
      department: vi.fn().mockReturnValue("Backend"),
    },
    location: {
      country: vi.fn().mockReturnValue("UK"),
    },
  },
}));

vi.mock("../../api/teamDirectoryApi", () => ({
  getMembers: vi.fn().mockResolvedValue([]),
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
  undeleteMember: vi.fn(),
  getGroups: vi.fn().mockResolvedValue([]),
}));

import * as api from "../../api/teamDirectoryApi";

// ── helpers ───────────────────────────────────────────────────────────────────

function withSetup<T>(composable: () => T): [T, () => void] {
  let result!: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => null;
    },
  });
  const pinia = createPinia();
  setActivePinia(pinia);
  app.use(pinia);
  const el = document.createElement("div");
  app.mount(el);
  return [result, () => app.unmount()];
}

const makeMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  teamMemberId: 1,
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  jobTitle: "Engineer",
  department: "Backend",
  country: "UK",
  createdDate: "2026-01-01T00:00:00Z",
  lastEditDate: null,
  deletedDate: null,
  groups: [],
  ...overrides,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe("useMembersViewModel", () => {
  let unmount: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    unmount?.();
  });

  it("has correct initial state", () => {
    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    expect(vm.activeEditMemberId.value).toBeNull();
    expect(vm.isEditorOpen.value).toBe(false);
    expect(vm.hasRows.value).toBe(false);
  });

  it("hasRows is true when the members store contains members", async () => {
    vi.mocked(api.getMembers).mockResolvedValue([makeMember()]);

    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    await nextTick();
    await nextTick();

    expect(vm.hasRows.value).toBe(true);
  });

  it("isEditorOpen is true after beginCreate", () => {
    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    vm.beginCreate();

    expect(vm.isEditorOpen.value).toBe(true);
    expect(vm.activeEditMemberId.value).toBe("new");
  });

  it("beginCreate populates activeDraft with faker-generated values", () => {
    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    vm.beginCreate();

    expect(vm.activeDraft.value.firstName).toBe("Jane");
    expect(vm.activeDraft.value.lastName).toBe("Doe");
    expect(vm.activeDraft.value.email).toBe("jane.doe@example.com");
    expect(vm.activeDraft.value.groupIds).toEqual([]);
  });

  it("beginEdit sets activeEditMemberId and populates draft from member", () => {
    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    const member = makeMember({ teamMemberId: 7 });
    vm.beginEdit(member);

    expect(vm.activeEditMemberId.value).toBe(7);
    expect(vm.activeDraft.value.firstName).toBe("Alice");
    expect(vm.activeDraft.value.email).toBe("alice@example.com");
  });

  it("beginEdit populates activeAuditInfo from the member", () => {
    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    const member = makeMember({
      createdDate: "2026-01-01T00:00:00Z",
      lastEditDate: "2026-02-01T00:00:00Z",
    });
    vm.beginEdit(member);

    expect(vm.activeAuditInfo.value?.createdDate).toBe("2026-01-01T00:00:00Z");
    expect(vm.activeAuditInfo.value?.lastEditDate).toBe("2026-02-01T00:00:00Z");
  });

  it("beginEdit is blocked when a different editor is already open", () => {
    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    vm.beginEdit(makeMember({ teamMemberId: 1 }));
    vm.beginEdit(makeMember({ teamMemberId: 2 }));

    expect(vm.activeEditMemberId.value).toBe(1);
  });

  it("cancelEdit resets activeEditMemberId, activeDraft, and activeAuditInfo", () => {
    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    vm.beginEdit(makeMember());
    vm.cancelEdit();

    expect(vm.activeEditMemberId.value).toBeNull();
    expect(vm.activeDraft.value.firstName).toBe("");
    expect(vm.activeAuditInfo.value).toBeNull();
  });

  it('saveDraft calls createMemberAndReload for "new" and cancels editor on success', async () => {
    vi.mocked(api.createMember).mockResolvedValue(makeMember());
    vi.mocked(api.getMembers).mockResolvedValue([makeMember()]);

    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    vm.beginCreate();
    await vm.saveDraft(vm.activeDraft.value);

    expect(api.createMember).toHaveBeenCalledOnce();
    expect(vm.activeEditMemberId.value).toBeNull();
    expect(vm.isSaving.value).toBe(false);
  });

  it("saveDraft calls updateMemberAndReload for an existing member and cancels on success", async () => {
    vi.mocked(api.updateMember).mockResolvedValue(makeMember());
    vi.mocked(api.getMembers).mockResolvedValue([makeMember()]);

    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    vm.beginEdit(makeMember({ teamMemberId: 3 }));
    await vm.saveDraft(vm.activeDraft.value);

    expect(api.updateMember).toHaveBeenCalledOnce();
    expect(vm.activeEditMemberId.value).toBeNull();
  });

  it("saveDraft keeps editor open when the save fails", async () => {
    vi.mocked(api.createMember).mockRejectedValue(new Error("Conflict"));

    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    vm.beginCreate();
    await vm.saveDraft(vm.activeDraft.value);

    expect(vm.activeEditMemberId.value).toBe("new");
  });

  it("deleteOrUndelete calls deleteMemberAndReload when member is not deleted", async () => {
    vi.mocked(api.deleteMember).mockResolvedValue(makeMember());
    vi.mocked(api.getMembers).mockResolvedValue([]);

    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    await vm.deleteOrUndelete(makeMember({ deletedDate: null }));

    expect(api.deleteMember).toHaveBeenCalledOnce();
  });

  it("deleteOrUndelete calls undeleteMemberAndReload when member is already deleted", async () => {
    vi.mocked(api.undeleteMember).mockResolvedValue(makeMember());
    vi.mocked(api.getMembers).mockResolvedValue([makeMember()]);

    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    await vm.deleteOrUndelete(
      makeMember({ deletedDate: "2026-03-01T00:00:00Z" }),
    );

    expect(api.undeleteMember).toHaveBeenCalledOnce();
  });

  it("deleteOrUndelete is blocked when a different member editor is open", async () => {
    const [vm, u] = withSetup(useMembersViewModel);
    unmount = u;

    vm.beginEdit(makeMember({ teamMemberId: 1 }));
    await vm.deleteOrUndelete(makeMember({ teamMemberId: 2 }));

    expect(api.deleteMember).not.toHaveBeenCalled();
    expect(api.undeleteMember).not.toHaveBeenCalled();
  });
});
