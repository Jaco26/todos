
function uuid() {
  const segmentLengths = [8, 4, 4, 4, 12]
  const chars = '0123456789abcdef'
  const segments = []
  for (let segI = 0; segI < segmentLengths.length; segI++) {
    let segment = ''
    for (let i = 0; i < segmentLengths[segI]; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(segment)
  }
  return segments.join('-')
}
