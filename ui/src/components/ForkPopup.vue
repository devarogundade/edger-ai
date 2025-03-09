<script setup lang="ts">
import Converter from '@/scripts/converter';
import CloseIcon from './icons/CloseIcon.vue';
import { ref } from 'vue';
import { FactoryContract } from '@/scripts/contract';
import { useRouter } from 'vue-router';
import Client from '@/scripts/client';
import { type AgentJson } from '@/scripts/types';
import { notify } from '@/reactives/notify';
import { useWalletStore } from '@/stores/wallet';
import { parseEther } from 'viem';
import { explorerUrl } from '@/scripts/constants';

const emit = defineEmits([
    'close'
]);

const props = defineProps({
    fork: { type: Object, required: true }
});

const terms = ref(false);
const router = useRouter();
const forking = ref(false);
const walletStore = useWalletStore();

const fork = async () => {
    if (forking.value) return;
    if (!walletStore.address) return;
    if (!terms.value) {
        return notify.push({
            title: 'Validation',
            description: 'Must agree to terms and condtions',
            category: 'error'
        });
    }

    forking.value = true;

    const { txHash, forkAddress } = await FactoryContract.forkStrategy(
        props.fork.strategy_address,
        parseEther(props.fork.fork_cost.toString())
    );

    if (txHash && forkAddress) {
        props.fork.base_strategy_address = props.fork.strategy_address;
        props.fork.strategy_address = forkAddress;
        props.fork.visibility = "private";
        props.fork.creator = walletStore.address;
        props.fork.fork_cost = 0;

        await Client.createAgent(props.fork as AgentJson);

        notify.push({
            title: "Success",
            description: "Fork done.",
            category: "success",
            linkTitle: "View Trx",
            linkUrl: `${explorerUrl}/tx/${txHash}`
        });

        router.push('/me');
    } else {
        notify.push({
            title: "Error",
            description: "Fork failed!",
            category: "error"
        });
    }

    forking.value = false;
};
</script>

<template>
    <main>
        <div class="box">
            <div class="title">
                <h3>Fork Strategy</h3>
                <div class="close" v-on:click="emit('close')">
                    <CloseIcon />
                </div>
            </div>

            <div>
                <p>Cost</p>
                <div>
                    <p>{{ Converter.toMoney(props.fork.fork_cost) }}</p>
                    <div>
                        <img :src="`/images/sonic.png`" alt="">
                    </div>
                </div>
            </div>

            <div class="terms">
                <div class="terms_item">
                    <input type="checkbox" v-model="terms">
                    <p>Read and Agreed to our <a href="" target="_blank">Terms & Policy?</a></p>
                </div>
            </div>

            <div class="action">
                <button @click="fork">{{ forking ? 'Forking' : 'Fork' }}</button>
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

.terms {
    margin: 0 30px;
    margin-bottom: 30px;
}

.terms_item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.terms_item p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-dimmed);
}

.terms_item a {
    color: var(--primary);
    border-bottom: 1px var(--primary) solid;
}

.box>div:nth-child(5) {
    width: 100%;
    padding: 30px;
    background-image: url('/images/subtle_gradient.png');
    background-size: cover;
    background-repeat: no-repeat;
}

.click_1 {
    position: relative;
    cursor: pointer;
    user-select: none;
}

.drop_down {
    position: absolute;
    top: 50px;
    width: 100%;
    z-index: 4;
    background: var(--bg-darker);
    border-radius: 4px;
}

.drop_item {
    height: 50px;
    padding: 0 20px;
    display: flex;
    gap: 8px;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid var(--bg-darkest);
}

.drop_item:first-child {
    border-top: 1px solid var(--bg-darkest);
}

.drop_item:last-child {
    border: none;
}

.drop_down img {
    width: 24px;
    height: 24px;
}

.drop_item p {
    font-weight: 400;
    font-size: 14px;
    color: var(--tx-normal);
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
