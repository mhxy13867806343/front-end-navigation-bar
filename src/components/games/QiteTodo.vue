<template>
  <div class="qite-todo-wrapper">
    <div id="qite-todo-root" class="qite-todo-app" data-component="TodoApp" data-field-search_query="" data-field-filter="all">
      <div class="todo-header">
        <h3>📝 Qite.js Todo & 搜索</h3>
        <p class="subtitle">DOM-first and Zero-build concepts in action</p>
      </div>
      
      <div class="todo-form">
        <input type="text" class="todo-input" placeholder="输入新任务并按回车..." data-field-map="new_todo:value" />
        <button class="add-btn" data-role="add-btn">添加任务</button>
      </div>

      <div class="todo-search-bar">
        <input type="text" class="search-input" placeholder="🔍 检索待办事项..." data-field-map="search_query:value" />
      </div>

      <div class="todo-filters">
        <button class="filter-btn active" data-role="filter-btn" data-filter="all">全部</button>
        <button class="filter-btn" data-role="filter-btn" data-filter="active">未完成</button>
        <button class="filter-btn" data-role="filter-btn" data-filter="completed">已完成</button>
      </div>

      <ul class="todo-list" data-role="todo-list">
        <!-- Rendered dynamically by Qite component -->
      </ul>
      
      <div class="todo-footer">
        <span>共 <strong data-field="total_count">0</strong> 项待办</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

interface TodoItem {
  id: number
  text: string
  completed: boolean
}

type FieldValue = string | number | boolean
type FieldMap = Record<string, FieldValue>

type ComponentConstructor = new (el: HTMLElement) => unknown

function getInputValue(el: Element, prop: string): string {
  return String((el as unknown as Record<string, string>)[prop] || '')
}

function setElementValue(el: Element, prop: string, value: FieldValue): void {
  ;(el as unknown as Record<string, FieldValue>)[prop] = value
}

export default {
  name: 'QiteTodo',
  setup() {
    onMounted(() => {
      // 1. Define MiniQite base class
      class BaseComponent {
        el: HTMLElement
        fields: Map<string, FieldValue>
        flags: Map<string, boolean>

        constructor(el: HTMLElement) {
          this.el = el;
          this.fields = new Map();
          this.flags = new Map();
          
          for (const attr of this.el.attributes) {
            if (attr.name.startsWith('data-field-')) {
              const fieldName = attr.name.substring(11);
              this.fields.set(fieldName, attr.value);
            }
          }
          this.bindDOM();
        }
        
        get(name: string): FieldValue | undefined {
          return this.fields.get(name);
        }
        
        set(name: string | FieldMap, value?: FieldValue): void {
          if (typeof name === 'object') {
            for (const [k, v] of Object.entries(name)) {
              this.fields.set(k, v);
              this.updateDOMField(k, v);
            }
          } else {
            this.fields.set(name, value ?? '');
            this.updateDOMField(name, value ?? '');
          }
        }
        
        bindDOM(): void {
          this.el.querySelectorAll<HTMLElement>('[data-field]').forEach((el: HTMLElement): void => {
            const fieldName: string | undefined = el.dataset.field;
            if (fieldName && this.fields.has(fieldName)) {
              el.textContent = String(this.fields.get(fieldName) ?? '');
            }
          });
          
          this.el.querySelectorAll<HTMLElement>('[data-field-map]').forEach((el: HTMLElement): void => {
            const [fieldName, prop]: string[] = (el.dataset.fieldMap || '').split(':');
            if (!fieldName || !prop) return;
            if (this.fields.has(fieldName)) {
              setElementValue(el, prop, this.fields.get(fieldName) ?? '');
            }
            
            el.addEventListener('input', (e: Event): void => {
              const target: EventTarget | null = e.target;
              if (target instanceof Element) this.set(fieldName, getInputValue(target, prop));
            });
          });
        }
        
        updateDOMField(name: string, value: FieldValue): void {
          this.el.querySelectorAll<HTMLElement>(`[data-field="${name}"]`).forEach((el: HTMLElement): void => {
            el.textContent = String(value);
          });
          
          this.el.querySelectorAll<HTMLElement>(`[data-field-map^="${name}:"]`).forEach((el: HTMLElement): void => {
            const [, prop]: string[] = (el.dataset.fieldMap || '').split(':');
            if (prop) setElementValue(el, prop, value);
          });
        }
      }

      // 2. Define Custom TodoAppComponent
      class TodoAppComponent extends BaseComponent {
        todos: TodoItem[]

        constructor(el: HTMLElement) {
          super(el);
          this.todos = JSON.parse(localStorage.getItem('qite-todos') || '[]') as TodoItem[];
          this.set({
            new_todo: '',
            search_query: '',
            filter: 'all',
            total_count: this.todos.length
          });
          
          this.el.querySelector<HTMLElement>('[data-role="add-btn"]')?.addEventListener('click', (): void => this.addTodo());
          
          this.el.querySelector<HTMLElement>('.todo-input')?.addEventListener('keydown', (e: KeyboardEvent): void => {
            if (e.key === 'Enter') this.addTodo();
          });
          
          this.el.querySelectorAll<HTMLElement>('[data-role="filter-btn"]').forEach((btn: HTMLElement): void => {
            btn.addEventListener('click', (e: MouseEvent): void => {
              const target: HTMLElement | null = e.target instanceof HTMLElement ? e.target : null;
              if (!target) return;
              this.set('filter', target.dataset.filter || 'all');
              this.el.querySelectorAll<HTMLElement>('[data-role="filter-btn"]').forEach((b: HTMLElement): void => b.classList.remove('active'));
              target.classList.add('active');
              this.renderTodos();
            });
          });
          
          this.el.querySelector<HTMLElement>('.search-input')?.addEventListener('input', (): void => {
            this.renderTodos();
          });
          
          this.renderTodos();
        }
        
        addTodo(): void {
          const text: string = String(this.get('new_todo') || '').trim();
          if (!text) return;
          
          this.todos.push({
            id: Date.now(),
            text: text,
            completed: false
          });
          
          localStorage.setItem('qite-todos', JSON.stringify(this.todos));
          
          this.set({
            new_todo: '',
            total_count: this.todos.length
          });
          
          this.renderTodos();
        }
        
        toggleTodo(id: number): void {
          const todo: TodoItem | undefined = this.todos.find((t: TodoItem): boolean => t.id === id);
          if (todo) {
            todo.completed = !todo.completed;
            localStorage.setItem('qite-todos', JSON.stringify(this.todos));
            this.renderTodos();
          }
        }
        
        deleteTodo(id: number): void {
          this.todos = this.todos.filter((t: TodoItem): boolean => t.id !== id);
          localStorage.setItem('qite-todos', JSON.stringify(this.todos));
          this.set('total_count', this.todos.length);
          this.renderTodos();
        }
        
        renderTodos(): void {
          const searchQuery: string = String(this.get('search_query') || '').toLowerCase();
          const filter: string = String(this.get('filter') || 'all');
          
          let filtered: TodoItem[] = this.todos;
          if (filter === 'active') {
            filtered = filtered.filter((t: TodoItem): boolean => !t.completed);
          } else if (filter === 'completed') {
            filtered = filtered.filter((t: TodoItem): boolean => t.completed);
          }
          
          if (searchQuery) {
            filtered = filtered.filter((t: TodoItem): boolean => t.text.toLowerCase().includes(searchQuery));
          }
          
          const list: HTMLElement | null = this.el.querySelector<HTMLElement>('[data-role="todo-list"]');
          if (!list) return;
          list.innerHTML = '';
          
          if (filtered.length === 0) {
            list.innerHTML = `<li class="empty-state">没有找到待办事项 🍃</li>`;
            return;
          }
          
          filtered.forEach((todo: TodoItem): void => {
            const li: HTMLLIElement = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
              <div class="todo-item-left">
                <span class="todo-checkbox">${todo.completed ? '✅' : '⬜'}</span>
                <span class="todo-text">${todo.text}</span>
              </div>
              <button class="todo-delete">🗑️</button>
            `;
            
            li.querySelector<HTMLElement>('.todo-checkbox')?.addEventListener('click', (): void => this.toggleTodo(todo.id));
            li.querySelector<HTMLElement>('.todo-text')?.addEventListener('click', (): void => this.toggleTodo(todo.id));
            li.querySelector<HTMLElement>('.todo-delete')?.addEventListener('click', (): void => this.deleteTodo(todo.id));
            
            list.appendChild(li);
          });
        }
      }

      // 3. Register Qite globally or namespace
      const Qite: { components: Record<string, ComponentConstructor>, init: (rootEl: HTMLElement) => void } = {
        components: {
          TodoApp: TodoAppComponent
        },
        init(rootEl: HTMLElement): void {
          const compName: string | null = rootEl.getAttribute('data-component');
          if (compName && Qite.components[compName]) {
            new Qite.components[compName](rootEl);
          }
        }
      }

      // Initialize
      const root = document.getElementById('qite-todo-root');
      if (root) {
        Qite.init(root);
      }
    })
  }
}
</script>

<style scoped lang="scss" src="./css/QiteTodo.scss"></style>
