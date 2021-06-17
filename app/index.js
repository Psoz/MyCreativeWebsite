import About from 'pages/About'
import Collections from 'pages/About'
import Detail from 'pages/About'
import Home from 'pages/About'

class App {
  constructor () {
    console.log('')
  }

  createPages () {
    this.pages = {
      about: new About(),
      collections: new Collections(),
      detail: new Detail(),
      home: new Home()
    }
  }
}

new App()
