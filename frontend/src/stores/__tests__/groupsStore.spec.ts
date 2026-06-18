import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGroupsStore } from "../groupsStore";

vi.mock("../../api/teamDirectoryApi", () => ({
  getGroups: vi.fn(),
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
}));

import * as api from "../../api/teamDirectoryApi";

const mockGetGroups = vi.mocked(api.getGroups);
const mockCreateGroup = vi.mocked(api.createGroup);
const mockUpdateGroup = vi.mocked(api.updateGroup);
const mockDeleteGroup = vi.mocked(api.deleteGroup);

const makeGroup = (id: number = 1) => ({
  teamGroupId: id,
  name: "Engineering",
  description: "Engineering team",
  createdDate: "2026-01-01T00:00:00Z",
});

describe("groupsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("has correct initial state", () => {
    const store = useGroupsStore();

    expect(store.groups).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.errorMessage).toBe("");
    expect(store.successMessage).toBe("");
  });

  it("loadGroups populates groups on success", async () => {
    const groups = [makeGroup()];
    mockGetGroups.mockResolvedValue(groups);

    const store = useGroupsStore();
    await store.loadGroups();

    expect(store.groups).toEqual(groups);
    expect(store.isLoading).toBe(false);
    expect(store.errorMessage).toBe("");
  });

  it("loadGroups sets errorMessage on failure", async () => {
    mockGetGroups.mockRejectedValue(new Error("Network error"));

    const store = useGroupsStore();
    await store.loadGroups();

    expect(store.errorMessage).toBe("Network error");
    expect(store.isLoading).toBe(false);
  });

  it("createGroupAndReload returns true and sets successMessage on success", async () => {
    mockCreateGroup.mockResolvedValue(makeGroup(2));
    mockGetGroups.mockResolvedValue([makeGroup(2)]);

    const store = useGroupsStore();
    const result = await store.createGroupAndReload({
      name: "Engineering",
      description: "Engineering team",
    });

    expect(result).toBe(true);
    expect(store.successMessage).toBe("Group created.");
  });

  it("createGroupAndReload returns false and sets errorMessage on failure", async () => {
    mockCreateGroup.mockRejectedValue(new Error("Conflict"));

    const store = useGroupsStore();
    const result = await store.createGroupAndReload({
      name: "Dup",
      description: "Dup",
    });

    expect(result).toBe(false);
    expect(store.errorMessage).toBe("Conflict");
  });

  it("updateGroupAndReload returns true and sets successMessage on success", async () => {
    mockUpdateGroup.mockResolvedValue(makeGroup());
    mockGetGroups.mockResolvedValue([makeGroup()]);

    const store = useGroupsStore();
    const result = await store.updateGroupAndReload(1, {
      name: "Engineering",
      description: "Updated",
    });

    expect(result).toBe(true);
    expect(store.successMessage).toBe("Group updated.");
  });

  it("updateGroupAndReload returns false and sets errorMessage on failure", async () => {
    mockUpdateGroup.mockRejectedValue(new Error("Not found"));

    const store = useGroupsStore();
    const result = await store.updateGroupAndReload(99, {
      name: "X",
      description: "Y",
    });

    expect(result).toBe(false);
    expect(store.errorMessage).toBe("Not found");
  });

  it("deleteGroupAndReload sets successMessage on success", async () => {
    mockDeleteGroup.mockResolvedValue(undefined);
    mockGetGroups.mockResolvedValue([]);

    const store = useGroupsStore();
    await store.deleteGroupAndReload(1);

    expect(store.successMessage).toBe("Group deleted.");
  });

  it("deleteGroupAndReload sets errorMessage on failure", async () => {
    mockDeleteGroup.mockRejectedValue(new Error("Delete failed"));

    const store = useGroupsStore();
    await store.deleteGroupAndReload(1);

    expect(store.errorMessage).toBe("Delete failed");
  });

  it("clearMessages resets error and success messages", () => {
    const store = useGroupsStore();
    store.errorMessage = "some error";
    store.successMessage = "some success";

    store.clearMessages();

    expect(store.errorMessage).toBe("");
    expect(store.successMessage).toBe("");
  });
});
