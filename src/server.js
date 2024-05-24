const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const shortid = require('shortid')
const fs = require('fs/promises')
const path = require('path')


// Globally path define
const dbLocation = path.resolve('src', 'data.json')

const app = express();

// Middleware
app.use(cors())
app.use(morgan())
app.use(express.json())


// DELETE 
app.delete('/:id', async(req, res)=>{
    const id = req.params.id

    // read from file system
    const data =await fs.readFile(dbLocation)
    const players = JSON.parse(data)
    let player = players.find((item) => item.id === id)
    if(!player){
        return res.status(404).json({message: 'player not found'})
    }
    
    const newPlayers = players.filter(item => item.id != id)
    await fs.writeFile(dbLocation, JSON.stringify(newPlayers))
    res.status(203).send()
    

})

// PUT, lat time we put an error on patch method, but now if we can't find existing id then we'll assign new data

app.put('/:id', async (req, res) =>{
    const id = req.params.id

    // read from file system
    const data =await fs.readFile(dbLocation)
    const players = JSON.parse(data)
    let player = players.find(item => item.id === id)
    if(!player){
        player = {
            ... req.body,
            id: shortid.generate()
        };
        players.push(player)
    }else{
        player.name = req.body.name
        player.country = req.body.country
        player.rank = req.body.rank
    }

    await fs.writeFile(dbLocation, JSON.stringify(players))
    res.status(200).json(player)
})



// PATCH route to update specific portion
app.patch('/:id', async (req, res) => {
    const id = req.params.id

        // read from file system
        const data =await fs.readFile(dbLocation)
        const players = JSON.parse(data)
        const player = players.find(item => item.id === id)
        if(!player){
        return res.status(404).json({message: 'player not found'})
    }

    player.name = req.body.name || player.name
    player.country = req.body.country || player.country
    player.rank = req.body.rank || player.rank
    // won't let update user id


    await fs.writeFile(dbLocation, JSON.stringify(players))
    res.status(200).json(player)


})


// GET by id route
app.get('/:id', async(req, res) =>{
    const id = req.params.id


    // read from file system
    const data =await fs.readFile(dbLocation)
    const players = JSON.parse(data)

    const player = players.find(item => item.id === id)
    if(!player){
        return res.status(404).json({message: 'player not found'})
    }
    

    res.status(200).json(player)

})


// route for post
app.post('/', async(req, res)=>{
    const player = {
        ... req.body,
        id: shortid.generate()
    }

    const data =await fs.readFile(dbLocation)
    const players = JSON.parse(data)
    players.push(player)

    await fs.writeFile(dbLocation, JSON.stringify(players))
    res.status(201).json(player)


})

// route for GET (here we don't need body, GET req e no body)
// POST and PUT and PATCH req need body, but GET and DELETE req don't need body TODO:
app.get('/', async(req, res) => {
    const data = await fs.readFile(dbLocation)
    const players = JSON.parse(data)
    res.status(201).json({players})
})



// Health route
app.get('/health', (_req, res) => {
    res.status(200).json({status: 'OK'})
})

// server listen
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`server is listening on PORT ${port}`);
    console.log(`localhost:${port}`);
})