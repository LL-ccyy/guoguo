/**
 * 输入Unix时间戳，返回指定时间格式
 */
function calcTimeHeader(time) {
  // 格式化传入时间
  let date = new Date(parseInt(time)),
    year = date.getUTCFullYear(),
    month = date.getUTCMonth(),
    day = date.getDate(),
    hour = date.getHours(),
    minute = date.getUTCMinutes()
  // 获取当前时间
  let currentDate = new Date(),
    currentYear = date.getUTCFullYear(),
    currentMonth = date.getUTCMonth(),
    currentDay = currentDate.getDate()
  // 计算是否是同一天
  if (currentYear == year && currentMonth == month && currentDay == day) {//同一天直接返回
    if (hour > 12) {
      return `下午 ${hour}:${minute < 10 ? '0' + minute : minute}`
    } else {
      return `上午 ${hour}:${minute < 10 ? '0' + minute : minute}`
    }
  }
  // 计算是否是昨天
  let yesterday = new Date(currentDate - 24 * 3600 * 1000)
  if (year == yesterday.getUTCFullYear() && month == yesterday.getUTCMonth && day == yesterday.getDate()) {//昨天
    return `昨天 ${hour}:${minute < 10 ? '0' + minute : minute}`
  } else {
    return `${year}-${month + 1}-${day} ${hour}:${minute < 10 ? '0' + minute : minute}`
  }
}
/**
 * 处理图片富文本节点
 */
function generateImageNode(file) {
  // console.log(file)
  let width = 0, height = 0
  if (file.w > 250) {
    width = 200
    height = file.h / (file.w / 200)
  } else {
    width = file.w
    height = file.h
  }
  let richTextNode = []
  richTextNode.push({
    name: 'img',
    attrs: {
      width: `${width}rpx`,
      height: `${height}rpx`,
      src: file.url
    }
  })
  return richTextNode
}

module.exports={
  calcTimeHeader,
  generateImageNode
}