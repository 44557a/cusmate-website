// ============================================================
// 角色与页面配置
// ============================================================

const ROLE_CONFIG = {
  operations: {
    label: '运营',
    mode: 'viewer',
    description: '只查看和导出，只看母体总表和 SKU 数据总表，不能上传、删除或修改。',
    pages: ['parents', 'skus'],
  },
  logistics: {
    label: '物流负责人',
    mode: 'maintainer',
    description: '维护物流运费模板，设置生效时间，查看批次重算结果。',
    pages: ['freightChannels', 'freightTemplates', 'freightCalculator'],
  },
  warehouse: {
    label: '仓库负责人',
    mode: 'maintainer',
    description: '维护 SKU 尺寸、重量、包装等仓库负责的数据。',
    pages: ['dimensions', 'warehouse'],
  },
  supply: {
    label: '供应链负责人',
    mode: 'maintainer',
    description: '维护采购成本、物流限制、近 60 天采购和销量相关数据。',
    pages: ['supply', 'supplyChain', 'costPricing'],
  },
  it: {
    label: 'IT 开发人员',
    mode: 'admin',
    description: '可以查看所有页面，也可以维护母体、属性、组合、SKU扩展页和运费模板。',
    pages: ['parents', 'attributes', 'combinations', 'skuCandidates', 'skus', 'dimensions', 'designTemplates', 'supply', 'supplyChain', 'warehouse', 'costPricing', 'freightChannels', 'freightTemplates', 'freightCalculator', 'settings', 'alerts', 'reports'],
  },
};

const PAGE_CONFIG = {
  parents: {
    label: '产品母体表',
    description: '展示所有母体，支持点进查看详情。运营只能查看和导出，IT 可以看到新建母体表单。',
  },
  attributes: {
    label: '属性定义表',
    description: '维护属性/工艺定义，不在前端暴露内部主键，只展示业务字段。',
  },
  combinations: {
    label: '母体与属性组合表',
    description: '维护每个母体版本参与 SKU 的属性维度和允许选项。',
  },
  skus: {
    label: 'SKU数据总表',
    description: '一行一个 SKU。运营可以查看和导出，国家运费通过最近批次结果导出，不直接平铺在表格里。',
  },
  skuCandidates: {
    label: '待启用SKU',
    description: '笛卡尔积生成后的候选 SKU 先进入这里，维护人员审核和启用后才进入 SKU 数据总表。',
  },
  dimensions: {
    label: 'SKU数据-尺寸数据-仓库维护',
    description: '仓库负责人维护尺寸、重量、包装方案。',
  },
  designTemplates: {
    label: '设计模板中心',
    description: '集中维护模板主数据、SKU 绑定关系和未绑定异常，替代原先的设计模板草稿页。',
  },
  supply: {
    label: 'SKU数据-采购成本价-供应链维护',
    description: '供应链负责人维护成本、带电、膏体、近 60 天数据等。',
  },
  supplyChain: {
    label: '供应链中心',
    description: '集中维护供应商、工厂能力和母体绑定关系。',
  },
  warehouse: {
    label: '仓储包装中心',
    description: '集中维护包装方案与 SKU 发货属性，异常缺失直接高亮。',
  },
  costPricing: {
    label: '成本报价中心',
    description: '集中维护 SKU 成本版本、查看缺失项，并做单 SKU 报价试算和多渠道对比。',
  },
  freightTemplates: {
    label: '物流运费模板记录表',
    description: '查看真实模板、版本、国家规则和重量区间，直接给物流同事核对。',
  },
  freightChannels: {
    label: '物流渠道管理',
    description: '按物流渠道主表维护渠道主数据，支持编辑、启用和禁用。',
  },
  freightCalculator: {
    label: '运费测算',
    description: '按 SKU 或手工重量做多渠道比价，适合演示报价和物流选型。',
  },
  settings: {
    label: '系统设置',
    description: '维护用户、角色权限矩阵和审计日志，统一收口系统级配置。',
  },
  alerts: {
    label: '智能预警',
    description: '展示当前风险预警、推荐结果和运营洞察。',
  },
  reports: {
    label: '报表中心',
    description: '支持高级查询、异常看板、运营指标和全局检索结果汇总。',
  },
};

// ============================================================
// 页面引用与全局状态
// ============================================================

const refs = {
  sidebar: document.getElementById('appSidebar'),
  sidebarBackdrop: document.getElementById('sidebarBackdrop'),
  sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
  pageNav: document.getElementById('pageNav'),
  summaryBar: document.getElementById('summaryBar'),
  pageTitle: document.getElementById('pageTitle'),
  pageDesc: document.getElementById('pageDesc'),
  pageActions: document.getElementById('pageActions'),
  pageContent: document.getElementById('pageContent'),
  headerSignalBar: document.getElementById('headerSignalBar'),
  refreshAllBtn: document.getElementById('refreshAllBtn'),
  globalSearchInput: document.getElementById('globalSearchInput'),
  globalSearchDropdown: document.getElementById('globalSearchDropdown'),
  toast: document.getElementById('toast'),
  modalRoot: document.getElementById('modalRoot'),
};

const state = {
  role: 'it',
  currentPage: 'parents',
  summary: null,
  parents: [],
  parentsDataMode: null,
  parentDetails: {},
  selectedParentVersionId: null,
  parentsView: 'list',
  attributes: null,
  attributeOptionsCache: {},
  combinations: null,
  candidateBatches: null,
  candidateRows: {},
  skus: null,
  currentSkuItems: null,
  skuFilterOptions: null,
  skuDetails: {},
  dimensions: null,
  designs: null,
  designTemplateList: null,
  designTemplateBindings: null,
  unboundDesignSkus: null,
  supply: null,
  suppliers: null,
  factories: null,
  parentSupplierBindings: null,
  packagingPlans: null,
  shippingAttributes: null,
  incompleteShippingAttributes: null,
  skuCosts: {},
  incompleteSkuCosts: null,
  costSummary: null,
  profitEstimate: null,
  channelComparison: null,
  freightComparisonMatrix: null,
  costPricingTab: 'matrix',
  importPreview: null,
  batchOperationLogs: null,
  templates: null,
  templateImportHistory: null,
  templateUploadResults: [],
  channels: null,
  freightChannels: null,
  countries: null,
  countryCoverage: null,
  batches: null,
  batchBestChannels: {},
  users: null,
  permissionMatrix: null,
  auditLogs: null,
  dictionaries: null,
  platformMappings: null,
  notifications: null,
  alerts: null,
  alertSummary: null,
  docsSchema: null,
  recommendationResults: { channel: null, packaging: null, supplier: null },
  insights: { disabled: null, highCost: null, coverage: null },
  reviewHistory: {},
  versionSnapshots: {},
  impactAnalysis: {},
  analytics: null,
  exceptionReports: null,
  globalSearchResults: null,
  filters: {
    parents: '',
    attributes: '',
    combinations: '',
    skuCandidates: '',
    skus: '',
    dimensions: '',
    designs: '',
    designTemplates: '',
    supply: '',
    dictionaries: '',
    globalSearch: '',
  },
  structuredFilters: {
    skuCandidates: { parentName: '', attributeName: '' },
    skus: { parentName: '', attributeName: '', attributeValue: '' },
    dimensions: { parentName: '', attributeName: '', attributeValue: '' },
    designs: { parentName: '', attributeName: '', attributeValue: '' },
    designTemplates: { status: '', bindingStatus: 'all' },
    supply: { parentName: '', attributeName: '', attributeValue: '' },
    shippingAttributes: { parentName: '', attributeName: '', attributeValue: '', incompleteOnly: '' },
  },
  selectedSkuId: null,
  selectedAttributeIndex: 0,
  selectedCombinationIndex: 0,
  selectedDimensionSkuId: null,
  selectedDesignSkuId: null,
  selectedDesignTemplateId: null,
  selectedDesignTemplateView: 'templates',
  designBindingFilter: 'all',
  selectedSupplySkuId: null,
  selectedSupplierId: null,
  selectedFactoryId: null,
  selectedPackagingPlanId: null,
  selectedCostSkuId: null,
  selectedCandidateBatchCode: null,
  selectedBatchCode: null,
  selectedTemplateId: null,
  batchParentVersionId: null,
  selectedCoverageCountryCode: 'US',
  costFilters: { incompleteOnly: true, keyword: '' },
  costMatrixFilters: { keyword: '', selectedCountries: ['US'], pendingCountries: ['US'], expanded: false, countryKeyword: '' },
  pricingForm: { skuId: '', sellingPrice: '', countryCode: 'US', channelId: '' },

  versionForm: { entityType: 'parent', entityId: '', v1: '', v2: '' },
  auditFilter: { entityType: '', userId: '', from: '', to: '' },
  dictionaryFilter: { dictType: '' },
  recommendationForm: { skuId: '1', countryCode: 'US', parentId: '1' },
  advancedQueryForm: { entityType: 'sku', conditions: [{ field: 'status', op: 'eq', value: 1 }] },
  calculatorResult: null,
  pagedViews: {
    skus: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    dimensions: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    designs: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    designTemplates: { page: 1, pageSize: 24, total: 0, totalPages: 1 },
    supply: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    shippingAttributes: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    advancedQuery: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
  },
};

// ============================================================
// 通用工具函数
// ============================================================

// 渲染详情区的单个键值字段
function renderField(label, value) {
  return `<div class="kv"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '未填写')}</strong></div>`;
}

// 渲染详情区的长文本字段
function renderLongField(label, value) {
  return `
    <div class="long-kv full-span">
      <span>${escapeHtml(label)}</span>
      <div class="long-kv-value">${escapeHtml(value || '未填写')}</div>
    </div>
  `;
}

// 转义 HTML 特殊字符，防止 XSS
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 返回当前角色可访问的页面列表
function pageListForRole() {
  return ROLE_CONFIG.it.pages;
}

// 判断当前角色是否具备编辑权限
function roleCanEdit() {
  return ROLE_CONFIG[state.role].mode !== 'viewer';
}

// 判断当前角色是否为只读角色
function roleIsViewer() {
  return ROLE_CONFIG[state.role].mode === 'viewer';
}

// 获取当前页面的配置对象
function currentPageConfig() {
  return PAGE_CONFIG[state.currentPage];
}

// 显示顶部提示消息并自动关闭
function nextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

// 生成表格骨架屏占位行
function skeletonRows(columnCount, rowCount = 6) {
  return Array.from({ length: rowCount }, () => `<tr>${Array.from({ length: columnCount }, () => '<td>···</td>').join('')}</tr>`).join('');
}

// 格式化 CSV 单元格内容
function toCsvCell(value) {
  const text = Array.isArray(value) ? value.join(' | ') : value ?? '';
  return `"${String(text).replace(/"/g, '""')}"`;
}

// 将数据导出为 CSV 文件
function downloadCsv(filename, rows) {
  if (!rows.length) {
    setToast('当前没有可导出的数据');
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(toCsvCell).join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => toCsvCell(row[header])).join(','));
  });
  const blob = new Blob([`\ufeff${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// 读取本地保存的演示草稿
function loadDrafts(key) {
  try {
    return JSON.parse(localStorage.getItem(`pod-demo-draft:${key}`) || '[]');
  } catch (error) {
    return [];
  }
}

// 保存演示草稿到本地缓存
function saveDraft(key, payload) {
  const drafts = loadDrafts(key);
  drafts.unshift({ saved_at: new Date().toLocaleString(), ...payload });
  localStorage.setItem(`pod-demo-draft:${key}`, JSON.stringify(drafts.slice(0, 10)));
  setToast('已保存为演示草稿，当前不会修改正式数据');
}

// 将通用状态值转换为中文标签
function humanStatus(value) {
  if (value === 1 || value === true) return '启用';
  if (value === 0 || value === false) return '禁用';
  if (value === 2) return '待审核';
  if (value === 3) return '已停用';
  if (value === 4) return '已归档';
  return String(value ?? '-');
}

// 将母体生命周期状态转换为中文标签
function humanParentLifecycleStatus(value) {
  if (value === 0) return '草稿';
  if (value === 1) return '启用';
  if (value === 2) return '待审核';
  if (value === 3) return '已停用';
  if (value === 4) return '已归档';
  return String(value ?? '-');
}

// 将 SKU 生命周期状态转换为中文标签
function humanSkuLifecycleStatus(value) {
  if (value === 0) return '待确认';
  if (value === 1) return '已启用';
  if (value === 2) return '待审核';
  if (value === 3) return '已停用';
  if (value === 4) return '历史SKU';
  return String(value ?? '-');
}
function renderStarRating(level) {
  var text = String(level || '');
  var starCount = (text.match(/⭐/g) || []).length || (text.match(/★/g) || []).length;
  if (!starCount && text) {
    var num = parseInt(text, 10);
    if (num > 0 && num <= 5) starCount = num;
  }
  if (!starCount) return '<span class="muted">未评级</span>';
  var filled = '★'.repeat(Math.min(starCount, 5));
  var empty = '☆'.repeat(Math.max(0, 5 - starCount));
  return '<span style="color:#f5a623;letter-spacing:2px;">' + filled + empty + '</span>';
}

// 渲染标签样式文本
function badge(label, kind = 'maintainer') {
  return `<span class="permission-tag ${kind}">${escapeHtml(label)}</span>`;
}

// 渲染状态胶囊标签
function statusPill(label, kind) {
  return `<span class="status-pill ${kind}">${escapeHtml(label)}</span>`;
}

// 根据状态值返回对应的展示样式
function statusKind(value) {
  if (value === 1 || value === true) return 'ok';
  if (value === 0 || value === false) return 'viewer';
  if (value === 2) return 'warn';
  if (value === 3 || value === 4) return 'fail';
  return 'viewer';
}

// 渲染编码规则提示信息
function codingRuleCallout(rules = {}, type = 'parent') {
  const text = rules?.[type] || '';
  if (!text) return '';
  return `<div class="callout" style="margin-top:12px;">${escapeHtml(text)}</div>`;
}

// 将设计模板状态转换为中文标签
function designTemplateStatusLabel(value) {
  if (value === 1) return '启用';
  if (value === 0) return '禁用';
  if (value === 2) return '失效';
  return String(value ?? '-');
}

// 更新实体状态并提示结果
function buildSelectOptions(options, selectedValue, allLabel = '全部') {
  return [`<option value="">${escapeHtml(allLabel)}</option>`]
    .concat((options || []).map((option) => `<option value="${escapeHtml(option)}" ${option === selectedValue ? 'selected' : ''}>${escapeHtml(option)}</option>`))
    .join('');
}

// 按键名复用防抖定时器
function debounce(key, callback, delay = 300) {
  window.clearTimeout(debounce.timers?.[key]);
  debounce.timers = debounce.timers || {};
  debounce.timers[key] = window.setTimeout(callback, delay);
}

// 生成缺省图片占位内容
function placeholderImage(code) {
  return `<div class="parent-code-pill">${escapeHtml(code)}</div>`;
}

// ============================================================
// 数据加载与缓存
// ============================================================

// 加载首页摘要数据并写入缓存
function numberDisplay(value, digits = 2) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '-';
  return num.toFixed(digits);
}

// 格式化整数并输出千分位
function integerDisplay(value) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return Math.max(0, Math.trunc(num)).toLocaleString('zh-CN');
}

// 将多行文本解析为 JSON 数组
function arrayFromTextarea(text) {
  return String(text || '').split(/[\n]/).map((line) => line.trim()).filter(Boolean).map((line) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      return null;
    }
  }).filter(Boolean);
}

// 按关键字过滤列表数据
function filteredRows(rows, keyword, fields) {
  if (!keyword) return rows;
  return rows.filter((row) => fields.some((field) => String(row[field] ?? '').includes(keyword)));
}

// 构建组合编辑器的初始状态
function renderServerPagination(viewKey) {
  const pager = state.pagedViews[viewKey];
  if (!pager || pager.totalPages <= 1) return '';
  const maxVisible = 7;
  const pages = [];
  let startPage = Math.max(1, pager.page - Math.floor(maxVisible / 2));
  let endPage = Math.min(pager.totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  if (startPage > 1) {
    pages.push(`<button type="button" class="pagination-btn" data-page-key="${viewKey}" data-page="1">1</button>`);
    if (startPage > 2) pages.push('<span class="pagination-ellipsis">…</span>');
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(`<button type="button" class="pagination-btn ${i === pager.page ? 'active' : ''}" data-page-key="${viewKey}" data-page="${i}">${i}</button>`);
  }
  if (endPage < pager.totalPages) {
    if (endPage < pager.totalPages - 1) pages.push('<span class="pagination-ellipsis">…</span>');
    pages.push(`<button type="button" class="pagination-btn" data-page-key="${viewKey}" data-page="${pager.totalPages}">${pager.totalPages}</button>`);
  }
  return `
    <nav class="pagination">
      <button type="button" class="pagination-btn" data-page-key="${viewKey}" data-page="${pager.page - 1}" ${pager.page <= 1 ? 'disabled' : ''}>上一页</button>
      ${pages.join('')}
      <button type="button" class="pagination-btn" data-page-key="${viewKey}" data-page="${pager.page + 1}" ${pager.page >= pager.totalPages ? 'disabled' : ''}>下一页</button>
      <span class="pagination-info">共 ${pager.total} 条 · 第 ${pager.page}/${pager.totalPages} 页</span>
    </nav>
  `;
}

// 将渠道分类转换为中文标签
function routeCategoryLabel(value) {
  if (value === 'standard') return '标准';
  if (value === 'express') return '快线';
  if (value === 'remote') return '偏远';
  if (value === 'commercial_express') return '商快';
  return String(value || '-');
}

// 按大区对国家列表进行分组
function countryRegionGroups(countryRows = []) {
  const groups = {
    北美: ['US', 'CA', 'MX'],
    欧洲: ['DE', 'GB', 'FR', 'ES', 'IT', 'NL', 'BE', 'PL', 'SE', 'CH', 'AT', 'IE'],
    东南亚: ['SG', 'MY', 'TH', 'VN', 'PH', 'ID'],
    其他: [],
  };
  const grouped = { 北美: [], 欧洲: [], 东南亚: [], 其他: [] };
  countryRows.forEach((country) => {
    const code = String(country.country_code || '').toUpperCase();
    const target = Object.entries(groups).find(([, codes]) => codes.includes(code))?.[0] || '其他';
    grouped[target].push(country);
  });
  return grouped;
}

// 对国家代码去重并统一格式
function uniqueCountryCodes(codes = []) {
  return [...new Set((codes || []).map((code) => String(code || '').toUpperCase()).filter(Boolean))];
}

// 构建国家代码到名称的映射表
function countryLabelMap(countryRows = []) {
  const map = new Map();
  (countryRows || []).forEach((country) => {
    const code = String(country.country_code || '').toUpperCase();
    if (!code) return;
    map.set(code, country.country_name_cn || country.country_name_en || code);
  });
  return map;
}

// 根据国家代码返回展示名称
function countryLabelByCode(countryCode, labelMap) {
  const code = String(countryCode || '').toUpperCase();
  return labelMap?.get(code) || code || '-';
}

// 格式化运费矩阵单元格展示内容
function freightCellDisplay(cell) {
  if (!cell) return { text: '-', kind: 'empty', fee: null, feeText: '', channelName: '', shortName: '', tooltip: '' };
  if (cell.blocked) {
    return {
      text: '不可发',
      kind: 'blocked',
      fee: null,
      feeText: '',
      channelName: '不可发',
      shortName: '不可发',
      tooltip: cell.unavailable_reason || '不可发',
    };
  }
  const fee = Number(cell.total_fee);
  const channelName = String(cell.channel_name || '-');
  const shortName = channelName.split(/[-（(]/)[0].trim() || channelName;
  return {
    text: `${shortName} ¥${numberDisplay(fee)}`,
    kind: 'ok',
    fee,
    feeText: Number.isFinite(fee) ? numberDisplay(fee) : '',
    channelName,
    shortName,
    tooltip: channelName || '',
  };
}

// 判断运费单元格的高亮样式
function freightCellTone(fee, allFees = []) {
  if (!Number.isFinite(fee)) return 'empty';
  const sorted = [...allFees].filter((item) => Number.isFinite(item)).sort((a, b) => a - b);
  if (!sorted.length) return 'empty';
  if (fee === sorted[0]) return 'best';
  return 'plain';
}

// 为分页按钮绑定翻页事件
function bindServerPagination(viewKey, renderPage) {
  document.querySelectorAll(`[data-page-key="${viewKey}"]`).forEach((button) => {
    button.addEventListener('click', async () => {
      const page = Number(button.dataset.page);
      const pager = state.pagedViews[viewKey];
      if (!pager || page < 1 || page > pager.totalPages) return;
      state.pagedViews[viewKey].page = page;
      await renderPage();
      refs.pageContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// 获取当前最新的运费批次
function latestBatch() {
  return state.batches && state.batches.length ? state.batches[0] : null;
}

// 获取当前选中母体的详情缓存
function currentParentDetail() {
  return state.parentDetails[state.selectedParentVersionId] || null;
}

// 渲染产品母体管理页面
function formatSkuPackageDimensions(dimensionRow) {
  if (!dimensionRow) return '-';
  const l = dimensionRow.after_pack_length_cm ?? '-';
  const w = dimensionRow.after_pack_width_cm ?? '-';
  const h = dimensionRow.after_pack_height_cm ?? '-';
  return `${l} × ${w} × ${h}`;
}

// 格式化 SKU 重量与计费重展示
function formatSkuWeightAndChargeable(detail) {
  const weight = detail?.after_pack_weight_g ?? detail?.sku_dimension_weight?.after_pack_weight_g;
  const chargeable = detail?.chargeable_weight_override_g ?? detail?.sku_dimension_weight?.chargeable_weight_override_g;
  const left = weight ? `${weight}g` : '-';
  const right = chargeable ? `${chargeable}g` : '-';
  return { weight: left, chargeable: right };
}

// 打开 SKU 详情弹窗
