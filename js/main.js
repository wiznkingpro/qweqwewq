Vue.component('note-card', {
    props: ['card'],
    template: `
        <div class="['card', cardClass]">
            <h3 
                contenteditable="true" 
                @blur="updateTitle" 
                @keydown.enter.prevent="finishEditing"
            >{{ card.title }}</h3>
            
            <div class="items-count"> 
                <span v-if="!isValidItemCount" class="error-text">
                    от 3-5 пунктов
                </span>
            </div>
            
            <div v-for="(item, index) in card.items" :key="index" class="list-item">
                <input
                type="checkbox"
                v-model="item.checked"
                @change="handleCheck(index)">
                <span :class="{'checked': item.checked}">
                    {{ item.text }}
                </span>
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
    computed: {
        minItems() {
            return 3
        },
        maxItems() {
            return 5
        },
        isValidItemCount() {
            return this.card.items.length >= this.minItems &&
                this.card.items.length <= this.maxItems
        },
        canAddItem() {
            return this.card.items.length < this.maxItems
        },
        canRemoveItem() {
            return this.card.items.length > this.minItems
        },
        totalItems() {
            return this.card.items.length
        },
        completedItems() {
            return this.card.items.filter(item => item.checked).length
        },
        progress() {
            if (this.totalItems === 0) return 0
            return (this.completedItems / this.totalItems) * 100
        },
        cardClass() {
            if (this.card.column === 3 && this.progress === 100) {
                return 'completed'
            }
            if (this.card.column === 1 && this.progress > 50) {
                return 'half-completed'
            }
            return ''
        },
        formattedCompletionDate() {
            if (!this.card.completedAt) return ''
            const date = new Date(this.card.completedAt)
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
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
        },
        handleCheck(index) {
            if (this.card.items[index].checked) {
                this.card.lastCheckedAt = new Date().toISOString()
            }
            this.$emit('item-check', this.card)
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
          @item-check="handleCardProgress"
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
          @item-check="handleCardProgress"
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
          @item-check="handleCardProgress"
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
    mounted() {
        this.loadFromStorage()
    },
    methods: {
        addCard(column) {
            if (column === 1 && this.firstColumnCards.length >= 3) {
                return
            }
            if (column === 2 && this.secondColumnCards.length >= 5) {
                return
            }

            const newCard = {
                id: Date.now(),
                title: 'New note',
                column: column,
                items: [],
                completedAt: null,
                lastCheckedAt: null,
            }
            this.cards.push(newCard)
            this.saveToStorage()
        },
        handleCardProgress(card) {
            const total = card.items.length
            if (total === 0) return

            const completed = card.items.filter(item => item.checked).length
            const progress = (completed / total) * 100

            if (card.column === 1 && progress > 50) {
                if (this.secondColumnCards.length < 5) {
                    card.column = 2
                    this.saveToStorage()
                } else {
                    alert('Вторая колонка заполнена (макс. 5 карточек)')
                }
            }

            if (card.column === 2 && progress === 100) {
                card.column = 3
                card.completedAt = card.lastCheckedAt || new Date().toISOString()
                this.saveToStorage()
            }

            if (card.column === 1 && progress === 100) {
                if (this.secondColumnCards.length < 5) {
                    card.column = 2
                    this.saveToStorage()
                } else {
                    alert('Вторая колонка заполнена (макс. 5 карточек)')
                }
            }
        },
        loadFromStorage() {
            const saved = localStorage.getItem('notesAppData')
            if (saved) {
                try {
                    const data = JSON.parse(saved)
                    this.cards = data.cards || []
                } catch (e) {
                    console.error('Ошибка загрузки данных:', e)
                    this.cards = []
                }
            }
        },
        saveToStorage() {
            const data = {
                cards: this.cards
            }
            localStorage.setItem('notesAppData', JSON.stringify(data))
        }
    },
    watch: {
        cards: {
            handler() {
                this.saveToStorage()
            },
            deep: true
        }
    }
})

let app = new Vue ({
    el: '#app'
})