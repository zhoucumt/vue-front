<template>
  <el-dialog
    title="导入名单"
    :model-value="modelValue"
    @close="closed"
    width="80%"
  >
    <div class="center">
      <upload-excel :onSuccess="onSuccess"></upload-excel>
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
import { defineProps, defineEmits, ref } from 'vue';
import UploadExcel from '@/components/UploadExcel';
import { ElMessage } from 'element-plus';

const USER_RELATIONS = {
  姓名: 'name',
  工号: 'number',
};

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
const emits = defineEmits(['update:modelValue', 'onClose']);

/**
 * 数据解析成功之后的回调
 */
const onSuccess = async ({ header, results }) => {
  const updateData = generateData(results);
  window.localStorage.setItem('data', JSON.stringify(updateData));
  ElMessage.success({
    message: '抽奖名单导入成功',
    type: 'success',
  });
  closed();
};

/**
 * 筛选数据
 */
const generateData = results => {
  const arr = [];
  results.forEach((item, index) => {
    const userInfo = {};
    Object.keys(item).forEach(key => {
      userInfo[USER_RELATIONS[key]] = item[key];
    });
    userInfo.id = index + 1;
    arr.push(userInfo);
  });
  return arr;
};

/**
 * 关闭
 */
const closed = () => {
  emits('update:modelValue', false);
  emits('onClose');
};

// 确定
const comfirm = async () => {
  // 3. 关闭 dialog
  closed();
};
</script>

<style lang="less" scoped>
.center {
  text-align: center;
  .title {
    margin-bottom: 12px;
  }
}
</style>
