// ============================================================
// 属性定义页面
// ============================================================

async function renderAttributesPage() {
  const keyword = state.filters.attributes;
  const classificationFilter = state.structuredFilters.attributes?.classification || '';
  const rows = filteredRows(state.attributes, keyword, ['attribute_name_cn', 'attribute_name_en', 'attribute_code'])
    .filter((row) => !classificationFilter || row.classification === classificationFilter);
  const selected = rows[state.selectedAttributeIndex] || rows[0];
  const options = selected ? (await api(`/api/v1/attributes/${selected.id}/options`)).data : [];
  const classifications = [...new Set((state.attributes || []).map((row) => row.classification).filter(Boolean))];
  refs.pageContent.innerHTML = `
    <div class="grid-main">
      <div class="surface">
        <div class="section-title-row">
          <span class="section-title">定义列表</span>
          <div class="inline-actions">
            <button type="button" class="light-btn" id="exportAttributesBtn">导出定义表</button>
            <button type="button" class="accent-btn" id="createAttributeBtn">新增属性</button>
          </div>
        </div>
        <div class="inline-actions" style="align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <label class="field" style="min-width:220px;"><span>分类筛选</span><select id="attributeClassificationFilter">${buildSelectOptions(classifications, classificationFilter, '全部分类')}</select></label>
          <label class="field" style="min-width:280px; flex:1 1 280px;"><span>搜索属性</span><input id="attributeSearchInput" type="search" value="${escapeHtml(keyword)}" placeholder="例如：形状、尺寸、覆膜"></label>
        </div>
        <div class="table-shell">
          <table>
            <thead><tr><th>属性名称</th><th>属性类型</th><th>分类</th><th>数据类型</th><th>选项数</th><th>前端组件</th><th>状态</th></tr></thead>
            <tbody>
              ${rows.map((row, index) => `
                <tr data-attr-index="${index}">
                  <td>${escapeHtml(row.attribute_name_cn)}<div class="muted">${escapeHtml(row.attribute_name_en || '')}</div></td>
                  <td>${escapeHtml(row.attribute_category)}</td>
                  <td>${badge(row.classification || 'basic', 'viewer')}</td>
                  <td>${escapeHtml(row.data_type)}</td>
                  <td>${escapeHtml(row.option_count)}</td>
                  <td>${escapeHtml(row.frontend_component || '-')}</td>
                  <td>${statusPill(humanStatus(row.status), statusKind(row.status))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="surface-soft">
        <div class="section-title-row">
          <span class="section-title">属性详情与选项维护</span>
          <div class="inline-actions">
            ${selected ? '<button type="button" class="light-btn" id="createAttributeOptionBtn">新增选项</button>' : ''}
          </div>
        </div>
        ${selected ? `
            <div class="detail-grid">
              <div class="kv"><span>属性名称（中文）</span><strong>${escapeHtml(selected.attribute_name_cn)}</strong></div>
              <div class="kv"><span>属性名称（英文）</span><strong>${escapeHtml(selected.attribute_name_en || '-')}</strong></div>
            <div class="kv"><span>属性类型</span><strong>${escapeHtml(selected.attribute_category)}</strong></div>
            <div class="kv"><span>属性分类</span><strong>${escapeHtml(selected.classification || 'basic')}</strong></div>
            <div class="kv"><span>数据类型</span><strong>${escapeHtml(selected.data_type)}</strong></div>
            <div class="kv"><span>前端组件</span><strong>${escapeHtml(selected.frontend_component || '-')}</strong></div>
            <div class="kv"><span>是否允许自定义值</span><strong>${selected.allow_custom_value ? '是' : '否'}</strong></div>
            <div class="kv"><span>是否可以为空</span><strong>${selected.allow_empty ? '是' : '否'}</strong></div>
              <div class="kv"><span>选项数</span><strong>${options.length}</strong></div>
              <div class="kv"><span>状态</span><strong>${escapeHtml(humanStatus(selected.status))}</strong></div>
            </div>
            <div class="inline-actions" style="margin-top:12px;">
              <button type="button" class="ghost-btn" id="toggleAttributeStatusBtn">${selected.status === 1 ? '禁用属性' : '启用属性'}</button>
              <button type="button" class="light-btn" id="markAttributePendingBtn">标记待审核</button>
            </div>
            <div class="surface" style="margin-top:16px;">
              <div class="section-title-row"><span class="section-title">选项值</span><span class="section-note">尺寸等大属性建议通过搜索定位</span></div>
              <div class="table-shell">
                <table>
                  <thead><tr><th>中文选项值</th><th>英文选项值</th><th>频次</th><th>状态</th><th>操作</th></tr></thead>
                  <tbody>
                    ${options.map((option) => `
                      <tr>
                        <td>${escapeHtml(option.option_name_cn)}</td>
                        <td>${escapeHtml(option.option_name_en || '-')}</td>
                        <td>${option.is_high_frequency ? badge('高频', 'ok') : '<span class="muted">-</span>'}</td>
                        <td>${statusPill(humanStatus(option.status), statusKind(option.status))}</td>
                        <td><div class="inline-actions"><button type="button" class="ghost-btn toggle-option-status-btn" data-option-id="${option.id}" data-status="${option.status === 1 ? 0 : 1}">${option.status === 1 ? '禁用' : '启用'}</button><button type="button" class="light-btn option-pending-btn" data-option-id="${option.id}">待审核</button><button type="button" class="ghost-btn delete-option-btn" data-option-id="${option.id}">删除</button></div></td>
                      </tr>
                    `).join('')}
                  </tbody>
              </table>
            </div>
          </div>
        ` : '<div class="empty-state">暂无属性定义</div>'}
      </div>
    </div>
  `;
  document.getElementById('attributeSearchInput').addEventListener('input', (event) => {
    state.filters.attributes = event.target.value.trim();
    state.selectedAttributeIndex = 0;
    renderAttributesPage();
  });
  document.getElementById('attributeClassificationFilter').addEventListener('change', async (event) => {
    state.structuredFilters.attributes = { ...(state.structuredFilters.attributes || {}), classification: event.target.value };
    state.selectedAttributeIndex = 0;
    await renderAttributesPage();
  });
  document.getElementById('exportAttributesBtn').addEventListener('click', () => {
    downloadCsv('属性工艺定义表.csv', rows.map((row) => ({
      属性名称: row.attribute_name_cn,
      属性英文名: row.attribute_name_en,
      属性类型: row.attribute_category,
      数据类型: row.data_type,
      选项数量: row.option_count,
      备注: row.remark,
    })));
  });
  document.querySelectorAll('[data-attr-index]').forEach((row) => {
    row.addEventListener('click', async () => {
      state.selectedAttributeIndex = Number(row.dataset.attrIndex);
      await renderAttributesPage();
    });
  });
  document.getElementById('createAttributeBtn').addEventListener('click', () => {
    openModal(
      '新增属性',
      '新增后会立刻出现在定义表里。',
      `
        <label class="field"><span>属性名称（中文）</span><input name="attribute_name_cn" required></label>
        <label class="field"><span>属性名称（英文）</span><input name="attribute_name_en"></label>
        <label class="field"><span>属性类型</span><input name="attribute_category" value="global_attribute"></label>
        <label class="field"><span>属性分类</span><select name="classification"><option value="basic">basic</option><option value="sales">sales</option><option value="production">production</option><option value="process">process</option><option value="packaging">packaging</option><option value="logistics">logistics</option><option value="platform_display">platform_display</option><option value="internal">internal</option></select></label>
        <label class="field"><span>数据类型</span><input name="data_type" value="enum"></label>
        <label class="field"><span>前端展示组件</span><input name="frontend_component" value="单选"></label>
        <label class="field"><span>是否允许自定义值</span><select name="allow_custom_value"><option value="0">否</option><option value="1">是</option></select></label>
        <label class="field"><span>是否可以为空</span><select name="allow_empty"><option value="0">否</option><option value="1">是</option></select></label>
        <label class="field full-span"><span>备注</span><textarea name="remark"></textarea></label>
      `,
      async (payload) => {
        await api('/api/v1/attributes', { method: 'POST', body: JSON.stringify(payload) });
        state.attributes = null;
        await ensureAttributes();
        state.selectedAttributeIndex = state.attributes.length - 1;
        setToast('属性已新增');
        await renderAttributesPage();
      },
    );
  });
  document.getElementById('createAttributeOptionBtn')?.addEventListener('click', () => {
    openModal(
      `给 ${selected.attribute_name_cn} 新增选项`,
      '新增后会立即出现在选项列表中。',
      `
        <label class="field"><span>选项值（中文）</span><input name="option_name_cn" required></label>
        <label class="field"><span>选项值（英文）</span><input name="option_name_en"></label>
        <label class="field"><span>高频选项</span><select name="is_high_frequency"><option value="0">否</option><option value="1">是</option></select></label>
        <label class="field full-span"><span>备注</span><textarea name="remark"></textarea></label>
      `,
      async (payload) => {
        await api(`/api/v1/attributes/${selected.id}/options`, { method: 'POST', body: JSON.stringify(payload) });
        state.attributes = null;
        await ensureAttributes();
        setToast('选项已新增');
        await renderAttributesPage();
      },
    );
  });
  document.getElementById('toggleAttributeStatusBtn')?.addEventListener('click', async () => {
    await updateEntityStatus(`/api/v1/attributes/${selected.id}/status`, selected.status === 1 ? 0 : 1, '属性状态已更新');
    state.attributes = null;
    await ensureAttributes();
    await renderAttributesPage();
  });
  document.getElementById('markAttributePendingBtn')?.addEventListener('click', async () => {
    await updateEntityStatus(`/api/v1/attributes/${selected.id}/status`, 2, '属性已标记为待审核');
    state.attributes = null;
    await ensureAttributes();
    await renderAttributesPage();
  });
  document.querySelectorAll('.toggle-option-status-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      await updateEntityStatus(`/api/v1/attribute-options/${button.dataset.optionId}/status`, Number(button.dataset.status), '选项状态已更新');
      state.attributes = null;
      await ensureAttributes();
      await renderAttributesPage();
    });
  });
  document.querySelectorAll('.option-pending-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      await updateEntityStatus(`/api/v1/attribute-options/${button.dataset.optionId}/status`, 2, '选项已标记为待审核');
      state.attributes = null;
      await ensureAttributes();
      await renderAttributesPage();
    });
  });
  document.querySelectorAll('.delete-option-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      await api(`/api/v1/attribute-options/${button.dataset.optionId}/delete`, { method: 'POST', body: JSON.stringify({}) });
      state.attributes = null;
      await ensureAttributes();
      setToast('选项已删除');
      await renderAttributesPage();
    });
  });
}

// 渲染母体组合管理页面
