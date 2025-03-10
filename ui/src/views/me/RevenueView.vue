<script setup lang="ts">
import CoinsIcon from '@/components/icons/CoinsIcon.vue';
import { notify } from '@/reactives/notify';
import { useWalletStore } from '@/stores/wallet';
import ProgressBox from '@/components/ProgressBox.vue';
import { onMounted, ref } from "vue";
import type { Revenue, RevenuePrice } from '@/scripts/types';
import { RevenueContract, PriceOracleContract } from '@/scripts/contract';
import { SONIC_COIN, explorerUrl } from '@/scripts/constants';
import Converter from '@/scripts/converter';
import { formatEther, formatUnits } from 'viem';
import ClaimPopup from '@/components/ClaimPopup.vue';

const claim = ref(false);
const loading = ref(false);
const walletStore = useWalletStore();
const revenue = ref<Revenue | null>(null);
const revenuePrice = ref<RevenuePrice | null>(null);

const getRevenue = async (load: boolean = false) => {
    if (!walletStore.address) return;

    loading.value = load;

    revenue.value = await RevenueContract.balanceOf(
        walletStore.address
    );

    const claimedInUsd = await PriceOracleContract.getAmountOutInUsd(
        revenue.value.claimed,
        SONIC_COIN,
    );

    const unClaimedInUsd = await PriceOracleContract.getAmountOutInUsd(
        revenue.value.unClaimed,
        SONIC_COIN
    );

    revenuePrice.value = {
        claimedInUsd: Number(formatUnits(claimedInUsd, 18 + 8)),
        unClaimedInUsd: Number(formatUnits(unClaimedInUsd, 18 + 8)),
    };

    loading.value = false;
};

onMounted(() => {
    getRevenue(true);
});
</script>

<template>
    <div class="load_frame" v-if="loading">
        <ProgressBox />
    </div>

    <div class="revenue_container" v-else-if="revenue && revenuePrice">
        <div class="revenue">
            <div class="revenue_title">
                <p>Total Revenue</p>
                <h3>{{ Converter.toMoney(Number(formatEther(revenue.claimed + revenue.unClaimed))) }} S</h3>
            </div>
            <div class="revenue_amounts">
                <div class="revenue_amount">
                    <div class="revenue_amount_name">
                        <div class="revenue_amount_name_text">
                            <img src="/images/sonic.png" alt="sonic">
                            <p><span>{{ Converter.toMoney(Number(formatEther(revenue.unClaimed))) }}</span> S ~ ${{
                                Converter.toMoney(revenuePrice.unClaimedInUsd) }}</p>
                        </div>

                        <div class="revenue_amount_percent">
                            {{
                                ((Number(formatEther(revenue.unClaimed)) /
                                    Number(formatEther(revenue.claimed + revenue.unClaimed))) * 100).toFixed(2)
                            }}% Unclaimed
                        </div>
                    </div>
                    <div class="revenue_amount_progress">
                        <div class="revenue_amount_bar"
                            :style="`width: ${(Number(formatEther(revenue.unClaimed)) / Number(formatEther(revenue.claimed + revenue.unClaimed))) * 100}%;`">
                        </div>
                        <div class="revenue_amount_bar_dot"
                            :style="`left: ${(Number(formatEther(revenue.unClaimed)) / Number(formatEther(revenue.claimed + revenue.unClaimed))) * 100}%;`">
                        </div>
                    </div>
                </div>

                <div class="revenue_amount">
                    <div class="revenue_amount_name">
                        <div class="revenue_amount_name_text">
                            <img src="/images/sonic.png" alt="sonic">
                            <p><span>{{ Converter.toMoney(Number(formatEther(revenue.claimed))) }}</span> S ~ ${{
                                Converter.toMoney(revenuePrice.claimedInUsd) }}</p>
                        </div>

                        <div class="revenue_amount_percent">
                            {{
                                ((Number(formatEther(revenue.claimed)) /
                                    Number(formatEther(revenue.claimed + revenue.unClaimed))) * 100).toFixed(2)
                            }}% Claimed
                        </div>
                    </div>
                    <div class="revenue_amount_progress">
                        <div class="revenue_amount_bar"
                            :style="`width: ${(Number(formatEther(revenue.claimed)) / Number(formatEther(revenue.claimed + revenue.unClaimed))) * 100}%;`">
                            >
                        </div>
                        <div class="revenue_amount_bar_dot"
                            :style="`left: ${(Number(formatEther(revenue.claimed)) / Number(formatEther(revenue.claimed + revenue.unClaimed))) * 100}%;`">
                        </div>
                    </div>
                </div>
            </div>
            <div class="revenue_claim">
                <div class="revenue_claim_text">
                    <p>Total Revenue in USD</p>
                    <div class="revenue_claim_balance">
                        <div class="revenue_claim_balance_images">
                            <img src="/images/sonic.png" alt="sonic">
                        </div>
                        <p>~ ${{ Converter.toMoney(revenuePrice.claimedInUsd +
                            revenuePrice.unClaimedInUsd) }}</p>
                    </div>
                </div>

                <button class="revenue_claim_btn" @click="claim = true">
                    <CoinsIcon /> Claim
                </button>
            </div>
        </div>

        <ClaimPopup v-if="claim" :un-claimed="Number(formatEther(revenue.unClaimed))" @refresh="getRevenue"
            @close="claim = false" />
    </div>
</template>

<style scoped>
.revenue_container {
    padding: 40px;
}

.revenue {
    max-width: 100%;
    border-radius: 8px;
    background: var(--bg-dark);
    overflow: hidden;
}

.revenue_title {
    padding: 24px 30px;
    border-bottom: 2px solid var(--bg);
}

.revenue_title p {
    font-size: 12px;
    font-weight: 500;
    color: var(--tx-dimmed);
}

.revenue_title h3 {
    margin-top: 14px;
    font-size: 20px;
    line-height: 20px;
    font-weight: 600;
    color: var(--tx-normal);
}

.revenue_amount {
    padding: 24px 30px;
    border-bottom: 2px solid var(--bg);
}

.revenue_amount:first-child {
    border-bottom: 2px solid var(--bg);
}

.revenue_amount_name {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.revenue_amount_name img {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    object-fit: cover;
}

.revenue_amount_name_text {
    display: flex;
    align-items: center;
    gap: 10px;
}

.revenue_amount_name_text p {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-dimmed);
}

.revenue_amount_name_text p span {
    color: var(--tx-normal);
}

.revenue_amount_percent {
    font-size: 12px;
    font-weight: 500;
    color: var(--tx-normal);
}

.revenue_amount_progress {
    margin-top: 16px;
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: var(--bg-darkest);
}

.revenue_amount_bar {
    height: 100%;
    border-radius: 2px;
    background: var(--primary-light);
    width: 0%;
}

.revenue_amount_bar_dot {
    width: 14px;
    height: 14px;
    border-radius: 5px;
    background: var(--primary-light);
    border: 4px solid var(--primary);
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
}

.revenue_claim {
    padding: 24px 30px;
    border-bottom: 2px solid var(--bg);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.revenue_claim_text>p {
    font-size: 12px;
    line-height: 12px;
    font-weight: 500;
    color: var(--tx-dimmed);
}

.revenue_claim_balance {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.revenue_claim_balance_images {
    display: flex;
    align-items: center;
}

.revenue_claim_balance_images img {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    object-fit: cover;
}

.revenue_claim_balance>p {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-normal);
}

.revenue_claim_btn {
    background: var(--primary-light);
    width: 113px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    gap: 10px;
    border: none;
    cursor: pointer;
    user-select: none;
}
</style>