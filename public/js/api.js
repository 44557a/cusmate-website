// ============================================================
// API 请求辅助
// ============================================================

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `请求失败：${response.status}`);
  }
  return payload;
}

// 等待下一帧渲染完成后继续执行
async function updateEntityStatus(path, status, message) {
  await api(path, { method: 'POST', body: JSON.stringify({ status }) });
  setToast(message || '状态已更新');
}

// 生成下拉框选项 HTML
async function ensureSummary() {
  if (!state.summary) {
    state.summary = (await api('/api/v1/dashboard/summary')).data;
  }
}

// 加载指定实体的审核历史
async function ensureReviewHistory(entityType, entityId) {
  const cacheKey = `${entityType}:${entityId}`;
  if (!state.reviewHistory[cacheKey]) {
    state.reviewHistory[cacheKey] = (await api(`/api/v1/review/history?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`)).data;
  }
  return state.reviewHistory[cacheKey];
}

// 确保版本快照缓存已初始化
async function ensureVersionSnapshots(entityType, entityId) {
  const cacheKey = `${entityType}:${entityId}`;
  if (!state.versionSnapshots[cacheKey]) {
    state.versionSnapshots[cacheKey] = [];
  }
  return state.versionSnapshots[cacheKey];
}

// 加载指定实体的影响分析数据
async function ensureImpactAnalysis(entityType, entityId) {
  const cacheKey = `${entityType}:${entityId}`;
  if (!state.impactAnalysis[cacheKey]) {
    state.impactAnalysis[cacheKey] = (await api(`/api/v1/impact-analysis?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`)).data;
  }
  return state.impactAnalysis[cacheKey];
}

// 加载报表分析数据
async function ensureAnalytics() {
  if (!state.analytics) {
    state.analytics = (await api('/api/v1/reports/analytics')).data;
  }
}

// 加载异常报表数据
async function ensureExceptionReports() {
  if (!state.exceptionReports) {
    state.exceptionReports = (await api('/api/v1/reports/exceptions')).data;
  }
}

// 加载系统设置页所需数据
async function ensureSettingsCenter() {
  if (!state.users) state.users = (await api('/api/v1/users')).data;
  if (!state.permissionMatrix) state.permissionMatrix = (await api('/api/v1/permissions/matrix')).data;
  if (!state.auditLogs) state.auditLogs = (await api('/api/v1/audit-log')).data;
  if (!state.dictionaries) {
    const dictType = state.dictionaryFilter.dictType;
    const query = dictType ? `?dict_type=${encodeURIComponent(dictType)}` : '';
    state.dictionaries = (await api(`/api/v1/dictionaries${query}`)).data;
  }
}

// 加载集成与通知中心数据
async function ensureIntegrationCenter() {
  if (!state.platformMappings) state.platformMappings = (await api('/api/v1/platform-sku-mappings')).data;
  if (!state.docsSchema) state.docsSchema = (await api('/api/v1/docs')).data;
  if (!state.notifications) state.notifications = (await api('/api/v1/notifications')).data;
}

// 加载预警中心和洞察数据
async function ensureAlertsCenter() {
  if (!state.alerts) state.alerts = (await api('/api/v1/alerts')).data;
  if (!state.alertSummary) state.alertSummary = (await api('/api/v1/alerts/summary')).data;
  if (!state.insights.disabled) state.insights.disabled = (await api('/api/v1/insights/frequently-disabled-skus')).data;
  if (!state.insights.highCost) state.insights.highCost = (await api('/api/v1/insights/high-cost-channels')).data;
  if (!state.insights.coverage) state.insights.coverage = (await api('/api/v1/insights/coverage-gaps')).data;
}

// 执行全局搜索并缓存结果
async function runGlobalSearch(keyword) {
  const q = String(keyword || '').trim();
  if (!q) {
    state.globalSearchResults = null;
    return null;
  }
  state.globalSearchResults = (await api(`/api/v1/search?q=${encodeURIComponent(q)}`)).data;
  return state.globalSearchResults;
}

// 加载母体列表数据并按模式缓存
async function ensureParents(mode = 'compact') {
  const requestedMode = mode === 'full' ? 'full' : 'compact';
  const needsFetch = !state.parents.length || (requestedMode === 'full' && state.parentsDataMode !== 'full');
  if (needsFetch) {
    const query = requestedMode === 'compact' ? '?compact=1' : '';
    state.parents = (await api(`/api/v1/parents${query}`)).data;
    state.parentsDataMode = requestedMode;
    const sample = state.parents.find((item) => item.current_parent_version_code === 'CM006A') || state.parents[0];
    if (sample && !state.selectedParentVersionId) {
      state.selectedParentVersionId = sample.current_version_id;
      state.batchParentVersionId = sample.current_version_id;
    }
  }
}

// 加载指定母体版本的详情数据
async function ensureParentDetail(parentVersionId) {
  if (!state.parentDetails[parentVersionId]) {
    state.parentDetails[parentVersionId] = (await api(`/api/v1/parent-versions/${parentVersionId}`)).data;
  }
  return state.parentDetails[parentVersionId];
}

// 加载属性定义及其可选项数据
async function ensureAttributes() {
  if (!state.attributes) {
    // 预先缓存每个属性的选项，减少后续重复请求
    state.attributes = (await api('/api/v1/attributes')).data;
    state.attributeOptionsCache = {};
    await Promise.all(state.attributes.map(async (attr) => {
      state.attributeOptionsCache[attr.id] = (await api(`/api/v1/attributes/${attr.id}/options`)).data;
    }));
  }
}

// 加载母体组合配置数据
async function ensureCombinations() {
  if (!state.combinations) {
    state.combinations = (await api('/api/v1/parent-combination-groups')).data;
  }
}

// 加载母体组合统计信息
async function ensureCombinationStatistics(parentVersionId) {
  return (await api(`/api/v1/combinations/statistics?parent_version_id=${encodeURIComponent(parentVersionId)}`)).data;
}

// 根据筛选条件拼接查询参数
function buildSkuQueryParams(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

// 加载 SKU 相关筛选项数据
async function ensureSkuFilterOptions() {
  if (!state.skuFilterOptions) {
    state.skuFilterOptions = (await api('/api/v1/skus/filter-options')).data;
  }
}

// 加载 SKU 列表并按查询条件缓存
async function ensureSkus(filters = {}) {
  const query = buildSkuQueryParams(filters);
  const cacheKey = query || '__default__';
  if (!state.skus || !state.skus[cacheKey]) {
    state.skus = state.skus || {};
    state.skus[cacheKey] = (await api(`/api/v1/skus${query}`)).data;
  }
  return state.skus[cacheKey];
}

// 加载服务端分页数据并同步分页状态
async function fetchPagedCollection(path, viewKey, filters = {}, page = 1, pageSize = 50) {
  const query = buildSkuQueryParams({ ...filters, page, page_size: pageSize });
  const payload = (await api(`${path}${query}`)).data;
  state.pagedViews[viewKey] = {
    page: payload.page,
    pageSize: payload.page_size,
    total: payload.total,
    totalPages: payload.total_pages,
  };
  return payload;
}

// 加载当前筛选条件下的全量数据
async function fetchAllCollection(path, filters = {}) {
  const query = buildSkuQueryParams({ ...filters, page: 1, page_size: 99999 });
  return (await api(`${path}${query}`)).data.items || [];
}

// 加载指定 SKU 的详情数据
async function ensureSkuDetail(skuId) {
  if (!state.skuDetails[skuId]) {
    state.skuDetails[skuId] = (await api(`/api/v1/skus/${skuId}`)).data;
  }
  return state.skuDetails[skuId];
}

// 加载指定 SKU 的引用关系数据
async function ensureSkuReferences(skuId) {
  const detail = await ensureSkuDetail(skuId);
  if (!detail.references) {
    detail.references = (await api(`/api/v1/skus/${skuId}/references`)).data;
  }
  return detail.references;
}

// 加载 SKU 尺寸数据并按条件缓存
async function ensureDimensions(filters = {}) {
  const query = buildSkuQueryParams(filters);
  const cacheKey = query || '__default__';
  if (!state.dimensions || !state.dimensions[cacheKey]) {
    state.dimensions = state.dimensions || {};
    state.dimensions[cacheKey] = (await api(`/api/v1/sku-dimensions${query}`)).data;
  }
  return state.dimensions[cacheKey];
}

// 加载 SKU 设计数据并按条件缓存
async function ensureDesigns(filters = {}) {
  const query = buildSkuQueryParams(filters);
  const cacheKey = query || '__default__';
  if (!state.designs || !state.designs[cacheKey]) {
    state.designs = state.designs || {};
    state.designs[cacheKey] = (await api(`/api/v1/sku-designs${query}`)).data;
  }
  return state.designs[cacheKey];
}

// 加载 SKU 供应链数据并按条件缓存
async function ensureSupply(filters = {}) {
  const query = buildSkuQueryParams(filters);
  const cacheKey = query || '__default__';
  if (!state.supply || !state.supply[cacheKey]) {
    state.supply = state.supply || {};
    state.supply[cacheKey] = (await api(`/api/v1/sku-supply${query}`)).data;
  }
  return state.supply[cacheKey];
}

// 加载设计模板中心的列表与绑定数据
async function ensureDesignTemplateCenter() {
  const keyword = state.filters.designTemplates;
  const status = state.structuredFilters.designTemplates.status;
  const page = state.pagedViews.designTemplates.page;
  const pageSize = state.pagedViews.designTemplates.pageSize;
  const templatePayload = (await api(`/api/v1/design-templates${buildSkuQueryParams({ keyword, status, page, page_size: pageSize })}`)).data;
  state.designTemplateList = templatePayload.items || [];
  state.pagedViews.designTemplates = {
    page: templatePayload.page,
    pageSize: templatePayload.page_size,
    total: templatePayload.total,
    totalPages: templatePayload.total_pages,
  };
  if (!state.selectedDesignTemplateId && state.designTemplateList.length) {
    state.selectedDesignTemplateId = state.designTemplateList[0].template_id;
  }
  if (state.selectedDesignTemplateId && !state.designTemplateList.find((item) => item.template_id === state.selectedDesignTemplateId) && state.designTemplateList.length) {
    state.selectedDesignTemplateId = state.designTemplateList[0].template_id;
  }
  state.designTemplateBindings = (await api(`/api/v1/sku-template-bindings${buildSkuQueryParams({ binding_filter: state.designBindingFilter })}`)).data;
  state.unboundDesignSkus = (await api('/api/v1/design-templates/unbound-skus')).data;
}

// 加载供应商、工厂和绑定台账数据
async function ensureSupplyChainCenter() {
  state.suppliers = (await api('/api/v1/suppliers')).data;
  state.factories = (await api('/api/v1/factories')).data;
  state.parentSupplierBindings = (await api('/api/v1/parent-supplier-bindings')).data;
  if (!state.selectedSupplierId && state.suppliers.length) {
    state.selectedSupplierId = state.suppliers[0].id;
  }
  if (!state.selectedFactoryId && state.factories.length) {
    state.selectedFactoryId = state.factories[0].id;
  }
}

// 加载仓储包装中心所需数据
async function ensureWarehouseCenter() {
  state.packagingPlans = (await api('/api/v1/packaging-plans')).data;
  state.incompleteShippingAttributes = (await api('/api/v1/sku-shipping-attributes/incomplete')).data;
  if (!state.selectedPackagingPlanId && state.packagingPlans.length) {
    state.selectedPackagingPlanId = state.packagingPlans[0].id;
  }
}

// 加载成本报价中心的核心数据
async function ensureCostPricingCenter() {
  const incompleteResp = await api('/api/v1/sku-costs/incomplete?limit=20');
  state.incompleteSkuCosts = incompleteResp.data || [];
  state.incompleteSkuCostTotal = incompleteResp.count || 0;
  if (!state.selectedCostSkuId) {
    const firstIncomplete = state.incompleteSkuCosts[0];
    state.selectedCostSkuId = firstIncomplete?.sku_id || 1;
  }
  await ensureCountries();
  await ensureCostComparisonMatrix();
}

// 加载多国家运费比价矩阵数据
async function ensureCostComparisonMatrix(forceRefresh = false) {
  const selectedCountries = (state.costMatrixFilters.selectedCountries || []).filter(Boolean);
  if (!selectedCountries.length) {
    state.freightComparisonMatrix = null;
    return null;
  }
  if (forceRefresh || !state.freightComparisonMatrix) {
    // 统一按当前国家、分页和关键字生成比价矩阵
    const payload = await api('/api/v1/freight/comparison-matrix', {
      method: 'POST',
      body: JSON.stringify({
        country_codes: selectedCountries,
        calc_date: new Date().toISOString().slice(0, 10),
        page: state.pagedViews.skus.page,
        page_size: state.pagedViews.skus.pageSize,
        keyword: state.costMatrixFilters.keyword || '',
      }),
    });
    state.freightComparisonMatrix = payload;
    const pageMeta = payload.page_meta || {};
    state.pagedViews.skus = {
      page: pageMeta.page || 1,
      pageSize: pageMeta.page_size || 50,
      total: pageMeta.total || 0,
      totalPages: pageMeta.total_pages || 1,
    };
  }
  return state.freightComparisonMatrix;
}

// 触发国家运费预计算任务
async function triggerFreightPrecompute(countryCodes = null) {
  const payload = await api('/api/v1/freight/precompute', {
    method: 'POST',
    body: JSON.stringify({
      country_codes: countryCodes || (state.costMatrixFilters.selectedCountries || []),
      calc_date: new Date().toISOString().slice(0, 10),
    }),
  });
  return payload.data;
}

// 生成预计算结果导出地址
function buildPrecomputedExportUrl(format = 'json') {
  const selectedCountries = (state.costMatrixFilters.selectedCountries || []).filter(Boolean);
  const params = new URLSearchParams();
  if (selectedCountries.length) params.set('country_codes', selectedCountries.join(','));
  params.set('format', format);
  return `/api/v1/freight/precomputed/export?${params.toString()}`;
}

// 加载运费模板列表并初始化选中项
async function ensureTemplates() {
  if (!state.templates) {
    state.templates = (await api('/api/v1/freight/templates')).data;
    if (!state.selectedTemplateId && state.templates.length) {
      state.selectedTemplateId = state.templates[0].id;
    }
  }
}

// 加载运费模板导入历史
async function ensureTemplateImportHistory() {
  if (!state.templateImportHistory) {
    state.templateImportHistory = (await api('/api/v1/freight/templates/import-history')).data;
  }
}

// 将渠道类型转换为中文标签
function freightChannelTypeLabel(value) {
  if (value === 'normal' || value === 'standard') return '普货渠道';
  if (value === 'special') return '特货渠道';
  if (value === 'sensitive' || value === 'cosmetics') return '敏感货渠道';
  return String(value || '-');
}

// 将上传文件读取为 Base64 内容
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(new Error(`读取文件失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

// 刷新运费模板相关缓存数据
async function refreshFreightTemplateData(selectedTemplateId = state.selectedTemplateId) {
  state.templates = null;
  state.templateImportHistory = null;
  state.freightChannels = null;
  await ensureTemplates();
  await ensureTemplateImportHistory();
  await ensureFreightChannels();
  if (selectedTemplateId && state.templates.some((item) => item.id === selectedTemplateId)) {
    state.selectedTemplateId = selectedTemplateId;
  } else if (state.templates.length) {
    state.selectedTemplateId = state.templates[0].id;
  } else {
    state.selectedTemplateId = null;
  }
}

// 提交运费模板上传或替换请求
async function submitFreightTemplateUpload(files, effectiveFrom, mode = 'single', templateId = null) {
  const pickedFiles = Array.from(files || []);
  if (!pickedFiles.length) {
    setToast('先选择 Excel 文件');
    return [];
  }
  const encodedFiles = await Promise.all(pickedFiles.map(async (file) => ({
    filename: file.name,
    file_data: await readFileAsBase64(file),
    effective_from: effectiveFrom,
  })));
  let results = [];
  if (mode === 'replace') {
    const payload = await api(`/api/v1/freight/templates/${templateId}/replace`, {
      method: 'POST',
      body: JSON.stringify(encodedFiles[0]),
    });
    results = [payload.data];
  } else if (mode === 'batch' || encodedFiles.length > 1) {
    const payload = await api('/api/v1/freight/templates/upload-batch', {
      method: 'POST',
      body: JSON.stringify({ files: encodedFiles, effective_from: effectiveFrom }),
    });
    results = payload.data.results || [];
  } else {
    const payload = await api('/api/v1/freight/templates/upload', {
      method: 'POST',
      body: JSON.stringify(encodedFiles[0]),
    });
    results = [payload.data];
  }
  state.templateUploadResults = results;
  await refreshFreightTemplateData(results[0]?.template_id || templateId || state.selectedTemplateId);
  return results;
}

// 加载可参与计费的渠道数据
async function ensureChannels() {
  if (!state.channels) {
    state.channels = (await api('/api/v1/channels?billing_enabled=1')).data;
  }
}

// 加载物流渠道主数据
async function ensureFreightChannels() {
  if (!state.freightChannels) {
    state.freightChannels = (await api('/api/v1/freight/channel-master')).data;
  }
}

// 加载国家列表并初始化默认国家
async function ensureCountries() {
  if (!state.countries) {
    state.countries = (await api('/api/v1/countries')).data;
    if (!state.selectedCoverageCountryCode && state.countries.length) {
      state.selectedCoverageCountryCode = state.countries[0].country_code;
    }
  }
}

// 加载运费批次列表并初始化选中项
async function ensureBatches() {
  if (!state.batches) {
    state.batches = (await api('/api/v1/freight/batches')).data;
    if (!state.selectedBatchCode && state.batches.length) {
      state.selectedBatchCode = state.batches[0].batch_code;
    }
  }
}

// 加载候选 SKU 批次列表
async function ensureCandidateBatches() {
  if (!state.candidateBatches) {
    state.candidateBatches = (await api('/api/v1/sku-candidate-batches')).data;
    if (!state.selectedCandidateBatchCode && state.candidateBatches.length) {
      state.selectedCandidateBatchCode = state.candidateBatches[0].batch_code;
    }
  }
}

// 加载指定候选批次的明细数据
async function ensureCandidateRows(batchCode) {
  if (!batchCode) return [];
  if (!state.candidateRows[batchCode]) {
    state.candidateRows[batchCode] = (await api(`/api/v1/sku-candidate-batches/${encodeURIComponent(batchCode)}/candidates`)).data;
  }
  return state.candidateRows[batchCode];
}

// 按母体版本同步生成候选 SKU 批次
async function syncCandidateBatch(parentVersionId) {
  const payload = await api('/api/v1/sku-candidate-batches/sync', {
    method: 'POST',
    body: JSON.stringify({ parent_version_id: Number(parentVersionId), operator_name: 'IT 开发人员' }),
  });
  state.candidateRows = {};
  await ensureCandidateBatches();
  state.selectedCandidateBatchCode = payload.data.batch.batch_code;
  return payload.data;
}

// 加载批次最优渠道结果
async function ensureBatchBestChannels(batchCode) {
  if (!state.batchBestChannels[batchCode]) {
    state.batchBestChannels[batchCode] = (await api(`/api/v1/freight/best-channels?batch_code=${encodeURIComponent(batchCode)}`)).data;
  }
  return state.batchBestChannels[batchCode];
}

// ============================================================
// 页面渲染函数
// ============================================================

// 渲染左侧页面导航并绑定切换事件
