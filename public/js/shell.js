// ============================================================
// 页面外壳、导航与全局交互
// ============================================================

function setToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add('show');
  window.clearTimeout(setToast._timer);
  setToast._timer = window.setTimeout(() => refs.toast.classList.remove('show'), 2200);
}

// 关闭当前弹窗并清空内容
function closeModal() {
  if (refs.modalRoot) {
    refs.modalRoot.innerHTML = '';
  }
}

// 打开可提交表单的通用弹窗
function openModal(title, description, bodyHtml, onSubmit) {
  if (!refs.modalRoot) return;
  refs.modalRoot.innerHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p class="page-desc">${escapeHtml(description || '')}</p>
          </div>
          <button type="button" class="icon-btn" id="modalCloseBtn">×</button>
        </div>
        <form id="modalForm" class="form-grid">
          ${bodyHtml}
          <div class="full-span inline-actions">
            <button type="submit" class="accent-btn">保存</button>
            <button type="button" class="ghost-btn" id="modalCancelBtn">取消</button>
          </div>
        </form>
      </div>
    </div>
  `;
  // 绑定弹窗关闭按钮事件
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  // 绑定弹窗取消按钮事件
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
  // 点击遮罩时关闭弹窗
  document.getElementById('modalOverlay').addEventListener('click', (event) => {
    if (event.target.id === 'modalOverlay') closeModal();
  });
  // 提交弹窗表单并回传数据
  document.getElementById('modalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formElement = event.target;
    const payload = Object.fromEntries(new FormData(formElement).entries());
    Promise.resolve(onSubmit(payload, formElement)).finally(() => {
      closeModal();
    });
  });
}

// 打开只读详情弹窗
function openReadOnlyModal(title, description, bodyHtml) {
  if (!refs.modalRoot) return;
  refs.modalRoot.innerHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p class="page-desc">${escapeHtml(description || '')}</p>
          </div>
          <button type="button" class="icon-btn" id="modalCloseBtn">×</button>
        </div>
        <div>${bodyHtml}</div>
      </div>
    </div>
  `;
  // 绑定弹窗关闭按钮事件
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  // 点击遮罩时关闭弹窗
  document.getElementById('modalOverlay').addEventListener('click', (event) => {
    if (event.target.id === 'modalOverlay') closeModal();
  });
}

// ============================================================
// API 请求辅助
// ============================================================

// 统一封装前端 API 请求与错误处理
function renderPageNav() {
  // 根据角色动态生成可见页面导航
  refs.pageNav.innerHTML = pageListForRole().map((pageKey) => `
    <button
      type="button"
      class="nav-item ${state.currentPage === pageKey ? 'active' : ''}"
      data-page="${pageKey}"
      aria-current="${state.currentPage === pageKey ? 'page' : 'false'}"
    >
      <strong>${escapeHtml(PAGE_CONFIG[pageKey].label)}</strong>
    </button>
  `).join('');
  refs.pageNav.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.currentPage = button.dataset.page;
      if (state.currentPage === 'parents') {
        state.parentsView = 'list';
      }
      document.body.classList.remove('sidebar-open');
      refs.sidebarToggleBtn?.setAttribute('aria-expanded', 'false');
      renderShell();
      await renderCurrentPage();
    });
  });
}

// 渲染页面顶部摘要栏
function renderSummaryBar() {
  refs.summaryBar.innerHTML = '';
}

// 渲染页面标题、说明和头部状态区
function renderPageChrome() {
  const page = currentPageConfig();
  refs.pageTitle.textContent = page.label;
  refs.pageDesc.textContent = page.description;
  refs.pageActions.innerHTML = '';
  refs.sidebarToggleBtn?.setAttribute('aria-expanded', document.body.classList.contains('sidebar-open') ? 'true' : 'false');
  renderHeaderSignalBar();
}

// 渲染头部预警与通知入口
function renderHeaderSignalBar() {
  if (!refs.headerSignalBar) return;
  const notifications = state.notifications || [];
  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const alertSummary = state.alertSummary || { total: 0, critical: 0, warning: 0 };
  // 头部状态区统一汇总预警和通知入口
  refs.headerSignalBar.innerHTML = `
    <button type="button" class="signal-chip" id="headerAlertBtn">预警 ${alertSummary.total ? `<span class="signal-badge warn">${escapeHtml(alertSummary.total)}</span>` : ''}</button>
    <div class="signal-dropdown-wrap">
      <button type="button" class="signal-chip" id="headerNotificationBtn">通知 ${unreadCount ? `<span class="signal-badge danger">${escapeHtml(unreadCount)}</span>` : ''}</button>
      <div id="headerNotificationDropdown" class="signal-dropdown hidden"></div>
    </div>
  `;
  document.getElementById('headerAlertBtn')?.addEventListener('click', async () => {
    state.currentPage = 'alerts';
    renderShell();
    await renderCurrentPage();
  });
  document.getElementById('headerNotificationBtn')?.addEventListener('click', async () => {
    await ensureIntegrationCenter();
    const dropdown = document.getElementById('headerNotificationDropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('hidden');
    dropdown.innerHTML = `
      <div class="section-title-row"><span class="section-title">最近通知</span><button type="button" class="light-btn" id="markAllReadBtn">全部已读</button></div>
      ${(state.notifications || []).slice(0, 6).map((item) => `<div class="signal-item"><strong>${escapeHtml(item.message)}</strong><small>${escapeHtml(item.created_at)} · ${escapeHtml(item.severity)}</small></div>`).join('') || '<div class="empty-state">暂无通知</div>'}
      <button type="button" class="ghost-btn full-width-btn" id="openIntegrationPageBtn">查看完整通知</button>
    `;
    document.getElementById('markAllReadBtn')?.addEventListener('click', async () => {
      const ids = (state.notifications || []).filter((item) => !item.is_read).map((item) => item.id);
      await api('/api/v1/notifications/mark-read', { method: 'POST', body: JSON.stringify({ ids }) });
      state.notifications = null;
      await ensureIntegrationCenter();
      renderHeaderSignalBar();
    });
    document.getElementById('openIntegrationPageBtn')?.addEventListener('click', async () => {
      state.currentPage = 'settings';
      renderShell();
      await renderCurrentPage();
    });
  });
}

// 渲染页面外壳并同步导航状态
function renderShell() {
  if (!refs.pageNav.children.length) {
    renderPageNav();
  } else {
    refs.pageNav.querySelectorAll('[data-page]').forEach((button) => {
      const isActive = button.dataset.page === state.currentPage;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }
  renderSummaryBar();
  renderPageChrome();
}

// 格式化数字并保留指定小数位
function renderGlobalSearchDropdown() {
  const results = state.globalSearchResults;
  if (!results || !refs.globalSearchDropdown) {
    refs.globalSearchDropdown.innerHTML = '';
    return;
  }
  refs.globalSearchDropdown.innerHTML = Object.entries(results).map(([group, items]) => `
    <div class="search-group"><strong>${escapeHtml(group)}</strong>${items.length ? items.map((item) => `<button type="button" class="search-result-item" data-search-code="${escapeHtml(item.code || '')}">${escapeHtml(item.name || item.code || '-')}<small>${escapeHtml(item.code || '')}</small></button>`).join('') : '<div class="muted">无结果</div>'}</div>
  `).join('');
  refs.globalSearchDropdown.querySelectorAll('.search-result-item').forEach((button) => {
    button.addEventListener('click', () => {
      state.filters.globalSearch = button.dataset.searchCode || '';
      refs.globalSearchInput.value = button.dataset.searchCode || '';
      refs.globalSearchDropdown.innerHTML = '';
    });
  });
}

// 按当前页面路由渲染对应内容
async function renderCurrentPage() {
  // 先渲染骨架屏，避免大页面切换时出现空白闪烁
  refs.pageContent.innerHTML = '<div class="surface"><div class="section-title-row"><span class="section-title">正在加载</span><span class="section-note">页面数据读取中</span></div><div class="table-shell" style="margin-top:12px;"><table><tbody>' + skeletonRows(6, 6) + '</tbody></table></div></div>';
  renderPageChrome();
  await nextFrame();
  switch (state.currentPage) {
    case 'parents':
      await ensureParents('compact');
      renderParentsPage();
      break;
    case 'attributes':
      await ensureAttributes();
      await renderAttributesPage();
      break;
    case 'combinations':
      await ensureCombinations();
      await ensureAttributes();
      renderCombinationsPage();
      break;
    case 'skuCandidates':
      await ensureCandidateBatches();
      await renderSkuCandidatesPage();
      break;
    case 'skus':
      await ensureSkuFilterOptions();
      await ensureBatches();
      await renderSkusPage();
      break;
    case 'dimensions':
      await ensureSkuFilterOptions();
      await renderDimensionsPage();
      break;
    case 'designTemplates':
      await ensureDesignTemplateCenter();
      await renderDesignTemplateCenterPage();
      break;
    case 'supply':
      await ensureSkuFilterOptions();
      await renderSupplyPage();
      break;
    case 'supplyChain':
      await ensureSupplyChainCenter();
      await renderSupplyChainPage();
      break;
    case 'warehouse':
      await ensureSkuFilterOptions();
      await ensureWarehouseCenter();
      await renderWarehousePage();
      break;
    case 'costPricing':
      await ensureChannels();
      await ensureCostPricingCenter();
      await renderCostPricingPage();
      break;
    case 'freightTemplates':
      await ensureTemplates();
      await ensureTemplateImportHistory();
      await renderFreightTemplatesPage();
      break;
    case 'freightChannels':
      await ensureFreightChannels();
      renderFreightChannelsPage();
      break;
    case 'freightCalculator':
      await ensureSkus();
      renderFreightCalculatorPage();
      break;
    case 'settings':
      await ensureSettingsCenter();
      await renderSettingsPage();
      break;
    case 'alerts':
      await ensureAlertsCenter();
      await renderAlertsPage();
      break;
    case 'reports':
      await ensureAnalytics();
      await ensureExceptionReports();
      await renderReportsPage();
      break;
    default:
      refs.pageContent.innerHTML = '<div class="surface empty-state">当前页面尚未配置。</div>';
  }
}

// 清空缓存并刷新当前页面数据
