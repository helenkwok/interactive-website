import { v4 as uuidv4 } from 'uuid'

export type TodoStatus = 'pending' | 'active' | 'finished'

export interface ITodo {
  task: string
  dueDate: Date
  status: TodoStatus
  id?: string
}

export interface TodoDetails {
  task: string
  dueDate: Date
  status: TodoStatus
  id: string
}

export class Todo implements ITodo {
  //To satisfy ITodo
  task: string
  dueDate: Date
  status: TodoStatus

  ui: HTMLDivElement
  id: string

  constructor(data: ITodo) {
    for (const key in data) {
      if (key === 'dueDate') {
        if (JSON.stringify(data.dueDate) !== 'null') {
          this.dueDate = new Date(data.dueDate)
        } else {
          this.dueDate = new Date()
        }
        continue
      }
      this[key] = data[key]
    }
    this.id = uuidv4()
    this.setUI()
  }

  setUI() {
    if (this.ui) {
      this.updateUI()
      return
    }
    this.ui = document.createElement('div')
    this.updateUI()
  }

  private updateUI() {
    this.ui.innerHTML = `
    <div class="todo-item ${this.status}">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; column-gap: 15px; align-items: center;">
          <span class="material-symbols-rounded" style="padding: 10px; background-color: #686868; border-radius: 10px;">construction</span>
          <p data-todo-info="task" style="word-wrap: break-word; word-break: break-word;">${
            this.task
          }</p>
        </div>
         <p data-todo-info="dueDate" style="text-wrap: nowrap; margin-left: 10px;">${this.dueDate.toDateString()}</p>
      </div>
    </div>
  `
  }

  private setModalDetails(page: HTMLElement, attribute: string, value: string) {
    const element = page.querySelector(`[data-todo-info="${attribute}"]`)
    if (element) {
      switch (attribute) {
        case 'dueDate':
          const date = new Date(value as string)
          element.textContent = date.toDateString()
          if (element instanceof HTMLInputElement) {
            element.value = date.toISOString().split('T')[0]
          }
          break
        case 'status':
          const options = element.querySelectorAll('option')
          for (const option of options) {
            if (option.value === value) {
              option.selected = true
            }
          }
          break
        default:
          element.textContent = value
          if (element instanceof HTMLInputElement) {
            element.value = value
          }
          break
      }
    }
  }

  setModal(todo: Todo) {
    const modal = document.getElementById('edit-todo-modal')
    if (!modal) return

    for (const key in todo) {
      this.setModalDetails(modal, key, todo[key])
    }
    console.log(modal)
  }
}
