import {ref, toRef, reactive} from 'vue'

const state = reactive({
  name: '张三',
  age: 30
})

// 如果对reactive 解构，则会失去响应式
console.log({...state})

let name = toRef(state, 'name') // 仍旧基于 state这个代理对象操作； 这里对name的操作也回影响 state中的name

let name2 = ref(state.name) // 这是创建了一个新的 代理对象

// 仍旧具备响应式
name.value
