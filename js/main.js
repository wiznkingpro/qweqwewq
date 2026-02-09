

new Vue({
    el: '#app',
    data: {
        newTitle: '',
        newTodos: [
            { text: '', checked: false },
            { text: '', checked: false },
            { text: '', checked: false }
        ],
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
        isFormValid() {
            const filledTodos = this.newTodos.filter(t => t.text.trim() !== '');
            return this.newTitle.trim() !== '' && filledTodos.length >= 3 && filledTodos.length <= 5;
        },
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
        addTodoInput() {
            if (this.newTodos.length < 5) this.newTodos.push({ text: '', checked: false });
        },
        removeTodoInput(index) {
            if (this.newTodos.length > 3) this.newTodos.splice(index, 1);
        },
        addNote() {
            if (this.isFormValid && this.col1.length < 3 && !this.isBlocked) {
                const newNote = {
                    id: Date.now(),
                    title: this.newTitle,
                    items: this.newTodos.filter(t => t.text.trim() !== ''),
                    completedAt: null
                };
                
                this.col1.push(newNote);
                
                this.newTitle = '';
                this.newTodos = [
                    { text: '', checked: false },
                    { text: '', checked: false },
                    { text: '', checked: false }
                ];
            }
        },
        checkStatus(note, currentColumn) {
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
