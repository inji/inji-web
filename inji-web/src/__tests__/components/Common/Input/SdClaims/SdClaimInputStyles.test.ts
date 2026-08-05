import { SdClaimInputStyles } from "../../../../../components/Common/Input/SdClaims/SdClaimInputStyles";

describe("SdClaimInputStyles", () => {
  const expectedKeys = [
    "requiredCheckbox",
    "sdClaimCheckboxSelected",
    "sdClaimCheckboxUnselected",
    "leafRow",
    "leafLabel",
    "leafRowModal",
    "leafLabelModal",
    "groupContainer",
    "groupContainerExpanded",
    "groupContainerCollapsed",
    "childrenWrapper",
    "childrenWrapperExpanded",
    "childrenWrapperCollapsed",
    "childrenInner",
    "groupHeader",
    "groupLeft",
    "groupLabel",
    "groupRight",
    "groupBadge",
    "groupChevron",
    "childrenContainer",
  ] as const;

  it("exports all expected style keys", () => {
    expectedKeys.forEach((key) => {
      expect(SdClaimInputStyles).toHaveProperty(key);
    });
    expect(Object.keys(SdClaimInputStyles)).toHaveLength(expectedKeys.length);
  });

  it("defines each style as a non-empty string", () => {
    expectedKeys.forEach((key) => {
      const value = SdClaimInputStyles[key];
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it("includes shared layout tokens used by leaf and group rows", () => {
    expect(SdClaimInputStyles.leafRow).toContain("flex");
    expect(SdClaimInputStyles.groupHeader).toContain("flex");
    expect(SdClaimInputStyles.groupContainerExpanded).toContain("border-iw-brand-gradient");
    expect(SdClaimInputStyles.childrenWrapperCollapsed).toContain("grid-rows-[0fr]");
  });
});
