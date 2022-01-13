<template>
  <div class="lottery-draw-box">
    <!-- 抽奖区域 -->
    <div
      class="wrap"
      :style="{ gridTemplateColumns: 'repeat(' + col + ', 18%)' }"
    >
      <div v-for="item in currentLuckList" class="item-box">
        <div class="inner">
          <p class="number">{{ item.number }}</p>
          <p class="name">{{ item.name }}</p>
        </div>
      </div>
    </div>

    <!-- 右侧按钮操作区域 -->
    <div class="operate-box">
      <div class="inner">
        <el-button
          type="success"
          @click="handleSwitch"
          class="operate-btn"
          size="large"
        >
          {{ running ? '结束' : '开始' }}
        </el-button>
        <el-button
          type="primary"
          @click="handleImport"
          class="operate-btn"
          size="large"
        >
          导入
        </el-button>
        <el-button
          type="danger"
          @click="handleReset"
          class="operate-btn"
          size="large"
          v-if="isOver"
        >
          重置
        </el-button>
        <el-button
          type="primary"
          @click="handleConfig"
          class="operate-btn"
          size="large"
        >
          配置
        </el-button>
        <el-button
          type="success"
          @click="handleExport"
          class="operate-btn"
          size="large"
          v-if="isOver"
        >
          导出
        </el-button>
      </div>
    </div>

    <upload-dialog v-model="uploadDialogVisible" @onClose="onClose">
    </upload-dialog>

    <!-- 配置弹窗 -->
    <lottery-config
      v-model="configDialogVisible"
      @onConfig="onConfig"
    ></lottery-config>

    <el-dialog v-model="dialogVisible" title="清空数据" width="30%">
      <span>确定清空数据进行重置吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="doClear">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  reactive,
  toRefs,
  defineProps,
  defineEmits,
  ref,
  nextTick,
  onMounted,
} from 'vue';
import UploadDialog from '@/components/UploadDialog.vue';
import LotteryConfig from '@/components/LotteryConfig.vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import _ from 'lodash';
import { luckydrawHandler, getData, getDataLen } from '@/utils/index';

const store = useStore();
const router = useRouter();

// 定义组件props
const props = defineProps({
  // 人员总名单
  data: {
    type: Array,
    required: true,
  },
  // 抽奖流程配置
  config: {
    type: Array,
    required: true,
  },
  // 抽奖轮次
  count: {
    type: [Number, String],
    default: 0,
  },
  // 当前轮次的中奖人员名单
  currentLuckList: {
    type: Array,
    default: [],
  },
});

// 需要抛出的事件
const emits = defineEmits([
  'onChangeData',
  'onReset',
  'onClose',
  'onConfig',
  'onStart',
  'onEnd',
  'onGenerateLucky',
]);

// 定义数据，最终将ref的方式改成reactive，可能更优雅一点
const state = reactive({
  // 维护中奖人员的总名单
  luckyHistory: [],
  // 中奖的数组
  luckyArr: [],
  // 是否已经开始
  running: false,
  // 定时器
  timer: null,
  // 每列展示的个数
  col: 5,
  // 是否还能继续抽奖
  isOver: false,
});

// 清空数据的提示弹窗
const dialogVisible = ref(false);

onMounted(() => {
  const count = getData('count');
  const config = getData('config');
  state.isOver = count === getDataLen('config') && getData('count') > 0;

  if (getDataLen('record') !== 0) {
    state.luckyHistory = getData('record');
  }

  if (count > 0 && config.length > 0) {
    const config = getData('config');
    state.col = config[count - 1].col;
  }
});

// 点击开始
const handleSwitch = () => {
  if (props.data.length === 0) {
    ElMessage({
      message: '没有抽奖人员数据，无法抽奖！',
      type: 'warning',
    });
    return;
  }
  if (state.isOver) {
    ElMessage({
      message: '抽奖完毕！',
      type: 'success',
    });
    return;
  }
  state.running = !state.running;

  // 一旦点了开始，就不断的生成随机数
  if (state.running === true) {
    console.log('参与抽奖的人数：', props.data.length);
    emits('onStart');

    nextTick(() => {
      state.col = props.config[props.count - 1].col;
      console.log('当前轮次:', props.count);
      // 生成参与抽奖人员名单的id数组
      const joinPersonIds = props.data.map(item => item.id);
      console.log('参与的人员：', joinPersonIds);

      // 当前参与抽奖的人数
      const currentTotal = props.config[props.count - 1].total;

      // 每隔5毫秒就随机更新一下数据
      state.timer = setInterval(() => {
        generateLucky(joinPersonIds, currentTotal);
      }, 5);
    });
  } else {
    // 结束之后，
    clearInterval(state.timer);

    state.luckyHistory = state.luckyHistory.concat(props.currentLuckList);
    store.commit('setRecord', state.luckyHistory);
    window.localStorage.setItem('record', JSON.stringify(state.luckyHistory));
    // 需要从总名单中剔除已经获奖的人员
    emits('onChangeData', props.data, state.luckyArr);

    state.isOver = props.count === props.config.length;
  }
};

// 生成中奖的数组
const generateLucky = (list, number = 10) => {
  state.luckyArr = luckydrawHandler(list, state.luckyArr, number);

  emits('onGenerateLucky', state.luckyArr);

  return state.luckyArr;
};

// 点击导入
const uploadDialogVisible = ref(false);
const handleImport = command => {
  uploadDialogVisible.value = true;
};

// 关闭导入
const onClose = () => {
  emits('onClose');
};

// 配置
const onConfig = config => {
  state.isOver = props.count === config.length;
  emits('onConfig', config);
};

// 重置
const handleReset = () => {
  dialogVisible.value = true;
};

// 清空
const doClear = () => {
  window.localStorage.clear();
  state.luckyHistory = [];
  state.luckyArr = [];
  state.isOver = false;
  state.running = false;
  clearInterval(state.timer);
  emits('onReset');
  dialogVisible.value = false;
};

// 配置
const configDialogVisible = ref(false);
const handleConfig = () => {
  configDialogVisible.value = true;
};

// 导出
const handleExport = () => {
  router.push('/list');
};

const { running, col, isOver } = toRefs(state);
</script>

<style lang="less" scoped>
.lottery-draw-box {
  position: relative;
  height: 100%;
  .wrap {
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 95%;
    height: 60%;
    display: grid;
    justify-content: center;
    grid-gap: 50px 20px;

    .item-box {
      display: table;
      text-align: center;

      color: #fff;
      .name {
        font-size: 56px;
        margin-top: 10px;
      }
      .number {
        font-size: 40px;
        margin-top: 10px;
      }
    }
  }
  .inner {
    display: table-cell;
    vertical-align: middle;
  }
  .operate-box {
    position: absolute;
    display: table;
    right: 0;
    top: 0;
    width: 5%;
    height: 100%;
    max-width: 200px;
    text-align: center;
  }
}
.operate-box /deep/ .el-button {
  margin: 30px 0 0 0;
}
</style>
