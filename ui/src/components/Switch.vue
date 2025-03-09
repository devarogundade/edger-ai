<script setup lang="ts">
const props = defineProps({
    checked: Boolean
});

const emit = defineEmits([
    'change'
]);

const onChange = (event: any) => {
    emit('change', event.target.checked);
};
</script>

<template>
    <label class="switch">
        <input type="checkbox" :checked="props.checked" @change="onChange">
        <span class="slider round"></span>
    </label>
</template>

<style scoped>
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}


.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}


.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-darker);
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: var(--tx-dimmed);
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked+.slider {
    background-color: var(--primary-light);
}

input:checked+.slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
}


.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>
