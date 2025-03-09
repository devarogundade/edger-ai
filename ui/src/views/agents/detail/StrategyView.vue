<script setup lang="ts">
import UserAddIcon from '@/components/icons/UserAddIcon.vue';
import { useRoute } from 'vue-router';
import HistoryTable from './HistoryTable.vue';
import ForkPopup from '@/components/ForkPopup.vue';
import { onMounted, ref } from 'vue';
import DepositPopup from '@/components/DepositPopup.vue';
import WithdrawPopup from '@/components/WithdrawPopup.vue';
import type { Activity, AgentJson } from '@/scripts/types';
import { formatEther, type Hex } from 'viem';
import Client from '@/scripts/client';
import ProgressBox from '@/components/ProgressBox.vue';
import { explorerUrl, tokens } from '@/scripts/constants';
import Converter from '@/scripts/converter';
import { useWalletStore } from '@/stores/wallet';
import { PriceOracleContract, MultiTokenPoolContract } from '@/scripts/contract';
import OutIcon from '@/components/icons/OutIcon.vue';

const route = useRoute();
const agent = ref<AgentJson | null>(null);
const activities = ref<Activity[]>([]);

const walletStore = useWalletStore();

const loading = ref(true);

const forking = ref(false);
const depositing = ref(false);
const withdrawing = ref(false);
const tvl = ref<number | undefined>(undefined);

const deploying = ref(false);
const running = ref(false);
const stopping = ref(false);

const deploy = async () => {
    if (!agent.value) return;

    deploying.value = true;
    await Client.loadAgent(agent.value.strategy_address);
    deploying.value = true;

    getAgent(agent.value.strategy_address);

};

const run = async () => {
    if (!agent.value) return;

    running.value = true;
    await Client.startAgent(agent.value.strategy_address);
    running.value = false;


    getAgent(agent.value.strategy_address);
};

const reRun = async () => {
    if (!agent.value) return;

    running.value = true;
    await Client.loadAgent(agent.value.strategy_address);
    await Client.startAgent(agent.value.strategy_address);
    running.value = false;


    getAgent(agent.value.strategy_address);
};

const stop = async () => {
    if (!agent.value) return;

    stopping.value = true;
    await Client.stopAgent(agent.value.strategy_address);
    stopping.value = false;

    getAgent(agent.value.strategy_address);

};

const getActivities = async (strategyAddress: Hex) => {
    activities.value = await Client.getActivities(strategyAddress, 1, 100);
};

const getAgent = async (strategyAddress: Hex) => {
    loading.value = true;

    agent.value = await Client.getAgent(strategyAddress);

    getActivities(strategyAddress);
    getTotalLockedValue();

    loading.value = false;

    setInterval(() => {

        getActivities(strategyAddress);
    }, (agent.value?.loop_delay || 60) * 1_000);
};

const getTotalLockedValue = async () => {
    if (!agent.value) return;

    const tokens = await MultiTokenPoolContract.getTokens(
        agent.value.strategy_address
    );
    const amounts = await MultiTokenPoolContract.getBalances(
        agent.value.strategy_address
    );

    if (!tokens || !amounts) return;

    const amountsInUsd = await PriceOracleContract.getAmountsOutInUsd(
        amounts,
        tokens
    );

    if (!amountsInUsd) return;

    tvl.value = Number(amountsInUsd);
};

const refresh = () => {
    getTotalLockedValue();
};

onMounted(() => {
    const strategyAddress = route.params.id;
    if (!strategyAddress) return;

    getAgent(strategyAddress as Hex);
});
</script>
<template>
    <div class="load_frame" v-if="loading">
        <ProgressBox />
    </div>

    <main v-else-if="agent">
        <div class="container">
            <div class="first_box">
                <div class="principal" v-if="true">
                    <p class="label">Minimum entry deposit</p>
                    <div>
                        <p>${{ Converter.toMoney(agent.minimum_deposit) }}</p>
                    </div>
                </div>

                <div class="tokens">
                    <p class="label">Strategy tokens</p>
                    <div>
                        <img v-for="token in agent.tokens"
                            :src="tokens.find(t => t.address.toLowerCase() == token.toLowerCase())?.image" :key="token"
                            :alt="token">
                    </div>
                </div>
            </div>

            <div class="second_box">
                <div class="buttons">
                    <div v-if="walletStore.address?.toLowerCase() == agent.creator?.toLowerCase()">
                        <div class="start" @click="deploy" v-if="agent.state == 'default'">
                            <p>{{ deploying ? 'Deploying' : 'Deploy' }}</p>
                        </div>

                        <div class="start" @click="run" v-else-if="agent.state == 'deployed'">
                            <p>{{ running ? 'Running' : 'Run' }}</p>
                        </div>

                        <div class="start" @click="stop" v-else-if="agent.state == 'running'">
                            <p>{{ stopping ? 'Stopping' : 'Stop' }}</p>
                        </div>

                        <div class="start" @click="reRun" v-else-if="agent.state == 'stopped'">
                            <p>{{ running ? 'Running' : 'Re-run' }}</p>
                        </div>
                    </div>

                    <div class="fork" @click="forking = true" v-else>
                        <p>Fork</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="container" v-if="true">
            <div class="firstbox">
                <div class="strategy">
                    <div class="first_row">
                        <div>
                            <UserAddIcon />
                            <p class="deep_text">Tasks <span>{{ agent.tasks.length }}</span></p>
                            <p class="light_text">
                                {{agent.tasks.map(task => task.name).join(', ')}}
                            </p>
                        </div>
                        <div>
                            <UserAddIcon />
                            <p class="deep_text">
                                LLM
                                <span>/ AI model</span>
                            </p>
                            <p class="light_text">{{agent.config.find(c => c.is_llm)?.name}}</p>
                        </div>
                    </div>
                    <div class="second_row">
                        <div class="total_emitted">
                            <div class="total_emitted_tokens">
                                <div class="images">
                                    <img v-for="address in 3" :key="address" :src="`/images/user.png`" alt="">
                                </div>
                                <p>+4</p>
                            </div>
                            <div class="total_emitted_label">
                                <p>Forks</p>
                                <!-- <UserAddIcon :color="'var(--primary)'" /> -->
                            </div>
                        </div>
                        <a :href="`${explorerUrl}/address/${agent.strategy_address}`" target="_blank">
                            <div class="collateral_info">
                                <p>{{ Converter.fineAddress(agent.strategy_address, 6) }}</p>
                                <OutIcon />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            <div class="second_box">
                <div class="stat">
                    <h3 class="stat_title">Stats</h3>
                    <div class="stat_grid">
                        <div>
                            <p class="stat_grid_label">24h Profits</p>
                            <div class="stat_grid_token">
                                <p>+0.00%</p>
                            </div>
                        </div>
                        <div>
                            <p class="stat_grid_label">Value Locked</p>
                            <div class="stat_grid_token">
                                <p v-if="tvl">${{ Converter.toMoney(tvl) }}</p>
                                <p v-else>•••</p>
                            </div>
                        </div>
                    </div>
                    <div class="stat_action">
                        <div class="stat_action_buttons">
                            <button @click="depositing = true">
                                <p>Deposit</p>
                            </button>
                            <button @click="withdrawing = true">
                                <p>Withdraw</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <WithdrawPopup v-if="withdrawing" :agent="agent" @close="withdrawing = false" @refresh="refresh" />
        <DepositPopup v-if="depositing" :agent="agent" @close="depositing = false" @refresh="refresh" />
        <ForkPopup v-if="agent && forking" :fork="agent" @close="forking = false" />
        <HistoryTable :activities="activities" class="table" />
    </main>
</template>

<style scoped>
.progress_box {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 200px;
}

main {
    margin-top: 60px;
    padding: 0 60px;
}

.container {
    display: flex;
    justify-content: space-between;
}

.first_box {
    width: 620px;
    display: flex;
    justify-content: space-between;
}

.second_box {
    width: 380px;
}

.first_box .label {
    font-size: 14px;
    color: var(--tx-dimmed);
}

.principal>div {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
}

.principal>div img {
    width: 34px;
    height: 34px;
    border-radius: 50%;
}

.principal>div p {
    font-size: 25px;
    color: var(--tx-normal);
    font-family: 'Axiforma SemiBold';
}

.tokens {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.tokens>div {
    display: flex;
    align-items: center;
    border-radius: 4px;
    margin-top: 16px;
}

.tokens>div img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-left: -10px;
}

.container .buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 20px;
    margin-top: 34px;
}

.start {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    background: var(--primary);
    border-radius: 4px;
    cursor: pointer;
}

.start p {
    padding: 0 30px;
    font-size: 14px;
    color: var(--tx-normal);
}

.fork {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    background: var(--primary-light);
    border-radius: 4px;
    cursor: pointer;
}

.fork p {
    padding: 0 30px;
    font-size: 14px;
    color: var(--bg);
}

.strategy {
    margin-top: 50px;
    width: 620px;
    background: var(--bg-dark);
    border-radius: 6px;
    overflow: hidden;
}

.strategy .first_row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-bottom: 2px solid var(--bg);
}

.strategy .first_row>div:first-child {
    border-right: 2px solid var(--bg);
}

.strategy .first_row>div {
    padding: 30px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.container2 .first_row {
    border: none;
}

.strategy .first_row svg {
    width: 25px;
    height: 25px;
}

.strategy .first_row .deep_text {
    font-size: 20px;
    color: var(--tx-normal);
    margin-top: 20px;
}

.strategy .deep_text span {
    font-size: 12px;
    color: var(--tx-dimmed);
}

.strategy .light_text {
    font-size: 14px;
    color: var(--tx-dimmed);
    margin-top: 10px;
    text-transform: capitalize;
}

.strategy .second_row {
    background: var(--bg-darker);
    padding: 28px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.strategy .total_emitted_tokens {
    display: flex;
    align-items: center;
}

.total_emitted_tokens .images {
    display: flex;
    align-items: center;
}

.total_emitted_tokens .images img {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    margin-left: -10px;
}

.total_emitted_tokens .images img:first-child {
    margin: 0;
}

.total_emitted_tokens p {
    font-size: 12px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tx-normal);
    background: var(--bg-darkest);
    padding: 0 4px;
    border-radius: 12px;
    margin-left: -10px;
}

.total_emitted_label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
}

.total_emitted_label p {
    font-size: 12px;
    color: var(--tx-dimmed);
}

.collateral_info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.collateral_info p {
    font-size: 14px;
    color: var(--tx-normal);
}

.stat {
    margin-top: 50px;
    background-color: var(--bg-dark);
    border-radius: 6px;
    overflow: hidden;
    background-image: url('/images/strategy_stat.png');
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
}

.stat_title {
    padding: 30px;
    padding-bottom: 20px;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--tx-normal);
    border-bottom: 2px solid var(--bg);
}

.stat_grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-bottom: 2px solid var(--bg);
}

.stat_grid>div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 40px;
}

.stat_grid>div:first-child {
    padding-right: 4px;
}

.stat_grid>div:last-child {
    align-items: flex-end;
    text-align: right;
    border-left: 2px solid var(--bg);
}

.stat_grid_label {
    font-size: 14px;
    color: var(--tx-dimmed);
}

.stat_grid_token {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
}

.stat_grid_token img {
    height: 24px;
    width: 24px;
    border-radius: 50%;
}

.stat_grid_token p {
    font-size: 16px;
    color: var(--tx-normal);
}

.stat_action {
    padding: 30px;
    background-color: var(--bg-darker);
    background-image: url('/images/subtle_gradient.png');
}

.stat_action_buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.stat_action button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    background: var(--primary);
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    border: none;
}

.stat_action button:last-child {
    background: var(--sm-red);
}

.stat_action button p {
    font-size: 14px;
    color: var(--tx-normal);
}

.stat_action button:last-child p {
    color: var(--bg);
}

.table {
    margin-top: 60px;
}
</style>