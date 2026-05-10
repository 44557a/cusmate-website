// ============================================================
// 供应链与仓储页面
// ============================================================

function boolLabel(value) {
  return value ? '是' : '否';
}

// 生成复选框字段 HTML
function checkboxField(name, label, checked = false) {
  return `<label class="field checkbox-field"><input type="checkbox" name="${escapeHtml(name)}" value="1" ${checked ? 'checked' : ''}><span>${escapeHtml(label)}</span></label>`;
}

// 收集表单中的复选框值
function collectCheckboxPayload(formElement, names) {
  const payload = Object.fromEntries(new FormData(formElement).entries());
  names.forEach((name) => {
    payload[name] = formElement.querySelector(`[name="${name}"]`)?.checked ? 1 : 0;
  });
  return payload;
}

// 将输入文本拆分为数组列表
function splitInputToList(value) {
  return String(value || '').split(/[，,\n]/).map((item) => item.trim()).filter(Boolean);
}

// 渲染供应商卡片内容
function renderSupplierCard(supplier) {
  return `
    <article class="batch-card ${state.selectedSupplierId === supplier.id ? 'active' : ''}" data-supplier-id="${supplier.id}">
      <div class="section-title-row">
        <span class="section-title">${escapeHtml(supplier.supplier_name || supplier.supplier_code)}</span>
        ${statusPill(humanStatus(supplier.status), statusKind(supplier.status))}
      </div>
      <div class="detail-grid">
        <div class="kv"><span>编码</span><strong>${escapeHtml(supplier.supplier_code || '-')}</strong></div>
        <div class="kv"><span>联系人</span><strong>${escapeHtml(supplier.contact_person || '-')}</strong></div>
        <div class="kv"><span>质量等级</span><strong>${escapeHtml(supplier.quality_grade || '-')}</strong></div>
        <div class="kv"><span>风险级别</span><strong>${escapeHtml(supplier.risk_level || '-')}</strong></div>
      </div>
      <div class="chips" style="margin-top:12px;">
        <span class="chip">工厂 ${escapeHtml(supplier.factory_count || 0)}</span>
        <span class="chip">绑定母体 ${escapeHtml(supplier.bound_parent_count || 0)}</span>
      </div>
    </article>
  `;
}

// 打开供应商新建或编辑弹窗
function openSupplierModal(supplier = null) {
  const isEdit = Boolean(supplier);
  openModal(
    isEdit ? '编辑供应商' : '新建供应商',
    '维护供应商基础信息、支持工艺和适配国家。',
    `
      <label class="field"><span>供应商编码</span><input name="supplier_code" value="${escapeHtml(supplier?.supplier_code || '')}" required></label>
      <label class="field"><span>供应商名称</span><input name="supplier_name" value="${escapeHtml(supplier?.supplier_name || '')}" required></label>
      <label class="field"><span>联系人</span><input name="contact_person" value="${escapeHtml(supplier?.contact_person || '')}"></label>
      <label class="field"><span>联系电话</span><input name="contact_phone" value="${escapeHtml(supplier?.contact_phone || '')}"></label>
      <label class="field"><span>联系邮箱</span><input name="contact_email" value="${escapeHtml(supplier?.contact_email || '')}"></label>
      <label class="field"><span>状态</span><select name="status"><option value="1" ${Number(supplier?.status ?? 1) === 1 ? 'selected' : ''}>启用</option><option value="0" ${Number(supplier?.status) === 0 ? 'selected' : ''}>禁用</option><option value="2" ${Number(supplier?.status) === 2 ? 'selected' : ''}>待审核</option></select></label>
      <label class="field"><span>质量等级</span><input name="quality_grade" value="${escapeHtml(supplier?.quality_grade || '')}"></label>
      <label class="field"><span>风险级别</span><input name="risk_level" value="${escapeHtml(supplier?.risk_level || '')}"></label>
      <label class="field full-span"><span>支持工艺</span><textarea name="supported_processes">${escapeHtml((supplier?.supported_processes || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>支持材质</span><textarea name="supported_materials">${escapeHtml((supplier?.supported_materials || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>支持类目</span><textarea name="supported_categories">${escapeHtml((supplier?.supported_categories || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>支持国家</span><textarea name="supported_countries">${escapeHtml((supplier?.supported_countries || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>备注</span><textarea name="remark">${escapeHtml(supplier?.remark || '')}</textarea></label>
    `,
    async (payload) => {
      const finalPayload = {
        ...payload,
        supported_processes: splitInputToList(payload.supported_processes),
        supported_materials: splitInputToList(payload.supported_materials),
        supported_categories: splitInputToList(payload.supported_categories),
        supported_countries: splitInputToList(payload.supported_countries),
      };
      await api(isEdit ? `/api/v1/suppliers/${supplier.id}` : '/api/v1/suppliers', {
        method: 'POST',
        body: JSON.stringify(finalPayload),
      });
      state.suppliers = null;
      await ensureSupplyChainCenter();
      setToast(isEdit ? '供应商已更新' : '供应商已创建');
      await renderSupplyChainPage();
    },
  );
}

// 打开工厂新建或编辑弹窗
function openFactoryModal(factory = null) {
  const isEdit = Boolean(factory);
  const supplierOptions = (state.suppliers || []).map((supplier) => `<option value="${supplier.id}" ${Number(factory?.supplier_id) === supplier.id ? 'selected' : ''}>${escapeHtml(supplier.supplier_name)}</option>`).join('');
  openModal(
    isEdit ? '编辑工厂' : '新建工厂',
    '维护工厂产能、打样能力和可生产母体。',
    `
      <label class="field"><span>工厂编码</span><input name="factory_code" value="${escapeHtml(factory?.factory_code || '')}" required></label>
      <label class="field"><span>工厂名称</span><input name="factory_name" value="${escapeHtml(factory?.factory_name || '')}" required></label>
      <label class="field"><span>所属供应商</span><select name="supplier_id">${supplierOptions}</select></label>
      <label class="field"><span>最小起订量</span><input name="min_order_quantity" type="number" value="${escapeHtml(factory?.min_order_quantity || 0)}"></label>
      <label class="field"><span>交期(天)</span><input name="lead_time_days" type="number" value="${escapeHtml(factory?.lead_time_days || 0)}"></label>
      <label class="field"><span>打样能力</span><select name="sample_capability"><option value="1" ${factory?.sample_capability ? 'selected' : ''}>支持</option><option value="0" ${factory && !factory.sample_capability ? 'selected' : ''}>不支持</option></select></label>
      <label class="field"><span>质量等级</span><input name="quality_grade" value="${escapeHtml(factory?.quality_grade || '')}"></label>
      <label class="field"><span>风险级别</span><input name="risk_level" value="${escapeHtml(factory?.risk_level || '')}"></label>
      <label class="field"><span>产能级别</span><input name="capacity_level" value="${escapeHtml(factory?.capacity_level || '')}"></label>
      <label class="field"><span>状态</span><select name="status"><option value="1" ${Number(factory?.status ?? 1) === 1 ? 'selected' : ''}>启用</option><option value="0" ${Number(factory?.status) === 0 ? 'selected' : ''}>禁用</option><option value="2" ${Number(factory?.status) === 2 ? 'selected' : ''}>待审核</option></select></label>
      <label class="field full-span"><span>支持工艺</span><textarea name="supported_processes">${escapeHtml((factory?.supported_processes || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>可生产母体版本ID</span><textarea name="producible_parent_ids">${escapeHtml((factory?.producible_parent_ids || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>备注</span><textarea name="remark">${escapeHtml(factory?.remark || '')}</textarea></label>
    `,
    async (payload) => {
      const finalPayload = {
        ...payload,
        supplier_id: Number(payload.supplier_id),
        supported_processes: splitInputToList(payload.supported_processes),
        producible_parent_ids: splitInputToList(payload.producible_parent_ids).map((item) => Number(item)).filter(Boolean),
      };
      await api(isEdit ? `/api/v1/factories/${factory.id}` : '/api/v1/factories', {
        method: 'POST',
        body: JSON.stringify(finalPayload),
      });
      state.factories = null;
      await ensureSupplyChainCenter();
      setToast(isEdit ? '工厂已更新' : '工厂已创建');
      await renderSupplyChainPage();
    },
  );
}

// 打开母体与供应商绑定弹窗
function openBindingModal(defaultSupplierId = '') {
  const supplierOptions = (state.suppliers || []).map((supplier) => `<option value="${supplier.id}" ${Number(defaultSupplierId) === supplier.id ? 'selected' : ''}>${escapeHtml(supplier.supplier_name)} · ${escapeHtml(supplier.supplier_code)}</option>`).join('');
  openModal(
    '新增母体-供应商绑定',
    '按母体版本ID绑定主供应商或备选供应商。',
    `
      <label class="field"><span>母体版本ID</span><input name="parent_version_id" type="number" required></label>
      <label class="field"><span>供应商</span><select name="supplier_id">${supplierOptions}</select></label>
      <label class="field"><span>是否主供应商</span><select name="is_primary"><option value="1">是</option><option value="0">否</option></select></label>
      <label class="field"><span>状态</span><select name="binding_status"><option value="1">启用</option><option value="0">禁用</option></select></label>
      <label class="field full-span"><span>备注</span><textarea name="remark">前端手动绑定</textarea></label>
    `,
    async (payload) => {
      await api('/api/v1/parent-supplier-bindings', {
        method: 'POST',
        body: JSON.stringify({ ...payload, parent_version_id: Number(payload.parent_version_id), supplier_id: Number(payload.supplier_id) }),
      });
      state.parentSupplierBindings = null;
      state.suppliers = null;
      await ensureSupplyChainCenter();
      setToast('绑定已创建');
      await renderSupplyChainPage();
    },
  );
}

// 渲染供应链中心页面
async function renderSupplyChainPage() {
  const suppliers = state.suppliers || [];
  const factories = state.factories || [];
  const bindings = state.parentSupplierBindings || [];
  const selectedSupplier = suppliers.find((item) => item.id === state.selectedSupplierId) || suppliers[0] || null;
  const selectedFactory = factories.find((item) => item.id === state.selectedFactoryId) || factories[0] || null;
  const supplierFactories = selectedSupplier ? factories.filter((item) => Number(item.supplier_id) === Number(selectedSupplier.id)) : [];
  refs.pageContent.innerHTML = `
    <div class="grid-main">
      <div class="surface">
        <div class="section-title-row">
          <span class="section-title">供应商台账</span>
          <div class="inline-actions">
            <button type="button" class="light-btn" id="newSupplierBtn">新建供应商</button>
            <button type="button" class="light-btn" id="newBindingBtn">新增绑定</button>
          </div>
        </div>
        <div class="callout">供应商详情里可直接看到绑定母体，工厂列表则用于核对产能与打样能力。</div>
        <div class="card-grid" style="margin-top:16px;">${suppliers.map(renderSupplierCard).join('') || '<div class="empty-state">当前没有供应商数据。</div>'}</div>
      </div>
      <div class="surface-soft">
        ${selectedSupplier ? `
          <div class="section-title-row">
            <span class="section-title">供应商详情</span>
            <button type="button" class="light-btn" id="editSupplierBtn">编辑</button>
          </div>
          <div class="detail-grid">
            <div class="kv"><span>供应商编码</span><strong>${escapeHtml(selectedSupplier.supplier_code || '-')}</strong></div>
            <div class="kv"><span>联系人</span><strong>${escapeHtml(selectedSupplier.contact_person || '-')}</strong></div>
            <div class="kv"><span>电话</span><strong>${escapeHtml(selectedSupplier.contact_phone || '-')}</strong></div>
            <div class="kv"><span>邮箱</span><strong>${escapeHtml(selectedSupplier.contact_email || '-')}</strong></div>
            <div class="kv"><span>质量等级</span><strong>${escapeHtml(selectedSupplier.quality_grade || '-')}</strong></div>
            <div class="kv"><span>风险级别</span><strong>${escapeHtml(selectedSupplier.risk_level || '-')}</strong></div>
          </div>
          <div class="surface" style="margin-top:16px;">
            <div class="section-title-row"><span class="section-title">绑定母体</span><span class="section-note">${escapeHtml(selectedSupplier.bound_parent_count || 0)} 个</span></div>
            <div class="table-shell"><table><thead><tr><th>母体版本</th><th>母体名称</th><th>主供应商</th><th>绑定时间</th></tr></thead><tbody>
              ${(selectedSupplier.bound_parent_versions || []).map((row) => `<tr><td>${escapeHtml(row.parent_version_code || '-')}</td><td>${escapeHtml(row.parent_name_cn || '-')}</td><td>${row.is_primary ? statusPill('主供应商', 'ok') : statusPill('备选', 'viewer')}</td><td>${escapeHtml(row.bound_at || '-')}</td></tr>`).join('') || '<tr><td colspan="4">当前没有绑定母体</td></tr>'}
            </tbody></table></div>
          </div>
          <div class="surface" style="margin-top:16px;">
            <div class="section-title-row"><span class="section-title">支持能力</span></div>
            <div class="chips">
              ${(selectedSupplier.supported_processes || []).map((item) => `<span class="chip">工艺：${escapeHtml(item)}</span>`).join('')}
              ${(selectedSupplier.supported_materials || []).map((item) => `<span class="chip">材质：${escapeHtml(item)}</span>`).join('')}
              ${(selectedSupplier.supported_countries || []).map((item) => `<span class="chip">国家：${escapeHtml(item)}</span>`).join('')}
            </div>
          </div>
        ` : '<div class="empty-state">左侧选择供应商后查看详情。</div>'}
      </div>
      <div class="surface full-span">
        <div class="section-title-row">
          <span class="section-title">工厂管理</span>
          <button type="button" class="light-btn" id="newFactoryBtn">新建工厂</button>
        </div>
        <div class="table-shell"><table><thead><tr><th>工厂编码</th><th>工厂名称</th><th>所属供应商</th><th>支持工艺</th><th>交期</th><th>质量等级</th><th>操作</th></tr></thead><tbody>
          ${factories.map((row) => `<tr class="${state.selectedFactoryId === row.id ? 'active-row' : ''}"><td>${escapeHtml(row.factory_code || '-')}</td><td>${escapeHtml(row.factory_name || '-')}</td><td>${escapeHtml(row.supplier_name || '-')}</td><td>${escapeHtml((row.supported_processes || []).join(' / ') || '-')}</td><td>${escapeHtml(row.lead_time_days || 0)} 天</td><td>${escapeHtml(row.quality_grade || '-')}</td><td><button type="button" class="light-btn" data-factory-id="${row.id}">查看 / 编辑</button></td></tr>`).join('') || '<tr><td colspan="7">当前没有工厂数据</td></tr>'}
        </tbody></table></div>
        ${selectedFactory ? `
          <div class="surface" style="margin-top:16px;">
            <div class="section-title-row"><span class="section-title">工厂详情</span><span class="section-note">${escapeHtml(selectedFactory.factory_name)}</span></div>
            <div class="detail-grid">
              <div class="kv"><span>MOQ</span><strong>${escapeHtml(selectedFactory.min_order_quantity || 0)}</strong></div>
              <div class="kv"><span>打样能力</span><strong>${escapeHtml(boolLabel(selectedFactory.sample_capability))}</strong></div>
              <div class="kv"><span>风险级别</span><strong>${escapeHtml(selectedFactory.risk_level || '-')}</strong></div>
              <div class="kv"><span>产能级别</span><strong>${escapeHtml(selectedFactory.capacity_level || '-')}</strong></div>
            </div>
            <div class="chips" style="margin-top:12px;">${(selectedFactory.producible_parents || []).map((item) => `<span class="chip">${escapeHtml(item.parent_version_code)} · ${escapeHtml(item.parent_name_cn)}</span>`).join('') || '<span class="chip">暂无配置母体</span>'}</div>
          </div>
        ` : ''}
        ${selectedSupplier ? `
          <div class="surface" style="margin-top:16px;">
            <div class="section-title-row"><span class="section-title">当前供应商关联工厂</span><span class="section-note">${escapeHtml(supplierFactories.length)} 个</span></div>
            <div class="chips">${supplierFactories.map((item) => `<span class="chip">${escapeHtml(item.factory_name)} · ${escapeHtml(item.lead_time_days)}天</span>`).join('') || '<span class="chip">暂无关联工厂</span>'}</div>
          </div>
        ` : ''}
      </div>
      <div class="surface full-span">
        <div class="section-title-row"><span class="section-title">母体-供应商绑定台账</span><span class="section-note">共 ${escapeHtml(bindings.length)} 条</span></div>
        <div class="table-shell"><table><thead><tr><th>母体版本</th><th>母体名称</th><th>供应商</th><th>主供应商</th><th>状态</th><th>绑定时间</th></tr></thead><tbody>
          ${bindings.map((row) => `<tr><td>${escapeHtml(row.parent_version_code || '-')}</td><td>${escapeHtml(row.parent_name_cn || '-')}</td><td>${escapeHtml(row.supplier_name || '-')}</td><td>${row.is_primary ? statusPill('主供应商', 'ok') : statusPill('备选', 'viewer')}</td><td>${statusPill(humanStatus(row.binding_status), statusKind(row.binding_status))}</td><td>${escapeHtml(row.bound_at || '-')}</td></tr>`).join('') || '<tr><td colspan="6">当前没有绑定记录</td></tr>'}
        </tbody></table></div>
      </div>
    </div>
  `;
  document.getElementById('newSupplierBtn').addEventListener('click', () => openSupplierModal());
  document.getElementById('newBindingBtn').addEventListener('click', () => openBindingModal(selectedSupplier?.id));
  document.getElementById('newFactoryBtn').addEventListener('click', () => openFactoryModal());
  document.getElementById('editSupplierBtn')?.addEventListener('click', () => openSupplierModal(selectedSupplier));
  document.querySelectorAll('[data-supplier-id]').forEach((card) => {
    card.addEventListener('click', async () => {
      state.selectedSupplierId = Number(card.dataset.supplierId);
      await renderSupplyChainPage();
    });
  });
  document.querySelectorAll('[data-factory-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.selectedFactoryId = Number(button.dataset.factoryId);
      await renderSupplyChainPage();
      const selected = (state.factories || []).find((item) => item.id === state.selectedFactoryId);
      if (selected) openFactoryModal(selected);
    });
  });
}

// 打开包装方案新建或编辑弹窗
function openPackagingPlanModal(plan = null) {
  const isEdit = Boolean(plan);
  openModal(
    isEdit ? '编辑包装方案' : '新建包装方案',
    '维护默认包装方案、材料组成和适用范围。',
    `
      ${isEdit ? `<input type="hidden" name="id" value="${plan.id}">` : ''}
      <label class="field"><span>方案编码</span><input name="plan_code" value="${escapeHtml(plan?.plan_code || '')}" required></label>
      <label class="field"><span>方案名称</span><input name="plan_name" value="${escapeHtml(plan?.plan_name || '')}" required></label>
      <label class="field"><span>状态</span><select name="status"><option value="1" ${Number(plan?.status ?? 1) === 1 ? 'selected' : ''}>启用</option><option value="0" ${Number(plan?.status) === 0 ? 'selected' : ''}>禁用</option><option value="2" ${Number(plan?.status) === 2 ? 'selected' : ''}>待审核</option></select></label>
      <label class="field"><span>是否默认</span><select name="is_default"><option value="1" ${plan?.is_default ? 'selected' : ''}>是</option><option value="0" ${plan && !plan.is_default ? 'selected' : ''}>否</option></select></label>
      <label class="field"><span>预估成本</span><input name="cost_estimate" value="${escapeHtml(plan?.cost_estimate || '')}"></label>
      <label class="field full-span"><span>包装材料</span><textarea name="packaging_materials">${escapeHtml((plan?.packaging_materials || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>适用母体版本ID</span><textarea name="applicable_parent_ids">${escapeHtml((plan?.applicable_parent_ids || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>适用国家</span><textarea name="applicable_country_codes">${escapeHtml((plan?.applicable_country_codes || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>适用渠道类型</span><textarea name="applicable_channel_types">${escapeHtml((plan?.applicable_channel_types || []).join('，'))}</textarea></label>
      <label class="field full-span"><span>方案说明</span><textarea name="description">${escapeHtml(plan?.description || '')}</textarea></label>
      <label class="field full-span"><span>备注</span><textarea name="remark">${escapeHtml(plan?.remark || '')}</textarea></label>
    `,
    async (payload) => {
      const finalPayload = {
        ...payload,
        packaging_materials: splitInputToList(payload.packaging_materials),
        applicable_parent_ids: splitInputToList(payload.applicable_parent_ids).map((item) => Number(item)).filter(Boolean),
        applicable_country_codes: splitInputToList(payload.applicable_country_codes),
        applicable_channel_types: splitInputToList(payload.applicable_channel_types),
      };
      await api('/api/v1/packaging-plans', { method: 'POST', body: JSON.stringify(finalPayload) });
      state.packagingPlans = null;
      await ensureWarehouseCenter();
      setToast(isEdit ? '包装方案已更新' : '包装方案已创建');
      await renderWarehousePage();
    },
  );
}

// 打开发货属性新建或编辑弹窗
function openShippingAttributeModal(row = null) {
  const packagingPlanOptions = (state.packagingPlans || []).map((plan) => `<option value="${plan.id}" ${Number(row?.packaging_plan_id) === plan.id ? 'selected' : ''}>${escapeHtml(plan.plan_code)} · ${escapeHtml(plan.plan_name)}</option>`).join('');
  const checkboxNames = ['has_battery', 'is_paste', 'is_liquid', 'is_magnetic', 'is_powder', 'is_fragile', 'is_oversized', 'is_overlong', 'is_dangerous_tendency', 'requires_second_confirmation'];
  openModal(
    row ? '编辑发货属性' : '批量更新发货属性',
    row ? `${row.legacy_sku_code} · ${row.sku_name_cn}` : '支持按 SKU ID 批量更新仓储备注与敏感属性。',
    `
      ${row ? `<input type="hidden" name="sku_id" value="${row.sku_id}">` : '<label class="field full-span"><span>SKU ID（批量，逗号分隔）</span><input name="sku_ids" placeholder="例如 1,2,3"></label>'}
      <label class="field"><span>包装方案</span><select name="packaging_plan_id"><option value="">不调整</option>${packagingPlanOptions}</select></label>
      <label class="field"><span>箱规</span><input name="box_spec" value="${escapeHtml(row?.box_spec || '')}"></label>
      <label class="field"><span>装箱数量</span><input name="packing_quantity" type="number" value="${escapeHtml(row?.packing_quantity || '')}"></label>
      <label class="field full-span"><span>仓库备注</span><textarea name="warehouse_note">${escapeHtml(row?.warehouse_note || '')}</textarea></label>
      <div class="full-span checkbox-grid">
        ${checkboxField('has_battery', '带电', row?.has_battery)}
        ${checkboxField('is_paste', '膏体', row?.is_paste)}
        ${checkboxField('is_liquid', '液体', row?.is_liquid)}
        ${checkboxField('is_magnetic', '磁性', row?.is_magnetic)}
        ${checkboxField('is_powder', '粉末', row?.is_powder)}
        ${checkboxField('is_fragile', '易碎', row?.is_fragile)}
        ${checkboxField('is_oversized', '超大件', row?.is_oversized)}
        ${checkboxField('is_overlong', '超长', row?.is_overlong)}
        ${checkboxField('is_dangerous_tendency', '危险倾向', row?.is_dangerous_tendency)}
        ${checkboxField('requires_second_confirmation', '二次确认', row?.requires_second_confirmation)}
      </div>
    `,
    async (_, formElement) => {
      const payload = collectCheckboxPayload(formElement, checkboxNames);
      if (row) {
        payload.sku_id = row.sku_id;
      } else {
        payload.sku_ids = splitInputToList(formElement.querySelector('[name="sku_ids"]')?.value).map((item) => Number(item)).filter(Boolean);
      }
      ['packaging_plan_id', 'box_spec', 'packing_quantity', 'warehouse_note'].forEach((field) => {
        const element = formElement.querySelector(`[name="${field}"]`);
        if (element) payload[field] = element.value;
      });
      await api('/api/v1/sku-shipping-attributes', { method: 'POST', body: JSON.stringify(payload) });
      state.shippingAttributes = null;
      state.incompleteShippingAttributes = null;
      await ensureWarehouseCenter();
      setToast('发货属性已更新');
      await renderWarehousePage();
    },
  );
}

// 渲染仓储包装中心页面
async function renderWarehousePage() {
  const filterState = state.structuredFilters.shippingAttributes;
  const filterOptions = state.skuFilterOptions || { parent_names: [], attribute_names: [], attribute_values_by_name: {} };
  const response = await fetchPagedCollection('/api/v1/sku-shipping-attributes', 'shippingAttributes', {
    parent_name: filterState.parentName,
    attribute_name: filterState.attributeName,
    attribute_value: filterState.attributeValue,
    incomplete_only: filterState.incompleteOnly,
    keyword: state.filters.dimensions,
  }, state.pagedViews.shippingAttributes.page, state.pagedViews.shippingAttributes.pageSize);
  state.shippingAttributes = response.items || [];
  const packagingPlans = state.packagingPlans || [];
  const selectedPlan = packagingPlans.find((item) => item.id === state.selectedPackagingPlanId) || packagingPlans[0] || null;
  refs.pageContent.innerHTML = `
    <div class="grid-main">
      <div class="surface">
        <div class="section-title-row">
          <span class="section-title">包装方案中心</span>
          <div class="inline-actions">
            <button type="button" class="light-btn" id="newPackagingPlanBtn">新建包装方案</button>
            <button type="button" class="light-btn" id="bulkShippingBtn">批量更新发货属性</button>
          </div>
        </div>
        <div class="callout">当前有 <strong>${escapeHtml((state.incompleteShippingAttributes || []).length)}</strong> 个 SKU 缺少关键发货属性，已在下方列表标红。</div>
        <div class="card-grid" style="margin-top:16px;">${packagingPlans.map((plan) => `
          <article class="batch-card ${state.selectedPackagingPlanId === plan.id ? 'active' : ''}" data-plan-id="${plan.id}">
            <div class="section-title-row">
              <span class="section-title">${escapeHtml(plan.plan_name || plan.plan_code)}</span>
              ${plan.is_default ? statusPill('默认方案', 'ok') : statusPill(humanStatus(plan.status), statusKind(plan.status))}
            </div>
            <div class="chips">
              ${(plan.packaging_materials || []).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join('')}
            </div>
          </article>
        `).join('') || '<div class="empty-state">当前没有包装方案。</div>'}</div>
      </div>
      <div class="surface-soft">
        ${selectedPlan ? `
          <div class="section-title-row"><span class="section-title">包装方案详情</span><button type="button" class="light-btn" id="editPackagingPlanBtn">编辑</button></div>
          <div class="detail-grid">
            <div class="kv"><span>方案编码</span><strong>${escapeHtml(selectedPlan.plan_code || '-')}</strong></div>
            <div class="kv"><span>预估成本</span><strong>${escapeHtml(selectedPlan.cost_estimate || '-')}</strong></div>
            <div class="kv"><span>适用国家</span><strong>${escapeHtml((selectedPlan.applicable_country_codes || []).join(' / ') || '-')}</strong></div>
            <div class="kv"><span>适用渠道</span><strong>${escapeHtml((selectedPlan.applicable_channel_types || []).join(' / ') || '-')}</strong></div>
          </div>
          <div class="surface" style="margin-top:16px;">
            <div class="section-title-row"><span class="section-title">适用母体</span><span class="section-note">${escapeHtml((selectedPlan.applicable_parents || []).length)} 个</span></div>
            <div class="chips">${(selectedPlan.applicable_parents || []).map((item) => `<span class="chip">${escapeHtml(item.parent_version_code)} · ${escapeHtml(item.parent_name_cn)}</span>`).join('') || '<span class="chip">暂无</span>'}</div>
          </div>
          <div class="surface" style="margin-top:16px;">
            <div class="section-title-row"><span class="section-title">方案说明</span></div>
            <div class="callout">${escapeHtml(selectedPlan.description || selectedPlan.remark || '暂无说明')}</div>
          </div>
        ` : '<div class="empty-state">左侧选择包装方案后查看详情。</div>'}
      </div>
      <div class="surface full-span">
        <div class="section-title-row"><span class="section-title">SKU 发货属性</span><span class="section-note">支持单条编辑和批量更新</span></div>
        <div class="inline-actions" style="align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <label class="field" style="min-width:220px;"><span>母体名称</span><select id="shippingParentFilter">${buildSelectOptions(filterOptions.parent_names, filterState.parentName)}</select></label>
          <label class="field" style="min-width:220px;"><span>属性名称</span><select id="shippingAttributeFilter">${buildSelectOptions(filterOptions.attribute_names, filterState.attributeName)}</select></label>
          <label class="field" style="min-width:220px;"><span>属性值</span><select id="shippingValueFilter">${buildSelectOptions(filterState.attributeName ? (filterOptions.attribute_values_by_name?.[filterState.attributeName] || []) : [], filterState.attributeValue)}</select></label>
          <label class="field" style="min-width:180px;"><span>缺失筛选</span><select id="shippingIncompleteFilter"><option value="" ${!filterState.incompleteOnly ? 'selected' : ''}>全部</option><option value="1" ${String(filterState.incompleteOnly) === '1' ? 'selected' : ''}>仅看缺失</option></select></label>
        </div>
        <div class="table-shell"><table><thead><tr><th>SKU编码</th><th>SKU名称</th><th>包装方案</th><th>敏感属性</th><th>箱规/装箱</th><th>缺失项</th><th>操作</th></tr></thead><tbody>
          ${state.shippingAttributes.map((row) => `<tr class="${row.is_incomplete ? 'row-alert' : ''}"><td>${escapeHtml(row.legacy_sku_code || '-')}</td><td>${escapeHtml(row.sku_name_cn || '-')}</td><td>${escapeHtml(row.packaging_plan_name || '-')}</td><td>${escapeHtml([
            row.has_battery ? '带电' : null,
            row.is_paste ? '膏体' : null,
            row.is_liquid ? '液体' : null,
            row.is_magnetic ? '磁性' : null,
            row.is_powder ? '粉末' : null,
            row.is_fragile ? '易碎' : null,
          ].filter(Boolean).join(' / ') || '普通')}</td><td>${escapeHtml(`${row.box_spec || '-'} / ${row.packing_quantity || '-'}`)}</td><td>${row.is_incomplete ? statusPill((row.missing_fields || []).join('、'), 'warn') : statusPill('完整', 'ok')}</td><td><button type="button" class="light-btn" data-shipping-sku-id="${row.sku_id}">编辑</button></td></tr>`).join('') || '<tr><td colspan="7">当前没有发货属性数据</td></tr>'}
        </tbody></table></div>
        ${renderServerPagination('shippingAttributes')}
      </div>
    </div>
  `;
  document.getElementById('newPackagingPlanBtn').addEventListener('click', () => openPackagingPlanModal());
  document.getElementById('bulkShippingBtn').addEventListener('click', () => openShippingAttributeModal());
  document.getElementById('editPackagingPlanBtn')?.addEventListener('click', () => openPackagingPlanModal(selectedPlan));
  document.querySelectorAll('[data-plan-id]').forEach((card) => {
    card.addEventListener('click', async () => {
      state.selectedPackagingPlanId = Number(card.dataset.planId);
      await renderWarehousePage();
    });
  });
  document.querySelectorAll('[data-shipping-sku-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = (state.shippingAttributes || []).find((item) => Number(item.sku_id) === Number(button.dataset.shippingSkuId));
      if (row) openShippingAttributeModal(row);
    });
  });
  document.getElementById('shippingParentFilter').addEventListener('change', async (event) => {
    filterState.parentName = event.target.value;
    state.pagedViews.shippingAttributes.page = 1;
    await renderWarehousePage();
  });
  document.getElementById('shippingAttributeFilter').addEventListener('change', async (event) => {
    filterState.attributeName = event.target.value;
    filterState.attributeValue = '';
    state.pagedViews.shippingAttributes.page = 1;
    await renderWarehousePage();
  });
  document.getElementById('shippingValueFilter').addEventListener('change', async (event) => {
    filterState.attributeValue = event.target.value;
    state.pagedViews.shippingAttributes.page = 1;
    await renderWarehousePage();
  });
  document.getElementById('shippingIncompleteFilter').addEventListener('change', async (event) => {
    filterState.incompleteOnly = event.target.value;
    state.pagedViews.shippingAttributes.page = 1;
    await renderWarehousePage();
  });
  bindServerPagination('shippingAttributes', renderWarehousePage);
}

// 打开 SKU 成本记录维护弹窗
function openCostRecordModal(skuId) {
  openModal(
    '新增成本版本',
    `SKU ID ${skuId} · 保存后自动切换当前成本版本`,
    `
      <input type="hidden" name="sku_id" value="${escapeHtml(skuId)}">
      <label class="field"><span>成本类型</span><select name="cost_type"><option value="procurement">采购成本</option><option value="production">生产成本</option><option value="packaging">包装成本</option><option value="freight">运费成本</option><option value="additional">附加费</option></select></label>
      <label class="field"><span>金额</span><input name="amount" type="number" step="0.01" required></label>
      <label class="field"><span>币种</span><input name="currency" value="CNY"></label>
      <label class="field"><span>生效日期</span><input name="effective_from" value="2026-04-02"></label>
      <label class="field"><span>维护人</span><input name="maintainer" value="IT 开发人员"></label>
      <label class="field full-span"><span>备注</span><textarea name="remark">前端新增成本版本</textarea></label>
    `,
    async (payload) => {
      await api('/api/v1/sku-costs', { method: 'POST', body: JSON.stringify({ ...payload, sku_id: Number(payload.sku_id), amount: Number(payload.amount) }) });
      state.skuCosts[skuId] = null;
      state.costSummary = null;
      state.incompleteSkuCosts = null;
      await ensureCostPricingCenter();
      setToast('成本版本已保存');
      await renderCostPricingPage();
    },
  );
}

// 渲染成本档案侧边面板
function renderCostArchivePanel() {
  const incompleteRows = state.incompleteSkuCosts || [];
  const keyword = state.costFilters.keyword;
  const rows = incompleteRows.filter((row) => {
    if (!keyword) return true;
    return [row.sku?.legacy_sku_code, row.sku?.sku_name_cn, ...(row.missing_cost_types || [])].some((item) => String(item || '').includes(keyword));
  });
  const currentRows = state.skuCosts[state.selectedCostSkuId] || [];
  const summary = state.costSummary;
  return `
    <div class="grid-main">
      <div class="surface full-span">
        <div class="section-title-row">
          <span class="section-title">成本管理页</span>
          <div class="inline-actions">
            <button type="button" class="light-btn" id="newCostRecordBtn">新增成本版本</button>
            <button type="button" class="light-btn" id="exportCostBtn">导出成本档案</button>
          </div>
        </div>
        <div class="inline-actions" style="align-items:flex-end; flex-wrap:wrap; gap:12px;">
          <label class="field" style="min-width:280px;"><span>搜索异常 SKU</span><input id="costKeywordInput" value="${escapeHtml(keyword)}" placeholder="SKU编码 / SKU名称"></label>
          <div class="callout">高亮规则：缺少采购 / 生产 / 包装任一关键成本即标红，建议先补成本再报价。</div>
        </div>
        <div class="table-shell" style="margin-top:12px;"><table><thead><tr><th>SKU编码</th><th>采购成本</th><th>生产成本</th><th>包装成本</th><th>运费成本</th><th>附加费</th><th>总成本</th><th>维护人</th><th>操作</th></tr></thead><tbody>
          ${(rows.length ? rows : (summary ? [summary] : [])).map((row) => {
            const sku = row.sku || summary?.sku || {};
            const active = Number(sku.id) === Number(state.selectedCostSkuId);
            return `<tr class="${row.is_incomplete ? 'warn-row' : ''} ${active ? 'active-row' : ''}" data-cost-sku-id="${escapeHtml(sku.id || row.sku_id)}"><td>${escapeHtml(sku.legacy_sku_code || '-')}</td><td>${numberDisplay(row.procurement_cost)}</td><td>${numberDisplay(row.production_cost)}</td><td>${numberDisplay(row.packaging_cost)}</td><td>${numberDisplay(row.freight_cost)}</td><td>${numberDisplay(row.additional_cost)}</td><td>${numberDisplay(row.total_cost)}</td><td>${escapeHtml(row.maintainer || '-')}</td><td><button type="button" class="light-btn" data-cost-edit-id="${escapeHtml(sku.id || row.sku_id)}">维护</button></td></tr>`;
          }).join('') || '<tr><td colspan="9">当前没有成本异常数据</td></tr>'}
        </tbody></table></div>
      </div>

      <div class="surface">
        <div class="section-title-row"><span class="section-title">当前 SKU 成本摘要</span><span class="section-note">${escapeHtml(summary?.sku?.legacy_sku_code || '-')}</span></div>
        ${summary ? `
          <div class="detail-grid">
            <div class="kv"><span>SKU名称</span><strong>${escapeHtml(summary.sku.sku_name_cn || '-')}</strong></div>
            <div class="kv"><span>总成本</span><strong>¥${numberDisplay(summary.total_cost)}</strong></div>
            <div class="kv"><span>缺失项</span><strong>${escapeHtml((summary.missing_cost_types || []).join(' / ') || '无')}</strong></div>
            <div class="kv"><span>历史版本数</span><strong>${escapeHtml(summary.history_count || 0)}</strong></div>
          </div>
          <div class="chips" style="margin-top:12px;">${Object.entries(summary.current_costs || {}).map(([key, value]) => `<span class="chip">${escapeHtml(key)}：¥${numberDisplay(value.amount)}</span>`).join('') || '<span class="chip">暂无成本版本</span>'}</div>
        ` : '<div class="empty-state">左侧选择 SKU 后查看。</div>'}
      </div>

      <div class="surface-soft">
        <div class="section-title-row"><span class="section-title">成本历史</span><span class="section-note">按成本类型保留版本</span></div>
        <div class="table-shell"><table><thead><tr><th>类型</th><th>金额</th><th>币种</th><th>生效开始</th><th>生效结束</th><th>当前版本</th><th>维护人</th></tr></thead><tbody>
          ${currentRows.map((row) => `<tr><td>${escapeHtml(row.cost_type)}</td><td>${numberDisplay(row.amount)}</td><td>${escapeHtml(row.currency || 'CNY')}</td><td>${escapeHtml(row.effective_from || '-')}</td><td>${escapeHtml(row.effective_to || '-')}</td><td>${row.is_current ? statusPill('当前', 'ok') : statusPill('历史', 'viewer')}</td><td>${escapeHtml(row.maintainer || '-')}</td></tr>`).join('') || '<tr><td colspan="7">当前没有成本历史</td></tr>'}
        </tbody></table></div>
      </div>

      <div class="surface full-span">
        <div class="section-title-row"><span class="section-title">报价试算页</span><span class="section-note">按 SKU / 国家 / 渠道试算毛利</span></div>
        <form id="profitEstimateForm" class="form-grid">
          <label class="field"><span>SKU ID</span><input name="skuId" value="${escapeHtml(state.pricingForm.skuId || '')}" required></label>
          <label class="field"><span>售价</span><input name="sellingPrice" type="number" step="0.01" value="${escapeHtml(state.pricingForm.sellingPrice || '')}" required></label>
          <label class="field"><span>国家</span><input name="countryCode" value="${escapeHtml(state.pricingForm.countryCode || 'US')}"></label>
          <label class="field"><span>渠道ID</span><input name="channelId" value="${escapeHtml(state.pricingForm.channelId || '')}" required></label>
          <div class="full-span inline-actions"><button type="submit" class="accent-btn">开始试算</button><button type="button" class="ghost-btn" id="compareChannelsBtn">多渠道对比</button></div>
        </form>
        ${state.profitEstimate ? `
          <div class="calc-panel">
            <div class="chips">
              <span class="chip">采购成本 ¥${numberDisplay(state.profitEstimate.cost_breakdown.procurement)}</span>
              <span class="chip">生产成本 ¥${numberDisplay(state.profitEstimate.cost_breakdown.production)}</span>
              <span class="chip">包装成本 ¥${numberDisplay(state.profitEstimate.cost_breakdown.packaging)}</span>
              <span class="chip">运费 ¥${numberDisplay(state.profitEstimate.cost_breakdown.freight)}</span>
            </div>
            <div class="detail-grid" style="margin-top:14px;">
              <div class="kv"><span>总成本</span><strong>¥${numberDisplay(state.profitEstimate.total_cost)}</strong></div>
              <div class="kv"><span>毛利</span><strong>¥${numberDisplay(state.profitEstimate.gross_profit)}</strong></div>
              <div class="kv"><span>毛利率</span><strong>${numberDisplay(state.profitEstimate.gross_margin_rate * 100)}%</strong></div>
              <div class="kv"><span>缺失提醒</span><strong>${escapeHtml((state.profitEstimate.missing_cost_types || []).join(' / ') || '无')}</strong></div>
            </div>
          </div>
        ` : '<div class="empty-state" style="margin-top:12px;">填好售价、国家和渠道后开始试算。</div>'}
        ${state.channelComparison ? `
          <div class="surface" style="margin-top:16px;">
            <div class="section-title-row"><span class="section-title">多渠道比较表（信息来自「运费测算」）</span></div>
            <div class="table-shell"><table><thead><tr><th>渠道ID</th><th>渠道名称</th><th>是否可走</th><th>运费</th><th>较最优差额</th></tr></thead><tbody>
              ${state.channelComparison.channels.map((row) => `<tr><td>${escapeHtml(row.channel_id)}</td><td>${escapeHtml(row.channel_name || '-')}</td><td>${row.allowed ? statusPill('可走', 'ok') : statusPill('受限', 'fail')}</td><td>¥${numberDisplay(row.freight_cost)}</td><td>¥${numberDisplay(row.diff_vs_best)}</td></tr>`).join('')}
            </tbody></table></div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 绑定成本档案面板交互事件
function bindCostArchivePanelEvents() {
  document.getElementById('costKeywordInput')?.addEventListener('input', (event) => {
    state.costFilters.keyword = event.target.value.trim();
    renderCostPricingPage();
  });
  document.getElementById('newCostRecordBtn')?.addEventListener('click', () => openCostRecordModal(state.selectedCostSkuId || 1));
  document.getElementById('exportCostBtn')?.addEventListener('click', async () => {
    const payload = await api('/api/v1/export/costs?current_only=0');
    downloadCsv('SKU成本档案.csv', payload.data.map((row) => ({ SKU_ID: row.sku_id, SKU编码: row.sku?.legacy_sku_code, 成本类型: row.cost_type, 金额: row.amount, 币种: row.currency, 当前版本: row.is_current ? '是' : '否', 生效开始: row.effective_from, 生效结束: row.effective_to, 维护人: row.maintainer })));
  });
  document.querySelectorAll('[data-cost-sku-id]').forEach((row) => row.addEventListener('click', async () => {
    state.selectedCostSkuId = Number(row.dataset.costSkuId);
    state.pricingForm.skuId = String(state.selectedCostSkuId);
    state.costSummary = null;
    await ensureCostPricingCenter();
    await renderCostPricingPage();
  }));
  document.querySelectorAll('[data-cost-edit-id]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    openCostRecordModal(Number(button.dataset.costEditId));
  }));
}

// 渲染利润试算面板
function renderProfitTrialPanel() {
  return `
    <div class="surface full-span">
      <div class="section-title-row"><span class="section-title">利润试算</span><span class="section-note">按 SKU / 国家 / 渠道试算毛利</span></div>
      <form id="profitEstimateForm" class="form-grid">
        <label class="field"><span>SKU ID</span><input name="skuId" value="${escapeHtml(state.pricingForm.skuId || '')}" required></label>
        <label class="field"><span>售价</span><input name="sellingPrice" type="number" step="0.01" value="${escapeHtml(state.pricingForm.sellingPrice || '')}" required></label>
        <label class="field"><span>国家</span><input name="countryCode" value="${escapeHtml(state.pricingForm.countryCode || 'US')}"></label>
        <label class="field"><span>渠道ID</span><input name="channelId" value="${escapeHtml(state.pricingForm.channelId || '')}" required></label>
        <div class="full-span inline-actions"><button type="submit" class="accent-btn">开始试算</button><button type="button" class="ghost-btn" id="compareChannelsBtn">多渠道对比</button></div>
      </form>
      ${state.profitEstimate ? `
        <div class="calc-panel">
          <div class="chips">
            <span class="chip">采购成本 ¥${numberDisplay(state.profitEstimate.cost_breakdown.procurement)}</span>
            <span class="chip">生产成本 ¥${numberDisplay(state.profitEstimate.cost_breakdown.production)}</span>
            <span class="chip">包装成本 ¥${numberDisplay(state.profitEstimate.cost_breakdown.packaging)}</span>
            <span class="chip">运费 ¥${numberDisplay(state.profitEstimate.cost_breakdown.freight)}</span>
          </div>
          <div class="detail-grid" style="margin-top:14px;">
            <div class="kv"><span>总成本</span><strong>¥${numberDisplay(state.profitEstimate.total_cost)}</strong></div>
            <div class="kv"><span>毛利</span><strong>¥${numberDisplay(state.profitEstimate.gross_profit)}</strong></div>
            <div class="kv"><span>毛利率</span><strong>${numberDisplay(state.profitEstimate.gross_margin_rate * 100)}%</strong></div>
            <div class="kv"><span>缺失提醒</span><strong>${escapeHtml((state.profitEstimate.missing_cost_types || []).join(' / ') || '无')}</strong></div>
          </div>
        </div>
      ` : '<div class="empty-state" style="margin-top:12px;">填好售价、国家和渠道后开始试算。</div>'}
      ${state.channelComparison ? `
        <div class="surface" style="margin-top:16px;">
          <div class="section-title-row"><span class="section-title">多渠道比较表（信息来自「运费测算」）</span></div>
          <div class="table-shell"><table><thead><tr><th>渠道ID</th><th>渠道名称</th><th>是否可走</th><th>运费</th><th>较最优差额</th></tr></thead><tbody>
            ${state.channelComparison.channels.map((row) => `<tr><td>${escapeHtml(row.channel_id)}</td><td>${escapeHtml(row.channel_name || '-')}</td><td>${row.allowed ? statusPill('可走', 'ok') : statusPill('受限', 'fail')}</td><td>¥${numberDisplay(row.freight_cost)}</td><td>¥${numberDisplay(row.diff_vs_best)}</td></tr>`).join('')}
          </tbody></table></div>
        </div>
      ` : ''}
    </div>
  `;
}

// 绑定利润试算面板交互事件
function bindProfitTrialPanelEvents() {
  document.getElementById('profitEstimateForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target).entries());
    state.pricingForm = form;
    state.profitEstimate = (await api('/api/v1/pricing/profit-estimate', { method: 'POST', body: JSON.stringify({ sku_id: Number(form.skuId), selling_price: Number(form.sellingPrice), country_code: form.countryCode, channel_id: Number(form.channelId) }) })).data;
    await renderCostPricingPage();
  });
  document.getElementById('compareChannelsBtn')?.addEventListener('click', async () => {
    const channelIds = (state.channels || []).slice(0, 5).map((item) => item.id);
    state.channelComparison = (await api('/api/v1/pricing/channel-comparison', { method: 'POST', body: JSON.stringify({ sku_id: Number(state.pricingForm.skuId || state.selectedCostSkuId || 1), country_code: state.pricingForm.countryCode || 'US', channel_ids: channelIds }) })).data;
    await renderCostPricingPage();
  });
}

// 打开国家选择弹窗
function openCountryPickerDialog() {
  const availableCountries = state.countries || [];
  const groups = countryRegionGroups(availableCountries);
  const labelMap = countryLabelMap(availableCountries);
  const pending = new Set(uniqueCountryCodes(state.costMatrixFilters.pendingCountries || []));
  const presetMap = {
    us: ['US'],
    'north-america': ['US', 'CA', 'MX'],
    europe: ['DE', 'GB', 'FR', 'ES', 'IT', 'NL', 'BE', 'PL', 'SE', 'CH', 'AT', 'IE'],
    sea: ['SG', 'MY', 'TH', 'VN', 'PH', 'ID'],
  };

  const allCountriesSorted = [...availableCountries].sort((a, b) => String(a.country_code || '').localeCompare(String(b.country_code || '')));
  const countryListHtml = allCountriesSorted.map((c) => {
    const code = String(c.country_code || '').toUpperCase();
    return `<label style="display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:4px; cursor:pointer; font-size:13px;" class="country-pick-label"><input type="checkbox" data-pick-code="${escapeHtml(code)}" ${pending.has(code) ? 'checked' : ''}><span>${escapeHtml(c.country_name_cn || code)}</span><small style="color:var(--muted)">${escapeHtml(c.country_name_en || '')} ${escapeHtml(code)}</small></label>`;
  }).join('');

  refs.modalRoot.innerHTML = `
    <div class="modal-overlay" id="countryPickerOverlay">
      <div class="modal-card" style="max-width:720px; max-height:80vh; display:flex; flex-direction:column;">
        <div class="modal-head">
          <div><h3>选择国家</h3><p class="page-desc">勾选需要计算运费的目标国家</p></div>
          <button type="button" class="icon-btn" id="countryPickerCloseBtn">×</button>
        </div>
        <div style="padding:0 20px 8px;">
          <input type="search" id="cpSearchInput" placeholder="搜索国家名 / 代码" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:6px; font-size:14px; margin-bottom:8px;">
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="ghost-btn" data-cp-preset="us">美国</button>
            <button type="button" class="ghost-btn" data-cp-preset="north-america">北美</button>
            <button type="button" class="ghost-btn" data-cp-preset="europe">欧洲</button>
            <button type="button" class="ghost-btn" data-cp-preset="sea">东南亚</button>
            <button type="button" class="ghost-btn" data-cp-preset="clear">清空已选</button>
          </div>
        </div>
        <div id="cpCountryList" style="overflow-y:auto; flex:1; padding:0 20px; display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:2px; align-content:start;">
          ${countryListHtml}
        </div>
        <div style="padding:12px 20px; display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border);">
          <span id="countryPickerCount" style="flex:1; color:var(--muted); line-height:32px;">已选 ${pending.size} 个国家</span>
          <button type="button" class="ghost-btn" id="countryPickerCancelBtn">取消</button>
          <button type="button" class="accent-btn" id="countryPickerConfirmBtn">确认</button>
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('countryPickerOverlay');
  const closeDialog = () => { refs.modalRoot.innerHTML = ''; };
  const updateCount = () => {
    const n = overlay.querySelectorAll('[data-pick-code]:checked').length;
    document.getElementById('countryPickerCount').textContent = `已选 ${n} 个国家`;
  };
  const setAllChecks = (codes) => {
    const codeSet = new Set(codes.map((c) => c.toUpperCase()));
    overlay.querySelectorAll('[data-pick-code]').forEach((cb) => { cb.checked = codeSet.has(cb.dataset.pickCode); });
    updateCount();
  };

  document.getElementById('countryPickerCloseBtn').addEventListener('click', closeDialog);
  document.getElementById('countryPickerCancelBtn').addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(); });
  overlay.querySelectorAll('[data-pick-code]').forEach((cb) => cb.addEventListener('change', updateCount));
  document.getElementById('cpSearchInput').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    overlay.querySelectorAll('.country-pick-label').forEach((label) => {
      const text = label.textContent.toLowerCase();
      label.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  });
  overlay.querySelectorAll('[data-cp-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.cpPreset;
      if (key === 'clear') { setAllChecks([]); return; }
      const current = new Set(Array.from(overlay.querySelectorAll('[data-pick-code]:checked')).map((cb) => cb.dataset.pickCode));
      (presetMap[key] || []).forEach((c) => current.add(c));
      setAllChecks([...current]);
    });
  });
  document.getElementById('countryPickerConfirmBtn').addEventListener('click', async () => {
    const selected = Array.from(overlay.querySelectorAll('[data-pick-code]:checked')).map((cb) => cb.dataset.pickCode);
    state.costMatrixFilters.pendingCountries = uniqueCountryCodes(selected);
    state.costMatrixFilters.selectedCountries = uniqueCountryCodes(selected);
    state.pagedViews.skus.page = 1;
    state.freightComparisonMatrix = null;
    closeDialog();
    await ensureCostComparisonMatrix(true);
    await renderCostPricingPage();
  });
}

// 渲染运费对比矩阵面板
function renderFreightMatrixPanel() {
  const payload = state.freightComparisonMatrix;
  const selectedCountries = uniqueCountryCodes(state.costMatrixFilters.selectedCountries || []);
  const pendingCountries = uniqueCountryCodes(state.costMatrixFilters.pendingCountries || []);
  const availableCountries = payload?.available_countries || state.countries || [];
  const routeCategories = (payload?.route_categories || ['standard', 'express', 'remote', 'commercial_express']).filter((rc) => rc !== 'unclassified');
  const groups = countryRegionGroups(availableCountries);
  const labelMap = countryLabelMap(availableCountries);
  const rows = payload?.matrix || [];
  const tableHeaders = selectedCountries.flatMap((countryCode) => routeCategories.map((routeCategory) => ({ countryCode, routeCategory })));
  const exportDisabled = !rows.length;
  const dataSourceLabel = payload?.data_source === 'precomputed' ? '预计算缓存' : '实时计算';
  const pendingCountryKeyword = String(state.costMatrixFilters.countryKeyword || '').trim().toLowerCase();
  const selectedCountryTags = pendingCountries.map((countryCode) => ({
    code: countryCode,
    label: countryLabelByCode(countryCode, labelMap),
  }));
  const selectedCountrySummary = selectedCountries.map((countryCode) => countryLabelByCode(countryCode, labelMap)).join(' / ');
  const countryQuickSelectOptions = (availableCountries || [])
    .filter((country) => !pendingCountries.includes(String(country.country_code || '').toUpperCase()))
    .sort((a, b) => String(a.country_name_cn || a.country_code || '').localeCompare(String(b.country_name_cn || b.country_code || ''), 'zh-Hans-CN'));
  const filteredGroups = Object.entries(groups).map(([groupName, countries]) => {
    const filteredCountries = (countries || []).filter((country) => {
      if (!pendingCountryKeyword) return true;
      const haystack = `${country.country_name_cn || ''} ${country.country_name_en || ''} ${country.country_code || ''}`.toLowerCase();
      return haystack.includes(pendingCountryKeyword);
    });
    return [groupName, filteredCountries];
  }).filter(([, countries]) => countries.length);
  return `
    <div class="freight-matrix-page">
      <div class="surface freight-matrix-panel">
        <div class="section-title-row">
          <span class="section-title">SKU 运费矩阵（信息来自「运费测算」）</span>
          <span class="section-note">数据来源：${escapeHtml(dataSourceLabel)}</span>
        </div>
        <div class="inline-actions" style="align-items:center; flex-wrap:wrap; gap:8px;">
          <button type="button" class="light-btn" id="openCountryPickerBtn">选择国家 (${selectedCountries.length})</button>
          <div class="tags" style="flex:1; min-width:0;">
            ${selectedCountryTags.length ? selectedCountryTags.map((c) => `<span class="tag">${escapeHtml(c.label)}</span>`).join('') : '<span style="color:var(--muted)">未选择国家</span>'}
          </div>
      </div>

      <form id="freightMatrixActionForm" class="surface full-span freight-matrix-panel freight-matrix-actionbar" autocomplete="off">
        <div class="freight-matrix-actionbar-main">
          <label class="field freight-matrix-search-field">
            <span>搜索 SKU</span>
            <input id="costMatrixKeywordInput" name="keyword" value="${escapeHtml(state.costMatrixFilters.keyword || '')}" placeholder="SKU编码 / SKU名称 / 品类">
          </label>
          <button type="submit" class="light-btn">查询</button>
        </div>
        <div class="inline-actions freight-matrix-actionbar-actions">
          <button type="button" class="ghost-btn" id="triggerPrecomputeBtn">全量预算</button>
          <button type="button" class="ghost-btn" id="exportMatrixBtn" ${exportDisabled ? 'disabled' : ''}>导出</button>
        </div>
      </form>

      <div class="surface full-span freight-matrix-panel">
        <div class="section-title-row"><span class="section-title">SKU 运费矩阵（信息来自「运费测算」）</span><span class="section-note">已选国家：${escapeHtml(selectedCountrySummary || '未选择')}</span></div>
        ${rows.length ? `
          <div class="table-shell freight-matrix-table-shell"><table class="freight-matrix-table"><thead><tr>
            <th>SKU编码</th><th>SKU名称</th><th>品类</th>
            ${tableHeaders.map((header) => `<th><div class="freight-matrix-th"><strong>${escapeHtml(countryLabelByCode(header.countryCode, labelMap))}</strong><span>${escapeHtml(routeCategoryLabel(header.routeCategory))}</span></div></th>`).join('')}
          </tr></thead><tbody>
            ${rows.map((row) => {
              const feePool = tableHeaders.map((header) => Number(row.countries?.[header.countryCode]?.[header.routeCategory]?.total_fee)).filter((fee) => Number.isFinite(fee));
              return `<tr>
                <td>${escapeHtml(row.sku_code || '-')}</td>
                <td>${escapeHtml(row.sku_name_cn || '-')}</td>
                <td>${escapeHtml(row.supply_chain_category || '-')}</td>
                ${tableHeaders.map((header) => {
                  const cell = row.countries?.[header.countryCode]?.[header.routeCategory];
                  const display = freightCellDisplay(cell);
                  const tone = display.kind === 'ok' ? freightCellTone(display.fee, feePool) : display.kind;
                  return `
                    <td class="freight-matrix-cell tone-${escapeHtml(tone)}" title="${escapeHtml(display.tooltip)}">
                      <div class="freight-matrix-cell-body">
                        <strong class="freight-matrix-channel">${escapeHtml(display.shortName || display.channelName || '-')}</strong>
                        <span class="freight-matrix-fee">${display.feeText ? `¥${escapeHtml(display.feeText)}` : escapeHtml(display.text)}</span>
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>`;
            }).join('')}
          </tbody></table></div>
          ${renderServerPagination('skus')}
        ` : '<div class="empty-state">先选择国家，再查看当前页 SKU 的最优运费矩阵。</div>'}
      </div>
    </div>
  `;
}

// 绑定运费矩阵面板交互事件
function bindFreightMatrixPanelEvents() {
  const presetMap = {
    us: ['US'],
    'north-america': ['US', 'CA', 'MX'],
    europe: ['DE', 'GB', 'FR', 'ES', 'IT', 'NL', 'BE', 'PL', 'SE', 'CH', 'AT', 'IE'],
    sea: ['SG', 'MY', 'TH', 'VN', 'PH', 'ID'],
    all: uniqueCountryCodes((state.countries || []).map((country) => country.country_code)),
    clear: [],
  };

  document.getElementById('openCountryPickerBtn')?.addEventListener('click', () => {
    openCountryPickerDialog();
  });

  document.getElementById('freightMatrixActionForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.costMatrixFilters.keyword = String(document.getElementById('costMatrixKeywordInput')?.value || '').trim();
    state.costMatrixFilters.selectedCountries = uniqueCountryCodes(state.costMatrixFilters.pendingCountries || []);
    state.pagedViews.skus.page = 1;
    state.freightComparisonMatrix = null;
    await ensureCostComparisonMatrix(true);
    await renderCostPricingPage();
  });

  document.getElementById('triggerPrecomputeBtn')?.addEventListener('click', async () => {
    setToast('开始执行全量预算，请稍等...');
    const result = await triggerFreightPrecompute();
    state.freightComparisonMatrix = null;
    await ensureCostComparisonMatrix(true);
    setToast(`全量预算完成：${result.record_count} 条`);
    await renderCostPricingPage();
  });

  document.getElementById('exportMatrixBtn')?.addEventListener('click', async () => {
    const selectedCountries = uniqueCountryCodes(state.costMatrixFilters.selectedCountries || []);
    if (!selectedCountries.length) { setToast('请先选择国家'); return; }
    setToast('正在导出全量数据，请稍等...');
    const fullPayload = await api('/api/v1/freight/comparison-matrix', {
      method: 'POST',
      body: JSON.stringify({
        country_codes: selectedCountries,
        calc_date: new Date().toISOString().slice(0, 10),
        page: 1,
        page_size: 99999,
        keyword: state.costMatrixFilters.keyword || '',
      }),
    });
    const availableCountries = fullPayload?.available_countries || state.countries || [];
    const labelMap = countryLabelMap(availableCountries);
    const routeCategories = (fullPayload?.route_categories || []).filter((rc) => rc !== 'unclassified');
    const exportRows = (fullPayload?.matrix || []).map((row) => {
      const record = { SKU编码: row.sku_code, SKU名称: row.sku_name_cn, 品类: row.supply_chain_category, '采购成本(元)': row.procurement_cost != null ? row.procurement_cost : '-' };
      selectedCountries.forEach((countryCode) => {
        routeCategories.forEach((routeCategory) => {
          const cell = row.countries?.[countryCode]?.[routeCategory];
          const display = freightCellDisplay(cell);
          const columnPrefix = `${countryLabelByCode(countryCode, labelMap)}-${routeCategoryLabel(routeCategory)}`;
          record[`${columnPrefix}-渠道名称`] = display.channelName || '-';
          record[`${columnPrefix}-运费(元)`] = Number.isFinite(display.fee) ? display.feeText : '-';
        });
      });
      return record;
    });
    downloadCsv('运费比价矩阵.csv', exportRows);
    setToast(`导出完成，共 ${exportRows.length} 条`);
  });
  bindServerPagination('skus', async () => {
    state.freightComparisonMatrix = null;
    await ensureCostComparisonMatrix(true);
    await renderCostPricingPage();
  });
}

// 渲染成本报价中心页面
async function renderCostPricingPage() {
  refs.pageContent.innerHTML = `
    <div class="single-col-layout">
      <div class="surface cost-pricing-header">
        <div class="section-title-row cost-pricing-header-row compact-cost-pricing-header-row">
          <div class="cost-pricing-title-wrap"><span class="section-title">成本报价中心</span></div>
          <div class="inline-actions cost-tab-switcher">
            <button type="button" class="${state.costPricingTab === 'matrix' ? 'light-btn is-active' : 'ghost-btn'} cost-tab-btn" data-cost-tab="matrix">运费比价矩阵</button>
            <button type="button" class="${state.costPricingTab === 'costs' ? 'light-btn is-active' : 'ghost-btn'} cost-tab-btn" data-cost-tab="costs">SKU成本管理</button>
            <button type="button" class="${state.costPricingTab === 'profit' ? 'light-btn is-active' : 'ghost-btn'} cost-tab-btn" data-cost-tab="profit">利润试算</button>
          </div>
        </div>
      </div>
      ${state.costPricingTab === 'matrix' ? renderFreightMatrixPanel() : ''}
      ${state.costPricingTab === 'costs' ? renderCostArchivePanel() : ''}
      ${state.costPricingTab === 'profit' ? renderProfitTrialPanel() : ''}
    </div>
  `;

  document.querySelectorAll('[data-cost-tab]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.costPricingTab = button.dataset.costTab;
      await renderCostPricingPage();
    });
  });
  if (state.costPricingTab === 'matrix') bindFreightMatrixPanelEvents();
  if (state.costPricingTab === 'costs') bindCostArchivePanelEvents();
  if (state.costPricingTab === 'profit') bindProfitTrialPanelEvents();
}

// 渲染设计模板中心页面
async function renderSupplyPage() {
  const filterState = state.structuredFilters.supply;
  const filterOptions = state.skuFilterOptions || { parent_names: [], attribute_names: [], attribute_values_by_name: {} };
  const response = await fetchPagedCollection('/api/v1/sku-supply', 'supply', {
    parent_name: filterState.parentName,
    attribute_name: filterState.attributeName,
    attribute_value: filterState.attributeValue,
    keyword: state.filters.supply,
  }, state.pagedViews.supply.page, state.pagedViews.supply.pageSize);
  state.supply = response.items || [];
  if (state.supply.length && !state.supply.find((item) => item.id === state.selectedSupplySkuId)) state.selectedSupplySkuId = state.supply[0].id;
  renderEditableTablePage({
    title: '供应链负责人维护采购与限制信息',
    rows: state.supply,
    pager: state.pagedViews.supply,
    viewKey: 'supply',
    searchKey: 'supply',
    filterConfig: {
      parentNames: filterOptions.parent_names,
      attributeNames: filterOptions.attribute_names,
      attributeValues: filterState.attributeName ? (filterOptions.attribute_values_by_name?.[filterState.attributeName] || []) : [],
      current: filterState,
      onFilterChange: async () => {
        await renderSupplyPage();
      },
    },
    selectedIdKey: 'id',
    selectedId: state.selectedSupplySkuId,
    setSelectedId: (value) => { state.selectedSupplySkuId = value; },
    exporter: async () => {
      setToast('正在导出供应链全量数据...');
      const rows = await fetchAllCollection('/api/v1/sku-supply', {
        parent_name: filterState.parentName,
        attribute_name: filterState.attributeName,
        attribute_value: filterState.attributeValue,
        keyword: state.filters.supply,
      });
      downloadCsv('SKU采购成本维护表.csv', rows.map((row) => ({
        历史SKU: row.legacy_sku_code,
        SKU名称: row.sku_name_cn,
        当前成本: row.current_procurement_cost,
        是否带电: row.has_battery ? '是' : '否',
        是否膏体: row.is_paste ? '是' : '否',
        近60天订单数: row.last_60d_order_count,
      })));
    },
    columns: [
      { label: '历史SKU', key: 'legacy_sku_code' },
      { label: 'SKU名称', key: 'sku_name_cn' },
      { label: '当前成本', key: 'current_procurement_cost' },
      { label: '带电/膏体', render: (row) => `${row.has_battery ? '带电' : '非带电'} / ${row.is_paste ? '膏体' : '普通'}` },
      { label: '近60天订单', key: 'last_60d_order_count' },
    ],
    formFields: [
      { label: '人工采购成本', key: 'manual_procurement_cost' },
      { label: '当前采购成本', key: 'current_procurement_cost' },
      { label: '是否带电', key: 'has_battery', type: 'select', options: [{ value: '1', label: '是' }, { value: '0', label: '否' }] },
      { label: '是否膏体', key: 'is_paste', type: 'select', options: [{ value: '1', label: '是' }, { value: '0', label: '否' }] },
      { label: '物流限制说明', key: 'shipping_restriction', type: 'textarea', full: true },
      { label: '备注', key: 'remark', type: 'textarea', full: true },
    ],
    draftKey: 'supply',
    onRender: renderSupplyPage,
  });
}

// 渲染超尺寸附加费规则面板
