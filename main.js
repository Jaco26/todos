
const PERSISTANCE = 'jacob_TODOS'


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

    groupDragging: Boolean,
  },
  data: function() {
    return {
      draggable: false,
    }
  },
  template: `
    <li class="list-item" :class="{ 'list-item--complete' : complete }">
      <div
        v-if="isFirst"
        class="list-item__dropzone"
        :class="{ 'group-active' : groupDragging }"
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
        :class="{ 'group-active' : groupDragging }"
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


const app = new Vue({
  components: {
    TodoListItem,
  },
  data: {
    darkMode: false,
    showHint: false,
    newItem: '',
    items: [],
    draggingIndex: null,
  },
  watch: {
    items: {
      deep: true,
      handler() {
        this.syncPersistance()
      }
    },
    darkMode() {
      this.syncPersistance()
    }
  },
  computed: {
    indexedItemsIds() {
      return this.items.map((x, i) => ({ ...x, index: i }))
    },
    itemIds() {
      return this.items.map(x => x.id)
    },
    pendingItems: function() {
      return this.indexedItemsIds.filter(x => !x.complete)
    },
    completeItems: function() {
      return this.indexedItemsIds.filter(x => x.complete)
    },
    draggedItem() {
      if (this.draggingIndex >= 0) {
        return this.indexedItemsIds[this.draggingIndex]
      }
      return null
    }
  },
  mounted: function() {
    this.loadPersistance()
  },
  methods: {
    loadPersistance: function() {
      const saved = JSON.parse(localStorage.getItem(PERSISTANCE))
      if (saved) {
        this.items = saved.items
        this.darkMode = saved.darkMode
      } else {
        localStorage.setItem(PERSISTANCE, JSON.stringify({
          items: this.items,
          darkMode: this.darkMode
        }))
      }
    },
    syncPersistance: function() {
      const saved = JSON.parse(localStorage.getItem(PERSISTANCE)) || { items: [], darkMode: false }
      saved.items = this.items
      saved.darkMode = this.darkMode
      localStorage.setItem(PERSISTANCE, JSON.stringify(saved))
    },
    toggleItemStatus(id, complete) {
      const index = this.itemIds.indexOf(id)
      this.items[index].complete = complete
    },
    deleteItem(id) {
      const index = this.idItemsIds.indexOf(id)
      this.items.splice(index, 1)
    },
    onSubmit: function(e) {
      e.preventDefault()
      const newItem = this.newItem.trim()
      if (newItem) {
        this.items.push({
          id: uuid(),
          text: newItem,
          markdown: markdown.textToMarkdown(newItem),
          complete: false,
          date: new Date().toUTCString()
        })
      }
      this.newItem = ''
    },
    onUpdateItemOrder({ dragged, toIndex }) {
      const toMove = this.items[dragged.index]
      this.items.splice(dragged.index, 1)
      this.items.splice(toIndex, null, toMove)
    },
    onSetGroupDraggingIndex(index) {
      console.log('index', index)
      this.draggingIndex = index
    },
  },
  template: `
    <div class="app-wrapper" :class="{ 'dark' : darkMode }">
      <div class="app-content">
        <label for="dark-mode-toggle" style="display: inline-block;margin-bottom: 1rem">
          Dark mode
          <input type="checkbox" id="dark-mode-toggle" v-model="darkMode" />
        </label>
        
        <form @submit.prevent="onSubmit">
          <div style="display:flex; flex-direction:column;">
            <div class="new-item__wrapper">
              <textarea
                @focus="showHint = true"
                @blur="showHint = false"
                class="new-item__text"
                placeholder="Type something"
                @keypress.enter.shift="onSubmit"
                v-model="newItem"
              ></textarea>
              <div class="new-item__hint" :class="{ 'active' : showHint }">
                "shift" + "return" to submit
              </div>
            </div>
            <button class="btn btn--small" style="align-self:flex-end" type="submit">Save</button>
          </div>
        </form>

        <section class="section">
          <div v-if="pendingItems.length">
            Pending items
            <ul class="todo-list">
              <TodoListItem
                v-for="(x, i) in pendingItems"
                :key="x.id"
                :isFirst="i === 0"
                v-bind="x"
                @setGroupDragging="onSetGroupDraggingIndex"
                @updateItemStatus="toggleItemStatus(x.id, $event)"
                @updateItemOrder="onUpdateItemOrder"
                @deleteItem="deleteItem(x.id)"
              />
            </ul>
          </div>
          <div v-else>
            No pending items
          </div>
        </section>

        <section class="section">
          <div v-if="completeItems.length">
            Completed items
            <ul class="todo-list">
              <TodoListItem
                v-for="(x, i) in completeItems"
                :key="x.id"
                :isFirst="i === 0"
                v-bind="x"
                @setGroupDragging="onSetGroupDraggingIndex"
                @updateItemStatus="toggleItemStatus(x.id, $event)"
                @updateItemOrder="onUpdateItemOrder"
                @deleteItem="deleteItem(x.id)"
              />
            </ul>
          </div>
          <div v-else>
            No completed items
          </div>
        </section>
        
      </div>
    </div>
  `
})

app.$mount('#app')