export const QUOTA_OPTIONS = [
  { label: '硬配额', value: 'hard' },
  { label: '软配额', value: 'soft' },
]

export const QUOTA_UNIT = [
  { label: 'GB', value: 'GB' },
  { label: 'TB', value: 'TB' },
  { label: 'PB', value: 'PB' },
]

export const TIME_WIDTH = 160
export const VERSION_WIDTH = 350

export const ROLE_OPTIONS = [
  { label: '系统管理员', value: 'ROLE_ADMIN_SYSTEM' },
  { label: '安全管理员', value: 'ROLE_ADMIN_SECURITY' },
  { label: '监控管理员', value: 'ROLE_ADMIN_MONITOR' },
  { label: '数据管理员', value: 'ROLE_ADMIN_DATA' },
]

export const PERMISSION_OPTIONS = [
  {
    label: '浏览',
    value: 'PERMISSION_BUCKET_BROWSE',
  },
  {
    label: '读',
    value: 'PERMISSION_BUCKET_READ',
  },
  {
    label: '写',
    value: 'PERMISSION_BUCKET_WRITE',
  },
  {
    label: '删除',
    value: 'PERMISSION_BUCKET_DELETE',
  },
  {
    label: '管理',
    value: 'PERMISSION_BUCKET_MANAGEMENT',
  },
]

export const TASK_TYPE_OPTIONS = [
  { label: '标准数据冷冻', value: 'FREEZE' },
  { label: '零拷贝数据冷冻', value: 'ZERO_COPY_FREEZE' },
  { label: '数据解冻', value: 'UNFREEZE' },
  { label: '数据过期', value: 'DELETE' },
]

export const PAGE_SIZE = 30
export const PAGE_NUMBER = 1
