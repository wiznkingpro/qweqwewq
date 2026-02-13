Vue.component('product', {
    template: `
        <div class="product">
            <div class="column column-1">
                <div v-for="card in firstColumnCards" :key="card.id" class="card">
                    {{ card.title }}
                </div>
            </div>
            
            <div class="column column-2">
                <div v-for="card in secondColumnCards" :key="card.id" class="card">
                    {{ card.title }}
                </div>
            </div>
            
            <div class="column column-3">
                <div v-for="card in thirdColumnCards" :key="card.id" class="card">
                    {{ card.title }}
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            column1: [],
            column2: [],
            column3: [],
            cards: [],
        }
    },
    methods: {
        addNote() {
            this.cards.push({
                id: 1,
            })
        },
    },
    computed: {
        firstColumnCards() {
            return this.cards.slice(0, 3)
        },
        secondColumnCards() {
            return this.cards.slice(3, 8)
        },
        thirdColumnCards() {
            return this.cards.slice()
        }
    },
    mounted() {},

})

let app = new Vue ({
    el: '#app',
        data: {

        },
        methods: {}
})