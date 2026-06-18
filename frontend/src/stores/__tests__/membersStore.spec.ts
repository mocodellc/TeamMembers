import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMembersStore } from "../membersStore";

vi.mock("../../api/teamDirectoryApi", () => ({
  getMembers: vi.fn(),
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
  undeleteMember: vi.fn(),
}));

import * as api from "../../api/teamDirectoryApi";

const mockGetMembers = vi.mocked(api.getMembers);
const mockCreateMember = vi.mocked(api.createMember);
const mockUpdateMember = vi.mocked(api.updateMember);
const mockDeleteMember = vi.mocked(api.deleteMember);
const mockUndeleteMember = vi.mocked(api.undeleteMember);

const makeMember = (id: number = 1) => ({
  teamMemberId: id,
  firstName: "Alice",
  lastName: "Smith",
  email: `alice${id}@example.com`,
  jobTitle: "Engineer",
  department: "Backend",
  country: "UK",
  createdDate: "2026-01-01T00:00:00Z",
  lastEditDate: null,
  deletedDate: null,
  groups: [],
});

const makeRequest = () => ({
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  jobTitle: "Engineer",
  department: "Backend",
  country: "UK",
  groupIds: [] as number[],
});

describe("membersStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("has correct initial state", () => {
    const store = useMembersStore();

    expect(store.members).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.errorMessage).toBe("");
    expect(store.successMessage).toBe("");
    expect(store.includeDeleted).toBe(false);
  });

  it("loadMembers populates members on success", async () => {
    const members = [makeMember()];
    mockGetMembers.mockResolvedValue(members);

    const store = useMembersStore();
    await store.loadMembers(false);

    expect(store.members).toEqual(members);
    expect(store.isLoading).toBe(false);
    expect(store.errorMessage).toBe("");
  });

  it("loadMembers sets errorMessage on failure", async () => {
    mockGetMembers.mockRejectedValue(new Error("Network error"));

    const store = useMembersStore();
    await store.loadMembers(false);

    expect(store.errorMessage).toBe("Network error");
    expect(store.isLoading).toBe(false);
  });

  it("createMemberAndReload returns true and sets successMessage on success", async () => {
    mockCreateMember.mockResolvedValue(makeMember());
    mockGetMembers.mockResolvedValue([makeMember()]);

    const store = useMembersStore();
    const result = await store.createMemberAndReload(makeRequest());

    expect(result).toBe(true);
    expect(store.successMessage).toBe("Team member created.");
  });

  it("createMemberAndReload returns false and sets errorMessage on failure", async () => {
    mockCreateMember.mockRejectedValue(new Error("Duplicate email"));

    const store = useMembersStore();
    const result = await store.createMemberAndReload(makeRequest());

    expect(result).toBe(false);
    expect(store.errorMessage).toBe("Duplicate email");
  });

  it("updateMemberAndReload returns true and sets successMessage on success", async () => {
    mockUpdateMember.mockResolvedValue(makeMember());
    mockGetMembers.mockResolvedValue([makeMember()]);

    const store = useMembersStore();
    const result = await store.updateMemberAndReload(1, makeRequest());

    expect(result).toBe(true);
    expect(store.successMessage).toBe("Team member updated.");
  });

  it("updateMemberAndReload returns false and sets errorMessage on failure", async () => {
    mockUpdateMember.mockRejectedValue(new Error("Not found"));

    const store = useMembersStore();
    const result = await store.updateMemberAndReload(99, makeRequest());

    expect(result).toBe(false);
    expect(store.errorMessage).toBe("Not found");
  });

  it("deleteMemberAndReload sets successMessage on success", async () => {
    mockDeleteMember.mockResolvedValue(makeMember());
    mockGetMembers.mockResolvedValue([]);

    const store = useMembersStore();
    await store.deleteMemberAndReload(1);

    expect(store.successMessage).toBe("Team member soft deleted.");
  });

  it("deleteMemberAndReload sets errorMessage on failure", async () => {
    mockDeleteMember.mockRejectedValue(new Error("Delete failed"));

    const store = useMembersStore();
    await store.deleteMemberAndReload(1);

    expect(store.errorMessage).toBe("Delete failed");
  });

  it("undeleteMemberAndReload sets successMessage on success", async () => {
    mockUndeleteMember.mockResolvedValue(makeMember());
    mockGetMembers.mockResolvedValue([makeMember()]);

    const store = useMembersStore();
    await store.undeleteMemberAndReload(1);

    expect(store.successMessage).toBe("Team member restored.");
  });

  it("undeleteMemberAndReload sets errorMessage on failure", async () => {
    mockUndeleteMember.mockRejectedValue(new Error("Undelete failed"));

    const store = useMembersStore();
    await store.undeleteMemberAndReload(1);

    expect(store.errorMessage).toBe("Undelete failed");
  });

  it("clearMessages resets both messages", () => {
    const store = useMembersStore();
    store.errorMessage = "error";
    store.successMessage = "success";

    store.clearMessages();

    expect(store.errorMessage).toBe("");
    expect(store.successMessage).toBe("");
  });
});
