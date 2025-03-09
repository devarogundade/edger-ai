<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import SideBar from '@/components/SideBar.vue';
import { onMounted, ref } from 'vue';
import { useWalletStore } from '@/stores/wallet';
import { createWeb3Modal } from '@web3modal/wagmi/vue';
import { watchAccount } from '@wagmi/core';
import { config, chains } from '@/scripts/config';
import { useRouter } from 'vue-router';

const walletStore = useWalletStore();

// const fetchingAccount = ref<boolean>(false);
const router = useRouter();

createWeb3Modal({
    wagmiConfig: config,
    projectId: import.meta.env.VITE_PROJECT_ID,
    // @ts-ignore
    chains: chains,
    enableAnalytics: true,
    themeMode: 'light'
});

onMounted(() => {
    watchAccount(config, {
        onChange(account) {
            if (account.status == 'disconnected') {
                router.push('/signin');
                walletStore.setAddress(null);
                walletStore.setSBalance(0);
            }
        },
    });
});
</script>

<template>
    <section>
        <div class="app_width">
            <AppHeader />
            <div class="app">
                <SideBar class="sidebar" />
                <div></div>
                <div class="sandbox">
                    <RouterView />
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.app {
    display: grid;
    width: 100%;
    grid-template-columns: 260px auto;
    height: 100vh;
}

.sandbox {
    border-right: 1px solid var(--bg-darkest);
    padding: 90px 0;
}
</style>