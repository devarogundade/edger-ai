<script setup lang="ts">
import SortIcon from '@/components/icons/SortIcon.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
    <main>
        <div class="header">
            <h3 class="title">Explore</h3>
        </div>
        <div class="toolbar">
            <div class="tab_items">
                <RouterLink to="/">
                    <div :class="route.name == 'agents-feeds' ? 'tab tab_active' : 'tab'">
                        <p>Feeds</p>
                    </div>
                </RouterLink>
                <RouterLink to="/strategies">
                    <div :class="route.name == 'agents-strategies' ? 'tab tab_active' : 'tab'">
                        <p>Strategies</p>
                    </div>
                </RouterLink>
            </div>
            <div class="filter_items">
                <div class="filter">
                    <SortIcon />
                    <p>Sort By</p>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    top: -66px;
    position: sticky;
    z-index: 2;
}

.header {
    height: 156px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 60px;
}

.header .title {
    color: var(--tx-normal);
    font-size: 30px;
    font-weight: 500;
    line-height: 36px;
}

.toolbar {
    width: 100%;
    height: 40px;
    padding: 0 60px;
    border-bottom: 1px var(--bg-darkest) solid;
    display: flex;
    justify-content: space-between;
    backdrop-filter: blur(8px);
}

.tab_items {
    display: flex;
    gap: 20px;
    height: 100%;
}

.tab {
    display: flex;
    height: 40px;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 20px;
    border-bottom: 2px solid transparent;
}

.tab p {
    font-weight: 500;
    font-size: 16px;
    color: var(--tx-dimmed);
}

.tab_active p {
    color: var(--tx-normal);
}

.tab_active {
    border-bottom: 2px solid var(--primary-light);
}

.filter_items {
    display: flex;
    gap: 20px;
}

.filter {
    gap: 10px;
    padding: 10px 20px;
    background: var(--bg-dark);
    border-radius: 4px 4px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.filter p {
    font-weight: 500;
    font-size: 14px;
    color: var(--tx-normal);
}
</style>