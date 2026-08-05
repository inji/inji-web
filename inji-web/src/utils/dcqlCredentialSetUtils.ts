import {
    DcqlCredentialSet,
    DcqlCredentialSetSelectionState,
    DcqlOptionSelectionState,
    DcqlQueryGroup,
    DcqlSelectionState,
} from "../types/dcql";

export function getDcqlInstructionMessage(
    credentialSets: DcqlCredentialSet[],
    queryGroups: DcqlQueryGroup[]
): DcqlInstructionMessage {
    const groupMap = getQueryGroupMap(queryGroups);
    const requiredSets = credentialSets.filter((set) => set.required);
    const satisfiableBySet = requiredSets.map((set) =>
        getSatisfiableOptions(set, queryGroups)
    );

    if (requiredSets.length === 0) {
        return getQueryGroupsInstructionMessage(queryGroups);
    }

    const isSimpleSingleQueryOption = (option: string[]): boolean => {
        if (option.length !== 1) {
            return false;
        }

        const group = groupMap.get(option[0]);
        return Boolean(
            group &&
                group.availableCredentials.length > 0 &&
                !group.multiple
        );
    };

    const isComplexStructure = (): boolean => {
        for (let index = 0; index < requiredSets.length; index += 1) {
            const options = satisfiableBySet[index];

            if (options.length === 0) {
                continue;
            }

            if (requiredSets.length > 1 && options.length > 1) {
                return true;
            }

            for (const option of options) {
                if (option.length > 1) {
                    continue;
                }

                const group = groupMap.get(option[0]);
                if (
                    !group ||
                    group.availableCredentials.length === 0 ||
                    group.multiple
                ) {
                    return true;
                }
            }

            if (options.some((option) => option.length > 1)) {
                const hasMultipleOrOptions = options.length > 1;
                const hasMultipleRequiredSets = requiredSets.length > 1;

                if (hasMultipleOrOptions || hasMultipleRequiredSets) {
                    return true;
                }
            }
        }

        return false;
    };

    if (isComplexStructure()) {
        return { key: "instructionComplex" };
    }

    if (requiredSets.length >= 2) {
        const oneCardPerSet = satisfiableBySet.every(
            (options) =>
                options.length === 1 &&
                isSimpleSingleQueryOption(options[0])
        );

        if (oneCardPerSet) {
            return { key: "instructionOnePerSet" };
        }

        return { key: "instructionComplex" };
    }

    const options = satisfiableBySet[0] ?? [];

    if (options.length === 0) {
        return { key: "instructionComplex" };
    }

    if (options.length > 1) {
        const eachOptionIsOneCard = options.every((option) =>
            isSimpleSingleQueryOption(option)
        );

        return eachOptionIsOneCard
            ? { key: "instructionSelectOne" }
            : { key: "instructionComplex" };
    }

    const option = options[0];

    if (option.length > 1) {
        const allSimpleQueries = option.every((queryId) => {
            const group = groupMap.get(queryId);
            return Boolean(
                group &&
                    group.availableCredentials.length > 0 &&
                    !group.multiple
            );
        });

        if (allSimpleQueries) {
            return option.length > 1
                ? { key: "instructionSelectAll" }
                : { key: "instructionSelectOne" };
        }

        return { key: "instructionComplex" };
    }

    if (isSimpleSingleQueryOption(option)) {
        return { key: "instructionSelectOne" };
    }

    const group = groupMap.get(option[0]);
    if (group?.multiple && group.availableCredentials.length > 1) {
        return {
            key: "instructionSelectCount",
            count: group.availableCredentials.length,
        };
    }

    return { key: "instructionComplex" };
}

function getQueryGroupsInstructionMessage(
    queryGroups: DcqlQueryGroup[]
): DcqlInstructionMessage {
    const requiredGroups = queryGroups.filter(
        (group) => group.required && group.availableCredentials.length > 0
    );

    if (requiredGroups.length === 0) {
        return { key: "instructionComplex" };
    }

    if (requiredGroups.length === 1) {
        return requiredGroups[0].multiple
            ? { key: "instructionComplex" }
            : { key: "instructionSelectOne" };
    }

    if (requiredGroups.every((group) => !group.multiple)) {
        return { key: "instructionSelectAll" };
    }

    return { key: "instructionComplex" };
}

export type DcqlInstructionMessageKey =
    | "instructionSelectOne"
    | "instructionSelectAll"
    | "instructionSelectCount"
    | "instructionOnePerSet"
    | "instructionComplex";

export interface DcqlInstructionMessage {
    key: DcqlInstructionMessageKey;
    count?: number;
}

export function hasCredentialSets(
    data: unknown
): data is { credentialSets: DcqlCredentialSet[] } {
    return (
        typeof data === "object" &&
        data !== null &&
        Array.isArray((data as { credentialSets?: unknown }).credentialSets) &&
        (data as { credentialSets: DcqlCredentialSet[] }).credentialSets
            .length > 0
    );
}

export function getQueryGroupMap(
    queryGroups: DcqlQueryGroup[]
): Map<string, DcqlQueryGroup> {
    return new Map(queryGroups.map((group) => [group.queryId, group]));
}

export function getSatisfiableOptions(
    credentialSet: DcqlCredentialSet,
    queryGroups: DcqlQueryGroup[]
): string[][] {
    const groupMap = getQueryGroupMap(queryGroups);

    return credentialSet.options.filter((option) =>
        option.every((queryId) => {
            const group = groupMap.get(queryId);
            return (group?.availableCredentials.length ?? 0) > 0;
        })
    );
}

export function isOptionSelected(
    option: string[],
    optionIndex: number,
    optionSelection: DcqlOptionSelectionState
): boolean {
    return option.every(
        (queryId) => (optionSelection[optionIndex]?.[queryId]?.length ?? 0) > 0
    );
}

export function isCredentialSetSatisfied(
    credentialSet: DcqlCredentialSet,
    setIndex: number,
    selectionState: DcqlCredentialSetSelectionState,
    queryGroups: DcqlQueryGroup[]
): boolean {
    const satisfiableOptions = getSatisfiableOptions(
        credentialSet,
        queryGroups
    );
    const optionSelection = selectionState[setIndex] ?? {};

    return satisfiableOptions.some((option, optionIndex) =>
        isOptionSelected(option, optionIndex, optionSelection)
    );
}

export function areRequiredCredentialSetsSatisfied(
    credentialSets: DcqlCredentialSet[],
    selectionState: DcqlCredentialSetSelectionState,
    queryGroups: DcqlQueryGroup[]
): boolean {
    return credentialSets.every((set, setIndex) =>
        !set.required ||
        isCredentialSetSatisfied(set, setIndex, selectionState, queryGroups)
    );
}

export type DcqlNoMatchState = {
    showModal: boolean;
    blockCredentialSelection: boolean;
};

export function areRequiredCredentialSetsUnsatisfiable(
    credentialSets: DcqlCredentialSet[],
    queryGroups: DcqlQueryGroup[]
): boolean {
    const requiredSets = credentialSets.filter((set) => set.required);
    if (requiredSets.length === 0) {
        return false;
    }

    // The presentation cannot succeed if any required set has no satisfiable option.
    return requiredSets.some(
        (set) => getSatisfiableOptions(set, queryGroups).length === 0
    );
}

/**
 * Decide whether to show the no-matching-credentials modal.
 * Show only when the user has no way to satisfy the request:
 * - every query group is empty, or
 * - required credential sets cannot be satisfied, or
 * - (query-groups-only) a required query group has no credentials.
 * Partial gaps that still leave a satisfiable credential_sets path do not show the modal.
 */
export function getDcqlNoMatchState(
    queryGroups: DcqlQueryGroup[],
    credentialSets: DcqlCredentialSet[],
    hasCredentialSets: boolean
): DcqlNoMatchState {
    if (queryGroups.length === 0) {
        return { showModal: false, blockCredentialSelection: false };
    }

    const emptyGroups = queryGroups.filter(
        (group) => group.availableCredentials.length === 0
    );
    const allEmpty = emptyGroups.length === queryGroups.length;

    if (allEmpty) {
        return { showModal: true, blockCredentialSelection: true };
    }

    if (hasCredentialSets) {
        if (areRequiredCredentialSetsUnsatisfiable(credentialSets, queryGroups)) {
            return { showModal: true, blockCredentialSelection: true };
        }
        // Required sets can still be satisfied (e.g. via OR alternatives) — let the user select.
        return { showModal: false, blockCredentialSelection: false };
    }

    const requiredGroupUnsatisfiable = queryGroups.some(
        (group) => group.required && group.availableCredentials.length === 0
    );
    if (requiredGroupUnsatisfiable) {
        return { showModal: true, blockCredentialSelection: true };
    }

    return { showModal: false, blockCredentialSelection: false };
}

export function buildInitialCredentialSetSelection(
    credentialSets: DcqlCredentialSet[],
    queryGroups: DcqlQueryGroup[]
): DcqlCredentialSetSelectionState {
    const selectionState: DcqlCredentialSetSelectionState = {};

    credentialSets.forEach((credentialSet, setIndex) => {
        if (!credentialSet.required) {
            return;
        }

        const satisfiableOptions = getSatisfiableOptions(
            credentialSet,
            queryGroups
        );
        if (satisfiableOptions.length === 0) {
            return;
        }

        const groupMap = getQueryGroupMap(queryGroups);
        const firstOption = satisfiableOptions[0];
        const optionSelection: Record<string, string[]> = {};

        firstOption.forEach((queryId) => {
            const group = groupMap.get(queryId);
            if (group?.availableCredentials.length) {
                optionSelection[queryId] = [
                    group.availableCredentials[0].credentialId,
                ];
            }
        });

        if (Object.keys(optionSelection).length > 0) {
            selectionState[setIndex] = { 0: optionSelection };
        }
    });

    return selectionState;
}

export function flattenCredentialSetSelectionToDcqlState(
    selectionState: DcqlCredentialSetSelectionState
): DcqlSelectionState {
    const flat: DcqlSelectionState = {};

    for (const optionSelection of Object.values(selectionState)) {
        for (const queryMap of Object.values(optionSelection)) {
            for (const [queryId, credentialIds] of Object.entries(queryMap)) {
                flat[queryId] = credentialIds;
            }
        }
    }

    return flat;
}


function deselectOptionFromState(
    optionIndex: number,
    currentSelection: DcqlOptionSelectionState
): DcqlOptionSelectionState {
    const next = { ...currentSelection };
    delete next[optionIndex];
    return next;
}

function deselectOtherOptions(
    excludedOptionIndex: number,
    currentSelection: DcqlOptionSelectionState
): DcqlOptionSelectionState {
    let next = { ...currentSelection };

    for (const optionIndex of Object.keys(currentSelection).map(Number)) {
        if (optionIndex !== excludedOptionIndex) {
            next = deselectOptionFromState(optionIndex, next);
        }
    }

    return next;
}

export function toggleCredentialSetOption(
    credentialSet: DcqlCredentialSet,
    setIndex: number,
    option: string[],
    optionIndex: number,
    selectionState: DcqlCredentialSetSelectionState,
    queryGroups: DcqlQueryGroup[]
): DcqlCredentialSetSelectionState {
    const currentOptionSelection = selectionState[setIndex] ?? {};
    const groupMap = getQueryGroupMap(queryGroups);

    if (isOptionSelected(option, optionIndex, currentOptionSelection)) {
        return {
            ...selectionState,
            [setIndex]: deselectOptionFromState(
                optionIndex,
                currentOptionSelection
            ),
        };
    }

    const clearedSelection = deselectOtherOptions(
        optionIndex,
        currentOptionSelection
    );
    const optionSelection: Record<string, string[]> = {};
    const existingForOption = currentOptionSelection[optionIndex] ?? {};

    option.forEach((queryId) => {
        if (existingForOption[queryId]?.length) {
            optionSelection[queryId] = existingForOption[queryId];
            return;
        }

        const group = groupMap.get(queryId);
        if (group?.availableCredentials.length) {
            optionSelection[queryId] = [
                group.availableCredentials[0].credentialId,
            ];
        }
    });

    return {
        ...selectionState,
        [setIndex]: {
            ...clearedSelection,
            [optionIndex]: optionSelection,
        },
    };
}

export function updateCredentialSetVcSelection(
    setIndex: number,
    optionIndex: number,
    queryId: string,
    credentialId: string,
    isSelected: boolean,
    selectionState: DcqlCredentialSetSelectionState,
    queryGroups: DcqlQueryGroup[]
): DcqlCredentialSetSelectionState {
    const group = queryGroups.find((item) => item.queryId === queryId);
    if (!group) {
        return selectionState;
    }

    const currentOptionSelection = selectionState[setIndex] ?? {};
    const currentForQuery =
        currentOptionSelection[optionIndex]?.[queryId] ?? [];

    if (!isSelected) {
        if (
            group.required &&
            group.availableCredentials.length === 1 &&
            currentForQuery.length === 1
        ) {
            return selectionState;
        }

        const updatedForQuery = currentForQuery.filter(
            (id) => id !== credentialId
        );
        const nextOptionSelection = { ...currentOptionSelection };

        if (updatedForQuery.length === 0) {
            const optionEntry = { ...(nextOptionSelection[optionIndex] ?? {}) };
            delete optionEntry[queryId];

            if (Object.keys(optionEntry).length === 0) {
                delete nextOptionSelection[optionIndex];
            } else {
                nextOptionSelection[optionIndex] = optionEntry;
            }
        } else {
            nextOptionSelection[optionIndex] = {
                ...(nextOptionSelection[optionIndex] ?? {}),
                [queryId]: updatedForQuery,
            };
        }

        return {
            ...selectionState,
            [setIndex]: nextOptionSelection,
        };
    }

    const clearedSelection = deselectOtherOptions(
        optionIndex,
        currentOptionSelection
    );

    let updatedForQuery: string[];
    if (group.multiple) {
        updatedForQuery = currentForQuery.includes(credentialId)
            ? currentForQuery
            : [...currentForQuery, credentialId];
    } else {
        updatedForQuery = [credentialId];
    }

    return {
        ...selectionState,
        [setIndex]: {
            ...clearedSelection,
            [optionIndex]: {
                ...(clearedSelection[optionIndex] ?? {}),
                [queryId]: updatedForQuery,
            },
        },
    };
}

export function updateCredentialSetSelectionForSet(
    setIndex: number,
    optionSelection: DcqlOptionSelectionState,
    selectionState: DcqlCredentialSetSelectionState
): DcqlCredentialSetSelectionState {
    return {
        ...selectionState,
        [setIndex]: optionSelection,
    };
}
