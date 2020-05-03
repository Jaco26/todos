
const MarkdownContent = (function() {

  function renderRecursive(createElement, node) {
    // console.log('renderRecursive > node', JSON.parse(JSON.stringify(node)))
    if (typeof node === 'string') {
      return node
    }
    const tag = node.tag
    const data = Object.assign({}, node.data)
    const children = (node.children || []).map(child => renderRecursive(createElement, child.args || child))
    return createElement(tag, data, children)
  }

  return {
    name: 'MarkdownContent',
    functional: true,
    props: {
      markdown: Array,
    },
    render(h, ctx) {
      return h('div', null, ctx.props.markdown.map(x => renderRecursive(h, x.args)))
    }
  }
  
})()