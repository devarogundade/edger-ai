<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { AgentJson } from '@/scripts/types';
import Client from '@/scripts/client';
import ProgressBox from '@/components/ProgressBox.vue';
import { useWalletStore } from '@/stores/wallet';
import Strategy from '@/components/Strategy.vue';

const loading = ref(true);
const agents = ref<AgentJson[]>([]);
const walletStore = useWalletStore();

const getAgents = async () => {
    if (!walletStore.address) return;

    loading.value = true;
    agents.value = await Client.getAgents("", 1, 10, walletStore.address);
    loading.value = false;
};

onMounted(() => {
    getAgents();
});
</script>

<template>
    <div class="load_frame" v-if="loading">
        <ProgressBox />
    </div>

    <div class="strategies" v-else>
        <Strategy v-for="agent in agents" :agent="agent" :key="agent.strategy_address" />
    </div>
</template>

<style scoped>
.strategies {
    display: flex;
    flex-wrap: wrap;
    padding: 40px 60px;
    gap: 30px;
}
</style>