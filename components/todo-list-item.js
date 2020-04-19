const TodoListItem = {
  name: 'TodoListItem',
  components: {
    MarkdownContent,
  },
  props: {
    isFirst: Boolean,
    index: Number,
    date: String,
    id: String,
    text: String,
    markdown: Array,
    complete: Boolean,

    groupDragging: [Boolean, Object],
  },
  data: function() {
    return {
      draggable: false,
    }
  },
  computed: {
    topEligible: function() {
      if (typeof this.groupDragging !== 'boolean') {
        return this.groupDragging.topEligible
      }
      return false
    },
    bottomEligible: function() {
      if (typeof this.groupDragging !== 'boolean') {
        return this.groupDragging.bottomEligible
      }
      return this.groupDragging
    }
  },
  template: `
    <li class="list-item" :class="{ 'list-item--complete' : complete }">
      <div
        v-if="isFirst"
        class="list-item__dropzone"
        :class="{ 'group-active' : topEligible }"
        @dragover="onDropzoneDragover($event, 'above')"
        @dragleave="onDropzoneDragleave"
        @drop="onDropzoneDrop($event, 'above')"
      ></div>
      <div
        class="list-item__content"
        :class="{ 'list-item__content--complete' : complete }"
        :draggable="draggable"
        @dragstart="onContentDragstart"
        @dragend="onContentDragend"
      >
        <div 
          class="content__handle"
          @mouseenter="draggable = true"
          @mouseleave="draggable = false"
        ></div>
        <div class="content__text">
          <MarkdownContent :markdown="markdown" />
        </div>

        <div class="content__controls">
          <div class="complete-checkbox">
            <input
              type="checkbox"
              :checked="complete"
              @input="$emit('updateItemStatus', !complete)"
            />
          </div>
          <div>
            <button class="btn btn-danger btn--small" @click="$emit('deleteItem')">x</button>
          </div>
        </div>

      </div>
      <div
        class="list-item__dropzone"
        :class="{ 'group-active' : bottomEligible }"
        @dragover="onDropzoneDragover($event, 'below')"
        @dragleave="onDropzoneDragleave"
        @drop="onDropzoneDrop($event, 'below')"
      ></div>
    </li>
  `,
  methods: {
    isEligibleForDrop(dragged, position) {
      if (dragged.complete !== this.complete) {
        return false
      }
      const draggedFromAbove = this.index > dragged.index
      if (position === 'above') {
        return !draggedFromAbove && dragged.index - this.index > 0
      } else if (position === 'below') {
        return draggedFromAbove
          ? this.index - dragged.index > 0
          : dragged.index - this.index > 1
      }
    },
    /** 
     * @param {DragEvent} e
     * @param {'above'|'below'} position The position of the dropzone relative to its list-item__content block
     */
    onDropzoneDragover: function(e, position) {
      const dragged = JSON.parse(e.dataTransfer.getData('text'))
      if (this.isEligibleForDrop(dragged, position)) {
        e.preventDefault()
        e.target.classList.add('valid-hovered')
      }
    },
    /** @param {DragEvent} e */
    onDropzoneDragleave: function(e) {
      e.target.classList.remove('valid-hovered')
    },
    /** 
     * @param {DragEvent} e
     * @param {string} position
     */
    onDropzoneDrop: function(e, position) {
      const dragged = JSON.parse(e.dataTransfer.getData('text'))
      if (this.isEligibleForDrop(dragged, position)) {
        e.preventDefault()
        e.target.classList.remove('valid-hovered')
        const draggedFromAbove = this.index > dragged.index
        const toIndex = this.isFirst
          ? position === 'above'
            ? this.index
            : this.index + 1
          : draggedFromAbove
            ? this.index
            : this.index + 1

        this.$emit('updateItemOrder', { dragged, toIndex })
      }
    },
    /** @param {DragEvent} e */
    onContentDragstart: function(e) {
      e.dataTransfer.setData('text', JSON.stringify({
        id: this.id,
        index: this.index,
        complete: this.complete
      }))
      this.$emit('setGroupDragging', this.index)
    },
    onContentDragend() {
      this.$emit('setGroupDragging', null)
    },
  },
}