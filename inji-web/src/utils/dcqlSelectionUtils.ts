import { DcqlQueryGroup, DcqlSelectionState } from "../types/dcql";
import { WalletCredential } from "../types/data";

export function isDcqlCredentialsResponse(
    data: unknown
): data is { queryGroups: DcqlQueryGroup[] } {
    return (
        typeof data === "object" &&
        data !== null &&
        Array.isArray((data as { queryGroups?: unknown }).queryGroups)
    );
}

export function formatQueryIdLabel(queryId: string): string {
    return queryId
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatMissingClaimLabel(claim: string): string {
    const withoutJsonPathPrefix = claim.trim().replace(/^\$\./, "");
    const lastPathSegment =
        withoutJsonPathPrefix.split(".").pop() ?? withoutJsonPathPrefix;
    const withoutArrayIndices = lastPathSegment.replace(/\[\d+\]/g, "");

    return withoutArrayIndices
        .split(/[-_]/)
        .filter(Boolean)
        .flatMap((part) =>
            part
                .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
                .split(/\s+/)
                .filter(Boolean)
        )
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
}

export function flattenQueryGroupCredentials(
    queryGroups: DcqlQueryGroup[]
): WalletCredential[] {
    const seen = new Set<string>();
    const result: WalletCredential[] = [];

    for (const group of queryGroups) {
        for (const credential of group.availableCredentials) {
            if (!seen.has(credential.credentialId)) {
                seen.add(credential.credentialId);
                result.push(credential);
            }
        }
    }

    return result;
}

export function buildInitialDcqlSelection(
    queryGroups: DcqlQueryGroup[]
): DcqlSelectionState {
    const selection: DcqlSelectionState = {};

    for (const group of queryGroups) {
        if (group.required && group.availableCredentials.length > 0) {
            selection[group.queryId] = [
                group.availableCredentials[0].credentialId,
            ];
        } else {
            selection[group.queryId] = [];
        }
    }

    return syncCredentialAcrossGroups(queryGroups, selection);
}

export function syncCredentialAcrossGroups(
    queryGroups: DcqlQueryGroup[],
    selection: DcqlSelectionState
): DcqlSelectionState {
    const union = new Set(getSelectedCredentialIdsFlat(selection));
    const crossGroupIds = new Set<string>();

    for (const credentialId of union) {
        const groupsWithCredential = queryGroups.filter((group) =>
            group.availableCredentials.some(
                (credential) => credential.credentialId === credentialId
            )
        );
        if (groupsWithCredential.length > 1) {
            crossGroupIds.add(credentialId);
        }
    }

    const next: DcqlSelectionState = {};

    for (const group of queryGroups) {
        const availableIds = group.availableCredentials.map(
            (credential) => credential.credentialId
        );
        const matchedIds = availableIds.filter((id) => union.has(id));

        if (matchedIds.length === 0) {
            next[group.queryId] = [];
            continue;
        }

        if (group.multiple) {
            next[group.queryId] = matchedIds;
            continue;
        }

        const crossGroupMatch = matchedIds.find((id) => crossGroupIds.has(id));
        if (crossGroupMatch) {
            next[group.queryId] = [crossGroupMatch];
            continue;
        }

        const previousSelection = (selection[group.queryId] ?? []).find((id) =>
            matchedIds.includes(id)
        );
        next[group.queryId] = [previousSelection ?? matchedIds[0]];
    }

    return next;
}

export function areRequiredQueryGroupsSatisfied(
    queryGroups: DcqlQueryGroup[],
    selection: DcqlSelectionState
): boolean {
    return queryGroups
        .filter((group) => group.required)
        .every((group) => {
            const selected = selection[group.queryId] ?? [];
            if (selected.length === 0) {
                return false;
            }
            return selected.every((credentialId) =>
                group.availableCredentials.some(
                    (credential) => credential.credentialId === credentialId
                )
            );
        });
}

export function isCredentialDeselectionDisabled(
    group: DcqlQueryGroup
): boolean {
    return group.required && group.availableCredentials.length === 1;
}

export function getSelectedCredentialIdsFlat(
    selection: DcqlSelectionState
): string[] {
    return [...new Set(Object.values(selection).flat())];
}

export function updateDcqlCredentialSelection(
    queryGroups: DcqlQueryGroup[],
    selection: DcqlSelectionState,
    queryId: string,
    credentialId: string,
    isSelected: boolean
): DcqlSelectionState {
    const group = queryGroups.find((item) => item.queryId === queryId);
    if (!group) {
        return selection;
    }

    const current = selection[queryId] ?? [];

    if (!isSelected) {
        if (isCredentialDeselectionDisabled(group)) {
            return selection;
        }
        const next = {
            ...selection,
            [queryId]: current.filter((id) => id !== credentialId),
        };
        return pruneOrphanedSelections(queryGroups, next);
    }

    let updatedForGroup: string[];
    if (group.multiple) {
        updatedForGroup = current.includes(credentialId)
            ? current
            : [...current, credentialId];
    } else {
        updatedForGroup = [credentialId];
    }

    const next = {
        ...selection,
        [queryId]: updatedForGroup,
    };

    return syncCredentialAcrossGroups(queryGroups, next);
}

function pruneOrphanedSelections(
    queryGroups: DcqlQueryGroup[],
    selection: DcqlSelectionState
): DcqlSelectionState {
    const remainingIds = new Set(getSelectedCredentialIdsFlat(selection));
    const next: DcqlSelectionState = {};

    for (const group of queryGroups) {
        const current = selection[group.queryId] ?? [];
        next[group.queryId] = current.filter((id) => remainingIds.has(id));
    }

    return next;
}

export function filterQueryGroupsBySearch(
    queryGroups: DcqlQueryGroup[],
    searchText: string
): DcqlQueryGroup[] {
    const query = searchText.trim().toLowerCase();
    if (!query) {
        return queryGroups;
    }

    return queryGroups.map((group) => ({
        ...group,
        availableCredentials: group.availableCredentials.filter((credential) =>
            (credential.credentialTypeDisplayName ?? "")
                .toLowerCase()
                .includes(query)
        ),
    }));
}
