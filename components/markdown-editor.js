
const MarkdownEditor = (function() {

  // statics
  const MIN_EDITOR_HEIGHT = 60
  const EDITOR_LINE_HEIGHT = 20

  // md object types 
  const HEADING = 'HEADING'
  const PARA = 'PARA'
  const CHECKBOX_CHECKED = 'CHECKBOX_CHECKED'
  const CHECKBOX_UNCHECKED = 'CHECKBOX_UNCHECKED'
  const BOLD = 'BOLD'
  const ITALICS = 'ITALICS'
  const UNDERLINED = 'UNDERLINED'
 
  const FULL_LINE_TYPES = [HEADING, PARA, CHECKBOX_CHECKED, CHECKBOX_UNCHECKED]
  const INLINE_TYPES = [BOLD, ITALICS, UNDERLINED]

  function markdownObjectToString(markdownObj) {
    
  }

  function markdownStringToObject(markdownStr) {
    
  }

  return {
    name: 'MarkdownEditor',
    props: {
      initialMarkdown: Array,
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
        if (nv > 2 && nv > ov) {
          this.editorHeight += EDITOR_LINE_HEIGHT
        } else if (nv > 1 && nv < ov) {
          this.editorHeight -= EDITOR_LINE_HEIGHT
        }
      },
    },
    computed: {
      textareaLinesCount: function() {
        return this.markdownText.split('\n').length
      },
      textareaStyle: function() {
        return {
          height: `${this.editorHeight}px`,
          lineHeight: `${EDITOR_LINE_HEIGHT}px`
        }
      }
    },
    methods: {
      onSubmit: function(e) {
        e.preventDefault()
        const d = ''
      },
    },
    template: `
      <div class="md-editor">
        {{textareaStyle}}
        <textarea
          class="md-editor__textarea"
          :style="textareaStyle"
          @focus="showHint = true"
          @blur="showHint = false"
          @keypress.enter.shift="onSubmit"
          v-model="markdownText"
        ></textarea>
        <div class="md-editor__hint" :class="{ 'active' : showHint }">
          "shift" + "return" to submit
        </div>
      </div>
    `
  }
  
})()