// ============================================================
// 物流页面
// ============================================================

async function renderSurchargeRulesPanel() {
  if (!state.surchargeRules) {
    state.surchargeRules = (await api('/api/v1/freight/surcharge-rules')).data;
  }
  const rules = state.surchargeRules || [];
  const templateNames = [...new Set(rules.map((r) => (r.template_name || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const keyword = (state.surchargeFilter || '').toLowerCase();
  const selectedTemplate = state.surchargeTemplateFilter || '';
  // 同时支持模板和关键字双重筛选附加费规则
  const filtered = rules.filter((r) => {
    const matchesKeyword = !keyword || `${r.country_code} ${r.template_name || ''} ${r.action_type_label || ''} ${r.remark || ''}`.toLowerCase().includes(keyword);
    const matchesTemplate = !selectedTemplate || (r.template_name || '') === selectedTemplate;
    return matchesKeyword && matchesTemplate;
  });
  const actionPill = (t) => ({ add_fee: 'fail', forbid: 'warn', no_surcharge: 'info', no_limit: 'ok' })[t] || 'muted';
  return `
    <div class="surface">
      <div class="section-title-row">
        <span class="section-title">超尺寸附加费规则 (${rules.length})</span>
        <div class="inline-actions">
          <button type="button" class="light-btn" id="surchargeUploadBtn">上传规则表</button>
          <input type="file" id="surchargeUploadInput" accept=".xlsx,.xls" style="display:none">
        </div>
      </div>
      <div style="margin-bottom:12px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <input type="search" id="surchargeSearchInput" value="${escapeHtml(state.surchargeFilter || '')}" placeholder="搜索模板 / 国家代码 / 类型" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; width:320px;">
        <select id="surchargeTemplateSelect" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; min-width:220px;">
          <option value="">全部模板</option>
          ${templateNames.map((name) => `<option value="${escapeHtml(name)}" ${selectedTemplate === name ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}
        </select>
      </div>
      <div class="table-shell"><table><thead><tr>
        <th>运费模板</th><th>国家</th><th>类型</th><th>无附加费-最长</th><th>无附加费-次长</th><th>无附加费-最短</th><th>无附加费-条件</th>
        <th>有附加费-最长</th><th>有附加费-次长</th><th>有附加费-最短</th><th>有附加费-条件</th><th>金额(元)</th><th>操作</th>
      </tr></thead><tbody>
        ${filtered.map((r) => `<tr>
          <td>${escapeHtml(r.template_name || '-')}</td>
          <td>${escapeHtml(r.country_code)}</td>
          <td>${statusPill(r.action_type_label || r.action_type, actionPill(r.action_type))}</td>
          <td>${r.no_fee_longest_cm ?? '-'}</td><td>${r.no_fee_middle_cm ?? '-'}</td><td>${r.no_fee_shortest_cm ?? '-'}</td>
          <td>${escapeHtml(r.no_fee_condition_expr || '-')}</td>
          <td>${r.surcharge_longest_cm ?? '-'}</td><td>${r.surcharge_middle_cm ?? '-'}</td><td>${r.surcharge_shortest_cm ?? '-'}</td>
          <td>${escapeHtml(r.surcharge_condition_expr || '-')}</td>
          <td>${r.surcharge_amount ?? '-'}</td>
          <td><button type="button" class="ghost-btn" data-del-surcharge="${r.id}" style="font-size:12px;">删除</button></td>
        </tr>`).join('') || '<tr><td colspan="13">暂无规则</td></tr>'}
      </tbody></table></div>
    </div>
  `;
}

// 绑定附加费规则面板交互事件
function bindSurchargeRulesPanelEvents() {
  document.getElementById('surchargeSearchInput')?.addEventListener('input', (e) => {
    state.surchargeFilter = e.target.value.trim();
    renderFreightTemplatesPage();
  });
  document.getElementById('surchargeTemplateSelect')?.addEventListener('change', (e) => {
    state.surchargeTemplateFilter = e.target.value;
    renderFreightTemplatesPage();
  });
  document.getElementById('surchargeUploadBtn')?.addEventListener('click', () => {
    document.getElementById('surchargeUploadInput')?.click();
  });
  document.getElementById('surchargeUploadInput')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setToast('正在上传超尺寸规则...');
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const result = await api('/api/v1/freight/surcharge-rules/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, file_data: base64 }),
      });
      state.surchargeRules = null;
      setToast(`上传完成：导入 ${result.data?.imported_count || 0} 条规则`);
      await renderFreightTemplatesPage();
    };
    reader.readAsDataURL(file);
  });
  document.querySelectorAll('[data-del-surcharge]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.delSurcharge;
      await api(`/api/v1/freight/surcharge-rules/${id}/delete`, { method: 'POST', body: '{}' });
      state.surchargeRules = null;
      setToast('已删除');
      await renderFreightTemplatesPage();
    });
  });
}

// 渲染物流运费模板页面
async function renderFreightTemplatesPage() {
  if (!state.freightTemplateTab) state.freightTemplateTab = 'templates';
  const uploadResults = state.templateUploadResults || [];
  const templatesPanel = `
    <div class="page-grid"><div class="surface freight-template-master-page">
      <form id="freightTemplateUploadForm" class="freight-template-upload-bar">
        <input id="freightTemplateUploadInput" name="files" type="file" accept=".xlsx,.xls" multiple>
        <input id="freightTemplateEffectiveFrom" name="effective_from" type="date" value="${new Date().toISOString().slice(0, 10)}">
        <button type="submit" class="accent-btn">上传</button>
        <button type="button" class="ghost-btn" id="freightTemplateBatchUploadBtn">批量上传</button>
        <button type="button" class="light-btn" id="exportTemplatesBtn">导出清单</button>
        ${uploadResults.length ? `<span class="muted freight-upload-result-hint">最近：${escapeHtml(uploadResults.map((r) => r.template_name).join('、'))}</span>` : ''}
      </form>
      <div class="section-title-row" style="margin-top:16px;"><span class="section-title">模板列表</span><span class="section-note">一份模板一行，详情和绑定渠道通过按钮操作</span></div>
      <div class="table-shell freight-template-master-table" style="margin-top:16px;">
        <table>
          <thead>
            <tr>
              <th>模板名称</th>
              <th>模板编码</th>
              <th>当前版本</th>
              <th>渠道类型</th>
              <th>绑定渠道</th>
              <th>覆盖国家</th>
              <th>规则总数</th>
              <th>生效时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${(state.templates || []).map((template) => `
              <tr>
                <td><strong>${escapeHtml(template.template_name)}</strong></td>
                <td>${escapeHtml(template.template_code)}</td>
                <td>${escapeHtml(template.current_version?.version_label || '-')}</td>
                <td>${escapeHtml(template.channel_type_label || '-')}</td>
                <td>${escapeHtml(template.channel_name || (template.bound_channel_names || []).join(' / ') || '暂无')}</td>
                <td>${escapeHtml(template.country_count || 0)} 个</td>
                <td>${escapeHtml(template.rule_count || 0)}</td>
                <td>${escapeHtml(template.current_version?.effective_from || '-')}</td>
                <td>${statusPill(template.status_label || '-', Number(template.status || 1) === 1 ? 'ok' : 'fail')}</td>
                <td>
                  <div class="inline-actions freight-template-actions">
                    <button type="button" class="light-btn template-detail-btn" data-template-id="${template.id}">详情</button>
                    <button type="button" class="ghost-btn template-replace-btn" data-template-id="${template.id}">替换</button>
                    <button type="button" class="danger-btn template-delete-btn" data-template-id="${template.id}">停用</button>
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="10">当前没有运费模板</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="surface" style="margin-top:16px;">
        <div class="section-title-row"><span class="section-title">导入历史</span><span class="section-note">最近操作留痕</span></div>
        <div class="table-shell"><table><thead><tr><th>时间</th><th>文件名</th><th>结果</th><th>规则数</th><th>国家数</th><th>操作人</th></tr></thead><tbody>
          ${(state.templateImportHistory || []).map((row) => `
            <tr>
              <td>${escapeHtml(row.imported_at || '-')}</td>
              <td>${escapeHtml(row.filename || '-')}</td>
              <td>${escapeHtml(row.result || '-')}</td>
              <td>${escapeHtml(row.rules_count || 0)}</td>
              <td>${escapeHtml(row.countries_count || 0)}</td>
              <td>${escapeHtml(row.operator_name || '-')}</td>
            </tr>
          `).join('') || '<tr><td colspan="6">暂无导入历史</td></tr>'}
        </tbody></table></div>
      </div>
    </div></div>
  `;
  refs.pageContent.innerHTML = `
    <div class="single-col-layout">
      <div class="surface">
        <div class="section-title-row">
          <span class="section-title">物流运费模板</span>
          <div class="inline-actions">
            <button type="button" class="${state.freightTemplateTab === 'templates' ? 'light-btn is-active' : 'ghost-btn'}" data-ft-tab="templates">运费模板</button>
            <button type="button" class="${state.freightTemplateTab === 'surcharge' ? 'light-btn is-active' : 'ghost-btn'}" data-ft-tab="surcharge">超尺寸附加费规则</button>
          </div>
        </div>
      </div>
      ${state.freightTemplateTab === 'surcharge' ? await renderSurchargeRulesPanel() : ''}
      ${state.freightTemplateTab === 'templates' ? templatesPanel : ''}
    </div>
  `;
  document.getElementById('exportTemplatesBtn')?.addEventListener('click', () => {
    downloadCsv('运费模板清单.csv', state.templates.map((template) => ({
      模板名称: template.template_name,
      模板编码: template.template_code,
      币种: template.currency,
      计费模式: template.billing_mode,
      当前版本: template.versions[template.versions.length - 1]?.version_label || '',
      绑定渠道: (template.bound_channel_names || []).join(' / '),
    })));
  });
  document.querySelectorAll('[data-ft-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.freightTemplateTab = btn.dataset.ftTab;
      renderFreightTemplatesPage();
    });
  });
  if (state.freightTemplateTab === 'surcharge') {
    bindSurchargeRulesPanelEvents();
    return;
  }
  document.getElementById('freightTemplateUploadForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const effectiveFrom = document.getElementById('freightTemplateEffectiveFrom').value;
    const files = document.getElementById('freightTemplateUploadInput').files;
    try {
      const results = await submitFreightTemplateUpload(files, effectiveFrom, 'single');
      setToast(`上传完成：${results.map((item) => item.template_name).join('、')}`);
      await renderFreightTemplatesPage();
    } catch (error) {
      setToast(error.message);
    }
  });
  document.getElementById('freightTemplateBatchUploadBtn').addEventListener('click', async () => {
    const effectiveFrom = document.getElementById('freightTemplateEffectiveFrom').value;
    const files = document.getElementById('freightTemplateUploadInput').files;
    try {
      const results = await submitFreightTemplateUpload(files, effectiveFrom, 'batch');
      setToast(`批量上传完成：${results.length} 个模板`);
      await renderFreightTemplatesPage();
    } catch (error) {
      setToast(error.message);
    }
  });
  document.querySelectorAll('.template-detail-btn').forEach((button) => button.addEventListener('click', async () => {
    const templateId = Number(button.dataset.templateId);
    const detail = (await api(`/api/v1/freight/templates/${templateId}`)).data;
    const selectedVersion = detail.current_version || detail.versions?.[detail.versions.length - 1];
    const modalCard = refs.modalRoot?.querySelector('.modal-card');
    openReadOnlyModal(
      `模板详情：${detail.template_name}`,
      `${escapeHtml(detail.template_code)} · ${escapeHtml(selectedVersion?.version_label || '-')}`,
      `
        <div class="detail-grid">
          <div class="kv"><span>模板编码</span><strong>${escapeHtml(detail.template_code)}</strong></div>
          <div class="kv"><span>渠道类型</span><strong>${escapeHtml(freightChannelTypeLabel(detail.channel_type || detail.bound_channels?.[0]?.channel_type))}</strong></div>
          <div class="kv"><span>覆盖国家</span><strong>${escapeHtml(detail.country_count || 0)} 个</strong></div>
          <div class="kv"><span>规则总数</span><strong>${escapeHtml(detail.rule_count || 0)}</strong></div>
          <div class="kv"><span>当前版本</span><strong>${escapeHtml(detail.current_version?.version_label || selectedVersion?.version_label || '-')}</strong></div>
          <div class="kv"><span>绑定渠道</span><strong>${escapeHtml(detail.bound_channels?.length || 0)} 个</strong></div>
        </div>
        <div class="surface" style="margin-top:16px;">
          <div class="section-title-row"><span class="section-title">绑定渠道</span></div>
          <div class="table-shell"><table><thead><tr><th>渠道</th><th>类型</th><th>生效时间</th><th>失效时间</th></tr></thead><tbody>
            ${(detail.bound_channels || []).map((ch) => `<tr><td>${escapeHtml(ch.channel_name)}</td><td>${escapeHtml(freightChannelTypeLabel(ch.channel_type))}</td><td>${escapeHtml(ch.effective_from || '-')}</td><td>${escapeHtml(ch.effective_to || '当前有效')}</td></tr>`).join('') || '<tr><td colspan="4">暂无绑定渠道</td></tr>'}
          </tbody></table></div>
        </div>
        <div class="surface" style="margin-top:16px;">
          <div class="section-title-row"><span class="section-title">国家规则明细</span><span class="section-note">${escapeHtml(selectedVersion?.version_label || '-')}</span></div>
          <div class="table-shell"><table><thead><tr><th>国家</th><th>规则数</th><th>重量区间</th></tr></thead><tbody>
            ${(selectedVersion?.country_summaries || []).slice(0, 30).map((c) => `<tr><td>${escapeHtml(c.country_name_cn || c.country_code)}</td><td>${escapeHtml(c.rule_count)}</td><td>${escapeHtml((c.rules || []).map((r) => r.weight_start_exclusive_g + '<W<=' + r.weight_end_inclusive_g).join(' / '))}</td></tr>`).join('') || '<tr><td colspan="3">暂无规则</td></tr>'}
          </tbody></table></div>
        </div>
        <div class="surface" style="margin-top:16px;">
          <div class="section-title-row"><span class="section-title">超尺寸附加费规则</span></div>
          ${(selectedVersion?.surcharge_rules || []).length ? `
            <div class="table-shell"><table><thead><tr><th>国家</th><th>动作</th><th>无附加费条件</th><th>有附加费条件</th><th>加收金额</th><th>备注</th></tr></thead><tbody>
              ${selectedVersion.surcharge_rules.map((rule) => `<tr><td>${escapeHtml(rule.country_name_cn || rule.country_code)}</td><td>${statusPill(rule.action_type_label, rule.action_type === 'forbid' ? 'fail' : 'warn')}</td><td>${escapeHtml([rule.no_fee_longest_cm, rule.no_fee_middle_cm, rule.no_fee_shortest_cm].filter(Boolean).join('×') || '-')}${rule.no_fee_condition_expr ? ' ' + escapeHtml(rule.no_fee_condition_expr) : ''}</td><td>${escapeHtml([rule.surcharge_longest_cm, rule.surcharge_middle_cm, rule.surcharge_shortest_cm].filter(Boolean).join('×') || '-')}${rule.surcharge_condition_expr ? ' ' + escapeHtml(rule.surcharge_condition_expr) : ''}</td><td><strong>${escapeHtml(rule.surcharge_amount || '0')} ${escapeHtml(rule.currency || 'CNY')}</strong></td><td>${escapeHtml(rule.remark || '-')}</td></tr>`).join('')}
            </tbody></table></div>
          ` : '<div class="empty-state">当前版本暂无超尺寸附加费规则</div>'}
        </div>
        <div class="surface" style="margin-top:16px;">
          <div class="section-title-row"><span class="section-title">版本记录</span></div>
          ${(detail.versions || []).map((v) => `<div class="batch-card"><h3>${escapeHtml(v.version_label)}</h3><p class="muted">生效：${escapeHtml(v.effective_from)} · 失效：${escapeHtml(v.effective_to || '当前有效')} · 国家 ${escapeHtml(v.country_count || 0)} · 规则 ${escapeHtml(v.rule_count || 0)}</p></div>`).join('') || '<div class="empty-state">暂无版本记录</div>'}
        </div>
      `,
    );
    const newModalCard = refs.modalRoot?.querySelector('.modal-card');
    if (newModalCard) newModalCard.classList.add('freight-template-detail-modal');
  }));
  document.querySelectorAll('.template-replace-btn').forEach((button) => button.addEventListener('click', () => {
    const templateId = Number(button.dataset.templateId);
    openModal('替换版本', '上传新的 Excel 后，旧版本会自动失效。', `
      <form id="templateReplaceForm" class="form-grid">
        <label class="field full-span"><span>Excel 文件</span><input name="file" type="file" accept=".xlsx,.xls"></label>
        <label class="field"><span>生效时间</span><input name="effective_from" type="date" value="${new Date().toISOString().slice(0, 10)}"></label>
        <div class="inline-actions full-span"><button type="submit" class="accent-btn">上传替换</button></div>
      </form>
    `);
    document.getElementById('templateReplaceForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      const file = form.get('file');
      if (!(file instanceof File) || !file.name) {
        setToast('先选择替换文件');
        return;
      }
      try {
        await submitFreightTemplateUpload([file], String(form.get('effective_from') || ''), 'replace', templateId);
        closeModal();
        setToast('替换版本完成');
        await renderFreightTemplatesPage();
      } catch (error) {
        setToast(error.message);
      }
    });
  }));
  document.querySelectorAll('.template-delete-btn').forEach((button) => button.addEventListener('click', async () => {
    const templateId = Number(button.dataset.templateId);
    if (!window.confirm('确认停用这个模板？')) return;
    try {
      await api(`/api/v1/freight/templates/${templateId}/delete`, { method: 'POST', body: JSON.stringify({}) });
      await refreshFreightTemplateData(state.selectedTemplateId === templateId ? null : state.selectedTemplateId);
      setToast('模板已停用');
      await renderFreightTemplatesPage();
    } catch (error) {
      setToast(error.message);
    }
  }));
  document.querySelectorAll('.template-view-rules-btn').forEach((button) => button.addEventListener('click', async () => {
    const templateId = Number(button.dataset.templateId);
    const templateDetail = (await api(`/api/v1/freight/templates/${templateId}`)).data;
    const currentVersion = templateDetail.current_version || templateDetail.versions?.[templateDetail.versions.length - 1];
    openModal(
      `${templateDetail.template_name} 规则明细`,
      `${currentVersion?.version_label || '-'} · 按国家分组`,
      `<div class="table-shell"><table><thead><tr><th>国家</th><th>规则数</th><th>区间</th></tr></thead><tbody>${(currentVersion?.country_summaries || []).map((country) => `<tr><td>${escapeHtml(country.country_name_cn || country.country_code)}</td><td>${escapeHtml(country.rule_count)}</td><td>${escapeHtml((country.rules || []).map((rule) => `${rule.weight_start_exclusive_g}<W<=${rule.weight_end_inclusive_g}`).join(' / '))}</td></tr>`).join('') || '<tr><td colspan="3">暂无规则</td></tr>'}</tbody></table></div>`
    );
  }));
}

// 按筛选条件过滤物流渠道列表
function filterFreightChannelRows(allRows) {
  const keyword = String(state.channelFilterKeyword || '').trim().toLowerCase();
  const typeFilter = String(state.channelFilterType || '');
  const billingFilter = String(state.channelFilterBilling || '');
  const statusFilter = String(state.channelFilterStatus || '');
  // 将关键字、类型、计费和状态筛选集中处理
  return allRows.filter((channel) => {
    if (keyword) {
      const haystack = [channel.channel_name, channel.erp_provider_name, channel.provider_short_name, channel.carrier_code, channel.remark, channel.platform_scope].join(' ').toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    if (typeFilter && String(channel.channel_type) !== typeFilter) return false;
    if (billingFilter === '1' && !channel.billing_enabled) return false;
    if (billingFilter === '0' && channel.billing_enabled) return false;
    if (statusFilter && String(channel.status) !== statusFilter) return false;
    return true;
  });
}

// 渲染物流渠道管理页面
function renderFreightChannelsPage() {
  const allRows = state.freightChannels || [];
  const rows = filterFreightChannelRows(allRows);
  const channelTypes = [...new Set(allRows.map((c) => c.channel_type).filter(Boolean))].sort();
  const platformScopes = [...new Set(allRows.map((c) => c.platform_scope).filter(Boolean))].sort();
  refs.pageContent.innerHTML = `
    <div class="surface freight-channel-master-page">
      <div class="section-title-row">
        <span class="section-title">物流渠道主表</span>
        <span class="section-note">${rows.length} / ${allRows.length} 条渠道</span>
      </div>
      <form id="channelFilterForm" class="freight-channel-filter-bar form-grid">
        <label class="field"><span>关键字</span><input id="channelFilterKeyword" type="search" value="${escapeHtml(state.channelFilterKeyword || '')}" placeholder="渠道名 / 物流商 / 运输商代码"></label>
        <label class="field"><span>渠道类型</span>
          <select id="channelFilterType">
            <option value="">全部类型</option>
            ${channelTypes.map((t) => `<option value="${escapeHtml(t)}" ${state.channelFilterType === t ? 'selected' : ''}>${escapeHtml(t === 'normal' ? '普货渠道' : t === 'standard' ? '普货渠道' : t === 'sensitive' ? '敏感货渠道' : t === 'special' ? '特殊渠道' : t)}</option>`).join('')}
          </select>
        </label>
        <label class="field"><span>是否参与计费</span>
          <select id="channelFilterBilling">
            <option value="" ${!state.channelFilterBilling ? 'selected' : ''}>全部</option>
            <option value="1" ${state.channelFilterBilling === '1' ? 'selected' : ''}>是</option>
            <option value="0" ${state.channelFilterBilling === '0' ? 'selected' : ''}>否</option>
          </select>
        </label>
        <label class="field"><span>启用状态</span>
          <select id="channelFilterStatus">
            <option value="" ${!state.channelFilterStatus ? 'selected' : ''}>全部</option>
            <option value="1" ${state.channelFilterStatus === '1' ? 'selected' : ''}>启用</option>
            <option value="0" ${state.channelFilterStatus === '0' ? 'selected' : ''}>禁用</option>
          </select>
        </label>
        <div class="inline-actions"><button type="button" class="ghost-btn" id="channelFilterReset">重置</button></div>
      </form>
      <div class="table-shell freight-channel-master-table">
        <table>
          <thead>
            <tr>
              <th>渠道ID</th>
              <th>物流商简称</th>
              <th>物流渠道名称</th>
              <th>运输商代码</th>
              <th>渠道类型</th>
              <th>渠道分类</th>
              <th>计费</th>
              <th>计泡方式</th>
              <th>平台</th>
              <th>绑定模板</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((channel) => `
              <tr class="freight-channel-row" data-channel-id="${channel.id}">
                <td>${escapeHtml(channel.id)}</td>
                <td>${escapeHtml(channel.provider_short_name_display)}</td>
                <td class="freight-channel-name-cell"><strong>${escapeHtml(channel.channel_name_display)}</strong></td>
                <td>${escapeHtml(channel.carrier_code_display)}</td>
                <td>${escapeHtml(channel.channel_type_label)}</td>
                <td>${escapeHtml(channel.route_category_label || '-')}</td>
                <td>${statusPill(channel.billing_enabled_label, channel.billing_enabled ? 'ok' : 'viewer')}</td>
                <td>${escapeHtml(channel.volumetric_rule_desc_display)}</td>
                <td>${escapeHtml(channel.platform_scope_display)}</td>
                <td>${escapeHtml(channel.bound_template_name || '-')}</td>
                <td>${statusPill(channel.status_label, channel.status === 1 ? 'ok' : 'fail')}</td>
              </tr>
            `).join('') || '<tr><td colspan="11">当前没有物流渠道数据</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const applyChannelFilter = () => {
    state.channelFilterKeyword = document.getElementById('channelFilterKeyword')?.value || '';
    state.channelFilterType = document.getElementById('channelFilterType')?.value || '';
    state.channelFilterBilling = document.getElementById('channelFilterBilling')?.value || '';
    state.channelFilterStatus = document.getElementById('channelFilterStatus')?.value || '';
    renderFreightChannelsPage();
  };
  document.getElementById('channelFilterKeyword')?.addEventListener('input', applyChannelFilter);
  document.getElementById('channelFilterType')?.addEventListener('change', applyChannelFilter);
  document.getElementById('channelFilterBilling')?.addEventListener('change', applyChannelFilter);
  document.getElementById('channelFilterStatus')?.addEventListener('change', applyChannelFilter);
  document.getElementById('channelFilterReset')?.addEventListener('click', () => {
    state.channelFilterKeyword = '';
    state.channelFilterType = '';
    state.channelFilterBilling = '';
    state.channelFilterStatus = '';
    renderFreightChannelsPage();
  });

  document.querySelectorAll('.freight-channel-row').forEach((tr) => {
    tr.addEventListener('click', async () => {
      const channelId = Number(tr.dataset.channelId);
      const channel = allRows.find((item) => Number(item.id) === channelId);
      if (!channel) return;
      await ensureTemplates();
      const tplOpts = (state.templates || []).filter((t) => Number(t.status || 1) === 1);
      const curTplId = channel.bound_templates?.[0]?.freight_template_id || '';
      // 比较当前值并返回 selected 标记
      const sel = function(v, o) { return String(v) === o ? 'selected' : ''; };
      // 生成运费模板下拉选项
      const bindOptHtml = tplOpts.map(function(t) { return '<option value="' + t.id + '" ' + (Number(t.id) === Number(curTplId) ? 'selected' : '') + '>' + escapeHtml(t.template_name) + '</option>'; }).join('');

      // 生成渠道详情的只读展示内容
      function readonlyInfoHtml() {
        return '<div class="detail-grid">'
          + '<div class="kv"><span>渠道ID</span><strong>' + escapeHtml(channel.id) + '</strong></div>'
          + '<div class="kv"><span>ERP物流商名称</span><strong>' + escapeHtml(channel.erp_provider_name_display) + '</strong></div>'
          + '<div class="kv"><span>物流商简称</span><strong>' + escapeHtml(channel.provider_short_name_display) + '</strong></div>'
          + '<div class="kv"><span>物流渠道名称</span><strong>' + escapeHtml(channel.channel_name_display) + '</strong></div>'
          + '<div class="kv"><span>需同步的单号</span><strong>' + escapeHtml(channel.tracking_sync_type_display) + '</strong></div>'
          + '<div class="kv"><span>运输商代码</span><strong>' + escapeHtml(channel.carrier_code_display) + '</strong></div>'
          + '<div class="kv"><span>渠道类型</span><strong>' + escapeHtml(channel.channel_type_label) + '</strong></div>'
          + '<div class="kv"><span>渠道分类</span><strong>' + escapeHtml(channel.route_category_label || '-') + '</strong></div>'
          + '<div class="kv"><span>是否参与计费</span><strong>' + escapeHtml(channel.billing_enabled_label) + '</strong></div>'
          + '<div class="kv"><span>计泡方式</span><strong>' + escapeHtml(channel.volumetric_rule_desc_display) + '</strong></div>'
          + '<div class="kv"><span>平台适配类型</span><strong>' + escapeHtml(channel.platform_scope_display) + '</strong></div>'
          + '<div class="kv"><span>状态</span><strong>' + statusPill(channel.status_label, channel.status === 1 ? 'ok' : 'fail') + '</strong></div>'
          + '<div class="kv full-span"><span>备注</span><strong>' + escapeHtml(channel.remark_display) + '</strong></div>'
          + '</div>';
      }
      // 生成渠道详情的可编辑表单内容
      function editableInfoHtml() {
        return '<div class="form-grid">'
          + '<label class="field"><span>ERP物流商名称</span><input name="erp_provider_name" value="' + escapeHtml(channel.erp_provider_name || '') + '" required></label>'
          + '<label class="field"><span>物流商简称</span><input name="provider_short_name" value="' + escapeHtml(channel.provider_short_name || '') + '" required></label>'
          + '<label class="field full-span"><span>物流渠道名称</span><input name="channel_name" value="' + escapeHtml(channel.channel_name || '') + '" required></label>'
          + '<label class="field"><span>需同步的单号</span><input name="tracking_sync_type" value="' + escapeHtml(channel.tracking_sync_type || '') + '" required></label>'
          + '<label class="field"><span>运输商代码</span><input name="carrier_code" value="' + escapeHtml(channel.carrier_code || '') + '" required></label>'
          + '<label class="field full-span"><span>备注</span><input name="remark" value="' + escapeHtml(channel.remark || '') + '"></label>'
          + '<label class="field"><span>物流渠道类型</span><select name="channel_type"><option value="normal" ' + sel(channel.channel_type, 'normal') + '>普货渠道</option><option value="special" ' + sel(channel.channel_type, 'special') + '>特货渠道</option><option value="sensitive" ' + sel(channel.channel_type, 'sensitive') + '>敏感货渠道</option></select></label>'
          + '<label class="field"><span>渠道分类</span><select name="route_category"><option value="standard" ' + sel(channel.route_category, 'standard') + '>标准</option><option value="express" ' + sel(channel.route_category, 'express') + '>快线</option><option value="remote" ' + sel(channel.route_category, 'remote') + '>偏远</option><option value="commercial_express" ' + sel(channel.route_category, 'commercial_express') + '>商快</option><option value="unclassified" ' + sel(channel.route_category, 'unclassified') + '>未分类</option></select></label>'
          + '<label class="field"><span>是否参与计费</span><select name="billing_enabled"><option value="1" ' + (channel.billing_enabled ? 'selected' : '') + '>是</option><option value="0" ' + (channel.billing_enabled ? '' : 'selected') + '>否</option></select></label>'
          + '<label class="field"><span>计泡方式</span><input name="volumetric_rule_desc" value="' + escapeHtml(channel.volumetric_rule_desc || '') + '" placeholder="例如：/8000"></label>'
          + '<label class="field"><span>平台适配类型</span><input name="platform_scope" value="' + escapeHtml(channel.platform_scope || '') + '" placeholder="例如：通用 / 速卖通"></label>'
          + '</div>';
      }

      if (!refs.modalRoot) return;
      refs.modalRoot.innerHTML = '<div class="modal-overlay" id="modalOverlay"><div class="modal-card channel-detail-modal">'
        + '<div class="modal-head"><div><h3>' + escapeHtml(channel.channel_name_display) + '</h3><p class="page-desc">渠道 ' + escapeHtml(channel.id) + ' · ' + escapeHtml(channel.provider_short_name_display) + '</p></div><button type="button" class="icon-btn" id="modalCloseBtn">×</button></div>'
        + '<form id="modalForm"><div class="channel-detail-panel">'
        + '<div class="channel-info-box surface-soft" id="channelInfoBox"><div class="channel-info-box-header"><span class="section-title">渠道信息</span><button type="button" class="ghost-btn" id="channelToggleEditBtn">编辑</button></div><div id="channelInfoContent">' + readonlyInfoHtml() + '</div></div>'
        + '<div class="channel-bind-section"><div class="section-title-row"><span class="section-title">绑定运费模板</span></div><label class="field"><span>运费模板</span><select name="template_id" id="channelBindTemplateSelect"><option value="">不绑定</option>' + bindOptHtml + '</select></label></div>'
        + '<div class="channel-detail-bottom-actions"><button type="button" class="accent-btn" id="channelSaveBtn">保存</button><button type="button" class="ghost-btn" id="channelCancelBtn">取消</button>'
        + (channel.status === 1 ? '<button type="button" class="danger-btn" id="channelDisableBtn">禁用渠道</button>' : '<button type="button" class="accent-btn" id="channelEnableBtn">启用渠道</button>')
        + '</div></div></form></div></div>';
      refs.modalRoot.style.display = '';
      document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
      document.getElementById('modalOverlay')?.addEventListener('click', function(e) { if (e.target.id === 'modalOverlay') closeModal(); });

      let isEditing = false;
      const infoContent = document.getElementById('channelInfoContent');
      const toggleBtn = document.getElementById('channelToggleEditBtn');
      toggleBtn?.addEventListener('click', () => {
        isEditing = !isEditing;
        if (infoContent) infoContent.innerHTML = isEditing ? editableInfoHtml() : readonlyInfoHtml();
        if (toggleBtn) toggleBtn.textContent = isEditing ? '取消编辑' : '编辑';
      });

      document.getElementById('channelSaveBtn')?.addEventListener('click', async () => {
        const form = refs.modalRoot?.querySelector('#modalForm');
        if (!form) return;
        const payload = Object.fromEntries(new FormData(form).entries());
        const templateId = payload.template_id || null;
        delete payload.template_id;
        if (isEditing && payload.channel_name) {
          await api('/api/v1/freight/channel-master/' + channelId, { method: 'POST', body: JSON.stringify(payload) });
        }
        if (String(templateId || '') !== String(curTplId || '')) {
          await api('/api/v1/freight/channel-master/' + channelId + '/bind-template', { method: 'POST', body: JSON.stringify({ template_id: templateId }) });
        }
        state.freightChannels = null;
        await ensureFreightChannels();
        closeModal();
        setToast('物流渠道已保存');
        renderFreightChannelsPage();
      });
      document.getElementById('channelCancelBtn')?.addEventListener('click', () => { closeModal(); });
      document.getElementById('channelDisableBtn')?.addEventListener('click', async () => {
        await api('/api/v1/freight/channel-master/' + channelId + '/status', { method: 'POST', body: JSON.stringify({ status: 0 }) });
        state.freightChannels = null; await ensureFreightChannels(); closeModal(); setToast('物流渠道已禁用'); renderFreightChannelsPage();
      });
      document.getElementById('channelEnableBtn')?.addEventListener('click', async () => {
        await api('/api/v1/freight/channel-master/' + channelId + '/status', { method: 'POST', body: JSON.stringify({ status: 1 }) });
        state.freightChannels = null; await ensureFreightChannels(); closeModal(); setToast('物流渠道已启用'); renderFreightChannelsPage();
      });
    });
  });
}

// 渲染运费测算页面
function renderFreightCalculatorPage() {
  const allSkus = Array.isArray(state.skus) ? state.skus : (state.skus?.__default__ || []);
  const categories = [...new Set(allSkus.map((s) => s.supply_chain_category).filter(Boolean))].sort();
  const selectedCategory = state.freightCalcCategory || '';
  const filteredSkus = selectedCategory ? allSkus.filter((s) => s.supply_chain_category === selectedCategory) : allSkus;
  refs.pageContent.innerHTML = `
    <div class="grid-main">
      <div class="surface">
        <div class="section-title-row"><span class="section-title">单件运费测算（信息来自「物流渠道管理」）</span><span class="section-note">SKU 或手工重量二选一</span></div>
        <form id="freightCalcForm" class="form-grid">
          <label class="field"><span>供应链品类</span><select id="freightCalcCategorySelect"><option value="">全部品类</option>${categories.map((c) => '<option value="' + escapeHtml(c) + '" ' + (c === selectedCategory ? 'selected' : '') + '>' + escapeHtml(c) + '</option>').join('')}</select></label>
          <label class="field"><span>SKU</span><select name="sku_id" id="freightCalcSkuSelect"><option value="">手工输入重量</option>${filteredSkus.slice(0, 500).map((sku) => '<option value="' + sku.id + '">' + escapeHtml(sku.legacy_sku_code || sku.sku_code) + ' · ' + escapeHtml(sku.sku_name_cn || '') + '</option>').join('')}</select></label>
          <label class="field"><span>手工重量(g)</span><input name="weight_g" type="number" placeholder="例如 52"></label>
          <label class="field full-span"><span>国家代码</span><input name="country_codes" value="US,GB,CA"></label>
          <label class="field"><span>计算日期</span><input name="calc_date" type="date" value="${new Date().toISOString().slice(0, 10)}"></label>
          <div class="full-span inline-actions"><button type="submit" class="accent-btn">开始比价</button></div>
        </form>
      </div>
      <div class="surface-soft">
        ${state.calculatorResult ? `
          <div class="section-title-row"><span class="section-title">比价结果（信息来自「物流运费模板记录表」）</span><span class="section-note">${escapeHtml(state.calculatorResult.sku?.sku_code || state.calculatorResult.sku?.weight_g || '')}</span></div>
          ${(state.calculatorResult.comparisons || []).map((item) => `
            <div class="surface" style="margin-bottom:16px;">
              <div class="section-title-row"><span class="section-title">${escapeHtml(item.country_name_cn)} (${escapeHtml(item.country_code)})</span><span class="section-note">按总运费排序</span></div>
              <div class="table-shell"><table><thead><tr><th>渠道</th><th>结果</th><th>计费重</th><th>总运费</th></tr></thead><tbody>
                ${(item.quotes || []).slice(0, 12).map((quote) => `
                  <tr>
                    <td>${escapeHtml(quote.channel_name)}</td>
                    <td>${quote.allowed ? statusPill('可发', 'ok') : statusPill(quote.reason || '不可发', 'fail')}</td>
                    <td>${escapeHtml(quote.chargeable_weight_g || '-')}</td>
                    <td>${escapeHtml(quote.total_fee || '-')}</td>
                  </tr>
                `).join('')}
              </tbody></table></div>
            </div>
          `).join('')}
        ` : '<div class="empty-state">选择一个 SKU 或输入重量后，系统会返回所有可计费渠道的对比结果。</div>'}
      </div>
    </div>
  `;
  document.getElementById('freightCalcCategorySelect').addEventListener('change', (event) => {
    state.freightCalcCategory = event.target.value;
    const skuSelect = document.getElementById('freightCalcSkuSelect');
    if (!skuSelect) return;
    const filtered = state.freightCalcCategory ? allSkus.filter((s) => s.supply_chain_category === state.freightCalcCategory) : allSkus;
    // 按当前品类重建 SKU 下拉选项
    skuSelect.innerHTML = '<option value="">手工输入重量</option>' + filtered.slice(0, 500).map(function(sku) { return '<option value="' + sku.id + '">' + escapeHtml(sku.legacy_sku_code || sku.sku_code) + ' · ' + escapeHtml(sku.sku_name_cn || '') + '</option>'; }).join('');
  });
  document.getElementById('freightCalcForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const skuId = form.get('sku_id');
    const weightG = form.get('weight_g');
    try {
      state.calculatorResult = (await api('/api/v1/freight/quote', {
        method: 'POST',
        body: JSON.stringify({
          compare_all_channels: true,
          sku_id: skuId ? Number(skuId) : undefined,
          weight_g: weightG ? Number(weightG) : undefined,
          country_codes: String(form.get('country_codes')).split(',').map((item) => item.trim()).filter(Boolean),
          calc_date: form.get('calc_date'),
        }),
      })).data;
      renderFreightCalculatorPage();
    } catch (error) {
      setToast(error.message);
    }
  });
}

// 渲染报表中心页面
