
const PERSISTANCE = 'jacob_TODOS'


const TodoListItem = {
  name: 'TodoListItem',
  props: {
    text: String,
    complete: Boolean,
  },
  template: `
    <li class="list-item" :class="{ 'list-item--complete' : complete }">
      <div>
        <pre class="list-item__text">{{text}}</pre>
      </div>
      <div class="list-item__actions">
        <input type="checkbox" :checked="complete" @input="$emit('updateItemStatus', !complete)"></input>
        <button class="btn btn-danger btn--small" @click="$emit('deleteItem')">x</button>
      </div>
    </li>
  `
}


const app = new Vue({
  components: {
    TodoListItem,
  },
  data: {
    showHint: false,
    newItem: '',
    items: [],
  },
  watch: {
    items: {
      deep: true,
      handler(val) {
        this.syncPersistance()
      }
    }
  },
  computed: {
    idItems() {
      return this.items.map((x, i) => ({ ...x, id: x.text.slice(0, 5) + '_' + i }))
    },
    idItemsIds() {
      return this.idItems.map(x => x.id)
    },
    sortedPending: function() {
      return this.idItems
        .filter(x => !x.complete)
        .sort((a, b) => b.date - a.date)
    },
    sortedComplete: function() {
      return this.idItems
        .filter(x => x.complete)
        .sort((a, b) => b.date - a.date)
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
      } else {
        localStorage.setItem(PERSISTANCE, JSON.stringify({
          items: [],
        }))
      }
    },
    syncPersistance: function() {
      const saved = JSON.parse(localStorage.getItem(PERSISTANCE)) || { items: [] }
      saved.items = this.items
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
          text: newItem,
          complete: false,
          date: new Date().toUTCString()
        })
      }
      this.newItem = ''
    }
  },
  template: `
    <div class="app-wrapper">
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
              "shift" + "enter" to submit
            </div>
          </div>
          <button class="btn btn--small" style="align-self:flex-end" type="submit">Submit</button>
        </div>

      </form>

      <section class="section">
        <div v-if="sortedPending.length">
          Pending items
          <ul class="todo-list">
            <TodoListItem
              v-for="(x, i) in sortedPending"
              :key="i + x.text"
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
        <div v-if="sortedComplete.length">
          Completed items
          <ul class="todo-list">
            <TodoListItem
              v-for="(x, i) in sortedComplete"
              :key="i + x.text"
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
  `
})

app.$mount('#app')