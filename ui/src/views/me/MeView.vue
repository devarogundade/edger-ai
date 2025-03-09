<script setup lang="ts">
import ConnectWallet from '@/components/ConnectWallet.vue';
import MeHeader from '@/components/MeHeader.vue';
import { useWalletStore } from '@/stores/wallet';

const walletStore = useWalletStore();
</script>

<template>
    <main v-if="walletStore.address">
        <MeHeader />
        <RouterView />
    </main>
    <ConnectWallet v-else />
</template>