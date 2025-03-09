<script setup lang="ts">
import MinusIcon from '@/components/icons/MinusIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import UserAddIcon from '@/components/icons/UserAddIcon.vue';
import Switch from '@/components/Switch.vue';
import { notify } from '@/reactives/notify';
import Client from '@/scripts/client';
import { tokens, llms, sample, explorerUrl } from '@/scripts/constants';
import { FactoryContract } from '@/scripts/contract';
import Converter from '@/scripts/converter';
import { type AgentJson, Visibility, ActionCall, type Token, type LLM } from '@/scripts/types';
import { useWalletStore } from '@/stores/wallet';
import { parseEther } from 'viem';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const walletStore = useWalletStore();

const agent = ref<AgentJson>(sample);
const jsonPreview = ref(true);
const bio = ref<string>('');
const traits = ref<string>('');
const swapToSingle = ref<string>('');
const swapToMany = ref<string>('');
const adjustSplitRatio = ref<string>('');
const none = ref<string>('');
const discordServer = ref<string>('');
const llmApiKey = ref<string>('');
const creating = ref(false);
const example_accounts = ref<string>('');
const example_channels = ref<string>('');

const router = useRouter();

const onTaskConfigChanged = (event: any, index: number) => {
    agent.value.tasks[index].config = event.target.value;

    if (agent.value.tasks[index].config == 'twitter') {
        agent.value.tasks[index].name = 'read-timeline';
    } else {
        agent.value.tasks[index].name = 'read-messages';
    }
};

const create = async () => {
    if (creating.value) return;

    if (agent.value.minimum_deposit <= 0) {
        return notify.push({
            title: 'Validation',
            description: "Minimum deposit USD cannot be zero.",
            category: "error"
        });
    }

    if (agent.value.tokens.length == 0) {
        return notify.push({
            title: 'Validation',
            description: "Strategy tokens cannot be empty.",
            category: "error"
        });
    }

    if (agent.value.tasks.length == 0) {
        return notify.push({
            title: 'Validation',
            description: "Tasks cannot be empty.",
            category: "error"
        });
    }

    if (
        agent.value.strategies.swap_to_single.join('').length == 0
        && agent.value.strategies.swap_to_many.join('').length == 0
        && agent.value.strategies.adjust_split_ratio.join('').length == 0
    ) {
        return notify.push({
            title: 'Validation',
            description: "Strategy needs at least one allowed action.",
            category: "error"
        });
    }

    if (agent.value.bio.join('').length <= 20) {
        return notify.push({
            title: 'Validation',
            description: "Strategy AI agent bio is too short.",
            category: "error"
        });
    }

    if (agent.value.traits.join('').length <= 2) {
        return notify.push({
            title: 'Validation',
            description: "Strategy AI agent traits are too short.",
            category: "error"
        });
    }

    if (agent.value.visibility == 'private') {
        agent.value.fork_cost = 0;
    }

    const actions: ActionCall[] = [];

    if (agent.value.strategies.swap_to_single.length > 0) {
        actions.push(ActionCall.SwapToSingle);
    }

    if (agent.value.strategies.swap_to_many.length > 0) {
        actions.push(ActionCall.SwapToMany);
    }

    if (agent.value.strategies.adjust_split_ratio.length > 0) {
        actions.push(ActionCall.AdjustSplitRatio);
    }

    creating.value = true;

    const { txHash, strategyAddress } = await FactoryContract.createStrategy(
        agent.value.tokens,
        Converter.splitNumber(10000, agent.value.tokens.length),
        agent.value.visibility == 'public' ? Visibility.Public : Visibility.Private,
        parseEther(agent.value.minimum_deposit.toString()),
        parseEther(agent.value.fork_cost.toString()),
        actions
    );

    if (txHash && strategyAddress) {
        agent.value.strategy_address = strategyAddress;

        await Client.createAgent(agent.value);

        notify.push({
            title: "Success",
            description: "Creation done.",
            category: "success",
            linkTitle: "View Trx",
            linkUrl: `${explorerUrl}/tx/${txHash}`
        });

        router.push('/me');
    } else {
        notify.push({
            title: "Error",
            description: "Creation failed!",
            category: "error"
        });
    }

    creating.value = false;
};

const addTask = () => {
    if (agent.value.tasks.length >= 2) {
        return;
    }

    agent.value.tasks.push({
        config: 'discord',
        name: 'read-messages',
        weight: 1
    });
};

const selectToken = (token: Token) => {
    if (agent.value.tokens.includes(token.address)) {
        const index = agent.value.tokens.findIndex(t => t == token.address);
        if (index >= 0) agent.value.tokens.splice(index, 1);
    } else {
        agent.value.tokens.push(token.address);
    }
};

const changeVisibility = () => {
    if (agent.value.visibility == 'private') {
        agent.value.visibility = 'public';
    } else {
        agent.value.visibility = 'private';
        agent.value.fork_cost = 0;
    }
};

const initFields = () => {
    const index = agent.value.config.findIndex(
        c => c.name == "discord"
    );
    const server = agent.value.config[index].server_id;
    if (server) discordServer.value = server;

    const aindex = agent.value.config.findIndex(
        c => c.is_llm
    );

    const apikey = agent.value.config[aindex].api_key;
    if (apikey) llmApiKey.value = apikey;

    bio.value = agent.value.bio.join('\n');
    traits.value = agent.value.traits.join(',');
    swapToSingle.value = agent.value.strategies.swap_to_single.join('\n');
    swapToMany.value = agent.value.strategies.swap_to_many.join('\n');
    adjustSplitRatio.value = agent.value.strategies.adjust_split_ratio.join('\n');
    none.value = agent.value.strategies.none.join('\n');

    if (walletStore.address) {
        agent.value.creator = walletStore.address;
    }

    example_accounts.value = agent.value.example_accounts.join(',');
    example_channels.value = agent.value.example_channels.join(',');
};

const updateBio = (bio: string) => {
    agent.value.bio = bio.split('\n');
};

const updateTraits = (traits: string) => {
    agent.value.traits = traits.split(',');
};

const updateSwapToSingle = (swapToSingle: string) => {
    agent.value.strategies.swap_to_single = swapToSingle.split('\n');
};

const updateSwapToMany = (swapToMany: string) => {
    agent.value.strategies.swap_to_many = swapToMany.split('\n');
};

const updateAdjustSplitRatio = (adjustSplitRatio: string) => {
    agent.value.strategies.adjust_split_ratio = adjustSplitRatio.split('\n');
};

const updateNone = (none: string) => {
    agent.value.strategies.none = none.split('\n');
};

const updateServerId = (server: string) => {
    const index = agent.value.config.findIndex(
        c => c.name == "discord"
    );
    agent.value.config[index].server_id = server;
};

const updateApiKey = (apikey: string) => {
    const index = agent.value.config.findIndex(
        c => c.is_llm
    );
    agent.value.config[index].api_key = apikey;
};

const updateExampleAccounts = (example_accounts: string) => {
    agent.value.example_accounts = example_accounts.split(',');
};


const updateExampleChannels = (example_channels: string) => {
    agent.value.example_channels = example_channels.split(',')
        .map(example_channel => Number(example_channel));
};

const updateLLM = (llm: LLM) => {
    const index = agent.value.config.findIndex(
        c => c.is_llm
    );

    if (index == -1) {
        agent.value.config.push({
            name: llm.name.toLowerCase(),
            model: llm.model,
            is_llm: true
        });
    }

    else {
        agent.value.config[index].name = llm.name.toLowerCase();
        agent.value.config[index].model = llm.model;
        agent.value.config[index].is_llm = true;
    }

};

onMounted(() => {
    initFields();
});

watch(discordServer, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateServerId(newValue);
});

watch(llmApiKey, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateApiKey(newValue);
});

watch(bio, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateBio(newValue);
});

watch(traits, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateTraits(newValue);
});

watch(swapToSingle, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateSwapToSingle(newValue);
});

watch(swapToMany, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateSwapToMany(newValue);
});

watch(adjustSplitRatio, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateAdjustSplitRatio(newValue);
});

watch(none, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateNone(newValue);
});

watch(example_accounts, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateExampleAccounts(newValue);
});

watch(example_channels, (newValue, oldValue) => {
    if (newValue == oldValue) return;
    updateExampleChannels(newValue);
});
</script>

<template>
    <main>
        <div class="header">
            <div class="toolbar">
                <div class="path">
                    <RouterLink to="/me">
                        <p>Me</p>
                    </RouterLink>
                    <span>/</span>
                    <p class="cr">Create Strategy</p>
                </div>

                <div class="actions">
                    <div class="toggle">
                        <input type="checkbox" v-model="jsonPreview">
                        <p>ZerePy JSON</p>
                    </div>
                    <button @click="create" class="create">{{ creating ? 'Creating' : 'Create' }}</button>
                </div>
            </div>
            <div class="create_form_container">
                <div class="create_forms">
                    <div class="create_form">
                        <h3>Assets Configuration</h3>
                        <div class="form">
                            <div class="option">
                                <p>Minimum entry deposit</p>
                                <div>
                                    <div class="input">
                                        <input type="number" min="1" v-model="agent.minimum_deposit"
                                            placeholder="0.00" />
                                        <span>$USD</span>
                                    </div>
                                    <div class="clicks">
                                        <div class="click"
                                            @click="agent.minimum_deposit > 1 ? agent.minimum_deposit -= 1 : null">
                                            <MinusIcon />
                                        </div>
                                        <div class="click" @click="agent.minimum_deposit += 1">
                                            <PlusIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="choose_col">
                                <div>
                                    <p>Select strategy tokens</p>
                                    <p><span>{{ agent.tokens.length }}</span>/{{ tokens.length }}</p>
                                </div>
                                <div class="tokens">
                                    <div v-for="token in tokens"
                                        :class="agent.tokens.includes(token.address) ? 'active border' : 'border'"
                                        :key="token.symbol" v-on:click="selectToken(token)">
                                        <div class="token">
                                            <img :src="token.image" />
                                            <h3 class="symbol">{{ token.symbol }}</h3>
                                            <p class="name">{{ token.name }}</p>
                                        </div>
                                        <div class="selected">
                                            <UserAddIcon class="icon_add" :color="'var(--bg-darker)'" />
                                            <UserAddIcon class="icon_checked" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="create_form">
                        <h3>Tasks ({{ agent.tasks.length }}/2)</h3>
                        <div class="form">
                            <div class="tasks">
                                <div class="task" v-for="task, index in agent.tasks">
                                    <div class="task_input">
                                        <p>Config</p>

                                        <select @change="onTaskConfigChanged($event, index)" :value="task.config">
                                            <option :value="'twitter'">Twitter</option>
                                            <option :value="'discord'">Discord</option>
                                        </select>
                                    </div>

                                    <div class="task_input">
                                        <p>Name</p>

                                        <select :value="task.name" v-if="task.config == 'twitter'">
                                            <option :value="'read-timeline'">Read
                                                Timeline</option>
                                        </select>

                                        <select v-else :value="task.name">
                                            <option :value="'read-messsages'">Read Messages</option>
                                        </select>
                                    </div>

                                    <div class="task_input">
                                        <p>Weight</p>
                                        <input type="number" v-model="agent.tasks[index].weight" placeholder="1">
                                    </div>

                                    <div class="task_input">
                                        <p>{{ task.config == "twitter" ? "Usernames" : "Channels" }}</p>
                                        <input v-if="task.config == 'twitter'" type="text" v-model="example_accounts"
                                            :placeholder="'Ex: elonmusk,soniclabs'">
                                        <input v-else type="text" v-model="example_channels"
                                            :placeholder="'Ex: 979374785802960966'">
                                    </div>
                                </div>
                            </div>

                            <button class="task_add" v-if="agent.tasks.length < 2" @click="addTask">Add Task</button>
                        </div>
                    </div>

                    <div class="create_form">
                        <h3>AI Agent </h3>
                        <div class="form">
                            <div class="choose_col">
                                <div>
                                    <p>Choose a LLM</p>
                                    <p><span>1</span>/{{ llms.length }}</p>
                                </div>
                                <div class="tokens">
                                    <div v-for="llm in llms"
                                        :class="agent.config.find(c => c.name.toLowerCase() == llm.name.toLowerCase()) ? 'active border' : 'border'"
                                        :key="llm.name" v-on:click="updateLLM(llm)">
                                        <div class="token">
                                            <img :src="llm.image" />
                                            <h3 class="symbol">{{ llm.name }}</h3>
                                            <p class="name">{{ llm.model }}</p>
                                        </div>
                                        <div class="selected">
                                            <UserAddIcon class="icon_add" :color="'var(--bg-darker)'" />
                                            <UserAddIcon class="icon_checked" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="option">
                                <p>Enter bio</p>
                                <div>
                                    <textarea rows="4" v-model="bio"
                                        placeholder="Ex: You are ExampleAgent,the example agent created to showcase the capabilities of ZerePy."></textarea>
                                </div>
                            </div>

                            <div class="option">
                                <p>Enter traits (comma seperated)</p>
                                <div>
                                    <textarea rows="3" v-model="traits"
                                        placeholder="Ex: Event-driven trading,AI-powered decision making,Portfolio optimization,Risk management"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="create_form">
                        <h3>Visibility</h3>
                        <div class="form">
                            <div class="visibility">
                                <p>Public</p>
                                <Switch :checked="agent.visibility == 'public'" @change="changeVisibility" />
                            </div>

                            <div class="option" v-if="agent.visibility == 'public'">
                                <p>Fork Cost</p>
                                <div>
                                    <div class="input">
                                        <input type="number" min="1" v-model="agent.fork_cost" placeholder="0.00" />
                                        <span>$S</span>
                                    </div>
                                    <div class="clicks">
                                        <div class="click" @click="agent.fork_cost > 0 ? agent.fork_cost -= 1 : null">
                                            <MinusIcon />
                                        </div>
                                        <div class="click" @click="agent.fork_cost += 1">
                                            <PlusIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="create_form">
                        <h3>Trading Strategies</h3>
                        <br>
                        <div class="form">
                            <div class="option">
                                <p>Swap to Single</p>
                                <div>
                                    <textarea rows="4" v-model="swapToSingle"
                                        placeholder="Ex: Swap other tokens to a token if the token has positive events."></textarea>
                                </div>
                            </div>

                            <div class="option">
                                <p>Swap to Many</p>
                                <div>
                                    <textarea rows="4" v-model="swapToMany"
                                        placeholder="Ex: Swap a token to other tokens if the token has negative events."></textarea>
                                </div>
                            </div>

                            <div class="option">
                                <p>Adjust Split Ratio</p>
                                <div>
                                    <textarea rows="4" v-model="adjustSplitRatio"
                                        placeholder="If a token has stronger potential or greater influence,recalculate the allocation ratio among supported tokens."></textarea>
                                </div>
                            </div>

                            <div class="option">
                                <p>None</p>
                                <div>
                                    <textarea rows="4" v-model="none"
                                        placeholder="If there are no significant positive or negative social events,no action is taken."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="create_form">
                        <h3>Configurations</h3>
                        <br>
                        <div class="form">
                            <div class="option">
                                <p>Discord Server Id</p>
                                <div>
                                    <textarea v-model="discordServer" rows="2" placeholder="Enter here"></textarea>
                                </div>
                                <a href="https://discord.com/oauth2/authorize?client_id=1339226498174943284&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Fedger-ai.netlify.app&integration_type=0&scope=bot+messages.read+applications.commands+dm_channels.messages.read+dm_channels.messages.write"
                                    target="_blank">
                                    Add EdgerAI bot to your server.</a>
                            </div>

                            <div class="option">
                                <p>LLM Secret Key</p>
                                <div>
                                    <textarea rows="2" v-model="llmApiKey" placeholder="Enter here"></textarea>
                                </div>
                            </div>

                            <div class="option">
                                <p>Loop delay</p>
                                <div>
                                    <div class="input">
                                        <input type="number" min="60" v-model="agent.loop_delay" placeholder="60" />
                                        <span>SECs</span>
                                    </div>
                                    <div class="clicks">
                                        <div class="click"
                                            @click="agent.loop_delay > 60 ? agent.loop_delay -= 60 : null">
                                            <MinusIcon />
                                        </div>
                                        <div class="click" @click="agent.loop_delay += 60">
                                            <PlusIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="preview" v-show="jsonPreview">
                    <pre>{{ JSON.stringify(agent, null, 2) }}</pre>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
.header {
    margin-top: 50px;
}

.toolbar {
    height: 50px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    backdrop-filter: blur(8px);
    padding: 0 60px;
    top: 90px;
    z-index: 1;
}

.toolbar .path {
    display: flex;
    align-items: center;
    gap: 10px;
}

.toolbar p,
.toolbar span {

    font-weight: 500;
    font-size: 14px;
}

.path a,
.path span {
    color: var(--tx-dimmed);
}

.path .cr {
    color: var(--tx-normal);
}

.actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

.actions .toggle {
    display: flex;
    align-items: center;
    gap: 4px;
}

.actions .toggle p {
    font-size: 12px;
    color: var(--tx-semi);

}

.create {
    background: var(--primary);
    border: none;
    outline: none;
    height: 34px;
    padding: 0 20px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-normal);
    cursor: pointer;
}

.create_form_container {
    padding: 0 60px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
}

.create_forms {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.preview {
    padding: 20px;
    border: 1px solid var(--bg-darkest);
    border-radius: 10px;
    height: fit-content;
    position: sticky;
    top: 140px;
    overflow: auto;
}

.preview pre {
    font-size: 14px;
    color: var(--tx-dimmed);
}

.create_form>h3 {
    font-weight: 500;
    font-size: 25px;
    color: var(--tx-normal);
    width: 100%;
}

.form {
    width: 500px;
}

.tools_option,
.option {
    margin-bottom: 40px;
}

.tools_option {
    margin-top: 20px;
}

.tools_option>p,
.option>p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-dimmed);
}

.option a {
    font-weight: 500;
    font-size: 14px;
    color: var(--primary);
}

.option>div:nth-child(2) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    border-bottom: 1px solid var(--bg-darkest);
}

.option>div:nth-child(2) .clicks {
    display: flex;
    align-items: center;
    gap: 10px;
}

.option>div:nth-child(2) .click {
    height: 50px;
    width: 50px;
    background: var(--bg-dark);
    border-radius: 4px 4px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
}

.option>div:nth-child(2) .click_1 {
    height: 50px;
    padding: 0 20px;
    background: var(--bg-dark);
    border-radius: 4px 4px 0px 0px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    position: relative;
}

.drop_down {
    position: absolute;
    top: 50px;
    width: 100%;
    z-index: 4;
    background: var(--bg-dark);
    border-radius: 4px;
}

.drop_item {
    height: 50px;
    padding: 0 20px;
    display: flex;
    gap: 8px;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid var(--bg-darker);
}

.drop_item:first-child {
    border-top: 1px solid var(--bg-darkest);
}

.drop_item:last-child {
    border: none;
}

.drop_down img,
.option>div:nth-child(2) img {
    width: 24px;
    height: 24px;
}

.input {
    display: flex;
    align-items: center;
}

.option>div:nth-child(2) input {
    background: transparent;
    border: none;
    outline: none;
    font-weight: 500;
    font-size: 25px;
    color: var(--tx-normal);
}

.option>div:nth-child(2) textarea {
    background: transparent;
    border: none;
    outline: none;
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-normal);
    width: 100%;
    resize: none;
}

input::placeholder,
textarea::placeholder {
    color: var(--tx-semi);
}

.option>div:nth-child(2) .input span {
    color: var(--tx-dimmed);
    font-size: 25px;
}

.option>div:nth-child(2)>div>p,
.drop_item p {
    font-weight: 400;
    font-size: 14px;
    color: var(--tx-normal);
}

.option>div:nth-child(3) {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 50px;
}

.option>div:nth-child(3) p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-dimmed);
}


.option>div:nth-child(3) a {
    color: var(--primary);
    border-bottom: 1px solid var(--primary);
}

.choose_col>div:first-child,
.option>div:first-child {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin-top: 16px;
}

.choose_col {
    margin-bottom: 40px;
}

.choose_col>div>p,
.option>div:first-child p {
    font-weight: 400;
    font-size: 14px;
    color: var(--tx-dimmed);
}

.choose_col>div>p span,
.option>div:first-child span {
    color: var(--tx-normal);
}

.choose_col .tokens {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 10px;
}

.border {
    background: var(--bg-darkest);
    border-radius: 4px;
    position: relative;
    padding: 2px;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
}

.token {
    width: 100%;
    background: var(--bg-dark);
    padding: 14px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.token img {
    width: 18px;
    height: 18px;
    margin-bottom: 10px;
    border-radius: 50%;
}

.token .symbol {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-normal);
}

.token .name {
    font-weight: 400;
    font-size: 12px;
    color: var(--tx-dimmed);
}

.selected {
    position: absolute;
    width: 20px;
    height: 20px;
    right: 0;
    top: 0;
    background: var(--bg-darkest);
    border-radius: 0px 0px 0px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}


.icon_add {
    background: var(--bg-dark);
    border-radius: 50%;
}

.icon_checked {
    display: none;
}

.active {
    background: var(--primary-light);
}

.active .selected {
    background: var(--primary-light);
}

.active .icon_add {
    display: none;
}

.active .icon_checked {
    display: block;
}

.tools {
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid var(--bg-darkest);
    margin-top: 10px;
}

.tool {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid var(--bg-darkest);
}

.tool:last-child {
    border: none;
}

.tool svg {
    width: 20px;
}

.tool_info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.tool_info p {
    font-size: 14px;
    color: var(--tx-normal);
}

.task {
    display: grid;
    grid-template-columns: 1fr 1fr 0.8fr 2fr;
    gap: 10px;
    margin-top: 10px;
}

.task_input p {
    font-size: 14px;
    color: var(--tx-dimmed);
}

.task_input select,
.task_input input {
    outline: none;
    padding: 0 4px;
    height: 34px;
    border-radius: 4px;
    margin-top: 4px;
    background: none;
    border: none;
    border: 1px solid var(--bg-darkest);
    color: var(--tx-normal);
    font-size: 12px;
    width: 100%;
}

.task_input option {
    background: var(--bg);
}

.task_add {
    margin-top: 20px;
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

.visibility {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
}

.visibility p {
    font-size: 18px;
    color: var(--tx-normal);
}
</style>