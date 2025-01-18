import { IProject, Project, ProjectDetails } from './Project'
import { ITodo, Todo } from './Todos'

export class ProjectManager {
  list: Project[] = []
  ui: HTMLElement

  constructor(container: HTMLElement) {
    this.ui = container
    this.newProject({
      name: 'Default Project',
      description: 'This is just a default app project',
      status: 'pending',
      userRole: 'architect',
      finishDate: new Date(),
    })
  }

  updateProject(id: string, data: Partial<ProjectDetails>) {
    const project = this.getProject(id)
    if (!project) return

    for (const key in data) {
      if (key === 'finishDate') {
        if (JSON.stringify(data.finishDate) !== 'null' && data.finishDate) {
          project.finishDate = data.finishDate
        }
        continue
      }
      if (key === 'cost') {
        project.cost = Number(data.cost)
        continue
      }
      if (key === 'progress') {
        project.progress = Number(data.progress)
        continue
      }
      if (!data[key]) continue
      project[key] = data[key as keyof IProject]
    }

    project.setUI()
    const updatedProject = project

    updatedProject.ui.addEventListener('click', () => {
      const projectsPage = document.getElementById('projects-page')
      const detailsPage = document.getElementById('project-details')
      if (!(projectsPage && detailsPage)) return
      projectsPage.style.display = 'none'
      detailsPage.style.display = 'flex'
      this.setDetailsPage(updatedProject)
    })

    this.ui.append(updatedProject.ui)

    this.list = this.list.map((item) =>
      item.id === id ? updatedProject : item
    )
    this.setDetailsPage(updatedProject)

    return updatedProject
  }

  newProject(data: IProject) {
    const projectNames = this.list.map((project) => project.name)
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`)
    }
    const project = new Project(data)
    project.ui.addEventListener('click', () => {
      const projectsPage = document.getElementById('projects-page')
      const detailsPage = document.getElementById('project-details')
      if (!(projectsPage && detailsPage)) return
      projectsPage.style.display = 'none'
      detailsPage.style.display = 'flex'
      this.setDetailsPage(project)
    })
    console.log(project)
    this.ui.append(project.ui)
    this.list.push(project)
    return project
  }

  filterTodos(task: string) {
    const filteredTodos = this.list
      .map((project) => project.todos)
      .flat()
      .filter((todo) => todo.task.includes(task))

    return filteredTodos
  }

  updateTodo(projectId: string, todoId: string, data: Partial<ITodo>) {
    const project = this.getProject(projectId)
    if (!project) return
    const todo = project.todos.find((todo) => todo.id === todoId)
    if (!todo) return

    for (const key in data) {
      if (key === 'dueDate') {
        if (JSON.stringify(data.dueDate) !== 'null' && data.dueDate) {
          todo.dueDate = data.dueDate
        }
        continue
      }

      if (!data[key]) continue
      todo[key] = data[key as keyof ITodo]
    }

    todo.setUI()

    //todo.updateUI()
    project.todos = project.todos.map((item) =>
      item.id === todoId ? todo : item
    )
    return todo
  }

  newTodo(id: string, data: ITodo) {
    const project = this.getProject(id)
    if (!project) return
    const todo = new Todo({
      ...data,
    })
    todo.ui.addEventListener('click', () => {
      const editTodoModal = document.getElementById('edit-todo-modal')
      if (editTodoModal instanceof HTMLDialogElement) {
        todo.setModal(todo)
        editTodoModal.showModal()
      }
    })
    project.todos.push(todo)
    const todosListUI = document.getElementById('todos-list') as HTMLElement
    todosListUI.append(todo.ui)
  }

  private setProjectDetails(
    page: HTMLElement,
    attribute: string,
    value: string
  ) {
    const projectDetails = page.querySelectorAll(
      `[data-project-info="${attribute}"]`
    )
    if (projectDetails) {
      for (const element of projectDetails) {
        switch (attribute) {
          case 'buildingIcon':
            const [initials, background] = value.split('-')
            element.textContent = initials
            // if element is HTMLElement
            if (element instanceof HTMLElement) {
              element.style.backgroundColor = background
            }
            break
          case 'finishDate':
            const date = new Date(value as string)
            element.textContent = date.toDateString()
            if (element instanceof HTMLInputElement) {
              element.value = date.toISOString().split('T')[0]
            }
            break
          case 'cost':
            element.textContent = '$' + value
            if (element instanceof HTMLInputElement) {
              element.value = value
            }
            break
          case 'progress':
            if (element instanceof HTMLElement) {
              element.textContent = value + '%'
              element.style.width = parseInt(value) + '%'
            }
            if (element instanceof HTMLInputElement) {
              element.value = value
              element.style.width = 'auto'
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
  }

  private setDetailsPage(project: Project) {
    const detailsPage = document.getElementById('project-details')
    if (!detailsPage) return

    for (const key in project) {
      const value = project[key as keyof Project] as string
      switch (key) {
        case 'buildingName':
          // first two letters of the project’s name
          const initials = (value as string)
            .split(' ')
            .map((word) => word[0])
            .splice(0, 2)
            .join('')
          this.setProjectDetails(
            detailsPage,
            'buildingIcon',
            `${initials}-${project.iconBackground}`
          )
          this.setProjectDetails(detailsPage, key, value)
          break

        default:
          this.setProjectDetails(detailsPage, key, value)
          break
      }
    }
  }

  getProject(id: string) {
    const project = this.list.find((project) => project.id === id)
    return project
  }

  getProjectByName(name: string) {
    const project = this.list.find((project) => project.name === name)
    return project
  }

  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) return
    project.ui.remove()
    const remaining = this.list.filter((project) => project.id !== id)
    this.list = remaining
  }

  getTotalCost() {
    const totalCost = this.list.reduce((sum, project) => sum + project.cost, 0)
    return totalCost
  }

  exportToJSON(fileName: string = 'projects') {
    const json = JSON.stringify(this.list, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  importFromJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      const json = reader.result
      if (!json) return
      const projects: Project[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          const foundProject = this.getProjectByName(project.name)

          if (foundProject) {
            // the  type of project is Project
            foundProject.name = project.name
            foundProject.description = project.description

            this.updateProject(foundProject.id, {
              buildingName: project.buildingName,
              buildingDescription: project.buildingDescription,
              status: project.status,
              userRole: project.userRole,
              finishDate: project.finishDate,
              cost: project.cost,
              progress: project.progress,
            })

            project.todos.forEach((todo) => {
              const foundTodo = foundProject.todos.find(
                (item) => item.task === todo.task
              )
              if (foundTodo) {
                this.updateTodo(foundProject.id, foundTodo.id, {
                  task: todo.task,
                  dueDate: todo.dueDate,
                  status: todo.status,
                })
              } else {
                this.newTodo(foundProject.id, {
                  task: todo.task,
                  dueDate: todo.dueDate,
                  status: todo.status,
                })
              }
            })

            continue
          }
          const addedProject = this.newProject({
            name: project.name,
            description: project.description,
            status: project.status,
            userRole: project.userRole,
            finishDate: project.finishDate,
          })

          project.todos.forEach((todo) => {
            this.newTodo(addedProject.id, {
              id: todo.id,
              task: todo.task,
              dueDate: todo.dueDate,
              status: todo.status,
            })
          })
        } catch (err) {
          console.error(err)
        }
      }
      console.log(this.list)
    })
    input.addEventListener('change', () => {
      const filesList = input.files
      if (!filesList) return
      reader.readAsText(filesList[0])
    })
    input.click()
  }
}
