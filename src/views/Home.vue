<template>
  <div class="home">
    <div v-if="count === 0" class="title">
      <h3 class="first-title">厚积薄发，行稳致远</h3>
      <h3 class="topic-title">年会抽奖</h3>
    </div>

    <div class="title draw-title" v-if="count > 0">
      当前正在抽取的是：{{ currentPrize }}
    </div>

    <Screenfull class="icon-screen" />

    <Lottery
      :data="personList"
      :config="flowConfig"
      :count="count"
      :currentLuckList="currentLuckList"
      @onChangeData="onChangeData"
      @onReset="onReset"
      @onClose="onClose"
      @onConfig="onConfig"
      @onStart="onStart"
      @onEnd="onEnd"
      @onGenerateLucky="onGenerateLucky"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import Lottery from '@/components/Lottery.vue';
import Screenfull from '@/components/Screenfull.vue';
import { shuffle } from 'lodash';
import config from '@/config/config';
import { getData, getDataLen } from '@/utils/index';

const store = useStore();

// 定义数据，最终将ref的方式改成reactive，可能更优雅一点
const state = reactive({
  // 抽奖流程配置数据
  flowConfig: [],
  // 抽奖人员名单数据
  personList: [],
  // 当前轮次的中奖名单
  currentLuckList: [],
  // 当前轮次
  count: 0,
  // 当前轮次奖项名称
  currentPrize: '幸运奖',
});

// 获取抽奖人员名单数据
const getPersonList = () => {
  // 如果缓存里没数据，说明需要导入
  const data = getData('data');
  const record = getData('record');
  if (getDataLen('data') === 0 || getDataLen('record') === 0) {
    state.personList = data;
  } else {
    // 有的话，还需要剔除已经中奖的名单
    const recordIds = record.map(item => item.id);
    state.personList = data.filter(data => {
      return !recordIds.includes(data.id);
    });
  }
};

// 获取流程配置数据
const getConfig = () => {
  const localConfig = getData('config');
  if (getDataLen('config') > 0) {
    // 从浏览器缓存获取
    store.commit('setConfig', localConfig);
  } else {
    // 从文件获取
    store.commit('setConfig', config.config);
  }
  state.flowConfig = store.state.config;
  localStorage.setItem('config', JSON.stringify(store.state.config));
};

const init = () => {
  getPersonList();
  state.count = Number(localStorage.getItem('count')) || 0;

  getConfig();
  state.currentPrize =
    state.count >= 1 ? state.flowConfig[state.count - 1].name : '幸运奖';
  const currentRecord =
    localStorage.getItem('currentRecord') || JSON.stringify([]);
  state.currentLuckList = JSON.parse(currentRecord);
};

// 生命周期方法：初始化获取需要的数据
onMounted(() => {
  init();
});

// 需要从总名单中剔除已经获奖的人员
const onChangeData = (data, won) => {
  state.personList = data.filter(data => {
    return !won.includes(data.id);
  });
};

// 开始后触发的逻辑
const onStart = () => {
  state.count++;
  state.currentPrize = state.flowConfig[state.count - 1].name;
  store.commit('setCurrentPrize', state.currentPrize);
  localStorage.setItem('count', state.count);
  store.commit('setCount', state.count);
};

// 暂停后触发的逻辑
const onEnd = () => {};

// 生成当前中奖名单
const onGenerateLucky = wonArr => {
  // 生成获奖人员名单对象数组
  state.currentLuckList = state.personList.filter(data => {
    return wonArr.includes(data.id);
  });
  // 最终将中奖名单打乱后再展示，防止被误解抽奖不公平
  state.currentLuckList = shuffle(state.currentLuckList);
  state.currentLuckList.forEach(item => {
    item.prize = store.state.currentPrize;
  });
  localStorage.setItem('currentRecord', JSON.stringify(state.currentLuckList));
};

// 重置数据
const onReset = () => {
  state.personList = [];
  state.count = 0;
  state.currentLuckList = [];
  store.commit('setCount', 0);
  store.commit('setConfig', config.config);
  store.commit('setCurrentPrize', '幸运奖');
  store.commit('setRecord', []);
  ElMessage.success({
    message: '数据已清空，重置成功！',
    type: 'success',
  });
};

// 导入数据关闭弹窗
const onClose = () => {
  const data = localStorage.getItem('data') || JSON.stringify([]);
  state.personList = JSON.parse(data);
  localStorage.setItem('config', JSON.stringify(store.state.config));
};

// 配置成功后的逻辑
const onConfig = config => {
  state.flowConfig = store.state.config;
};

// 最终给模板使用的数据
const { personList, flowConfig, currentLuckList, count, currentPrize } =
  toRefs(state);
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  overflow-y: scroll;

  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    // color: #613e10;
    color: #db820c;
    white-space: nowrap;
    text-align: center;
  }
  .first-title {
    font-size: 86px;
  }
  .topic-title {
    font-size: 108px;
    color: #e2bc8a;
  }

  .draw-title {
    top: 10%;
    font-size: 78px;
    color: #fff;
  }
  .icon-screen {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 9;
  }
}
</style>
