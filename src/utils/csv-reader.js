import fs from 'fs';
import { parse } from 'csv-parse';

const csvPath = new URL('../../read.csv', import.meta.url)

const parser = parse({delimiter: ',', skipEmptyLines: true, fromLine: 2});
const stream = fs.createReadStream(csvPath)

async function createTasks(){
  const parsedLines = stream.pipe(parser)
  for await (const task of parsedLines) {

    const taskToCreate = {
      title: task[0], 
      description: task[1]
    }

    await fetch('http://localhost:3333/tasks', {
      method: 'POST', 
      body: JSON.stringify(taskToCreate),
      duplex: 'half'
    })
  }
}

createTasks()