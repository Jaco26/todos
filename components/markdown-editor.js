
const MarkdownEditor = (function() {

  // statics
  const MIN_EDITOR_HEIGHT = 60
  const EDITOR_LINE_HEIGHT = 20
  const EDITOR_MAX_LINES = 8

  // md object types 
  const HEADING = 'HEADING'
  const PARA = 'PARA'
  const CHECKBOX = 'CHECKBOX'

  const BOLD = 'BOLD'
  const ITALICS = 'ITALICS'
  const UNDERLINED = 'UNDERLINED'
 

  // full line extractors
  const getIsHeading = txt => /^\#\s.*/i.test(txt)
  const getIsCheckboxChecked = txt => /^-\s\[x\]\s.*/i.test(txt)
  const getIsCheckboxUnchecked = txt => /^-\s\[\s\]\s.*/i.test(txt)

  // inline extracters
  const matchItalics = txt => txt.match(/_{2}.*?_{2}/gi) || []
  const matchBold = txt => txt.match(/\*{2}.*?\*{2}/gi) || []
  const matchUnderlined = txt => txt.match(/\*_.*?_\*/gi) || []


  // render func args creators
  const makeHeading = rawText => ({
    rawText,
    type: HEADING,
    args: {
      tag: 'h3',
      data: {
        class: 'md--heading',
      },
      children: [rawText.slice(1)],
    },
  })

  const makeCheckbox = (rawText, checked) => ({
    rawText,
    type: CHECKBOX,
    args: {
      tag: 'div',
      children: [
        {
          args: {
            tag: 'input',
            data: {
              attrs: {
                type: 'checkbox',
                checked,
              }
            },
          }
        },
        {
          args: {
            tag: 'span',
            children: [rawText.slice(5)]
          }
        },
      ],
    },
  })

  const makePara = rawText => ({
    rawText,
    type: PARA,
    args: {
      tag: 'p',
      data: {
        class: 'md--para',
      },
      children: [rawText],
    },
  })

  const makeBold = rawText => ({
    rawText,
    type: BOLD,
    args: {
      tag: 'span',
      data: {
        class: 'md--bold'
      },
      children: [rawText.slice(2,-2)]
    }
  })

  const makeItalics = rawText => ({
    rawText,
    type: ITALICS,
    args: {
      tag: 'span',
      data: {
        class: 'md--italics'
      },
      children: [rawText.slice(2,-2)]
    }
  })

  const makeUnderlined = rawText => ({
    rawText,
    type: UNDERLINED,
    args: {
      tag: 'span',
      data: {
        class: 'md--underlined'
      },
      children: [rawText.slice(2,-2)]
    }
  })

 

  /** @param {string} txt */
  function processLineLevelElements(txt) {
    return txt.split('\n').reduce((acc, x) => {
      x = x.trim()
      if (x.length) {
        if (getIsHeading(x)) {
          acc.push(makeHeading(x))
        } else if (getIsCheckboxChecked(x)) {
          acc.push(makeCheckbox(x, true))
        } else if (getIsCheckboxUnchecked(x)) {
          acc.push(makeCheckbox(x, false))
        } else {
          acc.push(makePara(x))
        }
      }
      return acc
    }, [])
  }

  /** @param {string} txt */
  function processInlineElements(txt) {
    const bold = matchBold(txt).map(x => ({ text: x, type: BOLD }))
    const italics = matchItalics(txt).map(x => ({ text: x, type: ITALICS }))
    const underlined = matchUnderlined(txt).map(x => ({ text: x, type: UNDERLINED }))
    const sorted = [...bold, ...italics, ...underlined].sort((a, b) => a.index - b.index)
    const accum = []
    if (sorted.length) {
      sorted.forEach(x => {
        const before = txt.slice(0, txt.indexOf(x.text))
        if (before.length) {
          accum.push(before)
        }
        if (x.type === BOLD) {
          accum.push(makeBold(x.text))
        } else if (x.type === ITALICS) {
          accum.push(makeItalics(x.text))
        } else if (x.type === UNDERLINED) {
          accum.push(makeUnderlined(x.text))
        }
        txt = txt.replace(before + x.text, '')
      })
    } else {
      accum.push(txt)
    }
    return accum
  }
  

  /** @param {string} markdownStr */
  function markdownStringToObject(markdownStr) {
    return processLineLevelElements(markdownStr)
      .map(x => {
        if (x.type === PARA) {
          x.args.children = processInlineElements(x.rawText)
        }
        return x
      })
  }

  return {
    name: 'MarkdownEditor',
    props: {
      markdown: Array,
      maxLines: {
        type: Number,
        default: EDITOR_MAX_LINES
      }
    },
    data: function() {
      return {
        markdownText: '',
        showHint: false,
        editorHeight: MIN_EDITOR_HEIGHT,
      }
    },
    watch: {
      textareaLinesCount: function(nv, ov) {
        if (nv <= this.maxLines) {
          if (nv > 2 && nv > ov && this.editorHeight + EDITOR_LINE_HEIGHT) {
            this.editorHeight += EDITOR_LINE_HEIGHT
          } else if (nv < ov && this.editorHeight - EDITOR_LINE_HEIGHT >= MIN_EDITOR_HEIGHT) {
            this.editorHeight -= EDITOR_LINE_HEIGHT
          }
        }
        if (nv === 1) {
          this.editorHeight = MIN_EDITOR_HEIGHT
        }
      },
    },
    computed: {
      textareaLinesCount: function() {
        return this.markdownText.split('\n').length
      },
      textareaStyle: function() {
        return {
          minHeight: `${this.editorHeight}px`,
          lineHeight: `${EDITOR_LINE_HEIGHT}px`
        }
      }
    },
    methods: {
      onSubmit: function(e) {
        e.preventDefault()
        const mdText = this.markdownText.trim()
        if (mdText) {
          this.$emit('submit', markdownStringToObject(mdText))
          this.markdownText = ''
        }
      },
    },
    template: `
      <div class="md-editor">
        <form @submit.prevent="onSubmit">
          <textarea
            class="md-editor__textarea"
            :style="textareaStyle"
            @focus="showHint = true"
            @blur="showHint = false"
            @keypress.enter.shift="onSubmit"
            v-model="markdownText"
          ></textarea>
          <div class="md-editor__controls">
            <div>
              <div class="controls__hint" :class="{ 'active' : showHint }">
                "shift" + "return" to submit
              </div>
            </div>
            <div class="controls__submit">
              <button class="btn btn--small" style="align-self:flex-end" type="submit">Save</button>
            </div>
          </div>

        </form>
      </div>
    `
  }
  
})()