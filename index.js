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


morgan.token('content', function (req) {
    if (req.method === 'POST')
        return JSON.stringify(req.body)
    return ' '
})

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
    const date = new Date().toString()
    const response = '<div>' +
        '<p>Phonebook has info for [TODO check database] people</p>' +
        `<p>${date}</p>` +
        '</div>'

    res.send(response)
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (!person) res.status(404).end()
            else { res.json(person) }
        })
        .catch(error => next(error))
})

//poisto tietokannasta
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

//lisää tietokantaan
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    // if (!body.name || !body.number) {
    //     return response.status(400).json({
    //         error: 'content missing'
    //     })
    // }
    Person.find({ name: body.name }).then(result => {
        if (result.length > 0) next(new Error('Person was already found in database'))
        else {
            const person = new Person({
                name: body.name,
                number: body.number
            })
            person.save().then(() => {
                console.log('person saved!')
                response.json(person)
            })
                .catch(error => next(error))
        }
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const person = {
        name: req.body.name,
        number: req.body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            if (!updatedPerson) next(new Error('Person was already removed from database'))
            else { res.json(updatedPerson) }
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error('CAUGHT ERROR: ', error.message, error.name)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})