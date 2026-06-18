import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useMemberDetailsEditorModel } from "../useMemberDetailsEditorModel";
import type { TeamMemberDraft } from "../../types/teamDirectory";

const makeDraft = (
  overrides: Partial<TeamMemberDraft> = {},
): TeamMemberDraft => ({
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  jobTitle: "Engineer",
  department: "Backend",
  country: "UK",
  groupIds: [],
  ...overrides,
});

describe("useMemberDetailsEditorModel", () => {
  // ── initialisation ─────────────────────────────────────────────────────────

  it("clones modelValue into localDraft on creation", () => {
    const model = ref(makeDraft());
    const { localDraft } = useMemberDetailsEditorModel(model, vi.fn());

    expect(localDraft.value).toEqual(model.value);
    expect(localDraft.value).not.toBe(model.value);
  });

  it("syncs localDraft when modelValue changes", async () => {
    const model = ref(makeDraft());
    const { localDraft } = useMemberDetailsEditorModel(model, vi.fn());

    model.value = makeDraft({ firstName: "Bob", email: "bob@example.com" });
    await Promise.resolve(); // flush watcher

    expect(localDraft.value.firstName).toBe("Bob");
    expect(localDraft.value.email).toBe("bob@example.com");
  });

  it("groupIds are copied independently so mutations do not affect modelValue", () => {
    const model = ref(makeDraft({ groupIds: [1, 2] }));
    const { localDraft } = useMemberDetailsEditorModel(model, vi.fn());

    localDraft.value.groupIds.push(3);

    expect(model.value.groupIds).toEqual([1, 2]);
  });

  // ── isFormValid ────────────────────────────────────────────────────────────

  it("isFormValid is true when all required fields are non-empty", () => {
    const { isFormValid } = useMemberDetailsEditorModel(
      ref(makeDraft()),
      vi.fn(),
    );

    expect(isFormValid.value).toBe(true);
  });

  it("isFormValid is false when firstName is blank", () => {
    const { isFormValid } = useMemberDetailsEditorModel(
      ref(makeDraft({ firstName: "  " })),
      vi.fn(),
    );

    expect(isFormValid.value).toBe(false);
  });

  it("isFormValid is false when email is blank", () => {
    const { isFormValid } = useMemberDetailsEditorModel(
      ref(makeDraft({ email: "" })),
      vi.fn(),
    );

    expect(isFormValid.value).toBe(false);
  });

  it("isFormValid is false when country is blank", () => {
    const { isFormValid } = useMemberDetailsEditorModel(
      ref(makeDraft({ country: "" })),
      vi.fn(),
    );

    expect(isFormValid.value).toBe(false);
  });

  // ── toggleGroup ────────────────────────────────────────────────────────────

  it("toggleGroup adds a groupId when not already selected", () => {
    const { localDraft, toggleGroup } = useMemberDetailsEditorModel(
      ref(makeDraft()),
      vi.fn(),
    );

    toggleGroup(5);

    expect(localDraft.value.groupIds).toContain(5);
  });

  it("toggleGroup removes a groupId when already selected", () => {
    const { localDraft, toggleGroup } = useMemberDetailsEditorModel(
      ref(makeDraft({ groupIds: [5] })),
      vi.fn(),
    );

    toggleGroup(5);

    expect(localDraft.value.groupIds).not.toContain(5);
  });

  it("toggleGroup handles multiple distinct group selections", () => {
    const { localDraft, toggleGroup } = useMemberDetailsEditorModel(
      ref(makeDraft()),
      vi.fn(),
    );

    toggleGroup(1);
    toggleGroup(2);
    toggleGroup(1);

    expect(localDraft.value.groupIds).toEqual([2]);
  });

  // ── onSave ─────────────────────────────────────────────────────────────────

  it("onSave calls the callback with a copy of the current draft", () => {
    const callback = vi.fn();
    const draft = makeDraft({ firstName: "Carol" });
    const { localDraft, onSave } = useMemberDetailsEditorModel(
      ref(draft),
      callback,
    );

    localDraft.value.firstName = "Dave";
    onSave();

    expect(callback).toHaveBeenCalledOnce();
    const emitted = callback.mock.calls[0][0] as TeamMemberDraft;
    expect(emitted.firstName).toBe("Dave");
    expect(emitted).not.toBe(localDraft.value);
  });

  it("onSave emits an independent copy of groupIds", () => {
    const callback = vi.fn();
    const { localDraft, onSave } = useMemberDetailsEditorModel(
      ref(makeDraft({ groupIds: [3] })),
      callback,
    );

    onSave();
    localDraft.value.groupIds.push(99);

    const emitted = callback.mock.calls[0][0] as TeamMemberDraft;
    expect(emitted.groupIds).toEqual([3]);
  });

  // ── formatInfoDate ─────────────────────────────────────────────────────────

  it('formatInfoDate returns "-" for null', () => {
    const { formatInfoDate } = useMemberDetailsEditorModel(
      ref(makeDraft()),
      vi.fn(),
    );

    expect(formatInfoDate(null)).toBe("-");
  });

  it('formatInfoDate returns "-" for undefined', () => {
    const { formatInfoDate } = useMemberDetailsEditorModel(
      ref(makeDraft()),
      vi.fn(),
    );

    expect(formatInfoDate(undefined)).toBe("-");
  });

  it('formatInfoDate returns "-" for an invalid date string', () => {
    const { formatInfoDate } = useMemberDetailsEditorModel(
      ref(makeDraft()),
      vi.fn(),
    );

    expect(formatInfoDate("not-a-date")).toBe("-");
  });

  it("formatInfoDate returns a non-empty string for a valid ISO date", () => {
    const { formatInfoDate } = useMemberDetailsEditorModel(
      ref(makeDraft()),
      vi.fn(),
    );

    const result = formatInfoDate("2026-06-18T10:00:00Z");

    expect(result).not.toBe("-");
    expect(result.length).toBeGreaterThan(0);
  });
});
