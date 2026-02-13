Vue.component('note-card', {
    props: ['card'],
    template: `
        <div class="card">
            <h3 
                contenteditable="true" 
                @blur="updateTitle" 
                @keydown.enter.prevent="finishEditing"
            >{{ card.title }}</h3>
            <div v-for="(item, index) in card.items" :key="index" class="list-item">
                <input type="checkbox" v-model="item.checked" > {{ item.text }}
            </div>
            <div style="margin-top: 8px;">
                <input 
                type="text" 
                v-model="newItemText" 
                @keyup.enter="addItem" 
                placeholder="Add list item..." 
                />
                <button @click="addItem" style="margin-top: 4px;">+</button>
            </div>
        </div> 
    `,
    data() {
        return {
            newItemText: ''
        }
    },

    methods: {
        addItem() {
            if (this.newItemText.trim()) {
                this.card.items.push({
                    text: this.newItemText.trim(),
                    checked: false,
                })
                this.newItemText = ''
            }
        },
        updateTitle(e) {
            this.card.title = e.target.textContent.trim() || 'New note'
        },
        finishEditing(e) {
            e.target.blur()
        }
    },
})

Vue.component('notes-board', {
    template: `
    <div class="columns">
      <div class="column">
        <h3>Column 1</h3>
        <note-card 
          v-for="card in firstColumnCards" 
          :key="card.id" 
          :card="card"
        ></note-card>
        <button @click="addCard(1)" :disabled="firstColumnCards.length >= 3">+ Add Note</button>
        <div class="limits">({{ firstColumnCards.length }}/3)</div>
      </div>

      <div class="column">
        <h3>Column 2</h3>
        <note-card 
          v-for="card in secondColumnCards" 
          :key="card.id" 
          :card="card"
        ></note-card>
        <button @click="addCard(2)" :disabled="secondColumnCards.length >= 5">+ Add Note</button>
        <div class="limits">({{ secondColumnCards.length }}/5)</div>
      </div>

      <div class="column">
        <h3>Column 3</h3>
        <note-card 
          v-for="card in thirdColumnCards" 
          :key="card.id" 
          :card="card"
        ></note-card>
        <button @click="addCard(3)">+ Add Note</button>
      </div>
    </div>
  `,
    data() {
        return {
            cards: []
        }
    },
    computed: {
        firstColumnCards() {
            return this.cards.filter(c => c.column === 1)
        },
        secondColumnCards() {
            return this.cards.filter(c => c.column === 2)
        },
        thirdColumnCards() {
            return this.cards.filter(c => c.column === 3)
        }
    },
    methods: {
        addCard(column) {
            const newCard = {
                id: Date.now(),
                title: 'New note',
                column: column,
                items: []
            }
            this.cards.push(newCard)
        },
    }
})

let app = new Vue ({
    el: '#app'
})