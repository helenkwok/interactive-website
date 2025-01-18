import {
  IProject,
  ProjectStatus,
  UserRole,
  ProjectDetails,
} from './classes/Project'
import { ProjectManager } from './classes/ProjectManager'
import { Todo, TodoStatus } from './classes/Todos'

// page navigation
const pageNavigate = (pageID: string, display: string) => {
  const page = document.getElementById(pageID)
  if (!page) return
  const pages = document.querySelectorAll('.page')
  pages.forEach((p) => {
    const page = p as HTMLElement
    page.style.display = page.id === pageID ? display : 'none'
  })
}

// Projects button in sidebar
const projectsBtn = document.getElementById('projects-btn') as HTMLElement
projectsBtn.addEventListener('click', () =>
  pageNavigate('projects-page', 'flex')
)

// Users button in sidebar
const usersBtn = document.getElementById('users-btn') as HTMLElement
usersBtn.addEventListener('click', () => pageNavigate('people-page', 'flex'))

const toggleModal = (id: string, setOpen: boolean) => {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    setOpen ? modal.showModal() : modal.close()
  } else {
    console.warn('The provided modal was not found. ID:', id)
  }
}

const projectListUI = document.getElementById('projects-list') as HTMLElement
const projectManager = new ProjectManager(projectListUI)

// New project modal
const newProjectBtn = document.getElementById('new-project-btn')
if (newProjectBtn) {
  newProjectBtn.addEventListener('click', () =>
    toggleModal('new-project-modal', true)
  )
} else {
  console.warn('New project button was not found')
}

// New project form
const projectForm = document.getElementById('new-project-form')
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(projectForm)
    const projectData: IProject = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as ProjectStatus,
      userRole: formData.get('userRole') as UserRole,
      finishDate: new Date(formData.get('finishDate') as string),
    }

    try {
      const project = projectManager.newProject(projectData)
      projectForm.reset()
      toggleModal('new-project-modal', false)
    } catch (err) {
      const dialog = document.createElement('dialog')
      dialog.className = 'error-dialog'
      dialog.innerHTML = `
      <span class="material-symbols-rounded">error</span>
      ${err}`
      document.body.appendChild(dialog)
      dialog.showModal()
      setTimeout(() => dialog.close(), 2000)
    }
  })

  projectForm.addEventListener('reset', () => {
    projectForm.reset()
    toggleModal('new-project-modal', false)
  })
} else {
  console.warn('The project form was not found. Check the ID!')
}

const populateProjectEditForm = (project: ProjectDetails) => {
  const editForm = document.getElementById(
    'edit-project-form'
  ) as HTMLFormElement
  if (!editForm) return

  const fields = editForm.querySelectorAll('[data-project-info]')
  fields.forEach((field) => {
    const key = field.getAttribute('data-project-info') as keyof ProjectDetails
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      if (key === 'finishDate') {
        field.value = project[key].toISOString().split('T')[0]
        return
      }
      field.value = project[key] as string
    }
  })
}

// Edit project modal
const editProjectBtn = document.getElementById('edit-project-btn')
if (editProjectBtn) {
  editProjectBtn.addEventListener('click', () => {
    toggleModal('edit-project-modal', true)
  })
} else {
  console.warn('Edit project button was not found')
}

// Edit project form
const EditProjectForm = document.getElementById('edit-project-form')

if (EditProjectForm && EditProjectForm instanceof HTMLFormElement) {
  const EditProjectId = EditProjectForm.querySelector(
    '[data-project-info="id"]'
  )
  if (EditProjectId) {
    EditProjectForm.addEventListener('submit', (e) => {
      const id = EditProjectId.textContent as string
      e.preventDefault()
      const formData = new FormData(EditProjectForm)

      const projectFormData: ProjectDetails = {
        buildingName: formData.get('buildingName') as string,
        buildingDescription: formData.get('buildingDescription') as string,
        status: formData.get('status') as ProjectStatus,
        userRole: formData.get('userRole') as UserRole,
        finishDate: new Date(formData.get('finishDate') as string),
        cost: Number(formData.get('cost')),
        progress: Number(formData.get('progress')),
        todos: [],
      }

      const projectData = { ...projectFormData, id }

      try {
        const project = projectManager.updateProject(id, projectData)
        if (project) {
          populateProjectEditForm(project)
        }
        toggleModal('edit-project-modal', false)
      } catch (err) {
        const dialog = document.createElement('dialog')
        dialog.className = 'error-dialog'
        dialog.innerHTML = `
      <span class="material-symbols-rounded">error</span>
      ${err}`
        document.body.appendChild(dialog)
        dialog.showModal()
        setTimeout(() => dialog.close(), 2000)
      }
    })

    const cancelBtn = document.getElementById('project-cancel-btn')
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const id = EditProjectId.textContent as string
        const project = projectManager.getProject(id)
        if (project) {
          populateProjectEditForm(project)
        }

        toggleModal('edit-project-modal', false)
      })
    } else {
      console.warn('Cancel button was not found')
    }
  } else {
    console.warn('The project form was not found. Check the ID!')
  }
}

// add todo
const addTodoBtn = document.getElementById('new-todo-btn')
if (addTodoBtn) {
  addTodoBtn.addEventListener('click', () => {
    const TodoForm = document.getElementById('new-todo-form') as HTMLFormElement
    const ProjectId = TodoForm.querySelector(
      '[data-project-info="id"]'
    ) as HTMLInputElement
    toggleModal('new-todo-modal', true)
  })
} else {
  console.warn('Add todo button was not found')
}

// new todo form
const todoForm = document.getElementById('new-todo-form')

if (todoForm && todoForm instanceof HTMLFormElement) {
  const ProjectId = todoForm.querySelector('[data-project-info="id"]')
  if (ProjectId) {
    todoForm.addEventListener('submit', (e) => {
      e.preventDefault()

      const projectId = ProjectId.textContent as string
      const formData = new FormData(todoForm)

      const project = projectManager.getProject(projectId)
      if (!project) {
        console.warn('Project not found')
        return
      }

      const todo = {
        task: formData.get('task') as string,
        dueDate: new Date(formData.get('dueDate') as string),
        status: formData.get('status') as TodoStatus,
      }

      projectManager.newTodo(projectId, todo)

      todoForm.reset()
      toggleModal('new-todo-modal', false)
    })

    todoForm.addEventListener('reset', () => {
      todoForm.reset()
      toggleModal('new-todo-modal', false)
    })
  } else {
    console.warn('The project form was not found. Check the ID!')
  }
}

const populateTodoEditForm = (todo: Todo) => {
  const editForm = document.getElementById('edit-todo-form') as HTMLFormElement
  if (!editForm) return

  const fields = editForm.querySelectorAll('[data-todo-info]')
  fields.forEach((field) => {
    const key = field.getAttribute('data-todo-info') as keyof Todo
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      if (key === 'dueDate') {
        field.value = todo[key].toISOString().split('T')[0]
        return
      }
      field.value = todo[key] as string
    }
  })
}

// edit todo form
const editTodoForm = document.getElementById('edit-todo-form')

if (editTodoForm && editTodoForm instanceof HTMLFormElement) {
  const ProjectId = editTodoForm.querySelector('[data-project-info="id"]')
  const id = editTodoForm.querySelector('[data-todo-info="id"]')
  if (ProjectId && id) {
    editTodoForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const projectId = ProjectId.textContent as string
      const todoId = id.textContent as string

      const formData = new FormData(editTodoForm)

      const project = projectManager.getProject(projectId)
      if (!project) {
        console.warn('Project not found')
        return
      }

      const todo = projectManager.updateTodo(projectId, todoId, {
        task: formData.get('task') as string,
        dueDate: new Date(formData.get('dueDate') as string),
        status: formData.get('status') as TodoStatus,
      })

      toggleModal('edit-todo-modal', false)
    })

    const cancelBtn = document.getElementById('todo-cancel-btn')
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        toggleModal('edit-todo-modal', false)
      })
    } else {
      console.warn('Cancel button was not found')
    }
  } else {
    console.warn('The project form was not found. Check the ID!')
  }
}

// filter todos
const searchBar = document.getElementById('todoSearchBar')
if (searchBar) {
  searchBar.addEventListener('input', (e) => {
    const search = (e.target as HTMLInputElement).value
    const filteredList = projectManager.filterTodos(search)
    const todosListUI = document.getElementById('todos-list') as HTMLElement
    todosListUI.replaceChildren()
    todosListUI.append(...filteredList.map((todo) => todo.ui))
  })
}

// export JSON
const exportProjectsBtn = document.getElementById('export-projects-btn')
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener('click', () =>
    projectManager.exportToJSON()
  )
}

// import JSON
const importProjectsBtn = document.getElementById('import-projects-btn')
if (importProjectsBtn) {
  importProjectsBtn.addEventListener('click', () =>
    projectManager.importFromJSON()
  )
}
