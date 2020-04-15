const componentFactory = (function() {

  return {
    makeCheckbox: function(text, isChecked) {
      return {
        tag: 'div',
        data: {
          class: 'md-checkbox'
        },
        children: [
          {
            tag: 'input',
            data: {
              attrs: {
                checked: isChecked,
                type: 'checkbox',
              },
            },
          },
          {
            tag: 'span',
            data: {
              class: 'md-checkbox__label'
            },
            children: [text]
          }
        ]
      }
    },

    makeHeading: function(text) {
      return {
        tag: 'h4',
        children: [text.slice(1).trim()]
      }
    },

    makePara: function(text) {
      return {
        tag: 'p',
        children: [text.trim()]
      }
    },

    makeItalics: function(text) {
      return {
        tag: 'em',
        children: [text.replace(/\*/g, '')]
      }
    },

    makeBold: function(text) {
      return {
        tag: 'strong',
        children: [text.replace(/\*{2}/g, '')]
      }
    },



  }

})()




function renderRecursive(createElement, node) {
  if (typeof node === 'string') {
    return node
  }
  const tag = node.tag
  const data = Object.assign({}, node.data)
  const children = (node.children || []).map(child => renderRecursive(createElement, child))
  return createElement(tag, data, children)
}