import _ from 'lodash';
import XLSX from 'xlsx';

export function generateArray(start, end) {
  return Array.from(new Array(end + 1).keys()).slice(start);
}

/**
 * 单次抽奖
 * @param {number} data 总名单
 * @param {array} won 已中奖
 * @param {number} num 本次抽取人数
 */
export function luckydrawHandler(data, won = [], num) {
  // const personListArr = generateArray(1, Number(total));
  const wons = won;
  const res = [];
  for (let j = 0; j < num; j++) {
    // 去除已经获奖的，即未中奖的人员组成的数组
    const nodraws = data.filter(item => !wons.includes(item));
    // const current = nodraws[randomNum(1, nodraws.length) - 1];
    const current = _.sample(nodraws);
    res.push(current);
    wons.push(current);
  }
  return res;
}

/**
 * 获取表头（通用方式）
 */
export const getHeaderRow = sheet => {
  const headers = [];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  let C;
  const R = range.s.r;
  /* start in the first row */
  for (C = range.s.c; C <= range.e.c; ++C) {
    /* walk every column in the range */
    const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
    /* find the cell in the first row */
    let hdr = 'UNKNOWN ' + C; // <-- replace with your desired default
    if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
    headers.push(hdr);
  }
  return headers;
};

export const isExcel = file => {
  return /\.(xlsx|xls|csv)$/.test(file.name);
};

// 计算剩余的可抽奖人数
export const remainNumber = () => {
  const total = localStorage.getItem('data') || JSON.stringify([]);
  const record = localStorage.getItem('record') || JSON.stringify([]);
  const totalLen = JSON.parse(total).length;
  const recordLen = JSON.parse(record).length;

  return totalLen - recordLen;
};

// 校验抽奖人数
export const checkPrizeNumber = (rule, value, callback) => {
  console.log(remainNumber(), rule);
  if (value === '') {
    return callback(new Error('请输入抽奖人数'));
  } else if (isNaN(value) || typeof Number(value) !== 'number') {
    return callback(new Error('请输入数字'));
  } else if (value <= 0) {
    return callback(new Error('请输入大于0的数字'));
  } else if (value > remainNumber()) {
    return callback(
      new Error(
        '输入的抽奖人数已经大于可抽奖名单总数，请重新输入或者先导入抽奖名单'
      )
    );
  } else {
    callback();
  }
};

// 计算对象数组中某个属性合计
export const countTotal = (arr, keyName) => {
  let total = 0;
  total = arr.reduce(function (total, currentValue, currentIndex, arr) {
    return currentValue[keyName]
      ? Number(total) + Number(currentValue[keyName])
      : total;
  }, 0);
  return total;
};

// 根据key获取localStorage的数据
export const getData = key => {
  const dataStringify = localStorage.getItem(key) || JSON.stringify([]);
  return JSON.parse(dataStringify);
};

// 根据key获取localStorage的数据长度
export const getDataLen = key => {
  return getData(key).length || 0;
};
