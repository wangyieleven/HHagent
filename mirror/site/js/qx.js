// jQuery多选功能
    $(document).ready(function() {
        // 配置
        const config = {
            selectedColor: '#f0f8ff',
            tablePrefix: 'table'
        };
        
        // 为每个表格初始化多选功能
        for (let i = 1; i <= 6; i++) {
            const tableId = `${config.tablePrefix}${i}`;
            
            // 全选功能
            $(`.select-all[data-table="${tableId}"]`).on('change', function() {
                const isChecked = $(this).prop('checked');
                $(`input[name="tech-item-${tableId}"]`).each(function() {
                    $(this).prop('checked', isChecked).trigger('change');
                });
                updateRowStyles(tableId);
            });
            
            // 单个复选框变化（事件委托，兼容动态）
            $(document).on('change', `input[name="tech-item-${tableId}"]`, function() {
                // 用ES6 every检查
                const checkboxes = $(`input[name="tech-item-${tableId}"]`);
                const selectAll = $(`.select-all[data-table="${tableId}"]`);
                const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
                const anyChecked = checkboxes.length > 0 && Array.from(checkboxes).some(cb => cb.checked);
                selectAll.prop('checked', allChecked);
                selectAll.prop('indeterminate', !allChecked && anyChecked);
                const $row = $(this).closest('tr');
                if (this.checked) {
                    $row.css('background-color', config.selectedColor);
                } else {
                    $row.css('background-color', '');
                }
            });
        }
        
        // 更新全选状态
        function updateSelectAllState(tableId) {
            const $selectAll = $(`.select-all[data-table="${tableId}"]`);
            const $items = $(`input[name="tech-item-${tableId}"]`);
            
            if ($items.length === 0) return;
            
            const checkedCount = $items.filter(':checked').length;
            const totalCount = $items.length;
            
            $selectAll.prop('indeterminate', false);
            
            if (checkedCount === 0) {
                $selectAll.prop('checked', false);
            } else if (checkedCount === totalCount) {
                $selectAll.prop('checked', true);
            } else {
                $selectAll.prop('checked', false);
                $selectAll.prop('indeterminate', true);
            }
        }
        
        // 更新单个行样式
        function updateRowStyle($checkbox) {
            const $row = $checkbox.closest('tr');
            if ($checkbox.prop('checked')) {
                $row.css('background-color', config.selectedColor);
            } else {
                $row.css('background-color', '');
            }
        }
        
        // 批量更新行样式
        function updateRowStyles(tableId) {
            $(`input[name="tech-item-${tableId}"]`).each(function() {
                updateRowStyle($(this));
            });
        }
    });