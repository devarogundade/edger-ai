<script setup lang="ts">
import BubbleIcon from '@/components/icons/BubbleIcon.vue';
import OutIcon from '@/components/icons/OutIcon.vue';
import { explorerUrl } from '@/scripts/constants';
import Converter from '@/scripts/converter';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
    activities: {
        type: Object, required: true
    }
});
</script>

<template>
    <div class="main">
        <div class="table_head">
            <div class="title">
                <p>Actvities</p>
                <span>{{ props.activities.length }}</span>
            </div>
            <RouterLink :to="`/chat?agent=${route.params.id}`">
                <div class="chat">
                    <BubbleIcon :color="'var(--tx-semi)'" />
                    <P>Chat</P>
                </div>
            </RouterLink>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <td>Initiator</td>
                    <td>Action</td>
                    <td>Timestamp</td>
                    <td></td>
                </tr>
            </thead>
            <tbody v-for="activity, index in props.activities" :key="index">
                <tr>
                    <td>
                        <div>
                            <div class="img"><img src="/images/bot.png" /></div>
                            <p>{{ Converter.fineAddress(activity.initiator, 4) }}</p>
                        </div>
                    </td>
                    <td>
                        <div>
                            <p>{{ activity.action }}</p>
                        </div>
                    </td>
                    <td>
                        <div>
                            <p>{{ Converter.fullMonth(new Date(activity.timestamp)) }}</p>
                        </div>
                    </td>
                    <td>
                        <a v-if="activity.tx_hash" target="_blank" :href="`${explorerUrl}/tx/${activity.tx_hash}`">
                            <div class="link">
                                <p>View Txn</p>
                                <OutIcon />
                            </div>
                        </a>
                    </td>
                </tr>
            </tbody>

            <div class="t_empty" v-if="activities.length == 0">
                <img src="/images/empty.png" alt="">
                <p>No activity.</p>
            </div>
        </table>
    </div>
</template>

<style scoped>
.table_head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    border-bottom: 1px solid var(--bg-darkest);
}


.table_head .title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.table_head .title p {
    font-size: 16px;
    color: var(--tx-normal);
}

.chat {
    height: 40px;
    background: var(--bg-dark);
    border-radius: 4px 4px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 20px;
    cursor: pointer;
}

.chat p {
    font-size: 14px;
    color: var(--tx-normal);
}

.table_head .title span {
    padding: 3px 8px;
    background: var(--bg-darker);
    border-radius: 2px;
    font-size: 12px;
    color: var(--tx-normal);
}

.table {
    width: 100%;
    table-layout: fixed;
}

.table td {
    width: calc(100% / 4);
}

.table thead {
    height: 50px;
    width: 100%;
    display: table;
}

.table thead td {
    color: var(--tx-dimmed);
    font-weight: 500;
    font-size: 14px;
}

.table tbody {
    width: 100%;
    display: table;
    border-top: 1px solid var(--bg-darkest);
}


.table tbody td {
    height: 70px;
}

.table tbody td div {
    display: flex;
    align-items: center;
    gap: 8px;
}

.table tbody td span {
    color: var(--tx-dimmed);
}

.table tbody p {
    font-weight: 400;
    font-size: 14px;
    color: var(--tx-normal);
    margin-top: 2px;
}

.table tbody td .img {
    width: 20px;
    height: 20px;
    background: var(--bg-dark);
    border-radius: 50%;
}

.table tbody td img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
}

.table tbody .photo {
    width: 24px;
    height: 24px;
}

.link {
    justify-content: center !important;
}

.link p {
    color: var(--tx-dimmed) !important;
}

.link svg {
    width: 14px;
    height: 14px;
}

.t_empty {
    width: 100%;
    height: 298px;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
    justify-content: center;
}

.t_empty p {
    font-weight: 400;
    font-size: 14px;
    color: var(--tx-dimmed);
}
</style>