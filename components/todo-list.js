const PERSISTANCE = 'jacob_TODOS'

const TodoList = new Vue({
  name: 'TodoList',
  components: {
    TodoListItem,
  },
  data: function() {
    return {
      darkMode: false,
      showHint: false,
      newItem: '',
      items: [],
      draggingIndex: null,
    }
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
      const index = this.itemIds.indexOf(id)
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
    onSetGroupDraggingIndex: function(index) {
      this.draggingIndex = index
    },
    isEligibleForDrop: function(listIndex, status) {
      if (!this.draggedItem || this.draggedItem.complete !== status) {
        return false
      }
      const draggedItemListIndex = status
        ? this.completeItems.map((x, i) => ({ masterIndex: x.index, listIndex: i }))
          .find(x => x.masterIndex === this.draggedItem.index).listIndex
        : this.pendingItems.map((x, i) => ({ masterIndex: x.index, listIndex: i }))
          .find(x => x.masterIndex === this.draggedItem.index).listIndex

      if (listIndex === 0) {
        return {
          topEligible: draggedItemListIndex !== listIndex,
          bottomEligible: draggedItemListIndex > 1
        } 
      }
      return draggedItemListIndex !== listIndex && draggedItemListIndex !== listIndex + 1
    }
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
                :groupDragging="isEligibleForDrop(i, false)"
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
                :groupDragging="isEligibleForDrop(i, true)"
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

TodoList.$mount('#app')