import { createStore } from 'vuex';
import getters from './getters';

export default createStore({
  getters,
  state: {
    // 抽奖轮次
    count: 0,
    // 正在抽取的奖项名称
    currentPrize: '幸运奖',

    // 中奖的人员总名单
    record: [],

    // 抽奖配置
    config: [],
  },
  mutations: {
    setCount(state, count) {
      state.count = count;
    },
    setCurrentPrize(state, name) {
      state.currentPrize = name;
    },
    setRecord(state, record) {
      state.record = record;
    },
    setConfig(state, config) {
      state.config = config;
    },
  },
  actions: {},
  modules: {},
});
