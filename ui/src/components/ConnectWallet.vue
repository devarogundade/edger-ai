<script setup lang="ts">
import AirdropIcon from './icons/AirdropIcon.vue';
</script>

<template>
    <div class="no_channel_container">
        <div class="no_channel">
            <AirdropIcon :color="'var(--tx-normal)'" />
            <h3>You are not connected</h3>
            <p>You have to signin with your Web3 wallet.</p>
            <RouterLink to="/signin">
                <button>Connect Wallet</button>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.no_channel_container {
    display: flex;
    margin-top: 60px;
    justify-content: center;
}

.no_channel {
    display: flex;
    width: 450px;
    text-align: center;
    align-items: center;
    flex-direction: column;
}

.no_channel svg {
    width: 40px;
    height: 40px;
}

.no_channel h3 {
    margin-top: 20px;
    font-size: 20px;
    font-weight: 600;
    color: var(--tx-normal);
}

.no_channel p {
    font-size: 16px;
    font-weight: 500;
    color: var(--tx-dimmed);
    margin-top: 10px;
}

.no_channel button {
    margin-top: 40px;
    width: 165px;
    height: 40px;
    gap: 12px;
    border-radius: 6px;
    background: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    color: var(--tx-normal);
    cursor: pointer;
}
</style>