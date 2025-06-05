const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const dialogueBox = document.getElementById('dialogue')
const textBoxContainer = document.getElementById('textbox')

canvas.width = 832
canvas.height = 768


// Collisions map creation
const collisionsMap = []
for(let i = 0; i < collisions.length; i+=13) {
  collisionsMap.push(collisions.slice(i, i + 13))
}

const specialCollisionsMap = []
for(let i = 0; i < specialCollisions.length; i+=13) {
  specialCollisionsMap.push(specialCollisions.slice(i, i + 13))
}

// Create boundaries out of collision points positions
const boundaries = []

collisionsMap.forEach((row, y) => {
  row.forEach((symbol, x) => {
    switch(symbol){
      case 105:
        boundaries.push(new Boundary({
        position: {
          x: x * Boundary.width,
          y: y * Boundary.height 
        }
        }))
        break
      case 1:
        boundaries.push(new Boundary({
        position: {
          x: x * Boundary.width,
          y: y * Boundary.height 
        },
        name: 'shelf'
        }))
        break
      case 3:
        boundaries.push(new Boundary({
        position: {
          x: x * Boundary.width,
          y: y * Boundary.height 
        },
        name: 'pc'
        }))
        break
      case 4:
        boundaries.push(new Boundary({
        position: {
          x: x * Boundary.width,
          y: y * Boundary.height 
        },
        name: 'documents'
        }))
        break
    }
  })  
})

specialCollisionsMap.forEach((row, y) => {
  row.forEach((symbol, x) => {
    switch(symbol){
      case 105:
        boundaries.push(new Boundary({
        position: {
          x: x * Boundary.width,
          y: y * Boundary.height - Boundary.height/2
        }
        }))
        break
      case 2:
        boundaries.push(new Boundary({
        position: {
          x: x * Boundary.width,
          y: y * Boundary.height - Boundary.height/2
        },
        name: 'degree'
        }))
        break
    }
  })  
})

// Interactive objects dialogues
const interactiveObjects = {
  pc: `This is my PC, and it's showing my <a href="https://joseangelgil.github.io/portfolio" target="_blank" rel="noopener noreferrer">portfolio</a> on the screen.`,
  documents: 'There are two documents here: my <a href="https://www.linkedin.com/in/joseangelgilgil" target="_blank" rel="noopener noreferrer">CV</a> and some <a href="https://github.com/joseangelgil/2d-portfolio" target="_blank" rel="noopener noreferrer">info</a> about this portfolio.',
  shelf: 'There are a lot of books here.',
  degree: 'This is my Engineering degree.'
}


// Map and foreground images creation
const map = new Image()
map.src = './assets/map.png'

const foreground = new Image()
foreground.src = './assets/foreground.png'


// Player creation. 
// Load all the images first and reference them in sprites instead of directly on sprites to avoid initial flickering when changing direction the first time.
const playerUp = new Image()
playerUp.src = './assets/playerUp.png'

const playerDown = new Image()
playerDown.src = './assets/playerDown.png'

const playerLeft = new Image()
playerLeft.src = './assets/playerLeft.png'

const playerRight = new Image()
playerRight.src = './assets/playerRight.png'

const player = new Player({
  position: {
    x: canvas.width/2,
    y: 600
  },
  image: playerDown,  //Pass image preloaded instead of imageSrc
  sprites: {
    up: playerUp,
    down: playerDown,
    right: playerRight,
    left: playerLeft
  },
  frames: {
    max: 4,
    hold: 12
  }
})

const keys = {
  arrowUp: {
    pressed: false
  },
  arrowDown: {
    pressed: false
  },
  arrowRight: {
    pressed: false
  },
  arrowLeft: {
    pressed: false
  }
}

let lastKeyPressed;
let showGreeting = true;

function playerCollisions(object1, object2) {
  return (
    object1.position.y <= object2.position.y + object2.height &&
    object1.position.y + object1.height >= object2.position.y &&
    object1.position.x + object1.width >= object2.position.x &&
    object1.position.x <= object2.position.x + object2.width
  )
}

// Simulated positions to anticipate collision
const collisionsDirections = {
  up: { x: 0, y: -3 },
  down: { x: 0, y: 3 },
  right: { x: 3, y: 0 },
  left: { x: -3, y: 0 }
}


function simulateCollision(direction, action) {
  const offset = collisionsDirections[direction]
  for (const boundary of boundaries) {
    const simulatedPlayer = {
      ...player,
      position: {
        x: player.position.x + offset.x,
        y: player.position.y + offset.y
      }
    }
    if(playerCollisions(simulatedPlayer, boundary)) {
      action(boundary)
    }
  }
}

let lastDialogue = '';

function animate(){
  requestAnimationFrame(animate)
  c.drawImage(map, 0, 0)    
  boundaries.forEach(boundary => boundary.draw())  
  player.update()  
  c.drawImage(foreground, 0, 0)

  player.animate = false
  let moving = true

  if(!showGreeting) textBoxContainer.style.opacity = 0

  Object.keys(collisionsDirections).forEach(direction => {
    simulateCollision(direction, boundary => {
      if(boundary.name) {          
        const newDialogue = interactiveObjects[boundary.name];
        
        //Only update the <p> element if the dialogue change.
        if (newDialogue !== lastDialogue) {
          dialogueBox.innerHTML = newDialogue;
          lastDialogue = newDialogue;
        }

        textBoxContainer.style.opacity = 1;                      
      }
    })
  })

  if(keys.arrowUp.pressed && lastKeyPressed === 'Up') {
    player.changeSprite('up')
    player.lastDirection = 'up'
    player.animate = true   
    simulateCollision('up', () => moving = false)
    if(moving) player.position.y -= 3
  } else if(keys.arrowDown.pressed && lastKeyPressed === 'Down') {
    player.changeSprite('down')
    player.lastDirection = 'down'
    player.animate = true    
    simulateCollision('down', () => moving = false)  
    if(moving) player.position.y += 3  
  } else if(keys.arrowRight.pressed && lastKeyPressed === 'Right') {
    player.changeSprite('right')
    player.lastDirection = 'right'
    player.animate = true    
    simulateCollision('right', () => moving = false)   
    if(moving) player.position.x += 3
  } else if(keys.arrowLeft.pressed && lastKeyPressed === 'Left') {
    player.changeSprite('left')
    player.lastDirection = 'left'
    player.animate = true    
    simulateCollision('left', () => moving = false)   
    if(moving) player.position.x -= 3
  }

}
animate()

window.addEventListener('keydown', ({ key }) => {
  switch(key) {
    case 'ArrowUp':
      keys.arrowUp.pressed = true
      lastKeyPressed = 'Up'
      break
    case 'ArrowDown':
      keys.arrowDown.pressed = true
      lastKeyPressed = 'Down'
      break
    case 'ArrowRight':
      keys.arrowRight.pressed = true
      lastKeyPressed = 'Right'
      break
    case 'ArrowLeft':
      keys.arrowLeft.pressed = true
      lastKeyPressed = 'Left'   
      break    
  }
  showGreeting = false
})

window.addEventListener('keyup', ({ key }) => {
  switch(key) {
    case 'ArrowUp':
      keys.arrowUp.pressed = false
      break
    case 'ArrowDown':
      keys.arrowDown.pressed = false
      break
    case 'ArrowRight':
      keys.arrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.arrowLeft.pressed = false
      break    
  }
})

// Touch devices controls
const buttons = {
  up: document.getElementById('btn-up'),
  down: document.getElementById('btn-down'),
  left: document.getElementById('btn-left'),
  right: document.getElementById('btn-right'),
}

function pressKey(direction) {
  switch(direction) {
    case 'up':
      keys.arrowUp.pressed = true;
      lastKeyPressed = 'Up';
      break;
    case 'down':
      keys.arrowDown.pressed = true;
      lastKeyPressed = 'Down';
      break;
    case 'left':
      keys.arrowLeft.pressed = true;
      lastKeyPressed = 'Left';
      break;
    case 'right':
      keys.arrowRight.pressed = true;
      lastKeyPressed = 'Right';
      break;
  }
  showGreeting = false;
}

function releaseKey(direction) {
  switch(direction) {
    case 'up':
      keys.arrowUp.pressed = false;
      break;
    case 'down':
      keys.arrowDown.pressed = false;
      break;
    case 'left':
      keys.arrowLeft.pressed = false;
      break;
    case 'right':
      keys.arrowRight.pressed = false;
      break;
  }
}

for (const [direction, button] of Object.entries(buttons)) { 
  
  // Start movement
  button.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    pressKey(direction);
  });
  button.addEventListener('mousedown', () => pressKey(direction));

  // End movement
  button.addEventListener('touchend', () => releaseKey(direction));
  button.addEventListener('mouseup', () => releaseKey(direction));
  button.addEventListener('mouseleave', () => releaseKey(direction)); 
}

