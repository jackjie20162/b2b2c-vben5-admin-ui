-- ============================================================================
-- Travel 旅游商户插件菜单
-- 仅面向商户后台；暂不创建 simple-admin 总后台 Travel 菜单。
-- 幂等：以 name 作为菜单唯一判断条件。
-- ============================================================================

INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 30, 1, 0, '/travel_dir', 'TravelManagement',
  'LAYOUT', 0, 'Other', '旅游管理', 'ant-design:global-outlined', 0,
  0, 0, 0, 0, 0, 0, 20, 1000000
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'TravelManagement');

SET @travel_dir_id = (SELECT id FROM sys_menus WHERE name = 'TravelManagement');

INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 2, 1, '/travel/product', 'TravelProductManagement',
  '/plugin/travel/views/product/index', 0, 'Other', '旅游产品', 'ant-design:environment-outlined', 0,
  0, 0, 0, 0, 0, 0, 20, @travel_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'TravelProductManagement');

INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 2, 1, '/travel/inventory', 'TravelInventoryManagement',
  '/plugin/travel/views/inventory/index', 0, 'Other', '库存与价格', 'ant-design:calendar-outlined', 0,
  0, 0, 0, 0, 0, 0, 20, @travel_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'TravelInventoryManagement');

INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 3, 2, 1, '/travel/order', 'TravelOrderManagement',
  '/plugin/travel/views/order/index', 0, 'Other', '旅游订单', 'ant-design:profile-outlined', 0,
  0, 0, 0, 0, 0, 0, 20, @travel_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'TravelOrderManagement');
