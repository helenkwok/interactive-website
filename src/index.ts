import { Project, IProject, ProjectStatus, UserRole } from './classes/Project'
import { ProjectManager } from './classes/ProjectManager'

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
projectsBtn.addEventListener('click', () => pageNavigate('projects-page', 'flex'))

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
  newProjectBtn.addEventListener('click', () => toggleModal('new-project-modal', true))
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
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
    }

    try {
      const project = projectManager.newProject(projectData)
      projectForm.reset()
      toggleModal('new-project-modal', false)
    } catch (err) {
      const dialog = document.createElement('dialog')
      dialog.className= 'error-dialog'
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

// export JSON
const exportProjectsBtn = document.getElementById('export-projects-btn')
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener('click', () => projectManager.exportToJSON())
}

// import JSON
const importProjectsBtn = document.getElementById('import-projects-btn')
if (importProjectsBtn) {
  importProjectsBtn.addEventListener('click', () => projectManager.importFromJSON())
}
