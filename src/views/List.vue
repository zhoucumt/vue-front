<template>
  <div class="list-page">
    <div class="export-btn">
      <el-button type="success" @click="onToExcelClick"> 导出 </el-button>
    </div>

    <el-table
      :data="tableData"
      border
      style="width: 80%; margin: 0 auto; font-size: 48px"
      :row-style="tableStyle"
      :cell-style="{ padding: '20px 0', height: '100px' }"
      :header-row-style="tableStyle"
    >
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="number" label="工号" align="center" />
      <el-table-column prop="prize" label="奖品" align="center" />
    </el-table>

    <export-to-excel
      v-model="exportToExcelVisible"
      :data="tableData"
    ></export-to-excel>
  </div>
</template>

<script setup>
import { reactive, onMounted, toRefs, ref } from 'vue';
import { useStore } from 'vuex';
import ExportToExcel from '@/components/Export2Excel.vue';
const store = useStore();

const state = reactive({
  tableData: [],
  tableStyle: { background: 'transparent', color: '#fff', height: '100px' },
});

onMounted(() => {
  const record = window.localStorage.getItem('record') || JSON.stringify([]);
  state.tableData =
    store.state.record.length > 0 ? store.state.record : JSON.parse(record);
});

/**
 * excel 导出点击事件
 */
const exportToExcelVisible = ref(false);
const onToExcelClick = () => {
  exportToExcelVisible.value = true;
};

const { tableData, tableStyle } = toRefs(state);
</script>

<style lang="less" scoped>
.list-page {
  height: 100%;
  overflow-y: scroll;
  .export-btn {
    width: 80%;
    margin: 20px auto;
    text-align: right;
  }
}

.list-page /deep/ .el-table,
.list-page /deep/ .el-table__cell {
  background: transparent;
}
.list-page /deep/ .el-table tbody tr:hover > td {
  background-color: transparent;
  color: #000;
}
.list-page /deep/ .el-table .cell {
  height: 100px;
  line-height: 100px;
}
</style>
