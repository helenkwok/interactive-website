import { v4 as uuidv4 } from 'uuid'
import { Todo } from './Todos'

export type ProjectStatus = 'pending' | 'active' | 'finished'
export type UserRole = 'architect' | 'engineer' | 'developer'

export interface IProject {
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
}

export interface ProjectDetails {
  buildingName: string
  buildingDescription: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
  cost: number
  progress: number
  todos: Todo[]
}

const colours = [
  '#ca8134',
  '#34caca',
  '#3434ca',
  '#ca34ca',
  '#34ca34',
  '#cacaca',
]

export class Project implements IProject {
  //To satisfy IProject
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date

  // Class internals
  ui: HTMLDivElement
  buildingName = 'Hospital Center'
  buildingDescription = 'Community hospital located at downtown'
  cost: number = 0
  progress: number = 0
  id: string
  iconBackground: string = '#ca8134'
  todos: Todo[] = []

  constructor(data: IProject) {
    // Project data definition
    for (const key in data) {
      if (key === 'ui') continue
      if (key === 'finishDate') {
        if (JSON.stringify(data.finishDate) !== 'null') {
          this.finishDate = new Date(data.finishDate)
        } else {
          this.finishDate = new Date()
        }
        continue
      }
      this[key] = data[key]
    }
    this.iconBackground = colours[Math.floor(Math.random() * colours.length)]
    this.id = uuidv4()
    this.setUI()
  }

  // creates the project card UI
  setUI() {
    if (this.ui) {
      this.updateUI()
      return
    }
    // Project card UI
    this.ui = document.createElement('div')
    this.ui.className = 'project-card'
    this.updateUI()
  }

  private updateUI() {
    this.ui.innerHTML = `
    <div class="card-header">
      <p style="background-color: ${
        this.iconBackground
      }; padding: 10px; border-radius: 8px; aspect-ratio: 1; text-transform: uppercase;">${this.name
      .split(' ')
      .map((word) => word[0])
      .splice(0, 2)
      .join('')}</p>
      <div>
        <h5 style="text-transform: capitalize;">${this.name}</h5>
        <p style="text-transform: capitalize;">${this.description}</p>
      </div>
    </div>
    <div class="card-content">
      <div class="card-property">
        <p style="color: #969696;">Status</p>
        <p style="text-transform: capitalize;">${this.status}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Role</p>
        <p style="text-transform: capitalize;">${this.userRole}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Cost</p>
        <p>$${this.cost}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Estimated Progress</p>
        <p>${this.progress}%</p>
      </div>
    </div>`
  }
}
