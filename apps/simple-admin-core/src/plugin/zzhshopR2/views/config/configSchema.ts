/** 商城配置（系统设置）页签字段定义，对应 PHP wanlshop 客户端配置页 */

export interface ConfigOption {
  label: string;
  value: string;
}

export interface ConfigFieldDef {
  /** 配置分组（对应 PHP row[group][key]） */
  group: string;
  /** 配置键 */
  key: string;
  /** 配置项名称 */
  label: string;
  /** 控件类型 */
  type: 'checkbox' | 'color' | 'image' | 'radio' | 'select' | 'switch' | 'text';
  /** 输入提示 */
  placeholder?: string;
  /** 说明文字 */
  tip?: string;
  /** 选项（select/radio/checkbox） */
  options?: ConfigOption[];
  /** 默认值 */
  def?: any;
}

export interface ConfigTabDef {
  key: string;
  title: string;
  /** 页签顶部警告提示 */
  alert?: string;
  fields: ConfigFieldDef[];
}

const findSwitchOptions: ConfigOption[] = [
  { label: '上新', value: 'new' },
  { label: '直播', value: 'live' },
  { label: '短视频（取消则关闭此功能）', value: 'video' },
  { label: '种草', value: 'want' },
  { label: '买家秀', value: 'show' },
];

const allFindSwitch = ['new', 'live', 'video', 'want', 'show'];

export const configTabs: ConfigTabDef[] = [
  {
    key: 'system',
    title: '系统配置',
    fields: [
      { group: 'config', key: 'store_audit', label: '新店铺审核', type: 'switch', def: 'Y', tip: '关闭此功能后，商家申请店铺无需后台审核直接开通' },
      { group: 'config', key: 'refund_switch', label: '第三方支付退款原路返回', type: 'switch', def: 'N', tip: '此功能会直接调用第三方支付退款API接口，退款后不可逆，不建议开启，建议退款至余额！！' },
      { group: 'config', key: 'help_category', label: '帮助中心类目CID', type: 'text', def: '1', placeholder: '类目ID，客户端读取帮助中心类目列表', tip: 'CID为后台【内容管理】-【分类管理】类目的ID' },
      { group: 'config', key: 'new_category', label: '头条新闻类目CID', type: 'text', def: '2', placeholder: '类目ID，客户端读取头条新闻类目列表' },
      { group: 'config', key: 'sys_category', label: '系统消息类目CID', type: 'text', def: '4', placeholder: '类目ID，客户端读取系统消息类目列表' },
      { group: 'config', key: 'user_agreement', label: '用户协议文章ID', type: 'text', def: '153', placeholder: '用户协议的文章ID', tip: '文章ID为后台【内容管理】-【文章列表】文章的ID' },
      { group: 'config', key: 'privacy_protection', label: '隐私保护文章ID', type: 'text', def: '154', placeholder: '隐私保护文章ID' },
      { group: 'config', key: 'service_logo', label: '客服头像', type: 'image', def: '', placeholder: '请上传客服头像，建议尺寸300x300像素' },
      { group: 'config', key: 'tel_phone', label: '客服电话', type: 'text', def: '', placeholder: '电话、手机号' },
      { group: 'config', key: 'working_hours', label: '工作时间', type: 'text', def: '', placeholder: '09:00~22:00' },
      { group: 'config', key: 'shop_document', label: '商家后台文档地址', type: 'text', def: '', placeholder: 'https://doc.example.com' },
      { group: 'config', key: 'shop_qun', label: '商家后台QQ群', type: 'text', def: '', placeholder: 'QQ交流群链接' },
      { group: 'config', key: 'mp_weixin_id', label: '小程序ID', type: 'text', def: '', placeholder: '小程序ID' },
    ],
  },
  {
    key: 'redis',
    title: 'Redis',
    fields: [
      { group: 'redis', key: 'host', label: 'Redis主机地址', type: 'text', def: '127.0.0.1', placeholder: '在服务器安装一般填写127.0.0.1' },
      { group: 'redis', key: 'port', label: 'Redis服务端口', type: 'text', def: '6379', placeholder: '6379' },
      { group: 'redis', key: 'password', label: 'Redis密码 (一般为空)', type: 'text', def: '', placeholder: '通常Redis没有密码' },
      { group: 'redis', key: 'select', label: '操作库', type: 'text', def: '0', placeholder: '0' },
      { group: 'redis', key: 'timeout', label: '超时时间(秒)', type: 'text', def: '0', placeholder: '设置为0则默认超时时间' },
      { group: 'redis', key: 'persistent', label: '是否长连接', type: 'switch', def: 'Y' },
    ],
  },
  {
    key: 'websocket',
    title: 'WebSocket',
    alert: '重要提示: 改动配置务必查阅 GatewayWorker 手册后操作，非技术请勿修改保持默认即可；带星号的配置项启动多个 GatewayWorker 时需要修改不同端口，防止冲突。',
    fields: [
      { group: 'websocket', key: 'registerAddress', label: '* Register 服务的地址和端口', type: 'text', def: '127.0.0.1:1236', placeholder: '如127.0.0.1:1236' },
      { group: 'websocket', key: 'protocol', label: 'Gateway 通信协议', type: 'select', def: 'websocket', options: [ { label: 'websocket 协议', value: 'websocket' }, { label: 'text 协议', value: 'text' }, { label: 'frame 协议', value: 'develop' } ] },
      { group: 'websocket', key: 'host', label: 'Gateway IP 地址 host', type: 'text', def: '0.0.0.0', placeholder: '0.0.0.0代表监听本机所有网卡', tip: '127.0.0.1 代表只能本机访问，外网和内网都访问不到' },
      { group: 'websocket', key: 'port', label: '* Gateway 端口号 port', type: 'text', def: '8282', placeholder: '不能大于65535' },
      { group: 'websocket', key: 'name', label: 'Gateway 进程的名称', type: 'text', def: 'wanlshopGateway', placeholder: '仅支持英文' },
      { group: 'websocket', key: 'count', label: 'Gateway 进程数量 count', type: 'text', def: '1', placeholder: '一般一台服务器设置1-2足够' },
      { group: 'websocket', key: 'lanIp', label: 'Gateway 内网IP lanIp', type: 'text', def: '127.0.0.1', placeholder: '无论如何都不能写0.0.0.0' },
      { group: 'websocket', key: 'startPort', label: '* 内部通信端口的起始端口 startPort', type: 'text', def: '2000', placeholder: '如2000' },
      { group: 'websocket', key: 'daemonize', label: '守护进程模式运行', type: 'switch', def: 'Y' },
      { group: 'websocket', key: 'chatPidFile', label: '* IM 静态属性 pidFile', type: 'text', def: '' },
      { group: 'websocket', key: 'orderPidFile', label: '* 定时任务 静态属性 pidFile', type: 'text', def: '' },
      { group: 'websocket', key: 'pingInterval', label: '心跳检测间隔时间 pingInterval', type: 'text', def: '10', placeholder: '秒' },
      { group: 'websocket', key: 'pingNotResponseLimit', label: '响应的心跳次数 pingNotResponseLimit', type: 'text', def: '0', placeholder: '设置为 0 表示不自动断开未响应的客户端连接' },
      { group: 'websocket', key: 'pingData', label: '心跳数据内容 pingData', type: 'text', def: '', placeholder: 'JSON格式心跳数据内容' },
      { group: 'websocket', key: 'businessWorker_name', label: 'BusinessWorker 的名称', type: 'text', def: 'wanlshopBusinessWorker' },
      { group: 'websocket', key: 'businessWorker_count', label: 'BusinessWorker 实例数量 count', type: 'text', def: '1' },
      { group: 'config', key: 'auth_reply', label: '客服初始消息', type: 'text', def: '欢迎使用在线客服' },
      { group: 'config', key: 'not_online', label: '人工未在线', type: 'text', def: '非工作时间8:00-22:00 或客服繁忙！请稍后再试~' },
      { group: 'config', key: 'service_initial', label: '客服首消息', type: 'text', def: '您好 [微笑] 请用一句话简短描述问题~' },
    ],
  },
  {
    key: 'order',
    title: '定时任务',
    alert: '重要提示: 修改配置，或者按配置执行定时任务，均需要启动或重新启动定时任务命令。',
    fields: [
      { group: 'order', key: 'cancel', label: '取消未支付时间(天)', type: 'text', def: '1', placeholder: '订单下单未付款，n天后自动关闭，设置0天不自动关闭' },
      { group: 'order', key: 'receiving', label: '自动收货时间(天)', type: 'text', def: '7', placeholder: '如果在期间未确认收货，系统自动完成收货' },
      { group: 'order', key: 'comment', label: '自动评论时间(天)', type: 'text', def: '7', placeholder: '如果在期间未自动评论，系统自动完成评论' },
      { group: 'order', key: 'customer', label: '最后售后时间(天)', type: 'text', def: '15', placeholder: '订单完成后，用户在n天内可以发起售后申请' },
      { group: 'order', key: 'autoagree', label: '卖家自动同意时间(天)', type: 'text', def: '3', placeholder: '买家提交退款后商家处理时间，超出n天后自动同意' },
      { group: 'order', key: 'returntime', label: '买家退货时间(天)', type: 'text', def: '7', placeholder: '退货时间，如果超过则关闭售后' },
      { group: 'order', key: 'receivingtime', label: '卖家收货时间(天)', type: 'text', def: '7', placeholder: '买家退货后，超出指定天数后自动完成售后' },
    ],
  },
  {
    key: 'poster',
    title: '海报配置',
    fields: [
      { group: 'config', key: 'poster_width', label: '生成海报尺寸(rpx)', type: 'text', def: '750', placeholder: '请填写生成海报宽度' },
      { group: 'config', key: 'poster_background', label: '生成海报背景颜色', type: 'color', def: '#ffffff' },
      { group: 'config', key: 'poster_image', label: '默认分享图', type: 'image', def: '', placeholder: '建议尺寸500x650像素，图片大小不超过100Kb' },
      { group: 'h5', key: 'domain', label: '分享链接H5域名', type: 'text', def: '', placeholder: '海报分享链接H5域名' },
      { group: 'config', key: 'poster_qrcode', label: '二维码展示', type: 'radio', def: '0', options: [ { label: '全部', value: '0' }, { label: '微信小程序码', value: '1' }, { label: '普通二维码', value: '2' } ], tip: '仅App、微信小程序、H5客户端生效；小程序尚未正确配置请勿勾选小程序' },
      { group: 'config', key: 'poster_env', label: '要打开的小程序版本', type: 'select', def: 'release', options: [ { label: '正式版', value: 'release' }, { label: '体验版', value: 'trial' }, { label: '开发版', value: 'develop' } ] },
      { group: 'config', key: 'poster_title', label: '分享默认标题', type: 'text', def: '', placeholder: '海报分享标题' },
      { group: 'config', key: 'poster_title_color', label: '标题文字颜色', type: 'color', def: '#333333' },
      { group: 'config', key: 'poster_details', label: '分享默认详情', type: 'text', def: '', placeholder: '海报分享默认详情' },
      { group: 'config', key: 'poster_price_color', label: '价格文字颜色', type: 'color', def: '#ff4632' },
      { group: 'config', key: 'poster_user', label: '默认推荐人', type: 'text', def: '', placeholder: '海报左下角默认推荐人', tip: '如果用户未登录情况下分享出来的均为默认推荐人' },
      { group: 'config', key: 'poster_viewDetails', label: '默认推荐描述', type: 'text', def: '', placeholder: '海报左下角默认推荐描述' },
      { group: 'config', key: 'poster_original_color', label: '默认推荐描述颜色', type: 'color', def: '#999999' },
    ],
  },
  {
    key: 'captcha',
    title: '人机验证',
    fields: [
      { group: 'captcha', key: 'captcha_switch', label: '是否开启人机验证', type: 'switch', def: 'N', tip: '开启务必保障node正常运行，用于客户端关键位置人机识别，避免机器人自动操作' },
      { group: 'captcha', key: 'captchaService', label: '生成验证码图像服务端', type: 'select', def: 'php', options: [ { label: 'PHP服务端生成验证图片', value: 'php' }, { label: 'Node服务端生成验证图片', value: 'node' } ] },
      { group: 'captcha', key: 'nodePath', label: '服务器Node路径', type: 'text', def: '', placeholder: 'NodeJs路径' },
      { group: 'captcha', key: 'canvasSize', label: '验证图像生成大小 (px)', type: 'text', def: '480', placeholder: '480' },
      { group: 'captcha', key: 'seKey', label: '验证密码盐Key', type: 'text', def: '', placeholder: '验证密码盐' },
      { group: 'captcha', key: 'errorAccuracy', label: '拖动角度允许误差阈值 (度)', type: 'text', def: '10', placeholder: '10', tip: '在旋转过程中相差度数则可以通过验证，降低验证难度' },
      { group: 'captcha', key: 'captchaUseMaxNum', label: '效验成功免效验次数', type: 'text', def: '3', placeholder: '3' },
      { group: 'captcha', key: 'randomPoint', label: '验证图像随机干扰点数', type: 'text', def: '200', placeholder: '200' },
      { group: 'captcha', key: 'randomLine', label: '验证图像随机干扰线数', type: 'text', def: '50', placeholder: '50' },
      { group: 'captcha', key: 'randomBlock', label: '验证图像随机干扰矩块数', type: 'text', def: '3', placeholder: '3' },
      { group: 'captcha', key: 'captchaUseMaxTime', label: '人机验证限制完成时间(秒)', type: 'text', def: '3600', placeholder: '3600' },
      { group: 'captcha', key: 'checkTimeOut', label: '验证图像有效期(ms)', type: 'text', def: '600', placeholder: '600', tip: '用户在客户端弹出人机效验界面后可操作时间' },
      { group: 'captcha', key: 'dragInterval', label: '鼠标轨迹间隔时间(ms)', type: 'text', def: '200', placeholder: '200' },
      { group: 'captcha', key: 'dragTimeMin', label: '拖拽至少用时(ms)', type: 'text', def: '500', placeholder: '500' },
      { group: 'captcha', key: 'dragTimeMax', label: '拖拽最多用时(ms)', type: 'text', def: '10000', placeholder: '10000' },
      { group: 'captcha', key: 'oneCapErrNum', label: '每次验证最多失误次数', type: 'text', def: '3', placeholder: '3' },
      { group: 'captcha', key: 'ipDayAll', label: '一天允许生成多少次验证码', type: 'text', def: '300', placeholder: '300' },
      { group: 'captcha', key: 'ipDayError', label: '一天允许验证失败次数', type: 'text', def: '100', placeholder: '100' },
      { group: 'captcha', key: 'ipHourAll', label: '1小时允许生成多少次验证码', type: 'text', def: '100', placeholder: '100' },
      { group: 'captcha', key: 'ipHourError', label: '1小时内允许失败次数', type: 'text', def: '30', placeholder: '30' },
    ],
  },
  {
    key: 'withdraw',
    title: '提现配置',
    fields: [
      { group: 'withdraw', key: 'state', label: '是否开启提现', type: 'switch', def: 'Y' },
      { group: 'withdraw', key: 'minmoney', label: '最低提现金额', type: 'text', def: '0', placeholder: '设置0则不限制提现金额' },
      { group: 'withdraw', key: 'monthlimit', label: '每月可提现次数', type: 'text', def: '0', placeholder: '设置0不限提现次数' },
      { group: 'withdraw', key: 'servicefee', label: '提现手续费(‰)', type: 'text', def: '0', placeholder: '每笔提现扣除手续费千分之几' },
    ],
  },
  {
    key: 'find',
    title: '发现页管理',
    fields: [
      { group: 'config', key: 'comment_switch', label: '发现启用社交评论', type: 'switch', def: 'Y' },
      { group: 'find', key: 'app_switch', label: 'APP功能开关', type: 'checkbox', def: allFindSwitch, options: findSwitchOptions },
      { group: 'find', key: 'mp_switch', label: '小程序功能开关', type: 'checkbox', def: allFindSwitch, options: findSwitchOptions },
      { group: 'find', key: 'h5_switch', label: 'H5功能开关', type: 'checkbox', def: allFindSwitch, options: findSwitchOptions },
      { group: 'find', key: 'wechat_switch', label: '微信内置浏览器', type: 'checkbox', def: allFindSwitch, options: findSwitchOptions },
      { group: 'find', key: 'personalExamine_switch', label: '个人发布需审核', type: 'switch', def: 'Y' },
      { group: 'find', key: 'allExamine_switch', label: '店铺个人发布均审核', type: 'switch', def: 'Y' },
    ],
  },
  {
    key: 'live',
    title: '阿里直播',
    fields: [
      { group: 'live', key: 'appName', label: '直播AppName', type: 'text', def: '', placeholder: '例如：wanlshop' },
      { group: 'live', key: 'sslSwitch', label: '域名是否已配置SSL', type: 'switch', def: 'Y' },
      { group: 'live', key: 'pushDomain', label: '直播推流域名', type: 'text', def: '', placeholder: '例如：rtmp.example.com，不要添加http和/' },
      { group: 'live', key: 'liveDomain', label: '直播播放域名', type: 'text', def: '', placeholder: '例如：live.example.com，不要添加http和/' },
      { group: 'live', key: 'liveCnd', label: '直播录制OSS域名', type: 'text', def: '', placeholder: '例如：play.example.com' },
      { group: 'live', key: 'authSwitch', label: '直播是否鉴权', type: 'select', def: 'N', options: [ { label: '是', value: 'Y' }, { label: '否', value: 'N' } ], tip: '无法直播时请检查IM和尝试关闭鉴权' },
      { group: 'live', key: 'streamDuration', label: '拉流延迟时间(秒)', type: 'text', def: '10', placeholder: '例如：10', tip: '推流成功后，因为m3u8存在延迟，需要设置延迟时间显示直播页面' },
      { group: 'live', key: 'liveKey', label: '播放域名鉴权KEY', type: 'text', def: '', placeholder: '请在阿里云直播后台获取' },
      { group: 'live', key: 'pushKey', label: '推流域名鉴权KEY', type: 'text', def: '', placeholder: '请在阿里云直播后台获取' },
      { group: 'live', key: 'builderTime', label: '鉴权有效分钟', type: 'text', def: '60', placeholder: '推荐60分钟最多360分钟' },
      { group: 'live', key: 'transTemplateSwitch', label: '是否启用转码模板', type: 'select', def: 'N', options: [ { label: '是', value: 'Y' }, { label: '否', value: 'N' } ], tip: '开启转码模板后，则压缩播放节省流量' },
      { group: 'live', key: 'transTemplate', label: '转码模板', type: 'text', def: '', placeholder: '例如：lld，为选择标清播放' },
    ],
  },
  {
    key: 'video',
    title: '阿里点播',
    fields: [
      { group: 'video', key: 'accessKeyId', label: '访问控制RAM AccessKeyId', type: 'text', def: '', placeholder: '需阿里云RAM用户组添加VOD相关权限' },
      { group: 'video', key: 'accessKeySecret', label: '访问控制RAM AccessKeySecret', type: 'text', def: '', placeholder: '需阿里云RAM用户组添加VOD相关权限' },
      { group: 'video', key: 'regionId', label: '阿里云点播地域', type: 'select', def: 'cn-shanghai', options: [ { label: '上海地域', value: 'cn-shanghai' }, { label: '北京地域', value: 'cn-beijing' } ] },
      { group: 'video', key: 'workflowId', label: '媒体处理工作流ID', type: 'text', def: '', placeholder: '阿里点播控制台 / 配置管理 / 媒体处理配置 -> 工作流' },
      { group: 'video', key: 'privateKey', label: '媒体处理回调鉴权秘钥', type: 'text', def: '', placeholder: '阿里点播控制台 / 配置管理 / 媒体处理配置 -> 回调设置' },
    ],
  },
  {
    key: 'kuaidi',
    title: '快递100推送',
    fields: [
      { group: 'kuaidi', key: 'secretKey', label: '快递100 Key', type: 'text', def: '', placeholder: '请填写快递100Key' },
      { group: 'kuaidi', key: 'callbackUrl', label: '回调地址', type: 'text', def: '/api/callback/kuaidi', placeholder: '未二次开发不建议修改默认回调' },
    ],
  },
];

/** 生成默认配置对象（按分组聚合） */
export function defaultClientConfig(): Record<string, Record<string, any>> {
  const result: Record<string, Record<string, any>> = {};
  for (const tab of configTabs) {
    for (const field of tab.fields) {
      if (!result[field.group]) result[field.group] = {};
      if (result[field.group][field.key] === undefined) {
        result[field.group][field.key] = field.def ?? '';
      }
    }
  }
  return result;
}
