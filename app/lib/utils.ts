import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  // toLocaleString返回这个数字特定于语言环境的表示字符串。后面的option对象是货币格式
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (dateStr: string, locale: string = 'en-US') => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  // 取所有revenue值中的最大值
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  // 获取y轴的最大值
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // 页面总数小于等于7，直接展示所有页码
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // 页面总数大于7

  // 当前页面在前3页，展示前3、省略符和倒数后两页
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // 当前页面在后3页，展示前2、省略符和倒数后3页
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // 如果在非前3非后3的中间，显示第一页，省略符、当前页和其前后页、省略符、最后一页
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};
