require('dotenv').config()

const logger = require('morgan')
const express = require('express')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const path = require('path')
const app = express()
const port = 3000

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

const initApi = req => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req: req
  })
}

const handlelinkResolver = doc => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'collections') {
    return '/collections'
  }

  if (doc.type === 'about') {
    return '/about'
  }

  return '/'
}

app.use((req, res, next) => {
  res.locals.Link = handlelinkResolver

  res.locals.Numbers = index => {
    return index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : ''
  }

  res.locals.PrismicDOM = PrismicDOM

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async api => {
  const meta = await api.getSingle('metadate')
  const preloader = await api.getSingle('preloader')
  const navigation = await api.getSingle('navigation')

  return {
    meta,
    navigation,
    preloader
  }
}

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const home = await api.getSingle('home')
  const defaults = await handleRequest(api)

  const { results: collections } = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })

  res.render('pages/home', {
    ...defaults,
    collections,
    home
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const about = await api.getSingle('about')
  const defaults = await handleRequest(api)

  console.log('about', about.data.body[1])

  res.render('pages/about', {
    ...defaults,
    about
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const home = await api.getSingle('home')
  const defaults = await handleRequest(api)
  const { results: collections } = await api.query(Prismic.Predicates.at('document.type', 'collection'), {
    fetchLinks: 'product.image'
  })

  res.render('pages/collections', {
    ...defaults,
    home,
    collections
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })

  res.render('pages/detail', {
    ...defaults,
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
