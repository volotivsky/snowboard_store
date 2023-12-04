import express from 'express'
import mongoose from 'mongoose'
import Schema_post from './schema/post.js'
import Schema_user from './schema/user.js'
import { post_validator } from './validator/post.js'
import { validationResult } from 'express-validator'
import { user_validator } from './validator/user.js'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import checkAuth from './checkAuth.js'
import multer from 'multer'
mongoose.connect('mongodb+srv://reganme0:dfwUOo9d0n0xflw4@vlavol.cptqlrl.mongodb.net/store?retryWrites=true&w=majority')
.then(console.log('DB ok'))
.catch((err)=>console.log('DB err', err))
const app = express()
app.use(express.json())
app.use(cors())
app.use('/uploads',express.static('uploads'))
const storage = multer.diskStorage({
    destination: (_,__,cb)=>{
        cb(null, 'uploads')
    },
    filename: (_, file,cb)=>{
        cb(null, file.originalname)
    },
})
const upload = multer({ storage })
app.post('/upload', upload.single('image'), (req,res)=>{
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})
app.post('/posts', post_validator, async(req,res)=>{
    try{
        const errors = validationResult(req)
        if (errors.errors.length>0) return res.status(400).json({err:'ошибка в создании поста', errors: errors})
        const doc = Schema_post({
    title: req.body.title,
    description: req.body.description,
    img: req.body.img,
    price: req.body.price,
    type: req.body.type,
    size: req.body.size
    })
    const posts = await doc.save()
    res.json(posts)
    }catch(err){
        console.log(err)
    }
})

app.post('/uploads')

app.get('/posts', async(req,res)=>{
    try{
        const posts = await Schema_post.find()
        res.json(posts)
    }catch(err){
        res.json(err)
    }
})

app.post('/register', user_validator, async (req,res)=>{
    const errors = validationResult(req)
    if (errors.errors.length>0)return res.status(400).json(errors.errors)
    const findUser = await Schema_user.findOne({
    email: req.body.email
    })
    if(findUser) return res.status(401).json('пользователь существует')
    
    const doc = Schema_user({
        name: req.body.name, 
        email:req.body.email,
        password: req.body.password
    })
    const user = await doc.save()
    const token = jwt.sign({id: user._id},'secret')
    res.json({
        user: user,
        token:token
    })

})

app.post('/login', async(req,res)=>{
    try{
        const user = await Schema_user.findOne({
            email: req.body.email
        })
        console.log(user)
        if(!user) return res.status(400).json('пользователь не найден')
        if(req.body.password!==user.password) return res.status(400).json('неверный логин или пароль')
        const token = jwt.sign({id:user._id}, 'secret')
        res.json(token)
    }catch(err){
        res.json(err)
    }
})
app.get('/auth', checkAuth, async (req,res)=>{
    try{
        const user = await Schema_user.findById({
            _id:req.userId
        })
        if(!user) return res.json('пользователь не найден')
        res.json(user)   
    }catch(err){
        res.json('пользователь не авторизован')
    }
})
app.patch('/favorite', checkAuth, async (req,res)=>{
    const id = req.userId
    const user = await Schema_user.findById({
        _id: id
    })
    const bolean = user.favorite.includes(req.body.favorite)
    if(!bolean){
        const fav = [...user.favorite, req.body.favorite]
        await Schema_user.findOneAndUpdate({
            _id: id
        },{
            favorite: fav
        })
        res.json('black')
    }else{
        const found = user.favorite.find((el)=>el==req.body.favorite)
        const index = user.favorite.indexOf(found)
        const fav2 = user.favorite
        fav2.splice(index, 1)
        await Schema_user.findByIdAndUpdate({
            _id: id
        },{
            favorite: fav2
        })
        res.json('white')
    }
})
app.get('/favorite', checkAuth,async(req,res)=>{
    try{
        const user = await Schema_user.findById({
            _id: req.userId
        })
        let fav = []
        for(let i=0; i<user.favorite.length; i++){
            const post = await Schema_post.findById({
                _id:user.favorite[i]
            })
            fav.push(post)
        }
        res.json(fav)
    }catch(err){
        res.json('не удалось посмотреть избранное')
    }
})
app.patch('/korzina', checkAuth,async(req,res)=>{
    try{
        const user = await Schema_user.findById({
            _id: req.userId
        })
        
        const post = await Schema_post.findById({
            _id: req.body.korzina
        })
        let kor = [...user.korzina, post]
        const user2 = await Schema_user.findByIdAndUpdate({
            _id: req.userId
        },{
            korzina:kor
        })
        res.json(user2)
    }catch(err){
        res.json('не удалось посмотреть корзину')
    }
})
app.get('/korzina', checkAuth, async(req,res)=>{
    const user = await Schema_user.findById({
        _id:req.userId
    })
    res.json(user.korzina)
})
app.get('/post/:id', async(req,res)=>{
    const post = await Schema_post.findById({
        _id:req.params.id
    })
    res.json(post)
})
app.post('/post/:id', checkAuth, async(req,res)=>{
    const user = await Schema_user.findById({
        _id: req.userId
    })
    const post = await Schema_post.findOne({
        _id:req.params.id
    })
    post.comments.push({user: user.name, comment:req.body.comment, star:req.body.star, date: req.body.date})
    await Schema_post.findOneAndUpdate({
        _id: req.params.id
    },{
        comments:post.comments
    })
    res.json(post)
})
app.listen(1111,()=>{
    console.log('сервер запущен')
})