
const PERSISTANCE = 'jacob_TODOS'


const Draggable = {
  name: 'Draggable',
  functional: true,
  render(h, ctx) {
    return h('div',
      {
        ...ctx.data,
        attrs: {
          draggable: true,
        }
      },
      ctx.children
    )
  }
}


const TodoListItem = {
  name: 'TodoListItem',
  props: {
    date: String,
    id: String,
    text: String,
    markdown: Array,
    complete: Boolean,
  },
  render(h) {
    const mdContent = this.markdown.map(x => renderRecursive(h, x))

    const masterCheckbox = h('div',
      { class: 'list-item__checkbox' },
      [
        h('input',
          {
            attrs: { type: 'checkbox', checked: this.complete },
            on: {
              input: () => this.$emit('updateItemStatus', !this.complete),
            }
          }
        )
      ]
    )

    const deleteButton = h('div',
      { class: 'list-item__delete-btn' },
      [
        h('button',
          {
            class: 'btn btn-danger btn--small',
            on: { click: () => this.$emit('deleteItem') }
          },
          'x'
        )
      ]
    )
  
    return h('li',
      {
        attrs: {
          draggable: true,
        },
        on: {
          dragstart: e => {
            e.dataTransfer.setData('text', this.id)
            // console.log(e.dataTransfer)
          },
          dragover: e => {
            e.preventDefault()
            // console.log(e)
          },
          drop: e => {
            e.preventDefault()
            // console.log(e.dataTransfer.getData('text'))
          }
        },
        class: {
          'list-item': true,
          'list-item--complete': this.complete
        },
      },
      [
        h('div', { class: 'list-item__text' }, mdContent),
        masterCheckbox,
        deleteButton,
      ]
    )
  }
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
    idItemsIds() {
      return this.items.map(x => x.id)
    },
    pendingItems: function() {
      return this.items.filter(x => !x.complete)
    },
    completeItems: function() {
      return this.items.filter(x => x.complete)
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
      const index = this.idItemsIds.indexOf(id)
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
                v-for="x in pendingItems"
                :key="x.id"
                v-bind="x"
                @updateItemStatus="toggleItemStatus(x.id, $event)"
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
                v-for="x in completeItems"
                :key="x.id"
                v-bind="x"
                @updateItemStatus="toggleItemStatus(x.id, $event)"
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