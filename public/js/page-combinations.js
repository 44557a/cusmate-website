// ============================================================
// 组合维护页面
// ============================================================

function createCombinationEditorState(attributes, selectedAttributes) {
  // 先把已选属性转成 Map，便于后续高频读写
  const selectedMap = new Map((selectedAttributes || []).map((item) => [Number(item.attribute_def_id), new Set((item.allowed_option_ids || []).map((value) => Number(value)))]));
  const draftAttributes = (attributes || []).map((attr, index) => {
    const optionRows = (state.attributeOptionsCache?.[attr.id] || []).map((option) => ({
      optionId: Number(option.id),
      optionName: option.option_name_cn || option.option_name_en || `选项 ${option.id}`,
    }));
    const selectedOptionIds = selectedMap.get(Number(attr.id)) || new Set();
    return {
      attributeId: Number(attr.id),
      attributeName: attr.attribute_name_cn || attr.attribute_name_en || `属性 ${index + 1}`,
      enabled: selectedMap.has(Number(attr.id)),
      searchTerm: '',
      options: optionRows,
      selectedOptionIds: new Set(optionRows.filter((option) => selectedOptionIds.has(option.optionId)).map((option) => option.optionId)),
    };
  });
  const initialOpenAttributeId = draftAttributes.find((item) => item.enabled && item.options.length)?.attributeId
    || draftAttributes.find((item) => item.options.length)?.attributeId
    || draftAttributes[0]?.attributeId
    || null;
  return {
    openAttributeId: initialOpenAttributeId,
    attributes: draftAttributes,
  };
}

// 按属性 ID 获取组合编辑项
function combinationEntryById(editorState, attributeId) {
  return editorState.attributes.find((item) => item.attributeId === Number(attributeId)) || null;
}

// 按关键字过滤属性选项
function combinationFilteredOptions(entry) {
  const keyword = String(entry?.searchTerm || '').trim();
  if (!keyword) return entry?.options || [];
  return (entry?.options || []).filter((option) => String(option.optionName || '').includes(keyword));
}

// 汇总组合编辑器中的统计信息
function combinationSummary(editorState) {
  const enabledAttributes = editorState.attributes.filter((item) => item.enabled);
  // 理论组合数按启用属性的已选项数量连乘计算
  const theoreticalCount = enabledAttributes.reduce((total, item, index) => {
    const count = item.selectedOptionIds.size;
    if (index === 0) return count;
    return total * count;
  }, enabledAttributes.length ? 1 : 0);
  return {
    enabledCount: enabledAttributes.length,
    theoreticalCount,
    emptyEnabledCount: enabledAttributes.filter((item) => item.selectedOptionIds.size === 0).length,
    enabledAttributes,
  };
}

// 生成组合编辑摘要区域 HTML
function buildCombinationSummaryHtml(editorState) {
  const summary = combinationSummary(editorState);
  const enabledRows = summary.enabledAttributes;
  return `
    <div class="combo-summary-card">
      <div class="section-title-row">
        <span class="section-title">实时摘要</span>
        <span class="section-note">保存时仍按当前接口格式提交</span>
      </div>
      <div class="combo-summary-grid">
        <article class="summary-card">
          <span>参与 SKU 生成的属性</span>
          <strong>${escapeHtml(integerDisplay(summary.enabledCount))}</strong>
        </article>
        <article class="summary-card">
          <span>理论 SKU 组合数</span>
          <strong>${escapeHtml(integerDisplay(summary.theoreticalCount))}</strong>
        </article>
      </div>
      ${summary.emptyEnabledCount ? `<div class="combo-summary-alert">有 ${escapeHtml(integerDisplay(summary.emptyEnabledCount))} 个已启用属性还没选任何选项，当前组合数会按 0 处理。</div>` : ''}
      ${summary.theoreticalCount > 10000 ? '<div class="combo-summary-alert is-warning">理论组合数超过 10,000，建议先收敛选项范围，避免后续 SKU 生成和审核压力过大。</div>' : ''}
      <div class="combo-summary-list">
        ${enabledRows.length ? enabledRows.map((item) => `
          <div class="combo-summary-row">
            <span>${escapeHtml(item.attributeName)}</span>
            <strong>${escapeHtml(integerDisplay(item.selectedOptionIds.size))} / ${escapeHtml(integerDisplay(item.options.length))}</strong>
          </div>
        `).join('') : '<div class="empty-state">当前还没有启用任何属性。</div>'}
      </div>
    </div>
  `;
}

// 生成单个属性面板的编辑 HTML
function buildCombinationAttributePanelHtml(entry, isOpen) {
  const filteredOptions = combinationFilteredOptions(entry);
  const selectedCount = entry.selectedOptionIds.size;
  const bodyId = `comboAttrBody_${entry.attributeId}`;
  return `
    <section class="combo-attr-panel ${entry.enabled ? 'is-enabled' : 'is-disabled'} ${isOpen ? 'is-open' : ''}" data-combo-attribute-panel="${entry.attributeId}">
      <div class="combo-attr-header">
        <label class="combo-attr-checkbox" for="comboAttrEnable_${entry.attributeId}">
          <input id="comboAttrEnable_${entry.attributeId}" type="checkbox" data-combo-enable="${entry.attributeId}" ${entry.enabled ? 'checked' : ''}>
          <span>启用</span>
        </label>
        <button type="button" class="combo-attr-toggle" data-combo-accordion-toggle="${entry.attributeId}" aria-expanded="${isOpen ? 'true' : 'false'}" aria-controls="${bodyId}">
          <span class="combo-attr-title-wrap">
            <strong>${escapeHtml(entry.attributeName)}</strong>
            <span>${escapeHtml(integerDisplay(selectedCount))} / ${escapeHtml(integerDisplay(entry.options.length))} 已选</span>
          </span>
          <span class="combo-attr-toggle-meta">
            <span class="combo-attr-status">${entry.enabled ? '属性已启用' : '属性未启用'}</span>
            <span class="combo-attr-arrow">⌄</span>
          </span>
        </button>
      </div>
      <div class="combo-attr-body" id="${bodyId}" ${isOpen ? '' : 'hidden'}>
        <div class="combo-attr-body-inner">
          <div class="combo-attr-toolbar">
            <label class="field combo-search-field">
              <span>搜索选项</span>
              <input type="search" data-combo-search="${entry.attributeId}" value="${escapeHtml(entry.searchTerm)}" placeholder="输入关键字即时筛选" ${entry.enabled ? '' : 'disabled'}>
            </label>
            <div class="combo-bulk-actions">
              <button type="button" class="ghost-btn" data-combo-bulk="all" data-combo-attribute-id="${entry.attributeId}" ${entry.enabled && filteredOptions.length ? '' : 'disabled'}>全选</button>
              <button type="button" class="ghost-btn" data-combo-bulk="none" data-combo-attribute-id="${entry.attributeId}" ${entry.enabled && filteredOptions.length ? '' : 'disabled'}>全不选</button>
              <button type="button" class="ghost-btn" data-combo-bulk="invert" data-combo-attribute-id="${entry.attributeId}" ${entry.enabled && filteredOptions.length ? '' : 'disabled'}>反选</button>
            </div>
          </div>
          <div class="combo-attr-meta-row">
            <span>已选 ${escapeHtml(integerDisplay(selectedCount))} / 共 ${escapeHtml(integerDisplay(entry.options.length))}</span>
            <span>${entry.searchTerm ? `当前筛选 ${escapeHtml(integerDisplay(filteredOptions.length))} 项` : '批量操作对当前筛选结果生效'}</span>
          </div>
          <div class="combo-chip-grid">
            ${filteredOptions.length ? filteredOptions.map((option) => {
    const selected = entry.selectedOptionIds.has(option.optionId);
    return `<button type="button" class="combo-option-chip ${selected ? 'is-selected' : ''}" data-combo-option-id="${option.optionId}" data-combo-attribute-id="${entry.attributeId}" ${entry.enabled ? '' : 'disabled'}>${escapeHtml(option.optionName)}</button>`;
  }).join('') : `<div class="combo-empty-state">${entry.searchTerm ? '没有匹配的选项' : '当前没有可选项'}</div>`}
          </div>
        </div>
      </div>
    </section>
  `;
}

// 打开母体组合编辑弹窗
function openCombinationEditorModal(parentVersionId, target) {
  const editorState = createCombinationEditorState(state.attributes || [], target?.attributes || []);
  openModal(
    `编辑 ${target?.parent_version_code || ''} 组合`,
    '按属性分组维护参与 SKU 的维度和允许选项，保存后立即生效。',
    `
      <div class="full-span combo-editor" id="comboEditor">
        <div class="combo-editor-main">
          <div class="combo-editor-list" id="comboEditorList"></div>
          <aside class="combo-editor-summary surface-soft" id="comboEditorSummary"></aside>
        </div>
      </div>
    `,
    async () => {
      const groups = editorState.attributes
        .filter((item) => item.enabled)
        .map((item) => ({
          attribute_def_id: item.attributeId,
          allowed_option_ids: Array.from(item.selectedOptionIds),
        }));
      await api(`/api/v1/parent-combination-groups/${parentVersionId}`, {
        method: 'POST',
        body: JSON.stringify({ attribute_groups: groups }),
      });
      state.combinations = null;
      await ensureCombinations();
      setToast('母体组合已更新');
      renderCombinationsPage();
    },
  );

  const modalCard = refs.modalRoot?.querySelector('.modal-card');
  const modalForm = document.getElementById('modalForm');
  const editorRoot = document.getElementById('comboEditor');
  const listElement = document.getElementById('comboEditorList');
  const summaryElement = document.getElementById('comboEditorSummary');
  if (!modalCard || !modalForm || !editorRoot || !listElement || !summaryElement) return;

  modalCard.classList.add('combo-editor-modal');
  modalForm.classList.add('combo-editor-form');

  // 刷新组合编辑器的列表与摘要内容
  function renderEditor(options = {}) {
    listElement.innerHTML = editorState.attributes.map((entry) => buildCombinationAttributePanelHtml(entry, editorState.openAttributeId === entry.attributeId)).join('');
    summaryElement.innerHTML = buildCombinationSummaryHtml(editorState);

    if (options.focusSearchAttributeId) {
      const searchInput = listElement.querySelector(`[data-combo-search="${options.focusSearchAttributeId}"]`);
      if (searchInput) {
        searchInput.focus();
        if (typeof options.selectionStart === 'number' && typeof options.selectionEnd === 'number') {
          searchInput.setSelectionRange(options.selectionStart, options.selectionEnd);
        }
      }
    }
  }

  editorRoot.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-combo-enable]');
    if (!checkbox) return;
    const entry = combinationEntryById(editorState, checkbox.dataset.comboEnable);
    if (!entry) return;
    entry.enabled = checkbox.checked;
    if (entry.enabled) {
      editorState.openAttributeId = entry.attributeId;
    }
    renderEditor();
  });

  editorRoot.addEventListener('input', (event) => {
    const input = event.target.closest('[data-combo-search]');
    if (!input) return;
    const entry = combinationEntryById(editorState, input.dataset.comboSearch);
    if (!entry) return;
    entry.searchTerm = input.value;
    renderEditor({
      focusSearchAttributeId: entry.attributeId,
      selectionStart: input.selectionStart,
      selectionEnd: input.selectionEnd,
    });
  });

  editorRoot.addEventListener('click', (event) => {
    const toggleButton = event.target.closest('[data-combo-accordion-toggle]');
    if (toggleButton) {
      const attributeId = Number(toggleButton.dataset.comboAccordionToggle);
      editorState.openAttributeId = editorState.openAttributeId === attributeId ? null : attributeId;
      renderEditor();
      return;
    }

    const bulkButton = event.target.closest('[data-combo-bulk]');
    if (bulkButton) {
      const entry = combinationEntryById(editorState, bulkButton.dataset.comboAttributeId);
      if (!entry) return;
      const visibleOptions = combinationFilteredOptions(entry).map((option) => option.optionId);
      if (bulkButton.dataset.comboBulk === 'all') {
        visibleOptions.forEach((optionId) => entry.selectedOptionIds.add(optionId));
      }
      if (bulkButton.dataset.comboBulk === 'none') {
        visibleOptions.forEach((optionId) => entry.selectedOptionIds.delete(optionId));
      }
      if (bulkButton.dataset.comboBulk === 'invert') {
        visibleOptions.forEach((optionId) => {
          if (entry.selectedOptionIds.has(optionId)) {
            entry.selectedOptionIds.delete(optionId);
          } else {
            entry.selectedOptionIds.add(optionId);
          }
        });
      }
      renderEditor();
      return;
    }

    const optionButton = event.target.closest('[data-combo-option-id]');
    if (optionButton) {
      const entry = combinationEntryById(editorState, optionButton.dataset.comboAttributeId);
      const optionId = Number(optionButton.dataset.comboOptionId);
      if (!entry) return;
      if (entry.selectedOptionIds.has(optionId)) {
        entry.selectedOptionIds.delete(optionId);
      } else {
        entry.selectedOptionIds.add(optionId);
      }
      renderEditor();
    }
  });

  renderEditor();
}

// ============================================================
// 分页与分页绑定
// ============================================================

// 生成服务端分页控件 HTML
function renderCombinationsPage() {
  const keyword = state.filters.combinations;
  const rows = filteredRows(state.combinations, keyword, ['parent_version_code', 'parent_name_cn']);
  const selectedParentVersionId = rows[0]?.parent_version_id;
  refs.pageContent.innerHTML = `
    <div class="surface">
      <div class="section-title-row">
        <span class="section-title">母体组合维护（信息来自「属性定义表」）</span>
        <div class="inline-actions"><button type="button" class="light-btn" id="exportCombinationsBtn">导出组合表</button><button type="button" class="ghost-btn" id="copyCombinationConfigBtn">复制其他母体配置</button></div>
      </div>
      <label class="field full-span"><span>搜索母体</span><input id="combinationSearchInput" type="search" value="${escapeHtml(keyword)}" placeholder="例如：CM006A、吊牌"></label>
      <div class="metric-grid" id="combinationStatsPanel"></div>
      <div class="table-shell data-scroll-body">
        <table>
          <thead><tr><th>母体版本</th><th>母体名称</th><th>已绑定属性</th><th>操作</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${escapeHtml(row.parent_version_code)}</td>
                <td>${escapeHtml(row.parent_name_cn)}</td>
                <td>${row.attributes.map((item) => `<span class="chip">${escapeHtml(item.attribute_name_cn)}</span>`).join(' ')}</td>
                <td><button type="button" class="ghost-btn edit-combination-btn" data-parent-version-id="${row.parent_version_id}">编辑组合</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById('combinationSearchInput').addEventListener('input', (event) => {
    state.filters.combinations = event.target.value.trim();
    renderCombinationsPage();
  });
  if (selectedParentVersionId) {
    ensureCombinationStatistics(selectedParentVersionId).then((stats) => {
      const panel = document.getElementById('combinationStatsPanel');
      if (!panel) return;
      panel.innerHTML = `
        <article class="summary-card"><span>理论组合数</span><strong>${escapeHtml(stats.theoretical_count)}</strong></article>
        <article class="summary-card"><span>已启用</span><strong>${escapeHtml(stats.enabled_count)}</strong></article>
        <article class="summary-card"><span>停用/历史</span><strong>${escapeHtml(stats.disabled_count)}</strong></article>
        <article class="summary-card"><span>冲突数</span><strong>${escapeHtml(stats.conflict_count)}</strong></article>
      `;
    });
  }
  document.getElementById('exportCombinationsBtn').addEventListener('click', () => {
    downloadCsv('母体属性工艺组合表.csv', rows.map((row) => ({
      母体版本: row.parent_version_code,
      母体名称: row.parent_name_cn,
      属性数量: row.attributes.length,
      属性列表: row.attributes.map((item) => item.attribute_name_cn).join(' / '),
    })));
  });
  document.getElementById('copyCombinationConfigBtn').addEventListener('click', () => {
    openModal(
      '复制组合配置',
      '把一个母体版本的组合配置复制到另一个母体版本。',
      `
        <label class="field"><span>来源母体版本ID</span><input name="source_parent_version_id" type="number" required></label>
        <label class="field"><span>目标母体版本ID</span><input name="target_parent_version_id" type="number" required></label>
      `,
      async (payload) => {
        await api('/api/v1/combinations/copy-from', { method: 'POST', body: JSON.stringify({ source_parent_version_id: Number(payload.source_parent_version_id), target_parent_version_id: Number(payload.target_parent_version_id) }) });
        state.combinations = null;
        await ensureCombinations();
        setToast('组合配置已复制');
        renderCombinationsPage();
      },
    );
  });
  document.querySelectorAll('.edit-combination-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const parentVersionId = Number(button.dataset.parentVersionId);
      const target = rows.find((item) => item.parent_version_id === parentVersionId);
      openCombinationEditorModal(parentVersionId, target);
    });
  });
}

// 渲染 SKU 详情面板内容
