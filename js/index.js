const contentArray = []
let activeEdit

fetch('https://660f8593356b87a55c518bc3.mockapi.io/ProjetoUPX', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then((response) => {
    response.json().then(json => {
      json.map((data)=> {
        if(data.deleted !== 'false') {
          addSchedule(data.id, data.name, data.start, data.stop, data.description, data.deleted ?? false)
          contentArray.push({
            id: data.id, 
            name: data.name,
            start: data.start,
            stop: data.stop, 
            description: data.description,
            deleted: data.deleted ?? false
          })
        }
      })
    })
  })


const makeTemplate = (id, name, start, stop, description) => `
    <div class="info" id="${id}">
      <div class="name">${name}</div>
      <div class="time">
        <div class="start">
          <span>Start:&nbsp</span>
          <span>${new Date(start).toLocaleString()}</span>
        </div>
        <div class="stop">
          <span>Stop:&nbsp</span>
          <span>${new Date(stop).toLocaleString()}</span>
        </div>
      </div>
    </div>
    <div class="icons">
      <div id="edit-button-${id}">
        <i data-feather="edit"></i>
      </div>
      <div class="pretty p-switch p-fill">
        <input type="checkbox" />
        <div class="state p-success">
          <label></label>
        </div>
      </div>
    </div>
`

const modalInput = document.querySelectorAll('aside section form input')
const modalDescription = document.querySelector('aside section form textarea')
const [ nameInput, startInput, stopInput ] = modalInput
let editId = undefined

function addSchedule(id, name, start, stop, description) { 
  const div = document.createElement('div')
  div.classList.add('schedule')
  div.innerHTML = makeTemplate(id, name, start, stop, description)
  const scheduleInput = document.getElementById('schedule-input')
  scheduleInput.appendChild(div)

  const editButton = document.getElementById(`edit-button-${id}`)

  editButton.addEventListener('click', () => {
    const foundElement = contentArray.find(element => element.id == id)
    const { name, start, stop, description } = foundElement

    nameInput.value = name
    startInput.value = start
    stopInput.value = stop
    modalDescription.value = description
    editId = id
    
    modal.classList.remove('disabled')
  })

  feather.replace({
    width: '2.2rem',
    height: '2.2rem'
  });
}

const modal = document.getElementById('modal')
modal.addEventListener('click', () => {
  modal.classList.add('disabled')
})

const addButton = document.getElementById('add-schedule')
addButton.addEventListener('click', () => {
  nameInput.value = ''
  startInput.value = ''
  stopInput.value = ''
  modalDescription.value = ''

  editId = undefined

  modal.classList.remove('disabled')
})

const modalContent = document.querySelector('#modal section')

modalContent.addEventListener('click', (event) => {
  event.stopPropagation()
})

const form = document.getElementById('add-schedule-form')
form.addEventListener('submit', (event) => {
  event.preventDefault()
  const [name, start, stop, description] = event.target
  handleSubmit(editId ?? String(contentArray.length + 1), name, start, stop, description)
})


function handleSubmit(id, name, start, stop, description, deleted = false) {
  const foundElement = contentArray.find((content) => content.id === String(id))
  if(foundElement) {
    console.log(id, name, start, stop, description)
    fetch(`https://660f8593356b87a55c518bc3.mockapi.io/ProjetoUPX/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        name: name.value,
        start: start.value,
        stop: stop.value,
        description: description.value,
        deleted,
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }).then((response) => {
      response.json().then(json => {
        modal.classList.add('disabled')
      })
    })

    foundElement.name = name.value
    foundElement.start = start.value
    foundElement.stop = stop.value
    foundElement.description = description.value
    
    window.location.reload()
    alert('Editado com sucesso')

    return
  }
  
  contentArray.push({
    id,
    name: name.value,
    start: start.value,
    stop: stop.value,
    description: description.value,
    deleted
  })
  addSchedule(id, name.value, start.value, stop.value, description.value)

  fetch('https://660f8593356b87a55c518bc3.mockapi.io/ProjetoUPX', {
    method: 'POST',
    body: JSON.stringify({
      id,
      name: name.value,
      start: start.value,
      stop: stop.value,
      description: description.value,
      deleted
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then((response) => {
    response.json().then(json => {
      modal.classList.add('disabled')
    })
    alert('Salvo com sucesso')
  })
}

const closeButton = document.querySelector('#modal section #close-button')
closeButton.addEventListener('click', () => {
  modal.classList.add('disabled')
})

const deleteButton = document.getElementById('delete-button')
deleteButton.addEventListener('click', () => {
  fetch(`https://660f8593356b87a55c518bc3.mockapi.io/ProjetoUPX/${editId}` , {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then((response) => {
    response.json().then(json => {
      modal.classList.add('disabled')
    })

    window.location.reload()
    alert('Deletado com sucesso')
  })
})