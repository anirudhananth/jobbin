import { useState, useEffect } from 'react';

export function useDisabledState() {
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        chrome.storage.local.get(['disabled'], (result) => {
            setIsDisabled(result.disabled ?? false);
        });

        const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.disabled) {
                setIsDisabled(changes.disabled.newValue);
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    const setDisabledState = (value: boolean) => {
        chrome.storage.local.set({ disabled: value });
    };

    return [isDisabled, setDisabledState] as const;
}