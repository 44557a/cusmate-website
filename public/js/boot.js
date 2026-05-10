// ============================================================
// 启动与初始化
// ============================================================

async function refreshAll() {
  state.summary = null;
  state.parents = [];
  state.parentsDataMode = null;
  state.parentDetails = {};
  state.attributes = null;
  state.combinations = null;
  state.candidateBatches = null;
  state.candidateRows = {};
  state.skus = null;
  state.currentSkuItems = null;
  state.skuDetails = {};
  state.dimensions = null;
  state.designs = null;
  state.designTemplateList = null;
  state.designTemplateBindings = null;
  state.unboundDesignSkus = null;
  state.supply = null;
  state.suppliers = null;
  state.factories = null;
  state.parentSupplierBindings = null;
  state.packagingPlans = null;
  state.shippingAttributes = null;
  state.incompleteShippingAttributes = null;
  state.skuCosts = {};
  state.incompleteSkuCosts = null;
  state.costSummary = null;
  state.profitEstimate = null;
  state.channelComparison = null;
   state.freightComparisonMatrix = null;
  state.importPreview = null;
  state.batchOperationLogs = null;
  state.pagedViews = {
    skus: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    dimensions: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    designs: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    designTemplates: { page: 1, pageSize: 24, total: 0, totalPages: 1 },
    supply: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
    shippingAttributes: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
  };
  state.templates = null;
  state.templateImportHistory = null;
  state.templateUploadResults = [];
  state.channels = null;
  state.freightChannels = null;
  state.countries = null;
  state.countryCoverage = null;
  state.batches = null;
  state.selectedCandidateBatchCode = null;
  state.batchBestChannels = {};
  state.users = null;
  state.permissionMatrix = null;
  state.auditLogs = null;
  state.dictionaries = null;
  state.platformMappings = null;
  state.notifications = null;
  state.alerts = null;
  state.alertSummary = null;
  state.docsSchema = null;
  state.recommendationResults = { channel: null, packaging: null, supplier: null };
  state.insights = { disabled: null, highCost: null, coverage: null };
  state.reviewHistory = {};
  state.versionSnapshots = {};
  state.impactAnalysis = {};
  state.analytics = null;
  state.exceptionReports = null;
  state.globalSearchResults = null;
  state.calculatorResult = null;
  renderShell();
  await renderCurrentPage();
  setToast('数据已刷新');
}

// ============================================================
// 启动与初始化
// ============================================================

// 执行页面初始外壳渲染
async function initialLoad() {
  renderShell();
}

// 绑定全局事件并启动页面初始化
async function boot() {
  refs.refreshAllBtn.addEventListener('click', refreshAll);
  if (refs.sidebarToggleBtn) {
    refs.sidebarToggleBtn.addEventListener('click', () => {
      const nextOpen = !document.body.classList.contains('sidebar-open');
      document.body.classList.toggle('sidebar-open', nextOpen);
      refs.sidebarToggleBtn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    });
  }
  refs.sidebarBackdrop?.addEventListener('click', () => {
    document.body.classList.remove('sidebar-open');
    refs.sidebarToggleBtn?.setAttribute('aria-expanded', 'false');
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      document.body.classList.remove('sidebar-open');
      refs.sidebarToggleBtn?.setAttribute('aria-expanded', 'false');
    }
  });
  if (refs.globalSearchInput) {
    refs.globalSearchInput.addEventListener('input', (event) => {
      const keyword = event.target.value.trim();
      debounce('globalSearch', async () => {
        await runGlobalSearch(keyword);
        renderGlobalSearchDropdown();
      }, 250);
    });
    refs.globalSearchInput.addEventListener('focus', () => {
      if (state.globalSearchResults) renderGlobalSearchDropdown();
    });
    document.addEventListener('click', (event) => {
      if (!refs.globalSearchDropdown || !refs.globalSearchInput) return;
      if (refs.globalSearchDropdown.contains(event.target) || refs.globalSearchInput.contains(event.target)) return;
      refs.globalSearchDropdown.innerHTML = '';
    });
  }
  try {
    await initialLoad();
    await renderCurrentPage();
  } catch (error) {
    refs.pageContent.innerHTML = `<div class="surface empty-state">初始化失败：${escapeHtml(error.message)}</div>`;
  }
}

boot();
