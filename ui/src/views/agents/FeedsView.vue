<script setup lang="ts">
import OutIcon from '@/components/icons/OutIcon.vue';
import ProgressBox from '@/components/ProgressBox.vue';
import { notify } from '@/reactives/notify';
import Client from '@/scripts/client';
import { explorerUrl } from '@/scripts/constants';
import Converter from '@/scripts/converter';
import Storage from '@/scripts/storage';
import type { Post } from '@/scripts/types';
import { useWalletStore } from '@/stores/wallet';
import { onMounted, ref } from 'vue';

const newPost = ref('');
const loading = ref(true);
const posting = ref(false);
const posts = ref<Post[]>([]);
const walletStore = useWalletStore();
const image = ref<File | null>(null);
const imageURL = ref<string | null>(null);

const onImageSelected = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
        image.value = target.files[0];
        imageURL.value = URL.createObjectURL(target.files[0]);
    }
};

const create = async () => {
    if (posting.value) return;

    if (!walletStore.address) {
        return notify.push({
            title: "Error",
            description: "Connect your wallet!",
            category: "error"
        });
    }

    if (newPost.value.length == 0) {
        return notify.push({
            title: 'Validation',
            description: 'Enter a valid post',
            category: "error"
        });
    }

    posting.value = true;

    const imageLink = image.value ?
        await Storage.awaitUpload(image.value, `${walletStore.address}-${Date.now()} `) :
        null;

    const sent = await Client.createPost({
        creator: walletStore.address,
        image: imageLink,
        text: newPost.value,
        timestamp: Date.now()
    });

    if (sent) {
        newPost.value = "";
        image.value = null;
        imageURL.value = null;
        getPosts(false);
    } else {
        notify.push({
            title: "Error",
            description: "Failed to send post",
            category: "error"
        });
    }

    posting.value = false;
};

const getPosts = async (load: boolean = true) => {
    loading.value = load;
    posts.value = await Client.getPosts(1, 10);
    loading.value = false;
};

onMounted(() => {
    getPosts();
});
</script>

<template>
    <div class="create_post">
        <div class="create_post_content">
            <div class="create_post_thumbnail">
                <img :src="imageURL ? imageURL : '/images/image_default.png'" alt="">
                <input type="file" @change="onImageSelected" />
            </div>
            <input v-model="newPost" type="text" placeholder="What's on your mind?" />
        </div>
        <button @click="create" :disabled="posting">{{ posting ? 'Posting' : 'Post' }}</button>
    </div>

    <div class="load_frame" v-if="loading">
        <ProgressBox />
    </div>

    <div class="posts" v-if="!loading">
        <div class="post" v-for="post, index in posts" :key="index" :class="post.image ? 'span_2' : 'span_1'">
            <div class="thumbnail" v-if="post.image">
                <img :src="post.image || '/images/image_default.png'" alt="">
            </div>
            <div class="detail">
                <div class="detail_content">
                    <img :src="'/images/user.png'" alt="">
                    <div class="detail_text">
                        <h5>{{ post.text }} </h5>
                        <a :href="`${explorerUrl}/address/${post.creator}`" target="_blank">
                            <p>{{ Converter.fineAddress(post.creator, 4) }}
                                <OutIcon />
                            </p>
                        </a>
                    </div>
                </div>

                <div class="detail_view">
                    <div class="views">Time</div>
                    <div class="views_count">
                        <p>{{ Converter.fullMonth(new Date(post.timestamp)) }}</p>
                        <UserGroupIcon />
                    </div>
                </div>
            </div>
        </div>

        <div class="post" v-if="posts.length % 2 == 1"></div>
    </div>

    <div class="empty" v-if="!loading && posts.length == 0">
        <img src="/images/empty.png" alt="">
        <p>No posts.</p>
    </div>
</template>

<style scoped>
.create_post {
    padding: 20px 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--bg-darkest);
    gap: 20px;
}

.create_post_content {
    display: flex;
    align-items: center;
    gap: 20px;
    width: 100%;
}

.create_post_thumbnail {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
}

.create_post_thumbnail img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--bg-darkest);
}

.create_post_thumbnail input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 10;
}

.create_post_content input {
    width: 100%;
    height: 50px;
    padding: 0 16px;
    border-radius: 8px;
    border: 1px solid var(--bg-darkest);
    background: var(--bg-dark);
    color: var(--tx-normal);
    outline: none;
    font-size: 16px;
}

.create_post_content input::placeholder {
    color: var(--tx-dimmed);
}

.create_post button {
    height: 50px;
    padding: 0 16px;
    border-radius: 8px;
    background: var(--primary);
    color: var(--tx-normal);
    border: 1px solid var(--bg-darkest);
    width: 100px;
    cursor: pointer;
}

.posts {
    padding: 40px 20px;
    column-gap: 50px;
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(2, 482px);
    grid-auto-flow: dense;
    row-gap: 40px;
}

.post {
    max-width: 100%;
    height: fit-content;
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-dark);
}

.span_1 {
    grid-row: span 1;
}

.span_2 {
    grid-row: span 2;
}


.post .thumbnail {
    height: 170px;
    position: relative;
    width: 100%;
    overflow: hidden;
}

.post .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.play_button {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}

.detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 20px;
}

.detail_content {
    display: grid;
    grid-template-columns: 1fr 100px;
    align-items: flex-end;
    gap: 16px;
}

.detail_content img {
    width: 34px;
    height: 34px;
    object-fit: cover;
    border-radius: 16px;
    border: 1px solid var(--bg-darkest);
}

.detail_text {
    margin-top: 4px;
}

.detail_text>h5 {
    font-size: 16px;
    line-height: 26px;
    font-weight: 500;
    line-height: 14px;
    color: var(--tx-normal);
    margin-bottom: 8px;
}

.detail_text p {
    font-size: 12px;
    font-weight: 500;
    color: var(--tx-dimmed);
    display: flex;
    align-items: center;
    gap: 4px;
}

.detail_view {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.views {
    font-size: 12px;
    font-weight: 500;
    color: var(--tx-dimmed);
}

.views_count p {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--tx-normal);
}

.views_count {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>