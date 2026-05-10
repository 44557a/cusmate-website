// ============================================================
// 杂项页面
// ============================================================

async function renderReportsPage() {
  const analytics = state.analytics;
  const exceptions = state.exceptionReports;
  refs.pageContent.innerHTML = `
    <div class="page-grid">
      <section class="metric-grid">
        <article class="summary-card"><span>母体数</span><strong>${escapeHtml(analytics.parent_count.total)}</strong><small>启用 ${escapeHtml(analytics.parent_count.active)} / 停用 ${escapeHtml(analytics.parent_count.disabled)}</small></article>
        <article class="summary-card"><span>SKU 数</span><strong>${escapeHtml(analytics.sku_count.total)}</strong><small>待审 ${escapeHtml(analytics.sku_count.pending_review)}</small></article>
        <article class="summary-card"><span>模板绑定率</span><strong>${escapeHtml(numberDisplay(analytics.template_binding_rate))}%</strong>${renderRateBar(analytics.template_binding_rate)}</article>
        <article class="summary-card"><span>物流覆盖率</span><strong>${escapeHtml(numberDisplay(analytics.logistics_coverage_rate))}%</strong>${renderRateBar(analytics.logistics_coverage_rate)}</article>
        <article class="summary-card"><span>成本完成率</span><strong>${escapeHtml(numberDisplay(analytics.cost_maintenance_rate))}%</strong>${renderRateBar(analytics.cost_maintenance_rate)}</article>
      </section>
      <section class="surface">
        <div class="section-title-row"><span class="section-title">高级查询</span><span class="section-note">支持多条件组合</span></div>
        <form id="advancedQueryForm" class="form-grid">
          <label class="field"><span>实体类型</span><select name="entity_type"><option value="sku">SKU</option><option value="parent">母体</option><option value="attribute">属性</option><option value="template">模板</option><option value="freight_template">运费模板</option></select></label>
          <label class="field full-span"><span>条件 JSON</span><textarea name="conditions">${escapeHtml(JSON.stringify(state.advancedQueryForm.conditions, null, 2))}</textarea></label>
          <div class="inline-actions full-span"><button type="submit" class="light-btn">执行查询</button></div>
        </form>
        <div id="advancedQueryResult" class="table-shell"></div>
      </section>
      <section class="surface">
        <div class="section-title-row"><span class="section-title">异常报表</span><span class="section-note">统一异常清单</span></div>
        <div class="table-shell"><table><thead><tr><th>项目</th><th>数量</th><th>等级</th></tr></thead><tbody>
          ${Object.entries(exceptions).map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value.count)}</td><td>${value.count > 0 ? statusPill('关注', 'warn') : statusPill('正常', 'ok')}</td></tr>`).join('')}
        </tbody></table></div>
      </section>
    </div>
  `;
  document.getElementById('advancedQueryForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = {
      entity_type: form.get('entity_type'),
      conditions: JSON.parse(String(form.get('conditions') || '[]')),
      page: 1,
      page_size: 50,
    };
    const result = (await api('/api/v1/query/advanced', { method: 'POST', body: JSON.stringify(payload) })).data;
    document.getElementById('advancedQueryResult').innerHTML = `<table><thead><tr>${Object.keys(result.items?.[0] || {}).map((key) => `<th>${escapeHtml(key)}</th>`).join('')}</tr></thead><tbody>${(result.items || []).map((row) => `<tr>${Object.values(row).map((value) => `<td>${escapeHtml(typeof value === 'object' ? JSON.stringify(value) : value)}</td>`).join('')}</tr>`).join('') || '<tr><td>无结果</td></tr>'}</tbody></table>`;
    });
}

// 渲染系统设置页面
async function renderSettingsPage() {
  const users = state.users || [];
  const auditLogs = state.auditLogs || [];
  const dictionaries = state.dictionaries || [];
  const matrix = state.permissionMatrix || [];
  const moduleOrder = [...new Set(matrix.map((item) => item.module))];
  const roleOrder = [...new Set(matrix.map((item) => item.role))];
  const dictionaryTypes = [...new Set(dictionaries.map((item) => item.dict_type))];
  refs.pageContent.innerHTML = `
    <div class="detail-stack">
      <section>
        <div class="surface">
          <div class="section-title-row"><span class="section-title">用户与权限管理</span><span class="section-note">创建账号、调整角色</span></div>
          <form id="createUserForm" class="form-grid">
            <label class="field"><span>用户名</span><input name="username" required></label>
            <label class="field"><span>显示名</span><input name="display_name" required></label>
            <label class="field"><span>Email</span><input name="email" type="email"></label>
            <label class="field"><span>角色</span><select name="role">${roleOrder.map((role) => `<option value="${escapeHtml(role)}">${escapeHtml({ admin: '管理员', it: 'IT运维', maintainer: '数据维护', viewer: '只读', reviewer: '审核员' }[role] || role)}</option>`).join('')}</select></label>
            <div class="full-span inline-actions"><button type="submit" class="accent-btn">创建用户</button></div>
          </form>
          <div class="table-shell" style="margin-top:16px;"><table><thead><tr><th>用户名</th><th>显示名</th><th>角色</th><th>状态</th><th>操作</th></tr></thead><tbody>
            ${users.map((user) => `<tr>
              <td>${escapeHtml(user.username)}</td>
              <td>${escapeHtml(user.display_name)}</td>
              <td>${badge({ admin: '管理员', it: 'IT运维', maintainer: '数据维护', viewer: '只读', reviewer: '审核员' }[user.role] || user.role, 'maintainer')}</td>
              <td>${statusPill(user.status === 'active' ? '启用' : user.status, user.status === 'active' ? 'ok' : 'warn')}</td>
              <td><select class="inline-role-select" data-user-id="${user.id}">${roleOrder.map((role) => `<option value="${escapeHtml(role)}" ${role === user.role ? 'selected' : ''}>${escapeHtml({ admin: '管理员', it: 'IT运维', maintainer: '数据维护', viewer: '只读', reviewer: '审核员' }[role] || role)}</option>`).join('')}</select></td>
            </tr>`).join('')}
          </tbody></table></div>
        </div>
        <div class="surface-soft">
          <div class="section-title-row"><span class="section-title">权限矩阵</span><span class="section-note">模块 × 权限</span></div>
          <div class="table-shell settings-permission-table"><table><thead><tr><th>模块</th>${roleOrder.map((role) => `<th>${escapeHtml({ admin: '管理员', it: 'IT运维', maintainer: '数据维护', viewer: '只读', reviewer: '审核员' }[role] || role)}</th>`).join('')}</tr></thead><tbody>
            ${moduleOrder.map((module) => { const moduleLabels = { parents: '母体管理', skus: 'SKU管理', attributes: '属性管理', combinations: '组合管理', freight: '物流运费', templates: '模板管理', settings: '系统设置', reports: '报表中心', review: '审核发布', integration: '系统集成', alerts: '智能预警', supply: '供应链', costs: '成本报价', design: '设计模板', warehouse: '仓储包装', dictionaries: '字典管理', import_export: '数据导入导出', batch_ops: '批量操作' }; return `<tr><td>${escapeHtml(moduleLabels[module] || module)}</td>${roleOrder.map((role) => {
              const row = matrix.find((item) => item.module === module && item.role === role) || {};
              const rightLabels = { can_read: '查看', can_write: '编辑', can_delete: '删除', can_export: '导出', can_review: '审核' };
              const rights = ['can_read','can_write','can_delete','can_export','can_review'].filter((key) => row[key]).map((key) => rightLabels[key] || key).join(' / ');
              return `<td>${rights ? badge(rights, 'viewer') : '<span class="muted">-</span>'}</td>`;
            }).join('')}</tr>`; }).join('')}
          </tbody></table></div>
        </div>

        <div class="surface-soft">
          <div class="section-title-row"><span class="section-title">字典管理</span><span class="section-note">系统设置下维护基础字典</span></div>
          <form id="dictionaryCreateForm" class="form-grid">
            <label class="field"><span>字典类型</span><select name="dict_type">${[['product_category','产品类目'],['material','材质'],['process','工艺'],['size_unit','尺寸单位'],['weight_unit','重量单位'],['currency','币种'],['platform','平台'],['logistics_type','物流类型'],['package_type','包装类型'],['business_status','业务状态'],['risk_level','风险等级']].map(([type, label]) => `<option value="${type}">${label}</option>`).join('')}</select></label>
            <label class="field"><span>字典编码</span><input name="dict_code" required></label>
            <label class="field"><span>中文名称</span><input name="dict_name_cn" required></label>
            <label class="field"><span>英文名称</span><input name="dict_name_en"></label>
            <label class="field"><span>排序</span><input name="sort_order" type="number" value="1"></label>
            <label class="field full-span"><span>备注</span><input name="remark"></label>
            <div class="full-span inline-actions"><button type="submit" class="ghost-btn">新增字典项</button></div>
          </form>
          <div class="inline-actions" style="margin-top:12px; align-items:flex-end; gap:12px;">
            <label class="field" style="min-width:220px;"><span>字典类型筛选</span><select id="dictionaryTypeFilter">${buildSelectOptions(dictionaryTypes, state.dictionaryFilter.dictType, '全部字典')}</select></label>
            <label class="field" style="min-width:280px; flex:1 1 280px;"><span>搜索字典</span><input id="dictionarySearchInput" type="search" value="${escapeHtml(state.filters.dictionaries)}" placeholder="例如：Shopee、PVC、服装"></label>
          </div>
          <div class="table-shell" style="margin-top:16px;"><table><thead><tr><th>类型</th><th>编码</th><th>中文名</th><th>英文名</th><th>排序</th><th>状态</th><th>备注</th></tr></thead><tbody>
            ${dictionaries.filter((item) => {
              if (state.filters.dictionaries) {
                const haystack = `${item.dict_type} ${item.dict_code} ${item.dict_name_cn} ${item.dict_name_en || ''}`;
                return haystack.includes(state.filters.dictionaries);
              }
              return true;
            }).map((item) => `<tr>
              <td>${badge(item.dict_type, 'viewer')}</td>
              <td>${escapeHtml(item.dict_code)}</td>
              <td>${escapeHtml(item.dict_name_cn)}</td>
              <td>${escapeHtml(item.dict_name_en || '-')}</td>
              <td>${escapeHtml(item.sort_order)}</td>
              <td>${statusPill(humanStatus(item.status), statusKind(item.status))}</td>
              <td>${escapeHtml(item.remark || '-')}</td>
            </tr>`).join('') || '<tr><td colspan="7">暂无字典数据</td></tr>'}
          </tbody></table></div>
        </div>
      </section>
      <section>
        <div class="surface">
        <div class="section-title-row"><span class="section-title">操作日志</span><button type="button" class="light-btn" id="exportAuditBtn">导出日志</button></div>
        <form id="auditFilterForm" class="form-grid">
          <label class="field"><span>对象类型</span><input name="entity_type" value="${escapeHtml(state.auditFilter.entityType)}"></label>
          <label class="field"><span>用户ID</span><input name="user_id" value="${escapeHtml(state.auditFilter.userId)}"></label>
          <label class="field"><span>开始日期</span><input name="from" type="date" value="${escapeHtml(state.auditFilter.from)}"></label>
          <label class="field"><span>结束日期</span><input name="to" type="date" value="${escapeHtml(state.auditFilter.to)}"></label>
          <div class="full-span inline-actions"><button type="submit" class="ghost-btn">筛选日志</button></div>
        </form>
        <div class="table-shell" style="margin-top:16px;"><table><thead><tr><th>时间</th><th>操作人</th><th>操作类型</th><th>对象类型</th><th>对象名称</th><th>变更前</th><th>变更后</th></tr></thead><tbody>
          ${auditLogs.map((log) => {
            const actionLabels = { create: '新建', update: '更新', delete: '删除', review: '审核', publish: '发布', revoke: '撤销' };
            const entityLabels = { parent: '母体', sku: 'SKU', attribute: '属性', freight_template: '运费模板', freight_channel: '物流渠道', freight_channel_binding: '渠道绑定', dictionary: '字典', system_user: '用户', platform_sku_mapping: '平台映射', design_template: '设计模板' };
            return `<tr>
            <td>${escapeHtml(log.created_at)}</td>
            <td>${escapeHtml(log.username)}</td>
            <td>${escapeHtml(actionLabels[log.action] || log.action)}</td>
            <td>${escapeHtml(entityLabels[log.entity_type] || log.entity_type)}</td>
            <td>${escapeHtml(log.entity_name)}</td>
            <td><code>${escapeHtml(log.before_value)}</code></td>
            <td><code>${escapeHtml(log.after_value)}</code></td>
          </tr>`; }).join('') || '<tr><td colspan="7">暂无日志</td></tr>'}
        </tbody></table></div>
      </section>
    </div>
  `;
  document.getElementById('createUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    await api('/api/v1/users', { method: 'POST', body: JSON.stringify(payload) });
    state.users = null;
    state.auditLogs = null;
    await ensureSettingsCenter();
    await renderSettingsPage();
  });
  document.querySelectorAll('.inline-role-select').forEach((select) => select.addEventListener('change', async () => {
    await api(`/api/v1/users/${select.dataset.userId}/role`, { method: 'POST', body: JSON.stringify({ role: select.value }) });
    state.users = null;
    state.auditLogs = null;
    await ensureSettingsCenter();
    await renderSettingsPage();
  }));
  document.getElementById('auditFilterForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    state.auditFilter = { entityType: String(form.get('entity_type') || ''), userId: String(form.get('user_id') || ''), from: String(form.get('from') || ''), to: String(form.get('to') || '') };
    const query = buildSkuQueryParams({ entity_type: state.auditFilter.entityType, user_id: state.auditFilter.userId, from: state.auditFilter.from, to: state.auditFilter.to });
    state.auditLogs = (await api(`/api/v1/audit-log${query}`)).data;
    await renderSettingsPage();
  });
  document.getElementById('dictionaryCreateForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    payload.sort_order = Number(payload.sort_order);
    await api('/api/v1/dictionaries', { method: 'POST', body: JSON.stringify(payload) });
    state.dictionaries = null;
    await ensureSettingsCenter();
    setToast('字典项已新增');
    await renderSettingsPage();
  });
  document.getElementById('dictionaryTypeFilter').addEventListener('change', async (event) => {
    state.dictionaryFilter.dictType = event.target.value;
    state.dictionaries = null;
    await ensureSettingsCenter();
    await renderSettingsPage();
  });
  document.getElementById('dictionarySearchInput').addEventListener('input', async (event) => {
    state.filters.dictionaries = event.target.value.trim();
    await renderSettingsPage();
  });
  document.getElementById('exportAuditBtn').addEventListener('click', () => downloadCsv('操作日志.csv', auditLogs));
}

// 渲染智能预警页面
async function renderAlertsPage() {
  const alerts = state.alerts || [];
  const summary = state.alertSummary || { critical: 0, warning: 0, info: 0, total: 0 };
  refs.pageContent.innerHTML = `
    <div class="page-grid">
      <section class="metric-grid">
        <article class="summary-card severity-card critical"><span>Critical</span><strong>${escapeHtml(summary.critical)}</strong><small>需立即处理</small></article>
        <article class="summary-card severity-card warning"><span>Warning</span><strong>${escapeHtml(summary.warning)}</strong><small>建议近期处理</small></article>
        <article class="summary-card severity-card info"><span>Info</span><strong>${escapeHtml(summary.info)}</strong><small>提醒类信息</small></article>
        <article class="summary-card"><span>总预警</span><strong>${escapeHtml(summary.total)}</strong><small>实时扫描输出</small></article>
      </section>
      <section class="surface">
        <div class="section-title-row"><span class="section-title">预警明细</span><span class="section-note">可直接跳转处理</span></div>
        <div class="table-shell"><table><thead><tr><th>级别</th><th>标题</th><th>对象</th><th>动作</th></tr></thead><tbody>
          ${alerts.map((item) => `<tr><td>${statusPill(item.severity, item.severity === 'critical' ? 'fail' : item.severity === 'warning' ? 'warn' : 'viewer')}</td><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.entity_type)} #${escapeHtml(item.entity_id)}</td><td><button type="button" class="light-btn alert-link-btn" data-page="${escapeHtml(item.action_page || 'alerts')}">${escapeHtml(item.action_label || '查看')}</button></td></tr>`).join('') || '<tr><td colspan="4">暂无预警</td></tr>'}
        </tbody></table></div>
      </section>
      <section class="grid-main">
        <div class="surface">
          <div class="section-title-row"><span class="section-title">推荐中心</span><span class="section-note">渠道 / 包装 / 供应商</span></div>
          <form id="recommendationForm" class="form-grid">
            <label class="field"><span>SKU ID</span><input name="sku_id" type="number" value="${escapeHtml(state.recommendationForm.skuId)}"></label>
            <label class="field"><span>国家</span><input name="country_code" value="${escapeHtml(state.recommendationForm.countryCode)}"></label>
            <label class="field"><span>母体版本 ID</span><input name="parent_id" type="number" value="${escapeHtml(state.recommendationForm.parentId)}"></label>
            <div class="full-span inline-actions"><button type="submit" class="accent-btn">生成推荐</button></div>
          </form>
          <div class="grid-3" style="margin-top:16px;">
            <div class="surface-soft"><div class="section-title-row"><span class="section-title">渠道推荐</span></div><pre class="json-panel">${escapeHtml(JSON.stringify(state.recommendationResults.channel, null, 2) || '暂无')}</pre></div>
            <div class="surface-soft"><div class="section-title-row"><span class="section-title">包装推荐</span></div><pre class="json-panel">${escapeHtml(JSON.stringify(state.recommendationResults.packaging, null, 2) || '暂无')}</pre></div>
            <div class="surface-soft"><div class="section-title-row"><span class="section-title">供应商推荐</span></div><pre class="json-panel">${escapeHtml(JSON.stringify(state.recommendationResults.supplier, null, 2) || '暂无')}</pre></div>
          </div>
        </div>
        <div class="surface-soft">
          <div class="section-title-row"><span class="section-title">运营洞察</span><span class="section-note">停用频率 / 高成本渠道 / 覆盖缺口</span></div>
          <div class="grid-3">
            <div><strong>常被停用 SKU</strong><pre class="json-panel">${escapeHtml(JSON.stringify(state.insights.disabled, null, 2))}</pre></div>
            <div><strong>高成本渠道</strong><pre class="json-panel">${escapeHtml(JSON.stringify(state.insights.highCost, null, 2))}</pre></div>
            <div><strong>覆盖缺口</strong><pre class="json-panel">${escapeHtml(JSON.stringify(state.insights.coverage, null, 2))}</pre></div>
          </div>
        </div>
      </section>
    </div>
  `;
  document.querySelectorAll('.alert-link-btn').forEach((button) => button.addEventListener('click', async () => {
    state.currentPage = button.dataset.page;
    renderShell();
    await renderCurrentPage();
  }));
  document.getElementById('recommendationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    state.recommendationForm = { skuId: String(form.get('sku_id')), countryCode: String(form.get('country_code')), parentId: String(form.get('parent_id')) };
    state.recommendationResults.channel = (await api(`/api/v1/recommendations/channel?sku_id=${encodeURIComponent(form.get('sku_id'))}&country_code=${encodeURIComponent(form.get('country_code'))}`)).data;
    state.recommendationResults.packaging = (await api(`/api/v1/recommendations/packaging?sku_id=${encodeURIComponent(form.get('sku_id'))}`)).data;
    state.recommendationResults.supplier = (await api(`/api/v1/recommendations/supplier?parent_id=${encodeURIComponent(form.get('parent_id'))}`)).data;
    await renderAlertsPage();
  });
}

// 渲染百分比进度条
function renderRateBar(value) {
  return `<div class="rate-bar"><span style="width:${Math.max(0, Math.min(100, Number(value || 0)))}%"></span></div>`;
}

// 渲染全局搜索下拉结果
