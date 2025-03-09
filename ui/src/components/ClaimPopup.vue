<script setup lang="ts">
import Converter from '@/scripts/converter';
import CloseIcon from './icons/CloseIcon.vue';
import { ref } from 'vue';
import { RevenueContract } from '@/scripts/contract';
import { useRouter } from 'vue-router';
import { notify } from '@/reactives/notify';
import { useWalletStore } from '@/stores/wallet';
import { parseEther } from 'viem';
import { explorerUrl } from '@/scripts/constants';

const emit = defineEmits([
    'close', 'refresh'
]);

const props = defineProps({
    unClaimed: { type: Number, required: true }
});

const amount = ref(0);
const claiming = ref(false);
const walletStore = useWalletStore();

const claim = async () => {
    if (claiming.value) return;
    if (!props.unClaimed) return;
    if (!walletStore.address) return;

    if (amount.value == 0) {
        return notify.push({
            title: 'Validation',
            description: 'Enter a valid amount.',
            category: 'error'
        });
    }

    if (amount.value > props.unClaimed) {
        return notify.push({
            title: 'Validation',
            description: 'Amount is too much than your balance.',
            category: 'error'
        });
    }

    claiming.value = true;

    const txHash = await RevenueContract.withdraw(
        parseEther(amount.value.toString())
    );

    if (txHash) {
        notify.push({
            title: 'Revenue claimed',
            description: 'Transaction sent',
            category: 'success',
            linkTitle: 'View Trx',
            linkUrl: `${explorerUrl}/tx/${txHash}`
        });

        emit('refresh');
    } else {
        notify.push({
            title: 'Error',
            description: "Try again!",
            category: 'error'
        });
    }

    claiming.value = false;
};
</script>

<template>
    <main>
        <div class="box">
            <div class="title">
                <h3>Claim Revenue</h3>
                <div class="close" v-on:click="emit('close')">
                    <CloseIcon />
                </div>
            </div>

            <div>
                <p>Unclaimed ~ Bal: {{ Converter.toMoney(props.unClaimed) }}S</p>

                <div class="input">
                    <input type="number" v-model="amount" placeholder="0.00">


                    <div>
                        <img :src="`/images/sonic.png`" alt="">
                    </div>
                </div>
            </div>

            <div class="action">
                <button @click="claim">{{ claiming ? 'Claiming' : 'Claim' }}</button>
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
    background: var(--bg);
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
    width: 30px;
    height: 30px;
    background: var(--bg-darker);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.box>div:nth-child(2) {
    margin: 0 30px;
    padding-top: 30px;
    margin-bottom: 40px;
    border-bottom: 1px solid var(--bg-darkest);
}

.box>div:nth-child(2)>p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-dimmed);
}

.box>div:nth-child(2)>div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
}

.box>div:nth-child(2)>div>div {
    height: 50px;
    padding: 0 20px;
    background: var(--bg-darker);
    border-radius: 4px 4px 0px 0px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
}

.box>div:nth-child(2)>div:nth-child(2) img {
    width: 24px;
    height: 24px;
}

.box>div:nth-child(2)>div p:first-child {
    font-weight: 500;
    font-size: 20px;
    color: var(--tx-normal);
}

.box>div:nth-child(2)>div>div>p {
    font-weight: 400;
    font-size: 14px;
    color: var(--tx-normal);
}

.box>div:nth-child(5) {
    width: 100%;
    padding: 30px;
    background-image: url('/images/subtle_gradient.png');
    background-size: cover;
    background-repeat: no-repeat;
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
    background: var(--primary-light);
    color: var(--bg);
}
</style>
