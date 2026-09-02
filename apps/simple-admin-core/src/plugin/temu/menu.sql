-- ============================================================================
-- Temu 独立模块菜单初始化脚本
-- 说明: 直接插入 sys_menus / role_menus
-- 执行方式: 按项目现有数据库初始化方式导入
-- ============================================================================

-- 1. Temu 管理目录
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 1, 0, '/temu', 'TemuManagement',
  'LAYOUT', 0, 'Other', 'Temu管理', 'ant-design:api-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, 1000000
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'TemuManagement');

SET @temu_dir_id = (SELECT id FROM sys_menus WHERE name = 'TemuManagement');

-- 2. 商户 Key 管理
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 2, 1, '/temu/merchant-key', 'TemuMerchantKeyManagement',
  '/plugin/temu/views/merchant/index', 0, 'Other', '商户Key管理', 'ant-design:key-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @temu_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'TemuMerchantKeyManagement');

-- 3. 请求记录
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 2, 1, '/temu/request-log', 'TemuRequestLogManagement',
  '/plugin/temu/views/request-log/index', 0, 'Other', '请求记录', 'ant-design:file-search-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @temu_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'TemuRequestLogManagement');

-- 4. 授权给管理员角色(role_id=1)
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT 1, id FROM sys_menus
WHERE name IN (
  'TemuManagement',
  'TemuMerchantKeyManagement',
  'TemuRequestLogManagement'
);
