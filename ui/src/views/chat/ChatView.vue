<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import type { AgentJson, Chat } from '@/scripts/types';
import type { Hex } from 'viem';
import Client from '@/scripts/client';
import ProgressBox from '@/components/ProgressBox.vue';
import Converter from '@/scripts/converter';
import { useWalletStore } from '@/stores/wallet';
import { notify } from '@/reactives/notify';

const route = useRoute();
const walletStore = useWalletStore();

const prompt = ref('');
const loading = ref(true);
const sending = ref(false);
const chats = ref<Chat[]>([]);
const agent = ref<AgentJson | null>(null);

const router = useRouter();

const getAgent = async (strategyAddress: Hex) => {
    loading.value = true;
    agent.value = await Client.getAgent(strategyAddress);
    loading.value = false;

    getChats();
};

const getChats = async () => {
    if (!agent.value) return;
    if (!walletStore.address) return;

    chats.value = await Client.chats(
        agent.value.strategy_address,
        walletStore.address
    );
};

const chat = async () => {
    if (!agent.value) return;
    if (sending.value) return;

    if (!walletStore.address) {
        return notify.push({
            title: "Error",
            description: "Connect your wallet!",
            category: "error"
        });
    }

    if (prompt.value.length == 0) {
        return notify.push({
            title: "Error",
            description: "Invalid message!",
            category: "error"
        });
    }

    chats.value.push({
        sender: walletStore.address,
        text: prompt.value,
        timestamp: new Date().getTime(),
        receiver: agent.value.strategy_address
    });

    const sent = await Client.chatAgent(
        agent.value.strategy_address,
        walletStore.address,
        prompt.value
    );

    if (sent) {
        prompt.value = "";
        getChats();
    } else {
        notify.push({
            title: "Error",
            description: "Message not sent!",
            category: "error"
        });
    }

    sending.value = false;
};

const enteredStrategyAddress = ref('');

const startChat = () => {
    if (enteredStrategyAddress.value.length == 0) {
        return notify.push({
            title: "Error",
            description: "Enter a valid strategy address!",
            category: "error"
        });
    }

    router.push({
        path: '/chat',
        query: {
            agent: enteredStrategyAddress.value
        }
    });
};

const strategyAddress = computed(() => route.query.agent);

onMounted(() => {
    if (!strategyAddress.value) {
        loading.value = false;
        return;
    }

    getAgent(strategyAddress.value as Hex);
});
</script>

<template>
    <div class="load_frame" v-if="loading">
        <ProgressBox />
    </div>

    <div class="enter_agent" v-else-if="!strategyAddress">
        <div class="input">
            <input type="text" placeholder="Paste strategy address" v-model="enteredStrategyAddress">
            <button @click="startChat">Start Chat</button>
        </div>
    </div>

    <div class="chat_container" v-if="agent">
        <div class="chat">
            <div class="chat_header">
                <div class="chat_header_left">
                    <div class="chat_header_img">
                        <img src="/images/bot.png" alt="">
                    </div>
                    <div class="chat_header_name">
                        <p>{{ Converter.fineAddress(agent.strategy_address, 8) }}</p>
                        <p v-if="agent.state == 'running'">Online</p>
                        <p v-else>Offline</p>
                    </div>
                </div>
                <div class="chat_header_right">
                    <div class="chat_header_icons">
                        <div>
                            <IconSearch />
                        </div>
                        <div>
                            <IconMore />
                        </div>
                    </div>
                </div>
            </div>
            <div class="chat_body">
                <div :class="chat.sender.toLowerCase() == walletStore.address?.toLowerCase() ? 'chat_message chat_message_2' : 'chat_message'"
                    v-for="chat, index in chats" :key="index">
                    <div class="chat_message_left">
                        <div class="chat_message_img">
                            <img v-if="chat.sender.toLowerCase() == walletStore.address?.toLowerCase()"
                                src="/images/user.png" alt="">
                            <img v-else src="/images/bot.png" alt="">
                        </div>
                        <div class="chat_message_text">
                            <p v-if="chat.text">{{ chat.text }}</p>
                            <p v-else>No response, I might not be online.</p>

                            <span class="chat_message_date">
                                <p>{{ Converter.fullMonth(new Date(chat.timestamp)) }}</p>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chat_send">
                <input type="text" placeholder="Write a message" v-model="prompt">
                <button @click="chat">{{ sending ? 'Sending..' : 'Send' }}</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.enter_agent {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
}

.enter_agent .input {
    display: grid;
    grid-template-columns: 1fr 100px;
    width: 500px;
    max-width: 100%;
    align-items: center;
    border: 1px solid var(--bg-darkest);
    border-radius: 16px;
    overflow: hidden;
    padding: 10px;
}

.input input {
    height: 40px;
    background: none;
    outline: none;
    border: none;
    color: var(--tx-normal);
    font-size: 14px;
    padding: 0 10px;
}

.input input::placeholder {
    color: var(--tx-dimmed);
}

.input button {
    border: none;
    cursor: pointer;
    height: 40px;
    border-radius: 4px;
    font-size: 14px;
    background: var(--primary);
    color: var(--tx-normal);
}

.chat_container {
    display: flex;
    justify-content: center;
}

.chat {
    width: 800px;
}

.chat_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--bg-darkest);
    height: 70px;
    position: sticky;
    top: 0;
}

.chat_header_left {
    display: flex;
    align-items: center;
}

.chat_header_img img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.chat_header_name {
    margin-left: 10px;
    color: var(--tx-dimmed);
}

.chat_header_name p {
    margin: 0;
    font-size: 14px;
}

.chat_header_right {
    display: flex;
    align-items: center;
}

.chat_header_icons div {
    margin-left: 10px;
}

.chat_body {
    padding: 20px 0;
    overflow: auto;
    height: calc(100vh - 310px);
}

.chat_body::-webkit-scrollbar {
    display: none;
}

.chat_message {
    display: flex;
    margin-bottom: 20px;
    gap: 10px;
}

.chat_message_2 {
    flex-direction: row-reverse;
}

.chat_message_left {
    display: flex;
    align-items: flex-end;
    gap: 10px;
}

.chat_message_2 .chat_message_left {
    flex-direction: row-reverse;
}

.chat_message_img img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

.chat_message_text {
    background-color: var(--bg-dark);
    padding: 10px;
    border-radius: 10px;
    font-size: 16px;
    line-height: 26px;
    color: var(--tx-dimmed);
    min-width: 120px;
    max-width: 600px;
}

.chat_message_date {
    font-size: 10px;
    color: var(--primary-light);
}

.chat_send {
    display: grid;
    border-top: 1px solid var(--bg-darkest);
    grid-template-columns: 1fr 100px;
    padding: 10px;
    gap: 10px;
}

.chat_send input {
    background: transparent;
    border: none;
    outline: none;
    font-weight: 500;
    font-size: 16px;
    color: var(--tx-normal);
}

input::placeholder {
    color: var(--tx-semi);
}

.chat_send button {
    background: var(--primary);
    border: none;
    outline: none;
    height: 30px;
    padding: 0 10px;
    border-radius: 4px;
    font-size: 12px;
    color: var(--tx-normal);
    cursor: pointer;
}
</style>