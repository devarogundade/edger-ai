<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { AgentJson } from '@/scripts/types';
import ForkPopup from '@/components/ForkPopup.vue';
import Client from '@/scripts/client';
import ProgressBox from '@/components/ProgressBox.vue';
import Strategy from '@/components/Strategy.vue';

const loading = ref(true);
const agents = ref<AgentJson[]>([]);
const fork = ref<AgentJson | null>(null);

const getAgents = async () => {
    loading.value = true;
    agents.value = await Client.getAgents("public", 1, 10);
    loading.value = false;
};

const onFork = (agent: AgentJson) => {
    fork.value = agent;
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
        <Strategy v-for="agent in agents" :agent="agent" @onFork="onFork" :key="agent.strategy_address" />
    </div>

    <ForkPopup v-if="fork" :fork="fork" @close="fork = null" />
</template>

<style scoped>
.strategies {
    display: flex;
    flex-wrap: wrap;
    padding: 40px 60px;
    gap: 30px;
}

.strategy {
    min-width: 494px;
    background: var(--bg-dark);
    border-radius: 6px;
    overflow: hidden;
    transition: .2s;
}

.asset {
    padding: 26px 20px;
}

.asset>div {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.asset>.label>p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-dimmed);
}

.asset>.label {
    margin-bottom: 16px;
}

.asset .tokens>div {
    display: flex;
    align-items: center;
    gap: 12px;
}

.asset .tokens>div p {
    font-weight: 500;
    font-size: 24px;
    color: var(--tx-normal);
}

.asset .tokens img {
    border-radius: 50%;
}

.asset .tokens>div:first-child img {
    width: 30px;
}

.asset .tokens>div:nth-child(2) img {
    width: 24px;
    margin-right: -20px;
}

.asset .tokens>div:nth-child(2) {
    width: 58px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.info {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--bg);
}

.info .duration {
    border-right: 1px solid var(--bg);
}

.info>div>p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-dimmed);
}

.info>div>div {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
}

.info>div {
    padding: 26px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.info>div>div p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-normal);
}

.stat {
    height: 72px;
    background: var(--bg-darker);
    padding: 0 20px;
    display: flex;
    align-items: center;
}

.stat {
    text-align: center;
    flex-direction: column;
    justify-content: center;
}

.stat p:first-child {
    font-weight: 500;
    font-size: 12px;
    color: var(--tx-dimmed);
}

.stat p:nth-child(2) {
    font-weight: 500;
    font-size: 12px;
    color: var(--tx-normal);
    margin-top: 6px;
}

.actions {
    height: 60px;
    background: var(--bg-dark);
    padding: 0 20px;
    display: flex;
    align-items: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.actions>p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-dimmed);
}

.actions>div {
    display: flex;
    align-items: center;
    gap: 10px;
}

.actions button {
    border: none;
    cursor: pointer;
    height: 30px;
    padding: 0 20px;
    border-radius: 4px;
    font-weight: 500;
}

.actions button:first-child {
    background: var(--primary-light);
    color: var(--bg);
}

.actions button:last-child {
    background: var(--primary);
    color: var(--tx-normal);
}
</style>