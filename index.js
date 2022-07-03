const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()//Peson tarvitsema databasen osoite salasanalla
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(cors())


morgan.token('content', function (req, res) {
    if (req.method === 'POST')
        return JSON.stringify(req.body)
    return ' '
})

let persons = [
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    },
    {
        "name": "mika12",
        "number": "04504888",
        "id": 5
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

//hakee tiedot tietokannasta
app.get('/api/persons', (req, res) => {
    Person.find({}).then(p => {
        res.json(p)
    })
})

app.get('/info', (req, res) => {
    const date = new Date().toString();
    const response = "<div>" +
        `<p>Phonebook has info for ${persons.length} people</p>` +
        `<p>${date}</p>` +
        "</div>"

    res.send(response)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) response.json(person)
    else response.status(404).end()
})

//poisto tietokannasta
app.delete('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    Person.findByIdAndRemove(request.params.id)
        .then(res => {
            response.status(204).end()
        })
        .catch(error => next(error))
    // persons = persons.filter(p => p.id !== id)
    // response.status(204).end()
})

//lisää myös tietokantaan, siistittävää jäljellä
app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    if (persons.find(p => p.name === body.name)) {//TODO update to check database
        return response.status(400).json({
            error: 'name already exists'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    // persons = persons.concat(person) no longer needed
    person.save().then(result => {
        console.log('person saved!')
    })

    response.json(person)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})