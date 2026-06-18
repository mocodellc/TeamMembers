import { createPinia, setActivePinia } from "pinia";
import { createApp, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGroupsViewModel } from "../useTeamDirectoryViewModel";
import type { TeamGroup } from "../../types/teamDirectory";

// ── module mocks ──────────────────────────────────────────────────────────────

vi.mock("vue-router", () => ({
  onBeforeRouteLeave: vi.fn(),
}));

vi.mock("../../api/teamDirectoryApi", () => ({
  getGroups: vi.fn().mockResolvedValue([]),
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  getMembers: vi.fn().mockResolvedValue([]),
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
  undeleteMember: vi.fn(),
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

const makeGroup = (overrides: Partial<TeamGroup> = {}): TeamGroup => ({
  teamGroupId: 1,
  name: "Engineering",
  description: "Engineering team",
  createdDate: "2026-01-01T00:00:00Z",
  ...overrides,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe("useGroupsViewModel", () => {
  let unmount: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    unmount?.();
  });

  it("has correct initial state", () => {
    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    expect(vm.draftName.value).toBe("");
    expect(vm.draftDescription.value).toBe("");
    expect(vm.editGroupId.value).toBeNull();
  });

  // ── saveGroup ──────────────────────────────────────────────────────────────

  it("saveGroup sets errorMessage when name is empty", async () => {
    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.draftName.value = "";
    vm.draftDescription.value = "Valid desc";
    await vm.saveGroup();

    expect(vm.groupsStore.errorMessage).toBeTruthy();
    expect(api.createGroup).not.toHaveBeenCalled();
  });

  it("saveGroup sets errorMessage when description is empty", async () => {
    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.draftName.value = "Valid name";
    vm.draftDescription.value = "   ";
    await vm.saveGroup();

    expect(vm.groupsStore.errorMessage).toBeTruthy();
    expect(api.createGroup).not.toHaveBeenCalled();
  });

  it("saveGroup calls createGroupAndReload when editGroupId is null", async () => {
    vi.mocked(api.createGroup).mockResolvedValue(makeGroup());
    vi.mocked(api.getGroups).mockResolvedValue([makeGroup()]);

    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.draftName.value = "Engineering";
    vm.draftDescription.value = "Eng team";
    await vm.saveGroup();

    expect(api.createGroup).toHaveBeenCalledOnce();
    expect(api.createGroup).toHaveBeenCalledWith({
      name: "Engineering",
      description: "Eng team",
    });
  });

  it("saveGroup calls updateGroupAndReload when editGroupId is set", async () => {
    vi.mocked(api.updateGroup).mockResolvedValue(makeGroup());
    vi.mocked(api.getGroups).mockResolvedValue([makeGroup()]);

    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.editGroupId.value = 1;
    vm.draftName.value = "Updated";
    vm.draftDescription.value = "Updated desc";
    await vm.saveGroup();

    expect(api.updateGroup).toHaveBeenCalledOnce();
    expect(api.updateGroup).toHaveBeenCalledWith(1, {
      name: "Updated",
      description: "Updated desc",
    });
  });

  it("saveGroup resets form on success", async () => {
    vi.mocked(api.createGroup).mockResolvedValue(makeGroup());
    vi.mocked(api.getGroups).mockResolvedValue([makeGroup()]);

    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.draftName.value = "Engineering";
    vm.draftDescription.value = "Eng team";
    await vm.saveGroup();

    expect(vm.draftName.value).toBe("");
    expect(vm.draftDescription.value).toBe("");
    expect(vm.editGroupId.value).toBeNull();
  });

  it("saveGroup keeps form populated when save fails", async () => {
    vi.mocked(api.createGroup).mockRejectedValue(new Error("Conflict"));

    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.draftName.value = "Dup";
    vm.draftDescription.value = "Dup desc";
    await vm.saveGroup();

    expect(vm.draftName.value).toBe("Dup");
    expect(vm.editGroupId.value).toBeNull();
  });

  // ── startEdit ──────────────────────────────────────────────────────────────

  it("startEdit populates draft fields from the group", () => {
    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.startEdit(
      makeGroup({ teamGroupId: 5, name: "Design", description: "Design team" }),
    );

    expect(vm.editGroupId.value).toBe(5);
    expect(vm.draftName.value).toBe("Design");
    expect(vm.draftDescription.value).toBe("Design team");
  });

  // ── resetForm ──────────────────────────────────────────────────────────────

  it("resetForm clears all draft fields", () => {
    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.startEdit(makeGroup());
    vm.resetForm();

    expect(vm.editGroupId.value).toBeNull();
    expect(vm.draftName.value).toBe("");
    expect(vm.draftDescription.value).toBe("");
  });

  // ── removeGroup ────────────────────────────────────────────────────────────

  it("removeGroup calls deleteGroupAndReload", async () => {
    vi.mocked(api.deleteGroup).mockResolvedValue(undefined);
    vi.mocked(api.getGroups).mockResolvedValue([]);

    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    await vm.removeGroup(1);

    expect(api.deleteGroup).toHaveBeenCalledWith(1);
  });

  it("removeGroup resets form when deleting the currently edited group", async () => {
    vi.mocked(api.deleteGroup).mockResolvedValue(undefined);
    vi.mocked(api.getGroups).mockResolvedValue([]);

    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.startEdit(makeGroup({ teamGroupId: 3 }));
    await vm.removeGroup(3);

    expect(vm.editGroupId.value).toBeNull();
    expect(vm.draftName.value).toBe("");
  });

  it("removeGroup does not reset form when deleting a different group", async () => {
    vi.mocked(api.deleteGroup).mockResolvedValue(undefined);
    vi.mocked(api.getGroups).mockResolvedValue([makeGroup({ teamGroupId: 3 })]);

    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    vm.startEdit(makeGroup({ teamGroupId: 3, name: "Keep" }));
    await vm.removeGroup(9);

    expect(vm.editGroupId.value).toBe(3);
    expect(vm.draftName.value).toBe("Keep");
  });

  // ── formatDate ─────────────────────────────────────────────────────────────

  it('formatDate returns "-" for an invalid date string', () => {
    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    expect(vm.formatDate("not-a-date")).toBe("-");
  });

  it("formatDate returns a non-empty formatted string for a valid ISO date", () => {
    const [vm, u] = withSetup(useGroupsViewModel);
    unmount = u;

    const result = vm.formatDate("2026-06-18T10:00:00Z");

    expect(result).not.toBe("-");
    expect(result.length).toBeGreaterThan(0);
  });
});
