/**
 * 万林商城管理端数据模型
 * 字段与 zzhshopR2-rpc proto 消息保持一致（snake_case）
 */

// ===== 商品 =====
export interface GoodsInfo {
  id?: number;
  // 店铺ID
  shop_id?: number;
  // 店铺分类ID(多选)
  shop_category_id?: string;
  // 目录ID
  category_id?: number;
  // 品牌ID
  brand_id?: number;
  // 目录属性(JSON)
  category_attribute?: string;
  // 商品标题
  title?: string;
  // 商品主图
  image?: string;
  // 商品图片
  images?: string;
  // 商品描述
  description?: string;
  // 标志
  flag?: string;
  // 库存扣减:payment=拍下减库存,porder=付款减库存
  stock?: string;
  // 商品详情
  content?: string;
  // 运费模板ID
  freight_id?: number;
  // 上架:0=下架,1=上架
  grounding?: number;
  // 规格:single=单规格,multi=多规格
  specs?: string;
  // 是否分销
  distribution?: string;
  // 是否活动商品
  activity?: string;
  // 活动ID
  activity_id?: number;
  // 活动类型
  activity_type?: string;
  // 浏览量
  views?: number;
  // 价格
  price?: number;
  // 销量
  sales?: number;
  // 付款数
  payment?: number;
  // 评论数
  comment?: number;
  // 好评数
  praise?: number;
  // 中评数
  moderate?: number;
  // 差评数
  negative?: number;
  // 喜欢数
  like?: number;
  // 权重
  weigh?: number;
  // 支付方式(多选,逗号分隔):balance=余额,wechat=微信,alipay=支付宝,union=银联
  payment_type?: string;
  // 售后服务(多选,逗号分隔):7day_return=七天退换,broken=坏单包赔,genuine=正品保障,quality=品质保障,after_sale=售后服务
  after_sale?: string;
  // 售后说明
  after_sale_content?: string;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  status?: string;
}

export interface GoodsListResp {
  total: number;
  data: GoodsInfo[];
}

export interface GoodsSkuInfo {
  id?: number;
  goods_id?: number;
  // 规格图
  thumbnail?: string;
  // 规格组合，如 "白色,XL"
  difference?: string;
  // 现价
  price?: number;
  // 原价
  market_price?: number;
  // 库存
  stock?: number;
  // 重量
  weigh?: string;
  // 商品编码
  sn?: string;
  sales?: number;
  // 状态:0=新版数据,1=旧版数据
  state?: string;
  status?: string;
}

export interface GoodsSpuInfo {
  id?: number;
  goods_id?: number;
  // 规格名称，如 "颜色"
  name?: string;
  // 规格项，逗号分隔，如 "白色,红色"
  item?: string;
  status?: string;
}

export interface GoodsDetailResp {
  goods?: GoodsInfo;
  skus?: GoodsSkuInfo[];
  spus?: GoodsSpuInfo[];
}

/** 商品一体化创建请求（商品 + SPU规格 + SKU明细） */
export interface GoodsCreateFullReq {
  goods: GoodsInfo;
  spus: GoodsSpuInfo[];
  skus: GoodsSkuInfo[];
}

/** 商品一体化更新请求；spus/skus 均为空时仅更新主表 */
export interface GoodsUpdateFullReq {
  goods: GoodsInfo;
  spus?: GoodsSpuInfo[];
  skus?: GoodsSkuInfo[];
}

// ===== 运费模板 =====
export interface ShopFreightInfo {
  id?: number;
  // 店铺ID
  shop_id?: number;
  // 模板名称
  name?: string;
  // 发货时间
  delivery?: string;
  // 是否包邮:0=自定义运费,1=卖家包邮
  isdelivery?: string;
  // 计价方式:0=按件数,1=按重量,2=按体积
  valuation?: string;
  createtime?: number;
  updatetime?: number;
  status?: string;
}

export interface ShopFreightListResp {
  total: number;
  data: ShopFreightInfo[];
}

// ===== 分类 =====
export interface CategoryInfo {
  id?: number;
  // 上级分类ID,一级为0
  pid?: number;
  // 类型:goods=商品分类,article=文章分类
  type?: string;
  // 分类名称
  name?: string;
  // 拼音
  name_spacer?: string;
  // 图片
  image?: string;
  // 标志
  flag?: string;
  // 是否导航显示
  isnav?: number;
  createtime?: number;
  updatetime?: number;
  // 权重
  weigh?: number;
  status?: string;
}

export interface CategoryListResp {
  total: number;
  data: CategoryInfo[];
}

export interface CategoryTreeNode {
  id?: number;
  pid?: number;
  name?: string;
  image?: string;
  flag?: string;
  weigh?: number;
  children?: CategoryTreeNode[];
  // 类型:article=文章,goods=商品
  type?: string;
  // 是否导航显示
  isnav?: number;
  status?: string;
}

export interface CategoryTreeResp {
  data: CategoryTreeNode[];
}

// ===== 类目属性 =====
export interface CategoryAttributeInfo {
  id?: number;
  // 管理员ID
  admin_id?: number;
  // 类目ID
  category_id?: number;
  // 属性名称
  name?: string;
  // 属性值(JSON)
  value?: string;
  // 开关(1=必填属性)
  is_switch?: number;
  // 权重
  weigh?: number;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  status?: string;
}

export interface CategoryAttributeListResp {
  total: number;
  data: CategoryAttributeInfo[];
}

// ===== 文章 =====
export interface ArticleInfo {
  id?: number;
  // 管理员ID
  admin_id?: number;
  // 分类ID(单选)
  category_id?: number;
  // 标志(多选):hot=热门,index=首页,recommend=推荐
  flag?: string;
  // 标题
  title?: string;
  // 内容
  content?: string;
  // 图片
  image?: string;
  // 图片组
  images?: string;
  // 附件
  attachfile?: string;
  // 关键字
  keywords?: string;
  // 描述
  description?: string;
  // 点击
  views?: number;
  createtime?: number;
  updatetime?: number;
  // 权重
  weigh?: number;
  status?: string;
  // 分类名称(列表展示)
  category_name?: string;
}

export interface ArticleListResp {
  total: number;
  data: ArticleInfo[];
}

export interface ArticleListReq {
  page: number;
  page_size: number;
  // 分类ID(可多选)
  category_ids?: number[];
  title?: string;
  status?: string;
  flag?: string;
}

// ===== 店铺 =====
export interface ShopInfo {
  id?: number;
  // 会员ID
  user_id?: number;
  // 店铺名称
  shopname?: string;
  // 关键字
  keywords?: string;
  // 描述
  description?: string;
  // 服务(多选)
  service_ids?: string;
  // 店铺头像
  avatar?: string;
  // 店铺类型:0=个人,1=企业,2=旗舰
  state?: string;
  // 店铺等级
  level?: number;
  // 直播权限
  islive?: number;
  // 是否自营
  isself?: number;
  // 店铺简介
  bio?: string;
  // 省市
  city?: string;
  // 退货地址
  return_address?: string;
  // 收藏/喜欢
  like?: number;
  // 宝贝描述评分
  score_describe?: number;
  // 卖家服务评分
  score_service?: number;
  // 发货相符评分
  score_deliver?: number;
  // 物流服务评分
  score_logistics?: number;
  // 权重
  weigh?: number;
  // 审核:0=提交资质,1=提交店铺,2=提交审核,3=通过,4=未通过
  verify?: string;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  status?: string;
}

export interface ShopListResp {
  total: number;
  data: ShopInfo[];
}

// ===== 订单 =====
export interface OrderInfo {
  id?: number;
  // 用户ID
  user_id?: number;
  // 店铺ID
  shop_id?: number;
  // 订单号
  order_no?: string;
  // 地址ID
  address_id?: number;
  // 优惠券ID
  coupon_id?: number;
  // 是否修改过地址
  isaddress?: number;
  // 运费组合策略
  freight_type?: number;
  // 快递公司
  express_name?: string;
  // 快递号
  express_no?: string;
  // 订单状态:1=待支付,2=待发货,3=待收货,4=待评价,5=售后订单,6=已完成,7=已取消
  state?: string;
  // 订单备注
  remarks?: string;
  createtime?: number;
  paymenttime?: number;
  delivertime?: number;
  taketime?: number;
  dealtime?: number;
  updatetime?: number;
  deletetime?: number;
  status?: string;
}

export interface OrderListResp {
  total: number;
  data: OrderInfo[];
}

export interface OrderGoodsInfo {
  id?: number;
  order_id?: number;
  goods_id?: number;
  shop_id?: number;
  shop_name?: string;
  // 产品标题
  title?: string;
  // 商品主图
  image?: string;
  // 商品编码
  goods_sku_sn?: string;
  // SKU ID
  goods_sku_id?: number;
  // 选择的sku
  difference?: string;
  price?: number;
  // 实际支付
  actual_payment?: number;
  refund_id?: number;
  // 退款状态
  refund_status?: string;
  market_price?: number;
  freight_price?: number;
  discount_price?: number;
  // 数量
  number?: number;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  status?: string;
}

export interface OrderDetailResp {
  order?: OrderInfo;
  goods: OrderGoodsInfo[];
}

// 管理端订单列表项（订单 + 商品明细 + 买家昵称）
export interface AdminOrderItem {
  order?: OrderInfo;
  goods: OrderGoodsInfo[];
  buyer?: string;
}

export interface AdminOrderListResp {
  total: number;
  data: AdminOrderItem[];
}

// ===== 拼团订单 =====
export interface GroupsOrderInfo {
  id?: number;
  // 用户ID
  user_id?: number;
  // 所属商家
  shop_id?: number;
  // 订单号
  order_no?: string;
  address_id?: number;
  coupon_id?: number;
  isaddress?: number;
  freight_type?: number;
  // 快递公司
  express_name?: string;
  // 快递号
  express_no?: string;
  // 订单状态:1=待支付,2=待成团,3=待发货,4=待收货,5=待评论,6=已完成,7=已取消
  state?: string;
  // 订单备注
  remarks?: string;
  createtime?: number;
  paymenttime?: number;
  groupstime?: number;
  delivertime?: number;
  taketime?: number;
  dealtime?: number;
  updatetime?: number;
  status?: string;
}

export interface GroupsOrderListResp {
  total: number;
  data: GroupsOrderInfo[];
}

export interface GroupsOrderListReq {
  page: number;
  page_size: number;
  state?: string;
  user_id?: number;
  shop_id?: number;
  order_no?: string;
}

// ===== 评论 =====
export interface CommentInfo {
  id?: number;
  user_id?: number;
  shop_id?: number;
  order_id?: number;
  goods_id?: number;
  // 订单类型:goods=普通订单,groups=拼团订单,seckill=秒杀订单
  order_type?: string;
  order_goods_id?: number;
  // 评价:0=好评,1=中评,2=差评
  state?: string;
  // 内容
  content?: string;
  // 评论标签
  tag?: string;
  // 所购买商品SUK
  suk?: string;
  // 图片组
  images?: string;
  // 综合评分
  score?: number;
  score_describe?: number;
  score_service?: number;
  score_deliver?: number;
  score_logistics?: number;
  // 匿名评论:0=否,1=是
  switch?: number;
  createtime?: number;
  updatetime?: number;
  // 状态:normal=正常,hidden=隐藏
  status?: string;
  // 用户昵称(列表展示)
  user_nickname?: string;
  // 店铺名称(列表展示)
  shop_name?: string;
  // 商品标题(列表展示)
  goods_title?: string;
}

export interface CommentListResp {
  total: number;
  data: CommentInfo[];
}

export interface CommentListReq {
  page: number;
  page_size: number;
  state?: string;
  order_type?: string;
  user_id?: number;
  shop_id?: number;
  goods_id?: number;
  status?: string;
}

// ===== 投诉举报 =====
export interface ComplaintInfo {
  id?: number;
  // 举报类型:0=用户举报,1=商品举报,2=店铺举报
  type?: string;
  // 举报人
  user_id?: number;
  // 被举报会员ID
  complaint_user_id?: number;
  // 被举报店铺ID
  complaint_shop_id?: number;
  // 被举报商品ID
  complaint_goods_id?: number;
  // 内容
  content?: string;
  // 图片组
  images?: string;
  // 举报理由:0=虚假交易,1=诈骗欺诈,2=收到空包裹,3=假冒盗版,4=泄露信息,5=违禁物品,6=未按成交价交易,7=未按约定时间发货,8=垃圾营销,9=涉黄信息,10=不实信息,11=人身攻击,12=违法信息,13=诈骗信息
  reason?: string;
  // 处理回执
  receipt?: string;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  // 状态:normal=未受理,hidden=已受理
  state?: string;
  // 举报人昵称(列表展示)
  user_nickname?: string;
  // 被举报商品标题(列表展示)
  goods_title?: string;
  // 被举报商品主图(列表展示)
  goods_image?: string;
}

export interface ComplaintListResp {
  total: number;
  data: ComplaintInfo[];
}

export interface ComplaintListReq {
  page: number;
  page_size: number;
  type?: string;
  user_id?: number;
  reason?: string;
  state?: string;
}

// ===== 意见反馈 =====
export interface FeedbackInfo {
  id?: number;
  // 用户ID
  user_id?: number;
  // 内容
  content?: string;
  // 图片组
  images?: string;
  // 联系方式
  contact?: string;
  // 设备详情
  device?: string;
  // 评分
  score?: number;
  // 处理回执
  receipt?: string;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  // 状态:normal=未受理,hidden=已受理
  status?: string;
  // 用户昵称(列表展示)
  user_nickname?: string;
}

export interface FeedbackListResp {
  total: number;
  data: FeedbackInfo[];
}

export interface FeedbackListReq {
  page: number;
  page_size: number;
  user_id?: number;
  contact?: string;
  status?: string;
}

// ===== 退款 =====
export interface RefundInfo {
  id?: number;
  user_id?: number;
  shop_id?: number;
  order_id?: number;
  order_pay_id?: number;
  // 订单类型:goods=普通订单,groups=拼团订单,seckill=秒杀订单
  order_type?: string;
  // 退款产品(商品ID多选)
  goods_ids?: string;
  // 物流状态:0=未收到货,1=已收到货
  express_type?: string;
  // 退款金额
  price?: number;
  // 退款类型:0=仅退款,1=退货退款
  type?: string;
  // 退货理由:0=不喜欢,1=空包裹,2=一直未送达,3=颜色/尺码不符,4=质量问题,5=少件漏发,6=假冒品牌
  reason?: string;
  // 凭证图片
  images?: string;
  // 退款说明
  refund_content?: string;
  // 拒绝原因
  refuse_content?: string;
  // 商家备注
  notice?: string;
  express_name?: string;
  express_no?: string;
  // 退款状态:0=申请退款,1=卖家同意,2=卖家拒绝,3=申请平台介入,4=成功退款,5=退款已关闭,6=买家已退货,7=退款返还中,8=退款失败
  state?: string;
  createtime?: number;
  agreetime?: number;
  returntime?: number;
  rejecttime?: number;
  closingtime?: number;
  completetime?: number;
  updatetime?: number;
  deletetime?: number;
  status?: string;
}

export interface RefundListResp {
  total: number;
  data: RefundInfo[];
}

export interface RefundListReq {
  page: number;
  page_size: number;
  state?: string;
  order_type?: string;
  express_type?: string;
  type?: string;
  reason?: string;
}

export interface AuditRefundReq {
  refund_id: number;
  agree: boolean;
  refuse_content?: string;
}

// ===== 装修页面/模板 =====
export interface PageInfo {
  id?: number;
  // 页面令牌(历史版本分组)
  page_token?: string;
  // 所属店铺ID
  shop_id?: number;
  // 页面名称
  name?: string;
  // 封面图
  cover?: string;
  // 类型:page=单页,shop=店铺,index=APP首页,systpl=首页模板
  type?: string;
  // 页面配置JSON
  page?: string;
  // 组件列表JSON
  item?: string;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  status?: string;
}

export interface PageListResp {
  total: number;
  data: PageInfo[];
}

// ===== 全局样式 =====
export interface GlobalStyleInfo {
  // 类目页样式:1=经典,2=潮流,3=简约,4=分类导航
  category_style?: string;
  // 发现页导航背景色
  find_nav_color?: string;
  // 发现页字体颜色:light=浅色,dark=深色
  find_font_color?: string;
  // 购物车导航背景图
  cart_nav_image?: string;
  // 购物车导航背景色
  cart_nav_color?: string;
  // 购物车字体颜色
  cart_font_color?: string;
  // 拼团栏导航背景图
  groups_nav_image?: string;
  // 拼团栏导航背景色
  groups_nav_color?: string;
  // 拼团栏字体颜色
  groups_font_color?: string;
  // 用户中心导航背景色
  user_nav_color?: string;
  // 用户中心导航背景图
  user_nav_image?: string;
  // 用户中心背景色
  user_bg_color?: string;
  // 用户中心背景图
  user_bg_image?: string;
  // 用户中心字体颜色
  user_font_color?: string;
}

// ===== 链接 =====
export interface LinkInfo {
  id?: number;
  // 类型:system=系统,activity=活动,user=用户中心,product=商品,page=自定义页面
  type?: string;
  // 页面标题
  title?: string;
  // 页面路径
  route?: string;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  // 权重
  weigh?: number;
  status?: string;
}

export interface LinkListResp {
  total: number;
  data: LinkInfo[];
}

// ===== 图标 =====
export interface IconInfo {
  id?: number;
  // 图标名称
  name?: string;
  // 图标类名(wlIcon-*)
  class?: string;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  // 权重
  weigh?: number;
  // 状态:normal=正常,hidden=隐藏
  status?: string;
}

export interface IconListResp {
  total: number;
  data: IconInfo[];
}

// ===== 新店铺审核 =====
export interface AuthInfo {
  id?: number;
  // 会员ID
  user_id?: number;
  // 店铺类型:0=个人,1=企业,2=旗舰
  state?: string;
  // 店铺名称
  shopname?: string;
  // 企业名/姓名
  name?: string;
  // 统一信用/身份证号
  number?: string;
  // 手机号
  mobile?: string;
  // 证件图片
  image?: string;
  // 商标证书
  trademark?: string;
  // 微信号
  wechat?: string;
  // 店铺头像
  avatar?: string;
  // 店铺简介
  bio?: string;
  // 拒绝理由
  refuse?: string;
  // 店铺介绍
  content?: string;
  // 省市
  city?: string;
  // 审核:0=提交资质,1=提交店铺,2=提交审核,3=通过,4=未通过
  verify?: string;
  // 创店时间
  createtime?: number;
  // 更新时间
  updatetime?: number;
  deletetime?: number;
  status?: string;
}

export interface AuthListResp {
  total: number;
  data: AuthInfo[];
}

// ===== 地址管理 =====
export interface AddressInfo {
  id?: number;
  // 用户ID
  user_id?: number;
  // 店铺ID
  shop_id?: number;
  // 收货人
  name?: string;
  // 手机号
  mobile?: string;
  // 默认地址:0=否,1=是
  is_default?: string;
  // 国家
  country?: string;
  // 省份
  province?: string;
  // 城市
  city?: string;
  // 城市编码
  citycode?: number;
  // 区县
  district?: string;
  // 区域编码
  adcode?: number;
  // 完整地址
  formatted_address?: string;
  // 详细地址
  address?: string;
  // 地址名称
  address_name?: string;
  // 经纬度
  location?: string;
  // 创建时间
  createtime?: number;
  // 更新时间
  updatetime?: number;
  deletetime?: number;
  // 状态:normal=正常,hidden=隐藏
  status?: string;
}

export interface AddressListResp {
  total: number;
  data: AddressInfo[];
}

// ===== 服务管理 =====
export interface ShopServiceInfo {
  id?: number;
  // 服务名称
  name?: string;
  // 服务描述
  description?: string;
  // 创建时间
  createtime?: number;
  // 更新时间
  updatetime?: number;
  deletetime?: number;
  // 状态:normal=正常,hidden=隐藏
  status?: string;
}

export interface ShopServiceListResp {
  total: number;
  data: ShopServiceInfo[];
}

// ===== 品牌管理 =====
export interface BrandInfo {
  id?: number;
  // 管理员ID
  admin_id?: number;
  // 店铺ID
  shop_id?: number;
  // 类目ID(多选)
  category_id?: string;
  // 品牌名称
  name?: string;
  // 品牌图片
  image?: string;
  // 品牌介绍
  content?: string;
  // 权重
  weigh?: number;
  // 开关
  is_switch?: number;
  createtime?: number;
  updatetime?: number;
  deletetime?: number;
  status?: string;
  // 状态值:0=审核中,1=已审核
  state?: string;
}

export interface BrandListResp {
  total: number;
  data: BrandInfo[];
}

// ===== 通用请求 =====
export interface IDsUint32Req {
  ids: number[];
}
