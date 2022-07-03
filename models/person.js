//puhelinnumeroiden lisääminen tai hakeminen tietokannasta komentorivillä
//node mongo.js yourpassword Anna 040-1234556 -> lisätään Anna 040-1234556
//node mongo.js yourpassword -> tulostetaan konsoliin kaikki yhteystiedot
const mongoose = require('mongoose')

// eslint-disable-next-line no-undef
const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

// määrittää minkälaisia olioita kannan kokoelmiin tallennetaan
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: function (v) {
                return /^\d{2}-\d{5,}$/.test(v) || /^\d{3}-\d{4,}$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
    }
})
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
module.exports = mongoose.model('Person', personSchema)

// const Person = mongoose.model('Person', personSchema)

// if (process.argv.length === 5) {
//     //vastaava olio tallennetaan kokoelmaan people!
//     const person = new Person({
//         name: process.argv[3],
//         number: process.argv[4]
//     })

//     person.save().then(result => {
//         console.log('person saved!')
//         mongoose.connection.close()
//     })
// }
// else {
//     Person.find({}).then(result => {
//         result.forEach(p => {
//             console.log(p)
//         })
//         mongoose.connection.close()
//     })
// }