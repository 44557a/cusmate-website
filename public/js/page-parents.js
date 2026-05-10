// ============================================================
// 产品母体页面
// ============================================================

// 渲染母体列表卡片图片
function renderParentCardImage(row) {
  if (row.image_url) {
    return `<img class="parent-thumb" src="${escapeHtml(row.image_url)}" alt="${escapeHtml(row.parent_name_cn)}">`;
  }
  return placeholderImage(row.current_parent_version_code);
}

// 渲染母体详情头图
function renderHeroImage(versionRow) {
  if (versionRow.image_url) {
    return `<img class="hero-image" src="${escapeHtml(versionRow.image_url)}" alt="${escapeHtml(versionRow.parent_name_cn)}">`;
  }
  return `<div class="hero-image-placeholder">${escapeHtml(versionRow.parent_version_code)}</div>`;
}

// 渲染母体数据异常提示标签
function renderParentWarningPill(row) {
  const missingAllowedOptionsCount = Number(row?.missing_allowed_options_count);
  const hasMissingAllowedOptions = row?.has_missing_allowed_options === true
    || row?.missing_allowed_options_warning === true
    || row?.missing_allowed_options === true
    || (Number.isFinite(missingAllowedOptionsCount) && missingAllowedOptionsCount > 0);

  if (hasMissingAllowedOptions) {
    return statusPill('缺少可选项', 'warn');
  }

  const incompleteDataCount = Number(row?.incomplete_data_count);
  const hasIncompleteData = row?.has_incomplete_data === true
    || row?.data_incomplete === true
    || row?.is_data_incomplete === true
    || (Number.isFinite(incompleteDataCount) && incompleteDataCount > 0);

  if (hasIncompleteData) {
    return statusPill('数据缺失', 'warn');
  }

  return '';
}

// 构建母体导出的单行数据
function buildParentExportRow(versionRow) {
  return {
    母体编号: versionRow.parent_version_code,
    母体名称: versionRow.parent_name_cn,
    母体图片: versionRow.image_url || '',
    母体资产属性: versionRow.asset_property || '',
    母体开发服务费: versionRow.dev_service_fee || '',
    销售状态: versionRow.sale_status || '',
    母体SKU属性表: versionRow.sku_attr_sheet_name || '',
    母体SKU属性表数据说明: versionRow.sku_attr_sheet_status || '',
    热度: versionRow.popularity_level || '',
    定制复杂度: versionRow.customization_complexity || '',
    售后风险点: versionRow.after_sale_risk || '',
    工艺摘要: versionRow.process_summary || '',
    主材质: versionRow.main_material || '',
    产能等级: versionRow.capacity_level || '',
    母体生产时间: versionRow.production_lead_time_desc || '',
    工厂到仓库时间: versionRow.factory_to_warehouse_time_desc || '',
    工厂是否代发: versionRow.factory_drop_shipping ? '是' : '否',
    仓库质检标准链接: versionRow.quality_inspection_doc_url || '',
    包装方案: versionRow.packaging_plan || '',
    支持特殊操作: versionRow.special_operations || '',
    母体定制参考: versionRow.customization_reference || '',
    订单信息组成属性参考: versionRow.order_composition_ref || '',
    预览图下单文件格式色值: versionRow.preview_order_file_spec || '',
    下单截止时间: versionRow.order_deadline_desc || '',
    确认订单撤回下单时间: versionRow.cancel_deadline_desc || '',
    SCC订单管理类型: versionRow.scc_order_type || '',
    FLC订单管理类型: versionRow.flc_order_type || '',
    是否启用: versionRow.status === 1 ? '是' : '否',
    备注: versionRow.remark || '',
  };
}

function renderParentsPage() {
  const keyword = state.filters.parents;
  const rows = filteredRows(state.parents, keyword, ['parent_code_base', 'current_parent_version_code', 'parent_name_cn', 'parent_name_en']);
  const detail = currentParentDetail();
  const attributes = detail?.attributes || [];
  const hasCombos = attributes.length > 0;
  const version = detail?.parent_version;

  if (state.parentsView === 'detail' && detail && version) {
    const changeHistory = detail.change_history || [];
    refs.pageContent.innerHTML = `
      <div class="detail-stack">
        <div class="back-row">
          <div class="inline-actions">
            <button type="button" class="ghost-btn" id="backToParentListBtn">返回产品母体表</button>
            <button type="button" class="light-btn" id="exportSingleParentBtn">导出当前母体详情</button>
            ${state.role === 'it' ? '<button type="button" class="light-btn" id="editParentBtn">编辑母体</button>' : ''}
            ${state.role === 'it' ? '<button type="button" class="accent-btn" id="copyParentBtn">复制母体</button>' : ''}
          </div>
          <span class="section-note">${escapeHtml(version.parent_version_code)} · 母体详情页</span>
        </div>

        <div class="hero-image-card">${renderHeroImage(version)}</div>

        <div class="surface">
          <div class="section-title-row"><span class="section-title">基础信息</span></div>
          ${codingRuleCallout(detail.coding_rules, 'parent')}
          <div class="detail-grid">
            ${renderField('母体编号', version.parent_version_code)}
            ${renderField('母体名称', version.parent_name_cn)}
            ${renderField('母体资产属性', version.asset_property)}
            ${renderField('母体开发服务费', version.dev_service_fee)}
            ${renderField('销售状态', version.sale_status)}
            ${renderField('母体SKU&属性表', version.sku_attr_sheet_name)}
            ${renderField('母体SKU&属性表数据说明', version.sku_attr_sheet_status)}
            ${renderField('热度', version.popularity_level)}
            ${renderField('工艺摘要', version.process_summary)}
            ${renderField('主材质', version.main_material)}
            ${renderField('产能等级', version.capacity_level)}
            ${renderField('生命周期', humanParentLifecycleStatus(version.status))}
            ${renderField('备注', version.remark)}
          </div>
        </div>

        <div class="surface">
          <div class="section-title-row"><span class="section-title">生产与履约信息</span></div>
          <div class="detail-grid">
            ${renderField('母体生产时间', version.production_lead_time_desc)}
            ${renderField('工厂→仓库时间', version.factory_to_warehouse_time_desc)}
            ${renderField('工厂是否代发', version.factory_drop_shipping ? '是' : '否')}
            ${renderField('仓库质检标准链接', version.quality_inspection_doc_url)}
            ${renderField('包装方案', version.packaging_plan)}
            ${renderField('支持特殊操作', version.special_operations)}
            ${renderField('SCC订单管理类型', version.scc_order_type)}
            ${renderField('FLC订单管理类型', version.flc_order_type)}
          </div>
        </div>

        <div class="surface">
          <div class="section-title-row"><span class="section-title">定制与风险说明</span></div>
          <div class="detail-grid detail-grid-single">
            ${renderLongField('定制复杂度', version.customization_complexity)}
            ${renderLongField('售后风险点', version.after_sale_risk)}
            ${renderLongField('母体定制参考', version.customization_reference)}
            ${renderLongField('订单信息组成属性参考', version.order_composition_ref)}
            ${renderLongField('预览图/下单文件格式-色值', version.preview_order_file_spec)}
          </div>
        </div>

        <div class="surface">
          <div class="section-title-row"><span class="section-title">下单规则</span></div>
          <div class="detail-grid">
            ${renderField('下单截止时间', version.order_deadline_desc)}
            ${renderField('确认订单撤回下单时间', version.cancel_deadline_desc)}
          </div>
        </div>

        <div class="surface">
          <div class="section-title-row">
            <span class="section-title">母体组合信息（信息来自「母体与属性组合表」）</span>
            <span class="section-note">运营可直接在详情页看到组合情况</span>
          </div>
          ${hasCombos ? attributes.map((attr) => `
            <div class="surface-soft" style="margin-top:12px;">
              <div class="section-title-row">
                <span class="section-title">${attr.display_order}. ${escapeHtml(attr.attribute_name_cn)}</span>
                <span class="section-note">${attr.allowed_options.length} 个可选项</span>
              </div>
              <div class="chips">${attr.allowed_options.map((option) => `<span class="chip">${escapeHtml(option.option_name_cn)}</span>`).join('')}</div>
            </div>
          `).join('') : '<div class="callout">这个母体当前还没有组合信息。运营在详情页会看到这个空状态，维护人员需要去组合页补充。</div>'}
        </div>

        <div class="surface">
          <div class="section-title-row"><span class="section-title">变更历史</span><span class="section-note">自动记录母体字段变更与复制动作</span></div>
          <div class="table-shell">
            <table>
              <thead><tr><th>时间</th><th>动作</th><th>操作人</th><th>变更后</th></tr></thead>
              <tbody>
                ${changeHistory.map((item) => `
                  <tr>
                    <td>${escapeHtml(item.created_at || '-')}</td>
                    <td>${escapeHtml(item.action || '-')}</td>
                    <td>${escapeHtml(item.username || '-')}</td>
                    <td><code>${escapeHtml(item.after_value || '-')}</code></td>
                  </tr>
                `).join('') || '<tr><td colspan="4">暂无历史</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="surface" id="parentSkuSection">
          <div class="section-title-row">
            <span class="section-title">该母体下的 SKU 信息（信息来自「SKU数据总表」）</span>
            <span class="section-note" id="parentSkuCount">加载中...</span>
          </div>
          <div class="table-shell data-scroll-body" id="parentSkuTableShell">
            <table><tbody>${skeletonRows(12, 4)}</tbody></table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('backToParentListBtn').addEventListener('click', () => {
      state.parentsView = 'list';
      renderParentsPage();
    });
    document.getElementById('exportSingleParentBtn').addEventListener('click', () => {
      downloadCsv(`${version.parent_version_code}_母体详情.csv`, [buildParentExportRow(version)]);
    });
    document.getElementById('editParentBtn')?.addEventListener('click', () => {
      var v = version;
      openModal(
        '编辑母体 · ' + escapeHtml(v.parent_version_code),
        '修改后保存即生效，母体编号不可更改。',
        '<label class="field"><span>母体编号</span><input name="parent_version_code" value="' + escapeHtml(v.parent_version_code || '') + '" disabled></label>'
        + '<label class="field"><span>母体名称</span><input name="parent_name_cn" value="' + escapeHtml(v.parent_name_cn || '') + '" required></label>'
        + '<label class="field full-span"><span>母体图片</span><input name="image_url" value="' + escapeHtml(v.image_url || '') + '" placeholder="图片链接"></label>'
        + '<label class="field"><span>母体资产属性</span><input name="asset_property" value="' + escapeHtml(v.asset_property || '') + '"></label>'
        + '<label class="field"><span>母体开发服务费</span><input name="dev_service_fee" value="' + escapeHtml(v.dev_service_fee || '') + '"></label>'
        + '<label class="field"><span>销售状态</span><input name="sale_status" value="' + escapeHtml(v.sale_status || '') + '"></label>'
        + '<label class="field"><span>母体SKU&属性表</span><input name="sku_attr_sheet_name" value="' + escapeHtml(v.sku_attr_sheet_name || '') + '"></label>'
        + '<label class="field"><span>母体SKU&属性表数据说明</span><input name="sku_attr_sheet_status" value="' + escapeHtml(v.sku_attr_sheet_status || '') + '"></label>'
        + '<label class="field"><span>热度</span><input name="popularity_level" value="' + escapeHtml(v.popularity_level || '') + '"></label>'
        + '<label class="field"><span>工艺摘要</span><input name="process_summary" value="' + escapeHtml(v.process_summary || '') + '"></label>'
        + '<label class="field"><span>主材质</span><input name="main_material" value="' + escapeHtml(v.main_material || '') + '"></label>'
        + '<label class="field"><span>产能等级</span><input name="capacity_level" value="' + escapeHtml(v.capacity_level || '') + '"></label>'
        + '<label class="field"><span>母体生产时间</span><input name="production_lead_time_desc" value="' + escapeHtml(v.production_lead_time_desc || '') + '"></label>'
        + '<label class="field"><span>工厂→仓库时间</span><input name="factory_to_warehouse_time_desc" value="' + escapeHtml(v.factory_to_warehouse_time_desc || '') + '"></label>'
        + '<label class="field"><span>工厂是否代发</span><select name="factory_drop_shipping"><option value="0"' + (!v.factory_drop_shipping ? ' selected' : '') + '>否</option><option value="1"' + (v.factory_drop_shipping ? ' selected' : '') + '>是</option></select></label>'
        + '<label class="field"><span>SCC订单管理类型</span><input name="scc_order_type" value="' + escapeHtml(v.scc_order_type || '') + '"></label>'
        + '<label class="field"><span>FLC订单管理类型</span><input name="flc_order_type" value="' + escapeHtml(v.flc_order_type || '') + '"></label>'
        + '<label class="field"><span>下单截止时间</span><input name="order_deadline_desc" value="' + escapeHtml(v.order_deadline_desc || '') + '"></label>'
        + '<label class="field"><span>确认订单撤回下单时间</span><input name="cancel_deadline_desc" value="' + escapeHtml(v.cancel_deadline_desc || '') + '"></label>'
        + '<label class="field full-span"><span>定制复杂度</span><textarea name="customization_complexity">' + escapeHtml(v.customization_complexity || '') + '</textarea></label>'
        + '<label class="field full-span"><span>售后风险点</span><textarea name="after_sale_risk">' + escapeHtml(v.after_sale_risk || '') + '</textarea></label>'
        + '<label class="field full-span"><span>仓库质检标准链接</span><input name="quality_inspection_doc_url" value="' + escapeHtml(v.quality_inspection_doc_url || '') + '"></label>'
        + '<label class="field full-span"><span>包装方案</span><textarea name="packaging_plan">' + escapeHtml(v.packaging_plan || '') + '</textarea></label>'
        + '<label class="field full-span"><span>支持特殊操作</span><textarea name="special_operations">' + escapeHtml(v.special_operations || '') + '</textarea></label>'
        + '<label class="field full-span"><span>母体定制参考</span><textarea name="customization_reference">' + escapeHtml(v.customization_reference || '') + '</textarea></label>'
        + '<label class="field full-span"><span>订单信息组成属性参考</span><textarea name="order_composition_ref">' + escapeHtml(v.order_composition_ref || '') + '</textarea></label>'
        + '<label class="field full-span"><span>预览图/下单文件格式-色值</span><textarea name="preview_order_file_spec">' + escapeHtml(v.preview_order_file_spec || '') + '</textarea></label>'
        + '<label class="field full-span"><span>备注</span><textarea name="remark">' + escapeHtml(v.remark || '') + '</textarea></label>',
        async function(payload) {
          await api('/api/v1/parent-versions/' + v.id + '/update', { method: 'POST', body: JSON.stringify(payload) });
          state.parentDetails = {};
          await ensureParentDetail(state.selectedParentVersionId);
          setToast('母体信息已更新');
          renderParentsPage();
        },
      );
    });
    document.getElementById('copyParentBtn')?.addEventListener('click', async () => {
      await api(`/api/v1/parents/${detail.parent.parent_id || detail.parent.id}/copy`, { method: 'POST', body: JSON.stringify({}) });
      state.parents = [];
      state.parentDetails = {};
      await ensureParents('compact');
      setToast('母体复制完成，已生成新编号和新版本');
      renderParentsPage();
    });
    // 异步加载该母体版本下的 SKU 列表
    (async function() {
      try {
        var allSkus = await ensureSkus();
        var versionSkus = allSkus.filter(function(s) { return s.parent_version_id === state.selectedParentVersionId; });
        var countEl = document.getElementById('parentSkuCount');
        var shellEl = document.getElementById('parentSkuTableShell');
        if (countEl) countEl.textContent = '共 ' + versionSkus.length + ' 个 SKU';
        if (shellEl) {
          if (!versionSkus.length) {
            shellEl.innerHTML = '<div class="empty-state">该母体版本下暂无 SKU</div>';
          } else {
            var skuRows = versionSkus.map(function(row) {
              var w = formatSkuWeightAndChargeable(row);
              return '<tr>'
                + '<td>' + escapeHtml(row.legacy_sku_code || row.sku_code) + '</td>'
                + '<td>' + escapeHtml(row.supply_chain_category || '-') + '</td>'
                + '<td>' + escapeHtml(row.sku_name_cn || '-') + '</td>'
                + '<td>' + statusPill(humanSkuLifecycleStatus(row.status), statusKind(row.status)) + '</td>'
                + '<td>' + (row.is_fragile ? badge('是', 'warn') : '<span class="muted">否</span>') + '</td>'
                + '<td>' + (row.is_liquid ? badge('是', 'warn') : '<span class="muted">否</span>') + '</td>'
                + '<td>' + (row.is_magnetic ? badge('是', 'warn') : '<span class="muted">否</span>') + '</td>'
                + '<td>' + (row.is_dangerous ? badge('是', 'fail') : '<span class="muted">否</span>') + '</td>'
                + '<td>' + escapeHtml(formatSkuPackageDimensions(row)) + '</td>'
                + '<td>' + escapeHtml(w.weight) + '</td>'
                + '<td>' + escapeHtml(w.chargeable) + '</td>'
                + '<td>' + escapeHtml(row.current_procurement_cost || row.manual_procurement_cost || '-') + '</td>'
                + '</tr>';
            }).join('');
            shellEl.innerHTML = '<table><thead><tr><th>SKU 编码</th><th>供应链品类</th><th>SKU 中文名称</th><th>状态</th><th>易碎</th><th>液体</th><th>磁性</th><th>危险</th><th>包装后长宽高</th><th>包装后重量</th><th>计费重</th><th>成本价</th></tr></thead><tbody>' + skuRows + '</tbody></table>';
          }
        }
      } catch(e) {
        var shellEl2 = document.getElementById('parentSkuTableShell');
        if (shellEl2) shellEl2.innerHTML = '<div class="empty-state">SKU 数据加载失败</div>';
      }
    })();
    return;
  }

  refs.pageContent.innerHTML = `
    <div class="surface">
      <div class="section-title-row">
        <span class="section-title">所有母体</span>
        <div class="inline-actions">
          <button type="button" class="light-btn" id="exportParentsBtn">导出所有母体信息</button>
          ${state.role === 'it' ? '<button type="button" class="accent-btn" id="newParentBtn">新增母体</button>' : ''}
        </div>
      </div>
      <label class="field full-span">
        <span>搜索母体</span>
        <input id="parentSearchInput" type="search" value="${escapeHtml(keyword)}" placeholder="例如：CM006、吊牌、轮胎罩">
      </label>
      <div class="card-grid" id="parentCardGrid">
        ${rows.map((row) => `
          <article class="parent-card" data-parent-version-id="${row.current_version_id}">
            <div class="parent-visual">${renderParentCardImage(row)}</div>
            <div class="parent-body">
              <h3>${escapeHtml(row.parent_name_cn)}</h3>
              <p class="muted">${escapeHtml(row.current_parent_version_code)} · ${escapeHtml(row.sale_status || '未设置销售状态')}</p>
              <p class="muted">${escapeHtml(row.main_material || '未填写主材质')} · ${escapeHtml(row.process_summary || '未填写工艺')}</p>
               <div class="chips">
                ${statusPill(humanParentLifecycleStatus(row.status), statusKind(row.status))}
                ${statusPill('点击查看详情', 'viewer')}
                ${renderParentWarningPill(row)}
              </div>
              <div class="parent-card-meta">
                <span class="star-rating">${renderStarRating(row.popularity_level)}</span>
                ${row.min_sku_cost ? '<span class="price-tag">¥ ' + numberDisplay(row.min_sku_cost) + '起</span>' : '<span class="price-tag muted">暂无报价</span>'}
              </div>
              ${state.role === 'it' ? `<div class="inline-actions" style="margin-top:10px;"><button type="button" class="ghost-btn parent-status-btn" data-parent-id="${row.parent_id}" data-status="${row.status === 1 ? 3 : 1}">${row.status === 1 ? '停用' : '启用'}</button></div>` : ''}
            </div>
          </article>
        `).join('')}
      </div>
      ${state.role !== 'it' ? '<div class="callout" style="margin-top:16px;">当前角色只能查看和导出，不支持新增母体。</div>' : ''}
    </div>
  `;

  document.getElementById('parentSearchInput').addEventListener('input', (event) => {
    state.filters.parents = event.target.value.trim();
    renderParentsPage();
  });
  document.getElementById('exportParentsBtn').addEventListener('click', async () => {
    await ensureParents('full');
    downloadCsv('产品母体表.csv', state.parents.map((row) => buildParentExportRow(row)));
  });
  document.querySelectorAll('[data-parent-version-id]').forEach((card) => {
    card.addEventListener('click', async () => {
      state.selectedParentVersionId = Number(card.dataset.parentVersionId);
      await ensureParentDetail(state.selectedParentVersionId);
      state.parentsView = 'detail';
      renderParentsPage();
    });
  });
  document.querySelectorAll('.parent-status-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      await updateEntityStatus(`/api/v1/parents/${button.dataset.parentId}/status`, Number(button.dataset.status), '母体状态已更新');
      state.parents = [];
      state.parentDetails = {};
      await ensureParents('compact');
      renderParentsPage();
    });
  });
  if (state.role === 'it') {
    document.getElementById('newParentBtn').addEventListener('click', () => {
      openModal(
        '新增母体',
        '这里先用对话框录入母体信息，当前保存为演示草稿，不直接写正式数据。',
        `
          <label class="field"><span>母体编号</span><input name="parent_version_code" placeholder="例如：CM130A"></label>
          <label class="field"><span>母体名称</span><input name="parent_name_cn" required placeholder="例如：吊牌标签"></label>
          <label class="field full-span"><span>母体图片</span><input name="image_url" placeholder="图片链接或后续上传路径"></label>
          <label class="field"><span>母体资产属性</span><input name="asset_property" placeholder="例如：免费【可直接上架】"></label>
          <label class="field"><span>母体开发服务费</span><input name="dev_service_fee" placeholder="例如：0"></label>
          <label class="field"><span>销售状态</span><input name="sale_status" placeholder="例如：畅销"></label>
          <label class="field"><span>母体SKU&属性表</span><input name="sku_attr_sheet_name" placeholder="例如：吊牌标签(Hang Tags)"></label>
          <label class="field"><span>母体SKU&属性表数据说明</span><input name="sku_attr_sheet_status" placeholder="例如：已验证"></label>
          <label class="field"><span>热度</span><input name="popularity_level" placeholder="例如：⭐⭐⭐⭐"></label>
          <label class="field"><span>工艺摘要</span><input name="process_summary" placeholder="例如：数码印刷+模切+覆膜"></label>
          <label class="field"><span>主材质</span><input name="main_material" placeholder="例如：硬卡纸"></label>
          <label class="field"><span>产能等级</span><input name="capacity_level" placeholder="例如：⭐⭐"></label>
          <label class="field"><span>母体生产时间</span><input name="production_lead_time_desc" placeholder="例如：1-2个工作日"></label>
          <label class="field"><span>工厂→仓库时间</span><input name="factory_to_warehouse_time_desc" placeholder="例如：2个工作日"></label>
          <label class="field"><span>工厂是否代发</span><select name="factory_drop_shipping"><option value="0">否</option><option value="1">是</option></select></label>
          <label class="field"><span>SCC订单管理类型</span><input name="scc_order_type" placeholder="例如：A类"></label>
          <label class="field"><span>FLC订单管理类型</span><input name="flc_order_type" placeholder="例如：B类"></label>
          <label class="field"><span>下单截止时间</span><input name="order_deadline_desc" placeholder="例如：下午2:00"></label>
          <label class="field"><span>确认订单撤回下单时间</span><input name="cancel_deadline_desc" placeholder="例如：下单24小时内确定"></label>
          <label class="field full-span"><span>定制复杂度</span><textarea name="customization_complexity"></textarea></label>
          <label class="field full-span"><span>售后风险点</span><textarea name="after_sale_risk"></textarea></label>
          <label class="field full-span"><span>仓库质检标准链接</span><input name="quality_inspection_doc_url" placeholder="附件路径或文件名"></label>
          <label class="field full-span"><span>包装方案</span><textarea name="packaging_plan"></textarea></label>
          <label class="field full-span"><span>支持特殊操作</span><textarea name="special_operations"></textarea></label>
          <label class="field full-span"><span>母体定制参考</span><textarea name="customization_reference"></textarea></label>
          <label class="field full-span"><span>订单信息组成属性参考</span><textarea name="order_composition_ref"></textarea></label>
          <label class="field full-span"><span>预览图/下单文件格式-色值</span><textarea name="preview_order_file_spec"></textarea></label>
          <label class="field full-span"><span>备注</span><textarea name="remark" placeholder="补充说明"></textarea></label>
        `,
        async (payload) => {
          await api('/api/v1/parents', { method: 'POST', body: JSON.stringify(payload) });
          state.parents = [];
          state.parentDetails = {};
          await ensureParents();
          state.selectedParentVersionId = state.parents[state.parents.length - 1]?.current_version_id || state.selectedParentVersionId;
          state.parentsView = 'list';
          setToast('新增母体已保存并加入母体列表');
          renderParentsPage();
        },
      );
    });
  }
}

// 渲染属性定义管理页面
