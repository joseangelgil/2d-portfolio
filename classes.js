class Boundary {
  static width = 64
  static height = 64
  constructor({position, name = ''}) {
    this.position = position
    this.width = 64 // 16*16px with a zoom of 400%
    this.height = 64
    this.name = name
  }

  draw() {
    c.fillStyle = 'rgba(255,0,0,0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class Player {
  constructor({
    position,
    sprites,
    image,  //Get the image preloaded instead of imageSrc
    frames,
    animate = false
  }) {
    this.position = position
    this.image = new Image()
    this.image.src = image.src
    this.sprites = sprites
    this.frames = {...frames, val: 0, elapsed: 0}
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max
      this.height = this.image.height
    }
    this.animate = animate
  }

  draw(){
      c.drawImage(
      this.image, 
      this.width * this.frames.val, 
      0, 
      this.image.width / this.frames.max, 
      this.image.height, 
      this.position.x, 
      this.position.y, 
      this.image.width / this.frames.max, 
      this.image.height
    )
  }

  update(){
    this.draw()

    if(!this.animate) return

    if(this.frames.max > 1) this.frames.elapsed++

    if(this.frames.elapsed % this.frames.hold === 0) {
      if(this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }

  changeSprite(direction) {
    // this.image.src = this.sprites[direction]

    // Change this.image preload instead of this.image.src to avoid flickering due to delay on loading.
    this.image = this.sprites[direction]
  }
}