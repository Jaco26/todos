const MarkdownContent = {
  name: 'MarkdownContent',
  functional: true,
  props: {
    markdown: Array,
  },
  render(h, ctx) {
    return h('div', null, ctx.props.markdown.map(x => renderRecursive(h, x)))
  }
}
