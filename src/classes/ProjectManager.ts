import { IProject, Project } from './Project';

export class ProjectManager {
  list: Project[] = []
  ui: HTMLElement

  constructor(container: HTMLElement) {
    this.ui = container
    this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      userRole: "architect",
      finishDate: new Date()
    })
  }

  newProject(data: IProject) {
    const projectNames = this.list.map((project) => project.name)
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error (`A project with the name "${data.name}" already exists`)
    }
    const project = new Project(data)
    project.ui.addEventListener('click', () => {
      const projectsPage = document.getElementById('projects-page')
      const detailsPage = document.getElementById('project-details')
      if (!(projectsPage && detailsPage)) return
      projectsPage.style.display = 'none'
      detailsPage.style.display = 'block'
    })
    this.ui.append(project.ui)
    this.list.push(project)
    return project
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
      const projects: IProject[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          this.newProject(project)
        } catch (err) {
          console.error(err)
        }
      }
    })
    input.addEventListener('change', () => {
      const filesList = input.files
      if (!filesList) return
      reader.readAsText(filesList[0])
    })
    input.click()
  }
}
