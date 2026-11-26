import React, {useCallback, useContext, useMemo, useRef, useState} from "react";

type CredentialCardActionsLock = {
    locked: boolean;
    tryAcquire: () => boolean;
    release: () => void;
};

const CredentialCardActionsContext = React.createContext<CredentialCardActionsLock | null>(null);

export function CredentialCardActionsProvider(props: Readonly<{children: React.ReactNode}>) {
    const pendingRef = useRef(0);
    const [locked, setLocked] = useState(false);

    const tryAcquire = useCallback(() => {
        if (pendingRef.current > 0) {
            return false;
        }
        pendingRef.current = 1;
        setLocked(true);
        return true;
    }, []);

    const release = useCallback(() => {
        pendingRef.current = 0;
        setLocked(false);
    }, []);

    const value = useMemo(
        () => ({locked, tryAcquire, release}),
        [locked, tryAcquire, release]
    );

    return (
        <CredentialCardActionsContext.Provider value={value}>
            {props.children}
        </CredentialCardActionsContext.Provider>
    );
}

export function useCredentialCardActions() {
    return useContext(CredentialCardActionsContext);
}
