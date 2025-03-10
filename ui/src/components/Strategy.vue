<script setup lang="ts">
import { formatEther } from 'viem';
import { onMounted, ref } from 'vue';
import Converter from '@/scripts/converter';
import { tokens } from '@/scripts/constants';
import { useWalletStore } from '@/stores/wallet';
import { PriceOracleContract, MultiTokenPoolContract } from '@/scripts/contract';

const walletStore = useWalletStore();

const props = defineProps({
    agent: { type: Object, required: true }
});

const emit = defineEmits(['onFork']);

const tvl = ref<number>(0);

const getTotalLockedValue = async () => {
    const tokens = await MultiTokenPoolContract.getTokens(
        props.agent.strategy_address
    );
    const amounts = await MultiTokenPoolContract.getBalances(
        props.agent.strategy_address
    );

    if (!tokens || !amounts) return;

    const amountsInUsd = await PriceOracleContract.getAmountsOutInUsd(
        amounts,
        tokens
    );

    tvl.value = Number(formatEther(amountsInUsd));
};

onMounted(() => {
    getTotalLockedValue();
});
</script>


<template>
    <div class="strategy">
        <div class="asset">
            <div class="label">
                <p>Minimum entry deposit</p>
                <p>Strategy tokens</p>
            </div>

            <div class="tokens">
                <div>
                    <p>${{ Converter.toMoney(props.agent.minimum_deposit) }}</p>
                </div>
                <div>
                    <img v-for="token in props.agent.tokens"
                        :src="tokens.find(t => t.address.toLowerCase() == token.toLowerCase())?.image" :key="token"
                        :alt="token">
                </div>
            </div>
        </div>

        <div class="info">
            <div class="duration">
                <p>24h Profits</p>
                <div>
                    <p>+0.00%</p>
                </div>
            </div>
            <div class="interest">
                <p>Total Value Locked</p>
                <div>
                    <p>${{ Converter.toMoney(tvl) }}</p>
                </div>
            </div>
        </div>

        <div class="info">
            <div class="stat">
                <p>Tasks</p>
                <p>{{ props.agent.tasks.length }}</p>
            </div>
            <div class="stat">
                <p>LLM</p>
                <p>{{props.agent.config.find((c: any) => c.is_llm)?.name}}</p>
            </div>
        </div>

        <div class="actions">
            <p>{{ Converter.fineAddress(props.agent.strategy_address, 4) }}</p>
            <div>
                <button v-if="walletStore.address?.toLowerCase() != props.agent.creator?.toLowerCase()"
                    @click="emit('onFork', props.agent)">
                    Fork
                </button>

                <RouterLink :to="`/strategies/${props.agent.strategy_address}`">
                    <button>Deposit</button>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
    text-transform: capitalize;
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