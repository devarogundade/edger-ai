<script setup lang="ts">
import LogoutIcon from '@/components/icons/LogoutIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import NotificationIcon from '@/components/icons/NotificationIcon.vue';
import OutIcon from '@/components/icons/OutIcon.vue';
import WalletIcon from '@/components/icons/WalletIcon.vue';
import BalSymbolIcon from '@/components/icons/BalSymbolIcon.vue';
import { useWalletStore } from '@/stores/wallet';
import Converter from '@/scripts/converter';
import { ref, watch } from 'vue';
import { getUserSBalance } from '@/scripts/token';
import { formatEther } from 'viem';

const profile = ref(false);
const walletStore = useWalletStore();

const logout = async () => { };

watch(profile, async () => {
    if (walletStore.address) {
        const balance = await getUserSBalance(walletStore.address);
        walletStore.setSBalance(Number(formatEther(balance)));
    }
});
</script>

<template>
    <section>
        <div class="app_width">
            <header>
                <div class="logo"></div>

                <div class="tabs">
                    <RouterLink to="/">Home</RouterLink>
                    <a href="https://dorahacks.io/buidl/22277" target="_blank">DoraHacks
                        <OutIcon />
                    </a>
                    <a href="https://github.com/devarogundade/edger-ai" target="_blank">GitHub
                        <OutIcon />
                    </a>
                </div>

                <div class="connect">
                    <div class="notifications_btn" v-if="walletStore.address">
                        <NotificationIcon />
                    </div>

                    <RouterLink to="/signin" v-if="!walletStore.address">
                        <button>
                            <WalletIcon />
                            <p>Connect Wallet</p>
                        </button>
                    </RouterLink>

                    <button v-if="walletStore.address" @click="profile = !profile">
                        <img src="/images/wallet_connect.png" />
                        <p>{{ Converter.fineAddress(walletStore.address, 5) }}</p>

                        <div class="profile" v-show="profile">
                            <img src="/images/user.png" alt="">
                            <div class="profile_name">
                                <p>{{ Converter.fineAddress(walletStore.address, 5) }}</p>
                                <p>
                                    <BalSymbolIcon />
                                    <span>
                                        {{ Converter.toMoney(walletStore.sBalance) }}
                                    </span>
                                    S
                                </p>
                            </div>
                            <div class="log_out" @click="logout">
                                <LogoutIcon />
                            </div>
                        </div>
                    </button>

                    <RouterLink to="/portfolio" v-if="walletStore.address">
                        <div class="settings_btn">
                            <SettingsIcon />
                        </div>
                    </RouterLink>
                </div>
            </header>
        </div>
    </section>
</template>

<style scoped>
section {
    position: fixed;
    top: 0;
    border-bottom: 1px solid var(--bg-darkest);
    z-index: 5;
}

header {
    height: 90px;
    display: grid;
    grid-template-columns: 200px auto 320px;
    align-items: center;
    background: var(--bg);
    padding-right: 45px;
}

.tabs {
    display: flex;
    align-items: center;
    gap: 50px;
    padding: 0 100px;
}

.tabs a {
    color: var(--tx-dimmed);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
}

.tabs a:hover {
    color: var(--tx-normal);
}

.connect {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
}

.connect button {
    background: var(--bg);
    border: 1px solid var(--bg-darkest);
    width: 185px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    user-select: none;
    cursor: pointer;
    position: relative;
}

.connect button p {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-normal);
}

.connect button img {
    width: 18px;
    height: 18px;
}

.notifications_btn,
.settings_btn {
    background: var(--bg-dark);
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: pointer;
}

.profile {
    padding: 16px 20px;
    border-radius: 6px;
    background: var(--bg-dark);
    border: 1px solid var(--bg-darkest);
    display: flex;
    align-items: center;
    gap: 18px;
    position: absolute;
    right: -60px;
    top: 80px;
    z-index: 100;
}

.profile img {
    width: 38px !important;
    height: 38px !important;
    border-radius: 4px;
    object-fit: cover;
}

.profile_name p {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-normal);
    width: 170px;
    text-align: left;
}

.profile_name p:last-child {
    color: var(--tx-dimmed);
    display: flex;
    align-items: center;
    gap: 4px;
}

.profile_name p span {
    color: var(--tx-semi);
}

.log_out {
    width: 32px;
    height: 32px;
    background: var(--bg);
    border-radius: 4px;
    border: 1px solid var(--bg-darker);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
</style>