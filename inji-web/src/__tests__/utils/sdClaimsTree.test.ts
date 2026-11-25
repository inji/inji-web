import {
    buildClaimTree,
    collectSdClaimPaths,
    mdocClaimPathFormat,
    sdJwtClaimPathFormat,
} from "../../utils/sdClaimsTree";

describe("sdJwtClaimPathFormat", () => {
    test("splits dotted paths on dots", () => {
        expect(sdJwtClaimPathFormat.parse("$.address.city")).toEqual(["address", "city"]);
        expect(sdJwtClaimPathFormat.parse("$.given_name")).toEqual(["given_name"]);
    });

    test("keeps an array index on its key", () => {
        expect(sdJwtClaimPathFormat.parse("$.nationalities[0]")).toEqual(["nationalities[0]"]);
    });

    test("is the default format of buildClaimTree", () => {
        const tree = buildClaimTree([], ["$.address.city"]);

        expect(tree).toHaveLength(1);
        expect(tree[0].label).toBe("Address");
        expect(collectSdClaimPaths(tree)).toEqual(["$.address.city"]);
    });
});

describe("mdocClaimPathFormat", () => {
    test("keeps a dotted namespace in one segment", () => {
        expect(mdocClaimPathFormat.parse("$['org.iso.18013.5.1']['family_name']")).toEqual([
            "org.iso.18013.5.1",
            "family_name",
        ]);
    });

    test("unescapes quotes inside a segment", () => {
        expect(mdocClaimPathFormat.parse("$['org.example.1']['it\\'s']")).toEqual([
            "org.example.1",
            "it's",
        ]);
    });

    test("keeps a path without bracket segments as one key", () => {
        expect(mdocClaimPathFormat.parse("family_name")).toEqual(["family_name"]);
    });

    test("groups data elements under their namespace", () => {
        const sdClaims = [
            "$['org.iso.18013.5.1']['given_name']",
            "$['org.iso.18013.5.1']['family_name']",
        ];
        const tree = buildClaimTree([], sdClaims, mdocClaimPathFormat);

        expect(tree).toHaveLength(1);
        const group = tree[0];
        expect(group.kind).toBe("group");
        if (group.kind !== "group") {
            return;
        }
        expect(group.label).toBe("org.iso.18013.5.1");
        expect(group.children.map((child) => child.label)).toEqual([
            "Family Name",
            "Given Name",
        ]);
        expect(collectSdClaimPaths(tree).sort()).toEqual([...sdClaims].sort());
    });
});
