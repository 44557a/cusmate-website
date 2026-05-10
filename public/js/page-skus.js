// ============================================================
// SKU 相关页面
// ============================================================

async function renderSkuDetailPanel(skuId) {
  const detail = await ensureSkuDetail(skuId);
  const references = await ensureSkuReferences(skuId);
  const options = detail.sku_option_values || [];
  return `
    <div class="surface-soft">
      <div class="section-title-row"><span class="section-title">SKU 详情</span><span class="section-note">运营只读</span></div>
      <h3 class="detail-title">${escapeHtml(detail.sku_master.legacy_sku_code)} · ${escapeHtml(detail.sku_master.sku_name_cn)}</h3>
      ${codingRuleCallout(detail.coding_rules, 'sku')}
      <div class="detail-grid">
        <div class="kv"><span>母体版本</span><strong>${escapeHtml(detail.sku_master.parent_version_id)}</strong></div>
        <div class="kv"><span>状态</span><strong>${escapeHtml(humanSkuLifecycleStatus(detail.sku_master.status))}</strong></div>
        <div class="kv"><span>包装后重量</span><strong>${escapeHtml(detail.sku_dimension_weight?.after_pack_weight_g || 0)} g</strong></div>
        <div class="kv"><span>当前成本</span><strong>${escapeHtml(detail.sku_supply_chain?.current_procurement_cost || '未填')}</strong></div>
      </div>
      <div class="surface" style="margin-top:16px;">
        <div class="section-title-row"><span class="section-title">选项组合（信息来自「属性定义表」）</span></div>
        <div class="chips">${options.map((item) => `<span class="chip">${escapeHtml(item.attribute_name_cn)}：${escapeHtml(item.option_name_cn || item.display_value || '')}</span>`).join('')}</div>
      </div>
      <div class="surface" style="margin-top:16px;">
        <div class="section-title-row"><span class="section-title">引用检查</span><span class="section-note">治理补充信息</span></div>
        <div class="detail-grid">
          <div class="kv"><span>模板已绑定</span><strong>${references.is_template_bound ? '是' : '否'}</strong></div>
          <div class="kv"><span>物流已配置</span><strong>${references.is_logistics_configured ? '是' : '否'}</strong></div>
          <div class="kv"><span>成本已维护</span><strong>${references.is_cost_maintained ? '是' : '否'}</strong></div>
          <div class="kv"><span>平台映射</span><strong>${references.has_platform_mapping ? '是' : '否'}</strong></div>
          <div class="kv"><span>订单引用</span><strong>${references.has_orders ? '是' : '否'}</strong></div>
        </div>
      </div>
    </div>
  `;
}

// 格式化 SKU 包装尺寸展示
async function openSkuDetailModal(skuId) {
  const detailHtml = await renderSkuDetailPanel(skuId);
  const sku = Object.values(state.skus || {}).flatMap((value) => Array.isArray(value) ? value : []).find((item) => item.id === skuId)
    || state.currentSkuItems?.find((item) => item.id === skuId);
  openReadOnlyModal(
    `SKU详情：${sku?.legacy_sku_code || sku?.sku_code || skuId}`,
    '点击表格中的 SKU 后，在弹窗中查看完整详情。',
    `<div class="full-span">${detailHtml}</div>`,
  );
}

// 渲染 SKU 数据总表页面
async function renderSkusPage() {
  await ensureSkuFilterOptions();
  const keyword = state.filters.skus;
  const filterState = state.structuredFilters.skus;
  const attributeValueOptions = filterState.attributeName ? (state.skuFilterOptions.attribute_values_by_name?.[filterState.attributeName] || []) : [];
  const skuResponse = await fetchPagedCollection('/api/v1/skus', 'skus', {
    parent_name: filterState.parentName,
    attribute_name: filterState.attributeName,
    attribute_value: filterState.attributeValue,
    keyword,
  }, state.pagedViews.skus.page, state.pagedViews.skus.pageSize);
  const rows = skuResponse.items || [];
  state.currentSkuItems = rows;
  const latest = latestBatch();
  const pager = state.pagedViews.skus;
  const pageStart = (pager.page - 1) * pager.pageSize;
  await nextFrame();

  refs.pageContent.innerHTML = `
    <div class="surface">
      <div class="section-title-row">
        <span class="section-title">SKU 数据总表</span>
        <div class="inline-actions">
          <button type="button" class="light-btn" id="exportSkuBtn">导出 SKU 列表</button>
          <button type="button" class="ghost-btn" id="exportSkuFreightBtn">导出最近批次国家运费</button>
        </div>
      </div>
      <div class="callout">国家运费不直接在表格里铺开展示，否则会太宽。这里提供"导出最近批次国家运费"，用于运营拿去分析或发给业务。</div>
      <div class="inline-actions" style="margin-top:14px; align-items:flex-end; flex-wrap:wrap; gap:12px;">
        <label class="field" style="min-width:220px;"><span>母体名称</span><select id="skuParentFilter">${buildSelectOptions(state.skuFilterOptions.parent_names, filterState.parentName)}</select></label>
        <label class="field" style="min-width:220px;"><span>属性名称</span><select id="skuAttributeFilter">${buildSelectOptions(state.skuFilterOptions.attribute_names, filterState.attributeName)}</select></label>
        <label class="field" style="min-width:220px;"><span>属性值</span><select id="skuAttributeValueFilter">${buildSelectOptions(attributeValueOptions, filterState.attributeValue)}</select></label>
        <label class="field" style="min-width:280px; flex:1 1 280px;"><span>搜索 SKU</span><input id="skuSearchInput" type="search" value="${escapeHtml(keyword)}" placeholder="例如：CM006A-000001、吊牌"></label>
      </div>
      <div class="table-shell data-scroll-body" style="margin-top:12px;">
        <table>
          <thead><tr><th>SKU 编码</th><th>供应链品类</th><th>SKU 中文名称</th><th>状态</th><th>易碎</th><th>液体</th><th>磁性</th><th>危险</th><th>包装后长宽高</th><th>包装后重量</th><th>计费重</th><th>成本价</th><th>包装方案</th><th>操作</th></tr></thead>
          <tbody>
            ${rows.map((row) => {
              const weightInfo = formatSkuWeightAndChargeable(row);
              return `
                <tr data-sku-id="${row.id}">
                  <td>${escapeHtml(row.legacy_sku_code || row.sku_code)}</td>
                  <td>${escapeHtml(row.supply_chain_category || '-')}</td>
                  <td>${escapeHtml(row.sku_name_cn)}</td>
                  <td>${statusPill(humanSkuLifecycleStatus(row.status), statusKind(row.status))}</td>
                  <td>${row.is_fragile ? badge('是', 'warn') : '<span class="muted">否</span>'}</td>
                  <td>${row.is_liquid ? badge('是', 'warn') : '<span class="muted">否</span>'}</td>
                  <td>${row.is_magnetic ? badge('是', 'warn') : '<span class="muted">否</span>'}</td>
                  <td>${row.is_dangerous ? badge('是', 'fail') : '<span class="muted">否</span>'}</td>
                  <td>${escapeHtml(formatSkuPackageDimensions(row))}</td>
                  <td>${escapeHtml(weightInfo.weight)}</td>
                  <td>${escapeHtml(weightInfo.chargeable)}</td>
                  <td>${escapeHtml(row.current_procurement_cost || row.manual_procurement_cost || '-')}</td>
                  <td>${escapeHtml(row.package_plan || '-')}</td>
                  <td><div class="inline-actions"><button type="button" class="ghost-btn sku-status-btn" data-sku-id="${row.id}" data-status="${row.status === 1 ? 3 : 1}">${row.status === 1 ? '停用' : '启用'}</button><button type="button" class="light-btn sku-pending-btn" data-sku-id="${row.id}">待审核</button></div></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${renderServerPagination('skus')}
      <p class="table-note">显示第 ${pageStart + 1}–${Math.min(pageStart + rows.length, pager.total)} 条，共 ${pager.total} 条。点击 SKU 可查看详情。导出会导出筛选后的完整结果。${latest ? ` 最近批次：${latest.batch_code}` : ''}</p>
    </div>
  `;
  document.getElementById('skuSearchInput').addEventListener('input', (event) => {
    debounce('skuSearchInput', async () => {
      state.filters.skus = event.target.value.trim();
      state.pagedViews.skus.page = 1;
      await renderSkusPage();
    });
  });
  document.getElementById('skuParentFilter').addEventListener('change', async (event) => {
    state.structuredFilters.skus.parentName = event.target.value;
    state.pagedViews.skus.page = 1;
    await renderSkusPage();
  });
  document.getElementById('skuAttributeFilter').addEventListener('change', async (event) => {
    state.structuredFilters.skus.attributeName = event.target.value;
    state.structuredFilters.skus.attributeValue = '';
    state.pagedViews.skus.page = 1;
    await renderSkusPage();
  });
  document.getElementById('skuAttributeValueFilter').addEventListener('change', async (event) => {
    state.structuredFilters.skus.attributeValue = event.target.value;
    state.pagedViews.skus.page = 1;
    await renderSkusPage();
  });
  bindServerPagination('skus', renderSkusPage);
  document.getElementById('exportSkuBtn').addEventListener('click', async () => {
    setToast('正在导出 SKU 全量数据...');
    const exportRows = await fetchAllCollection('/api/v1/skus', {
      parent_name: filterState.parentName,
      attribute_name: filterState.attributeName,
      attribute_value: filterState.attributeValue,
      keyword,
    });
    downloadCsv('SKU数据总表.csv', exportRows.map((row) => {
      const weightInfo = formatSkuWeightAndChargeable(row);
        return {
          SKU编码: row.legacy_sku_code || row.sku_code,
          供应链品类: row.supply_chain_category || '-',
          SKU中文名称: row.sku_name_cn,
          易碎: row.is_fragile ? '是' : '否',
          液体: row.is_liquid ? '是' : '否',
          磁性: row.is_magnetic ? '是' : '否',
          危险: row.is_dangerous ? '是' : '否',
          包装后长宽高: formatSkuPackageDimensions(row),
          包装后重量: weightInfo.weight,
          计费重: weightInfo.chargeable,
        成本价: row.current_procurement_cost || row.manual_procurement_cost || '-',
        包装方案: row.package_plan || '-',
      };
    }));
  });
  document.getElementById('exportSkuFreightBtn').addEventListener('click', async () => {
    const latestBatchRow = latestBatch();
    if (!latestBatchRow) {
      setToast('当前没有批次结果，请先去"运费批次结果"页面跑一次批次');
      return;
    }
    const bestRows = await ensureBatchBestChannels(latestBatchRow.batch_code);
    setToast('正在导出最近批次国家运费...');
    const exportRows = await fetchAllCollection('/api/v1/skus', {
      parent_name: filterState.parentName,
      attribute_name: filterState.attributeName,
      attribute_value: filterState.attributeValue,
      keyword,
    });
    const skuMap = new Map(exportRows.map((sku) => [sku.id, sku]));
    downloadCsv(`SKU最近批次运费_${latestBatchRow.batch_code}.csv`, bestRows.map((row) => ({
      历史SKU: skuMap.get(row.sku_id)?.legacy_sku_code || '',
      SKU名称: skuMap.get(row.sku_id)?.sku_name_cn || '',
      国家: row.country_code,
      最优渠道: row.best_channel_name,
      最低运费: row.lowest_fee,
      是否可发: row.is_shippable ? '是' : '否',
      不可发原因: row.unavailable_reason || '',
    })));
  });
  document.querySelectorAll('[data-sku-id]').forEach((row) => {
    row.addEventListener('click', async () => {
      state.selectedSkuId = Number(row.dataset.skuId);
      await openSkuDetailModal(state.selectedSkuId);
    });
  });
  document.querySelectorAll('.sku-status-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      await updateEntityStatus(`/api/v1/skus/${button.dataset.skuId}/status`, Number(button.dataset.status), 'SKU 状态已更新');
      state.skus = null;
      state.currentSkuItems = null;
      await renderSkusPage();
    });
  });
  document.querySelectorAll('.sku-pending-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      await updateEntityStatus(`/api/v1/skus/${button.dataset.skuId}/status`, 2, 'SKU 已标记为待审核');
      state.skus = null;
      state.currentSkuItems = null;
      await renderSkusPage();
    });
  });
}

// 渲染候选 SKU 审核页面
async function renderSkuCandidatesPage() {
  await ensureParents();
  await ensureCandidateBatches();
  if (!state.batchParentVersionId && state.parents.length) {
    state.batchParentVersionId = state.parents[0].current_version_id;
  }

  if (state.batchParentVersionId) {
    try {
      await syncCandidateBatch(state.batchParentVersionId);
    } catch (error) {
      console.warn('syncCandidateBatch failed:', error.message);
    }
  }

  const selectedBatch = (state.candidateBatches || []).find((batch) => batch.batch_code === state.selectedCandidateBatchCode)
    || (state.candidateBatches || [])[0]
    || null;
  const allCandidateRows = selectedBatch ? await ensureCandidateRows(selectedBatch.batch_code) : [];
  const candidateFilterState = state.structuredFilters.skuCandidates;
  const candidateAttributeNames = [...new Set(allCandidateRows.flatMap((row) => row.attribute_names || []).filter(Boolean))].sort();
  // 先按结构化条件筛选，再叠加关键字搜索
  const candidateRows = filteredRows(
    allCandidateRows.filter((row) => {
      if (candidateFilterState.parentName && row.parent_name_cn !== candidateFilterState.parentName) return false;
      if (candidateFilterState.attributeName && !(row.attribute_names || []).includes(candidateFilterState.attributeName)) return false;
      return true;
    }),
    state.filters.skuCandidates,
    ['candidate_code', 'proposed_sku_name_cn', 'parent_name_cn']
  );
  const parentOptions = state.parents.map((parent) => `
    <option value="${parent.current_version_id}" ${parent.current_version_id === state.batchParentVersionId ? 'selected' : ''}>
      ${escapeHtml(parent.current_parent_version_code)} · ${escapeHtml(parent.parent_name_cn)}
    </option>
  `).join('');

  refs.pageContent.innerHTML = `
    <div class="detail-stack">
      <div class="surface">
        <div class="section-title-row">
          <span class="section-title">候选 SKU 生成</span>
          <span class="section-note">系统会根据组合表自动生成候选 SKU，这里只负责筛选和启用</span>
        </div>
        <form id="candidateBatchForm" class="form-grid">
          <label class="field"><span>母体版本</span><select name="parent_version_id">${parentOptions}</select></label>
          <label class="field"><span>当前候选批次</span><input value="${escapeHtml(selectedBatch?.batch_code || '自动生成中') }" readonly></label>
          <div class="full-span inline-actions">
            <button type="submit" class="light-btn">刷新当前母体候选SKU</button>
            <span class="form-note">切换母体版本后，下方候选 SKU 会自动变化</span>
          </div>
        </form>
      </div>

      <div class="surface">
        <div class="section-title-row"><span class="section-title">当前母体候选概要</span><span class="section-note">随母体版本自动更新</span></div>
        <div class="batch-list candidate-batch-list">
          ${selectedBatch ? `
            <article class="batch-card active">
              <h3>${escapeHtml(selectedBatch.batch_name)}</h3>
              <p class="muted">${escapeHtml(selectedBatch.batch_code)} · 候选 ${escapeHtml(selectedBatch.candidate_count)} · 待审 ${escapeHtml(selectedBatch.pending_count)} · 已启用 ${escapeHtml(selectedBatch.enabled_count)}</p>
            </article>
          ` : '<div class="empty-state">当前还没有候选 SKU 批次。</div>'}
        </div>
      </div>

      <div class="surface candidate-review-panel">
        ${selectedBatch ? `
          <div class="candidate-review-header">
            <div class="section-title-row">
              <span class="section-title">候选 SKU 审核</span>
              <span class="section-note">${escapeHtml(selectedBatch.batch_code)} · ${escapeHtml(selectedBatch.status)}</span>
            </div>
            <div class="candidate-summary-grid">
              <div class="kv"><span>候选总数</span><strong>${escapeHtml(selectedBatch.candidate_count)}</strong></div>
              <div class="kv"><span>待审核</span><strong>${escapeHtml(selectedBatch.pending_count)}</strong></div>
              <div class="kv"><span>已通过</span><strong>${escapeHtml(selectedBatch.approved_count)}</strong></div>
              <div class="kv"><span>已启用</span><strong>${escapeHtml(selectedBatch.enabled_count)}</strong></div>
            </div>
            <div class="inline-actions" style="margin:12px 0 8px;">
              <button type="button" class="light-btn" id="approveCandidatesBtn">批量通过</button>
              <button type="button" class="ghost-btn" id="rejectCandidatesBtn">批量拒绝</button>
              <button type="button" class="accent-btn" id="enableCandidatesBtn">启用选中</button>
              <button type="button" class="ghost-btn" id="disableCandidatesBtn">禁用选中</button>
            </div>
            <div class="inline-actions" style="margin:0 0 8px; align-items:flex-end; flex-wrap:wrap; gap:12px;">
              <label class="field" style="min-width:220px;"><span>母体名称</span><select id="candidateParentFilter">${buildSelectOptions(state.parents.map((item) => item.parent_name_cn).filter(Boolean).sort(), candidateFilterState.parentName)}</select></label>
              <label class="field" style="min-width:220px;"><span>属性名称</span><select id="candidateAttributeFilter">${buildSelectOptions(candidateAttributeNames, candidateFilterState.attributeName)}</select></label>
              <label class="field" style="min-width:280px; flex:1 1 280px;"><span>搜索</span><input id="candidateSearchInput" type="search" value="${escapeHtml(state.filters.skuCandidates)}" placeholder="例如：候选编码、SKU名称"></label>
            </div>
          </div>
          <div class="candidate-review-body">
          <div class="table-shell">
            <table>
              <thead>
                <tr>
                  <th><input id="candidateCheckAll" type="checkbox"></th>
                  <th>候选编码</th>
                  <th>候选 SKU 名称</th>
                  <th>组合</th>
                  <th>状态</th>
                  <th>启用后 SKU</th>
                </tr>
              </thead>
              <tbody>
                ${candidateRows.map((row) => `
                  <tr>
                    <td><input class="candidate-checkbox" type="checkbox" value="${row.candidate_id}" ${row.review_status === 'duplicate' ? 'disabled' : ''}></td>
                    <td>${escapeHtml(row.candidate_code)}</td>
                    <td>${escapeHtml(row.proposed_sku_name_cn)}</td>
                    <td>${escapeHtml((row.option_labels || []).join(' / '))}</td>
                    <td>${statusPill(row.review_status, row.review_status === 'enabled' ? 'ok' : row.review_status === 'duplicate' ? 'warn' : row.review_status === 'rejected' ? 'fail' : 'viewer')}</td>
                    <td>${escapeHtml(row.enabled_legacy_sku_code || row.enabled_sku_code || (row.duplicate_sku_id ? `已存在#${row.duplicate_sku_id}` : '-'))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <p class="table-note">状态说明：<code>pending</code> 待审核，<code>approved</code> 已通过待启用，<code>enabled</code> 已进入 SKU 数据总表，<code>duplicate</code> 表示该组合已存在。</p>
          </div>
        ` : '<div class="empty-state">先生成一批候选 SKU，再在这里审核和启用。</div>'}
      </div>
    </div>
  `;

  document.getElementById('candidateBatchForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      state.batchParentVersionId = Number(form.get('parent_version_id'));
      const payload = await syncCandidateBatch(state.batchParentVersionId);
      state.skus = null;
      setToast(`候选 SKU 已根据 ${payload.batch.parent_version_id} 重新同步`);
      await renderSkuCandidatesPage();
    } catch (error) {
      setToast(error.message);
    }
  });
  document.querySelector('#candidateBatchForm select[name="parent_version_id"]').addEventListener('change', async (event) => {
    try {
      state.batchParentVersionId = Number(event.target.value);
      await syncCandidateBatch(state.batchParentVersionId);
      await renderSkuCandidatesPage();
    } catch (error) {
      setToast(error.message);
    }
  });

  if (!selectedBatch) {
    return;
  }

  document.getElementById('candidateParentFilter')?.addEventListener('change', async (event) => {
    state.structuredFilters.skuCandidates.parentName = event.target.value;
    await renderSkuCandidatesPage();
  });
  document.getElementById('candidateAttributeFilter')?.addEventListener('change', async (event) => {
    state.structuredFilters.skuCandidates.attributeName = event.target.value;
    await renderSkuCandidatesPage();
  });
  document.getElementById('candidateSearchInput')?.addEventListener('input', (event) => {
    debounce('candidateSearchInput', async () => {
      state.filters.skuCandidates = event.target.value.trim();
      await renderSkuCandidatesPage();
    });
  });

  const getSelectedCandidateIds = () => Array.from(document.querySelectorAll('.candidate-checkbox:checked')).map((item) => Number(item.value));
  document.getElementById('candidateCheckAll').addEventListener('change', (event) => {
    document.querySelectorAll('.candidate-checkbox:not(:disabled)').forEach((checkbox) => {
      checkbox.checked = event.target.checked;
    });
  });

  document.getElementById('approveCandidatesBtn').addEventListener('click', async () => {
    const ids = getSelectedCandidateIds();
    if (!ids.length) {
      setToast('请先勾选候选 SKU');
      return;
    }
    await api(`/api/v1/sku-candidate-batches/${encodeURIComponent(selectedBatch.batch_code)}/review`, {
      method: 'POST',
      body: JSON.stringify({ candidate_ids: ids, action: 'approve', remark: '前端审核通过' }),
    });
    state.candidateRows[selectedBatch.batch_code] = null;
    await ensureCandidateBatches();
    await renderSkuCandidatesPage();
  });

  document.getElementById('rejectCandidatesBtn').addEventListener('click', async () => {
    const ids = getSelectedCandidateIds();
    if (!ids.length) {
      setToast('请先勾选候选 SKU');
      return;
    }
    await api(`/api/v1/sku-candidate-batches/${encodeURIComponent(selectedBatch.batch_code)}/review`, {
      method: 'POST',
      body: JSON.stringify({ candidate_ids: ids, action: 'reject', remark: '前端审核拒绝' }),
    });
    state.candidateRows[selectedBatch.batch_code] = null;
    await ensureCandidateBatches();
    await renderSkuCandidatesPage();
  });

  document.getElementById('enableCandidatesBtn').addEventListener('click', async () => {
    const ids = getSelectedCandidateIds();
    if (!ids.length) {
      setToast('请先勾选候选 SKU');
      return;
    }
    const payload = await api(`/api/v1/sku-candidate-batches/${encodeURIComponent(selectedBatch.batch_code)}/enable`, {
      method: 'POST',
      body: JSON.stringify({ candidate_ids: ids, operator_name: 'IT 开发人员' }),
    });
    state.candidateRows[selectedBatch.batch_code] = null;
    state.skus = null;
    state.skuDetails = {};
    await ensureCandidateBatches();
    setToast(`已启用 ${payload.data.enabled_count} 个 SKU`);
    await renderSkuCandidatesPage();
  });
  document.getElementById('disableCandidatesBtn').addEventListener('click', async () => {
    const ids = getSelectedCandidateIds();
    if (!ids.length) {
      setToast('请先勾选候选 SKU');
      return;
    }
    await api(`/api/v1/sku-candidate-batches/${encodeURIComponent(selectedBatch.batch_code)}/review`, {
      method: 'POST',
      body: JSON.stringify({ candidate_ids: ids, action: 'reject', remark: '前端批量禁用' }),
    });
    state.candidateRows[selectedBatch.batch_code] = null;
    await ensureCandidateBatches();
    await renderSkuCandidatesPage();
  });
}

// 渲染通用可维护表格页面
function renderEditableTablePage({
  title,
  rows,
  pager,
  viewKey,
  searchKey,
  filterConfig,
  selectedIdKey,
  selectedId,
  setSelectedId,
  exporter,
  columns,
  formFields,
  draftKey,
  onRender,
}) {
  const keyword = state.filters[searchKey];
  const selected = rows.find((item) => item[selectedIdKey] === selectedId) || rows[0];
  const drafts = loadDrafts(draftKey);
  const tableHead = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
  // 统一按列配置渲染通用表格行
  const tableBody = rows.map((row) => `
    <tr data-row-id="${row[selectedIdKey]}">
      ${columns.map((column) => `<td>${escapeHtml(column.render ? column.render(row) : row[column.key] ?? '')}</td>`).join('')}
    </tr>
  `).join('');
  const formHtml = selected ? `
    <form id="genericDraftForm" class="form-grid">
      ${formFields.map((field) => {
        const value = selected[field.key] ?? '';
        if (field.type === 'textarea') {
          return `<label class="field ${field.full ? 'full-span' : ''}"><span>${escapeHtml(field.label)}</span><textarea name="${escapeHtml(field.key)}">${escapeHtml(value)}</textarea></label>`;
        }
        if (field.type === 'select') {
          return `<label class="field ${field.full ? 'full-span' : ''}"><span>${escapeHtml(field.label)}</span><select name="${escapeHtml(field.key)}">${field.options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(option.value) === String(value) ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></label>`;
        }
        return `<label class="field ${field.full ? 'full-span' : ''}"><span>${escapeHtml(field.label)}</span><input name="${escapeHtml(field.key)}" value="${escapeHtml(value)}"></label>`;
      }).join('')}
      <div class="full-span inline-actions"><button type="submit" class="accent-btn">保存草稿</button><span class="form-note">已保存草稿：${drafts.length} 条</span></div>
    </form>
  ` : '<div class="empty-state">当前没有可维护的数据。</div>';
  refs.pageContent.innerHTML = `
    <div class="grid-main">
      <div class="surface">
        <div class="section-title-row"><span class="section-title">${escapeHtml(title)}</span><button type="button" class="light-btn" id="exportGenericBtn">导出当前数据</button></div>
        <div class="inline-actions" style="align-items:flex-end; flex-wrap:wrap; gap:12px;">
          ${filterConfig ? `
            <label class="field" style="min-width:220px;"><span>母体名称</span><select id="genericParentFilter">${buildSelectOptions(filterConfig.parentNames, filterConfig.current.parentName)}</select></label>
            <label class="field" style="min-width:220px;"><span>属性名称</span><select id="genericAttributeFilter">${buildSelectOptions(filterConfig.attributeNames, filterConfig.current.attributeName)}</select></label>
            <label class="field" style="min-width:220px;"><span>属性值</span><select id="genericAttributeValueFilter">${buildSelectOptions(filterConfig.attributeValues, filterConfig.current.attributeValue)}</select></label>
          ` : ''}
          <label class="field" style="min-width:280px; flex:1 1 280px;"><span>搜索</span><input id="genericSearchInput" type="search" value="${escapeHtml(keyword)}" placeholder="输入 SKU 编码或名称"></label>
        </div>
        <div class="table-shell" style="margin-top:12px;"><table><thead><tr>${tableHead}</tr></thead><tbody>${tableBody}</tbody></table></div>
        ${renderServerPagination(viewKey)}
      </div>
      <div class="surface-soft">
        <div class="section-title-row"><span class="section-title">维护表单</span><span class="section-note">当前保存为演示草稿</span></div>
        ${formHtml}
      </div>
    </div>
  `;
  document.getElementById('genericSearchInput').addEventListener('input', (event) => {
    debounce(`genericSearchInput:${searchKey}`, () => {
      state.filters[searchKey] = event.target.value.trim();
      state.pagedViews[viewKey].page = 1;
      onRender();
    });
  });
  document.getElementById('genericParentFilter')?.addEventListener('change', (event) => {
    filterConfig.current.parentName = event.target.value;
    state.pagedViews[viewKey].page = 1;
    filterConfig.onFilterChange();
  });
  document.getElementById('genericAttributeFilter')?.addEventListener('change', (event) => {
    filterConfig.current.attributeName = event.target.value;
    filterConfig.current.attributeValue = '';
    state.pagedViews[viewKey].page = 1;
    filterConfig.onFilterChange();
  });
  document.getElementById('genericAttributeValueFilter')?.addEventListener('change', (event) => {
    filterConfig.current.attributeValue = event.target.value;
    state.pagedViews[viewKey].page = 1;
    filterConfig.onFilterChange();
  });
  document.getElementById('exportGenericBtn').addEventListener('click', exporter);
  document.querySelectorAll('[data-row-id]').forEach((row) => {
    row.addEventListener('click', () => {
      setSelectedId(Number.isNaN(Number(row.dataset.rowId)) ? row.dataset.rowId : Number(row.dataset.rowId));
      onRender();
    });
  });
  bindServerPagination(viewKey, onRender);
  document.getElementById('genericDraftForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveDraft(draftKey, Object.fromEntries(new FormData(event.target).entries()));
  });
}

// 渲染尺寸与包装维护页面
async function renderDimensionsPage() {
  const filterState = state.structuredFilters.dimensions;
  const filterOptions = state.skuFilterOptions || { parent_names: [], attribute_names: [], attribute_values_by_name: {} };
  const response = await fetchPagedCollection('/api/v1/sku-dimensions', 'dimensions', {
    parent_name: filterState.parentName,
    attribute_name: filterState.attributeName,
    attribute_value: filterState.attributeValue,
    keyword: state.filters.dimensions,
  }, state.pagedViews.dimensions.page, state.pagedViews.dimensions.pageSize);
  state.dimensions = response.items || [];
  if (state.dimensions.length && !state.dimensions.find((item) => item.id === state.selectedDimensionSkuId)) state.selectedDimensionSkuId = state.dimensions[0].id;
  renderEditableTablePage({
    title: '仓库负责人维护尺寸与包装',
    rows: state.dimensions,
    pager: state.pagedViews.dimensions,
    viewKey: 'dimensions',
    searchKey: 'dimensions',
    filterConfig: {
      parentNames: filterOptions.parent_names,
      attributeNames: filterOptions.attribute_names,
      attributeValues: filterState.attributeName ? (filterOptions.attribute_values_by_name?.[filterState.attributeName] || []) : [],
      current: filterState,
      onFilterChange: async () => {
        await renderDimensionsPage();
      },
    },
    selectedIdKey: 'id',
    selectedId: state.selectedDimensionSkuId,
    setSelectedId: (value) => { state.selectedDimensionSkuId = value; },
    exporter: async () => {
      setToast('正在导出尺寸与包装全量数据...');
      const rows = await fetchAllCollection('/api/v1/sku-dimensions', {
        parent_name: filterState.parentName,
        attribute_name: filterState.attributeName,
        attribute_value: filterState.attributeValue,
        keyword: state.filters.dimensions,
      });
      downloadCsv('SKU尺寸重量维护表.csv', rows.map((row) => ({
        历史SKU: row.legacy_sku_code,
        SKU名称: row.sku_name_cn,
        包装前长度: row.before_pack_length_cm,
        包装前宽度: row.before_pack_width_cm,
        包装前高度: row.before_pack_height_cm,
        包装后重量g: row.after_pack_weight_g,
        包装方案: row.package_plan,
      })));
    },
    columns: [
      { label: '历史SKU', key: 'legacy_sku_code' },
      { label: 'SKU名称', key: 'sku_name_cn' },
      { label: '包装前尺寸', render: (row) => `${row.before_pack_length_cm || '-'} × ${row.before_pack_width_cm || '-'} × ${row.before_pack_height_cm || '-'}` },
      { label: '包装后重量(g)', key: 'after_pack_weight_g' },
      { label: '包装方案', key: 'package_plan' },
    ],
    formFields: [
      { label: '包装前长度(cm)', key: 'before_pack_length_cm' },
      { label: '包装前宽度(cm)', key: 'before_pack_width_cm' },
      { label: '包装前高度(cm)', key: 'before_pack_height_cm' },
      { label: '包装后重量(g)', key: 'after_pack_weight_g' },
      { label: '包装方案', key: 'package_plan', full: true },
      { label: '备注', key: 'remark', type: 'textarea', full: true },
    ],
    draftKey: 'dimensions',
    onRender: renderDimensionsPage,
  });
}

// 渲染设计模板维护页面
async function renderDesignsPage() {
  const filterState = state.structuredFilters.designs;
  const filterOptions = state.skuFilterOptions || { parent_names: [], attribute_names: [], attribute_values_by_name: {} };
  const response = await fetchPagedCollection('/api/v1/sku-designs', 'designs', {
    parent_name: filterState.parentName,
    attribute_name: filterState.attributeName,
    attribute_value: filterState.attributeValue,
    keyword: state.filters.designs,
  }, state.pagedViews.designs.page, state.pagedViews.designs.pageSize);
  state.designs = response.items || [];
  if (state.designs.length && !state.designs.find((item) => item.id === state.selectedDesignSkuId)) state.selectedDesignSkuId = state.designs[0].id;
  renderEditableTablePage({
    title: '设计模板维护',
    rows: state.designs,
    pager: state.pagedViews.designs,
    viewKey: 'designs',
    searchKey: 'designs',
    filterConfig: {
      parentNames: filterOptions.parent_names,
      attributeNames: filterOptions.attribute_names,
      attributeValues: filterState.attributeName ? (filterOptions.attribute_values_by_name?.[filterState.attributeName] || []) : [],
      current: filterState,
      onFilterChange: async () => {
        await renderDesignsPage();
      },
    },
    selectedIdKey: 'id',
    selectedId: state.selectedDesignSkuId,
    setSelectedId: (value) => { state.selectedDesignSkuId = value; },
    exporter: async () => {
      setToast('正在导出设计模板全量数据...');
      const rows = await fetchAllCollection('/api/v1/sku-designs', {
        parent_name: filterState.parentName,
        attribute_name: filterState.attributeName,
        attribute_value: filterState.attributeValue,
        keyword: state.filters.designs,
      });
      downloadCsv('SKU设计模板维护表.csv', rows.map((row) => ({
        历史SKU: row.legacy_sku_code,
        SKU名称: row.sku_name_cn,
        模板编号: row.template_code,
        AI路径: row.template_ai_url,
        PS路径: row.template_ps_url,
        PNG路径: row.template_png_url,
      })));
    },
    columns: [
      { label: '历史SKU', key: 'legacy_sku_code' },
      { label: 'SKU名称', key: 'sku_name_cn' },
      { label: '模板编号', key: 'template_code' },
      { label: 'AI/PS/PNG', render: (row) => [row.template_ai_url ? 'AI' : null, row.template_ps_url ? 'PS' : null, row.template_png_url ? 'PNG' : null].filter(Boolean).join(' / ') || '-' },
      { label: '备注', key: 'design_note' },
    ],
    formFields: [
      { label: '模板编号', key: 'template_code' },
      { label: 'AI 模板路径', key: 'template_ai_url' },
      { label: 'PS 模板路径', key: 'template_ps_url' },
      { label: 'PNG 模板路径', key: 'template_png_url' },
      { label: '设计备注', key: 'design_note', type: 'textarea', full: true },
    ],
    draftKey: 'designs',
    onRender: renderDesignsPage,
  });
}

// 渲染设计模板卡片内容
function designTemplateCard(template) {
  return `
    <article class="batch-card ${state.selectedDesignTemplateId === template.template_id ? 'active' : ''}" data-design-template-id="${template.template_id}">
      <div class="section-title-row">
        <span class="section-title">${escapeHtml(template.template_name || template.template_code)}</span>
        ${statusPill(designTemplateStatusLabel(template.status), statusKind(template.status))}
      </div>
      <div class="detail-grid">
        <div class="kv"><span>模板编码</span><strong>${escapeHtml(template.template_code || '-')}</strong></div>
        <div class="kv"><span>版本</span><strong>${escapeHtml(template.template_version || '-')}</strong></div>
        <div class="kv"><span>适用材质</span><strong>${escapeHtml(template.applicable_material || '-')}</strong></div>
        <div class="kv"><span>工艺要求</span><strong>${escapeHtml(template.process_requirement || '-')}</strong></div>
      </div>
      <div class="chips" style="margin-top:12px;">
        <span class="chip">类型：${escapeHtml(template.template_type || '-')}</span>
        <span class="chip">尺寸：${escapeHtml(template.template_size || '-')}</span>
        <span class="chip">绑定SKU：${escapeHtml(template.bound_sku_count || 0)}</span>
      </div>
    </article>
  `;
}

// 打开设计模板新建或编辑弹窗
function openDesignTemplateModal(template = null) {
  const isEdit = Boolean(template);
  openModal(
    isEdit ? '编辑设计模板' : '新建设计模板',
    '维护模板主数据，绑定关系在右侧台账操作。',
    `
      <label class="field"><span>模板编码</span><input name="template_code" value="${escapeHtml(template?.template_code || '')}" required></label>
      <label class="field"><span>模板名称</span><input name="template_name" value="${escapeHtml(template?.template_name || '')}" required></label>
      <label class="field"><span>模板版本</span><input name="template_version" value="${escapeHtml(template?.template_version || 'V1')}" required></label>
      <label class="field"><span>模板类型</span><input name="template_type" value="${escapeHtml(template?.template_type || '')}"></label>
      <label class="field"><span>模板尺寸</span><input name="template_size" value="${escapeHtml(template?.template_size || '')}"></label>
      <label class="field"><span>适用材质</span><input name="applicable_material" value="${escapeHtml(template?.applicable_material || '')}"></label>
      <label class="field full-span"><span>工艺要求</span><textarea name="process_requirement">${escapeHtml(template?.process_requirement || '')}</textarea></label>
      <label class="field full-span"><span>AI 文件路径</span><input name="template_ai_url" value="${escapeHtml(template?.template_ai_url || '')}" placeholder="例如：/templates/CM001A-DT-01/design.ai"></label>
      <label class="field full-span"><span>PS 文件路径</span><input name="template_ps_url" value="${escapeHtml(template?.template_ps_url || '')}" placeholder="例如：/templates/CM001A-DT-01/design.psd"></label>
      <label class="field full-span"><span>PNG 预览图路径</span><input name="template_png_url" value="${escapeHtml(template?.template_png_url || '')}" placeholder="例如：/templates/CM001A-DT-01/preview.png"></label>
      <label class="field"><span>生效日期</span><input name="effective_from" value="${escapeHtml(template?.effective_from || '')}" placeholder="2026-04-01"></label>
      <label class="field"><span>失效日期</span><input name="effective_to" value="${escapeHtml(template?.effective_to || '')}" placeholder="2026-12-31"></label>
      <label class="field full-span"><span>备注</span><textarea name="remark">${escapeHtml(template?.remark || '')}</textarea></label>
    `,
    async (payload) => {
      await api(isEdit ? `/api/v1/design-templates/${template.template_id}/update` : '/api/v1/design-templates', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      state.designTemplateList = null;
      await ensureDesignTemplateCenter();
      setToast(isEdit ? '模板已更新' : '模板已创建');
      await renderDesignTemplateCenterPage();
    },
  );
}

// 打开 SKU 绑定设计模板弹窗
function openBindTemplateModal(skuRow) {
  const templateOptions = (state.designTemplateList || []).filter((item) => Number(item.status) === 1);
  openModal(
    '绑定模板',
    `${skuRow.legacy_sku_code} · ${skuRow.sku_name_cn}`,
    `
      <label class="field full-span"><span>选择模板</span>
        <select name="template_id" required>
          ${templateOptions.map((item) => `<option value="${item.template_id}">${escapeHtml(item.template_code)} · ${escapeHtml(item.template_name)} · ${escapeHtml(item.template_version)}</option>`).join('')}
        </select>
      </label>
      <label class="field"><span>绑定人</span><input name="bound_by" value="IT 开发人员"></label>
      <label class="field full-span"><span>备注</span><textarea name="remark">前端手动绑定</textarea></label>
    `,
    async (payload) => {
      const response = await api('/api/v1/sku-template-bindings', {
        method: 'POST',
        body: JSON.stringify({ ...payload, sku_id: skuRow.id }),
      });
      state.designTemplateBindings = null;
      state.unboundDesignSkus = null;
      state.designTemplateList = null;
      await ensureDesignTemplateCenter();
      setToast(response.data.warning || '模板已绑定');
      await renderDesignTemplateCenterPage();
    },
  );
}

// 将布尔值转换为中文是否
async function renderDesignTemplateCenterPage() {
  var templates = state.designTemplateList || [];
  var bindingsPayload = state.designTemplateBindings || { items: [], bindings: [] };
  var bindingRows = bindingsPayload.items || [];
  var filterState = state.structuredFilters.designTemplates;
  var activeView = state.selectedDesignTemplateView || 'templates';

  // 生成模板详情弹窗内容
  function buildModalDetailHtml(template) {
    var boundSkus = template.bound_skus || [];
    var skuTableRows = boundSkus.map(function(row) {
      return '<tr><td>' + escapeHtml(row.legacy_sku_code || '-') + '</td><td>' + escapeHtml(row.sku_name_cn || '-') + '</td><td>' + escapeHtml(row.bound_at || '-') + '</td><td>' + escapeHtml(row.bound_by || '-') + '</td></tr>';
    }).join('') || '<tr><td colspan="4">当前模板还没有 active SKU 绑定</td></tr>';
    var actionBtns = '<button type="button" class="ghost-btn" id="modalEditTemplateBtn">编辑</button>';
    if (Number(template.status) !== 1) actionBtns += '<button type="button" class="accent-btn" id="modalEnableTemplateBtn">启用</button>';
    if (Number(template.status) === 1) actionBtns += '<button type="button" class="danger-btn" id="modalDisableTemplateBtn">禁用</button>';
    return '<div class="detail-grid">'
      + '<div class="kv"><span>模板编码</span><strong>' + escapeHtml(template.template_code || '-') + '</strong></div>'
      + '<div class="kv"><span>模板名称</span><strong>' + escapeHtml(template.template_name || '-') + '</strong></div>'
      + '<div class="kv"><span>模板版本</span><strong>' + escapeHtml(template.template_version || '-') + '</strong></div>'
      + '<div class="kv"><span>状态</span><strong>' + statusPill(designTemplateStatusLabel(template.status), statusKind(template.status)) + '</strong></div>'
      + '<div class="kv"><span>模板类型</span><strong>' + escapeHtml(template.template_type || '-') + '</strong></div>'
      + '<div class="kv"><span>模板尺寸</span><strong>' + escapeHtml(template.template_size || '-') + '</strong></div>'
      + '<div class="kv"><span>适用材质</span><strong>' + escapeHtml(template.applicable_material || '-') + '</strong></div>'
      + '<div class="kv"><span>工艺要求</span><strong>' + escapeHtml(template.process_requirement || '-') + '</strong></div>'
      + '<div class="kv"><span>AI 路径</span><strong>' + escapeHtml(template.template_ai_url || '-') + '</strong></div>'
      + '<div class="kv"><span>PS 路径</span><strong>' + escapeHtml(template.template_ps_url || '-') + '</strong></div>'
      + '<div class="kv"><span>PNG 路径</span><strong>' + escapeHtml(template.template_png_url || '-') + '</strong></div>'
      + '<div class="kv"><span>生效区间</span><strong>' + escapeHtml(template.effective_from || '-') + ' ~ ' + escapeHtml(template.effective_to || '长期有效') + '</strong></div>'
      + '</div>'
      + '<div class="surface" style="margin-top:16px;"><div class="section-title-row"><span class="section-title">已绑定 SKU</span><span class="section-note">' + escapeHtml(template.bound_sku_count || 0) + ' 个</span></div>'
      + '<div class="table-shell" style="max-height:260px; overflow:auto;"><table><thead><tr><th>SKU编码</th><th>SKU名称</th><th>绑定时间</th><th>绑定人</th></tr></thead><tbody>' + skuTableRows + '</tbody></table></div></div>'
      + '<div class="inline-actions" style="margin-top:18px;">' + actionBtns + '</div>';
  }

  // 打开模板详情弹窗
  function openTemplateDetailModal(template) {
    if (!template) return;
    openReadOnlyModal(
      template.template_name || template.template_code,
      escapeHtml(template.template_code) + ' · ' + escapeHtml(template.template_version || 'V1'),
      buildModalDetailHtml(template)
    );
    document.getElementById('modalEditTemplateBtn')?.addEventListener('click', function() { closeModal(); openDesignTemplateModal(template); });
    // 启用当前设计模板
    document.getElementById('modalEnableTemplateBtn')?.addEventListener('click', async function() {
      await api('/api/v1/design-templates/' + template.template_id + '/status', { method: 'POST', body: JSON.stringify({ status: 1 }) });
      state.designTemplateList = null; await ensureDesignTemplateCenter(); closeModal(); setToast('模板已启用'); await renderDesignTemplateCenterPage();
    });
    // 禁用当前设计模板
    document.getElementById('modalDisableTemplateBtn')?.addEventListener('click', async function() {
      await api('/api/v1/design-templates/' + template.template_id + '/status', { method: 'POST', body: JSON.stringify({ status: 0 }) });
      state.designTemplateList = null; await ensureDesignTemplateCenter(); closeModal(); setToast('模板已禁用'); await renderDesignTemplateCenterPage();
    });
  }

  // 生成模板绑定台账表格行
  function buildBindingTableRows(rows) {
    return rows.slice(0, 50).map(function(row) {
      var cls = row.is_unbound_exception ? 'row-alert' : '';
      var statusCell = row.is_unbound_exception ? statusPill('异常未绑定', 'fail') : statusPill(row.binding_status_label || '-', statusKind(row.binding_status));
      var unbindBtn = row.binding_id ? '<button type="button" class="danger-btn" data-unbind-id="' + row.binding_id + '">解绑</button>' : '';
      return '<tr class="' + cls + '"><td>' + escapeHtml(row.legacy_sku_code || '-') + '</td><td>' + escapeHtml(row.sku_name_cn || '-') + '</td><td>' + escapeHtml(row.template_code || '未绑定') + '</td><td>' + escapeHtml(row.template_version || '-') + '</td><td>' + statusCell + '</td><td><div class="inline-actions"><button type="button" class="light-btn" data-bind-sku-id="' + row.id + '">绑定模板</button>' + unbindBtn + '</div></td></tr>';
    }).join('') || '<tr><td colspan="6">当前没有 SKU 数据</td></tr>';
  }

  if (activeView === 'templates') {
    var statusOpts = '<option value="">全部</option>'
      + '<option value="1"' + (String(filterState.status) === '1' ? ' selected' : '') + '>启用</option>'
      + '<option value="0"' + (String(filterState.status) === '0' ? ' selected' : '') + '>禁用</option>'
      + '<option value="2"' + (String(filterState.status) === '2' ? ' selected' : '') + '>失效</option>';
    refs.pageContent.innerHTML = '<div class="single-col-layout"><div class="surface">'
      + '<div class="section-title-row"><span class="section-title">模板总览</span><div class="inline-actions">'
      + '<button type="button" class="light-btn is-active" id="viewTemplatesBtn">模板总览</button>'
      + '<button type="button" class="light-btn" id="viewBindingsBtn">SKU绑定关系</button>'
      + '<button type="button" class="accent-btn" id="createDesignTemplateBtn">新建模板</button></div></div>'
      + '<div class="inline-actions" style="margin-top:12px; align-items:flex-end;">'
      + '<label class="field" style="min-width:260px; flex:1 1 260px;"><span>搜索模板</span><input id="designTemplateKeywordInput" type="search" value="' + escapeHtml(state.filters.designTemplates) + '" placeholder="模板编码 / 模板名称"></label>'
      + '<label class="field" style="min-width:180px;"><span>模板状态</span><select id="designTemplateStatusFilter">' + statusOpts + '</select></label></div>'
      + '<div class="card-grid" style="margin-top:16px;">' + (templates.map(designTemplateCard).join('') || '<div class="empty-state">当前没有模板数据。</div>') + '</div>'
      + renderServerPagination('designTemplates')
      + '</div></div>';
    // 切换到模板绑定视图
    document.getElementById('viewBindingsBtn').addEventListener('click', async function() {
      state.selectedDesignTemplateView = 'bindings';
      await renderDesignTemplateCenterPage();
    });
    document.getElementById('designTemplateKeywordInput').addEventListener('input', function(event) {
      // 按关键字延迟刷新设计模板列表
      debounce('designTemplateKeywordInput', async function() {
        state.filters.designTemplates = event.target.value.trim();
        state.pagedViews.designTemplates.page = 1;
        await ensureDesignTemplateCenter();
        await renderDesignTemplateCenterPage();
      });
    });
    // 按状态筛选设计模板列表
    document.getElementById('designTemplateStatusFilter').addEventListener('change', async function(event) {
      state.structuredFilters.designTemplates.status = event.target.value;
      state.pagedViews.designTemplates.page = 1;
      await ensureDesignTemplateCenter();
      await renderDesignTemplateCenterPage();
    });
    document.getElementById('createDesignTemplateBtn').addEventListener('click', function() { openDesignTemplateModal(); });
    document.querySelectorAll('[data-design-template-id]').forEach(function(card) {
      // 切换当前选中的设计模板
      card.addEventListener('click', async function() {
        var templateId = Number(card.dataset.designTemplateId);
        var detail = (await api('/api/v1/design-templates/' + templateId)).data;
        openTemplateDetailModal(detail);
      });
    });
    // 翻页后重新加载设计模板中心数据
    bindServerPagination('designTemplates', async function() {
      await ensureDesignTemplateCenter();
      await renderDesignTemplateCenterPage();
    });
  } else {
    var bindingFilterOpts = '<option value="all"' + (state.designBindingFilter === 'all' ? ' selected' : '') + '>全部</option>'
      + '<option value="bound"' + (state.designBindingFilter === 'bound' ? ' selected' : '') + '>已绑定</option>'
      + '<option value="unbound"' + (state.designBindingFilter === 'unbound' ? ' selected' : '') + '>未绑定</option>';
    refs.pageContent.innerHTML = '<div class="single-col-layout"><div class="surface">'
      + '<div class="section-title-row"><span class="section-title">SKU 与模板绑定关系</span><div class="inline-actions">'
      + '<button type="button" class="light-btn" id="viewTemplatesBtn">模板总览</button>'
      + '<button type="button" class="light-btn is-active" id="viewBindingsBtn">SKU绑定关系</button></div></div>'
      + '<div class="inline-actions" style="margin-top:12px; align-items:flex-end;">'
      + '<label class="field" style="min-width:180px;"><span>绑定状态</span><select id="designBindingFilter">' + bindingFilterOpts + '</select></label></div>'
      + '<div class="table-shell" style="margin-top:16px;"><table><thead><tr><th>SKU编码</th><th>SKU名称</th><th>绑定模板</th><th>模板版本</th><th>绑定状态</th><th>操作</th></tr></thead><tbody>'
      + buildBindingTableRows(bindingRows)
      + '</tbody></table></div>'
      + '<nav class="pagination" style="margin-top:16px;"><span class="pagination-info">显示前 50 条 · 共 ' + bindingRows.length + ' 条</span></nav>'
      + '</div></div>';
    // 切换回模板总览视图
    document.getElementById('viewTemplatesBtn').addEventListener('click', async function() {
      state.selectedDesignTemplateView = 'templates';
      await renderDesignTemplateCenterPage();
    });
    // 按绑定状态筛选模板绑定台账
    document.getElementById('designBindingFilter').addEventListener('change', async function(event) {
      state.designBindingFilter = event.target.value;
      await ensureDesignTemplateCenter();
      await renderDesignTemplateCenterPage();
    });
    document.querySelectorAll('[data-bind-sku-id]').forEach(function(button) {
      button.addEventListener('click', function() {
        var row = bindingRows.find(function(item) { return Number(item.id) === Number(button.dataset.bindSkuId); });
        if (row) openBindTemplateModal(row);
      });
    });
    document.querySelectorAll('[data-unbind-id]').forEach(function(button) {
      // 处理当前按钮对应的异步操作
      button.addEventListener('click', async function() {
        await api('/api/v1/sku-template-bindings/' + button.dataset.unbindId + '/unbind', {
          method: 'POST',
          body: JSON.stringify({ remark: '前端手动解绑' }),
        });
        state.designTemplateBindings = null;
        state.unboundDesignSkus = null;
        state.designTemplateList = null;
        await ensureDesignTemplateCenter();
        setToast('绑定已解除');
        await renderDesignTemplateCenterPage();
      });
    });
  }
}

// 渲染供应链维护页面
