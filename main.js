
const PERSISTANCE = 'jacob_TODOS'


const app = new Vue({
  data: {
    newItem: '',
    pending: [],
    complete: [],
  },
  computed: {
    idTodoItems: function() {
      return this.todoItems.map((x, i) => ({ ...x, id: i }))
    },
    sortedPending: function() {
      return this.pending.sort((a, b) => b.date - a.date)
    },
    sortedComplete: function() {
      return this.complete.sort((a, b) => b.date - a.date)
    }
  },
  mounted: function() {
    this.loadPersistance()
  },
  methods: {
    loadPersistance: function() {
      const saved = JSON.parse(localStorage.getItem(PERSISTANCE))
      if (saved) {
        this.pending = saved.pending
        this.complete = saved.complete
      } else {
        localStorage.setItem(PERSISTANCE, JSON.stringify({
          pending: [],
          complete: []
        }))
      }
    },
    syncPersistance: function() {
      const saved = JSON.parse(localStorage.getItem(PERSISTANCE)) || { complete: [], pending: [] }
      saved.pending = this.pending
      saved.complete = this.complete
      localStorage.setItem(PERSISTANCE, JSON.stringify(saved))
    },
    setComplete: function(index) {
      const spliced = this.pending.splice(index, 1)
      this.complete.push(spliced[0])
      this.syncPersistance()
    },
    setPending: function(index) {
      const spliced = this.complete.splice(index, 1)
      this.pending.push(spliced[0])
      this.syncPersistance()
    },
    deleteCompleted: function(index) {
      this.complete.splice(index, 1)
      this.syncPersistance()
    },
    deletePending: function(index) {
      this.pending.splice(index, 1)
      this.syncPersistance()
    },
    onSubmit: function() {
      const newItem = this.newItem.trim()
      if (newItem) {
        this.pending.push({ title: newItem, date: new Date().toUTCString() })
        this.syncPersistance()
      }
      this.newItem = ''
    }
  },
  template: `
    <div class="app-wrapper">
      <form @submit.prevent="onSubmit">
        <div style="display:flex; flex-direction:column;">
          <textarea class="new-item__title" placeholder="Type something" v-model="newItem"></textarea>
          <button class="btn btn--small" style="align-self:end" type="submit">Submit</button>
        </div>

      </form>

      <section class="sect-pending">
        <div v-if="sortedPending.length">
          Pending items
          <ul class="todo-list__pending">
            <li v-for="(x, i) in sortedPending" :key="i + x.title" class="todo-list__item">
              <div style="flex: 1;">
                {{x.title}}
              </div>
              <div style="margin: 0 1rem;"> 
                <input type="checkbox" @input="setComplete(i)" />
              </div>
              <div>
                <button class="btn btn-danger btn--small" @click="deletePending(i)">x</button>
              </div>
            </li>
          </ul>
        </div>
        <div v-else>
          No pending items
        </div>
      </section>

      <section class="sect-complete">
        <div v-if="sortedComplete.length">
          Completed items
          <ul class="todo-list__complete">
            <li v-for="(x, i) in sortedComplete" :key="i + x.title" class="todo-list__item">
              <div style="flex: 1">
                {{x.title}}
              </div>
              <div style="margin: 0 1rem; flex: 0"> 
                <input type="checkbox" checked @input="setPending(i)" />
              </div>
              <div>
                <button class="btn btn-danger btn--small" style="" @click="deleteCompleted(i)">x</button>
              </div>
            </li>
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