<template>
  <el-dialog
    title="抽奖配置"
    :model-value="modelValue"
    @close="closed"
    width="80%"
  >
    <div class="center">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item
          v-for="(item, index) in form.config"
          :key="index"
          style="margin-bottom: 20px"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item :prop="`config.${index}.name`" :rules="rules.name">
                <el-input
                  v-model="item.name"
                  placeholder="请输入奖项名称"
                  :disabled="count >= index + 1 ? true : false"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="15" style="margin-left: 10px">
              <el-form-item v-if="count >= index + 1">
                <el-input
                  v-model="item.total"
                  placeholder="请输入抽奖人数"
                  :disabled="count >= index + 1 ? true : false"
                  @change="onPrizeTotalChange($event, index)"
                ></el-input>
              </el-form-item>
              <el-form-item
                :prop="`config.${index}.total`"
                :rules="rules.total"
                v-else
              >
                <el-input
                  v-model="item.total"
                  placeholder="请输入抽奖人数"
                  :disabled="count >= index + 1 ? true : false"
                  @change="onPrizeTotalChange($event, index)"
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="1">
              <el-button
                type="primary"
                @click="handleAddItem(item, index)"
                class="config-item-btn"
                :disabled="count > index + 1 ? true : false"
              >
                +
              </el-button>
            </el-col>
            <el-col :span="1">
              <el-button
                type="danger"
                @click="handleRemoveItem(item, index)"
                class="config-item-btn"
              >
                -
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closed">取消</el-button>
        <el-button type="primary" @click="comfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, reactive, toRefs, watch } from 'vue';
import { useStore } from 'vuex';
import { cloneDeep } from 'lodash';
import { checkPrizeNumber, countTotal, remainNumber } from '@/utils';
import { ElMessage } from 'element-plus';

const store = useStore();
const formRef = ref(null);

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const state = reactive({
  value: null,
  // 新增的奖项
  newConfig: [],
  lastIndex: 0,
  form: { config: [] },
  count: 0,
});

const rules = ref({
  name: [
    {
      required: true,
      message: '请输入奖项名称',
      trigger: 'blur',
    },
    {
      min: 1,
      max: 8,
      message: '输入长度为1到8个字符',
      trigger: 'blur',
    },
  ],
  total: [
    {
      trigger: 'blur',
      validator: checkPrizeNumber,
    },
  ],
});

watch(
  () => props.modelValue,
  val => {
    if (val) {
      state.form.config = cloneDeep(store.state.config);
      state.count = localStorage.getItem('count');
    }
  }
);

// 在后面增加一项
const handleAddItem = (item, index) => {
  state.form.config.splice(index + 1, 0, {
    total: 0,
    name: '',
    col: 5,
  });
};

// 删除一项
const handleRemoveItem = (item, index) => {
  if (state.form.config.length === 1) {
    ElMessage({
      type: 'warning',
      message: '最后一项不能删除！',
    });
    return;
  }
  state.form.config.splice(index, 1);
};

// 抽奖人数输入框变化事件
const onPrizeTotalChange = (value, index) => {
  const col = Number(value) >= 5 ? 5 : Number(value);
  state.form.config[index].col = col;
};

const emits = defineEmits(['update:modelValue', 'onConfig']);

/**
 * 数据解析成功之后的回调
 */
const onSuccess = async ({ header, results }) => {};

/**
 * 关闭
 */
const closed = () => {
  emits('update:modelValue', false);
};

// 确定
const comfirm = async () => {
  console.log('点击');
  formRef.value.validate(valid => {
    if (!valid) {
      ElMessage({
        type: 'warning',
        message: '校验不通过，请检查表单！',
      });
      return;
    }

    const editConfig = state.form.config.filter((item, index) => {
      return state.count <= index;
    });
    console.log('editConfig: ', editConfig);
    const totalCount = countTotal(editConfig, 'total');
    // const total = JSON.parse(localStorage.getItem('data') || []);
    // const record = JSON.parse(localStorage.getItem('record') || []);
    console.log(totalCount);
    if (totalCount > remainNumber()) {
      ElMessage({
        type: 'warning',
        message: '输入的抽奖人数之和已经大于可抽奖名单总数！',
      });
      return;
    }

    store.commit('setConfig', state.form.config);
    localStorage.setItem('config', JSON.stringify(store.state.config));
    emits('onConfig', state.form.config);
    emits('update:modelValue', false);
    // closed();
  });
};

const { config, value, newConfig, form, count } = toRefs(state);
</script>

<style lang="less" scoped>
.center {
  text-align: center;
  .title {
    margin-bottom: 12px;
  }

  .config-box {
    display: flex;
    margin-top: 10px;
  }
  .config-item {
    margin-right: 10px;
  }
  .config-item-text {
    flex: 1;
  }
  .config-item-input {
    flex: 2;
  }
  .config-item-btn {
    width: 50px;
  }
  .el-row {
    width: 100%;
  }
}
</style>
