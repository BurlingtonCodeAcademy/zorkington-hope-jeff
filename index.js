const { hasUncaughtExceptionCaptureCallback } = require('process');
const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}
// ------------------------------------------ player -------------------------------------------------
const player = {
  location: 'hangar',
  status: 'tired',
  inventory: [],                    // do we want to add in stamina? 
}

//-------------------------------------------- descriptions ------------------------------------------
//room descriptions
class Room {
  constructor(name, desc, inv, locked) {
    this.name = name,
      this.desc = desc,
      this.inv = inv,
      this.locked = locked
  }
  moveBetweenRooms(move) {
    moveToNewRoom(move)
  }
}
const hangar = new Room('hangar', 'You are now in the hangar. ', ['inv'], false)         //can we create an inventory that is randomly generated?? Ask Bob
const engineBlock = new Room('Engine Block', 'You are now in the engine block', ['inv'], true)
const hangarControlRoom = new Room('Hangar Control Room', 'you are now in the hangar control room', ['inv'], true)
const officerQuarters = new Room('Officer Quaters', 'you are now in the officer quarters', ['inv'], true)
const messHall = new Room('Mess Hall', 'you are now in the mess hall', ['inv'], false)
const generatorRoom = new Room('Generator Room', 'you are now in the generator room', ['inv'], false)

//item descriptions
class Item {
  constructor(name, desc, takeable) {
    this.name = name,
      this.desc = desc,
      this.takeable = takeable
  }

}
const energyDrink = new Item('Energy Drink', 'this is an energy drink', true)
const ECM = new Item('ECM', 'this is an ECM', true)
const coffeeCup = new Item('Coffee Cup', 'this is a coffee cup', false)
const journal = new Item('Journal', 'this is a journal', false)



// --------------------------------------transitions ------------------------------------

let shipRooms = {
  hangar: { canChangeTo: ['engineBlock', 'hangarControlRoom', 'messHall'] },
  hangarControlRoom: { canChangeTo: ['hangar', 'officerQuarters'] },
  engineBlock: { canChangeTo: ['hangar', 'messHall'] },
  officerQuarters: { canChangeTo: ['hangarControlRoom', 'messHall'] },
  messHall: { canChangeTo: ['generatorRoom', 'officerQuarters', 'engineBlock', 'hangar'] },
  generatorRoom: { canChangeTo: ['messHall'] }
}

//--------------------------------- Lookup Tables --------------------------

//Look up table for movements
let playerMovements = {
  move: ['west', 'east', 'north', 'south'],
  drink: ['take a drink', 'drink'],
  take: ['take'],
  leave: ['leave', 'drop'],
}

//Look up table for rooms
let roomsLookUp = {
  'hangarControlRoom': hangarControlRoom,
  'engineBlock': engineBlock,
  'messHall': messHall,
  'officerQuarters': officerQuarters,
  'hangar': hangar,
  'generatorRoom': generatorRoom,
}

//Look up table for items
let itemLookUp = {
  'energyDrink': energyDrink,
  'ECM': ECM,
  'coffee cup': coffeeCup,
  'journal': journal,                                    // do we add another possible way of finding engineBlock here?

}

//-------------------------------------- movement from rooms -----------------------------------------

async function moveToNewRoom(newRoom) {
  let changeRoom = shipRooms[player.location].canChangeTo;
  if (changeRoom.includes(newRoom)) {
    player.location = newRoom                                            // add in locked doors later
  } else {
    console.log('you cant go that way :/ ')
  }
}



launch();

async function launch() {
  const welcomeMessage = `You don’t know how you survived your last encounter with space pirates\nBut it seems luck was on your side\n...well not entirely\nYou’re ECM (electronic control module) was damaged in your last emergency jump drive.\nWithout the ECM you’re unable to switch fuel types, making another jump out the Virgo system, back to Orin, your home system, impossible.\n\nAre you ready?`;
  let answer = await ask(welcomeMessage);
  if (answer !== 'yes') {
    console.log('Well you die then')
    process.exit()
  } else {
    console.log('Alert: Your hydrogen fuel levels are critical, immediate refueling required!!!!');
  }

  let hydroResponse = await ask('What are you going to do?\nyou can check fuel by pulling lever\nDo you pull lever\nyes or no? ')
  // ------------------remember to san-----------------
  if (hydroResponse !== 'yes') {
    console.log('Well you die then')
    process.exit()
  } else {
    console.log(`\nYou estimate roughly 4 hours of flight time left with your remaining hydrogen fuel.\nyou will need to find a way to fix your ECM to make a Quantum jump \nor...you will be stuck floating in this system forever.\n\nBy stroke of pure luck your radar picks up a larger vessel relatively close by.`)
  }

  let nextStep = await ask('Should you land on the ship?\nyes or no? ')
  if (nextStep !== 'yes') {
    console.log('Well you die then')
    process.exit()
  } else {
    console.log('you land on the ship\'s landing pad')
  }
  console.log('You notice a light flickering and as you look around you notice the ship has lost power\nthe ship is sinking closer to a black hole\nYou need to find this ships ECM to fix your ship before the black hole consumes you and the ship\nyou find a blueprint of the ship\nthe blueprint says the ship\'s spare parts are in the Engine Block')
  console.log((roomsLookUp[player.location].desc))
  while (true) {
    let room = roomsLookUp[player.location];
    let question = await ask('What do you want to do? ')
    if (question === 'move') {
      console.log(shipRooms[player.location].canChangeTo)
      let clarifyingQ = await ask('What room do you want to go to ')
      room.moveBetweenRooms(clarifyingQ)
      room = roomsLookUp[player.location]
      console.log(room.desc)
    }
    else if (question === 'take') {
      let takeQ = await ask('what would you like to take? ')
      if (room.inv.includes(takeQ)) {
        console.log('You have taken this item')
        player.inventory.push(takeQ)
      } else {
        console.log('That item is not in this room ')
      }
    }
  }
}
//We have made it to here and have logic that allows you to move between room and take items, and player status -ish

//let powerOn = false           // we will worry about this later
// hangarFunc()

// async function hangarFunc() {
//   let hangarQ = await ask('You notice a light flickering and as you look around you notice the ship has lost power\n the ship is sinking closer to a black hole\nYou need to find this ships ECM to fix your ship before the black hole consumes you and the ship\nyou find a blueprint of the ship\nthe blueprint says the ship\'s spare parts are in the Engine Block\ndo you take the blueprint with you?\ntake or leave ')
//   if (hangarQ !== 'leave') {
//     console.log('Wow how rude other castaways might need the blueprint aswell')
//     // blueprint has posion so if you hold it for too long you die 
//     console.log('\ndes of how you die')
//     process.exit()
//   } else {
//     //edit this maybe
//     console.log('that was the right choice')
//   }
// }
//   let secHangarQ = await ask('\nyou look around and notice that there are three doors on the hangar\none to the east\none to the west\none to the south\nwhich door do you want to enter')
//   while (secHangarQ === 'east' || secHangarQ === 'west' || secHangarQ === 'south' || secHangarQ === 'north') {
//     if (secHangarQ === 'east') {
//       if (powerOn === true) {
//         console.log('This is the Hangar Control Room')
//         hangarControl()
//         break;
//       } else {
//         console.log('\nYou need to turn the power on to open this door')
//         secHangarQ = await ask('Which door?\none to the east\none to the west\none to the south')
//       }
//     }         // Also need south "else if" also have "else" = death
//     else if (secHangarQ === 'west') {
//       let westCode = await ask('Passcode please ')
//       if (westCode !== '1223') {
//         console.log(('\nIncorrect Passcode'))
//         secHangarQ = await ask('Which door?\none to the east\none to the west\none to the south')
//       } else {
//         console.log('Welcome to the Engine Block')
//         engineBlock()
//         break
//       }
//     }
//     else if (secHangarQ === 'south') {
//       console.log('Welcome to the Mess Hall')
//       messHall()
//       break
//     }
//     else if (secHangarQ === 'north') {
//       console.log('You have picked an invalid direction\nyou have been sucked out into space and died')
//       process.exit()
//     }
//   }
// }

// engineBlock()

// async function engineBlock() {
//   let engineBlockQ = await ask('howdy')
// }

// hangarControl()

// async function hangarControl() {
//   let hangarControlQ = await ask('howdy')
// }
// //---------Dis is the foyer--------------
// messHall()

// async function messHall() {
//   console.log('In the mess hall ')
//   let messHallQ = await ask('howdy')
// }




// function enterState(newState){
//   let validTransitions = houseRooms[currentRoom].canChangeto;