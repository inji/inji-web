import { DcqlCredentialSet, DcqlQueryGroup } from "../../types/dcql";
import { WalletCredential } from "../../types/data";
import {
    areRequiredCredentialSetsSatisfied,
    buildInitialCredentialSetSelection,
    flattenCredentialSetSelectionToDcqlState,
    getDcqlInstructionMessage,
    getDcqlNoMatchState,
    getSatisfiableOptions,
    isOptionSelected,
    toggleCredentialSetOption,
    updateCredentialSetVcSelection,
} from "../../utils/dcqlCredentialSetUtils";

const makeCredential = (id: string): WalletCredential => ({
    credentialId: id,
    credentialTypeDisplayName: `Credential ${id}`,
    credentialTypeLogo: "",
    issuerDisplayName: "Issuer",
    issuerLogo: "",
    format: "ldp_vc",
});

const queryGroups: DcqlQueryGroup[] = [
    {
        queryId: "pan",
        required: true,
        multiple: false,
        availableCredentials: [makeCredential("pan-cred")],
        missingClaims: [],
    },
    {
        queryId: "aadhaar",
        required: true,
        multiple: false,
        availableCredentials: [makeCredential("aadhaar-cred")],
        missingClaims: [],
    },
    {
        queryId: "voter_id",
        required: true,
        multiple: false,
        availableCredentials: [makeCredential("voter-cred")],
        missingClaims: [],
    },
    {
        queryId: "dl",
        required: true,
        multiple: false,
        availableCredentials: [
            makeCredential("dl-cred-1"),
            makeCredential("dl-cred-2"),
        ],
        missingClaims: [],
    },
];

const credentialSets: DcqlCredentialSet[] = [
    {
        required: true,
        options: [["pan"], ["aadhaar"], ["voter_id", "dl"]],
    },
];

describe("dcqlCredentialSetUtils", () => {
    test("getSatisfiableOptions keeps only options with available credentials", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "pan",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["$.type"],
            },
            {
                queryId: "aadhaar",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("aadhaar-cred")],
                missingClaims: [],
            },
        ];

        expect(
            getSatisfiableOptions(
                { required: true, options: [["pan"], ["aadhaar"]] },
                groups
            )
        ).toEqual([["aadhaar"]]);
    });

    test("buildInitialCredentialSetSelection pre-selects first satisfiable option", () => {
        const selection = buildInitialCredentialSetSelection(
            credentialSets,
            queryGroups
        );

        expect(selection[0]).toEqual({
            0: { pan: ["pan-cred"] },
        });
        expect(
            flattenCredentialSetSelectionToDcqlState(selection)["pan"]
        ).toEqual(["pan-cred"]);
    });

    test("areRequiredCredentialSetsSatisfied uses original array index not filtered index", () => {
        // Bug regression: optional set at index 0, required set at index 1.
        // selectionState is keyed by original index (1), NOT filtered index (0).
        // The old filter().every() would pass filtered index 0 to isCredentialSetSatisfied,
        // causing it to look up selectionState[0] (empty) and return false incorrectly.
        const mixedSets: DcqlCredentialSet[] = [
            { required: false, options: [["pan"]] },   // original index 0 — optional
            { required: true,  options: [["aadhaar"]] }, // original index 1 — required
        ];
        const selectionState = {
            1: { 0: { aadhaar: ["aadhaar-cred"] } }, // keyed by original index 1
        };
        expect(
            areRequiredCredentialSetsSatisfied(mixedSets, selectionState, queryGroups)
        ).toBe(true);
    });

    test("areRequiredCredentialSetsSatisfied returns false when required set at non-zero index is unsatisfied", () => {
        const mixedSets: DcqlCredentialSet[] = [
            { required: false, options: [["pan"]] },
            { required: true,  options: [["aadhaar"]] },
        ];
        // selectionState has nothing for original index 1
        const emptyState = {};
        expect(
            areRequiredCredentialSetsSatisfied(mixedSets, emptyState, queryGroups)
        ).toBe(false);
    });

    test("areRequiredCredentialSetsSatisfied accepts one OR option", () => {
        const initial = buildInitialCredentialSetSelection(
            credentialSets,
            queryGroups
        );

        expect(
            areRequiredCredentialSetsSatisfied(
                credentialSets,
                initial,
                queryGroups
            )
        ).toBe(true);
    });

    test("multi-card option requires every query in the option", () => {
        const selection = {
            0: {
                2: {
                    voter_id: ["voter-cred"],
                    dl: [],
                },
            },
        };

        expect(
            isOptionSelected(["voter_id", "dl"], 2, selection[0])
        ).toBe(false);

        const completeSelection = {
            0: {
                2: {
                    voter_id: ["voter-cred"],
                    dl: ["dl-cred-1"],
                },
            },
        };

        expect(
            areRequiredCredentialSetsSatisfied(
                credentialSets,
                completeSelection,
                queryGroups
            )
        ).toBe(true);
    });

    test("toggleCredentialSetOption switches between OR options", () => {
        const initial = buildInitialCredentialSetSelection(
            credentialSets,
            queryGroups
        );
        const switched = toggleCredentialSetOption(
            credentialSets[0],
            0,
            ["aadhaar"],
            1,
            initial,
            queryGroups
        );

        expect(switched[0]).toEqual({
            1: { aadhaar: ["aadhaar-cred"] },
        });
    });

    test("updateCredentialSetVcSelection changes credential within active option", () => {
        const initial = buildInitialCredentialSetSelection(
            credentialSets,
            queryGroups
        );
        const multiCardSelection = toggleCredentialSetOption(
            credentialSets[0],
            0,
            ["voter_id", "dl"],
            2,
            initial,
            queryGroups
        );
        const updated = updateCredentialSetVcSelection(
            0,
            2,
            "dl",
            "dl-cred-2",
            true,
            multiCardSelection,
            queryGroups
        );

        expect(updated[0][2].dl).toEqual(["dl-cred-2"]);
    });

    test("getDcqlNoMatchState blocks when all query groups are empty", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "insurance_id",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["healthInsuranceId"],
            },
            {
                queryId: "health_id",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["healthId"],
            },
        ];

        expect(getDcqlNoMatchState(groups, [], false)).toEqual({
            showModal: true,
            blockCredentialSelection: true,
        });
    });

    test("getDcqlNoMatchState hides modal when partial groups are empty but credential sets remain satisfiable", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "insurance_id",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["healthInsuranceId", "lifeInsuranceCoverage"],
            },
            {
                queryId: "mock",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("mock-cred")],
                missingClaims: [],
            },
            {
                queryId: "vc_sd_jwt",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("vc-cred")],
                missingClaims: [],
            },
            {
                queryId: "health_id",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["healthId", "prescriptionCode"],
            },
            {
                queryId: "msisdn",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("msisdn-cred")],
                missingClaims: [],
            },
        ];
        const sets: DcqlCredentialSet[] = [
            {
                required: true,
                options: [["insurance_id", "mock"], ["vc_sd_jwt"]],
            },
            {
                required: false,
                options: [["health_id"], ["msisdn"]],
            },
        ];

        // Required set can still be satisfied via ["vc_sd_jwt"]; optional via ["msisdn"].
        expect(getDcqlNoMatchState(groups, sets, true)).toEqual({
            showModal: false,
            blockCredentialSelection: false,
        });
    });

    test("getDcqlNoMatchState blocks when required credential sets cannot be satisfied", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "pan",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["$.type"],
            },
            {
                queryId: "aadhaar",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["$.name"],
            },
        ];
        const sets: DcqlCredentialSet[] = [
            {
                required: true,
                options: [["pan"], ["aadhaar"]],
            },
        ];

        expect(getDcqlNoMatchState(groups, sets, true)).toEqual({
            showModal: true,
            blockCredentialSelection: true,
        });
    });

    test("getDcqlNoMatchState blocks when any required credential set is unsatisfiable", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "pan",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("pan-cred")],
                missingClaims: [],
            },
            {
                queryId: "aadhaar",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["$.name"],
            },
        ];
        const sets: DcqlCredentialSet[] = [
            {
                required: true,
                options: [["pan"]],
            },
            {
                required: true,
                options: [["aadhaar"]],
            },
        ];

        expect(getDcqlNoMatchState(groups, sets, true)).toEqual({
            showModal: true,
            blockCredentialSelection: true,
        });
    });

    test("getDcqlNoMatchState blocks when a required query group is empty without credential sets", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "pan",
                required: true,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["$.type"],
            },
            {
                queryId: "optional_id",
                required: false,
                multiple: false,
                availableCredentials: [makeCredential("opt-cred")],
                missingClaims: [],
            },
        ];

        expect(getDcqlNoMatchState(groups, [], false)).toEqual({
            showModal: true,
            blockCredentialSelection: true,
        });
    });

    test("getDcqlNoMatchState hides modal when only optional query groups are empty", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "pan",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("pan-cred")],
                missingClaims: [],
            },
            {
                queryId: "optional_id",
                required: false,
                multiple: false,
                availableCredentials: [],
                missingClaims: ["$.opt"],
            },
        ];

        expect(getDcqlNoMatchState(groups, [], false)).toEqual({
            showModal: false,
            blockCredentialSelection: false,
        });
    });

    test("getDcqlNoMatchState hides modal when every group has credentials", () => {
        expect(getDcqlNoMatchState(queryGroups, credentialSets, true)).toEqual({
            showModal: false,
            blockCredentialSelection: false,
        });
    });

    test("getDcqlInstructionMessage returns selectOne for a single set with OR options", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "pan",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("pan-cred")],
                missingClaims: [],
            },
            {
                queryId: "aadhaar",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("aadhaar-cred")],
                missingClaims: [],
            },
            {
                queryId: "voter_id",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("voter-cred")],
                missingClaims: [],
            },
        ];
        const sets: DcqlCredentialSet[] = [
            { required: true, options: [["pan"], ["aadhaar"], ["voter_id"]] },
        ];

        expect(getDcqlInstructionMessage(sets, groups)).toEqual({
            key: "instructionSelectOne",
        });
    });

    test("getDcqlInstructionMessage returns onePerSet for multiple required sets", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "government-identity",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("gov-cred")],
                missingClaims: [],
            },
            {
                queryId: "age-proof",
                required: true,
                multiple: false,
                availableCredentials: [
                    makeCredential("age-cred-1"),
                    makeCredential("age-cred-2"),
                ],
                missingClaims: [],
            },
        ];
        const sets: DcqlCredentialSet[] = [
            { required: true, options: [["government-identity"]] },
            { required: true, options: [["age-proof"]] },
        ];

        expect(getDcqlInstructionMessage(sets, groups)).toEqual({
            key: "instructionOnePerSet",
        });
    });

    test("getDcqlInstructionMessage returns selectAll for one set with multiple required queries", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "pan",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("pan-cred")],
                missingClaims: [],
            },
            {
                queryId: "aadhaar",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("aadhaar-cred")],
                missingClaims: [],
            },
        ];
        const sets: DcqlCredentialSet[] = [
            { required: true, options: [["pan", "aadhaar"]] },
        ];

        expect(getDcqlInstructionMessage(sets, groups)).toEqual({
            key: "instructionSelectAll",
        });
    });

    test("getDcqlInstructionMessage returns complex for mixed OR and multi-query options", () => {
        const groups: DcqlQueryGroup[] = [
            {
                queryId: "insurance_id",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("insurance-cred")],
                missingClaims: [],
            },
            {
                queryId: "mock",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("mock-cred")],
                missingClaims: [],
            },
            {
                queryId: "vc_sd_jwt",
                required: true,
                multiple: false,
                availableCredentials: [makeCredential("vc-cred")],
                missingClaims: [],
            },
        ];
        const sets: DcqlCredentialSet[] = [
            {
                required: true,
                options: [["insurance_id", "mock"], ["vc_sd_jwt"]],
            },
        ];

        expect(getDcqlInstructionMessage(sets, groups)).toEqual({
            key: "instructionComplex",
        });
    });
});
