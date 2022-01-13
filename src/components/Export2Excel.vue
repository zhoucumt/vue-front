<template>
  <el-dialog
    title="导出中奖名单"
    :model-value="modelValue"
    @close="closed"
    width="30%"
  >
    <el-input v-model="excelName" placeholder="中奖名单"></el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closed">取消</el-button>
        <el-button type="primary" @click="onConfirm" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { USER_RELATIONS } from '@/config/Export2ExcelConstants';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});
const emits = defineEmits(['update:modelValue']);

let exportDefaultName = '中奖名单表';
const excelName = ref('');
excelName.value = exportDefaultName;

/**
 * 导出按钮点击事件
 */
const loading = ref(false);
const onConfirm = async () => {
  loading.value = true;
  // const allUser = (await getUserManageAllList()).list
  const record = props.data;
  // 导入工具包
  const excel = await import('@/utils/Export2Excel');
  const data = formatJson(USER_RELATIONS, record);
  excel.export_json_to_excel({
    // excel 表头
    header: Object.keys(USER_RELATIONS),
    // excel 数据（二维数组结构）
    data,
    // 文件名称
    filename: excelName.value || exportDefaultName,
    // 是否自动列宽
    autoWidth: true,
    // 文件类型
    bookType: 'xlsx',
  });
  closed();
};

// 该方法负责将数组转化成二维数组
const formatJson = (headers, rows) => {
  // 首先遍历数组
  // [{ username: '张三'},{},{}]  => [[’张三'],[],[]]
  return rows.map(item => {
    return Object.keys(headers).map(key => {
      // 角色特殊处理
      if (headers[key] === 'role') {
        const roles = item[headers[key]];

        return JSON.stringify(roles.map(role => role.title));
      }
      return item[headers[key]];
    });
  });
};

/**
 * 关闭
 */
const closed = () => {
  loading.value = false;
  emits('update:modelValue', false);
};
</script>

<style lang="scss" scoped></style>
