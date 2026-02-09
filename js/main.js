Vue.component('note-card', {
    props: {
        note: {
            type: Object,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    template: `
        <div class="card" :class="{ 'card-finished': completed }">
            <div class="card-title">{{ note.title }}</div>
            <div class="card-items">
                <div v-for="(item, idx) in note.items" :key="idx" class="check-item">
                    <input 
                        type="checkbox" 
                        v-model="item.checked" 
                        :disabled="disabled || completed"
                        @change="onCheck"
                        :id="uniqueId(idx)"
                    >
                    <label :for="uniqueId(idx)" :class="{ 'strike': completed }">{{ item.text }}</label>
                </div>
            </div>
            <div v-if="completed" class="timestamp">
                END_TIME: {{ note.completedAt }}
            </div>
        </div>
    `,
    methods: {
        onCheck() {
            this.$emit('update-progress');
        },
        uniqueId(idx) {
            return 'chk-' + this.note.id + '-' + idx;
        }
    }
});

Vue.component('note-form', {
    props: {
        isBlocked: { type: Boolean, required: true },
        col1Count: { type: Number, required: true }
    },
    data() {
        return {
            newTitle: '',
            newTodos: [
                { text: '', checked: false },
                { text: '', checked: false },
                { text: '', checked: false }
            ]
        }
    },
    computed: {
        isFormValid() {
            const filledTodos = this.newTodos.filter(t => t.text.trim() !== '');
            return this.newTitle.trim() !== '' && filledTodos.length >= 3 && filledTodos.length <= 5;
        }
    },
    template: `
        <div class="control-panel">
            <div class="panel-header">CREATE_NEW_TASK</div>
            
            <div class="form-body">
                <input type="text" v-model="newTitle" placeholder="> ENTER TITLE..." class="input-title">
                
                <div class="todo-list">
                    <div v-for="(todo, index) in newTodos" :key="index" class="input-row">
                        <span class="prefix">[ ]</span>
                        <input type="text" v-model="todo.text" placeholder="TASK ITEM...">
                        <button @click="removeTodoInput(index)" v-if="newTodos.length > 3" class="btn-del">X</button>
                    </div>
                </div>

                <div class="actions">
                    <button @click="addTodoInput" v-if="newTodos.length < 5" class="btn-secondary">+ ADD ITEM</button>
                    
                    <button 
                        @click="submitNote" 
                        class="btn-primary"
                        :disabled="!isFormValid || col1Count >= 3 || isBlocked"
                    >
                        <span v-if="isBlocked">System Blocked</span>
                        <span v-else-if="col1Count >= 3">Col_1 Full</span>
                        <span v-else>EXECUTE ADD</span>
                    </button>
                </div>
            </div>
        </div>
    `,
    methods: {
        addTodoInput() {
            if (this.newTodos.length < 5) this.newTodos.push({ text: '', checked: false });
        },
        removeTodoInput(index) {
            if (this.newTodos.length > 3) this.newTodos.splice(index, 1);
        },
        submitNote() {
            if (this.isFormValid) {
                const newNote = {
                    id: Date.now(),
                    title: this.newTitle,
                    items: this.newTodos.filter(t => t.text.trim() !== ''),
                    completedAt: null
                };
                
                this.$emit('create-note', newNote);
                
                this.newTitle = '';
                this.newTodos = [
                    { text: '', checked: false },
                    { text: '', checked: false },
                    { text: '', checked: false }
                ];
            }
        }
    }
});

new Vue({
    el: '#app',
    data: {
        col1: [],
        col2: [],
        col3: []
    },
    mounted() {
        if (localStorage.getItem('notes-app')) {
            const savedData = JSON.parse(localStorage.getItem('notes-app'));
            this.col1 = savedData.col1 || [];
            this.col2 = savedData.col2 || [];
            this.col3 = savedData.col3 || [];
        }
    },
    watch: {
        col1: { handler: 'saveData', deep: true },
        col2: { handler: 'saveData', deep: true },
        col3: { handler: 'saveData', deep: true }
    },
    computed: {
        isBlocked() {
            const isCol2Full = this.col2.length >= 5;
            const hasPendingCard = this.col1.some(note => {
                const checkedCount = note.items.filter(i => i.checked).length;
                return (checkedCount / note.items.length) * 100 > 50;
            });
            return isCol2Full && hasPendingCard;
        }
    },
    methods: {
        addNote(newNote) {
            if (this.col1.length < 3 && !this.isBlocked) {
                this.col1.push(newNote);
            }
        },

        handleCardUpdate(note, currentColumn) {
            const total = note.items.length;
            const checked = note.items.filter(i => i.checked).length;
            const percentage = (checked / total) * 100;

            if (percentage === 100) {
                this.moveToCol3(note, currentColumn);
                return;
            }

            if (currentColumn === 1) {
                if (percentage > 50) {
                    if (this.col2.length < 5) {
                        this.moveNote(note, this.col1, this.col2);
                    }
                }
            }
        },

        moveNote(note, fromArr, toArr) {
            const index = fromArr.indexOf(note);
            if (index !== -1) {
                fromArr.splice(index, 1);
                toArr.push(note);
            }
        },

        moveToCol3(note, fromColNum) {
            const now = new Date();
            note.completedAt = now.toLocaleString(); 
            
            if (fromColNum === 1) this.moveNote(note, this.col1, this.col3);
            if (fromColNum === 2) this.moveNote(note, this.col2, this.col3);
        },

        saveData() {
            const data = {
                col1: this.col1,
                col2: this.col2,
                col3: this.col3
            };
            localStorage.setItem('notes-app', JSON.stringify(data));
        }
    }
});