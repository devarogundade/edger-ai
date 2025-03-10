<script setup lang="ts">
import { explorerUrl, SONIC_COIN, tokens } from '@/scripts/constants';
import ChevronDownIcon from './icons/ChevronDownIcon.vue';
import CloseIcon from './icons/CloseIcon.vue';
import Converter from '@/scripts/converter';
import { formatEther, formatUnits, parseUnits, type Hex } from 'viem';
import { onMounted, ref, watch } from 'vue';
import { useWalletStore } from '@/stores/wallet';
import { PriceOracleContract, MultiTokenPoolContract } from '@/scripts/contract';
import { TokenContract } from '@/scripts/erc20';
import { notify } from '@/reactives/notify';

const emit = defineEmits(['close', 'refresh']);

const props = defineProps({
    agent: { type: Object, required: true }
});

const walletStore = useWalletStore();
const amount = ref<number>(0);
const allowance = ref<number>(0);
const approving = ref<boolean>(false);
const depositing = ref<boolean>(false);
const balance = ref(0);
const price = ref(0);

const deposit = async () => {
    if (depositing.value) return;

    if (!walletStore.address) {
        notify.push({
            title: "Error",
            description: "Connect your wallet!",
            category: "error"
        });
        return;
    }

    if (!selectedToken.value) {
        notify.push({
            title: "Error",
            description: "Invalid selected token!",
            category: "error"
        });
        return;
    }

    if (amount.value <= 0) {
        notify.push({
            title: "Error",
            description: "Enter a valid amount!",
            category: "error"
        });
        return;
    }

    depositing.value = true;

    let txHash: Hex | null = null;

    if (selectedToken.value == SONIC_COIN) {
        txHash = await MultiTokenPoolContract.depositETH(
            props.agent.strategy_address,
            parseUnits(
                amount.value.toString(),
                tokens.find(t => t.address == selectedToken.value)?.decimals || 18
            ),
        );
    } else {
        txHash = await MultiTokenPoolContract.deposit(
            props.agent.strategy_address,
            selectedToken.value,
            parseUnits(
                amount.value.toString(),
                tokens.find(t => t.address == selectedToken.value)?.decimals || 18
            ),
        );
    }

    if (txHash) {
        notify.push({
            title: "Success",
            description: "Deposit done.",
            category: "success",
            linkTitle: "View Trx",
            linkUrl: `${explorerUrl}/tx/${txHash}`
        });

        emit('refresh');

        amount.value = 0;
    } else {
        notify.push({
            title: "Error",
            description: "Deposit failed!",
            category: "error"
        });
    }

    depositing.value = false;
};

const getAllowance = async () => {
    if (!walletStore.address) {
        allowance.value = 0;
        return;
    }

    if (!selectedToken.value) {
        allowance.value = 0;
        return;
    }

    if (selectedToken.value == SONIC_COIN) {
        allowance.value = Number.MAX_VALUE;
        return;
    }

    const result = await TokenContract.getAllowance(
        selectedToken.value,
        walletStore.address,
        props.agent.strategy_address
    );

    allowance.value = Number(
        formatUnits(
            result,
            tokens.find(t => t.address == selectedToken.value)?.decimals || 18
        )
    );
};

const doApproval = async () => {
    if (approving.value) return;

    if (!walletStore.address) {
        notify.push({
            title: "Error",
            description: "Connect your wallet!",
            category: "error"
        });
        allowance.value = 0;
        return;
    }


    if (!selectedToken.value) {
        notify.push({
            title: "Error",
            description: "Invalid selected token!",
            category: "error"
        });
        allowance.value = 0;
        return;
    }

    if (amount.value <= 0) {
        notify.push({
            title: "Error",
            description: "Enter a valid amount!",
            category: "error"
        });
        return;
    }

    approving.value = true;

    const txHash = await TokenContract.approve(
        selectedToken.value,
        props.agent.strategy_address,
        parseUnits(
            amount.value.toString(),
            tokens.find(t => t.address == selectedToken.value)?.decimals || 18
        )
    );

    if (txHash) {
        notify.push({
            title: "Success",
            description: "Approval done.",
            category: "success",
            linkTitle: "View Trx",
            linkUrl: `${explorerUrl}/tx/${txHash}`
        });

        getAllowance();
    } else {
        notify.push({
            title: "Error",
            description: "Token approval failed!",
            category: "error"
        });
    }

    approving.value = false;
};

const getBalance = async () => {
    if (!selectedToken.value) return;
    if (!walletStore.address) return;

    let amount = BigInt(0);
    if (selectedToken.value == SONIC_COIN) {
        amount = await TokenContract.getTokenBalance(
            undefined,
            walletStore.address
        );
    } else {
        amount = await TokenContract.getTokenBalance(
            selectedToken.value,
            walletStore.address
        );
    }

    balance.value = Number(formatUnits(amount, tokens.find(t => t.address == selectedToken.value)?.decimals || 18));
};

const getPrice = async () => {
    if (!selectedToken.value) return;

    const result = await PriceOracleContract.getAmountOutInUsd(
        parseUnits(
            amount.value.toString(),
            tokens.find(t => t.address == selectedToken.value)?.decimals || 18
        ),
        selectedToken.value
    );

    price.value = Number(formatUnits(result, (tokens.find(t => t.address == selectedToken.value)?.decimals || 18) + 8));
};

const selectingToken = ref(false);
const selectedToken = ref<Hex | null>(props.agent.tokens[0]);

onMounted(() => {
    getBalance();
});

watch(amount, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    getAllowance();
    getPrice();
});

watch(selectedToken, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    getAllowance();
    getBalance();
    getPrice();
});
</script>

<template>
    <main>
        <div class="box">
            <div class="title">
                <h3>Deposit into strategy</h3>
                <div>
                    <div class="close" v-on:click="emit('close')">
                        <CloseIcon />
                    </div>
                </div>
            </div>
            <div class="overflow">
                <div class="offer">
                    <div class="box_grid">
                        <div>
                            <div class="label">Minimum entry deposit</div>
                            <div class="box_grid_item">
                                <p>${{ Converter.toMoney(props.agent.minimum_deposit) }}</p>
                            </div>
                        </div>
                        <div>
                            <div class="label">Strategy tokens</div>
                            <div class="box_grid_item">
                                <div class="images">
                                    <img v-for="token in props.agent.tokens"
                                        :src="tokens.find(t => t.address.toLowerCase() == token.toLowerCase())?.image"
                                        :key="token" :alt="token">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="input">
                        <input type="number" v-model="amount" placeholder="0.00">

                        <div class="balance" v-if="amount == 0" @click="amount = balance">Bal: {{
                            Converter.toMoney(balance) }}</div>
                        <div class="balance" v-else>${{ Converter.toMoney(price) }}</div>

                        <div class="dropdown" @click="selectingToken = !selectingToken">
                            <div class="token">
                                <img :src="tokens.find(t => t.address.toLowerCase() == selectedToken?.toLowerCase())?.image"
                                    alt="">
                                <p>{{tokens.find(t => t.address.toLowerCase() == selectedToken?.toLowerCase())?.symbol
                                }}</p>
                                <ChevronDownIcon />
                            </div>

                            <div class="tokens" v-if="selectingToken">
                                <div class="token" v-for="token in props.agent.tokens" @click="selectedToken = token"
                                    :key="token">
                                    <img :src="tokens.find(t => t.address.toLowerCase() == token.toLowerCase())?.image"
                                        alt="">
                                    <p>{{tokens.find(t => t.address.toLowerCase() == token.toLowerCase())?.symbol}}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action">
                <button v-if="amount == 0" disabled>Deposit</button>
                <button v-else-if="amount > allowance" @click="doApproval">Approve</button>
                <button v-else @click="deposit">Deposit</button>
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    width: 100%;
    height: 100%;
    position: fixed;
    z-index: 30;
    top: 0;
    left: 0;
    background: rgba(20, 20, 22, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
}

.box {
    width: 500px;
    background-repeat: no-repeat;
    background-size: cover;
    background-color: var(--bg-dark);
    border-radius: 6px;
    overflow: hidden;
}

.title {
    height: 70px;
    width: 100%;
    background: #141416;
    padding: 0 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.title h3 {
    font-weight: 500;
    font-size: 16px;
    color: var(--tx-normal);
}

.title div {
    display: flex;
    align-items: center;
    gap: 20px;
}

.title .close {
    width: 30px;
    height: 30px;
    background: var(--bg-darker);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}


.overflow {
    overflow-y: auto;
    max-height: 60vh;
}

.box_grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-bottom: 1px solid var(--bg);
}

.box_grid>div {
    padding: 30px;
}

.box_grid img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
}

.box_grid>div:first-child {
    border-right: 1px solid var(--bg);
}

.box_grid .box_grid_item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
}


.box_grid:nth-child(1)>div:last-child {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.box_grid .images {
    display: flex;
    align-items: center;
}

.box_grid .images img {
    margin-left: -8px;
}

.box_grid .images img:first-child {
    margin: 0;
}

.box_grid:nth-child(2)>div {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.box_grid svg {
    width: 24px;
    height: 24px;
}

.box_grid .box_grid_item p {
    font-size: 20px;
    color: var(--tx-normal);
}

.label {
    font-size: 14px;
    color: var(--tx-dimmed);
}

.input {
    margin: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--bg-darkest);
}

.input input {
    background: none;
    font-size: 24px;
    outline: none;
    border: none;
    color: var(--tx-normal);
}

.balance {
    font-size: 12px;
    color: var(--tx-dimmed);
    cursor: pointer;
}

.dropdown {
    position: relative;
}

.dropdown .tokens {
    position: absolute;
    z-index: 10;
    bottom: 0;
    right: 0;
    border-radius: 4px 4px 0 0;
    overflow: auto;
}

.token {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    border-radius: 4px 4px 0 0;
    background: var(--bg-darkest);
    padding: 0 10px;
    cursor: pointer;
}

.tokens .token {
    border-radius: 0;
}

.token p {
    font-size: 14px;
    color: var(--tx-normal);
}

.token img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
}

.action {
    padding: 30px;
    background-image: url('/images/subtle_gradient.png');
    background-color: var(--bg-darker);
}

.action button {
    border: none;
    cursor: pointer;
    height: 40px;
    padding: 0 20px;
    border-radius: 4px;
    font-weight: 500;
    width: 100%;
    font-size: 16px;
    background: var(--primary);
    color: var(--tx-normal);
}

.action button:disabled {
    opacity: 0.2;
    cursor: not-allowed;
}
</style>