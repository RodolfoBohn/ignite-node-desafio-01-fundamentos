import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET', 
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const tasks = database.select('tasks')

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST', 
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const newTask = {
        id: randomUUID(),
        title: req.body.title,
        description: req.body.description,
        created_at: new Date(),
        updated_at: null,
        completed_at: null,

      }
  
      database.insert('tasks', newTask)
      return res.writeHead(201).end()
    }
  },
  {
    method: 'PATCH', 
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const {id} = req.params
      const validId = database.verifyExistsId('tasks', id)

      if(!validId) {
        return res.writeHead(400).end(JSON.stringify({"message": "Invalid ID"}))
      }

      if(database.verifyExistsKey('tasks', id, 'completed_at')) {
        database.update('tasks', id, {
          completed_at: null,
          updated_at: new Date()
        })
      } else {
        database.update('tasks', id, {
          completed_at: new Date(),
          updated_at: new Date()
        })
      }
      
      return res.writeHead(204).end()
    }
  },
  {
    method: 'PUT', 
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const {id} = req.params

      const validId = database.verifyExistsId('tasks', id)

      if(!validId) {
        return res.writeHead(400).end(JSON.stringify({"message": "Invalid ID"}))
      }

      const {title, description} = req.body

      const updatedInfoTasks = removeEmptyKeys({title, description})
      if(isEmptyObject(updatedInfoTasks)) {
        return res.writeHead(400).end(JSON.stringify({"message": "Invalid body"}))
      }

      database.update('tasks', id, {
        ...updatedInfoTasks,
        updated_at: new Date()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE', 
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const {id} = req.params

      const validId = database.verifyExistsId('tasks', id)

      if(!validId) {
        return res.writeHead(400).end(JSON.stringify({"message": "Invalid ID"}))
      }

      database.delete('tasks', id)
      return res.writeHead(204).end()
    }
  },
]

function removeEmptyKeys(object) {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (!value) {
      return acc
    }
    return {
      ...acc, 
      [key]: value
    }
  },{})
}

function isEmptyObject(object) {
  return Object.entries(object).length === 0
}
