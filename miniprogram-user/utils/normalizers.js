function isEmptyValue(value) {
  if (value === undefined || value === null) {
    return true
  }

  const text = String(value).trim()
  if (!text) {
    return true
  }

  const lowerText = text.toLowerCase()
  return lowerText === 'null' || lowerText === 'undefined'
}

function safeText(value, fallback = '') {
  return isEmptyValue(value) ? fallback : String(value).trim()
}

function firstValid() {
  for (let i = 0; i < arguments.length; i += 1) {
    if (!isEmptyValue(arguments[i])) {
      return arguments[i]
    }
  }
  return undefined
}

function parseMaybeJson(value) {
  if (typeof value !== 'string') {
    return value
  }

  const text = value.trim()
  if (!text) {
    return value
  }

  if (!text.startsWith('{') && !text.startsWith('[')) {
    return value
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    return value
  }
}

const LOCAL_IMAGE_ASSETS = new Set([
  '/images/avatar.png',
  '/images/company-default.png',
  '/images/default-logo.png'
])

function normalizeImageUrl(value, baseUrl, fallback) {
  let result = parseMaybeJson(value)

  if (Array.isArray(result)) {
    result = result[0]
  } else if (result && typeof result === 'object') {
    result = firstValid(result.url, result.path, result.src, result.fileUrl)
  }

  result = safeText(result, '')
  if (!result) {
    return fallback
  }

  if (result.startsWith('http://') || result.startsWith('https://')) {
    return result
  }

  if (result.startsWith('//')) {
    return `https:${result}`
  }

  if (result.startsWith('/images/')) {
    if (LOCAL_IMAGE_ASSETS.has(result)) {
      return result
    }

    const normalizedBaseUrl = safeText(baseUrl, '').replace(/\/+$/, '')
    if (!normalizedBaseUrl) {
      return result
    }

    return `${normalizedBaseUrl}${result}`
  }

  const normalizedBaseUrl = safeText(baseUrl, '').replace(/\/+$/, '')
  if (!normalizedBaseUrl) {
    return result
  }

  return `${normalizedBaseUrl}/${result.replace(/^\/+/, '')}`
}

function extractList(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  if (payload.data && Array.isArray(payload.data.records)) {
    return payload.data.records
  }

  if (Array.isArray(payload.records)) {
    return payload.records
  }

  if (Array.isArray(payload.list)) {
    return payload.list
  }

  if (Array.isArray(payload.rows)) {
    return payload.rows
  }

  if (Array.isArray(payload.result)) {
    return payload.result
  }

  if (Array.isArray(payload.banners)) {
    return payload.banners
  }

  if (Array.isArray(payload.carousels)) {
    return payload.carousels
  }

  return []
}

function formatDate(value) {
  if (isEmptyValue(value)) {
    return ''
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const text = String(value).trim()
  if (!text) {
    return ''
  }

  if (text.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10)
  }

  return text
}

function toTimestamp(value) {
  if (isEmptyValue(value)) {
    return 0
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getTime()
  }

  const numericValue = Number(value)
  if (Number.isFinite(numericValue) && numericValue > 0) {
    return numericValue > 100000000000 ? numericValue : numericValue * 1000
  }

  const date = new Date(String(value).replace(/-/g, '/'))
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function splitTags(value) {
  if (Array.isArray(value)) {
    return value.filter(item => !isEmptyValue(item)).map(item => String(item).trim())
  }

  const parsed = parseMaybeJson(value)
  if (Array.isArray(parsed)) {
    return parsed.filter(item => !isEmptyValue(item)).map(item => String(item).trim())
  }

  const text = safeText(value, '')
  if (!text) {
    return []
  }

  return text
    .split(/[,\uff0c\u3001|]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function formatSalary(job) {
  const directSalary = safeText(firstValid(job.salary, job.salaryRange), '')
  if (directSalary) {
    return directSalary
  }

  const minValue = Number(firstValid(job.salaryMin, job.salary_min, job.minSalary, job.min_salary))
  const maxValue = Number(firstValid(job.salaryMax, job.salary_max, job.maxSalary, job.max_salary))

  const hasMin = Number.isFinite(minValue) && minValue > 0
  const hasMax = Number.isFinite(maxValue) && maxValue > 0

  if (hasMin && hasMax) {
    return `${minValue}-${maxValue}元/时`
  }

  if (hasMin) {
    return `${minValue}元/时起`
  }

  if (hasMax) {
    return `${maxValue}元/时以内`
  }

  return '薪资面议'
}

function normalizeJob(job, baseUrl) {
  const welfare = splitTags(firstValid(job.welfare, job.tags))
  const location = safeText(firstValid(job.location, job.companyLocation, job.address, job.city), '地点待更新')
  const publishSource = firstValid(job.createTime, job.updateTime, job.publishTime, job.postTime)
  const startSource = job.startTime
  const endSource = job.endTime
  const startTimestamp = toTimestamp(startSource)
  const endTimestamp = toTimestamp(endSource)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const defaultExpired = endTimestamp ? endTimestamp < today.getTime() : false

  return {
    ...job,
    id: firstValid(job.id, job.jobId, job.positionId, `job-${Date.now()}`),
    enterpriseId: firstValid(job.enterpriseId, job.companyId),
    title: safeText(firstValid(job.title, job.jobName, job.positionName, job.name), '职位名称待完善'),
    jobName: safeText(firstValid(job.title, job.jobName, job.positionName, job.name), '职位名称待完善'),
    companyName: safeText(firstValid(job.companyName, job.company, job.enterpriseName), '企业名称待完善'),
    companyLogo: normalizeImageUrl(firstValid(job.companyLogo, job.logo), baseUrl, '/images/company-default.png'),
    companyScale: safeText(job.companyScale, '规模待更新'),
    companyIndustry: safeText(firstValid(job.companyIndustry, job.industry), '行业待更新'),
    salary: formatSalary(job),
    companyLocation: location,
    location,
    jobType: safeText(firstValid(job.jobType, job.type, job.workType), '不限'),
    recruitNumber: firstValid(job.nums, job.recruitNumber, job.recruitCount, job.number, ''),
    nums: firstValid(job.nums, job.recruitNumber, job.recruitCount, job.number, ''),
    description: safeText(job.description, '暂无岗位描述'),
    welfare,
    tags: welfare,
    publishTime: formatDate(publishSource),
    publishTimestamp: toTimestamp(publishSource),
    startTime: formatDate(startSource),
    endTime: formatDate(endSource),
    startTimestamp,
    endTimestamp,
    isExpired: typeof job.expired === 'boolean' ? job.expired : defaultExpired,
    recruitStatusText: safeText(job.recruitStatusText, defaultExpired ? '已结束' : '招聘中'),
    isCollected: Boolean(job.isCollected)
  }
}

function normalizeResume(resume, baseUrl) {
  return {
    ...resume,
    id: firstValid(resume.id, resume.resumeId),
    title: safeText(resume.title, '未命名简历'),
    name: safeText(resume.name, '未填写'),
    gender: Number(firstValid(resume.gender, 0)),
    phone: safeText(resume.phone, '未填写'),
    email: safeText(resume.email, '未填写'),
    location: safeText(resume.location, '未填写'),
    education: safeText(resume.education, '未填写'),
    experience: safeText(resume.experience, '未填写'),
    expectedPosition: safeText(resume.expectedPosition, ''),
    expectedPositionName: safeText(firstValid(resume.expectedPositionName, resume.expectedPosition), '未填写'),
    selfIntroduction: safeText(resume.selfIntroduction, '暂无自我介绍'),
    avatar: normalizeImageUrl(firstValid(resume.avatar, resume.userPicture, resume.picture), baseUrl, '/images/avatar.png')
  }
}

function normalizeEnterprise(enterprise, baseUrl) {
  return {
    ...enterprise,
    id: firstValid(enterprise.id, enterprise.companyId),
    name: safeText(enterprise.name, '企业名称待完善'),
    logo: normalizeImageUrl(firstValid(enterprise.logo, enterprise.companyLogo), baseUrl, '/images/default-logo.png'),
    scale: safeText(enterprise.scale, '规模待更新'),
    industry: safeText(enterprise.industry, '行业待更新'),
    address: safeText(firstValid(enterprise.address, enterprise.location), '地址待更新'),
    description: safeText(enterprise.description, '暂无企业介绍'),
    employeeCount: firstValid(enterprise.employeeCount, '')
  }
}

function normalizeComment(comment, baseUrl) {
  return {
    ...comment,
    id: firstValid(comment.id, `comment-${Date.now()}`),
    userName: safeText(firstValid(comment.userName, comment.nickname), '用户'),
    content: safeText(comment.content, ''),
    times: formatDate(firstValid(comment.times, comment.createTime)),
    userPicture: normalizeImageUrl(firstValid(comment.userPicture, comment.avatar), baseUrl, '/images/avatar.png')
  }
}

module.exports = {
  extractList,
  firstValid,
  formatDate,
  normalizeComment,
  normalizeEnterprise,
  normalizeImageUrl,
  normalizeJob,
  normalizeResume,
  safeText,
  splitTags
}
