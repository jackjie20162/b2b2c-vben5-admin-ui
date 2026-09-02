-- ============================================================================
-- 万林商城插件菜单初始化脚本（simple-admin sys_menus / role_menus）
-- 执行方式: docker exec -i mysql mysql -uroot -p123456 simple_admin < menu.sql
-- 幂等: 以 name 作为唯一键，重复执行不会插入重复菜单
-- ============================================================================

-- 1. 商城管理目录（一级目录，component=LAYOUT）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 1, 0, '/zzhshopR2_dir', 'ZzhshopR2Management',
  'LAYOUT', 0, 'Other', '商城管理', 'ant-design:shop-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, 1000000
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Management');

SET @dir_id = (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2Management');

-- 2. 商品管理
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 2, 1, '/zzhshopR2/goods', 'ZzhshopR2GoodsManagement',
  '/plugin/zzhshopR2/views/goods/index', 0, 'Other', '产品管理', 'ant-design:shopping-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2GoodsManagement');

-- 3. 分类管理
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 2, 1, '/zzhshopR2/category', 'ZzhshopR2CategoryManagement',
  '/plugin/zzhshopR2/views/category/index', 0, 'Other', '分类管理', 'ant-design:appstore-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2CategoryManagement');

-- 4. 店铺管理目录（二级目录，component 为空；由旧版"店铺管理"页面升级而来）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 3, 2, 0, '/zzhshopR2/shop', 'ZzhshopR2ShopManagement',
  '', 0, 'Other', '店铺管理', 'ant-design:shop-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2ShopManagement');

-- 旧版"店铺管理"页面菜单升级为目录
UPDATE sys_menus
SET menu_type = 0,
    component = '',
    path = '/zzhshopR2/shop',
    title = '店铺管理'
WHERE name = 'ZzhshopR2ShopManagement';

SET @shop_dir_id = (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2ShopManagement');

-- 4.1 店铺列表（三级，复用原店铺管理页面）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 3, 1, '/zzhshopR2/shop/list', 'ZzhshopR2ShopList',
  '/plugin/zzhshopR2/views/shop/index', 0, 'Other', '店铺列表', 'ant-design:shop-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @shop_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2ShopList');

-- 4.2 新店铺审核（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 3, 1, '/zzhshopR2/shop/audit', 'ZzhshopR2ShopAudit',
  '/plugin/zzhshopR2/views/shop/audit', 0, 'Other', '新店铺审核', 'ant-design:audit-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @shop_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2ShopAudit');

-- 4.3 地址管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 3, 3, 1, '/zzhshopR2/shop/address', 'ZzhshopR2Address',
  '/plugin/zzhshopR2/views/shop/address', 0, 'Other', '地址管理', 'ant-design:environment-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @shop_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Address');

-- 4.4 服务管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 4, 3, 1, '/zzhshopR2/shop/service', 'ZzhshopR2Service',
  '/plugin/zzhshopR2/views/shop/service', 0, 'Other', '服务管理', 'ant-design:customer-service-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @shop_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Service');

-- 4.5 运费模板（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 5, 3, 1, '/zzhshopR2/shop/freight', 'ZzhshopR2Freight',
  '/plugin/zzhshopR2/views/shop/freight', 0, 'Other', '运费模板', 'ant-design:car-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @shop_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Freight');

-- 4.6 品牌管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 6, 3, 1, '/zzhshopR2/shop/brand', 'ZzhshopR2Brand',
  '/plugin/zzhshopR2/views/shop/brand', 0, 'Other', '品牌管理', 'ant-design:trademark-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @shop_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Brand');

-- 5. 订单监管目录（二级目录，component 为空；由旧版"订单管理"页面升级而来）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 4, 2, 0, '/zzhshopR2/order', 'ZzhshopR2OrderManagement',
  '', 0, 'Other', '订单监管', 'ant-design:file-text-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2OrderManagement');

-- 旧版"订单管理"页面菜单升级为目录
UPDATE sys_menus
SET menu_type = 0,
    component = '',
    path = '/zzhshopR2/order',
    title = '订单监管'
WHERE name = 'ZzhshopR2OrderManagement';

SET @order_dir_id = (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2OrderManagement');

-- 5.1 商品订单（三级，复用原订单管理页面）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 3, 1, '/zzhshopR2/order/goods', 'ZzhshopR2OrderGoods',
  '/plugin/zzhshopR2/views/order/index', 0, 'Other', '商品订单', 'ant-design:shopping-cart-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @order_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2OrderGoods');

-- 5.2 拼团订单（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 3, 1, '/zzhshopR2/order/group', 'ZzhshopR2OrderGroup',
  '/plugin/zzhshopR2/views/order/group', 0, 'Other', '拼团订单', 'ant-design:team-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @order_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2OrderGroup');

-- 5.3 评论管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 3, 3, 1, '/zzhshopR2/order/comment', 'ZzhshopR2OrderComment',
  '/plugin/zzhshopR2/views/order/comment', 0, 'Other', '评论管理', 'ant-design:message-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @order_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2OrderComment');

-- 5.4 退款管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 4, 3, 1, '/zzhshopR2/order/refund', 'ZzhshopR2OrderRefund',
  '/plugin/zzhshopR2/views/order/refund', 0, 'Other', '退款管理', 'ant-design:rollback-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @order_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2OrderRefund');

-- 6. 兼容旧版：/init/database 脚本曾创建异名商城管理目录，合并其子菜单后删除
UPDATE sys_menus
SET parent_id = (SELECT t.id FROM (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2Management') t)
WHERE parent_id = (SELECT t.id FROM (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2ManagementDirectory') t);

DELETE FROM sys_menus WHERE name = 'ZzhshopR2ManagementDirectory';

-- 7. 店铺装修目录（二级目录，component 为空）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 5, 2, 0, '/zzhshopR2/diy', 'ZzhshopR2DiyDirectory',
  '', 0, 'Other', '店铺装修', 'ant-design:skin-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2DiyDirectory');

SET @diy_dir_id = (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2DiyDirectory');

-- 8. 页面管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 3, 1, '/zzhshopR2/diy/page', 'ZzhshopR2PageManagement',
  '/plugin/zzhshopR2/views/diy/page/index', 0, 'Other', '页面管理', 'ant-design:layout-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @diy_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2PageManagement');

-- 9. 模板管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 3, 1, '/zzhshopR2/diy/template', 'ZzhshopR2TemplateManagement',
  '/plugin/zzhshopR2/views/diy/template/index', 0, 'Other', '模板管理', 'ant-design:block-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @diy_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2TemplateManagement');

-- 10. 全局样式（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 3, 3, 1, '/zzhshopR2/diy/style', 'ZzhshopR2StyleManagement',
  '/plugin/zzhshopR2/views/diy/style/index', 0, 'Other', '全局样式', 'ant-design:format-painter-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @diy_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2StyleManagement');

-- 11. 链接管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 4, 3, 1, '/zzhshopR2/diy/link', 'ZzhshopR2LinkManagement',
  '/plugin/zzhshopR2/views/diy/link/index', 0, 'Other', '链接管理', 'ant-design:link-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @diy_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2LinkManagement');

-- 12. 图标管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 5, 3, 1, '/zzhshopR2/diy/icon', 'ZzhshopR2IconManagement',
  '/plugin/zzhshopR2/views/diy/icon/index', 0, 'Other', '图标管理', 'ant-design:highlight-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @diy_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2IconManagement');

-- 13. 迁移旧版平铺菜单：五个二级菜单归入店铺装修目录
UPDATE sys_menus
SET parent_id = @diy_dir_id,
    menu_level = 3,
    sort = CASE name
      WHEN 'ZzhshopR2PageManagement' THEN 1
      WHEN 'ZzhshopR2TemplateManagement' THEN 2
      WHEN 'ZzhshopR2StyleManagement' THEN 3
      WHEN 'ZzhshopR2LinkManagement' THEN 4
      ELSE 5
    END
WHERE name IN (
  'ZzhshopR2PageManagement',
  'ZzhshopR2TemplateManagement',
  'ZzhshopR2StyleManagement',
  'ZzhshopR2LinkManagement',
  'ZzhshopR2IconManagement'
);

-- 14. 商城配置目录（二级目录，component 为空）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 6, 2, 0, '/zzhshopR2/config', 'ZzhshopR2ConfigDirectory',
  '', 0, 'Other', '商城配置', 'ant-design:setting-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2ConfigDirectory');

SET @config_dir_id = (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2ConfigDirectory');

-- 15. 系统设置（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 3, 1, '/zzhshopR2/config/client', 'ZzhshopR2ClientConfig',
  '/plugin/zzhshopR2/views/config/index', 0, 'Other', '系统设置', 'ant-design:control-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @config_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2ClientConfig');

-- 16. 财务管理目录（二级目录，component 为空）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 7, 2, 0, '/zzhshopR2/finance', 'ZzhshopR2FinanceDirectory',
  '', 0, 'Other', '财务管理', 'ant-design:account-book-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2FinanceDirectory');

SET @finance_dir_id = (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2FinanceDirectory');

-- 17. 资金账单（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 3, 1, '/zzhshopR2/finance/money', 'ZzhshopR2MoneyLog',
  '/plugin/zzhshopR2/views/finance/moneyLog', 0, 'Other', '资金账单', 'ant-design:transaction-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @finance_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2MoneyLog');

-- 18. 用户提现（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 3, 1, '/zzhshopR2/finance/withdraw', 'ZzhshopR2Withdraw',
  '/plugin/zzhshopR2/views/finance/withdraw', 0, 'Other', '用户提现', 'ant-design:dollar-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @finance_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Withdraw');

-- 19. 内容管理目录（二级目录，component 为空）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 8, 2, 0, '/zzhshopR2/content', 'ZzhshopR2ContentDirectory',
  '', 0, 'Other', '内容管理', 'ant-design:read-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2ContentDirectory');

SET @content_dir_id = (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2ContentDirectory');

-- 20. 文章列表（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 3, 1, '/zzhshopR2/content/article', 'ZzhshopR2Article',
  '/plugin/zzhshopR2/views/content/article', 0, 'Other', '文章列表', 'ant-design:file-text-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @content_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Article');

-- 21. 分类管理（三级，文章分类）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 3, 1, '/zzhshopR2/content/category', 'ZzhshopR2ArticleCategory',
  '/plugin/zzhshopR2/views/content/category', 0, 'Other', '分类管理', 'ant-design:appstore-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @content_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2ArticleCategory');

-- 22. 客服服务目录（二级目录，component 为空）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 9, 2, 0, '/zzhshopR2/service', 'ZzhshopR2CustomerService',
  '', 0, 'Other', '客服服务', 'ant-design:customer-service-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2CustomerService');

SET @service_dir_id = (SELECT id FROM sys_menus WHERE name = 'ZzhshopR2CustomerService');

-- 23. 投诉管理（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 1, 3, 1, '/zzhshopR2/service/complaint', 'ZzhshopR2Complaint',
  '/plugin/zzhshopR2/views/service/complaint', 0, 'Other', '投诉管理', 'ant-design:warning-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @service_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Complaint');

-- 24. 意见反馈（三级）
INSERT INTO sys_menus (
  created_at, updated_at, sort, menu_level, menu_type, path, name,
  component, disabled, service_name, title, icon, hide_menu,
  hide_breadcrumb, ignore_keep_alive, hide_tab, carry_param,
  hide_children_in_menu, affix, dynamic_level, parent_id
)
SELECT NOW(), NOW(), 2, 3, 1, '/zzhshopR2/service/feedback', 'ZzhshopR2Feedback',
  '/plugin/zzhshopR2/views/service/feedback', 0, 'Other', '意见反馈', 'ant-design:comment-outlined', 0,
  0, 0, 0, 0,
  0, 0, 20, @service_dir_id
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_menus WHERE name = 'ZzhshopR2Feedback');

-- 25. 授权给管理员角色(role_id=1)
INSERT IGNORE INTO role_menus (role_id, menu_id)
SELECT 1, id FROM sys_menus
WHERE name IN (
  'ZzhshopR2Management',
  'ZzhshopR2DiyDirectory',
  'ZzhshopR2ConfigDirectory',
  'ZzhshopR2GoodsManagement',
  'ZzhshopR2CategoryManagement',
  'ZzhshopR2ShopManagement',
  'ZzhshopR2ShopList',
  'ZzhshopR2ShopAudit',
  'ZzhshopR2Address',
  'ZzhshopR2Service',
  'ZzhshopR2Freight',
  'ZzhshopR2Brand',
  'ZzhshopR2OrderManagement',
  'ZzhshopR2OrderGoods',
  'ZzhshopR2OrderGroup',
  'ZzhshopR2OrderComment',
  'ZzhshopR2OrderRefund',
  'ZzhshopR2PageManagement',
  'ZzhshopR2TemplateManagement',
  'ZzhshopR2StyleManagement',
  'ZzhshopR2LinkManagement',
  'ZzhshopR2IconManagement',
  'ZzhshopR2ClientConfig',
  'ZzhshopR2FinanceDirectory',
  'ZzhshopR2MoneyLog',
  'ZzhshopR2Withdraw',
  'ZzhshopR2ContentDirectory',
  'ZzhshopR2Article',
  'ZzhshopR2ArticleCategory',
  'ZzhshopR2CustomerService',
  'ZzhshopR2Complaint',
  'ZzhshopR2Feedback'
);
