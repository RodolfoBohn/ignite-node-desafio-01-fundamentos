import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database{
  #database = {}

  constructor() {
      fs.readFile(databasePath)
      .then((data) => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  insert(table, data) {
    if(Array.isArray(this.#database[table])){
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()
  }

  update(table, id, data ) {
    const rowIndex = this.#database[table].findIndex(row => row.id ===id)

    if(rowIndex > -1) {
      const initialData = this.#database[table][rowIndex]
      this.#database[table][rowIndex] = {...initialData, ...data}
      this.#persist()
    }
  }

  delete(table, id ) {
    const rowIndex = this.#database[table].findIndex(row => row.id ===id)

    if(rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }

  select(table, search) {
    let data =  this.#database[table] ?? []

    if(search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase() === value.toLowerCase()
        })
      })
    }

    return data
  }

  verifyExistsId(table, id) {
    return this.#database[table].some(item => item.id === id)
  }

  verifyExistsKey(table, id, key) {
    return !!this.#database[table].find(item => item.id === id)[key]

  }
}