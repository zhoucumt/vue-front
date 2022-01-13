<template>
  <div>
    <i
      class="iconfont"
      @click="onToggle"
      :class="{
        'i-go-fullscreen': isFullscreen,
        'i-exit-fullscreen': !isFullscreen,
      }"
    ></i>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import screenfull from 'screenfull';

// 是否全屏
const isFullscreen = ref(false);

// 监听变化
const change = () => {
  isFullscreen.value = screenfull.isFullscreen;
};

// 切换事件
const onToggle = () => {
  screenfull.toggle();
};

// 设置侦听器
onMounted(() => {
  screenfull.on('change', change);
});

// 删除侦听器
onUnmounted(() => {
  screenfull.off('change', change);
});
</script>

<style lang="less" scoped>
.i-go-fullscreen,
.i-exit-fullscreen {
  color: #fff;
  font-size: 56px;
}
</style>
