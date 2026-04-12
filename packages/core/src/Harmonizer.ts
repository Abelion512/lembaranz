'use client';

import { useEffect } from 'react';
import { useStore } from './Store';
import { Vault } from './Vault';

export const useHarmonizer = () => {
    const isVaultLocked = useStore(s => s.isVaultLocked);
    const setVaultLocked = useStore(s => s.setVaultLocked);

    useEffect(() => {
        const channel = new BroadcastChannel('lembaran-vault-sync');

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'VAULT_LOCK_STATUS') {
                const newStatus = event.data.locked;
                if (newStatus !== isVaultLocked) {
                    if (newStatus) {
                        Vault.clearKey();
                    }
                    setVaultLocked(newStatus);
                }
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, [isVaultLocked, setVaultLocked]);

    // Kita panggil ini saat status berubah di tab ini
    useEffect(() => {
        const channel = new BroadcastChannel('lembaran-vault-sync');
        channel.postMessage({ type: 'VAULT_LOCK_STATUS', locked: isVaultLocked });
        channel.close();
    }, [isVaultLocked]);
};
