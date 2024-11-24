import {getMoneyUppercase} from '@/api/helpers';
import { useUser } from '@/store';
import moment from 'moment';

export function chukudan(data, LODOP){
  const PAGE_WIDTH = 2260;
  const PAGE_HEIGHT = 1400;
  const PAGE_PADDING = 100;
  const MAX_COUNT_PER_PAGE = 8;
  const RATIO = 0.346665;
  const maxPage = Math.ceil(data.details.length / MAX_COUNT_PER_PAGE);
  LODOP.SET_PRINT_PAGESIZE(0, PAGE_WIDTH, PAGE_HEIGHT);
  for(let currentPage = 0; currentPage < maxPage; currentPage++) {
    let html = '<div>';
    html += '<div style="text-align: center;font-size: 22px; font-weight: bold">' + data.title + '</div>';
    html += '<div style="text-align: center;position: relative; margin-top: 0.5em; font-weight: bold; font-size: 16px">物资出库（送货单）' +
            '<div style="position:absolute; right: 0; top: 0;">单号.'+ data.id.toString().padStart(8, '0') +  '</div>' +
            '</div>';
    html += '<div style="position: relative; margin-top: 0.5em">接收单位：' + data.customerName +
            '<div style="position:absolute; right: 0;top: 0">' + data.date + '</div>' +
            '</div>';
    html += '<table style="margin-top: 0.5em" cellpadding="2" cellspacing="0" border="1" width="100%">';
    html += '<tr>';
    html += '<td width="15%" style="text-align: center">品名</td>';
    html += '<td width="20%" style="text-align: center">规格</td>';
    html += '<td width="10%" style="text-align: center">单位</td>';
    html += '<td width="15%" style="text-align: center">数量</td>';
    html += '<td width="15%" style="text-align: center">单价（元）</td>';
    html += '<td width="15%" style="text-align: center">金额（元）</td>';
    html += '<td width="15%" style="text-align: center">备注</td>';
    html += '</tr>';
    let amount = 0;
    for(let i = 0; i < MAX_COUNT_PER_PAGE && currentPage * MAX_COUNT_PER_PAGE + i < data.details.length; i++) {
      const item = data.details[currentPage * MAX_COUNT_PER_PAGE + i];
      html += '<tr>';
      html += `<td style="text-align: center">${item.goodsName}</td>`;
      html += `<td style="text-align: center">${item.spec}</td>`;
      html += `<td style="text-align: center">${item.unit}</td>`;
      html += `<td style="text-align: center">${item.num}</td>`;
      html += `<td style="text-align: center">${item.price ?? ''}</td>`;
      html += `<td style="text-align: center">${item.total ?? ''}</td>`;
      html += '<td></td>';
      html += '</tr>';
      amount += item.total;
    }
    if(currentPage === maxPage - 1) {
      for(let i = data.details.length % MAX_COUNT_PER_PAGE; i < MAX_COUNT_PER_PAGE; i++) {
        html += '<tr>';
        html += '<td>&nbsp;</td>';
        html += '<td></td>';
        html += '<td></td>';
        html += '<td></td>';
        html += '<td></td>';
        html += '<td></td>';
        html += '<td></td>';
        html += '</tr>';
      }
    }
    html += '<tr>';
    html += '<td style="text-align: center">合计金额：</td>';
    html += `<td style="" colspan="6">${amount ? getMoneyUppercase(amount, 1) : ''}`
            + `<span style="float: right; letter-spacing: 0">￥<span style="text-decoration: underline;">&nbsp;&nbsp;${
              amount ? amount.toFixed(1) : '&nbsp;'.repeat(6)
            }&nbsp;&nbsp;</span></span>`
            + '</td>';
    html += '</table>';
    html += '</div>';
    html += '<table style="width: 100%; margin-top: 10px">';
    html += '<tr>';
    html += '<td width="12.5%">发货人：</td>';
    html += '<td width="12.5%"></td>';
    html += '<td width="12.5%">操作员：</td>';
    html += '<td width="12.5%"><td>';
    html += '<td width="12.5%">送货人：</td>';
    html += '<td width="12.5%"></td>';
    html += '<td width="12.5%">签收人：</td>';
    html += '<td width="12.5%"></td>';
    html += '</tr>';
    html += '</table>';
    html += '<div style="text-align: right">到货日期' +
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
            '年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>';
    html += '<div>注：红联请买受人盖章（或签字）后带回给出卖人</div>';
    LODOP.ADD_PRINT_HTM(
      PAGE_PADDING * RATIO,
      PAGE_PADDING * RATIO,
      (PAGE_WIDTH - PAGE_PADDING * 2) * RATIO,
      (PAGE_HEIGHT - PAGE_PADDING * 2) * RATIO,
      html
    );
    LODOP.NEWPAGEA();
  }
}

/**
 *
 * @param data
 * @param {typeof window.LODOP} LODOP
 */
export function peiliaoShenqing(data, LODOP){
  const user = useUser();
  let html = '<div style="padding: 40px; font-size: 18px; line-height: 1.5em">';

  html += '<h1 style="text-align: center; font-weight: bold; font-size: 22px; font-family: \'微软雅黑\'; letter-spacing: 0.5em">订单配料表</h1>';

  for (let i = 0; i < data.length; i++) {
    if(i) {
      html += '<div style="border-top: 2px dashed #eee; margin: 20px 0 10px"></div>';
    }
    const row = data[i];
    html += '<div style="text-align: center; margin-bottom: 8px">'
        + '<span>订单名称</span>'
        + `<span style="display: inline-block; width: 45%; border-bottom: 1px solid #000">${row.process.name}</span>`
        + '<span style="margin-left: 10px">配货车床</span>'
        + `<span style="display: inline-block; width: 10%; border-bottom: 1px solid #000">${row.process.lathe?.name ?? '&nbsp;'}</span>`
      + '</div>';

    html += '<table style="width: 100%; line-height: 2em; border-collapse: collapse;" border="1" >';

    html += '<tr>' +
      '<td style="width: 20%">名称</td>' +
      '<td style="width: 20%">规格(MM)</td>' +
      '<td style="width: 20%">数量</td>' +
      '<td style="width: 20%">单位</td>' +
      '<td style="width: 20%">实际重量</td>' +
    '</tr>';

    html += '<tr>'
      + `<td>${row.raw.goodsName}</td>`
      + `<td>${row.raw.spec}</td>`
      + `<td>${row.raw.apply_num || row.raw.num}</td>`
      + `<td>${row.raw.unitName}</td>`
      + `<td>${row.raw.num}</td>`
      + '</tr>';

    if(row.process.comment) {
      html += '<tr>';
      + `<td colspan="4">${row.process.comment}</td>`;
      html += '</tr>';
    }

    html += '</table>';
  }

  html += '<div style="margin-top: 10px;">打印人：' + user.name;
  html += `<span style="float: right">打印时间：${moment().format('YYYY-MM-DD HH:mm')}</span>`;
  html += '</div>';

  html += '</div>';

  LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', html);
}
